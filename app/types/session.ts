import { CartItem } from "~/features/cart/types/cartItem";

export interface SessionData {
  cart: CartItem[];
  tableId: string;
}
