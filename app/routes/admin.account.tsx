import {
  json,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  getSession,
  commitSession,
  isAdmin,
} from "~/utils/business/session.server";

import BottomNav from "../components/BottomNav";
import Button from "../components/Button";

// Supabase connection setup
const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));

  if (!isAdmin(session)) {
    return json(
      {
        adminAccounts: [],
        isAuthenticated: false,
        error: "管理者権限が必要です",
      },
      { status: 403 }
    );
  }

  const { data: adminAccounts, error: accountsError } = await supabase
    .from("admin_accounts")
    .select("*");

  if (accountsError) {
    console.error("管理者アカウントのデータ取得に失敗しました:", accountsError);
    return json(
      {
        adminAccounts: [],
        isAuthenticated: true,
        error: "管理者アカウントのデータ取得に失敗しました",
      },
      { status: 500 }
    );
  }

  return json({ adminAccounts, isAuthenticated: true });
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  if (actionType === "logout") {
    session.set("isAdmin", false);
    return json(
      { success: true, message: "ログアウトしました" },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } else if (actionType === "addAdminAccount") {
    if (!isAdmin(session)) {
      return json({ error: "管理者権限が必要です" }, { status: 403 });
    }

    const username = formData.get("newUsername");
    const password = formData.get("newPassword");

    const addAccountSchema = z.object({
      username: z
        .string()
        .min(1, "ユーザー名を入力してください")
        .max(10, "ユーザー名は10文字以内にしてください"),
      password: z.string().min(1, "パスワードを入力してください"),
    });

    const validationResult = addAccountSchema.safeParse({ username, password });
    if (!validationResult.success) {
      return json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("admin_accounts")
      .insert([{ username, password }]);

    if (error) {
      console.error("管理者アカウントの追加に失敗しました:", error);
      return json(
        { error: "管理者アカウントの追加に失敗しました" },
        { status: 500 }
      );
    }

    return json({ success: true, message: "管理者アカウントを追加しました" });
  }

  return json({ error: "無効なアクションタイプです" }, { status: 400 });
};

export default function AccountManagement() {
  const { adminAccounts, isAuthenticated, error } = useLoaderData<{
    adminAccounts: { id: number; username: string; password: string }[];
    isAuthenticated: boolean;
    error?: string;
  }>();
  const actionData = useActionData<{
    success?: boolean;
    message?: string;
    error?: string;
  }>();

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">
        管理者アカウント管理
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          管理者としてログインしてください
        </div>
      )}

      {actionData?.success && actionData?.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {actionData.message}
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
            <Form method="post">
              <input type="hidden" name="actionType" value="logout" />
              <Button type="submit" variant="danger">
                ログアウト
              </Button>
            </Form>
          </div>
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-lg font-semibold mb-2">
              新しいアカウントを追加
            </h2>
            <Form
              method="post"
              className="flex flex-col gap-2 bg-white p-4 rounded shadow"
            >
              <input type="hidden" name="actionType" value="addAdminAccount" />
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  name="newUsername"
                  type="text"
                  className="flex-1 p-2 border rounded text-black bg-white"
                  placeholder="新しいユーザー名"
                  required
                />
                <input
                  name="newPassword"
                  type="password"
                  className="flex-1 p-2 border rounded text-black bg-white"
                  placeholder="新しいパスワード"
                  required
                />
                <Button type="submit" variant="primary">
                  追加
                </Button>
              </div>
            </Form>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">既存のアカウント</h2>
            {adminAccounts.length > 0 ? (
              <ul className="space-y-2">
                {adminAccounts.map((account) => (
                  <li key={account.id} className="p-2 border rounded">
                    ユーザー名: {account.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">管理者アカウントがありません。</p>
            )}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
