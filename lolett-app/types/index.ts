export type Gender = 'homme' | 'femme';

export type Size = 'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface Product {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  categorySlug: string;
  price: number;
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
