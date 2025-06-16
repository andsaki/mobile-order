// app/utils/session.server.ts (サーバー専用)
import { createCookieSessionStorage, json } from "@remix-run/node";

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

export const { getSession, commitSession, destroySession } = sessionStorage;

// Loader function for handling table ID session
import type { LoaderFunction } from "@remix-run/node";

export type TableIdData = {
  tableId: string | undefined;
};

export const tableIdLoader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let tableId: string | undefined = session.get("tableId");

  console.log("session tableId:", tableId);

  const searchParams = new URL(request.url).searchParams;
  const urlTableId = searchParams.get("tableId");

  if (urlTableId) {
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
