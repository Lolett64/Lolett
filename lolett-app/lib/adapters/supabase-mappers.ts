import type { Product, Look, Category, Order, Size, Gender, ProductVariant, PickupPoint, ShippingMethod, PickupPointProvider } from '@/types';
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
    composition: row.composition ?? undefined,
    modelInfo: row.model_info ?? undefined,
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

// Normalise le snapshot JSONB pickup_point en union discriminée.
// Backfill du discriminant `provider` pour les snapshots legacy (sans provider) :
// click_collect si la méthode l'indique, sinon mondial_relay (historique).
export function mapPickupPoint(
  raw: unknown,
  shippingMethod: ShippingMethod | null
): PickupPoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const point = raw as Record<string, unknown>;
  const provider: PickupPointProvider =
    (point.provider as PickupPointProvider | undefined) ??
    (shippingMethod === 'click_collect' ? 'click_collect' : 'mondial_relay');
  return { ...point, provider } as unknown as PickupPoint;
}

export function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    total: Number(row.total),
    shipping: Number(row.shipping),
    promoCode: row.promo_code ?? undefined,
    promoDiscount: row.promo_discount != null ? Number(row.promo_discount) : undefined,
    giftCardCode: row.gift_card_code ?? undefined,
    giftCardAmount: row.gift_card_amount != null ? Number(row.gift_card_amount) : undefined,
    shippingMethod: row.shipping_method ?? undefined,
    shippingCarrier: row.shipping_carrier ?? undefined,
    shippingCountry: (row.shipping_country as Order['shippingCountry']) ?? undefined,
    pickupPoint: mapPickupPoint(row.pickup_point, row.shipping_method ?? null),
    invoiceNumber: row.invoice_number ?? undefined,
    invoicePdfUrl: row.invoice_pdf_url ?? undefined,
    status: row.status,
    paymentProvider: row.payment_provider ?? undefined,
    paymentId: row.payment_id ?? undefined,
    userId: row.user_id ?? undefined,
    readyForPickupAt: row.ready_for_pickup_at ?? undefined,
    pickedUpAt: row.picked_up_at ?? undefined,
    pickupCode: row.pickup_code ?? null,
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
