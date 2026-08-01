import {
  CheckCircle, AlertCircle, XCircle, Activity, Package,
  RefreshCw, Server, ShieldCheck, Zap, TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { SellAuthProduct } from "@/types";
import { getProductName, getProductImage, isProductActive } from "@/lib/products";
import type { Lang } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface StatusPageProps {
  products: SellAuthProduct[];
  loading: boolean;
  lang: Lang;
}

const SERVICES = [
  { name: "API Gateway", uptime: 99.98, icon: Server },
  { name: "Checkout Engine", uptime: 99.97, icon: ShieldCheck },
  { name: "Delivery System", uptime: 100, icon: Package },
  { name: "Authentication", uptime: 99.99, icon: ShieldCheck },
  { name: "CDN Network", uptime: 99.95, icon: Zap },
];

function getStatusInfo(p: SellAuthProduct, t: { operational: string; outOfStock: string }) {
  const color = p.status_color;
  const text = p.status_text;
  if (color || text) {
    return { label: text || "Custom Status", color: color || "#e11d2a", custom: true };
  }
  const active = isProductActive(p);
  return active
    ? { label: t.operational, color: "#10b981", custom: false }
    : { label: t.outOfStock, color: "#e11d2a", custom: false };
}

export default function StatusPage({ products, loading, lang }: StatusPageProps) {
  const t = translations[lang];
  const activeCount = products.filter(isProductActive).length;
  const inactiveCount = products.length - activeCount;
  const customStatusCount = products.filter((p) => p.status_color || p.status_text).length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock_count || p.stock || 0), 0);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const overallHealthy = inactiveCount === 0;

  return (
    <div className="space-y-6 animate-tab">
      {/* Hero status banner */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{
          background: overallHealthy
            ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.03))"
            : "linear-gradient(135deg, rgba(225,29,42,0.10), rgba(245,158,11,0.04))",
          border: `1px solid ${overallHealthy ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
        }}>
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20"
          style={{ background: overallHealthy ? "#10b981" : "#f59e0b" }} />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="p-3.5 rounded-2xl"
                style={{
                  background: overallHealthy ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                  border: `1px solid ${overallHealthy ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
                }}>
                {overallHealthy
                  ? <CheckCircle size={26} style={{ color: "#10b981" }} />
                  : <AlertCircle size={26} style={{ color: "#f59e0b" }} />}
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                  style={{ background: overallHealthy ? "#10b981" : "#f59e0b" }} />
                <span className="relative inline-flex rounded-full h-3 w-3"
                  style={{ background: overallHealthy ? "#10b981" : "#f59e0b" }} />
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {overallHealthy ? t.allOperational : `${inactiveCount} ${t.inactiveProducts}`}
              </h2>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {now.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="sm:ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
            <span className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: overallHealthy ? "#10b981" : "#f59e0b" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
              Live Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: t.totalProducts, value: loading ? "—" : products.length, icon: Package, color: "#e11d2a" },
          { label: t.activeProducts, value: loading ? "—" : activeCount, icon: CheckCircle, color: "#10b981" },
          { label: t.inactiveProducts, value: loading ? "—" : inactiveCount, icon: XCircle, color: "#f59e0b" },
          { label: "Units in Stock", value: loading ? "—" : totalStock, icon: TrendingUp, color: "#3b82f6" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label}
            className="group rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg transition-colors"
                style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Services health */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="px-5 py-4 flex items-center gap-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="p-1.5 rounded-lg" style={{ background: "rgba(225,29,42,0.1)" }}>
            <Activity size={14} style={{ color: "#e11d2a" }} />
          </div>
          <h3 className="font-semibold text-white text-sm">{t.storeHealth}</h3>
        </div>
        <div>
          {SERVICES.map((svc, i) => (
            <div key={svc.name}
              className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: i < SERVICES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md" style={{ background: "rgba(16,185,129,0.08)" }}>
                  <svc.icon size={13} style={{ color: "#10b981" }} />
                </div>
                <span className="text-sm text-white">{svc.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <UptimeBar uptime={svc.uptime} />
                <span className="text-xs font-semibold tabular-nums w-12 text-right" style={{ color: "#10b981" }}>
                  {svc.uptime}%
                </span>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                  {t.operational}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product status list */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: "rgba(225,29,42,0.1)" }}>
              <Package size={14} style={{ color: "#e11d2a" }} />
            </div>
            <h3 className="font-semibold text-white text-sm">{t.productStatus}</h3>
          </div>
          {!loading && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {products.length} products
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-10 gap-3">
            <RefreshCw size={16} className="animate-spin" style={{ color: "#e11d2a" }} />
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{t.loading}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-10" style={{ color: "rgba(255,255,255,0.4)" }}>{t.noProducts}</div>
        ) : (
          <div>
            {products.map((p, i) => {
              const status = getStatusInfo(p, t);
              const stock = p.stock_count ?? p.stock ?? 0;
              return (
                <div key={p.id}
                  className="group flex items-center gap-3 sm:gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: i < products.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div className="relative shrink-0">
                    <img
                      src={getProductImage(p)}
                      alt={getProductName(p)}
                      className="w-10 h-10 rounded-lg object-cover"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                      onError={(e) => { e.currentTarget.src = "/assets/images/image.png"; }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full"
                      style={{
                        background: status.color,
                        boxShadow: `0 0 6px ${status.color}80`,
                        border: "2px solid #0a0a0f",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{getProductName(p)}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {stock > 0 ? `${stock} in stock` : "No stock"}
                    </p>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                    style={{
                      background: `${status.color}15`,
                      color: status.color,
                      border: `1px solid ${status.color}30`,
                    }}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function UptimeBar({ uptime }: { uptime: number }) {
  const bars = 24;
  const filledBars = Math.round((uptime / 100) * bars);
  return (
    <div className="hidden sm:flex gap-[2px]">
      {[...Array(bars)].map((_, i) => (
        <div key={i}
          className="w-[3px] h-5 rounded-sm transition-all duration-300"
          style={{
            background: i < filledBars ? "#10b981" : "rgba(255,255,255,0.06)",
            opacity: i < filledBars ? 1 : 0.5,
          }} />
      ))}
    </div>
  );
}
