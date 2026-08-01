import { useState, useMemo, useRef, type MouseEvent } from "react";
import {
  Search, Package, ChevronRight, Star, SlidersHorizontal, X,
  LayoutGrid, Flame, TrendingUp, ArrowUpDown, Sparkles,
} from "lucide-react";
import type { SellAuthProduct, SellAuthVariant, SellAuthCategory } from "@/types";
import {
  getProductName, getProductImage, getLowestPrice,
  hasMultipleVariants, formatPrice, isProductActive, getProductCategory,
} from "@/lib/products";
import type { Lang, TranslationDict } from "@/lib/i18n";
import { translations } from "@/lib/i18n";
import ProductModal from "./ProductModal";

interface ProductsPageProps {
  products: SellAuthProduct[];
  categories: SellAuthCategory[];
  loading: boolean;
  error: string | null;
  lang: Lang;
  onAdd: (p: SellAuthProduct, v?: SellAuthVariant | null) => void;
  onBuyNow: (p: SellAuthProduct, v?: SellAuthVariant | null) => void;
}

type SortMode = "default" | "price-low" | "price-high" | "name";

export default function ProductsPage({ products, categories, loading, error, lang, onAdd, onBuyNow }: ProductsPageProps) {
  const t = translations[lang];
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SellAuthProduct | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("default");
  const [sortOpen, setSortOpen] = useState(false);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const c = getProductCategory(p);
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = getProductName(p).toLowerCase().includes(search.toLowerCase());
      const cat = getProductCategory(p);
      const matchesCat = !activeCat || activeCat === "all" || cat === activeCat;
      return matchesSearch && matchesCat;
    });
    if (sort === "price-low") result = [...result].sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
    else if (sort === "price-high") result = [...result].sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
    else if (sort === "name") result = [...result].sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
    return result;
  }, [products, search, activeCat, sort]);

  const activeProducts = products.filter(p => isProductActive(p)).length;

  if (loading) return <ProductsSkeleton />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl blur-xl opacity-50" style={{ background: "rgba(225,29,42,0.2)" }} />
        <div className="relative p-5 rounded-2xl" style={{ background: "rgba(225,29,42,0.08)", border: "1px solid rgba(225,29,42,0.2)" }}>
          <Package size={32} style={{ color: "#e11d2a" }} />
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.5)" }}>{t.loadFailed}</p>
    </div>
  );

  return (
    <div className="animate-tab relative">
      {/* Ambient orb */}
      <div className="absolute -top-10 right-0 w-80 h-80 rounded-full opacity-[0.06] blur-3xl pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(225,29,42,0.1)", border: "1px solid rgba(225,29,42,0.2)" }}>
            <LayoutGrid size={20} style={{ color: "#e11d2a" }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.products}
            </h1>
            <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                {activeProducts} active
              </span>
              <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
              <span>{products.length} total</span>
            </p>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchProducts}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(225,29,42,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,42,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{sortLabel(sort)}</span>
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-20 animate-fade-in"
                  style={{ background: "rgba(14,14,22,0.98)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 40px rgba(0,0,0,0.6)", minWidth: "160px" }}>
                  {([
                    { key: "default", label: "Default" },
                    { key: "price-low", label: "Price: Low to High" },
                    { key: "price-high", label: "Price: High to Low" },
                    { key: "name", label: "Name: A to Z" },
                  ] as { key: SortMode; label: string }[]).map((opt) => (
                    <button key={opt.key} onClick={() => { setSort(opt.key); setSortOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors"
                      style={{
                        color: sort === opt.key ? "#e11d2a" : "rgba(255,255,255,0.7)",
                        background: sort === opt.key ? "rgba(225,29,42,0.1)" : "transparent",
                        fontWeight: sort === opt.key ? 600 : 400,
                      }}
                      onMouseEnter={(e) => { if (sort !== opt.key) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { if (sort !== opt.key) e.currentTarget.style.background = "transparent"; }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="mb-8 flex flex-wrap gap-2 relative z-10">
        <button onClick={() => setActiveCat(null)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all"
          style={!activeCat
            ? { background: "linear-gradient(135deg, #e11d2a, #9b0a14)", color: "#fff", border: "1px solid rgba(225,29,42,0.5)", boxShadow: "0 4px 14px rgba(225,29,42,0.3)" }
            : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <LayoutGrid size={12} />
          All
          <span className="px-1.5 py-0.5 rounded-full text-[10px] tabular-nums"
            style={{ background: !activeCat ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)" }}>
            {products.length}
          </span>
        </button>
        {Object.entries(catCounts).map(([cat, count]) => (
          <button key={cat} onClick={() => setActiveCat(cat)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all"
            style={activeCat === cat
              ? { background: "linear-gradient(135deg, #e11d2a, #9b0a14)", color: "#fff", border: "1px solid rgba(225,29,42,0.5)", boxShadow: "0 4px 14px rgba(225,29,42,0.3)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => { if (activeCat !== cat) { e.currentTarget.style.borderColor = "rgba(225,29,42,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
            onMouseLeave={(e) => { if (activeCat !== cat) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}>
            {cat}
            <span className="px-1.5 py-0.5 rounded-full text-[10px] tabular-nums"
              style={{ background: activeCat === cat ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)" }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Search size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
          <p className="text-sm font-medium text-white mb-1">{t.noResults}</p>
          <button onClick={() => { setSearch(""); setActiveCat(null); }}
            className="text-xs mt-2 transition-colors"
            style={{ color: "#e11d2a" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#ff2d3f"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#e11d2a"; }}>
            Clear filters
          </button>
        </div>
      ) : (
        (() => {
          const groups: { category: string; items: SellAuthProduct[] }[] = [];
          for (const p of filtered) {
            const cat = getProductCategory(p);
            let g = groups.find((g) => g.category === cat);
            if (!g) { g = { category: cat, items: [] }; groups.push(g); }
            g.items.push(p);
          }
          return (
            <div className="space-y-12">
              {groups.map((group, gi) => (
                <section key={group.category} className="animate-fade-in-up relative" style={{ animationDelay: `${gi * 0.08}s` }}>
                  {/* Category header */}
                  <div className="relative mb-6 overflow-hidden" style={{ minHeight: "3.5rem" }}>
                    <span className="absolute left-0 top-0 font-black leading-none select-none pointer-events-none"
                      style={{
                        fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
                        color: "rgba(255,255,255,0.05)",
                        letterSpacing: "-0.02em",
                        fontFamily: "'Space Grotesk', sans-serif",
                        lineHeight: 1,
                      }} aria-hidden>
                      {group.category}
                    </span>
                    <div className="relative flex items-center gap-3 pt-8">
                      <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(180deg, #e11d2a, #8b0a14)" }} />
                      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {group.category}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(225,29,42,0.12)", border: "1px solid rgba(225,29,42,0.25)", color: "rgba(255,255,255,0.55)" }}>
                        {group.items.length}
                      </span>
                      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)" }} />
                    </div>
                  </div>

                  {/* Products grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {group.items.map((product, idx) => (
                      <ProductCard key={product.id} product={product} onClick={() => setSelected(product)}
                        index={idx + gi * 4} t={t} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          );
        })()
      )}

      {selected && (() => {
        const live = products.find((p) => p.id === selected.id) ?? selected;
        return (
          <ProductModal product={live} onClose={() => setSelected(null)}
            onAdd={(p, v) => { onAdd(p, v); setSelected(null); }}
            onBuyNow={(p, v) => { onBuyNow(p, v); setSelected(null); }}
            lang={lang} />
        );
      })()}
    </div>
  );
}

function sortLabel(s: SortMode): string {
  switch (s) {
    case "price-low": return "Price ↑";
    case "price-high": return "Price ↓";
    case "name": return "A-Z";
    default: return "Sort";
  }
}

const CARD_ACCENTS = [
  { glow: "rgba(225,29,42,0.12)" },
  { glow: "rgba(59,130,246,0.10)" },
  { glow: "rgba(16,185,129,0.10)" },
  { glow: "rgba(245,158,11,0.10)" },
];

function ProductCard({ product, onClick, index, t }: {
  product: SellAuthProduct;
  onClick: () => void;
  index: number;
  t: TranslationDict;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const name = getProductName(product);
  const img = getProductImage(product);
  const price = getLowestPrice(product);
  const isMulti = hasMultipleVariants(product);
  const active = isProductActive(product);
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
  }
  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "";
  }

  return (
    <button ref={cardRef} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className="review-card-3d review-border-sweep rounded-2xl overflow-hidden text-left group animate-card-tilt relative"
      style={{
        animationDelay: `${index * 0.05}s`,
        background: "linear-gradient(180deg, rgba(20,20,28,0.9), rgba(12,12,18,0.9))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
      }}>
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${accent.glow}, 0 0 30px ${accent.glow}` }} />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        <img src={img} alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = "/assets/images/image.png"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent opacity-60" />
        {/* Status badge */}
        <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
          style={{
            background: active ? "rgba(16,185,129,0.2)" : "rgba(225,29,42,0.2)",
            color: active ? "#10b981" : "#ff6b75",
            border: `1px solid ${active ? "rgba(16,185,129,0.3)" : "rgba(225,29,42,0.3)"}`,
          }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? "#10b981" : "#e11d2a" }} />
          {active ? t.inStock : t.outOfStock}
        </span>
        {/* Quick view overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(7,7,10,0.4)", backdropFilter: "blur(2px)" }}>
          <div className="px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            style={{ background: "rgba(225,29,42,0.9)", backdropFilter: "blur(8px)" }}>
            <Sparkles size={12} />
            Quick View
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5 relative z-10">
        <h3 className="font-semibold text-sm text-white truncate">{name}</h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill="#e11d2a" stroke="none" />
          ))}
          <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>4.9</span>
        </div>
        <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="pt-2">
            {isMulti && <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.startsAt} </span>}
            <span className="font-bold text-base" style={{ color: "#e11d2a" }}>
              {price > 0 ? formatPrice(price) : "Free"}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium pt-2 transition-all group-hover:gap-2"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            View <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </button>
  );
}

function ProductsSkeleton() {
  return (
    <div className="animate-tab">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl shimmer" />
        <div className="space-y-2">
          <div className="h-4 rounded-lg shimmer w-24" />
          <div className="h-3 rounded-lg shimmer w-32" />
        </div>
      </div>
      <div className="flex gap-2 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 rounded-full shimmer w-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="aspect-[4/3] shimmer" />
            <div className="p-4 space-y-2">
              <div className="h-4 rounded-lg shimmer w-3/4" />
              <div className="h-3 rounded-lg shimmer w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
