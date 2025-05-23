import Menu from "~/components/Menu";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import menuData from "~/data/menu.json";

export async function loader() {
  return json(menuData);
}

export default function MenuRoute() {
  const menu = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-3xl font-bold 2mb-">メニュー</h1>
      <Menu menuData={menu} />
    </div>
  );
}
