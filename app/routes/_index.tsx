import type { MetaFunction } from "@remix-run/node";
import { useSearchParams, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Mobile Order" },
    { name: "description", content: "Mobile Order App" },
  ];
};

// インデックスルートコンポーネント
export default function Index() {
  // URLから検索パラメータを取得
  const [searchParams] = useSearchParams();
  // 検索パラメータからtableIdを取得
  const tableId = searchParams.get("tableId");
  // Remixからnavigate関数を取得
  const navigate = useNavigate();

  // tableIdが存在しない場合はエラーを投げる
  if (!tableId) {
    throw new Error("Table ID is required");
  }

  // tableIdが存在する場合はカートページにリダイレクト
  useEffect(() => {
    navigate(`/cart?tableId=${tableId}`);
  }, [tableId, navigate]);

  // リダイレクトメッセージを表示
  return (
    <div>
      <h1>Redirecting...</h1>
    </div>
  );
}
