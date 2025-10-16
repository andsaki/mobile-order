import { Meta, StoryObj } from "@storybook/react";

import ErrorBoundary from "./ErrorBoundary";

const meta: Meta<typeof ErrorBoundary> = {
  title: "Components/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ErrorBoundaryは、アプリケーション内で発生したエラーを表示するコンポーネントです。ユーザーフレンドリーなエラーメッセージと、再読み込みやホームに戻るアクションを提供します。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

export const NotFound: Story = {
  args: {
    error: {
      status: 404,
      statusText: "Not Found",
      data: { message: "ページが見つかりませんでした" },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "404エラー（ページが見つからない）の表示例です。",
      },
    },
  },
};

export const ServerError: Story = {
  args: {
    error: {
      status: 500,
      statusText: "Internal Server Error",
      data: { message: "サーバーエラーが発生しました" },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "500エラー（サーバーエラー）の表示例です。",
      },
    },
  },
};

export const GenericError: Story = {
  args: {
    error: new Error("予期しないエラーが発生しました"),
  },
  parameters: {
    docs: {
      description: {
        story: "一般的なエラーの表示例です。",
      },
    },
  },
};

export const ErrorWithStack: Story = {
  args: {
    error: new Error("詳細なエラー情報を持つエラー"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "開発環境でのみ表示されるスタックトレース付きのエラー表示例です。",
      },
    },
  },
};

export const WithResetCallback: Story = {
  args: {
    error: new Error("リセット可能なエラー"),
    resetErrorBoundary: () => {
      console.log("Error boundary reset!");
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "resetErrorBoundaryコールバックを使用したエラー表示例です。再読み込みボタンをクリックするとコールバックが実行されます。",
      },
    },
  },
};

export const Unauthorized: Story = {
  args: {
    error: {
      status: 401,
      statusText: "Unauthorized",
      data: { message: "認証が必要です" },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "401エラー（認証エラー）の表示例です。",
      },
    },
  },
};

export const Forbidden: Story = {
  args: {
    error: {
      status: 403,
      statusText: "Forbidden",
      data: { message: "このページへのアクセス権限がありません" },
    },
  },
  parameters: {
    docs: {
      description: {
        story: "403エラー（アクセス禁止）の表示例です。",
      },
    },
  },
};
