"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { getCartItemKey } from "@/lib/cart-identity";
import type { Product } from "@/models/product";

export { getCartItemKey } from "@/lib/cart-identity";

export type CartProduct = Pick<Product, "name" | "slug" | "price" | "salePrice" | "images"> & {
  productId: string;
  variantId?: string;
  selectedAttributes?: Record<string, string>;
  sku?: string;
  stock?: number;
};
export type CartItem = CartProduct & { quantity: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (product: CartProduct, quantity?: number) => boolean;
  updateQuantity: (itemKey: string, quantity: number) => void;
  removeItem: (itemKey: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "form-and-forest-cart";
const serverSnapshot = { items: [] as CartItem[], hydrated: false };
const listeners = new Set<() => void>();
let snapshot: typeof serverSnapshot | null = null;

function isCartItem(value: unknown): value is Omit<CartItem, "productId"> & { productId?: string } {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return typeof item.name === "string" &&
    typeof item.slug === "string" &&
    (typeof item.productId === "string" || typeof item.slug === "string") &&
    typeof item.price === "number" &&
    (item.salePrice === null || typeof item.salePrice === "number") &&
    Array.isArray(item.images) && item.images.every((image) => typeof image === "string") &&
    Number.isInteger(item.quantity) && Number(item.quantity) > 0 &&
    (item.variantId === undefined || typeof item.variantId === "string") &&
    (item.sku === undefined || typeof item.sku === "string") &&
    (item.stock === undefined || (Number.isInteger(item.stock) && item.stock >= 0)) &&
    (item.selectedAttributes === undefined ||
      (typeof item.selectedAttributes === "object" &&
        item.selectedAttributes !== null &&
        !Array.isArray(item.selectedAttributes) &&
        Object.values(item.selectedAttributes).every((attribute) => typeof attribute === "string")));
}

function getSnapshot() {
  if (!snapshot) {
    let items: CartItem[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        items = parsed.filter(isCartItem).map((item) => ({
          ...item,
          productId: item.productId || item.slug,
        }));
      }
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

  function addItem(product: CartProduct, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1 || product.stock === 0 || quantity > (product.stock ?? Number.MAX_SAFE_INTEGER)) {
      return false;
    }

    const itemKey = getCartItemKey(product);
    const existingItem = getSnapshot().items.find((item) => getCartItemKey(item) === itemKey);
    if (existingItem && existingItem.quantity + quantity > (product.stock ?? Number.MAX_SAFE_INTEGER)) {
      return false;
    }

    changeItems((current) => {
      const existing = current.find((item) => getCartItemKey(item) === itemKey);
      return existing
        ? current.map((item) => getCartItemKey(item) === itemKey ? { ...item, quantity: item.quantity + quantity } : item)
        : [...current, { ...product, quantity }];
    });
    return true;
  }

  function updateQuantity(itemKey: string, quantity: number) {
    const item = getSnapshot().items.find((current) => getCartItemKey(current) === itemKey);
    if (!Number.isInteger(quantity)) return;
    if (quantity > 0 && item?.stock !== undefined && quantity > item.stock) return;
    changeItems((current) => quantity <= 0
      ? current.filter((currentItem) => getCartItemKey(currentItem) !== itemKey)
      : current.map((currentItem) => getCartItemKey(currentItem) === itemKey ? { ...currentItem, quantity } : currentItem));
  }

  function removeItem(itemKey: string) {
    changeItems((current) => current.filter((item) => getCartItemKey(item) !== itemKey));
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