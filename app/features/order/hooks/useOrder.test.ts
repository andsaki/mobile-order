import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useOrder } from "./useOrder";

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

describe("useOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空のカートで注文しようとした場合にエラーを返すこと", async () => {
    const { result } = renderHook(() => useOrder());

    const response = await act(async () => {
      return await result.current.placeOrder([], "T1");
    });

    expect(response).toEqual({
      error: "Cart is empty",
      status: 400,
    });
  });

  it("テーブルIDが空の場合にエラーを返すこと", async () => {
    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "");
    });

    expect(response).toEqual({
      error: "テーブルIDが必要です。QRコードをスキャンしてください。",
      status: 400,
    });
  });

  it("Supabase URLが設定されていない場合にダミーの注文IDを返すこと", async () => {
    const originalUrl = process.env.SUPABASE_URL;
    process.env.SUPABASE_URL = "";

    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toMatchObject({
      message: "Order placed successfully (dummy)",
      orderId: expect.stringContaining("DUMMY-ORD-"),
    });

    process.env.SUPABASE_URL = originalUrl;
  });

  it("Supabase Anon Keyが設定されていない場合にエラーを返すこと", async () => {
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toEqual({
      error: "データベース接続エラー: Supabase Anon Keyが設定されていません",
      status: 500,
    });

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });

  it("無効なSupabase URLの場合にエラーを返すこと", async () => {
    const originalUrl = process.env.SUPABASE_URL;
    process.env.SUPABASE_URL = "invalid-url";

    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toEqual({
      error: "データベース接続エラー: Supabase URLの形式が無効です",
      status: 500,
    });

    process.env.SUPABASE_URL = originalUrl;
  });

  it("注文が正常に処理されること", async () => {
    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    mockInsert.mockResolvedValueOnce({ data: {}, error: null });
    mockUpsert.mockResolvedValueOnce({ data: {}, error: null });

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toMatchObject({
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
    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    mockInsert.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" },
    });

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toEqual({
      error: "注文データの保存に失敗しました",
      status: 500,
    });
  });

  it("ordersテーブルが存在しない場合に適切なエラーメッセージを返すこと", async () => {
    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    mockInsert.mockResolvedValueOnce({
      data: null,
      error: { message: 'relation "orders" does not exist' },
    });

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toEqual({
      error:
        "データベースエラー: `orders`テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。",
      status: 500,
    });
  });

  it("テーブルの状態更新に失敗しても注文は成功すること", async () => {
    const { result } = renderHook(() => useOrder());
    const cart = [{ id: "1", name: "Item 1", price: 100, quantity: 1 }];

    mockInsert.mockResolvedValueOnce({ data: {}, error: null });
    mockUpsert.mockResolvedValueOnce({
      data: null,
      error: { message: "Table update failed" },
    });

    const response = await act(async () => {
      return await result.current.placeOrder(cart, "T1");
    });

    expect(response).toMatchObject({
      message: "Order placed successfully",
      orderId: expect.stringContaining("ORD-"),
    });
  });
});
