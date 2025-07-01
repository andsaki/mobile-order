import { Meta, StoryObj } from "@storybook/react";
import LayoutConverter from "./LayoutConverter";

const meta: Meta<typeof LayoutConverter> = {
  title: "Components/LayoutConverter",
  component: LayoutConverter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LayoutConverter>;

export const Default: Story = {
  args: {
    // 必要に応じてプロパティを追加
  },
};
