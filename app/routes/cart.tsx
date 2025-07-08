import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import BottomNav from "~/components/BottomNav";
import Button from "~/components/Button";
import LayoutConverter from "~/components/LayoutConverter";
import Modal from "~/components/Modal";
import CartItem from "~/features/cart/component/CartItem";
import { useCart } from "~/features/cart/hooks/useCart";

export default function CartRoute() {
  const fetcher = useFetcher();
  const { cart, setCart, updateQuantity, removeItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // `useCart` フックがカートデータを管理するため、ここでの手動読み込みは不要

  // 注文APIのレスポンスを監視し、成功した場合にモーダルを表示し注文一覧ページへ遷移する
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // 型安全にプロパティの存在を確認
      if (typeof fetcher.data === "object" && fetcher.data !== null) {
        // 型ガードを使用してプロパティの存在を確認
        const dataObj = fetcher.data;
        if ("orderId" in dataObj && typeof dataObj.orderId === "string") {
          setModalMessage(`注文完了：${dataObj.orderId}`);
          setIsModalOpen(true);
          // カートをクリアするなどのUI更新処理をここに追加可能
          setCart([]);
          sessionStorage.setItem("cart", JSON.stringify([]));
        } else if ("error" in dataObj && typeof dataObj.error === "string") {
          setTimeout(() => {
            toast.error(`注文エラー：${String(dataObj.error)}`);
          }, 0);
        }
      }
    }
  }, [fetcher.state, fetcher.data, setCart]); // fetcherの状態とデータが変化するたびにこの効果を実行

  let totalPrice = 0;
  for (const item of cart) {
    totalPrice += item.price * item.quantity;
  }

  return (
    <div className="m-4 pb-16">
      <LayoutConverter title="カート">
        <>
          {cart.length === 0 ? (
            <p className="mb-4">カートは空です。</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </ul>
          )}
          <div className="text-xl font-bold my-4 bg-blue-50 text-blue-900 p-3 rounded-lg shadow-sm">
            合計: {totalPrice}円
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              variant="primary"
              onClick={() => (window.location.href = "/menu")}
              className="w-40 text-center"
            >
              メニューに戻る
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                try {
                  fetcher.submit(
                    { cart: JSON.stringify(cart) },
                    {
                      method: "post",
                      action: "/api/order/route",
                    }
                  );
                } catch (error) {
                  console.error("注文処理中にエラーが発生しました:", error);
                  setTimeout(() => {
                    toast.error(
                      "注文処理中にエラーが発生しました。もう一度お試しください。"
                    );
                  }, 0);
                }
              }}
              className="w-40 text-center"
            >
              注文する
            </Button>
          </div>
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              window.location.href = "/orders";
            }}
            title="注文完了"
            message={modalMessage}
          />
          <BottomNav />
        </>
      </LayoutConverter>
    </div>
  );
}
