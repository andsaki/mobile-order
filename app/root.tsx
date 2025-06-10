import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
  useLoaderData,
} from "@remix-run/react";
import toast, { Toaster } from "react-hot-toast";

import "./tailwind.css";
import { getSession, commitSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  let tableId: string | undefined = session.get("tableId");

  console.log("session tableId:", tableId);

  const searchParams = new URL(request.url).searchParams;
  const urlTableId = searchParams.get("tableId");

  if (urlTableId) {
    tableId = urlTableId;
    session.set("tableId", tableId);
    return new Response(JSON.stringify({ tableId }), {
      headers: {
        "Set-Cookie": await commitSession(session),
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify({ tableId }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const error = useRouteError();
  const { tableId } = useLoaderData<typeof loader>();
  const isShowErrorBoundary = error || !tableId;

  const isActive = (path: string) => location.pathname === path;
  return (
    <html lang="en" className="bg-background text-text">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-text">
        {isShowErrorBoundary ? <ErrorBoundary /> : children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200">
          <div className="grid grid-cols-2">
            <Link
              to="/menu"
              className={`p-4 text-center ${
                isActive("/menu")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600"
              } hover:bg-gray-50`}
            >
              メニュー
            </Link>
            <Link
              to="/cart"
              className={`p-4 text-center ${
                isActive("/cart")
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600"
              } hover:bg-gray-50`}
            >
              カート
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function ErrorBoundary() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Oh no!</h1>
      <p>Looks like something went wrong.</p>
    </div>
  );
}
