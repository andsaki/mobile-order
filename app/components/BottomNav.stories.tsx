import { Meta, StoryObj } from "@storybook/react";
import BottomNav from "./BottomNav";

const meta: Meta<typeof BottomNav> = {
  title: "Components/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BottomNav>;

export const Default: Story = {
  args: {
    // 必要に応じてプロパティを追加
  },
};
