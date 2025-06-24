import { useState, useEffect } from "react";

import { CartItem } from "~/types/cartItem";

/**
 * カートの状態を管理するためのカスタムフック。
 * セッションストレージからカートデータを取得し、カートの状態を更新する機能を提供します。
 * @returns {Object} cart - カートのアイテムリスト
 * @returns {Object} setCart - カートの状態を更新する関数
 * @returns {Object} updateQuantity - カート内のアイテムの数量を更新する関数
 */
export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const storedCart = sessionStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart) as CartItem[];
        setCart(parsedCart);
      }
    } catch (error) {
      console.error("Error parsing cart from sessionStorage:", error);
    }
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  return { cart, setCart, updateQuantity };
}
