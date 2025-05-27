import React from "react";

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
}) => {
  return (
    <div className="flex items-center">
      <button
        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full mr-1 w-8 h-8"
        onClick={onDecrement}
        disabled={quantity <= min}
      >
        -
      </button>
      <span className="w-20 border rounded px-2 py-1 mx-2">{quantity}</span>
      <button
        className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded-full w-8 h-8"
        onClick={onIncrement}
      >
        +
      </button>
    </div>
  );
};

export default QuantityControl;
