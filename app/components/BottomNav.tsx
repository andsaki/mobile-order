import { Link, useLocation } from "@remix-run/react";

import { MENU } from "~/constants/pages";

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white flex justify-around py-2 px-4 max-w-md mx-auto">
      <Link
        to={MENU}
        className={`flex flex-col items-center text-xs px-4 py-2 ${
          location.pathname === MENU ? "text-blue-400" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-7 w-7 mb-1 ${
            location.pathname === MENU ? "stroke-blue-400" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6M4 14h16M4 18h16"
          />
        </svg>
        メニュー
      </Link>
      <Link
        to="/cart"
        className={`flex flex-col items-center text-xs px-4 py-2 ${
          location.pathname === "/cart" ? "text-blue-400" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-7 w-7 mb-1 ${
            location.pathname === "/cart" ? "stroke-blue-400" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        カート
      </Link>
      <Link
        to="/orders"
        className={`flex flex-col items-center text-xs px-4 py-2 ${
          location.pathname === "/orders" ? "text-blue-400" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-7 w-7 mb-1 ${
            location.pathname === "/orders" ? "stroke-blue-400" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        履歴
      </Link>
    </nav>
  );
}
