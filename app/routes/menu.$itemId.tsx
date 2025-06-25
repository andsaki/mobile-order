import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import toast from "react-hot-toast";

import Button from "~/components/Button";
import LayoutConverter from "~/components/LayoutConverter";
import QuantityControl from "~/components/QuantityControl";
import { API_ENDPOINT, API_KEY } from "~/constants/api";
import { CartItem } from "~/types/cartItem";
import Item from "~/types/item";

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

  const item = (await response.json()) as Item;

  return item;
}

export default function MenuItemRoute() {
  const item = useLoaderData<Item>();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="rounded-lg p-4 cursor-pointer transition duration-300">
      <LayoutConverter title={item.name}>
        <>
          <div className="w-full relative aspect-w-1 aspect-h-1">
            <img
              src={item.image.url}
              alt={item.name}
              className="w-full h-full object-cover rounded-md mt-2 mb-8 square"
            />
          </div>
          <div className="bg-white p-4 rounded shadow mb-4">
            <p className="mb-4 text-gray-500">{item.description}</p>
            <p className="mb-4 text-black font-bold text-lg">{item.price}円</p>
            <div>
              <label htmlFor="quantity" className="mr-2">
                数量:
              </label>
              <QuantityControl
                quantity={quantity}
                onIncrement={() => setQuantity(quantity + 1)}
                onDecrement={() => setQuantity(quantity - 1)}
                min={1}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={() => {
                addToCart(item, quantity);
              }}
              className="mr-4"
              disabled={quantity < 1}
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
        </>
      </LayoutConverter>
    </div>
  );
}

/**
 * カートに入れるボタン
 * @param item
 * @param quantity
 */
function addToCart(item: Item, quantity: number) {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]") as CartItem[];
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
