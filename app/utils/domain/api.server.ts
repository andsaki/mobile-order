// app/utils/domain/api.server.ts (サーバー専用)
import { json, TypedResponse } from "@remix-run/node";

import { fetchJson } from "../business/fetchJson";

interface ApiResponse<T> {
  contents: T[];
}

/**
 * microCMSからメニューアイテムとカテゴリーデータを取得するユーティリティ関数
 * @returns メニューアイテムとカテゴリーデータを含むTypedResponse
 */
/**
 * microCMSからアイテムデータを取得するユーティリティ関数
 * @returns アイテムデータを含むPromise<Item[]>
 */
export async function fetchItems<Item>(): Promise<Item[]> {
  const itemData = await fetchJson<ApiResponse<Item>>(
    "https://andsakiapi.microcms.io/api/v1/items"
  );
  return itemData.contents;
}

/**
 * microCMSからメニューアイテムとカテゴリーデータを取得するユーティリティ関数
 * @returns メニューアイテムとカテゴリーデータを含むTypedResponse
 */
export async function fetchMenuData<MenuItem, Category>(): Promise<
  TypedResponse<{ categories: Category[]; items: MenuItem[] }>
> {
  const [itemData, categoryData] = await Promise.all([
    fetchJson<ApiResponse<MenuItem>>(
      "https://andsakiapi.microcms.io/api/v1/items"
    ),
    fetchJson<ApiResponse<Category>>(
      "https://andsakiapi.microcms.io/api/v1/categories"
    ),
  ]);

  const items: MenuItem[] = itemData.contents;
  const categories: Category[] = categoryData.contents;

  return json({ categories, items });
}
