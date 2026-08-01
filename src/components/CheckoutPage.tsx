import { useState } from "react";
import {
  ArrowLeft, Lock, CreditCard, Wallet, Mail, User, Shield,
  CheckCircle, Loader2, Package, Sparkles, Zap, ChevronRight, Bitcoin,
  Building2, Landmark, Coins, Gift, Banknote, Smartphone, Globe, AlertCircle,
} from "lucide-react";
import type { CartItem, SellAuthPaymentMethod } from "@/types";
import { getProductName, getProductImage, formatPrice } from "@/lib/products";
import type { Lang } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface CheckoutPageProps {
  items: CartItem[];
  totalPrice: number;
  lang: Lang;
  onBack: () => void;
  onPlaceOrder: () => void;
  paymentMethods: SellAuthPaymentMethod[];
  paymentMethodsLoading: boolean;
}

const GATEWAY_ICON: Record<string, React.ReactNode> = {
  STRIPE: <CreditCard size={20} />,
  SQUARE: <CreditCard size={20} />,
  SUMUP: <CreditCard size={20} />,
  MOLLIE: <CreditCard size={20} />,
  SKRILL: <Wallet size={20} />,
  AUTHORIZENET: <CreditCard size={20} />,
  REVOLUTBUSINESS: <Landmark size={20} />,
  LEMONSQUEEZY: <CreditCard size={20} />,
  NMI: <CreditCard size={20} />,
  OVERPAY: <CreditCard size={20} />,
  MONEI: <CreditCard size={20} />,
  RAZORPAY: <CreditCard size={20} />,
  PANDABASE: <CreditCard size={20} />,
  VENPAYR: <CreditCard size={20} />,
  OVGC: <CreditCard size={20} />,
  ADYEN: <CreditCard size={20} />,
  SHOPIFY: <Building2 size={20} />,
  AMAZONPS: <CreditCard size={20} />,
  PAYCEK: <CreditCard size={20} />,
  PAYPAL: <Wallet size={20} />,
  PAYPALFF: <Wallet size={20} />,
  CASHAPP: <Banknote size={20} />,
  VENMO: <Smartphone size={20} />,
  REWARBLE: <Gift size={20} />,
  BTC: <Bitcoin size={20} />,
  LTC: <Coins size={20} />,
  CUSTOMERBALANCE: <Coins size={20} />,
};

function iconFor(method: SellAuthPaymentMethod): React.ReactNode {
  if (method.icon_image_url) return null;
  const key = (method.type || "").toUpperCase();
  return GATEWAY_ICON[key] ?? <Globe size={20} />;
}

