import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import BottomNav from "~/components/BottomNav";

export const loader: LoaderFunction = async () => {
  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseKey) {
    return json(
      { error: "Database connection error: Missing configuration" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return json({ error: "Failed to fetch orders" }, { status: 500 });
  }

  return json({ orders });
};

// Define the type for the loader data
interface LoaderData {
  orders: Array<{
    order_id: string;
    table_id: string;
    created_at: string;
    cart_items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }> | null;
}

export default function Orders() {
  const { orders } = useLoaderData<LoaderData>();

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-gray-700">注文一覧</h1>
        <p className="text-gray-500">注文がありません。</p>
        <a
          href="/menu"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          メニューに戻る
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">注文一覧</h1>
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
            <div key={order.order_id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">
                注文ID: {order.order_id}
              </h2>
              <p className="text-gray-600">テーブルID: {order.table_id}</p>
              <p className="text-gray-600">
                注文日時: {new Date(order.created_at).toLocaleString()}
              </p>
              <div className="mt-2">
                <h3 className="text-md font-medium">注文内容:</h3>
                <ul className="list-disc list-inside">
                  {order.cart_items.map((item, index) => (
                    <li key={index}>
                      {item.name} - 数量: {item.quantity} - 価格: ¥{item.price}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <a
          href="/menu"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          メニューに戻る
        </a>
        <a
          href="/qr"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          QRコードをレジに持っていく
        </a>
      </div>
      <BottomNav />
    </div>
  );
}
