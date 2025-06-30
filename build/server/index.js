import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, createCookieSessionStorage, json } from "@remix-run/node";
import { RemixServer, useLocation, Link, Outlet, useRouteError, Meta, Links, ScrollRestoration, Scripts, useLoaderData, useActionData, Form, useNavigation, useSearchParams, useNavigate, useFetcher } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import toast, { Toaster } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const sessionStorage$1 = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret"],
    secure: process.env.NODE_ENV === "production"
  }
});
const { getSession, commitSession, destroySession } = sessionStorage$1;
function getCartFromSession(session) {
  const cartData = session.get("cart");
  return cartData || [];
}
function isAdmin(session) {
  return session.get("isAdmin") === true;
}
function getTableIdFromSession(session) {
  return session.get("tableId");
}
const tableIdLoader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let tableId = getTableIdFromSession(session);
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
          "Set-Cookie": await commitSession(session)
        }
      }
    );
  }
  return json({ tableId });
};
function BottomNav() {
  const location = useLocation();
  return /* @__PURE__ */ jsxs("nav", { className: "fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around py-2 px-4 max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/menu",
        className: `flex flex-col items-center text-xs px-4 py-2 ${location.pathname === "/menu" ? "text-blue-400" : ""}`,
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: `h-7 w-7 mb-1 ${location.pathname === "/menu" ? "stroke-blue-400" : ""}`,
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M4 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6M4 14h16M4 18h16"
                }
              )
            }
          ),
          "メニュー"
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/cart",
        className: `flex flex-col items-center text-xs px-4 py-2 ${location.pathname === "/cart" ? "text-blue-400" : ""}`,
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: `h-7 w-7 mb-1 ${location.pathname === "/cart" ? "stroke-blue-400" : ""}`,
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                }
              )
            }
          ),
          "カート"
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Link,
      {
        to: "/orders",
        className: `flex flex-col items-center text-xs px-4 py-2 ${location.pathname === "/orders" ? "text-blue-400" : ""}`,
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: `h-7 w-7 mb-1 ${location.pathname === "/orders" ? "stroke-blue-400" : ""}`,
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                }
              )
            }
          ),
          "履歴"
        ]
      }
    )
  ] });
}
const loader$6 = tableIdLoader;
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function Layout({ children }) {
  const error = useRouteError();
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "bg-background text-text", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "bg-background text-text", children: [
      error !== void 0 && error !== null ? /* @__PURE__ */ jsx(ErrorBoundary, {}) : /* @__PURE__ */ jsx(AppContent, { children }),
      /* @__PURE__ */ jsx(Toaster, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {}),
      /* @__PURE__ */ jsx(BottomNav, {})
    ] })
  ] });
}
function AppContent({ children }) {
  const { tableId } = useLoaderData();
  if (tableId === void 0 || tableId === "") {
    return /* @__PURE__ */ jsx(ErrorBoundary, {});
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
function ErrorBoundary() {
  return /* @__PURE__ */ jsxs("div", { style: { fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }, children: [
    /* @__PURE__ */ jsx("h1", { children: "Oh no!" }),
    /* @__PURE__ */ jsx("p", { children: "Looks like something went wrong." })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const action$2 = async ({ request }) => {
  var _a;
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }
  let cart = [];
  let session;
  const formData = await request.formData();
  const cartData = formData.get("cart");
  const tableId = formData.get("tableId");
  if (cartData !== null && typeof cartData === "string") {
    try {
      cart = JSON.parse(cartData);
    } catch (error2) {
      console.error("Error parsing cart data from request:", error2);
      return json({ error: "Invalid cart data" }, { status: 400 });
    }
  } else {
    session = await getSession(request.headers.get("Cookie"));
    cart = getCartFromSession(session);
    session.set("cart", []);
  }
  const supabaseUrl2 = process.env.SUPABASE_URL ?? "";
  const supabaseKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  console.log("Form tableId:", tableId);
  if (!session) {
    session = await getSession(request.headers.get("Cookie"));
  }
  const sessionTableId = getTableIdFromSession(session);
  console.log("Session tableId:", sessionTableId);
  const finalTableId = tableId && typeof tableId === "string" && tableId.trim() !== "" ? tableId : sessionTableId;
  if (cart.length === 0) {
    return json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!finalTableId || finalTableId.trim() === "") {
    return json(
      { error: "テーブルIDが必要です。QRコードをスキャンしてください。" },
      { status: 400 }
    );
  }
  console.log(
    "Supabase URL:",
    supabaseUrl2 ? "設定されています" : "設定されていません"
  );
  console.log(
    "Supabase Anon Key:",
    supabaseKey2 ? "設定されています" : "設定されていません"
  );
  if (!supabaseUrl2 || supabaseUrl2.trim() === "") {
    console.error(
      "Supabase URLが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
    );
    return json(
      { error: "データベース接続エラー: Supabase URLが設定されていません" },
      { status: 500 }
    );
  }
  if (!supabaseKey2 || supabaseKey2.trim() === "") {
    console.error(
      "Supabase Anon Keyが設定されていません。`.env.local`ファイルまたはVercelの環境変数を確認してください。"
    );
    return json(
      {
        error: "データベース接続エラー: Supabase Anon Keyが設定されていません"
      },
      { status: 500 }
    );
  }
  try {
    new URL(supabaseUrl2);
  } catch (e) {
    console.error(
      "Supabase URLの形式が無効です。`.env.local`ファイルまたはVercelの環境変数を確認してください。",
      e
    );
    return json(
      { error: "データベース接続エラー: Supabase URLの形式が無効です" },
      { status: 500 }
    );
  }
  const supabase2 = createClient(supabaseUrl2, supabaseKey2);
  const orderId = "ORD-" + Math.floor(Math.random() * 1e4);
  const { data, error } = await supabase2.from("orders").insert([
    {
      order_id: orderId,
      cart_items: cart,
      table_id: finalTableId !== null && finalTableId !== void 0 && finalTableId.trim() !== "" ? String(finalTableId) : "unknown",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      status: "pending"
      // Initial status for new orders
    }
  ]);
  console.log("注文データの保存結果:", data, error);
  if (error !== null) {
    console.error("注文データの保存に失敗しました:", error);
    const errorMessage = ((_a = error == null ? void 0 : error.message) == null ? void 0 : _a.includes(
      'relation "orders" does not exist'
    )) ? "データベースエラー: `orders`テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。" : "注文データの保存に失敗しました";
    return json({ error: errorMessage }, { status: 500 });
  }
  console.log("注文データをデータベースに保存しました:", data);
  if (tableId) {
    const { data: tableData, error: tableError } = await supabase2.from("tables").upsert([
      {
        table_id: String(tableId),
        status: "occupied",
        last_updated: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
    if (tableError !== null) {
      console.error("テーブルの状態更新に失敗しました:", tableError);
    } else {
      console.log("テーブルの状態を 'occupied' に更新しました:", tableData);
    }
  }
  if (!session) {
    session = await getSession(request.headers.get("Cookie"));
  }
  return json(
    {
      message: "Order placed successfully",
      orderId: "ORD-" + Math.floor(Math.random() * 1e4)
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    }
  );
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2
}, Symbol.toStringTag, { value: "Module" }));
function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  className = ""
}) {
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };
  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      onClick,
      disabled,
      className: `rounded font-semibold transition-colors duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`,
      children
    }
  );
}
const supabaseUrl$1 = process.env.SUPABASE_URL ?? "";
const supabaseKey$1 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase$1 = createClient(supabaseUrl$1, supabaseKey$1);
const loader$5 = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!isAdmin(session)) {
    return json(
      {
        adminAccounts: [],
        isAuthenticated: false,
        error: "管理者権限が必要です"
      },
      { status: 403 }
    );
  }
  const { data: adminAccounts, error: accountsError } = await supabase$1.from("admin_accounts").select("*");
  if (accountsError) {
    console.error("管理者アカウントのデータ取得に失敗しました:", accountsError);
    return json(
      {
        adminAccounts: [],
        isAuthenticated: true,
        error: "管理者アカウントのデータ取得に失敗しました"
      },
      { status: 500 }
    );
  }
  return json({ adminAccounts, isAuthenticated: true });
};
const action$1 = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  if (actionType === "logout") {
    session.set("isAdmin", false);
    return json(
      { success: true, message: "ログアウトしました" },
      {
        headers: {
          "Set-Cookie": await commitSession(session)
        }
      }
    );
  } else if (actionType === "addAdminAccount") {
    if (!isAdmin(session)) {
      return json({ error: "管理者権限が必要です" }, { status: 403 });
    }
    const username = formData.get("newUsername");
    const password = formData.get("newPassword");
    const addAccountSchema = z.object({
      username: z.string().min(1, "ユーザー名を入力してください").max(10, "ユーザー名は10文字以内にしてください"),
      password: z.string().min(1, "パスワードを入力してください")
    });
    const validationResult = addAccountSchema.safeParse({ username, password });
    if (!validationResult.success) {
      return json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }
    const { error } = await supabase$1.from("admin_accounts").insert([{ username, password }]);
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
function AccountManagement() {
  const { adminAccounts, isAuthenticated, error } = useLoaderData();
  const actionData = useActionData();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-100 p-4 pb-16", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-700 mb-6", children: "管理者アカウント管理" }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: error }),
    !isAuthenticated && /* @__PURE__ */ jsx("div", { className: "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6", children: "管理者としてログインしてください" }),
    (actionData == null ? void 0 : actionData.success) && (actionData == null ? void 0 : actionData.message) && /* @__PURE__ */ jsx("div", { className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4", children: actionData.message }),
    (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: actionData.error }),
    isAuthenticated && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsxs(Form, { method: "post", children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "actionType", value: "logout" }),
        /* @__PURE__ */ jsx(Button, { type: "submit", variant: "danger", children: "ログアウト" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded shadow mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-2", children: "新しいアカウントを追加" }),
        /* @__PURE__ */ jsxs(
          Form,
          {
            method: "post",
            className: "flex flex-col gap-2 bg-white p-4 rounded shadow",
            children: [
              /* @__PURE__ */ jsx("input", { type: "hidden", name: "actionType", value: "addAdminAccount" }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-4", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    name: "newUsername",
                    type: "text",
                    className: "flex-1 p-2 border rounded text-black bg-white",
                    placeholder: "新しいユーザー名",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    name: "newPassword",
                    type: "password",
                    className: "flex-1 p-2 border rounded text-black bg-white",
                    placeholder: "新しいパスワード",
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(Button, { type: "submit", variant: "primary", children: "追加" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded shadow", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold mb-2", children: "既存のアカウント" }),
        adminAccounts.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "space-y-2", children: adminAccounts.map((account) => /* @__PURE__ */ jsxs("li", { className: "p-2 border rounded", children: [
          "ユーザー名: ",
          account.username
        ] }, account.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "管理者アカウントがありません。" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: AccountManagement,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);
const loader$4 = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!isAdmin(session)) {
    return json(
      {
        tables: [],
        isAuthenticated: false,
        error: "管理者権限が必要です"
      },
      { status: 403 }
    );
  }
  const { data: tables, error } = await supabase.from("tables").select("*").order("id", { ascending: true });
  if (error) {
    console.error("テーブルのデータ取得に失敗しました:", error);
    return json(
      {
        tables: [],
        isAuthenticated: true,
        error: "テーブルのデータ取得に失敗しました"
      },
      { status: 500 }
    );
  }
  return json({ tables, isAuthenticated: true });
};
const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  if (actionType === "login") {
    const username = formData.get("username");
    const password = formData.get("password");
    const loginSchema = z.object({
      username: z.string().min(1, "ユーザー名を入力してください").max(10, "ユーザー名は10文字以内にしてください"),
      password: z.string().min(1, "パスワードを入力してください")
    });
    const validationResult = loginSchema.safeParse({ username, password });
    if (!validationResult.success) {
      return json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }
    const { data: adminAccounts, error: error2 } = await supabase.from("admin_accounts").select("*").eq("username", username).eq("password", password);
    if (error2) {
      console.error("認証エラー:", error2);
      return json({ error: "認証中にエラーが発生しました" }, { status: 500 });
    }
    if (adminAccounts && adminAccounts.length > 0) {
      session.set("isAdmin", true);
      return json(
        { success: true, message: "ログインに成功しました" },
        {
          headers: {
            "Set-Cookie": await commitSession(session)
          }
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
          "Set-Cookie": await commitSession(session)
        }
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
  const { data, error } = await supabase.from("tables").update({ status, last_updated: (/* @__PURE__ */ new Date()).toISOString() }).eq("table_id", tableId);
  if (error) {
    console.error("テーブルの状態更新に失敗しました:", error);
    return json({ error: "テーブルの状態更新に失敗しました" }, { status: 500 });
  }
  return json({ success: true, data });
};
function Management() {
  const { tables, isAuthenticated, error } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const statusMap = {
    available: "利用可能",
    occupied: "使用中",
    needs_cleaning: "清掃が必要"
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-100 p-4 pb-16", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-700 mb-6", children: "テーブル管理" }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: error }),
    !isAuthenticated && /* @__PURE__ */ jsxs("div", { className: "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6", children: [
      "管理者としてログインしてください",
      /* @__PURE__ */ jsxs(Form, { method: "post", className: "mt-4", children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "actionType", value: "login" }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "username",
              className: "block text-yellow-900 font-medium mb-1",
              children: "ユーザー名"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "username",
              name: "username",
              type: "text",
              className: "w-full p-2 border rounded text-yellow-900 bg-yellow-50",
              placeholder: "ユーザー名を入力",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "password",
              className: "block text-yellow-900 font-medium mb-1",
              children: "パスワード"
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "password",
              name: "password",
              type: "password",
              className: "w-full p-2 border rounded text-yellow-900 bg-yellow-50",
              placeholder: "パスワードを入力",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600",
            children: "ログイン"
          }
        )
      ] })
    ] }),
    (actionData == null ? void 0 : actionData.success) && (actionData == null ? void 0 : actionData.message) && /* @__PURE__ */ jsx("div", { className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4", children: actionData.message }),
    (actionData == null ? void 0 : actionData.success) && !(actionData == null ? void 0 : actionData.message) && /* @__PURE__ */ jsx("div", { className: "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4", children: "テーブルの状態を更新しました" }),
    (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4", children: actionData.error }),
    isAuthenticated && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-4", children: /* @__PURE__ */ jsx(
        Link,
        {
          to: "/admin/account",
          className: "bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600",
          children: "管理者アカウント管理"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: tables.map((table) => /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded shadow", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold mb-2", children: [
          "テーブル ",
          table.table_id
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-2", children: [
          "現在の状態: ",
          statusMap[table.status] || table.status
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 mb-4", children: [
          "最終更新: ",
          new Date(table.last_updated).toLocaleString()
        ] }),
        /* @__PURE__ */ jsxs(Form, { method: "post", className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "tableId", value: table.table_id }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              name: "status",
              defaultValue: table.status,
              className: "border p-2 rounded text-black bg-white",
              children: [
                /* @__PURE__ */ jsx("option", { value: "available", children: "利用可能" }),
                /* @__PURE__ */ jsx("option", { value: "occupied", children: "使用中" }),
                /* @__PURE__ */ jsx("option", { value: "needs_cleaning", children: "清掃が必要" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: navigation.state === "submitting",
              className: "bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300",
              children: navigation.state === "submitting" ? "更新中..." : "状態を更新"
            }
          )
        ] })
      ] }, table.table_id)) })
    ] }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Management,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const LayoutConverter = ({
  title,
  children
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "layout-converter", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-4", children: title }),
    /* @__PURE__ */ jsx("div", { className: "content pb-20", children })
  ] });
};
const QuantityControl = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full mr-1 w-8 h-8",
        onClick: onDecrement,
        disabled: quantity <= min,
        children: "-"
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "w-20 border rounded px-2 py-1 mx-2", children: quantity }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full w-8 h-8",
        onClick: onIncrement,
        children: "+"
      }
    )
  ] });
};
const API_ENDPOINT = "https://andsakiapi.microcms.io/api/v1/items";
const API_KEY = "KOjYGzOL5TlpVlL8YAZdxka6KEPLlDaBtPW2";
async function loader$3({ params }) {
  const itemId = params.itemId;
  const response = await fetch(`${API_ENDPOINT}/${itemId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": API_KEY
    }
  });
  if (!response.ok) {
    throw new Response("Not Found", { status: response.status });
  }
  const item = await response.json();
  return item;
}
function MenuItemRoute() {
  const item = useLoaderData();
  const [quantity, setQuantity] = useState(1);
  return /* @__PURE__ */ jsx("div", { className: "rounded-lg p-4 cursor-pointer transition duration-300", children: /* @__PURE__ */ jsx(LayoutConverter, { title: item.name, children: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "w-full relative aspect-w-1 aspect-h-1", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: item.image.url,
        alt: item.name,
        className: "w-full h-full object-cover rounded-md mt-2 mb-8 square"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white p-4 rounded shadow mb-4", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-4 text-gray-500", children: item.description }),
      /* @__PURE__ */ jsxs("p", { className: "mb-4 text-black font-bold text-lg", children: [
        item.price,
        "円"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "quantity", className: "mr-2", children: "数量:" }),
        /* @__PURE__ */ jsx(
          QuantityControl,
          {
            quantity,
            onIncrement: () => setQuantity(quantity + 1),
            onDecrement: () => setQuantity(quantity - 1),
            min: 1
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => {
            addToCart(item, quantity);
          },
          className: "mr-4",
          disabled: quantity < 1,
          children: "カートに入れる"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => window.location.href = "/menu",
          children: "戻る"
        }
      )
    ] })
  ] }) }) });
}
function addToCart(item, quantity) {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const existingItemIndex = cart.findIndex(
    (cartItem) => cartItem.id === item.id
  );
  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity
    });
  }
  sessionStorage.setItem("cart", JSON.stringify(cart));
  toast.success(`${item.name}をカートに追加しました！`);
}
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MenuItemRoute,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const Menu = ({ menuData }) => {
  return /* @__PURE__ */ jsx("div", { className: "container mx-auto py-4", children: menuData == null ? void 0 : menuData.categories.map((category) => /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-2xl mb-4 font-bold flex items-center", children: [
      category.name,
      category.name === "フード" && /* @__PURE__ */ jsxs(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-6 w-6 ml-4 text-gray-600",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M21 12H3m18 0c-1.48-2.74-4.239-4.95-7.439-5.74l-.811-.18A5.505 5.505 0 008 3.5c-2.793.456-4.91 2.973-4.91 5.798 0 .216.012.428.035.635l-.93.326C1.48 10.511 1 11.205 1 12s.48 1.489 1.194 1.74l.93.327c-.023.206-.035.417-.035.633 0 2.588 1.707 4.783 4.049 5.512l.257.074c.284.075.566.139.843.191 1.101.202 2.257.308 3.443.308 1.186 0 2.342-.106 3.443-.308.277-.052.559-.116.843-.191l.257-.074c2.342-.729 4.049-2.924 4.049-5.512 0-.216-.012-.427-.035-.633l.93-.327C22.52 13.489 23 12.795 23 12s-.48-1.489-1.194-1.74l-.93-.326c.023-.207.035-.419.035-.635 0-2.825-2.117-5.342-4.91-5.798a5.505 5.505 0 00-2.75 2.582l-.811.18C9.239 7.05 6.48 9.26 5 12h16z"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M8 12h0"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M16 12h0"
              }
            ),
            /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M11.5 14.5c0 1.38.559 2.632 1.464 3.536A5.506 5.506 0 0016.5 19.5c2.795-.458 4.91-2.979 4.91-5.798 0-.589-.044-1.16-.127-1.702H2.717c-.083.542-.127 1.113-.127 1.702 0 2.819 2.115 5.34 4.91 5.798a5.506 5.506 0 003.536-1.464A4.982 4.982 0 0011.5 14.5z"
              }
            )
          ]
        }
      ),
      category.name === "ドリンク" && /* @__PURE__ */ jsx(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: "h-6 w-6 ml-4 text-gray-600",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: menuData.items.filter((item) => item.categoryId === category.categoryId).map((item) => /* @__PURE__ */ jsx(
      "li",
      {
        className: "rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition duration-300 bg-white",
        children: /* @__PURE__ */ jsxs(Link, { to: `/menu/${item.id}`, className: "flex", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: item.image.url,
              alt: item.name,
              className: "w-32 h-32 object-cover rounded-md mr-4"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: item.name }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: item.description }),
            /* @__PURE__ */ jsxs("p", { className: "text-black font-bold text-lg", children: [
              item.price,
              "円"
            ] })
          ] })
        ] })
      },
      item.id
    )) })
  ] }, category.id)) });
};
async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": API_KEY
    }
  });
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
  return await res.json();
}
async function fetchMenuData() {
  const [itemData, categoryData] = await Promise.all([
    fetchJson(
      "https://andsakiapi.microcms.io/api/v1/items"
    ),
    fetchJson(
      "https://andsakiapi.microcms.io/api/v1/categories"
    )
  ]);
  const items = itemData.contents;
  const categories = categoryData.contents;
  return json({ categories, items });
}
async function loader$2() {
  return await fetchMenuData();
}
function MenuRoute() {
  const menu = useLoaderData();
  return /* @__PURE__ */ jsx("div", { className: "container mx-auto p-4 pb-16", children: /* @__PURE__ */ jsx(LayoutConverter, { title: "メニュー", children: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Menu, { menuData: menu }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] }) }) });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MenuRoute,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const meta = () => {
  return [
    { title: "Mobile Order" },
    { name: "description", content: "Mobile Order App" }
  ];
};
function Index() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("tableId");
  const navigate = useNavigate();
  if (!tableId) {
    throw new Error("Table ID is required");
  }
  useEffect(() => {
    navigate(`/cart?tableId=${tableId}`);
  }, [tableId, navigate]);
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { children: "Redirecting..." }) });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  const supabaseUrl2 = process.env.SUPABASE_URL ?? "";
  const supabaseKey2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!supabaseUrl2 || !supabaseKey2) {
    return json(
      { error: "Database connection error: Missing configuration" },
      { status: 500 }
    );
  }
  const session = await getSession(request.headers.get("Cookie"));
  const tableId = getTableIdFromSession(session);
  const supabase2 = createClient(supabaseUrl2, supabaseKey2);
  if (!tableId || tableId.trim() === "") {
    return json({ orders: [] });
  }
  const { data: orders, error } = await supabase2.from("orders").select("*").eq("table_id", tableId).order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching orders:", error);
    return json({ error: "Failed to fetch orders" }, { status: 500 });
  }
  return json({ orders });
};
function Orders() {
  const { orders } = useLoaderData();
  if (!orders || orders.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center justify-center h-screen", children: /* @__PURE__ */ jsx(LayoutConverter, { title: "注文一覧", children: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "注文がありません。" }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => window.location.href = "/menu",
          children: "メニューに戻る"
        }
      )
    ] }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen p-4 pb-16", children: /* @__PURE__ */ jsx(LayoutConverter, { title: "注文一覧", children: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "space-y-4", children: orders.map(
      (order) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200",
          children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-xl font-bold text-gray-800 mb-2", children: [
              "注文ID: ",
              order.order_id.slice(0, 8),
              "..."
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mb-1", children: [
              "テーブルID: ",
              order.table_id
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mb-3", children: [
              "注文日時: ",
              new Date(order.created_at).toLocaleString()
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-700 mb-2", children: "注文内容:" }),
              /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside space-y-1 pl-2", children: order.cart_items.map((item, index) => /* @__PURE__ */ jsxs("li", { className: "text-gray-600", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.name }),
                " - 数量: ",
                item.quantity,
                " - 価格: ¥",
                item.price
              ] }, index)) })
            ] })
          ]
        },
        order.order_id
      )
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex justify-between", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "secondary",
          onClick: () => window.location.href = "/menu",
          children: "メニューに戻る"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => window.location.href = "/qr",
          children: "QRで支払い"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] }) }) });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Orders,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const CartItem = ({
  item,
  updateQuantity,
  removeItem
}) => {
  return /* @__PURE__ */ jsx("li", { className: "rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition duration-300", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: item.name }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-800", children: [
        "単価: ",
        item.price,
        "円 小計: ",
        item.price * item.quantity,
        "円"
      ] }),
      /* @__PURE__ */ jsx(
        QuantityControl,
        {
          quantity: item.quantity,
          onIncrement: () => updateQuantity(item.id, item.quantity + 1),
          onDecrement: () => updateQuantity(item.id, Math.max(1, item.quantity - 1)),
          min: 1
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "danger",
        onClick: () => removeItem(item.id),
        className: "text-sm self-start mt-2",
        children: "削除"
      }
    )
  ] }) });
};
function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg p-6 max-w-md w-full mx-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mb-4", children: message }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: onClose,
        className: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",
        children: "確認"
      }
    )
  ] }) });
}
function useCart() {
  const [cart, setCart] = useState([]);
  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("Error parsing cart from sessionStorage:", error);
    }
  }, []);
  const updateQuantity = (itemId, newQuantity) => {
    setCart(
      (prevCart) => prevCart.map(
        (item) => item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  const removeItem = (itemId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== itemId);
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };
  return { cart, setCart, updateQuantity, removeItem };
}
function CartRoute() {
  const fetcher = useFetcher();
  const { cart, setCart, updateQuantity, removeItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("Error parsing cart from sessionStorage:", error);
    }
  }, [setCart]);
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (typeof fetcher.data === "object" && fetcher.data !== null) {
        const dataObj = fetcher.data;
        if ("orderId" in dataObj && typeof dataObj.orderId === "string") {
          setModalMessage(`注文完了：${dataObj.orderId}`);
          setIsModalOpen(true);
          setCart([]);
          sessionStorage.setItem("cart", JSON.stringify([]));
        } else if ("error" in dataObj && typeof dataObj.error === "string") {
          toast.error(`注文エラー：${dataObj.error}`);
        }
      }
    }
  }, [fetcher.state, fetcher.data, setCart]);
  let totalPrice = 0;
  for (const item of cart) {
    totalPrice += item.price * item.quantity;
  }
  return /* @__PURE__ */ jsx("div", { className: "m-4 pb-16", children: /* @__PURE__ */ jsx(LayoutConverter, { title: "カート", children: /* @__PURE__ */ jsxs(Fragment, { children: [
    cart.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mb-4", children: "カートは空です。" }) : /* @__PURE__ */ jsx("ul", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: cart.map((item) => /* @__PURE__ */ jsx(
      CartItem,
      {
        item,
        updateQuantity,
        removeItem
      },
      item.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold my-4 bg-blue-50 text-blue-900 p-3 rounded-lg shadow-sm", children: [
      "合計: ",
      totalPrice,
      "円"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center space-x-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => window.location.href = "/menu",
          className: "w-40 text-center",
          children: "メニューに戻る"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "primary",
          onClick: () => {
            fetcher.submit(
              { cart: JSON.stringify(cart) },
              { method: "post", action: "/api/order/route" }
            );
          },
          className: "w-40 text-center",
          children: "注文する"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: isModalOpen,
        onClose: () => {
          setIsModalOpen(false);
          window.location.href = "/orders";
        },
        title: "注文完了",
        message: modalMessage
      }
    ),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] }) }) });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CartRoute
}, Symbol.toStringTag, { value: "Module" }));
const loader = tableIdLoader;
function QRCode() {
  const { tableId } = useLoaderData();
  const qrValue = tableId ? `table:${tableId}` : "no-table-id";
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-100 p-4 pb-16 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsx(LayoutConverter, { title: "QRコード", children: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("p", { className: "text-gray-500 mb-6", children: "レジでこのQRコードを提示してください。" }),
    /* @__PURE__ */ jsx("div", { className: "bg-white p-6 rounded shadow", children: /* @__PURE__ */ jsx(
      QRCodeSVG,
      {
        value: qrValue,
        size: 200,
        includeMargin: true,
        imageSettings: {
          src: "/favicon.ico",
          height: 24,
          width: 24,
          excavate: true
        }
      }
    ) }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] }) }) });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: QRCode,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-SoXNpKyc.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-D7QAYRGI.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/components-lO4o8QF-.js", "/assets/index-CnTOLZ_b.js", "/assets/BottomNav-H0FoXZcW.js"], "css": ["/assets/root-BnIQEi2_.css"] }, "routes/api_.order.route": { "id": "routes/api_.order.route", "parentId": "root", "path": "api/order/route", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/api_.order.route-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/admin.account": { "id": "routes/admin.account", "parentId": "root", "path": "admin/account", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/admin.account-Crc0o67Z.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/BottomNav-H0FoXZcW.js", "/assets/Button-B6jZbV0T.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes/admin._index": { "id": "routes/admin._index", "parentId": "root", "path": "admin", "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/admin._index-BQEZKebW.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/BottomNav-H0FoXZcW.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes/menu.$itemId": { "id": "routes/menu.$itemId", "parentId": "root", "path": "menu/:itemId", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/menu._itemId-zk4_Jr1K.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/index-CnTOLZ_b.js", "/assets/Button-B6jZbV0T.js", "/assets/LayoutConverter-DicA8Lt7.js", "/assets/QuantityControl-C6UAuHbT.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes/menu._index": { "id": "routes/menu._index", "parentId": "root", "path": "menu", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/menu._index-DyUhQ5GV.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/BottomNav-H0FoXZcW.js", "/assets/LayoutConverter-DicA8Lt7.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-C1p2B9x3.js", "imports": ["/assets/index-3MMm0rG7.js"], "css": [] }, "routes/orders": { "id": "routes/orders", "parentId": "root", "path": "orders", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/orders-CI_NZhpo.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/BottomNav-H0FoXZcW.js", "/assets/Button-B6jZbV0T.js", "/assets/LayoutConverter-DicA8Lt7.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes/cart": { "id": "routes/cart", "parentId": "root", "path": "cart", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/cart-D6brk39S.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/index-CnTOLZ_b.js", "/assets/BottomNav-H0FoXZcW.js", "/assets/Button-B6jZbV0T.js", "/assets/QuantityControl-C6UAuHbT.js", "/assets/LayoutConverter-DicA8Lt7.js", "/assets/components-lO4o8QF-.js"], "css": [] }, "routes/qr": { "id": "routes/qr", "parentId": "root", "path": "qr", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/qr-DEZsaaf3.js", "imports": ["/assets/index-3MMm0rG7.js", "/assets/LayoutConverter-DicA8Lt7.js", "/assets/BottomNav-H0FoXZcW.js", "/assets/components-lO4o8QF-.js"], "css": [] } }, "url": "/assets/manifest-6e469b04.js", "version": "6e469b04" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/api_.order.route": {
    id: "routes/api_.order.route",
    parentId: "root",
    path: "api/order/route",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/admin.account": {
    id: "routes/admin.account",
    parentId: "root",
    path: "admin/account",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/admin._index": {
    id: "routes/admin._index",
    parentId: "root",
    path: "admin",
    index: true,
    caseSensitive: void 0,
    module: route3
  },
  "routes/menu.$itemId": {
    id: "routes/menu.$itemId",
    parentId: "root",
    path: "menu/:itemId",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/menu._index": {
    id: "routes/menu._index",
    parentId: "root",
    path: "menu",
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/orders": {
    id: "routes/orders",
    parentId: "root",
    path: "orders",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/cart": {
    id: "routes/cart",
    parentId: "root",
    path: "cart",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/qr": {
    id: "routes/qr",
    parentId: "root",
    path: "qr",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