export default function CheckoutPage({
  items, totalPrice, lang, onBack, onPlaceOrder,
  paymentMethods, paymentMethodsLoading,
}: CheckoutPageProps) {
  const t = translations[lang];
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<SellAuthPaymentMethod | null>(null);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  const activeMethods = paymentMethods.length > 0
    ? paymentMethods
    : [];

  function validate() {
    const e: { email?: string; name?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (name.trim().length < 2) e.name = "Enter your name";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePlace() {
    if (!validate()) return;
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      onPlaceOrder();
    }, 1600);
  }

  const subtotal = totalPrice;
  const fee = subtotal * 0.03;
  const total = subtotal + fee;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="relative max-w-6xl mx-auto animate-page-enter">
      {/* Ambient orbs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />
      <div className="absolute top-40 -right-20 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, #4f8ef7, transparent 70%)", animationDelay: "6s" }} />

      {/* Header */}
      <div className="relative flex items-center gap-4 mb-10">
        <button onClick={onBack}
          className="group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,42,0.15)"; e.currentTarget.style.borderColor = "rgba(225,29,42,0.4)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" style={{ color: "rgba(255,255,255,0.7)" }} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Checkout
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
              <Lock size={11} style={{ color: "#10b981" }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#10b981" }}>Secure</span>
            </div>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Complete your order — it only takes a moment
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="relative flex items-center gap-2 mb-8">
        <StepDot n={1} label="Information" active done />
        <StepLine done />
        <StepDot n={2} label="Payment" active />
        <StepLine />
        <StepDot n={3} label="Confirmation" />
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left: forms */}
        <div className="space-y-5">
          {/* Customer info */}
          <GlassCard>
            <CardHeader step={1} icon={<User size={15} />} title="Customer Information" sub="Where should we send your order?" />
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <Field label="Full Name" error={errors.name}>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${errors.name ? "rgba(225,29,42,0.5)" : "rgba(255,255,255,0.08)"}` }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(225,29,42,0.5)"; e.currentTarget.style.background = "rgba(225,29,42,0.04)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? "rgba(225,29,42,0.5)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} />
                </div>
              </Field>
              <Field label="Email Address" error={errors.email}>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${errors.email ? "rgba(225,29,42,0.5)" : "rgba(255,255,255,0.08)"}` }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(225,29,42,0.5)"; e.currentTarget.style.background = "rgba(225,29,42,0.04)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "rgba(225,29,42,0.5)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} />
                </div>
              </Field>
            </div>
          </GlassCard>

          {/* Payment method */}
          <GlassCard>
            <CardHeader step={2} icon={<CreditCard size={15} />} title="Payment Method" sub="Choose how you'd like to pay" />

            {paymentMethodsLoading ? (
              <div className="mt-5 flex items-center justify-center py-10 gap-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading payment options…</span>
              </div>
            ) : activeMethods.length === 0 ? (
              <div className="mt-5 flex flex-col items-center justify-center py-8 gap-2 text-center"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                <AlertCircle size={22} style={{ color: "rgba(225,29,42,0.6)" }} />
                <span className="text-sm">No payment methods are configured for this store yet.</span>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                {activeMethods.map((m) => (
                  <PayOption
                    key={m.id}
                    active={selectedMethod?.id === m.id}
                    onClick={() => setSelectedMethod(m)}
                    iconUrl={m.icon_image_url ?? null}
                    icon={iconFor(m)}
                    label={m.name || m.type}
                    sub={m.type}
                  />
                ))}
              </div>
            )}

            {selectedMethod && selectedMethod.icon_image_url === null && isCardType(selectedMethod.type) && (
              <div className="mt-5 space-y-3 animate-fade-in">
                <Field label="Card Number">
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                    <input placeholder="4242 4242 4242 4242"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(225,29,42,0.5)"; e.currentTarget.style.background = "rgba(225,29,42,0.04)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry">
                    <input placeholder="MM / YY"
                      className="w-full px-3.5 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(225,29,42,0.5)"; e.currentTarget.style.background = "rgba(225,29,42,0.04)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} />
                  </Field>
                  <Field label="CVC">
                    <input placeholder="123"
                      className="w-full px-3.5 py-3 rounded-xl text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(225,29,42,0.5)"; e.currentTarget.style.background = "rgba(225,29,42,0.04)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} />
                  </Field>
                </div>
              </div>
            )}

            {selectedMethod && !isCardType(selectedMethod.type) && selectedMethod.type.toUpperCase() !== "CUSTOMERBALANCE" && (
              <div className="mt-5 p-5 rounded-xl text-center animate-fade-in flex flex-col items-center gap-3"
                style={{ background: "rgba(79,142,247,0.05)", border: "1px solid rgba(79,142,247,0.15)" }}>
                <Wallet size={28} style={{ color: "#4f8ef7" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  You'll be redirected to {selectedMethod.name} to complete your purchase securely.
                </p>
              </div>
            )}

            {selectedMethod && selectedMethod.type.toUpperCase() === "CUSTOMERBALANCE" && (
              <div className="mt-5 p-5 rounded-xl text-center animate-fade-in flex flex-col items-center gap-3"
                style={{ background: "rgba(247,147,34,0.05)", border: "1px solid rgba(247,147,34,0.15)" }}>
                <Coins size={28} style={{ color: "#f7931a" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Your account balance will be used to pay for this order.
                </p>
              </div>
            )}
          </GlassCard>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <TrustBadge icon={<Shield size={13} />} label="SSL Encrypted" />
            <TrustBadge icon={<Package size={13} />} label="Instant Delivery" />
            <TrustBadge icon={<Sparkles size={13} />} label="24/7 Support" />
          </div>
        </div>

        {/* Right: order summary */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="relative rounded-2xl overflow-hidden animate-fade-in-scale"
            style={{
              background: "linear-gradient(180deg, rgba(22,22,30,0.95), rgba(12,12,18,0.95))",
              border: "1px solid rgba(225,29,42,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(225,29,42,0.08)",
            }}>
            {/* Top accent */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,42,0.8), transparent)" }} />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-20 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse, #e11d2a, transparent)" }} />

            <div className="relative p-5">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(225,29,42,0.12)", border: "1px solid rgba(225,29,42,0.25)" }}>
                  <Package size={16} style={{ color: "#e11d2a" }} />
                </div>
                <h3 className="font-semibold text-white text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Order Summary
                </h3>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-lg font-semibold"
                  style={{ background: "rgba(225,29,42,0.15)", color: "#e11d2a", border: "1px solid rgba(225,29,42,0.25)" }}>
                  {totalQty} {totalQty === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 -mr-1">
                {items.map((item, i) => (
                  <SummaryRow key={i} item={item} />
                ))}
              </div>

              <div className="mt-5 pt-4 space-y-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <Line label="Subtotal" value={formatPrice(subtotal)} />
                <Line label="Processing Fee" value={formatPrice(fee)} muted />
                <div className="flex items-center justify-between pt-3 mt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <span className="font-semibold text-white">Total</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold" style={{ color: "#e11d2a", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={handlePlace} disabled={placing || !selectedMethod}
                className="group relative w-full mt-5 py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                style={{
                  background: placing ? "rgba(225,29,42,0.5)" : "linear-gradient(135deg, #e11d2a, #a0121f)",
                  border: "1px solid rgba(225,29,42,0.5)",
                  color: "#fff",
                  boxShadow: placing ? "none" : "0 8px 24px rgba(225,29,42,0.4)",
                }}>
                {!placing && (
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, #f0202e, #c01623)" }} />
                )}
                {placing ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing payment...</>
                ) : !selectedMethod ? (
                  <><Lock size={15} /> Select a payment method</>
                ) : (
                  <><Lock size={15} className="relative" /> Place Order · {formatPrice(total)} <ChevronRight size={15} className="relative transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Zap size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
                <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Instant delivery after payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isCardType(type: string): boolean {
  const cardTypes = ["STRIPE", "SQUARE", "SUMUP", "MOLLIE", "AUTHORIZENET", "NMI", "OVERPAY", "MONEI", "RAZORPAY", "PANDABASE", "VENPAYR", "ADYEN", "AMAZONPS", "PAYCEK", "LEMONSQUEEZY"];
  return cardTypes.includes((type || "").toUpperCase());
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl p-5 animate-fade-in overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(22,22,30,0.85), rgba(14,14,20,0.85))",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
      {children}
    </div>
  );
}

function CardHeader({ step, icon, title, sub }: {
  step: number; icon: React.ReactNode; title: string; sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: "rgba(225,29,42,0.12)", color: "#e11d2a", border: "1px solid rgba(225,29,42,0.25)" }}>
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span style={{ color: "#e11d2a" }}>{icon}</span>
          <h2 className="font-semibold text-white">{title}</h2>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>
      </div>
    </div>
  );
}

