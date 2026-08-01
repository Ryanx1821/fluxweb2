import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Review } from "@/types";

const PLACEHOLDERS: Omit<Review, "id" | "created_at">[] = [
  { author: "Alex M.", rating: 5, content: "Lightning fast delivery and great quality. Highly recommend Flux!", product_name: "Premium Account", is_placeholder: true },
  { author: "Sara K.", rating: 5, content: "Best digital store I've used. Instant access after checkout.", product_name: "Software License", is_placeholder: true },
  { author: "Jordan P.", rating: 4, content: "Smooth experience, would buy again. Support was helpful.", product_name: "Game Key", is_placeholder: true },
  { author: "Mia T.", rating: 5, content: "Absolutely worth it. The process was seamless and quick.", product_name: "Subscription", is_placeholder: true },
  { author: "Chris L.", rating: 5, content: "Five stars! Got my order in seconds. Flux is the real deal.", product_name: "Digital Download", is_placeholder: true },
  { author: "Riley W.", rating: 4, content: "Very satisfied. Clean site, easy checkout, fast delivery.", product_name: "Premium Account", is_placeholder: true },
  { author: "Sam B.", rating: 5, content: "Top-notch service. I keep coming back because it just works.", product_name: "Software License", is_placeholder: true },
  { author: "Taylor R.", rating: 5, content: "Flawless transaction. The glow-up my workflow needed.", product_name: "Game Key", is_placeholder: true },
];

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      const real = (data ?? []) as Review[];
      const realCount = real.filter((r) => !r.is_placeholder).length;
      const needed = Math.max(0, 8 - realCount);
      const placeholders: Review[] = PLACEHOLDERS.slice(0, needed).map((p, i) => ({
        ...p,
        id: `placeholder-${i}`,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
      }));
      if (!cancelled) setReviews([...real, ...placeholders]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { reviews, loading, setReviews };
}
