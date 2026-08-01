import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EDGE_BASE = `${supabaseUrl}/functions/v1/sellauth-proxy`;

export async function fetchProducts(): Promise<unknown> {
  const res = await fetch(`${EDGE_BASE}?path=shops/250037/products`, {
    headers: { Authorization: `Bearer ${supabaseAnonKey}` },
  });
  if (!res.ok) throw new Error(`SellAuth request failed (${res.status})`);
  const data = await res.json();
  return data;
}

export async function fetchProductDetail(id: number | string): Promise<unknown> {
  const res = await fetch(`${EDGE_BASE}?path=shops/250037/products/${id}`, {
    headers: { Authorization: `Bearer ${supabaseAnonKey}` },
  });
  if (!res.ok) throw new Error(`SellAuth request failed (${res.status})`);
  const data = await res.json();
  return data;
}
