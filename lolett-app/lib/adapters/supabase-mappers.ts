import type { Product, Look, Category, Order, Size, Gender, ProductVariant } from '@/types';
import type { DbProduct, DbLook, DbCategory, DbOrder, DbProductVariant } from './supabase-types';

export function mapVariant(row: DbProductVariant): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    colorName: row.color_name,
    colorHex: row.color_hex,
    size: row.size as Size,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row: DbProduct, variants?: ProductVariant[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    gender: row.gender as Gender,
    categorySlug: row.category_slug,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    images: row.images ?? [],
    description: row.description ?? '',
    sizes: (row.sizes ?? []) as Size[],
    colors: row.colors ?? [],
    stock: row.stock, // Conservé pour rétrocompatibilité
    variants: variants, // Stock détaillé par variante
    isNew: row.is_new,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLook(row: DbLook): Look {
  const productIds = (row.look_products ?? []).map((lp) => lp.product_id);
  return {
    id: row.id,
    title: row.title,
    gender: row.gender as Gender,
    coverImage: row.cover_image,
    productIds,
    vibe: row.vibe ?? '',
    shortPitch: row.short_pitch ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    gender: row.gender as Gender,
    slug: row.slug,
    label: row.label,
    seoTitle: row.seo_title ?? '',
    seoDescription: row.seo_description ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    total: Number(row.total),
    shipping: Number(row.shipping),
    status: row.status,
    paymentProvider: row.payment_provider ?? undefined,
    paymentId: row.payment_id ?? undefined,
    userId: row.user_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id ?? '',
      productName: item.product_name,
      size: item.size as Size,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  };
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LOL-${ts}-${rand}`;
}
