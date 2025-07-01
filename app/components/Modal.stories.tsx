import { Meta, StoryObj } from "@storybook/react";

import Modal from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Modalは、ユーザーに重要な情報を表示したり、アクションを促したりするためのダイアログコンポーネントです。モーダルは画面の中央に表示され、背景を暗くすることでユーザーの注意を引きます。isOpenプロパティで表示/非表示を制御し、onCloseコールバックで閉じる際の動作を定義できます。",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    title: "Sample Modal",
    message: "This is a sample modal content.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "デフォルトのModal表示です。モーダルが開いた状態で表示され、タイトルとメッセージが設定されています。閉じるボタンをクリックするとコンソールにメッセージが表示されます。",
      },
    },
  },
};
