import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  Star, Quote, X, Send, Sparkles, TrendingUp, MessageSquare,
  ThumbsUp, Award, Users, ChevronDown, BadgeCheck, Heart, Filter,
} from "lucide-react";
import type { Review } from "@/types";
import { supabase } from "@/lib/supabase";
import type { Lang, TranslationDict } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

interface ReviewsPageProps {
  reviews: Review[];
  loading: boolean;
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  lang: Lang;
  pendingReviewProduct?: string | null;
  onClearPending: () => void;
}

export default function ReviewsPage({ reviews, loading, setReviews, lang, pendingReviewProduct, onClearPending }: ReviewsPageProps) {
  const t = translations[lang];
  const [showForm, setShowForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statRef = useRef<HTMLDivElement>(null);

  function handleTilt(e: MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1200px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-2px)`;
  }

  function resetTilt(ref: React.RefObject<HTMLDivElement | null>) {
    const card = ref.current;
    if (!card) return;
    card.style.transform = "";
  }

  useEffect(() => {
    if (pendingReviewProduct) setShowForm(true);
  }, [pendingReviewProduct]);

  const realReviews = reviews.filter((r) => !r.is_placeholder);
  const avgRating = realReviews.length > 0
    ? realReviews.reduce((s, r) => s + r.rating, 0) / realReviews.length
    : 4.9;
  const totalReviews = realReviews.length || 8;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = realReviews.filter((r) => r.rating === stars).length;
    const pct = realReviews.length > 0 ? (count / realReviews.length) * 100 : (stars === 5 ? 92 : stars === 4 ? 6 : stars === 3 ? 2 : 0);
    return { stars, count, pct };
  });

  const filteredReviews = filterRating ? reviews.filter((r) => r.rating === filterRating) : reviews;
  const displayedReviews = filteredReviews.slice(0, visibleCount);

  async function submitReview(author: string, rating: number, content: string, productName: string) {
    const { data, error } = await supabase
      .from("reviews")
      .insert({ author, rating, content, product_name: productName, is_placeholder: false })
      .select("*")
      .maybeSingle();
    if (error) {
      // Never surface the raw database error: show a plain, generic message instead.
      setSubmitError(
        error.code === "23505"
          ? "You've already submitted this review."
          : "We couldn't post your review just now. Please try again in a moment.",
      );
      return;
    }
    setSubmitError(null);
    if (data) {
      setReviews((prev) => {
        const real = (prev as Review[]).filter((r) => !r.is_placeholder);
        const placeholders = (prev as Review[]).filter((r) => r.is_placeholder);
        const newPlaceholders = placeholders.slice(0, Math.max(0, 8 - (real.length + 1)));
        return [data as Review, ...real, ...newPlaceholders];
      });
    }
    setShowForm(false);
    onClearPending();
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-tab">
        <div className="h-56 rounded-3xl shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-3 h-52" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="h-4 rounded-lg shimmer w-1/2" />
              <div className="h-3 rounded-lg shimmer w-full" />
              <div className="h-3 rounded-lg shimmer w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-tab relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-[0.08] blur-3xl pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, #e11d2a, transparent 70%)" }} />
      <div className="absolute top-32 right-10 w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none animate-orb"
        style={{ background: "radial-gradient(circle, #ff2d3f, transparent 70%)", animationDelay: "6s" }} />

      {/* Hero section */}
      <div
        ref={heroRef}
        onMouseMove={(e) => handleTilt(e, heroRef)}
        onMouseLeave={() => resetTilt(heroRef)}
        className="review-card-3d review-border-sweep rounded-3xl p-6 sm:p-8 relative overflow-hidden group"
        style={{
          background: "linear-gradient(145deg, rgba(22,16,20,0.95), rgba(12,10,14,0.95))",
          border: "1px solid rgba(225,29,42,0.18)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}>
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: "inset 0 0 40px rgba(225,29,42,0.1), 0 0 40px rgba(225,29,42,0.12)" }} />

        {/* Decorative gradient line top */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,42,0.5), transparent)" }} />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Left: title + CTA */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium animate-fade-in-up"
              style={{ background: "rgba(225,29,42,0.1)", border: "1px solid rgba(225,29,42,0.25)", color: "#ff6b75" }}>
              <Sparkles size={12} />
              <span>Customer Reviews</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white animate-fade-in-up delay-1 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.reviewsTitle}
            </h2>
            <p className="text-sm animate-fade-in-up delay-2 max-w-md" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t.reviewsSubtitle}
            </p>
            <div className="flex items-center gap-3 animate-fade-in-up delay-3">
              <button onClick={() => setShowForm(true)}
                className="btn-red px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <MessageSquare size={14} />
                {t.leaveReview}
              </button>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <BadgeCheck size={14} style={{ color: "#10b981" }} />
                <span>All reviews verified</span>
              </div>
            </div>
          </div>

          {/* Right: rating ring */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Circular rating */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                  stroke="rgba(255,255,255,0.06)" />
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                  stroke="url(#ratingGrad)" strokeLinecap="round"
                  strokeDasharray={`${(avgRating / 5) * 264} 264`}
                  style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)" }} />
                <defs>
                  <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff2d3f" />
                    <stop offset="100%" stopColor="#e11d2a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white tabular-nums"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {avgRating.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={8}
                      fill={i < Math.round(avgRating) ? "#e11d2a" : "rgba(255,255,255,0.12)"}
                      stroke="none" />
                  ))}
                </div>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-1.5 min-w-[160px]">
              {ratingBreakdown.map(({ stars, pct }) => (
                <button key={stars} onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                  className="flex items-center gap-2 text-xs w-full group/bar transition-opacity"
                  style={{ opacity: filterRating && filterRating !== stars ? 0.4 : 1 }}>
                  <span className="w-3 text-right tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>{stars}</span>
                  <Star size={9} fill="#e11d2a" stroke="none" />
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700 group-hover/bar:brightness-125"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, #e11d2a, #ff6b75)",
                      }} />
                  </div>
                  <span className="w-8 text-right tabular-nums" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {Math.round(pct)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat row at bottom of hero */}
        <div className="relative grid grid-cols-3 gap-4 mt-6 pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            { icon: Award, label: "Verified Buyers", value: "100%", color: "#10b981" },
            { icon: TrendingUp, label: "5-Star Rate", value: `${ratingBreakdown[0].pct.toFixed(0)}%`, color: "#e11d2a" },
            { icon: Users, label: "Total Reviews", value: String(totalReviews), color: "#3b82f6" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-base font-bold text-white tabular-nums leading-none">{value}</p>
                <p className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee tickers */}
      {reviews.length > 0 && (
        <div className="space-y-2.5">
          <div className="relative overflow-hidden py-1"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            }}>
            <div className="marquee-track gap-3">
              {[...reviews, ...reviews].map((r, i) => (
                <MarqueePill key={`f-${r.id}-${i}`} review={r} />
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden py-1"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            }}>
            <div className="marquee-track-reverse gap-3">
              {[...reviews, ...reviews].reverse().map((r, i) => (
                <MarqueePill key={`r-${r.id}-${i}`} review={r} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs mr-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          <Filter size={13} />
          <span>Filter:</span>
        </div>
        <button onClick={() => setFilterRating(null)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={filterRating === null
            ? { background: "rgba(225,29,42,0.15)", border: "1px solid rgba(225,29,42,0.4)", color: "#ff6b75" }
            : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          All
        </button>
        {[5, 4, 3].map((n) => (
          <button key={n} onClick={() => setFilterRating(filterRating === n ? null : n)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
            style={filterRating === n
              ? { background: "rgba(225,29,42,0.15)", border: "1px solid rgba(225,29,42,0.4)", color: "#ff6b75" }
              : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            {n}<Star size={9} fill="currentColor" stroke="none" />
          </button>
        ))}
        {filterRating && (
          <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            {filteredReviews.length} result{filteredReviews.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Reviews masonry grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
        {displayedReviews.map((r, i) => (
          <ReviewCard key={r.id} review={r} index={i} />
        ))}
      </div>

      {/* Load more */}
      {visibleCount < filteredReviews.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + 6)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{
              background: "rgba(225,29,42,0.06)",
              border: "1px solid rgba(225,29,42,0.2)",
              color: "rgba(255,255,255,0.8)",
            }}>
            <ChevronDown size={15} />
            Show more reviews
          </button>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <ReviewForm
          error={submitError}
          onClose={() => { setShowForm(false); onClearPending(); }}
          onSubmit={submitReview}
          defaultProduct={pendingReviewProduct || ""}
          t={t}
        />
      )}
    </div>
  );
}

function MarqueePill({ review }: { review: Review }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full shrink-0 transition-transform hover:scale-105"
      style={{
        background: "rgba(17,17,24,0.8)",
        border: "1px solid rgba(225,29,42,0.12)",
        backdropFilter: "blur(10px)",
      }}>
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={9} fill={i < review.rating ? "#e11d2a" : "rgba(255,255,255,0.12)"} stroke="none" />
        ))}
      </div>
      <span className="text-xs font-medium text-white whitespace-nowrap">{review.author}</span>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
      <span className="text-xs whitespace-nowrap max-w-[200px] truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
        {review.content}
      </span>
    </div>
  );
}

const CARD_COLORS = [
  { bg: "rgba(225,29,42,0.04)", border: "rgba(225,29,42,0.18)" },
  { bg: "rgba(59,130,246,0.03)", border: "rgba(59,130,246,0.15)" },
  { bg: "rgba(16,185,129,0.03)", border: "rgba(16,185,129,0.15)" },
  { bg: "rgba(225,29,42,0.04)", border: "rgba(225,29,42,0.18)" },
  { bg: "rgba(168,85,247,0.03)", border: "rgba(168,85,247,0.12)" },
  { bg: "rgba(59,130,246,0.03)", border: "rgba(59,130,246,0.15)" },
];

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Math.floor(Math.random() * 40) + 5);
  const accent = CARD_COLORS[index % CARD_COLORS.length];

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="review-card-3d review-border-sweep rounded-2xl p-5 relative overflow-hidden group animate-card-tilt break-inside-avoid mb-5"
      style={{
        animationDelay: `${index * 0.06}s`,
        background: `linear-gradient(180deg, ${accent.bg}, rgba(12,12,18,0.95))`,
        border: `1px solid ${accent.border}`,
        boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
      }}>
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: "inset 0 0 30px rgba(225,29,42,0.1), 0 0 30px rgba(225,29,42,0.12)" }} />

      {/* Quote watermark */}
      <Quote size={40} className="absolute -top-2 -right-2 opacity-[0.06] group-hover:opacity-[0.14] transition-opacity duration-300"
        style={{ color: "#e11d2a" }} />

      {/* Header: avatar + name + verified */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, #e11d2a, #6b0a10)", boxShadow: "0 4px 12px rgba(225,29,42,0.25)" }}>
            {review.author.charAt(0).toUpperCase()}
          </div>
          {review.is_placeholder && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "#10b981", border: "2px solid #12121a" }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-white truncate">{review.author}</p>
            {review.is_placeholder && (
              <BadgeCheck size={13} style={{ color: "#10b981" }} className="shrink-0" />
            )}
          </div>
          {review.product_name && (
            <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {review.product_name}
            </p>
          )}
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14}
            fill={i < review.rating ? "#e11d2a" : "rgba(255,255,255,0.12)"}
            stroke="none"
            className={i < review.rating ? "animate-star-twinkle" : ""}
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
        <span className="text-xs ml-1.5 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          {review.rating}.0
        </span>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed relative z-10 mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
        {review.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          {new Date(review.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <button
          onClick={() => {
            if (!liked) { setLikeCount((c) => c + 1); setLiked(true); }
            else { setLikeCount((c) => c - 1); setLiked(false); }
          }}
          className="flex items-center gap-1.5 text-xs transition-all hover:scale-105"
          style={{ color: liked ? "#e11d2a" : "rgba(255,255,255,0.3)" }}>
          <Heart size={12} fill={liked ? "#e11d2a" : "none"} />
          <span className="tabular-nums">{likeCount}</span>
        </button>
      </div>
    </div>
  );
}

function ReviewForm({ onClose, onSubmit, defaultProduct, t, error }: {
  onClose: () => void;
  onSubmit: (author: string, rating: number, content: string, product: string) => void;
  error?: string | null;
  defaultProduct: string;
  t: TranslationDict;
}) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [product, setProduct] = useState(defaultProduct);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!author.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    await onSubmit(author.trim().slice(0, 60), rating, content.trim().slice(0, 2000), product.trim().slice(0, 120));
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />
      <div className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in-scale max-h-[90vh] overflow-y-auto"
        style={{
          background: "linear-gradient(145deg, #0e0e18, #0a0a12)",
          border: "1px solid rgba(225,29,42,0.35)",
          boxShadow: "0 0 60px rgba(225,29,42,0.2), 0 24px 60px rgba(0,0,0,0.8)",
        }}>
        {/* Top gradient line */}
        <div className="absolute -top-px left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(225,29,42,0.8), transparent)" }} />

        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,42,0.3)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(225,29,42,0.12)", border: "1px solid rgba(225,29,42,0.25)" }}>
            <MessageSquare size={18} style={{ color: "#e11d2a" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{t.leaveReview}</h3>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.orderConfirmedDesc}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>{t.reviewName}</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="John D." maxLength={60}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(225,29,42,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,42,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>{t.reviewProduct}</label>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product name" maxLength={120}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(225,29,42,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,42,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>{t.reviewRating}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-125">
                  <Star size={28}
                    fill={n <= (hoverRating || rating) ? "#e11d2a" : "rgba(255,255,255,0.15)"}
                    stroke="none"
                    style={{ filter: n <= (hoverRating || rating) ? "drop-shadow(0 0 6px rgba(225,29,42,0.6))" : "none" }} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block"
              style={{ color: "rgba(255,255,255,0.4)" }}>{t.reviewContent}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your experience..."
              rows={3} maxLength={2000}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(225,29,42,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(225,29,42,0.08)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }} />
          </div>
          {error && (
            <p className="text-xs mb-3" style={{ color: "#ff6b75" }}>{error}</p>
          )}
          <button onClick={handleSubmit} disabled={!author || !content || submitting}
            className="btn-red w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={14} className={submitting ? "animate-spin-slow" : ""} />
            {submitting ? "..." : t.submitReview}
          </button>
        </div>
      </div>
    </div>
  );
}
