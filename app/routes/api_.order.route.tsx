import { json, type ActionFunction } from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";

import { CartItem } from "~/types/cartItem";
import {
  commitSession,
  getSession,
  getCartFromSession,
  getTableIdFromSession,
} from "~/utils/business/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  let cart: CartItem[] = [];
  let session;
  const formData = await request.formData();
  const cartData = formData.get("cart");
  const tableId = formData.get("tableId");
  if (cartData !== null && typeof cartData === "string") {
    try {
      cart = JSON.parse(cartData) as CartItem[];
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error parsing cart data from request:", error);
      return json({ error: "Invalid cart data" }, { status: 400 });
    }
  } else {
    session = await getSession(request.headers.get("Cookie"));
    cart = getCartFromSession(session);
    session.set("cart", []);
  }

  // Supabaseを使用して注文データをデータベースに保存する
  // 環境変数からSupabaseの接続情報を取得
  // ローカル開発では`.env.local`ファイルに設定してください
  // 本番環境ではVercelのダッシュボードで環境変数を設定してください
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  // Log tableId to debug
  // eslint-disable-next-line no-console
  console.log("Form tableId:", tableId);
  if (!session) {
    session = await getSession(request.headers.get("Cookie"));
  }
  const sessionTableId = getTableIdFromSession(session);
  // eslint-disable-next-line no-console
  console.log("Session tableId:", sessionTableId);

  // Use session tableId if form tableId is not provided or is empty
  const finalTableId =
    tableId && typeof tableId === "string" && tableId.trim() !== ""
      ? tableId
      : sessionTableId;

  if (cart.length === 0) {
    return json({ error: "Cart is empty" }, { status: 400 });
  }

  // Check if tableId exists, if not return error to client
  if (!finalTableId || finalTableId.trim() === "") {
    return json(
      { error: "テーブルIDが必要です。QRコードをスキャンしてください。" },
      { status: 400 }
    );
  }

  // デバッグ用に環境変数の値をログに出力
  // eslint-disable-next-line no-console
  console.log(
    "Supabase URL:",
    supabaseUrl ? "設定されています" : "設定されていません"
  );
  // eslint-disable-next-line no-console
  console.log(
    "Supabase Anon Key:",
    supabaseKey ? "設定されています" : "設定されていません"
  );

  // Supabase URLが設定されていない場合はエラーを返す
  if (!supabaseUrl || supabaseUrl.trim() === "") {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase URLが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
    );
    return json(
      { error: "データベース接続エラー: Supabase URLが設定されていません" },
      { status: 500 }
    );
  }

  // Supabase Keyが設定されていない場合はエラーを返す
  if (!supabaseKey || supabaseKey.trim() === "") {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase Anon Keyが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
    );
    return json(
      {
        error: "データベース接続エラー: Supabase Anon Keyが設定されていません",
      },
      { status: 500 }
    );
  }

  // Supabase URLの形式を確認
  try {
    new URL(supabaseUrl);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase URLの形式が無効です。`.env.local`ファイルまたはVercelの環境変数を確認してください。",
      e
    );
    return json(
      { error: "データベース接続エラー: Supabase URLの形式が無効です" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 注文データを保存
  // SupabaseのAPIでは、操作が成功した場合、errorはnullになり、dataに結果が返されます
  // 操作が失敗した場合、errorにエラー情報が設定されます
  const orderId = "ORD-" + Math.floor(Math.random() * 10000);
  const { data, error } = await supabase.from("orders").insert([
    {
      order_id: orderId,
      cart_items: cart,
      table_id:
        finalTableId !== null &&
        finalTableId !== undefined &&
        finalTableId.trim() !== ""
          ? String(finalTableId)
          : "unknown",
      created_at: new Date().toISOString(),
      status: "pending", // Initial status for new orders
    },
  ]);

  // eslint-disable-next-line no-console
  console.log("注文データの保存結果:", data, error);

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error("注文データの保存に失敗しました:", error);
    // Supabaseでテーブルが存在しない場合、挿入操作は失敗します
    // Supabaseのダッシュボードで`orders`テーブルを作成してください
    // テーブル作成後、再度挿入操作を試みてください
    const errorMessage = error?.message?.includes(
      'relation "orders" does not exist'
    )
      ? "データベースエラー: `orders`テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。"
      : "注文データの保存に失敗しました";
    return json({ error: errorMessage }, { status: 500 });
  }

  console.log("注文データをデータベースに保存しました:", data);

  // 注文が保存された後、対応するテーブルの状態を 'occupied' に更新
  if (tableId) {
    const { data: tableData, error: tableError } = await supabase
      .from("tables")
      .upsert([
        {
          table_id: String(tableId),
          status: "occupied",
          last_updated: new Date().toISOString(),
        },
      ]);

    if (tableError !== null) {
      // eslint-disable-next-line no-console
      console.error("テーブルの状態更新に失敗しました:", tableError);
    } else {
      // eslint-disable-next-line no-console
      console.log("テーブルの状態を 'occupied' に更新しました:", tableData);
    }
  }

  if (!session) {
    session = await getSession(request.headers.get("Cookie"));
  }

  return json(
    {
      message: "Order placed successfully",
      orderId: "ORD-" + Math.floor(Math.random() * 10000),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
