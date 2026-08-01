import { useRef, useState, type MouseEvent } from "react";
import {
  ArrowRight, Zap, Shield, Users, Package, Star, TrendingUp,
  Sparkles, Clock, Lock, Headphones, ChevronRight, Flame,
} from "lucide-react";
import type { SellAuthProduct } from "@/types";
import {
  getProductName, getProductImage, getLowestPrice,
  hasMultipleVariants, formatPrice, isProductActive,
} from "@/lib/products";
import type { Lang, TranslationDict } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface HomePageProps {
  products: SellAuthProduct[];
  loading: boolean;
  lang: Lang;
  onShop: () => void;
  onStatus: () => void;
  onViewProduct: (p: SellAuthProduct) => void;
}

export default function HomePage({ products, loading, lang, onShop, onStatus, onViewProduct }: HomePageProps) {
  const t = translations[lang];
  const featured = products.slice(0, 4);

  return (
    <div className="animate-tab relative">
      {/* Hero */}
      <section className="relative pt-10 pb-20 px-2 text-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-radial-red" />
        {/* Floating orbs */}
        <div className="absolute top-0 left-[10%] w-72 h-72 rounded-full opacity-[0.12] blur-3xl pointer-events-none animate-orb"
          style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />
        <div className="absolute top-20 right-[8%] w-96 h-96 rounded-full opacity-[0.08] blur-3xl pointer-events-none animate-orb"
          style={{ background: "radial-gradient(circle, #ff2d3f, transparent 70%)", animationDelay: "5s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #e11d2a, transparent 70%)" }} />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-7 animate-fade-in-up"
            style={{
              background: "rgba(225,29,42,0.08)",
              border: "1px solid rgba(225,29,42,0.25)",
              color: "#ff6b75",
            }}>
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ background: "#e11d2a" }} />
              <span className="relative rounded-full w-2 h-2" style={{ background: "#e11d2a" }} />
            </span>
            {t.trustedBy}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.08] mb-5 animate-fade-in-up delay-1 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {t.heroTitle.split(",")[0]},
            <span className="block mt-1">
              <span className="text-glow" style={{ color: "#e11d2a" }}>{t.heroTitle.split(",")[1]}</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg mb-9 max-w-xl mx-auto animate-fade-in-up delay-2 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            {t.heroSubtitle}
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 animate-fade-in-up delay-3">
            <button onClick={onShop}
              className="btn-red px-7 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 group">
              {t.shopNow}
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={onStatus}
              className="px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(225,29,42,0.4)";
                e.currentTarget.style.background = "rgba(225,29,42,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}>
              {t.viewStatus}
            </button>
          </div>

          {/* Trust indicators row */}
          <div className="flex items-center justify-center gap-6 mt-10 animate-fade-in-up delay-4">
            {[
              { icon: Zap, text: "Instant Delivery" },
              { icon: Lock, text: "Secure Checkout" },
              { icon: Headphones, text: "24/7 Support" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Icon size={13} style={{ color: "#e11d2a" }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — glassmorphism row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {[
          { label: t.happyCustomers, value: "1K+", icon: Users, color: "#e11d2a", glow: "rgba(225,29,42,0.15)" },
          { label: t.productsSold, value: "1K+", icon: Package, color: "#10b981", glow: "rgba(16,185,129,0.15)" },
          { label: t.averageRating, value: "4.9", icon: Star, color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
          { label: "Uptime", value: "99.9%", icon: TrendingUp, color: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
        ].map(({ label, value, icon: Icon, color, glow }, i) => (
          <div key={label}
            className="relative rounded-2xl p-5 animate-fade-in-up group overflow-hidden transition-all duration-300"
            style={{
              animationDelay: `${i * 0.08}s`,
              background: "rgba(17,17,24,0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${color}40`;
              e.currentTarget.style.boxShadow = `0 8px 32px ${glow}`;
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
            {/* Hover glow orb */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
              style={{ background: glow }} />
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-xs relative" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
          </div>
        ))}
      </section>

      {/* Why choose us — feature cards */}
      <section className="mb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4"
            style={{ background: "rgba(225,29,42,0.08)", border: "1px solid rgba(225,29,42,0.2)", color: "#ff6b75" }}>
            <Sparkles size={12} />
            <span>Why Flux</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Built for speed, designed for trust
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Lightning Fast", desc: "Automated delivery within seconds of purchase. No waiting, no manual processing.", color: "#e11d2a" },
            { icon: Shield, title: "Secure by Design", desc: "Encrypted checkout with trusted payment gateways. Your data stays protected.", color: "#10b981" },
            { icon: Clock, title: "Always Available", desc: "99.9% uptime with 24/7 monitoring. Shop anytime, anywhere, on any device.", color: "#3b82f6" },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <div key={title}
              className="relative rounded-2xl p-6 animate-fade-in-up group overflow-hidden transition-all duration-300"
              style={{
                animationDelay: `${i * 0.1}s`,
                background: "linear-gradient(180deg, rgba(20,20,28,0.6), rgba(12,12,18,0.6))",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}30`;
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
              {/* Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                style={{ background: `${color}20` }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(225,29,42,0.1)", border: "1px solid rgba(225,29,42,0.2)" }}>
              <Flame size={18} style={{ color: "#e11d2a" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {t.featuredProducts}
              </h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Top picks for you</p>
            </div>
          </div>
          <button onClick={onShop}
            className="flex items-center gap-1 text-sm font-medium transition-all group"
            style={{ color: "#e11d2a" }}
            onMouseEnter={(e) => { e.currentTarget.style.gap = "0.5rem"; }}
            onMouseLeave={(e) => { e.currentTarget.style.gap = "0.25rem"; }}>
            View all
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="aspect-[4/3] shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded-lg shimmer w-3/4" />
                  <div className="h-3 rounded-lg shimmer w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.4)" }}>{t.noProducts}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p, i) => (
              <FeaturedCard key={p.id} product={p} onClick={() => onViewProduct(p)} index={i} t={t} />
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA banner */}
      <section className="mb-8">
        <div className="relative rounded-3xl p-8 sm:p-12 text-center overflow-hidden group">
          {/* Background */}
          <div className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(225,29,42,0.12), rgba(139,10,20,0.08))",
              border: "1px solid rgba(225,29,42,0.2)",
            }} />
          <div className="absolute inset-0 bg-grid opacity-20" />
          {/* Orbs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none group-hover:opacity-30 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-15 blur-3xl pointer-events-none group-hover:opacity-25 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle, #ff2d3f, transparent 70%)" }} />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Ready to get started?
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
              Browse our full catalog of premium digital goods and get instant delivery on every order.
            </p>
            <button onClick={onShop}
              className="btn-red px-8 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 group/btn">
              Explore Products
              <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedCard({ product, onClick, index, t }: {
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
        animationDelay: `${index * 0.08}s`,
        background: "linear-gradient(180deg, rgba(20,20,28,0.9), rgba(12,12,18,0.9))",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
      }}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={img} alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = "/assets/images/image.png"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-transparent to-transparent opacity-70" />
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
        {/* Hover overlay arrow */}
        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
          style={{ background: "rgba(225,29,42,0.9)", backdropFilter: "blur(8px)" }}>
          <ArrowRight size={14} className="text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-sm text-white truncate">{name}</h3>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill="#e11d2a" stroke="none" />
          ))}
          <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>4.9</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            {isMulti && <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.startsAt} </span>}
            <span className="font-bold text-base" style={{ color: "#e11d2a" }}>
              {price > 0 ? formatPrice(price) : "Free"}
            </span>
          </div>
          {isMulti && (
            <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              Multi-variant
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
