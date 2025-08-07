import { describe, it, expect, vi, afterEach, Mock } from "vitest";

import { CATEGORIES_API_ENDPOINT } from "../../constants/api";
import { fetchJson } from "../business/fetchJson";

import { fetchItems, fetchMenuData } from "./api.server";

// fetchJsonのモック
vi.mock("../business/fetchJson", () => ({
  fetchJson: vi.fn(),
}));

describe("api.server.ts", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchItems", () => {
    it("アイテムデータを正しく取得できること", async () => {
      const mockItems = [{ id: "1", name: "Item 1" }];
      (fetchJson as Mock).mockResolvedValueOnce({ contents: mockItems });

      const items = await fetchItems();
      expect(items).toEqual(mockItems);
      expect(fetchJson).toHaveBeenCalledTimes(1);
      expect(fetchJson).toHaveBeenCalledWith(expect.any(String));
    });

    it("API呼び出しが失敗した場合にエラーをスローすること", async () => {
      const errorMessage = "API Error";
      (fetchJson as Mock).mockRejectedValueOnce(new Error(errorMessage));

      await expect(fetchItems()).rejects.toThrow(errorMessage);
      expect(fetchJson).toHaveBeenCalledTimes(1);
    });
  });

  describe("fetchMenuData", () => {
    it("メニューアイテムとカテゴリーデータを正しく取得できること", async () => {
      const mockMenuItems = [{ id: "m1", name: "Menu Item 1" }];
      const mockCategories = [{ id: "c1", name: "Category 1" }];

      (fetchJson as Mock)
        .mockResolvedValueOnce({ contents: mockMenuItems })
        .mockResolvedValueOnce({ contents: mockCategories });

      const response = await fetchMenuData();
      const data = await response.json();

      expect(data.items).toEqual(mockMenuItems);
      expect(data.categories).toEqual(mockCategories);
      expect(fetchJson).toHaveBeenCalledTimes(2);
      expect(fetchJson).toHaveBeenCalledWith(expect.any(String));
      expect(fetchJson).toHaveBeenCalledWith(CATEGORIES_API_ENDPOINT);
    });

    it("API呼び出しが失敗した場合にエラーをスローすること", async () => {
      const errorMessage = "Menu API Error";
      (fetchJson as Mock).mockRejectedValueOnce(new Error(errorMessage));

      await expect(fetchMenuData()).rejects.toThrow(errorMessage);
      expect(fetchJson).toHaveBeenCalledTimes(2);
    });
  });
});
