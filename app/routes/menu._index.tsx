import Menu, { MenuItem, Category } from "~/components/Menu";
import { json, TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

interface ApiResponse<T> {
  contents: T[];
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

  const itemData = (await itemResponse.json()) as ApiResponse<MenuItem>;
  const items: MenuItem[] = itemData.contents;

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

  const categoryData = (await categoryResponse.json()) as ApiResponse<Category>;
  const categories: Category[] = categoryData.contents;

  return json({ categories, items });
}

import BottomNav from "~/components/BottomNav";

export default function MenuRoute() {
  const menu = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4 pb-16">
      <h1 className="text-3xl font-bold mb-4">メニュー</h1>
      <Menu menuData={menu} />
      <BottomNav />
    </div>
  );
}
