import React from "react";

import { CartItem as CartItemType } from "~/features/cart/types/cartItem";

import Button from "../../../components/Button";
import QuantityControl from "../../../components/QuantityControl";

interface CartItemProps {
  item: CartItemType;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  updateQuantity,
  removeItem,
}) => {
  return (
    <li className="rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition duration-300">
      <div className="flex justify-between">
        <div className="flex flex-col space-y-2">
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
        <Button
          variant="danger"
          onClick={() => removeItem(item.id)}
          className="text-sm self-start mt-2"
        >
          削除
        </Button>
      </div>
    </li>
  );
};

export default CartItem;
