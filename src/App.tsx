import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import HomePage from "@/components/HomePage";
import ProductsPage from "@/components/ProductsPage";
import StatusPage from "@/components/StatusPage";
import ReviewsPage from "@/components/ReviewsPage";
import CartPanel from "@/components/CartPanel";
import CheckoutPage from "@/components/CheckoutPage";
import ProductModal from "@/components/ProductModal";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useReviews } from "@/hooks/useReviews";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { SellAuthProduct, SellAuthVariant, TabKey } from "@/types";
import type { Lang, TranslationDict } from "@/lib/i18n";
import { translations } from "@/lib/i18n";
import { getProductName } from "@/lib/products";

export default function App() {
  const [tab, setTab] = useState<TabKey>("home");
  const [lang, setLang] = useState<Lang>("EN");
  const { products, categories, loading, error } = useProducts();
  const { reviews, loading: reviewsLoading, setReviews } = useReviews();
  const { methods: paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  const cart = useCart();
  const [viewProduct, setViewProduct] = useState<SellAuthProduct | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderConfirm, setOrderConfirm] = useState(false);
  const [pendingReviewProduct, setPendingReviewProduct] = useState<string | null>(null);
  const [sweepKey, setSweepKey] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    document.title = "Flux — Premium Digital Goods";
  }, []);

  function handleBuyNow(product: SellAuthProduct, variant?: SellAuthVariant | null, qty = 1) {
    cart.addToCart(product, variant, qty);
    setViewProduct(null);
    cart.setOpen(false);
    setCheckoutOpen(true);
  }

  function handleCheckout() {
    if (cart.items.length === 0) return;
    cart.setOpen(false);
    setCheckoutOpen(true);
  }

  function handlePlaceOrder() {
    const firstName = getProductName(cart.items[0].product);
    cart.clearCart();
    setCheckoutOpen(false);
    setPendingReviewProduct(firstName);
    setOrderConfirm(true);
  }

  function handleTabChange(newTab: TabKey) {
    if (newTab === tab) return;
    setSweepKey((k) => k + 1);
    setTab(newTab);
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />
      </div>

      <Navbar
        activeTab={tab}
        onTabChange={handleTabChange}
        cartCount={cart.totalItems}
        onCartOpen={() => cart.setOpen(true)}
        lang={lang}
        onLangChange={setLang}
      />

      <main className="relative z-10 pt-24 pb-16 px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Sweep flash on tab change */}
        {!checkoutOpen && (
          <div key={`sweep-${sweepKey}`} className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
            <div className="absolute inset-y-0 w-1/3 animate-sweep"
              style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,42,0.25), transparent)" }} />
          </div>
        )}

        {checkoutOpen ? (
          <CheckoutPage
            items={cart.items}
            totalPrice={cart.totalPrice}
            lang={lang}
            onBack={() => setCheckoutOpen(false)}
            onPlaceOrder={handlePlaceOrder}
            paymentMethods={paymentMethods}
            paymentMethodsLoading={paymentMethodsLoading}
          />
        ) : (
        <div key={tab} className="animate-page-enter">
          {tab === "home" && (
            <HomePage
              products={products}
              loading={loading}
              lang={lang}
              onShop={() => handleTabChange("products")}
              onStatus={() => handleTabChange("status")}
              onViewProduct={(p) => setViewProduct(p)}
            />
          )}
          {tab === "products" && (
            <ProductsPage
              products={products}
              categories={categories}
              loading={loading}
              error={error}
              lang={lang}
              onAdd={(p, v, qty) => cart.addToCart(p, v, qty)}
              onBuyNow={handleBuyNow}
            />
          )}
          {tab === "status" && (
            <StatusPage products={products} loading={loading} lang={lang} />
          )}
          {tab === "reviews" && (
            <ReviewsPage
              reviews={reviews}
              loading={reviewsLoading}
              setReviews={setReviews}
              lang={lang}
              pendingReviewProduct={pendingReviewProduct}
              onClearPending={() => setPendingReviewProduct(null)}
            />
          )}
        </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t mt-8 py-8 px-6 lg:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/assets/images/Redf-removebg-preview.png" alt="Flux" className="h-6 w-auto"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Flux</span>
            <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.3)" }}>© 2026</span>
          </div>
          <a href="https://discord.com/invite/nfKVvuns7a" target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#e11d2a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
            {t.joinDiscord}
          </a>
        </div>
      </footer>

      {/* Cart */}
      <CartPanel
        open={cart.open}
        onClose={() => cart.setOpen(false)}
        items={cart.items}
        onRemove={cart.removeFromCart}
        onUpdateQty={cart.updateQuantity}
        totalPrice={cart.totalPrice}
        lang={lang}
        onCheckout={handleCheckout}
      />

      {/* View product modal (from home featured) */}
      {viewProduct && tab === "home" && (() => {
        const live = products.find((p) => p.id === viewProduct.id) ?? viewProduct;
        return (
        <ProductModalLazy
          product={live}
          onClose={() => setViewProduct(null)}
          onAdd={(p, v, qty) => { cart.addToCart(p, v, qty); setViewProduct(null); }}
          onBuyNow={(p, v, qty) => { handleBuyNow(p, v, qty); setViewProduct(null); }}
          lang={lang}
        />
        );
      })()}

      {/* Order confirmation */}
      {orderConfirm && !pendingReviewProduct && (
        <OrderConfirm
          onClose={() => setOrderConfirm(false)}
          onReview={() => { setOrderConfirm(false); setTab("reviews"); setPendingReviewProduct(""); }}
          t={t}
        />
      )}
    </div>
  );
}

function OrderConfirm({ onClose, onReview, t }: {
  onClose: () => void;
  onReview: () => void;
  t: TranslationDict;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-fade-in" />
      <div className="relative w-full max-w-sm rounded-2xl p-7 text-center animate-fade-in-scale"
        style={{
          background: "linear-gradient(145deg, #0e0e18, #0a0a12)",
          border: "1px solid rgba(225,29,42,0.35)",
          boxShadow: "0 0 60px rgba(225,29,42,0.25), 0 24px 60px rgba(0,0,0,0.8)",
        }}>
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}>
          <X size={16} />
        </button>
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow"
          style={{ background: "linear-gradient(135deg, rgba(225,29,42,0.2), rgba(225,29,42,0.05))", border: "1px solid rgba(225,29,42,0.3)" }}>
          <CheckCircle size={28} style={{ color: "#e11d2a" }} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{t.orderConfirmed}</h3>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>{t.orderConfirmedDesc}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
            {t.close}
          </button>
          <button onClick={onReview} className="btn-red flex-1 py-2.5 rounded-xl text-sm font-semibold">
            {t.leaveReview}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModalLazy(props: React.ComponentProps<typeof ProductModal>) {
  return <ProductModal {...props} />;
}
