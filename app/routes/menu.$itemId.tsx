import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import toast from "react-hot-toast";

import Button from "~/components/Button";
import { CartItem } from "~/types/cartItem";
import Item from "~/types/item";

const API_ENDPOINT = "https://andsakiapi.microcms.io/api/v1/items";
const API_KEY = "KOjYGzOL5TlpVlL8YAZdxka6KEPLlDaBtPW2";

export async function loader({ params }: { params: { itemId: string } }) {
  const itemId = params.itemId;
  const response = await fetch(`${API_ENDPOINT}/${itemId}`, {
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Response("Not Found", { status: response.status });
  }

  const item = await response.json();

  return item;
}

export default function MenuItemRoute() {
  const item = useLoaderData<Item>();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="rounded-lg p-4 cursor-pointer transition duration-300 bg-white">
      <div className="w-full relative aspect-w-1 aspect-h-1">
        <img
          src={item.image.url}
          alt={item.name}
          className="w-full h-full object-cover rounded-md mt-2 mb-2 square"
        />
      </div>
      <h1 className="text-3xl font-bold my-4">{item.name}</h1>
      <p className="mb-4 text-gray-500">{item.description}</p>
      <p className="mb-4 text-black font-bold text-lg">{item.price}円</p>
      <div className="mb-12">
        <label htmlFor="quantity" className="mr-2">
          数量:
        </label>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setQuantity(quantity - 1)}
        >
          -
        </Button>
        <span className="w-20 border rounded px-2 py-1 mx-2">{quantity}</span>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setQuantity(quantity + 1)}
        >
          +
        </Button>
      </div>
      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={() => {
            addToCart(item, quantity);
          }}
          className="mr-4"
        >
          カートに入れる
        </Button>
        <Button
          variant="primary"
          onClick={() => (window.location.href = "/menu")}
        >
          戻る
        </Button>
      </div>
    </div>
  );
}

/**
 * カートに入れるボタン
 * @param item
 * @param quantity
 */
function addToCart(item: Item, quantity: number) {
  const cart: CartItem[] = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const existingItemIndex = cart.findIndex(
    (cartItem) => cartItem.id === item.id
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
    });
  }

  sessionStorage.setItem("cart", JSON.stringify(cart));
  toast.success(`${item.name}をカートに追加しました！`);
}
