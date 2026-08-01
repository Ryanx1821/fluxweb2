import { useEffect, useState } from "react";
import type { SellAuthPaymentMethod } from "@/types";

const PROXY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sellauth-proxy`;
const AUTH = { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };

export function usePaymentMethods() {
  const [methods, setMethods] = useState<SellAuthPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${PROXY}?path=shops/250037/payment-methods`, { headers: AUTH });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        const list = extractMethods(data).filter((m) => m.is_active !== false);
        if (!cancelled) {
          setMethods(list);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { methods, loading, error };
}

function extractMethods(data: unknown): SellAuthPaymentMethod[] {
  if (Array.isArray(data)) return data as SellAuthPaymentMethod[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as SellAuthPaymentMethod[];
    if (Array.isArray(obj.methods)) return obj.methods as SellAuthPaymentMethod[];
    if (Array.isArray(obj.items)) return obj.items as SellAuthPaymentMethod[];
  }
  return [];
}
