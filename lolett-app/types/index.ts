export type Gender = 'homme' | 'femme' | 'both';

export type Size =
  | 'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  | '29' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38'
  | '39' | '40' | '41' | '42' | '43' | '44'
  | 'S/M' | 'M/L';

export interface Product {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  categorySlug: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description: string;
  sizes: Size[];
  colors: ProductColor[];
  stock: number; // Stock total (somme des variantes) - conservé pour rétrocompatibilité
  variants?: ProductVariant[]; // Stock détaillé par variante (couleur + taille)
  composition?: string;
  modelInfo?: string;
  isNew: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  colorName: string;
  colorHex: string;
  size: Size;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Look {
  id: string;
  title: string;
  gender: Gender;
  coverImage: string;
  productIds: string[];
  vibe: string;
  shortPitch: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  gender: Gender;
  slug: string;
  label: string;
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  size: Size;
  color?: string; // Nom de la couleur (optionnel pour rétrocompatibilité)
  quantity: number;
  addedAt: string;
}

export interface FavoriteItem {
  productId: string;
  addedAt: string;
}

export type ShippingMethod = 'home' | 'mondial_relay';
export type ShippingCarrier = 'colissimo' | 'mondial_relay';
export type ShippingCountryCode = 'FR' | 'BE' | 'LU' | 'NL' | 'ES' | 'PT';

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: CustomerInfo;
  total: number;
  shipping: number;
  promoCode?: string;
  promoDiscount?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
  shippingMethod?: ShippingMethod;
  shippingCarrier?: ShippingCarrier;
  shippingCountry?: ShippingCountryCode;
  pickupPoint?: PickupPoint | null;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'expired';
  paymentProvider?: 'stripe' | 'paypal';
  paymentId?: string;
  userId?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  adminNotes?: string;
  refundAmount?: number;
  refundReason?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: Size;
  color?: string; // Nom de la couleur (optionnel pour rétrocompatibilité)
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  flagged: boolean;
  flagCount: number;
  createdAt: string;
  updatedAt: string;
  productName?: string;
  productImage?: string;
  authorName?: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  rewardType: 'discount' | 'shipping' | 'access';
  value: number | null;
  isActive: boolean;
}
