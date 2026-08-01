export interface SellAuthVariant {
  id: number;
  name: string;
  title?: string;
  price: number;
  stock?: number | null;
  [key: string]: unknown;
}

export interface SellAuthProductImage {
  id: number;
  url: string;
  [key: string]: unknown;
}

export interface SellAuthProduct {
  id: number;
  name: string;
  title?: string;
  description?: string;
  image?: string;
  image_url?: string;
  thumbnail?: string;
  images?: SellAuthProductImage[];
  price?: number;
  min_price?: number;
  max_price?: number;
  stock?: number | null;
  status?: string;
  active?: boolean;
  variants?: SellAuthVariant[];
  category_id?: number | null;
  category?: { id: number; name: string; [key: string]: unknown } | null;
  product_tabs?: SellAuthProductTab[];
  [key: string]: unknown;
}

export interface SellAuthProductTab {
  id: number;
  title: string;
  content: string;
  [key: string]: unknown;
}

export interface SellAuthCategory {
  id: number;
  name: string;
  path?: string | null;
  description?: string | null;
  [key: string]: unknown;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  content: string;
  product_name: string;
  is_placeholder: boolean;
  created_at: string;
}

export type TabKey = "home" | "products" | "status" | "reviews";

export interface SellAuthPaymentMethod {
  id: number;
  shop_id?: number;
  type: string;
  name: string;
  checkout_name?: string | null;
  icon_image_id?: number | null;
  icon_image_url?: string | null;
  icon_image?: string | null;
  percentage_fee?: number;
  fixed_fee?: number;
  min_amount?: number | null;
  max_amount?: number | null;
  currency_override?: string | null;
  hide_powered_by?: boolean;
  is_active?: boolean;
  order?: number;
  [key: string]: unknown;
}

export interface CartItem {
  product: SellAuthProduct;
  variant?: SellAuthVariant | null;
  quantity: number;
}
