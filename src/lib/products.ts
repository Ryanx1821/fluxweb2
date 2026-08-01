import type { SellAuthProduct, SellAuthVariant } from "@/types";

export function getProductName(p: SellAuthProduct): string {
  return p.name || p.title || `Product ${p.id}`;
}

export function getProductImage(p: SellAuthProduct): string {
  if (Array.isArray(p.images) && p.images.length > 0 && p.images[0].url) {
    return p.images[0].url;
  }
  const img = p.image || p.image_url || p.thumbnail;
  if (img) return img;
  return "/assets/images/image.png";
}

export function getProductDescription(p: SellAuthProduct): string {
  return p.description || "No description available for this product.";
}

export function getVariants(p: SellAuthProduct): SellAuthVariant[] {
  if (Array.isArray(p.variants) && p.variants.length > 0) return p.variants;
  return [];
}

export function getLowestPrice(p: SellAuthProduct): number {
  const variants = getVariants(p);
  if (variants.length > 0) {
    const prices = variants.map((v) => Number(v.price ?? 0));
    return Math.min(...prices);
  }
  if (typeof p.min_price === "number") return p.min_price;
  if (typeof p.price === "number") return p.price;
  return 0;
}

export function getHighestPrice(p: SellAuthProduct): number {
  const variants = getVariants(p);
  if (variants.length > 0) {
    const prices = variants.map((v) => Number(v.price ?? 0));
    return Math.max(...prices);
  }
  if (typeof p.max_price === "number") return p.max_price;
  if (typeof p.price === "number") return p.price;
  return 0;
}

export function hasMultipleVariants(p: SellAuthProduct): boolean {
  return getVariants(p).length > 1;
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function isProductActive(p: SellAuthProduct): boolean {
  if (typeof p.active === "boolean") return p.active;
  const status = String(p.status ?? "").toLowerCase();
  return status === "active" || status === "enabled" || status === "in stock" || status === "";
}

export function getProductCategory(p: SellAuthProduct): string {
  const cat = p.category;
  if (cat && typeof cat === "object" && typeof cat.name === "string" && cat.name.trim()) {
    return cat.name.trim();
  }
  return "Uncategorized";
}
