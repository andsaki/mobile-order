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
    <div>
      <h1>メニュー</h1>
      <Menu menuData={menu} />
    </div>
  );
}
