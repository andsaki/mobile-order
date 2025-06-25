import { useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import BottomNav from "~/components/BottomNav";
import Button from "~/components/Button";
import CartItem from "~/components/CartItem";
import Modal from "~/components/Modal";
import { useCart } from "~/hooks/useCart";
import { CartItem as CartItemType } from "~/types/cartItem";

export default function CartRoute() {
  const fetcher = useFetcher();
  const { cart, setCart, updateQuantity, removeItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as CartItemType[];
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("Error parsing cart from sessionStorage:", error);
    }
  }, [setCart]);

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
          toast.error(`注文エラー：${dataObj.error}`);
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
      <h1 className="text-2xl font-bold mb-4">カート</h1>
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
      <p className="text-xl font-bold my-4 bg-yellow-400 text-black p-2 rounded-md">
        合計: {totalPrice}円
      </p>
      <div className="flex justify-center space-x-4">
        <Button
          variant="primary"
          onClick={() => (window.location.href = "/menu")}
        >
          メニューに戻る
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            fetcher.submit(
              { cart: JSON.stringify(cart) },
              { method: "post", action: "/api/order/route" }
            );
          }}
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
    </div>
  );
}
