"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Product } from "@/models/product";

export type CartProduct = Pick<Product, "name" | "slug" | "price" | "salePrice" | "images">;
export type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (product: CartProduct) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "form-and-forest-cart";
const serverSnapshot = { items: [] as CartItem[], hydrated: false };
const listeners = new Set<() => void>();
let snapshot: typeof serverSnapshot | null = null;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return typeof item.name === "string" &&
    typeof item.slug === "string" &&
    typeof item.price === "number" &&
    (item.salePrice === null || typeof item.salePrice === "number") &&
    Array.isArray(item.images) && item.images.every((image) => typeof image === "string") &&
    Number.isInteger(item.quantity) && Number(item.quantity) > 0;
}

function getSnapshot() {
  if (!snapshot) {
    let items: CartItem[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) items = parsed.filter(isCartItem);
    } catch {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Storage can be unavailable in restricted browser contexts.
      }
    }
    snapshot = { items, hydrated: true };
  }
  return snapshot;
}

function getServerSnapshot() {
  return serverSnapshot;
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      snapshot = null;
      notify();
    }
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function changeItems(update: (items: CartItem[]) => CartItem[]) {
  const items = update(getSnapshot().items);
  snapshot = { items, hydrated: true };
  try {
    localStorage.setItem(storageKey, JSON.stringify(items));
  } catch {
    // Keep the in-memory cart usable when storage is unavailable.
  }
  notify();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { items, hydrated } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function addItem(product: CartProduct) {
    changeItems((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      return existing
        ? current.map((item) => item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(slug: string, quantity: number) {
    changeItems((current) => quantity <= 0
      ? current.filter((item) => item.slug !== slug)
      : current.map((item) => item.slug === slug ? { ...item, quantity } : item));
  }

  function removeItem(slug: string) {
    changeItems((current) => current.filter((item) => item.slug !== slug));
  }

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.salePrice ?? item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, hydrated, addItem, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider.");
  return cart;
}