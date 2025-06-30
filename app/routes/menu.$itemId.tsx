import { useLoaderData } from "@remix-run/react";
import { useState } from "react";

import Button from "~/components/Button";
import LayoutConverter from "~/components/LayoutConverter";
import QuantityControl from "~/components/QuantityControl";
import { API_ENDPOINT } from "~/constants/api";
import { useCart } from "~/features/cart/hooks/useCart";
import { MenuItem } from "~/features/menu/types/item";
import { fetchJson } from "~/utils/business/fetchJson";

export async function loader({ params }: { params: { itemId: string } }) {
  const itemId = params.itemId;
  const item = await fetchJson<MenuItem>(`${API_ENDPOINT}/${itemId}`);

  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }

  return item;
}

export default function MenuItemRoute() {
  const item = useLoaderData<MenuItem>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: quantity,
                });
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
