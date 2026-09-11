import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  quantity: number;
};

let items: CartItem[] = [
  { id: "a5-print", name: "طباعة صورة A5", detail: "15 × 21 سم · لامعة", price: 18, quantity: 1 },
];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function getCartItems() {
  return items;
}

export function addToCart(item: Omit<CartItem, "quantity">) {
  const existing = items.find((entry) => entry.id === item.id);
  items = existing
    ? items.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry)
    : [...items, { ...item, quantity: 1 }];
  emit();
}

export function updateQuantity(id: string, quantity: number) {
  items = quantity <= 0 ? items.filter((entry) => entry.id !== id) : items.map((entry) => entry.id === id ? { ...entry, quantity } : entry);
  emit();
}

export function clearCart() {
  items = [];
  emit();
}

export function useCart() {
  const snapshot = useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, getCartItems, getCartItems);
  const subtotal = snapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items: snapshot, subtotal, total: subtotal + (subtotal > 0 ? 5 : 0), addToCart, updateQuantity, clearCart };
}
