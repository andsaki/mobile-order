import menuData from "~/data/menu.json";

export async function loader() {
  return new Response(JSON.stringify(menuData, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
