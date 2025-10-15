import {
  createCookieSessionStorage,
  Session,
  LoaderFunction,
  json,
} from "@remix-run/node";

import { CartItem } from "~/features/cart/types/cartItem";
import { SessionData } from "~/types/session";

// セッションの保存期間を定義する (例: 1時間)
const SESSION_DURATION_SECONDS = 60 * 60;

// セッションストレージを作成する
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
      sameSite: "lax",
      secrets: ["s3cr3t"], // 実際のアプリケーションでは環境変数を使用してください
      secure: process.env.NODE_ENV === "production",
    },
  });

// セッションからカートを取得するヘルパー関数
function getCartFromSession(session: Session<SessionData>): CartItem[] {
  return session.get("cart") || [];
}

// セッションからテーブルIDを取得するヘルパー関数
function getTableIdFromSession(session: Session<SessionData>): string {
  return session.get("tableId") || "";
}

// セッションから管理者権限を確認するヘルパー関数
function isAdmin(session: Session<Record<string, unknown>>): boolean {
  const value = session.get("isAdmin");
  return typeof value === "boolean" ? value : false;
}

// テーブルIDをロードし、クエリパラメータからセッションに設定する関数
export const tableIdLoader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let tableId = getTableIdFromSession(session);

  // URLからクエリパラメータを取得してセッションに設定
  const url = new URL(request.url);
  const queryTableId = url.searchParams.get("tableId");
  if (queryTableId && queryTableId !== "") {
    session.set("tableId", queryTableId);
    tableId = queryTableId;
  }

  return json(
    { tableId },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

// テーブルIDをクエリパラメータから取得してセッションに設定するユーティリティ関数
export const updateTableIdFromQuery = (
  request: Request,
  session: Session<SessionData>
): string => {
  let tableId = getTableIdFromSession(session);
  const url = new URL(request.url);
  const queryTableId = url.searchParams.get("tableId");
  if (queryTableId && queryTableId !== "") {
    session.set("tableId", queryTableId);
    tableId = queryTableId;
  }
  return tableId;
};

// テーブルIDデータの型
export type TableIdData = {
  tableId: string;
};

export {
  commitSession,
  destroySession,
  getCartFromSession,
  getSession,
  getTableIdFromSession,
  isAdmin,
};
