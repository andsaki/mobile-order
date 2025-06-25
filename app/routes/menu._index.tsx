import { TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import BottomNav from "~/components/BottomNav";
import LayoutConverter from "~/components/LayoutConverter";
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
      <LayoutConverter title="メニュー">
        <>
          <Menu menuData={menu} />
          <BottomNav />
        </>
      </LayoutConverter>
    </div>
  );
}
