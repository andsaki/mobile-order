import React from "react";
import { useLoaderData, Link } from "@remix-run/react";
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
    <div className="rounded-lg p-4 cursor-pointer transition duration-300 bg-white">
      <div className="w-full relative aspect-w-1 aspect-h-1">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-md mt-2 mb-2 square"
        />
      </div>
      <h1 className="text-3xl font-bold my-4">{item.name}</h1>
      <p className="mb-4">{item.description}</p>
      <p className="mb-4">{item.price}円</p>
      <Link
        to="/menu"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        戻る
      </Link>
    </div>
  );
}
