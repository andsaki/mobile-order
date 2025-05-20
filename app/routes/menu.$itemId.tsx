import React from "react";
import { useLoaderData } from "@remix-run/react";
import { useActionData } from "@remix-run/react";
import menuData from "~/data/menu.json";

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

export async function loader({ params }: { params: { itemId: string } }) {
  const itemId = params.itemId;
  const item = menuData.items.find((item) => item.id === itemId);

  if (!item) {
    throw new Response("Not Found", { status: 404 });
  }

  return new Response(JSON.stringify(item, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default function MenuItemRoute() {
  console.log("呼ばれた");
  const item = useLoaderData<MenuItem>();

  return (
    <div>
      <h1>{item.name}</h1>
      <p>{item.description}</p>
      <p>{item.price}円</p>
      <img src={item.image} alt={item.name} />
    </div>
  );
}
