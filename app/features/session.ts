// types/session.ts
import { CartItem } from "~/types/cartItem";

declare module "@remix-run/node" {
  interface SessionData {
    cart: CartItem[];
    isAdmin: boolean;
  }
}
