import { render, screen } from "@testing-library/react";

import LayoutConverter from "./LayoutConverter";

describe("LayoutConverter コンポーネント", () => {
  test("タイトルを正しく表示する", () => {
    const title = "テストタイトル";
    render(
      <LayoutConverter title={title}>
        <p>テストコンテンツ</p>
      </LayoutConverter>
    );
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  test("子コンテンツを正しく表示する", () => {
    const content = "テストコンテンツ";
    render(
      <LayoutConverter title="テストタイトル">
        <p>{content}</p>
      </LayoutConverter>
    );
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  test("タイトルに正しいスタイルを適用する", () => {
    const title = "テストタイトル";
    render(
      <LayoutConverter title={title}>
        <p>テストコンテンツ</p>
      </LayoutConverter>
    );
    const titleElement = screen.getByText(title);
    expect(titleElement).toHaveClass("text-3xl");
    expect(titleElement).toHaveClass("font-bold");
  });

  test("コンテナに正しいスタイルを適用する", () => {
    render(
      <LayoutConverter title="テストタイトル">
        <p>テストコンテンツ</p>
      </LayoutConverter>
    );
    const container =
      screen.getByText("テストコンテンツ").parentElement?.parentElement;
    expect(container).toHaveClass("layout-converter");
  });
});
