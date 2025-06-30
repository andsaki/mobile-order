// app/utils/fetchJson.ts (サーバー専用)
import { API_KEY } from "./api";

/**
 * URLからJSONデータを取得する汎用関数
 * @param url 取得するデータのURL
 * @returns 指定された型TのPromise
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-MICROCMS-API-KEY": API_KEY,
    },
  });
  if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
  return (await res.json()) as T;
}
