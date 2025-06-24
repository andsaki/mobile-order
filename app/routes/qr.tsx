import { useLoaderData } from "@remix-run/react";
import { QRCodeSVG } from "qrcode.react";

import BottomNav from "~/components/BottomNav";
import { tableIdLoader, type TableIdData } from "~/utils/session.server";

export const loader = tableIdLoader;

export default function QRCode() {
  const { tableId } = useLoaderData<TableIdData>();
  const qrValue = tableId ? `table:${tableId}` : "no-table-id";

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">QRコード</h1>
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
      <BottomNav />
    </div>
  );
}
