// app/utils/session.server.ts (サーバー専用)
import { createCookieSessionStorage, json, Session } from "@remix-run/node";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret"],
    secure: process.env.NODE_ENV === "production",
  },
});

import { CartItem } from "~/types/cartItem";

export const { getSession, commitSession, destroySession } = sessionStorage;

declare module "@remix-run/node" {
  interface SessionData {
    cart: CartItem[];
  }
}

// その後、関数では型安全に使用可能
export function getCartFromSession(session: Session): CartItem[] {
  const cartData = session.get("cart");
  return cartData || [];
}

// セッションからテーブルIDを取得するユーティリティ関数
export function getTableIdFromSession(session: Session): string | undefined {
  return session.get("tableId") as string | undefined;
}
// Loader function for handling table ID session
import type { LoaderFunction } from "@remix-run/node";

export type TableIdData = {
  tableId: string | undefined;
};

export const tableIdLoader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let tableId: string | undefined = getTableIdFromSession(session);

  // eslint-disable-next-line no-console
  console.log("session tableId:", tableId);

  const searchParams = new URL(request.url).searchParams;
  const urlTableId = searchParams.get("tableId");

  if (urlTableId !== null && urlTableId.trim() !== "") {
    tableId = urlTableId;
    session.set("tableId", tableId);
    return json(
      { tableId },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return json({ tableId });
};
