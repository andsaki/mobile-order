import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  useLoaderData,
} from "@remix-run/react";
import { Toaster } from "react-hot-toast";

import { tableIdLoader } from "~/utils/session.server";
import "./tailwind.css";
import { type TableIdData } from "~/utils/session.server";

import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";
import { LoadingProvider } from "./contexts/LoadingContext";

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
  const error = useRouteError();
  return (
    <html lang="en" className="bg-background text-text">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-text">
        {error !== undefined && error !== null ? (
          <ErrorBoundary />
        ) : (
          <LoadingProvider>
            <AppContent>{children}</AppContent>
            <Loading />
          </LoadingProvider>
        )}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// エラーバウンダリ内でuseLoaderDataを使用しないためのラッパーコンポーネント
// tableIdを確認し、存在しない場合はエラーバウンダリを表示、存在する場合は子コンポーネントを表示する
function AppContent({ children }: { children: React.ReactNode }) {
  const { tableId } = useLoaderData<TableIdData>();
  if (tableId === undefined || tableId === "") {
    return <ErrorBoundary />;
  }
  return <>{children}</>;
}

export default function App() {
  return <Outlet />;
}

export { ErrorBoundary };
