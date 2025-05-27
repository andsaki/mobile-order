import { Link } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import QuantityControl from "~/components/QuantityControl";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartRoute() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("cart") || "[]");
    } catch (error) {
      console.error("Error parsing cart from sessionStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [setCart]
  );

  let totalPrice = 0;
  for (const item of cart) {
    totalPrice += item.price * item.quantity;
  }

  return (
    <div className="m-4">
      <h1 className="text-2xl font-bold">カート</h1>
      {cart.length === 0 ? (
        <p className="mb-4">カートは空です。</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cart.map((item) => (
            <li
              key={item.id}
              className="rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition duration-300 bg-white"
            >
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="text-gray-800">
                  単価: {item.price}円 小計: {item.price * item.quantity}円
                </p>
                <QuantityControl
                  quantity={item.quantity}
                  onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrement={() =>
                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  min={1}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xl font-bold my-4">合計: {totalPrice}円</p>
      <div className="flex justify-center">
        <Link
          to="/menu"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          メニューに戻る
        </Link>
      </div>
    </div>
  );
}
