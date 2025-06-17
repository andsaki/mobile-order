import { json, type ActionFunction } from "@remix-run/node";
import { commitSession, getSession } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  console.log("よばれた");
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  let cart = [];
  let session;
  const formData = await request.formData();
  const cartData = formData.get("cart");

  if (cartData && typeof cartData === "string") {
    try {
      cart = JSON.parse(cartData);
    } catch (error) {
      console.error("Error parsing cart data from request:", error);
      return json({ error: "Invalid cart data" }, { status: 400 });
    }
  } else {
    session = await getSession(request.headers.get("Cookie"));
    cart = session.get("cart") || [];
    session.set("cart", []);
  }

  if (cart.length === 0) {
    return json({ error: "Cart is empty" }, { status: 400 });
  }

  // Here you would typically process the order, e.g., save to a database
  // For this example, we'll just clear the cart and return a success message
  if (!session) {
    session = await getSession(request.headers.get("Cookie"));
  }

  return json(
    {
      message: "Order placed successfully",
      orderId: "ORD-" + Math.floor(Math.random() * 10000),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
