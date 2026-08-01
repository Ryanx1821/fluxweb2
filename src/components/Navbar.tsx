import { useState, useRef, useEffect } from "react";
import { Home, Package, Activity, MessageSquare, ShoppingCart, ChevronDown, Globe, MessageCircle } from "lucide-react";
import type { TabKey } from "@/types";
import type { Lang } from "@/lib/i18n";
import { LANGUAGES, translations } from "@/lib/i18n";

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  cartCount: number;
  onCartOpen: () => void;
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

const NAV_TABS = [
  { key: "home" as TabKey, icon: Home },
  { key: "products" as TabKey, icon: Package },
  { key: "status" as TabKey, icon: Activity },
  { key: "reviews" as TabKey, icon: MessageSquare },
];

export default function Navbar({ activeTab, onTabChange, cartCount, onCartOpen, lang, onLangChange }: NavbarProps) {
  const t = translations[lang];
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tabLabels: Record<TabKey, string> = {
    home: t.home,
    products: t.products,
    status: t.status,
    reviews: t.reviews,
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10"
      style={{
        background: "linear-gradient(180deg, rgba(7,7,10,0.98) 0%, rgba(10,10,16,0.92) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.5)",
      }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 select-none shrink-0">
        <img
          src="/assets/images/Redf-removebg-preview.png"
          alt="Flux"
          className="h-8 w-auto"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <span className="font-bold text-xl tracking-tight text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Flux
        </span>
      </div>

      {/* Center Nav */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl px-2 py-1.5"
        style={{
          background: "rgba(14,14,22,0.85)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        {NAV_TABS.map(({ key, icon: Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                background: active ? "linear-gradient(135deg, #e11d2a, #9b0a14)" : "transparent",
                boxShadow: active ? "0 4px 18px rgba(225,29,42,0.4), inset 0 1px 0 rgba(255,255,255,0.15)" : "none",
              }}>
              <Icon size={14} strokeWidth={2.5} />
              <span>{tabLabels[key]}</span>
            </button>
          );
        })}

        {/* Discord support — external link */}
        <a
          href="https://discord.com/invite/nfKVvuns7a"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{ color: "rgba(255,255,255,0.55)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; }}>
          <MessageCircle size={14} strokeWidth={2.5} />
          <span>Discord</span>
        </a>
      </nav>

      {/* Right: Lang + Cart + Customer Panel */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Language picker */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              color: "rgba(255,255,255,0.75)",
              background: langOpen ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}>
            <Globe size={13} strokeWidth={2} />
            <span>{lang}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden animate-fade-in"
              style={{
                background: "rgba(14,14,22,0.98)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
                minWidth: "80px",
              }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => { onLangChange(l); setLangOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors duration-150"
                  style={{
                    color: l === lang ? "#e11d2a" : "rgba(255,255,255,0.75)",
                    background: l === lang ? "rgba(225,29,42,0.12)" : "transparent",
                    fontWeight: l === lang ? 600 : 400,
                  }}
                  onMouseEnter={(e) => { if (l !== lang) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { if (l !== lang) e.currentTarget.style.background = "transparent"; }}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
          style={{
            color: "rgba(255,255,255,0.75)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
          <ShoppingCart size={16} strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
              style={{ background: "linear-gradient(135deg, #e11d2a, #b00a14)", boxShadow: "0 0 8px rgba(225,29,42,0.6)" }}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>

        {/* Customer Panel */}
        <button
          className="btn-red px-4 py-1.5 rounded-lg text-sm font-semibold"
          onClick={() => onTabChange("products")}>
          {t.products}
        </button>
      </div>
    </header>
  );
}
