import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { CartItem } from "~/features/cart/types/cartItem";

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

  const removeItem = (itemId: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== itemId);
      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      let updatedCart;
      if (existingItemIndex !== -1) {
        updatedCart = prevCart.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        updatedCart = [...prevCart, item];
      }

      sessionStorage.setItem("cart", JSON.stringify(updatedCart));
      setTimeout(() => {
        toast.success(`${item.name}をカートに追加しました！`);
      }, 0);
      return updatedCart;
    });
  };

  return { cart, setCart, updateQuantity, removeItem, addToCart };
}
