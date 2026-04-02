import { useState, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

let cartItems: CartItem[] = [];
let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function getCart() {
  return cartItems;
}

export function addToCart(product: Product) {
  const existing = cartItems.find((i) => i.id === product.id);
  if (existing) {
    cartItems = cartItems.map((i) =>
      i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
    );
  } else {
    cartItems = [...cartItems, { ...product, quantity: 1 }];
  }
  notifyListeners();
}

export function removeFromCart(productId: number) {
  cartItems = cartItems.filter((i) => i.id !== productId);
  notifyListeners();
}

export function updateQuantity(productId: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  cartItems = cartItems.map((i) =>
    i.id === productId ? { ...i, quantity } : i
  );
  notifyListeners();
}

export function clearCart() {
  cartItems = [];
  notifyListeners();
}

export function useCart() {
  const [, forceUpdate] = useState(0);

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const unsubscribe = subscribe();
  useState(() => unsubscribe);

  return {
    items: getCart(),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: cartItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}
