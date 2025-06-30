import { json, type ActionFunction } from "@remix-run/node";

import { CartItem } from "~/features/cart/types/cartItem";
import { placeOrder } from "~/features/order/utils/order.server";
import {
  commitSession,
  getSession,
  getCartFromSession,
  getTableIdFromSession,
} from "~/utils/business/session.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  let cart: CartItem[] = [];
  let session;
  const formData = await request.formData();
  const cartData = formData.get("cart");
  const tableId = formData.get("tableId");
  if (cartData !== null && typeof cartData === "string") {
    try {
      cart = JSON.parse(cartData) as CartItem[];
    } catch (error) {
      console.error("Error parsing cart data from request:", error);
      return json({ error: "Invalid cart data" }, { status: 400 });
    }
  } else {
    session = await getSession(request.headers.get("Cookie"));
    cart = getCartFromSession(session);
    session.set("cart", []);
  }

  if (!session) {
    session = await getSession(request.headers.get("Cookie"));
  }
  const sessionTableId = getTableIdFromSession(session);
  console.log("Session tableId:", sessionTableId);

  const finalTableId =
    tableId && typeof tableId === "string" && tableId.trim() !== ""
      ? tableId
      : sessionTableId || "";

  const result = await placeOrder(cart, finalTableId);

  if ("error" in result) {
    return json({ error: result.error }, { status: result.status });
  }

  return json(
    {
      message: result.message,
      orderId: result.orderId,
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
