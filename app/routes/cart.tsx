import { Link } from "@remix-run/react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartRoute() {
  let cart: CartItem[] = [];
  try {
    cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  } catch (error) {
    console.error("Error parsing cart from sessionStorage:", error);
  }

  let totalPrice = 0;
  for (const item of cart) {
    totalPrice += item.price * item.quantity;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold my-4">カート</h1>
      {cart.length === 0 ? (
        <p>カートは空です。</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id} className="mb-4">
              <p>{item.name}</p>
              <p>
                数量: {item.quantity}
                単価: {item.price}円 小計: {item.price * item.quantity}円
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xl font-bold my-4">合計: {totalPrice}円</p>
      <Link
        to="/menu"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        メニューに戻る
      </Link>
    </div>
  );
}
