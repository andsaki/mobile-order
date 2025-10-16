import { useRouteError, isRouteErrorResponse } from "@remix-run/react";
import React from "react";

interface ErrorBoundaryProps {
  error?: unknown;
  resetErrorBoundary?: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error: propError,
  resetErrorBoundary,
}) => {
  let routeError;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    routeError = useRouteError();
  } catch {
    // Storybook環境ではuseRouteErrorが使えないため無視
    routeError = undefined;
  }
  const error = propError || routeError;

  const getErrorMessage = () => {
    if (isRouteErrorResponse(error)) {
      return {
        title: `${error.status} ${error.statusText}`,
        message: error.data?.message || "ページが見つかりませんでした",
        status: error.status,
      };
    }

    if (error instanceof Error) {
      return {
        title: "エラーが発生しました",
        message: error.message || "予期しないエラーが発生しました",
        status: 500,
      };
    }

    return {
      title: "エラーが発生しました",
      message: "予期しないエラーが発生しました",
      status: 500,
    };
  };

  const { title, message, status } = getErrorMessage();

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = "/menu";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-1">{message}</p>
          {status && (
            <p className="text-sm text-gray-400">エラーコード: {status}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            再読み込み
          </button>
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            メニューに戻る
          </button>
        </div>

        {process.env.NODE_ENV === "development" && error instanceof Error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              開発者向け情報
            </summary>
            <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto max-h-40 text-gray-700">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
