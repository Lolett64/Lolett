export type Gender = 'homme' | 'femme';

export type Size = 'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL';

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

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customer: CustomerInfo;
  total: number;
  shipping: number;
  status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'expired';
  paymentProvider?: 'stripe' | 'paypal';
  paymentId?: string;
  userId?: string;
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
