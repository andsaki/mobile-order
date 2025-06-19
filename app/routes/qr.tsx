import BottomNav from "~/components/BottomNav";

export default function QRCode() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-16 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">QRコード</h1>
      <p className="text-gray-500 mb-6">
        レジでこのQRコードを提示してください。
      </p>
      <div className="bg-white p-6 rounded shadow">
        <img
          src="https://via.placeholder.com/200x200?text=QR+Code"
          alt="QR Code"
          className="w-48 h-48"
        />
      </div>
      <BottomNav />
    </div>
  );
}
