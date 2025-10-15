import { useLoaderData, useFetcher } from "@remix-run/react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";

import BottomNav from "~/components/BottomNav";
import Button from "~/components/Button";
import LayoutConverter from "~/components/LayoutConverter";
import { API_DELETE_ORDERS } from "~/constants/api";
import { MENU } from "~/constants/pages";
import { useLoading } from "~/contexts/LoadingContext";
import {
  tableIdLoader,
  type TableIdData,
} from "~/utils/session.server";

export const loader = tableIdLoader;

export default function QRCode() {
  const { tableId } = useLoaderData<TableIdData>();
  const fetcher = useFetcher();
  const { setLoading } = useLoading();
  const qrValue = tableId ? `table:${tableId}` : "no-table-id";

  // 支払い完了処理: 注文履歴を削除し、メニュー画面に戻る
  const handlePaymentComplete = () => {
    setLoading(true);
    fetcher.submit(
      {},
      {
        method: "post",
        action: API_DELETE_ORDERS,
      }
    );
  };

  // fetcherの状態を監視して、処理が完了したらメニュー画面に遷移
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      window.location.href = MENU;
    }
  }, [fetcher.state, fetcher.data, setLoading]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16 flex flex-col items-center justify-center">
      <LayoutConverter title="QRコード">
        <>
          <p className="text-gray-500 mb-6">
            レジでこのQRコードを提示してください。
          </p>
          <div className="bg-white p-6 rounded shadow">
            <QRCodeSVG
              value={qrValue}
              size={200}
              includeMargin={true}
              imageSettings={{
                src: "/favicon.ico",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          <div className="mt-6">
            {/* 支払い完了ボタン: 支払いが完了した後に注文履歴を削除するAPIを呼び出す */}
            <Button
              variant="primary"
              onClick={handlePaymentComplete}
              className="w-40 text-center"
              disabled={fetcher.state === "submitting"}
            >
              {fetcher.state === "submitting" ? "処理中..." : "支払い完了"}
            </Button>
          </div>
          <BottomNav />
        </>
      </LayoutConverter>
    </div>
  );
}
