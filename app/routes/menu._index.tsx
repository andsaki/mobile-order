import Menu from "~/components/Menu";
import { json, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MenuItem, Category } from "~/components/Menu";

interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

const API_KEY = "KOjYGzOL5TlpVlL8YAZdxka6KEPLlDaBtPW2";

export async function loader(): Promise<TypedResponse<MenuData>> {
  const itemResponse = await fetch(
    "https://andsakiapi.microcms.io/api/v1/items",
    {
      headers: {
        "Content-Type": "application/json",
        "X-MICROCMS-API-KEY": API_KEY,
      },
    }
  );

  if (!itemResponse.ok) {
    throw new Error(`API request failed with status ${itemResponse.status}`);
  }

  const items: MenuItem[] = (await itemResponse.json()).contents;

  const categoryResponse = await fetch(
    "https://andsakiapi.microcms.io/api/v1/categories",
    {
      headers: {
        "Content-Type": "application/json",
        "X-MICROCMS-API-KEY": API_KEY,
      },
    }
  );

  if (!itemResponse.ok) {
    throw new Error(
      `API request failed with status ${categoryResponse.status}`
    );
  }

  const categories: MenuItem[] = (await categoryResponse.json()).contents;

  return json({ categories, items });
}

export default function MenuRoute() {
  const menu = useLoaderData<typeof loader>();
  console.log("menu:", menu);
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold mb-4">メニュー</h1>
      <Menu menuData={menu} />
    </div>
  );
}
