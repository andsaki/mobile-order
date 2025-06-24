import { CartItem } from "../types/cartItem";

const item: CartItem = {
  id: "1",
  name: "Test Item",
  price: "100", // Intentional type error: price should be a number, not a string
  quantity: 1,
};
