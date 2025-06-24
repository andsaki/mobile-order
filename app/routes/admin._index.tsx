import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  Link,
} from "@remix-run/react";
// app/routes/admin.tsx
// app/routes/admin.tsx
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import BottomNav from "~/components/BottomNav";
import { getSession, commitSession, isAdmin } from "~/utils/session.server";

// Supabase connection setup
const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  if (!isAdmin(session)) {
    return json(
      {
        tables: [],
        isAuthenticated: false,
        error: "管理者権限が必要です",
      },
      { status: 403 }
    );
  }

  const { data: tables, error } = await supabase
    .from("tables")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("テーブルのデータ取得に失敗しました:", error);
    return json(
      {
        tables: [],
        isAuthenticated: true,
        error: "テーブルのデータ取得に失敗しました",
      },
      { status: 500 }
    );
  }

  return json({ tables, isAuthenticated: true });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "login") {
    const username = formData.get("username");
    const password = formData.get("password");

    // Zodスキーマによるバリデーション
    const loginSchema = z.object({
      username: z
        .string()
        .min(1, "ユーザー名を入力してください")
        .max(10, "ユーザー名は10文字以内にしてください"),
      password: z.string().min(1, "パスワードを入力してください"),
    });

    const validationResult = loginSchema.safeParse({ username, password });
    if (!validationResult.success) {
      return json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    // 動的な認証ロジック（Supabaseからアカウントを取得）
    const { data: adminAccounts, error } = await supabase
      .from("admin_accounts")
      .select("*")
      .eq("username", username)
      .eq("password", password);

    if (error) {
      console.error("認証エラー:", error);
      return json({ error: "認証中にエラーが発生しました" }, { status: 500 });
    }

    if (adminAccounts && adminAccounts.length > 0) {
      session.set("isAdmin", true);
      return json(
        { success: true, message: "ログインに成功しました" },
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    } else {
      return json(
        { error: "ユーザー名またはパスワードが間違っています" },
        { status: 401 }
      );
    }
  } else if (actionType === "logout") {
    session.set("isAdmin", false);
    return json(
      { success: true, message: "ログアウトしました" },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  if (!isAdmin(session)) {
    return json({ error: "管理者権限が必要です" }, { status: 403 });
  }

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
  const { tables, isAuthenticated, error } = useLoaderData<{
    tables: TableData[];
    isAuthenticated: boolean;
    error?: string;
  }>();
  const actionData = useActionData<{
    success?: boolean;
    message?: string;
    error?: string;
  }>();
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

      {!isAuthenticated && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          管理者としてログインしてください
          <Form method="post" className="mt-4">
            <input type="hidden" name="actionType" value="login" />
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-yellow-900 font-medium mb-1"
              >
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="w-full p-2 border rounded text-yellow-900 bg-yellow-50"
                placeholder="ユーザー名を入力"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-yellow-900 font-medium mb-1"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full p-2 border rounded text-yellow-900 bg-yellow-50"
                placeholder="パスワードを入力"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
            >
              ログイン
            </button>
          </Form>
        </div>
      )}

      {actionData?.success && actionData?.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {actionData.message}
        </div>
      )}

      {actionData?.success && !actionData?.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          テーブルの状態を更新しました
        </div>
      )}

      {actionData?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {actionData.error}
        </div>
      )}

      {isAuthenticated && (
        <>
          <div className="flex justify-end mb-4">
            <Link
              to="/admin/account"
              className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
            >
              管理者アカウント管理
            </Link>
          </div>
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
                    {navigation.state === "submitting"
                      ? "更新中..."
                      : "状態を更新"}
                  </button>
                </Form>
              </div>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
