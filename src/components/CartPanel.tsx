import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types";
import { getProductName, getProductImage, formatPrice } from "@/lib/products";
import type { Lang, TranslationDict } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface CartPanelProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (i: number) => void;
  onUpdateQty: (i: number, q: number) => void;
  totalPrice: number;
  lang: Lang;
  onCheckout: () => void;
}

export default function CartPanel({ open, onClose, items, onRemove, onUpdateQty, totalPrice, lang, onCheckout }: CartPanelProps) {
  const t = translations[lang];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose} />
      )}

      {/* Drawer */}
      <aside className={`fixed top-0 right-0 z-[70] h-full w-full max-w-sm flex flex-col transition-transform duration-350 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          background: "linear-gradient(180deg, #0d0d15, #090910)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          boxShadow: open ? "-20px 0 60px rgba(0,0,0,0.7)" : "none",
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: "#e11d2a" }} />
            <span className="font-semibold text-white">{t.yourCart}</span>
            {items.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-md text-xs font-medium"
                style={{ background: "rgba(225,29,42,0.2)", color: "#e11d2a" }}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "transparent"; }}>
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div className="p-5 rounded-2xl" style={{ background: "rgba(225,29,42,0.07)", border: "1px dashed rgba(225,29,42,0.25)" }}>
                <ShoppingBag size={32} style={{ color: "rgba(225,29,42,0.5)" }} />
              </div>
              <p className="text-center" style={{ color: "rgba(255,255,255,0.4)" }}>{t.emptyCart}</p>
              <button onClick={onClose} className="text-sm font-medium"
                style={{ color: "#e11d2a" }}>
                {t.continueShopping}
              </button>
            </div>
          ) : (
            items.map((item, i) => (
              <CartItemRow key={i} item={item} index={i} onRemove={onRemove} onUpdateQty={onUpdateQty} t={t} />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 space-y-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{t.total}</span>
              <span className="text-xl font-bold text-white">{formatPrice(totalPrice)}</span>
            </div>
            <button onClick={onCheckout} className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #4f8ef7, #2f6fe0)",
                border: "1px solid rgba(79,142,247,0.5)",
                color: "#fff",
                boxShadow: "0 8px 24px rgba(79,142,247,0.35)",
              }}>
              {t.checkout}
            </button>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
              {t.continueShopping}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function CartItemRow({ item, index, onRemove, onUpdateQty, t }: {
  item: CartItem;
  index: number;
  onRemove: (i: number) => void;
  onUpdateQty: (i: number, q: number) => void;
  t: TranslationDict;
}) {
  const name = getProductName(item.product);
  const img = getProductImage(item.product);
  const price = Number(item.variant?.price ?? item.product.price ?? 0);

  return (
    <div className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <img src={img} alt={name} className="w-16 h-16 rounded-lg object-cover shrink-0"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        onError={(e) => { e.currentTarget.src = "/assets/images/image.png"; }} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{name}</p>
        {item.variant && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ background: "rgba(79,142,247,0.12)", border: "1px solid rgba(79,142,247,0.25)", color: "#7ba8f5" }}>
            {item.variant.name || item.variant.title}
          </span>
        )}
        <p className="text-sm font-semibold mt-1" style={{ color: "#e11d2a" }}>{formatPrice(price)}</p>
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => onUpdateQty(index, item.quantity - 1)} className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,42,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}>
            <Minus size={10} />
          </button>
          <span className="text-sm text-white w-5 text-center">{item.quantity}</span>
          <button onClick={() => onUpdateQty(index, item.quantity + 1)} className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.07)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,42,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}>
            <Plus size={10} />
          </button>
          <button onClick={() => onRemove(index)} className="ml-auto p-1 rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#e11d2a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