function StepDot({ n, label, active, done }: { n: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        style={{
          background: done ? "rgba(225,29,42,0.9)" : active ? "rgba(225,29,42,0.15)" : "rgba(255,255,255,0.05)",
          color: done ? "#fff" : active ? "#e11d2a" : "rgba(255,255,255,0.4)",
          border: `1.5px solid ${done ? "rgba(225,29,42,0.9)" : active ? "rgba(225,29,42,0.5)" : "rgba(255,255,255,0.1)"}`,
          boxShadow: done ? "0 0 12px rgba(225,29,42,0.4)" : "none",
        }}>
        {done ? <CheckCircle size={14} /> : n}
      </div>
      <span className="text-xs font-medium hidden sm:inline" style={{ color: active || done ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)" }}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ done }: { done?: boolean }) {
  return (
    <div className="flex-1 h-px mx-1 rounded-full transition-all duration-500"
      style={{ background: done ? "rgba(225,29,42,0.6)" : "rgba(255,255,255,0.08)" }} />
  );
}

function Field({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      {children}
      {error && <span className="block text-xs mt-1.5 flex items-center gap-1" style={{ color: "#e11d2a" }}>{error}</span>}
    </label>
  );
}

function PayOption({ active, onClick, iconUrl, icon, label, sub }: {
  active: boolean; onClick: () => void; iconUrl: string | null; icon: React.ReactNode; label: string; sub: string;
}) {
  return (
    <button onClick={onClick}
      className="relative p-4 rounded-xl text-left transition-all duration-200 group"
      style={{
        background: active ? "rgba(225,29,42,0.08)" : "rgba(255,255,255,0.02)",
        border: `1.5px solid ${active ? "rgba(225,29,42,0.5)" : "rgba(255,255,255,0.06)"}`,
        boxShadow: active ? "0 0 20px rgba(225,29,42,0.1)" : "none",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
      {active && (
        <CheckCircle size={15} className="absolute top-2.5 right-2.5 animate-star-pop" style={{ color: "#e11d2a" }} />
      )}
      <div className="mb-2 transition-transform group-hover:scale-110" style={{ color: active ? "#e11d2a" : "rgba(255,255,255,0.6)" }}>
        {iconUrl ? (
          <img src={iconUrl} alt={label} className="w-5 h-5 object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          icon
        )}
      </div>
      <p className="text-sm font-semibold text-white truncate">{label}</p>
      <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>
    </button>
  );
}

function SummaryRow({ item }: { item: CartItem }) {
  const name = getProductName(item.product);
  const img = getProductImage(item.product);
  const price = Number(item.variant?.price ?? item.product.price ?? 0);
  return (
    <div className="flex gap-3 items-center p-2 -mx-2 rounded-lg transition-colors hover:bg-white/[0.02]">
      <div className="relative shrink-0">
        <img src={img} alt={name} className="w-12 h-12 rounded-lg object-cover"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          onError={(e) => { e.currentTarget.src = "/assets/images/image.png"; }} />
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: "#e11d2a", color: "#fff", boxShadow: "0 2px 8px rgba(225,29,42,0.4)" }}>
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        {item.variant && (
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium"
            style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", color: "#7ba8f5" }}>
            {item.variant.name || item.variant.title}
          </span>
        )}
      </div>
      <span className="text-sm font-semibold shrink-0" style={{ color: "rgba(255,255,255,0.85)" }}>
        {formatPrice(price * item.quantity)}
      </span>
    </div>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: muted ? "rgba(255,255,255,0.45)" : "#fff" }}>{value}</span>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.03]"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ color: "rgba(255,255,255,0.45)" }}>{icon}</span>
      <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
    </div>
  );
}
