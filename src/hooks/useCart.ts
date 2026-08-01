import { useCallback, useEffect, useState } from "react";
import type { CartItem, SellAuthProduct, SellAuthVariant } from "@/types";

const STORAGE_KEY = "flux-cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CartItem[];
  } catch {
    /* ignore */
  }
  return [];
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: SellAuthProduct, variant?: SellAuthVariant | null, quantity = 1) => {
    setItems((prev) => {
      const variantId = variant?.id ?? null;
      const existing = prev.find((i) => i.product.id === product.id && (i.variant?.id ?? null) === variantId);
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { product, variant: variant ?? null, quantity }];
    });
    setOpen(true);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((i, idx) => (idx === index ? { ...i, quantity: Math.max(1, quantity) } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => {
    const price = i.variant?.price ?? i.product.price ?? 0;
    return sum + Number(price) * i.quantity;
  }, 0);

  return {
    items,
    open,
    setOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
}
