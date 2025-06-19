import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from "@remix-run/react";
import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { createClient } from "@supabase/supabase-js";
import BottomNav from "~/components/BottomNav";

// Supabase connection setup
const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const loader: LoaderFunction = async () => {
  const { data: tables, error } = await supabase
    .from("tables")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("テーブルのデータ取得に失敗しました:", error);
    return json(
      { tables: [], error: "テーブルのデータ取得に失敗しました" },
      { status: 500 }
    );
  }

  return json({ tables });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const tableId = formData.get("tableId");
  const status = formData.get("status");

  if (!tableId || !status) {
    return json({ error: "テーブルIDと状態は必須です" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tables")
    .update({ status, last_updated: new Date().toISOString() })
    .eq("table_id", tableId);

  if (error) {
    console.error("テーブルの状態更新に失敗しました:", error);
    return json({ error: "テーブルの状態更新に失敗しました" }, { status: 500 });
  }

  return json({ success: true, data });
};

export type TableData = {
  id: number;
  table_id: string;
  status: string;
  last_updated: string;
};

export default function Management() {
  const { tables, error } = useLoaderData<{
    tables: TableData[];
    error?: string;
  }>();
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const navigation = useNavigation();

  const statusMap: Record<string, string> = {
    available: "利用可能",
    occupied: "使用中",
    needs_cleaning: "清掃が必要",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">テーブル管理</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {actionData?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          テーブルの状態を更新しました
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.table_id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              テーブル {table.table_id}
            </h2>
            <p className="text-gray-600 mb-2">
              現在の状態: {statusMap[table.status] || table.status}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              最終更新: {new Date(table.last_updated).toLocaleString()}
            </p>

            <Form method="post" className="flex flex-col gap-2">
              <input type="hidden" name="tableId" value={table.table_id} />
              <select
                name="status"
                defaultValue={table.status}
                className="border p-2 rounded text-black bg-white"
              >
                <option value="available">利用可能</option>
                <option value="occupied">使用中</option>
                <option value="needs_cleaning">清掃が必要</option>
              </select>
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {navigation.state === "submitting" ? "更新中..." : "状態を更新"}
              </button>
            </Form>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
