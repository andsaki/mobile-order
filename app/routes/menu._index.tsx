import { TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import BottomNav from "~/components/BottomNav";
import LayoutConverter from "~/components/LayoutConverter";
import Menu from "~/features/menu/component/Menu";
import { MenuItem, Category } from "~/features/menu/types/item";
import { MenuData } from "~/features/menu/types/menu";
import { commitSession, getSession } from "~/utils/business/session.server";
import { fetchMenuData } from "~/utils/domain/api.server";

export async function loader({
  request,
}: {
  request: Request;
}): Promise<TypedResponse<MenuData>> {
  const session = await getSession(request.headers.get("Cookie"));
  const url = new URL(request.url);
  const tableId = url.searchParams.get("tableId");

  if (tableId) {
    session.set("tableId", tableId);
  }

  const response = await fetchMenuData<MenuItem, Category>();

  if (tableId) {
    response.headers.set("Set-Cookie", await commitSession(session));
  }

  return response;
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
