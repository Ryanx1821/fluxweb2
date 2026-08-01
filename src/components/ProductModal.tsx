import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, ShoppingCart, Zap, Star, Minus, Plus, Shield, Package,
  ChevronRight, Check, Truck, Headphones, RefreshCw, Layers,
} from "lucide-react";
import type { SellAuthProduct, SellAuthVariant, SellAuthProductTab, CartItem } from "@/types";
import {
  getProductName, getProductImage, getProductDescription,
  getVariants, getLowestPrice, getHighestPrice, hasMultipleVariants,
  formatPrice, isProductActive, getProductCategory,
} from "@/lib/products";
import type { Lang } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface ProductModalProps {
  product: SellAuthProduct;
  onClose: () => void;
  onAdd: (p: SellAuthProduct, v?: SellAuthVariant | null, qty?: number) => void;
  onBuyNow: (p: SellAuthProduct, v?: SellAuthVariant | null, qty?: number) => void;
  lang: Lang;
}

type Tab = "details" | "features" | "reviews";

export default function ProductModal({ product, onClose, onAdd, onBuyNow, lang }: ProductModalProps) {
  const t = translations[lang];
  const variants = getVariants(product);
  const multiVariant = hasMultipleVariants(product);
  const active = isProductActive(product);
  const [selected, setSelected] = useState<SellAuthVariant | null>(variants[0] ?? null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("details");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [productTabs, setProductTabs] = useState<SellAuthProductTab[]>(
    Array.isArray(product.product_tabs) ? product.product_tabs : []
  );
  const name = getProductName(product);
  const img = getProductImage(product);
  const desc = getProductDescription(product);
  const category = getProductCategory(product);

  const displayPrice = selected ? Number(selected.price) : getLowestPrice(product);
  const highPrice = getHighestPrice(product);
  const stockCount = selected?.stock ?? product.stock ?? 0;
  const stockLevel = !active ? "out" : stockCount > 10 ? "high" : stockCount > 0 ? "low" : "high";

  useEffect(() => {
    setQty(1);
    setTab("details");
    setImgLoaded(false);
    setProductTabs(Array.isArray(product.product_tabs) ? product.product_tabs : []);
  }, [product.id]);

  useEffect(() => {
    if (Array.isArray(product.product_tabs) && product.product_tabs.length > 0) {
      setProductTabs(product.product_tabs);
      return;
    }
    let cancelled = false;
    const PROXY = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sellauth-proxy`;
    const AUTH = { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` };
    (async () => {
      try {
        const res = await fetch(`${PROXY}?path=shops/250037/products/${product.id}`, { headers: AUTH });
        if (!res.ok) return;
        const data = await res.json();
        const p = (data && data.data) ? data.data : data;
        if (!cancelled && p && Array.isArray(p.product_tabs)) {
          setProductTabs(p.product_tabs);
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [product.id, product.product_tabs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-y-auto flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[92vh] my-auto overflow-hidden rounded-3xl animate-fade-in-scale flex flex-col"
        style={{
          background: "linear-gradient(145deg, #0e0e18, #0a0a12)",
          border: "1px solid rgba(225,29,42,0.3)",
          boxShadow: "0 0 100px rgba(225,29,42,0.15), 0 24px 80px rgba(0,0,0,0.85)",
        }}>
        {/* Red ambient top glow */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,42,0.8), transparent)" }} />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-24 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #e11d2a, transparent)" }} />

        {/* Close */}
        <button onClick={onClose} aria-label="Close"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,42,0.3)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "rotate(90deg)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.transform = "rotate(0deg)"; }}>
          <X size={18} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-0">
            {/* Left: Image showcase */}
            <div className="relative flex items-center justify-center p-8 md:p-12 min-h-[300px] md:min-h-[480px]"
              style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="absolute inset-0 opacity-25"
                style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(225,29,42,0.35), transparent)" }} />

              {/* Category tag */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <Layers size={12} style={{ color: "#e11d2a" }} />
                <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{category}</span>
              </div>

              {!imgLoaded && (
                <div className="absolute inset-8 md:inset-12 rounded-xl shimmer" />
              )}
              <img
                src={img}
                alt={name}
                onLoad={() => setImgLoaded(true)}
                className="relative z-10 w-full max-w-sm rounded-2xl object-cover aspect-square transition-all duration-700"
                style={{
                  border: "1px solid rgba(225,29,42,0.2)",
                  boxShadow: "0 20px 70px rgba(0,0,0,0.6), 0 0 40px rgba(225,29,42,0.12)",
                  opacity: imgLoaded ? 1 : 0,
                  transform: imgLoaded ? "scale(1)" : "scale(0.96)",
                }}
                onError={(e) => { e.currentTarget.src = "/assets/images/image.png"; setImgLoaded(true); }}
              />
            </div>

            {/* Right: Details */}
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              {/* Status + rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: active ? "rgba(16,185,129,0.12)" : "rgba(225,29,42,0.12)",
                    color: active ? "#10b981" : "#e11d2a",
                    border: `1px solid ${active ? "rgba(16,185,129,0.25)" : "rgba(225,29,42,0.3)"}`,
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: active ? "#10b981" : "#e11d2a" }} />
                  {active ? t.inStock : t.outOfStock}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="#e11d2a" stroke="none" />
                  ))}
                  <span className="text-xs ml-1.5 font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>4.9 · 2.1k reviews</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{name}</h2>

              {/* Price */}
              <div className="flex items-end gap-2">
                {multiVariant && !selected ? (
                  <div>
                    <span className="text-xs uppercase tracking-widest mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>{t.startsAt}</span>
                    <span className="text-4xl font-bold text-glow" style={{ color: "#e11d2a" }}>
                      {formatPrice(displayPrice)}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-glow" style={{ color: "#e11d2a" }}>
                      {formatPrice(displayPrice)}
                    </span>
                    {multiVariant && highPrice > displayPrice && (
                      <span className="text-sm mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>– {formatPrice(highPrice)}</span>
                    )}
                  </>
                )}
              </div>

              {/* Stock bar */}
              {active && stockCount > 0 && stockLevel === "low" && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stockCount / 10) * 100, 100)}%`, background: "linear-gradient(90deg, #f59e0b, #e11d2a)" }} />
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap" style={{ color: "#f59e0b" }}>Only {stockCount} left</span>
                </div>
              )}

              {/* Variants */}
              {variants.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {t.variants}
                  </p>
                  <div className="flex flex-col gap-2">
                    {variants.map((v) => {
                      const isSel = selected?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelected(v)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left group"
                          style={{
                            background: isSel ? "rgba(79,142,247,0.08)" : "rgba(255,255,255,0.03)",
                            border: `1.5px solid ${isSel ? "#4f8ef7" : "rgba(255,255,255,0.08)"}`,
                            color: "#fff",
                            boxShadow: isSel ? "0 0 0 1px rgba(79,142,247,0.15), 0 4px 16px rgba(79,142,247,0.1)" : "none",
                          }}
                          onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
                          onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
                          <span className="flex items-center gap-2">
                            {isSel && <Check size={14} style={{ color: "#4f8ef7" }} />}
                            {v.name || v.title}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold ml-3 shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.85)",
                            }}>
                            {formatPrice(Number(v.price))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              {active && (
                <div>
                  <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
                    Quantity
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center transition-colors"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                        <Minus size={15} />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-white">{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(99, q + 1))}
                        className="w-10 h-10 flex items-center justify-center transition-colors"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                        <Plus size={15} />
                      </button>
                    </div>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Total: <span className="font-semibold text-white">{formatPrice(displayPrice * qty)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Trust mini-badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <MiniBadge icon={<Shield size={13} />} label="Secure Checkout" />
                <MiniBadge icon={<Truck size={13} />} label="Instant Delivery" />
                <MiniBadge icon={<RefreshCw size={13} />} label="Easy Refunds" />
                <MiniBadge icon={<Headphones size={13} />} label="24/7 Support" />
              </div>
            </div>
          </div>

          {/* Tabbed section */}
          <div className="px-6 sm:px-8 pb-6">
            {/* Tab bar */}
            <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {([
                { key: "details", label: "Details" },
                { key: "features", label: "Features" },
                { key: "reviews", label: "Reviews" },
              ] as { key: Tab; label: string }[]).map((tb) => (
                <button key={tb.key} onClick={() => setTab(tb.key)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: tab === tb.key ? "rgba(225,29,42,0.15)" : "transparent",
                    color: tab === tb.key ? "#e11d2a" : "rgba(255,255,255,0.5)",
                    border: tab === tb.key ? "1px solid rgba(225,29,42,0.3)" : "1px solid transparent",
                  }}>
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="animate-fade-in" key={tab}>
              {tab === "details" && (
                <div className="prose-sm leading-relaxed text-sm whitespace-pre-line max-w-2xl"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(desc) }} />
              )}
              {tab === "features" && (
                productTabs.length > 0 ? (
                  <div className="space-y-6 max-w-2xl">
                    {productTabs.map((ptab) => (
                      <div key={ptab.id}>
                        {productTabs.length > 1 && (
                          <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: "#e11d2a" }}>
                            {ptab.title}
                          </p>
                        )}
                        <div className="prose-sm leading-relaxed text-sm max-w-2xl"
                          style={{ color: "rgba(255,255,255,0.65)" }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(ptab.content) }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
                    {[
                      { icon: <Zap size={16} />, title: "Instant Access", text: "Get your product immediately after payment confirmation." },
                      { icon: <Shield size={16} />, title: "Secure & Encrypted", text: "All transactions are protected with SSL encryption." },
                      { icon: <Package size={16} />, title: "Digital Delivery", text: "Receive your order via email instantly." },
                      { icon: <RefreshCw size={16} />, title: "Money-Back Guarantee", text: "Not satisfied? Get a full refund within 24 hours." },
                    ].map((f, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl transition-colors hover:bg-white/[0.02]"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(225,29,42,0.1)", border: "1px solid rgba(225,29,42,0.2)" }}>
                          <span style={{ color: "#e11d2a" }}>{f.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{f.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{f.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {tab === "reviews" && (
                <div className="space-y-3 max-w-2xl">
                  {[
                    { author: "Alex M.", rating: 5, text: "Absolutely worth it. Super fast delivery and great quality." },
                    { author: "Sarah K.", rating: 5, text: "Best purchase I've made this year. Highly recommend!" },
                    { author: "Jordan P.", rating: 4, text: "Solid product, works as described. Support was helpful." },
                  ].map((r, i) => (
                    <div key={i} className="p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "rgba(225,29,42,0.15)", color: "#e11d2a", border: "1px solid rgba(225,29,42,0.25)" }}>
                          {r.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{r.author}</p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} size={10} fill={j < r.rating ? "#e11d2a" : "rgba(255,255,255,0.15)"} stroke="none" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="relative shrink-0 px-6 sm:px-8 py-4 flex items-center gap-3"
          style={{ background: "rgba(10,10,18,0.9)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Total</p>
            <p className="text-xl font-bold" style={{ color: "#e11d2a", fontFamily: "'Space Grotesk', sans-serif" }}>
              {formatPrice(displayPrice * qty)}
            </p>
          </div>
          <div className="flex-1 flex gap-3">
            <button
              onClick={() => { onAdd(product, selected, qty); }}
              disabled={!active}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: active ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
                color: active ? "#fff" : "rgba(255,255,255,0.3)",
                cursor: active ? "pointer" : "not-allowed",
              }}
              onMouseEnter={(e) => { if (active) { e.currentTarget.style.background = "rgba(255,255,255,0.11)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; } }}
              onMouseLeave={(e) => { if (active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; } }}>
              <ShoppingCart size={16} />
              {t.addToCart}
            </button>
            <button
              onClick={() => { onBuyNow(product, selected, qty); }}
              disabled={!active}
              className="group flex-1 relative flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold overflow-hidden transition-all duration-200"
              style={{
                background: active ? "linear-gradient(135deg, #e11d2a, #a0121f)" : "rgba(225,29,42,0.15)",
                border: `1px solid ${active ? "rgba(225,29,42,0.5)" : "rgba(225,29,42,0.2)"}`,
                color: active ? "#fff" : "rgba(255,255,255,0.3)",
                boxShadow: active ? "0 8px 24px rgba(225,29,42,0.35)" : "none",
                cursor: active ? "pointer" : "not-allowed",
              }}>
              {active && (
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(135deg, #f0202e, #c01623)" }} />
              )}
              <Zap size={16} className="relative" />
              {t.buyNow} <ChevronRight size={15} className="relative transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function MiniBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ color: "rgba(255,255,255,0.4)" }}>{icon}</span>
      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
    </div>
  );
}

// Allowlist-based sanitizer. Everything not explicitly permitted is dropped, so
// event handlers (however they are quoted), script/iframe/object/svg elements and
// non-http(s) URL schemes cannot survive into the rendered markup.
const ALLOWED_TAGS = new Set([
  "P", "BR", "B", "STRONG", "I", "EM", "U", "S", "SPAN", "DIV",
  "UL", "OL", "LI", "BLOCKQUOTE", "CODE", "PRE", "HR",
  "H1", "H2", "H3", "H4", "H5", "H6", "A",
]);
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  A: new Set(["href", "title"]),
};

function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v.startsWith("#") || v.startsWith("/")) return true;
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:");
}

function sanitizeHtml(html: string): string {
  if (typeof html !== "string" || !html) return "";
  if (typeof DOMParser === "undefined") return "";

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");

  const walk = (node: Element) => {
    // Iterate over a static copy: the live list mutates as we remove nodes.
    for (const child of Array.from(node.children)) {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        // Keep the readable text, discard the element itself.
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }
      const allowed = ALLOWED_ATTRS[child.tagName];
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        if (!allowed || !allowed.has(name)) {
          child.removeAttribute(attr.name);
          continue;
        }
        if (name === "href" && !isSafeUrl(attr.value)) {
          child.removeAttribute(attr.name);
        }
      }
      if (child.tagName === "A") {
        child.setAttribute("target", "_blank");
        child.setAttribute("rel", "noopener noreferrer nofollow");
      }
      walk(child);
    }
  };

  walk(doc.body);
  return doc.body.innerHTML;
}
