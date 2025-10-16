import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { useCart } from "./useCart";

// sessionStorageのモック
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// react-hot-toastのモック
const mockToastSuccess = vi.fn();
vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
  },
}));

describe("useCart", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("初期状態では空のカートを返すこと", () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual([]);
  });

  it("sessionStorageからカートデータを読み込むこと", () => {
    const mockCart = [
      { id: "1", name: "Item 1", price: 100, quantity: 2 },
      { id: "2", name: "Item 2", price: 200, quantity: 1 },
    ];
    sessionStorage.setItem("cart", JSON.stringify(mockCart));

    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual(mockCart);
  });

  it("updateQuantityでアイテムの数量を更新すること", () => {
    const mockCart = [
      { id: "1", name: "Item 1", price: 100, quantity: 2 },
      { id: "2", name: "Item 2", price: 200, quantity: 1 },
    ];
    sessionStorage.setItem("cart", JSON.stringify(mockCart));

    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.updateQuantity("1", 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
    expect(JSON.parse(sessionStorage.getItem("cart") || "[]")[0].quantity).toBe(
      5
    );
  });

  it("removeItemでアイテムを削除すること", () => {
    const mockCart = [
      { id: "1", name: "Item 1", price: 100, quantity: 2 },
      { id: "2", name: "Item 2", price: 200, quantity: 1 },
    ];
    sessionStorage.setItem("cart", JSON.stringify(mockCart));

    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.removeItem("1");
    });

    expect(result.current.cart).toEqual([
      { id: "2", name: "Item 2", price: 200, quantity: 1 },
    ]);
    expect(JSON.parse(sessionStorage.getItem("cart") || "[]")).toEqual([
      { id: "2", name: "Item 2", price: 200, quantity: 1 },
    ]);
  });

  it("addToCartで新しいアイテムを追加すること", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart({
        id: "1",
        name: "Item 1",
        price: 100,
        quantity: 2,
      });
    });

    expect(result.current.cart).toEqual([
      { id: "1", name: "Item 1", price: 100, quantity: 2 },
    ]);
    expect(JSON.parse(sessionStorage.getItem("cart") || "[]")).toEqual([
      { id: "1", name: "Item 1", price: 100, quantity: 2 },
    ]);
    // トーストが1回だけ呼ばれることを確認
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith("Item 1をカートに追加しました！");
  });

  it("addToCartで既存のアイテムの数量を増やすこと", () => {
    const mockCart = [{ id: "1", name: "Item 1", price: 100, quantity: 2 }];
    sessionStorage.setItem("cart", JSON.stringify(mockCart));

    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart({
        id: "1",
        name: "Item 1",
        price: 100,
        quantity: 3,
      });
    });

    expect(result.current.cart[0].quantity).toBe(5);
    expect(JSON.parse(sessionStorage.getItem("cart") || "[]")[0].quantity).toBe(
      5
    );
  });

  it("addToCartを複数回呼んでも、各呼び出しでトーストが1回ずつ表示されること", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart({
        id: "1",
        name: "Item 1",
        price: 100,
        quantity: 1,
      });
    });

    // 最初の呼び出しでトーストが1回だけ呼ばれる
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.addToCart({
        id: "2",
        name: "Item 2",
        price: 200,
        quantity: 1,
      });
    });

    // 2回目の呼び出しで合計2回になる（重複ではなく、各呼び出しで1回ずつ）
    expect(mockToastSuccess).toHaveBeenCalledTimes(2);
  });

  it("React Strict Modeのような再レンダリングでもトーストが重複しないこと", () => {
    const { result, rerender } = renderHook(() => useCart());

    act(() => {
      result.current.addToCart({
        id: "1",
        name: "Item 1",
        price: 100,
        quantity: 1,
      });
    });

    const callCountAfterFirstAdd = mockToastSuccess.mock.calls.length;

    // 再レンダリングをシミュレート
    rerender();

    // 再レンダリング後もトーストの呼び出し回数が変わらないことを確認
    expect(mockToastSuccess).toHaveBeenCalledTimes(callCountAfterFirstAdd);
  });

  it("setCartでカート全体を更新すること", () => {
    const { result } = renderHook(() => useCart());

    const newCart = [
      { id: "1", name: "Item 1", price: 100, quantity: 2 },
      { id: "2", name: "Item 2", price: 200, quantity: 1 },
    ];

    act(() => {
      result.current.setCart(newCart);
    });

    expect(result.current.cart).toEqual(newCart);
  });

  it("無効なJSONがsessionStorageにある場合、エラーをキャッチして空のカートを返すこと", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    sessionStorage.setItem("cart", "invalid json");

    const { result } = renderHook(() => useCart());

    expect(result.current.cart).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error parsing cart from sessionStorage:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
