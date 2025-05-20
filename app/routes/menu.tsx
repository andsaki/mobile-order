import Menu from "~/components/Menu";
import { useLoaderData } from "@remix-run/react";
import menuData from "~/data/menu.json";

export async function loader() {
  return new Response(JSON.stringify(menuData, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
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
