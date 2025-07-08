const Loading = () => (
  <div className="fixed inset-0 bg-gray-200 bg-opacity-75 flex flex-col justify-center items-center z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-500"></div>
    <p className="text-gray-500 text-lg mt-4">処理中...</p>
  </div>
);

export default Loading;
