import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import QuantityControl from "./QuantityControl";

const meta: Meta<typeof QuantityControl> = {
  title: "Components/QuantityControl",
  component: QuantityControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    quantity: { control: "number" },
    onIncrement: { action: "incremented" },
    onDecrement: { action: "decremented" },
  },
};

export default meta;

type Story = StoryObj<typeof QuantityControl>;

const InteractiveQuantityControl = () => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <QuantityControl
      quantity={quantity}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      min={0}
    />
  );
};

export const Default: Story = {
  args: {
    quantity: 1,
  },
};

export const Interactive: Story = {
  render: () => <InteractiveQuantityControl />,
};
