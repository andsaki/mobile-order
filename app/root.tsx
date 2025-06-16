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
import { Toaster } from "react-hot-toast";

import "./tailwind.css";
import { tableIdLoader, type TableIdData } from "~/utils/session.server";

export const loader = tableIdLoader;

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
        {error ? <ErrorBoundary /> : <AppContent children={children} />}
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

// エラーバウンダリ内でuseLoaderDataを使用しないためのラッパーコンポーネント
// tableIdを確認し、存在しない場合はエラーバウンダリを表示、存在する場合は子コンポーネントを表示する
function AppContent({ children }: { children: React.ReactNode }) {
  const { tableId } = useLoaderData<TableIdData>();
  if (!tableId) {
    return <ErrorBoundary />;
  }
  return <>{children}</>;
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
