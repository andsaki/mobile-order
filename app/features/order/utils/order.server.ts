import { createClient } from "@supabase/supabase-js";

import { CartItem } from "~/features/cart/types/cartItem";

export const placeOrder = async (cart: CartItem[], tableId: string) => {
  if (cart.length === 0) {
    return { error: "Cart is empty", status: 400 };
  }

  if (!tableId || tableId.trim() === "") {
    return {
      error: "テーブルIDが必要です。QRコードをスキャンしてください。",
      status: 400,
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase URLが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
    );
    return {
      error: "データベース接続エラー: Supabase URLが設定されていません",
      status: 500,
    };
  }

  if (!supabaseKey || supabaseKey.trim() === "") {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase Anon Keyが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
    );
    return {
      error: "データベース接続エラー: Supabase Anon Keyが設定されていません",
      status: 500,
    };
  }

  try {
    new URL(supabaseUrl);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      "Supabase URLの形式が無効です。`.env.local`ファイルまたはVercelの環境変数を確認してください。",
      e
    );
    return {
      error: "データベース接続エラー: Supabase URLの形式が無効です",
      status: 500,
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const orderId = "ORD-" + Math.floor(Math.random() * 10000);

  const { data, error } = await supabase.from("orders").insert([
    {
      order_id: orderId,
      cart_items: cart,
      table_id: tableId.trim() !== "" ? String(tableId) : "unknown",
      created_at: new Date().toISOString(),
      status: "pending",
    },
  ]);

  if (error !== null) {
    // eslint-disable-next-line no-console
    console.error("注文データの保存に失敗しました:", error);
    const errorMessage = error?.message?.includes(
      'relation "orders" does not exist'
    )
      ? "データベースエラー: `orders`テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。"
      : "注文データの保存に失敗しました";
    return { error: errorMessage, status: 500 };
  }

  // eslint-disable-next-line no-console
  console.log("注文データをデータベースに保存しました:", data);

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

  return {
    message: "Order placed successfully",
    orderId,
  };
};
