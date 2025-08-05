import { render, screen, fireEvent } from "@testing-library/react";
import { Mock } from "vitest";

import Button from "./Button";

describe("ボタンコンポーネント", () => {
  test("ボタンに子要素が表示される", () => {
    render(<Button>クリックしてください</Button>);
    expect(screen.getByText("クリックしてください")).toBeInTheDocument();
  });

  test("デフォルトでプライマリバリアントのクラスが適用される", () => {
    render(<Button>プライマリボタン</Button>);
    expect(screen.getByText("プライマリボタン")).toHaveClass("bg-blue-500");
    expect(screen.getByText("プライマリボタン")).toHaveClass(
      "hover:bg-blue-600"
    );
    expect(screen.getByText("プライマリボタン")).toHaveClass("text-white");
  });

  test("セカンダリバリアントのクラスが適用される", () => {
    render(<Button variant="secondary">セカンダリボタン</Button>);
    expect(screen.getByText("セカンダリボタン")).toHaveClass("bg-gray-500");
    expect(screen.getByText("セカンダリボタン")).toHaveClass(
      "hover:bg-gray-600"
    );
    expect(screen.getByText("セカンダリボタン")).toHaveClass("text-white");
  });

  test("デンジャーバリアントのクラスが適用される", () => {
    render(<Button variant="danger">デンジャーボタン</Button>);
    expect(screen.getByText("デンジャーボタン")).toHaveClass("bg-red-500");
    expect(screen.getByText("デンジャーボタン")).toHaveClass(
      "hover:bg-red-600"
    );
    expect(screen.getByText("デンジャーボタン")).toHaveClass("text-white");
  });

  test("スモールサイズのクラスが適用される", () => {
    render(<Button size="small">スモールボタン</Button>);
    expect(screen.getByText("スモールボタン")).toHaveClass("px-2");
    expect(screen.getByText("スモールボタン")).toHaveClass("py-1");
    expect(screen.getByText("スモールボタン")).toHaveClass("text-sm");
  });

  test("デフォルトでミディアムサイズのクラスが適用される", () => {
    render(<Button>ミディアムボタン</Button>);
    expect(screen.getByText("ミディアムボタン")).toHaveClass("px-4");
    expect(screen.getByText("ミディアムボタン")).toHaveClass("py-2");
  });

  test("ラージサイズのクラスが適用される", () => {
    render(<Button size="large">ラージボタン</Button>);
    expect(screen.getByText("ラージボタン")).toHaveClass("px-6");
    expect(screen.getByText("ラージボタン")).toHaveClass("py-3");
    expect(screen.getByText("ラージボタン")).toHaveClass("text-lg");
  });

  test("無効化されている場合に無効クラスが適用される", () => {
    render(<Button disabled>無効ボタン</Button>);
    expect(screen.getByText("無効ボタン")).toHaveClass("opacity-50");
    expect(screen.getByText("無効ボタン")).toHaveClass("cursor-not-allowed");
    expect(screen.getByText("無効ボタン")).toBeDisabled();
  });

  test("クリック時にonClickハンドラが呼ばれる", () => {
    const handleClick = vi.fn<() => void>();
    render(<Button onClick={handleClick}>クリック可能ボタン</Button>);
    fireEvent.click(screen.getByText("クリック可能ボタン"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("無効化されている場合はonClickハンドラが呼ばれない", () => {
    const handleClick: Mock<() => void> = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        無効ボタン
      </Button>
    );
    fireEvent.click(screen.getByText("無効ボタン"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("追加のclassNameが適用される", () => {
    render(<Button className="カスタムクラス">カスタムクラスボタン</Button>);
    expect(screen.getByText("カスタムクラスボタン")).toHaveClass(
      "カスタムクラス"
    );
  });

  test("正しいtype属性が設定される", () => {
    render(<Button type="submit">送信ボタン</Button>);
    expect(screen.getByText("送信ボタン")).toHaveAttribute("type", "submit");
  });
});
