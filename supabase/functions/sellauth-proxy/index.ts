import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// The merchant API key must never be written into this file: anything committed here is
// readable by everyone with repository access and would have to be rotated. It is read
// from the SELLAUTH_API_KEY edge function secret if one is set, and otherwise from the
// server-only `server_secrets` table, which has RLS enabled with no policies and no
// grants, so only the service role used here can read it.
const STORE_ID = "250037";
const BASE_URL = "https://api.sellauth.com/v1";

type Route = "products" | "product" | "categories" | "payment-methods";

const ROUTES: { re: RegExp; route: Route }[] = [
  { re: new RegExp(`^shops/${STORE_ID}/products$`), route: "products" },
  { re: new RegExp(`^shops/${STORE_ID}/products/[0-9]+$`), route: "product" },
  { re: new RegExp(`^shops/${STORE_ID}/categories$`), route: "categories" },
  { re: new RegExp(`^shops/${STORE_ID}/payment-methods$`), route: "payment-methods" },
];

function matchRoute(path: string): Route | null {
  if (path.includes("..") || path.includes("//") || path.includes("@")) return null;
  return ROUTES.find((r) => r.re.test(path))?.route ?? null;
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

/** Copy only the named keys. Everything else is dropped before it leaves the server. */
function pick(src: unknown, keys: string[]): Obj | null {
  if (!isObj(src)) return null;
  const out: Obj = {};
  for (const k of keys) if (k in src) out[k] = src[k];
  return out;
}

// ---------------------------------------------------------------------------
// Response shaping.
//
// The upstream endpoints are the SellAuth *merchant* API, so their objects carry
// fields that must never reach a shopper's browser: `deliverables` (the serials and
// keys being sold), `deliverables_type`, `serial_selection_method`, `dynamic_url`,
// the discord integration settings, and so on. Only the fields the storefront
// actually renders are copied through.
// ---------------------------------------------------------------------------

const IMAGE_FIELDS = ["id", "url"];
const VARIANT_FIELDS = ["id", "name", "title", "price", "stock"];
const TAB_FIELDS = ["id", "title", "content"];
const CATEGORY_FIELDS = ["id", "name", "path", "description"];
const PRODUCT_FIELDS = [
  "id", "name", "title", "description",
  "image", "image_url", "thumbnail",
  "price", "min_price", "max_price",
  "stock", "stock_count", "status", "status_color", "status_text", "active", "category_id",
];
const PAYMENT_METHOD_FIELDS = ["id", "type", "name", "icon_image_url", "is_active"];

function shapeProduct(raw: unknown): Obj | null {
  const p = pick(raw, PRODUCT_FIELDS);
  if (!p || !isObj(raw)) return null;

  if (Array.isArray(raw.images)) {
    p.images = raw.images.map((i) => pick(i, IMAGE_FIELDS)).filter(Boolean);
  }
  if (Array.isArray(raw.variants)) {
    p.variants = raw.variants.map((v) => pick(v, VARIANT_FIELDS)).filter(Boolean);
  }
  if (Array.isArray(raw.product_tabs)) {
    p.product_tabs = raw.product_tabs.map((t) => pick(t, TAB_FIELDS)).filter(Boolean);
  }
  if (isObj(raw.category)) {
    p.category = pick(raw.category, CATEGORY_FIELDS);
  }
  return p;
}

/** Find the array inside the various envelope shapes SellAuth returns. */
function listOf(data: unknown, keys: string[]): unknown[] | null {
  if (Array.isArray(data)) return data;
  if (!isObj(data)) return null;
  for (const k of keys) {
    if (Array.isArray(data[k])) return data[k] as unknown[];
  }
  if (isObj(data.data)) {
    for (const k of keys) {
      const inner = (data.data as Obj)[k];
      if (Array.isArray(inner)) return inner as unknown[];
    }
  }
  return null;
}

function shapeResponse(route: Route, data: unknown): unknown {
  switch (route) {
    case "products": {
      const list = listOf(data, ["data", "products", "items"]) ?? [];
      return { data: list.map(shapeProduct).filter(Boolean) };
    }
    case "product": {
      const raw = isObj(data) && isObj(data.data) ? data.data : data;
      return { data: shapeProduct(raw) };
    }
    case "categories": {
      const list = listOf(data, ["data", "categories", "items"]) ?? [];
      return { data: list.map((c) => pick(c, CATEGORY_FIELDS)).filter(Boolean) };
    }
    case "payment-methods": {
      const list = listOf(data, ["data", "methods", "items"]) ?? [];
      return { data: list.map((m) => pick(m, PAYMENT_METHOD_FIELDS)).filter(Boolean) };
    }
  }
}

let cachedKey: string | null = null;

async function getApiKey(): Promise<string | null> {
  const fromEnv = Deno.env.get("SELLAUTH_API_KEY");
  if (fromEnv) return fromEnv;
  if (cachedKey) return cachedKey;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;

  const res = await fetch(
    `${url}/rest/v1/server_secrets?name=eq.SELLAUTH_API_KEY&select=value`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!res.ok) return null;
  const rows = await res.json();
  const value = Array.isArray(rows) && rows[0]?.value ? String(rows[0].value) : null;
  // Per-instance memo only: the durable copy stays in the database.
  cachedKey = value;
  return value;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      // Fail closed rather than fall back to a credential embedded in source.
      console.error("SELLAUTH_API_KEY is not configured for this project.");
      return json({ error: "Store is not configured" }, 500);
    }

    const url = new URL(req.url);
    const path = (url.searchParams.get("path") || `shops/${STORE_ID}/products`).trim();

    const route = matchRoute(path);
    if (!route) {
      return json({ error: "Unsupported request" }, 400);
    }

    const apiRes = await fetch(`${BASE_URL}/${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const text = await apiRes.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      // Never forward a non-JSON upstream body: it can carry provider internals.
      console.error("Non-JSON upstream response", apiRes.status, text.slice(0, 500));
      return json({ error: "Upstream request failed" }, 502);
    }

    if (!apiRes.ok) {
      console.error("Upstream error", apiRes.status, text.slice(0, 500));
      return json({ error: "Upstream request failed" }, apiRes.status);
    }

    return json(shapeResponse(route, data), 200);
  } catch (err: unknown) {
    // Log the detail server-side; return nothing internal to the caller.
    console.error("sellauth-proxy failure", err);
    return json({ error: "Request failed" }, 500);
  }
});
