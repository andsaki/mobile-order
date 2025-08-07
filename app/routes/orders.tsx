import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import BottomNav from "~/components/BottomNav";
import Button from "~/components/Button";
import LayoutConverter from "~/components/LayoutConverter";
import { MENU } from "~/constants/pages";
import { LoaderData } from "~/features/order/types/order";
import {
  getSession,
  getTableIdFromSession,
} from "~/utils/business/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseKey) {
    return json(
      { error: "Database connection error: Missing configuration" },
      { status: 500 }
    );
  }

  /* セッションからテーブルIDを取得する */
  const session = await getSession(request.headers.get("Cookie"));
  const tableId = getTableIdFromSession(session);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const supabase: SupabaseClient | null = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

  /* テーブルIDがない場合、空の注文を返す */
  if (!tableId || tableId.trim() === "") {
    return json({ orders: [], tableId });
  }

  if (!supabase) {
    return json({ error: "データベースが設定されていません。" }, { status: 500 });
  }

  /* テーブルIDで注文をフィルタリングする */
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("table_id", tableId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return json({ orders });
};

export default function Orders() {
  const { orders } = useLoaderData<LoaderData>();

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LayoutConverter title="注文一覧">
          <>
            <p className="text-gray-500">注文がありません。</p>
            <Button
              variant="primary"
              onClick={() => (window.location.href = MENU)}
            >
              メニューに戻る
            </Button>
          </>
        </LayoutConverter>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-16">
      <LayoutConverter title="注文一覧">
        <>
          <div className="space-y-4">
            {orders.map(
              (order: {
                order_id: string;
                table_id: string;
                created_at: string;
                cart_items: Array<{
                  name: string;
                  quantity: number;
                  price: number;
                }>;
              }) => (
                <div
                  key={order.order_id}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    注文ID: {order.order_id.slice(0, 8)}...
                  </h2>
                  <p className="text-gray-500 text-sm mb-1">
                    テーブルID: {order.table_id}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    注文日時: {new Date(order.created_at).toLocaleString()}
                  </p>
                  <div className="mt-3">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      注文内容:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      {order.cart_items.map((item, index) => (
                        <li key={index} className="text-gray-600">
                          <span className="font-medium">{item.name}</span> -
                          数量: {item.quantity} - 価格: ¥{item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            )}
          </div>
          <div className="mt-6 flex justify-between">
            <Button
              variant="secondary"
              onClick={() => (window.location.href = MENU)}
            >
              メニューに戻る
            </Button>
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/qr")}
            >
              QRで支払い
            </Button>
          </div>
          <BottomNav />
        </>
      </LayoutConverter>
    </div>
  );
}
