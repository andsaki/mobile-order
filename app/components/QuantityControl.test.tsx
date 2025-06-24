import { render, screen, fireEvent } from "@testing-library/react";

import QuantityControl from "./QuantityControl";

describe("QuantityControl", () => {
  it("正しい数量でレンダリングされる", () => {
    render(
      <QuantityControl
        quantity={5}
        onIncrement={() => {}}
        onDecrement={() => {}}
        min={1}
      />
    );
    // toBeInTheDocument の代わりに
    const quantityElement = screen.getByText("5");
    expect(quantityElement).toBeTruthy();
  });

  it('"+"ボタンをクリックするとonIncrementが呼び出される', () => {
    const mockIncrement = jest.fn();
    render(
      <QuantityControl
        quantity={5}
        onIncrement={mockIncrement}
        onDecrement={() => {}}
        min={1}
      />
    );
    fireEvent.click(screen.getByText("+"));
    expect(mockIncrement).toHaveBeenCalledTimes(1);
  });

  it('"-"ボタンをクリックするとonDecrementが呼び出される', () => {
    const mockDecrement = jest.fn();
    render(
      <QuantityControl
        quantity={5}
        onIncrement={() => {}}
        onDecrement={mockDecrement}
        min={1}
      />
    );
    fireEvent.click(screen.getByText("-"));
    expect(mockDecrement).toHaveBeenCalledTimes(1);
  });

  it('数量が最小値の場合、"-"ボタンが無効になる', () => {
    render(
      <QuantityControl
        quantity={1}
        onIncrement={() => {}}
        onDecrement={() => {}}
        min={1}
      />
    );
    // 属性チェックを使用（型キャスト不要）
    const buttons = screen.getAllByRole("button");
    const decrementButton = buttons.find(
      (button) => button.textContent === "-"
    );
    expect(decrementButton).toBeDefined();
    expect(decrementButton!.hasAttribute("disabled")).toBe(true);
  });

  it('数量が最小値より大きい場合、"-"ボタンは無効にならない', () => {
    render(
      <QuantityControl
        quantity={2}
        onIncrement={() => {}}
        onDecrement={() => {}}
        min={1}
      />
    );
    // 属性チェックを使用（型キャスト不要）
    const buttons = screen.getAllByRole("button");
    const decrementButton = buttons.find(
      (button) => button.textContent === "-"
    );
    expect(decrementButton).toBeDefined();
    expect(decrementButton!.hasAttribute("disabled")).toBe(false);
  });
});
