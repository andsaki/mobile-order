type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

/**
 * 確認モーダルコンポーネント
 * @param isOpen - モーダルが開いているかどうか
 * @param onClose - モーダルを閉じるための関数
 * @param title - モーダルのタイトル
 * @param message - モーダルのメッセージ
 */
export default function Modal({ isOpen, onClose, title, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          確認
        </button>
      </div>
    </div>
  );
}
