import { Meta, StoryObj } from "@storybook/react";
import BottomNav from "./BottomNav";

const meta: Meta<typeof BottomNav> = {
  title: "Components/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "BottomNavは、アプリのナビゲーションメニューを提供するコンポーネントです。メニュー、カート、注文履歴へのリンクが含まれ、現在のページに応じてアクティブなリンクがハイライトされます。このコンポーネントは、RemixのuseLocationフックを使用して現在のURLパスを取得し、対応するナビゲーションアイテムを強調表示します。Storybookでは、reactRouterパラメータを使用して異なるパスをシミュレートしています。",
      },
    },
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {
  render: () => <BottomNav />,
  parameters: {
    docs: {
      description: {
        story:
          "デフォルトのBottomNav表示です。どのリンクもアクティブではありません。",
      },
    },
  },
};
