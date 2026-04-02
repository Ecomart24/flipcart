import { useState, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem extends Product {
  quantity: number;
}

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem("fk_cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  try {
    localStorage.setItem("fk_cart", JSON.stringify(items));
  } catch {}
}

let cartItems: CartItem[] = loadFromStorage();
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
  saveToStorage(cartItems);
  notifyListeners();
}

export function removeFromCart(productId: number) {
  cartItems = cartItems.filter((i) => i.id !== productId);
  saveToStorage(cartItems);
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
  saveToStorage(cartItems);
  notifyListeners();
}

export function clearCart() {
  cartItems = [];
  saveToStorage(cartItems);
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
