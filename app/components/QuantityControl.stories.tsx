import { Meta, StoryObj } from "@storybook/react";
import QuantityControl from "./QuantityControl";

const meta: Meta<typeof QuantityControl> = {
  title: "Components/QuantityControl",
  component: QuantityControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuantityControl>;

export const Default: Story = {
  args: {
    quantity: 1,
    onIncrement: () => console.log("Increase quantity"),
    onDecrement: () => console.log("Decrease quantity"),
  },
};
