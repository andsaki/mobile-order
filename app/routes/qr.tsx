import { useLoaderData, useFetcher } from "@remix-run/react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";

import BottomNav from "~/components/BottomNav";
import Button from "~/components/Button";
import LayoutConverter from "~/components/LayoutConverter";
import {
  tableIdLoader,
  type TableIdData,
} from "~/utils/business/session.server";

export const loader = tableIdLoader;

export default function QRCode() {
  const { tableId } = useLoaderData<TableIdData>();
  const fetcher = useFetcher();
  const qrValue = tableId ? `table:${tableId}` : "no-table-id";

  // 支払い完了処理: 注文履歴を削除し、メニュー画面に戻る
  const handlePaymentComplete = () => {
    fetcher.submit(
      {},
      {
        method: "post",
        action: "/api/delete-orders",
      }
    );
    setTimeout(() => {
      toast.success("注文履歴が削除されました。");
      window.location.href = "/menu";
    }, 500);
  };

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
            >
              支払い完了
            </Button>
          </div>
          <BottomNav />
        </>
      </LayoutConverter>
    </div>
  );
}
