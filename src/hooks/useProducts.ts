import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SellAuthProduct, SellAuthCategory } from "@/types";

const PROXY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sellauth-proxy`;
const AUTH = { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };

const POLL_INTERVAL = 30_000;

export function useProducts() {
  const [products, setProducts] = useState<SellAuthProduct[]>([]);
  const [categories, setCategories] = useState<SellAuthCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (initial: boolean) => {
      if (initial) setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${PROXY}?path=shops/250037/products`, { headers: AUTH }),
          fetch(`${PROXY}?path=shops/250037/categories`, { headers: AUTH }),
        ]);
        if (!prodRes.ok) throw new Error(`Request failed (${prodRes.status})`);
        const prodData = await prodRes.json();
        const list = extractProducts(prodData);
        let cats: SellAuthCategory[] = [];
        if (catRes.ok) {
          try { cats = extractCategories(await catRes.json()); } catch { /* ignore */ }
        }
        if (!cancelled) {
          setProducts((prev) => (JSON.stringify(prev) === JSON.stringify(list) ? prev : list));
          setCategories((prev) => (JSON.stringify(prev) === JSON.stringify(cats) ? prev : cats));
          setError(null);
        }
      } catch (e) {
        if (!cancelled && initial) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled && initial) setLoading(false);
      }
    };

    fetchData(true);
    const interval = setInterval(() => fetchData(false), POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { products, categories, loading, error };
}

function extractCategories(data: unknown): SellAuthCategory[] {
  if (Array.isArray(data)) return data as SellAuthCategory[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as SellAuthCategory[];
    if (Array.isArray(obj.categories)) return obj.categories as SellAuthCategory[];
  }
  return [];
}

function extractProducts(data: unknown): SellAuthProduct[] {
  if (Array.isArray(data)) return data as SellAuthProduct[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as SellAuthProduct[];
    if (Array.isArray(obj.products)) return obj.products as SellAuthProduct[];
    if (Array.isArray(obj.items)) return obj.items as SellAuthProduct[];
    if (obj.data && typeof obj.data === "object") {
      const inner = obj.data as Record<string, unknown>;
      if (Array.isArray(inner.products)) return inner.products as SellAuthProduct[];
      if (Array.isArray(inner.items)) return inner.items as SellAuthProduct[];
    }
  }
  return [];
}

export { supabase };
