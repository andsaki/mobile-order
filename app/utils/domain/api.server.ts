// app/utils/domain/api.server.ts (サーバー専用)
import { json, TypedResponse } from "@remix-run/node";

const API_KEY = "KOjYGzOL5TlpVlL8YAZdxka6KEPLlDaBtPW2";

interface ApiResponse<T> {
  contents: T[];
}

/**
 * microCMSからメニューアイテムとカテゴリーデータを取得するユーティリティ関数
 * @returns メニューアイテムとカテゴリーデータを含むTypedResponse
 */
export async function fetchMenuData<MenuItem, Category>(): Promise<
  TypedResponse<{ categories: Category[]; items: MenuItem[] }>
> {
  const [itemResponse, categoryResponse] = await Promise.all([
    fetch("https://andsakiapi.microcms.io/api/v1/items", {
      headers: {
        "Content-Type": "application/json",
        "X-MICROCMS-API-KEY": API_KEY,
      },
    }),
    fetch("https://andsakiapi.microcms.io/api/v1/categories", {
      headers: {
        "Content-Type": "application/json",
        "X-MICROCMS-API-KEY": API_KEY,
      },
    }),
  ]);

  if (!itemResponse.ok) {
    throw new Error(
      `Items API request failed with status ${itemResponse.status}`
    );
  }

  if (!categoryResponse.ok) {
    throw new Error(
      `Categories API request failed with status ${categoryResponse.status}`
    );
  }

  const itemData = (await itemResponse.json()) as ApiResponse<MenuItem>;
  const items: MenuItem[] = itemData.contents;

  const categoryData = (await categoryResponse.json()) as ApiResponse<Category>;
  const categories: Category[] = categoryData.contents;

  return json({ categories, items });
}
