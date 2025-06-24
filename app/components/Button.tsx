import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

/**
 * 再利用可能なボタンコンポーネント
 * @param children - ボタン内に表示する内容
 * @param onClick - ボタンがクリックされた時のハンドラー
 * @param variant - ボタンのスタイルバリエーション (primary, secondary, danger)
 * @param size - ボタンのサイズ (small, medium, large)
 * @param disabled - ボタンが無効化されているかどうか
 * @param type - ボタンのタイプ (button, submit, reset)
 * @param className - 追加のCSSクラス
 */
export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded font-semibold transition-colors duration-200 ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
