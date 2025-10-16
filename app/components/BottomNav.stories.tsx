import { Meta, StoryObj } from "@storybook/react";

import BottomNav from "./BottomNav";

const meta: Meta<typeof BottomNav> = {
  title: "Components/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "BottomNavは、アプリのナビゲーションメニューを提供するコンポーネントです。メニュー、カート、注文履歴へのリンクが含まれ、現在のページに応じてアクティブなリンクがハイライトされます。",
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
  render: () => (
    <div style={{ paddingBottom: "80px" }}>
      <BottomNav />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "デフォルトのBottomNav表示です。現在のルートに応じてアクティブなアイテムがハイライトされます。",
      },
    },
  },
};
