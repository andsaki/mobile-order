import { createClient } from "@supabase/supabase-js";
import { useCallback } from "react";

import { CartItem } from "~/features/cart/types/cartItem";

/**
 * 注文処理を管理するためのカスタムフック。
 * Supabaseを使用して注文データを保存し、テーブルの状態を更新します。
 * クライアントサイドでのみ使用可能です。
 */
export const useOrder = () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  /**
   * 注文を確定し、データベースに保存する関数。
   * @param cart 注文する商品のリスト。
   * @param tableId 注文を行うテーブルのID。
   * @returns 注文の結果。成功した場合は注文IDを含むメッセージ、失敗した場合はエラーメッセージとステータスコード。
   */
  const placeOrder = useCallback(
    async (cart: CartItem[], tableId: string) => {
      if (cart.length === 0) {
        return { error: "Cart is empty", status: 400 };
      }

      if (!tableId || tableId.trim() === "") {
        return {
          error: "テーブルIDが必要です。QRコードをスキャンしてください。",
          status: 400,
        };
      }

      if (!supabaseUrl || supabaseUrl.trim() === "") {
        // eslint-disable-next-line no-console
        console.log(
          "Supabase URLが設定されていません。ダミーの注文IDを返します。"
        );
        return {
          message: "Order placed successfully (dummy)",
          orderId: "DUMMY-ORD-" + Math.floor(Math.random() * 10000),
        };
      }

      if (!supabaseKey || supabaseKey.trim() === "") {
        // eslint-disable-next-line no-console
        console.error(
          "Supabase Anon Keyが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
        );
        return {
          error:
            "データベース接続エラー: Supabase Anon Keyが設定されていません",
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
    },
    [supabaseUrl, supabaseKey]
  );

  return { placeOrder };
};
