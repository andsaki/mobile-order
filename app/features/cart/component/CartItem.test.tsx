import { render, screen, fireEvent, cleanup } from "@testing-library/react";

import { CartItem as CartItemType } from "~/features/cart/types/cartItem";

import CartItem from "./CartItem";
jest.mock("../../../components/Button", () => {
  return jest.fn(({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ));
});

// モックデータ
const mockItem: CartItemType = {
  id: "1",
  name: "テストアイテム",
  price: 500,
  quantity: 2,
  // 画像プロパティが必要な場合は追加
};

// モック関数
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();

describe("CartItem コンポーネント", () => {
  beforeEach(() => {
    render(
      <CartItem
        item={mockItem}
        updateQuantity={mockUpdateQuantity}
        removeItem={mockRemoveItem}
      />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("アイテムの詳細が正しく表示される", () => {
    expect(screen.getByText("テストアイテム")).toBeInTheDocument();
    expect(screen.getByText(/単価: 500円 小計: 1000円/)).toBeInTheDocument();
  });

  test("増加ボタンクリックで数量が更新される", () => {
    const incrementButton = screen.getByRole("button", { name: "+" });
    fireEvent.click(incrementButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith("1", 3);
  });

  test("減少ボタンクリックで数量が更新される", () => {
    const decrementButton = screen.getByRole("button", { name: "-" });
    fireEvent.click(decrementButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith("1", 1);
  });

  test("数量が1の場合に減少ボタンを押してもマイナスにならない", () => {
    // 既存のレンダリングをクリーンアップ
    cleanup();

    // 数量が1の場合のモックデータで独立したレンダリング
    const mockItemWithMinQuantity: CartItemType = {
      ...mockItem,
      quantity: 1,
    };
    render(
      <CartItem
        item={mockItemWithMinQuantity}
        updateQuantity={mockUpdateQuantity}
        removeItem={mockRemoveItem}
      />
    );
    const decrementButton = screen.getByRole("button", {
      name: "-",
      hidden: true,
    });
    expect(decrementButton).toHaveAttribute("disabled");
    fireEvent.click(decrementButton);
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
  });

  test("削除ボタンクリックでアイテムが削除される", () => {
    const deleteButton = screen.getByText("削除");
    fireEvent.click(deleteButton);
    expect(mockRemoveItem).toHaveBeenCalledWith("1");
  });
});
