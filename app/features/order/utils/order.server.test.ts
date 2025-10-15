import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { placeOrder } from "./order.server";

// Supabaseクライアントのモック
const mockInsert = vi.fn();
const mockUpsert = vi.fn();
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  upsert: mockUpsert,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("order.server", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("placeOrder", () => {
    it("カートが空の場合にエラーを返すこと", async () => {
      const result = await placeOrder([], "T1");

      expect(result).toEqual({
        error: "Cart is empty",
        status: 400,
      });
    });

    it("テーブルIDが空の場合にエラーを返すこと", async () => {
      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];
      const result = await placeOrder(cart, "");

      expect(result).toEqual({
        error: "テーブルIDが必要です。QRコードをスキャンしてください。",
        status: 400,
      });
    });

    it("Supabase URLが設定されていない場合にダミーの注文IDを返すこと", async () => {
      process.env.SUPABASE_URL = "";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];
      const result = await placeOrder(cart, "T1");

      expect(result).toMatchObject({
        message: "Order placed successfully (dummy)",
        orderId: expect.stringContaining("DUMMY-ORD-"),
      });
    });

    it("Supabase Anon Keyが設定されていない場合にエラーを返すこと", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];
      const result = await placeOrder(cart, "T1");

      expect(result).toEqual({
        error: "データベース接続エラー: Supabase Anon Keyが設定されていません",
        status: 500,
      });
    });

    it("無効なSupabase URLの場合にエラーを返すこと", async () => {
      process.env.SUPABASE_URL = "invalid-url";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];
      const result = await placeOrder(cart, "T1");

      expect(result).toEqual({
        error: "データベース接続エラー: Supabase URLの形式が無効です",
        status: 500,
      });
    });

    it("注文が正常に処理されること", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

      mockInsert.mockResolvedValueOnce({ data: {}, error: null });
      mockUpsert.mockResolvedValueOnce({ data: {}, error: null });

      const result = await placeOrder(cart, "T1");

      expect(result).toMatchObject({
        message: "Order placed successfully",
        orderId: expect.stringContaining("ORD-"),
      });
      expect(mockFrom).toHaveBeenCalledWith("orders");
      expect(mockInsert).toHaveBeenCalledWith([
        expect.objectContaining({
          cart_items: cart,
          table_id: "T1",
          status: "pending",
        }),
      ]);
      expect(mockFrom).toHaveBeenCalledWith("tables");
      expect(mockUpsert).toHaveBeenCalledWith([
        expect.objectContaining({
          table_id: "T1",
          status: "occupied",
        }),
      ]);
    });

    it("注文の保存に失敗した場合にエラーを返すこと", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

      mockInsert.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" },
      });

      const result = await placeOrder(cart, "T1");

      expect(result).toEqual({
        error: "注文データの保存に失敗しました",
        status: 500,
      });
    });

    it("ordersテーブルが存在しない場合に適切なエラーメッセージを返すこと", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

      mockInsert.mockResolvedValueOnce({
        data: null,
        error: { message: 'relation "orders" does not exist' },
      });

      const result = await placeOrder(cart, "T1");

      expect(result).toEqual({
        error:
          "データベースエラー: `orders`テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。",
        status: 500,
      });
    });

    it("テーブルの状態更新に失敗しても注文は成功すること", async () => {
      process.env.SUPABASE_URL = "https://test.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

      const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

      mockInsert.mockResolvedValueOnce({ data: {}, error: null });
      mockUpsert.mockResolvedValueOnce({
        data: null,
        error: { message: "Table update failed" },
      });

      const result = await placeOrder(cart, "T1");

      expect(result).toMatchObject({
        message: "Order placed successfully",
        orderId: expect.stringContaining("ORD-"),
      });
    });
  });
});
