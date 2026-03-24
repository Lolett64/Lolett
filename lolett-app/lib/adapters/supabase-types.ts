import type { CustomerInfo, Order } from '@/types';

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  gender: string;
  category_slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  description: string | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  is_new: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type DbLook = {
  id: string;
  title: string;
  gender: string;
  cover_image: string;
  vibe: string | null;
  short_pitch: string | null;
  created_at: string;
  updated_at: string;
  look_products?: { product_id: string }[];
};

export type DbCategory = {
  id: string;
  gender: string;
  slug: string;
  label: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type DbProductVariant = {
  id: string;
  product_id: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type DbOrder = {
  id: string;
  order_number: string;
  customer: CustomerInfo;
  total: number;
  shipping: number;
  status: Order['status'];
  payment_provider: Order['paymentProvider'] | null;
  payment_id: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_id: string | null;
    product_name: string;
    size: string;
    quantity: number;
    price: number;
  }[];
};
