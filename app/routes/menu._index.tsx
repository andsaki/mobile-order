import { TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import BottomNav from "~/components/BottomNav";
import Menu, { MenuItem, Category } from "~/components/Menu";
import { fetchMenuData } from "~/utils/domain/api.server";

interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

export async function loader(): Promise<TypedResponse<MenuData>> {
  return await fetchMenuData<MenuItem, Category>();
}

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
