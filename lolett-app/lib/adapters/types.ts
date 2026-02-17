import type { Product, Look, Category, Order, CustomerInfo, Size } from '@/types';

export interface ProductRepository {
  findMany(options?: {
    gender?: string;
    category?: string;
    isNew?: boolean;
    limit?: number;
  }): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findByCategory(gender: string, categorySlug: string): Promise<Product[]>;
  findByIds(ids: string[]): Promise<Product[]>;
}

export interface LookRepository {
  findMany(options?: { gender?: string; limit?: number }): Promise<Look[]>;
  findById(id: string): Promise<Look | null>;
  findByGender(gender: string): Promise<Look[]>;
  findLooksForProduct(productId: string): Promise<Look[]>;
}

export interface CategoryRepository {
  findMany(options?: { gender?: string }): Promise<Category[]>;
  findBySlug(gender: string, slug: string): Promise<Category | null>;
  findByGender(gender: string): Promise<Category[]>;
}

export interface OrderRepository {
  create(order: {
    items: {
      productId: string;
      size: Size;
      quantity: number;
      price: number;
      productName: string;
    }[];
    customer: CustomerInfo;
    total: number;
    shipping: number;
  }): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findByEmail(email: string): Promise<Order[]>;
}
