import type {
  ProductRepository,
  LookRepository,
  CategoryRepository,
  OrderRepository,
} from './types';
import type { Product, Look, Category, Order, CustomerInfo, Size } from '@/types';
import { products } from '@/data/products';
import { looks } from '@/data/looks';
import { categories } from '@/data/categories';

export class MockProductRepository implements ProductRepository {
  async findMany(options?: {
    gender?: string;
    category?: string;
    isNew?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    let result = [...products];

    if (options?.gender) {
      result = result.filter((p) => p.gender === options.gender);
    }

    if (options?.category) {
      result = result.filter((p) => p.categorySlug === options.category);
    }

    if (options?.isNew) {
      result = result.filter((p) => p.isNew);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async findById(id: string): Promise<Product | null> {
    return products.find((p) => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return products.find((p) => p.slug === slug) || null;
  }

  async findByCategory(gender: string, categorySlug: string): Promise<Product[]> {
    return products.filter((p) => p.gender === gender && p.categorySlug === categorySlug);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => p !== undefined);
  }
}

export class MockLookRepository implements LookRepository {
  async findMany(options?: { gender?: string; limit?: number }): Promise<Look[]> {
    let result = [...looks];

    if (options?.gender) {
      result = result.filter((l) => l.gender === options.gender);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  async findById(id: string): Promise<Look | null> {
    return looks.find((l) => l.id === id) || null;
  }

  async findByGender(gender: string): Promise<Look[]> {
    return looks.filter((l) => l.gender === gender);
  }

  async findLooksForProduct(productId: string): Promise<Look[]> {
    return looks.filter((l) => l.productIds.includes(productId));
  }
}

export class MockCategoryRepository implements CategoryRepository {
  async findMany(options?: { gender?: string }): Promise<Category[]> {
    if (options?.gender) {
      return categories.filter((c) => c.gender === options.gender);
    }
    return [...categories];
  }

  async findBySlug(gender: string, slug: string): Promise<Category | null> {
    return categories.find((c) => c.gender === gender && c.slug === slug) || null;
  }

  async findByGender(gender: string): Promise<Category[]> {
    return categories.filter((c) => c.gender === gender);
  }
}

const ordersStore: Order[] = [];

export class MockOrderRepository implements OrderRepository {
  async create(orderData: {
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
  }): Promise<Order> {
    const orderNumber =
      'LOL-' +
      Date.now().toString(36).toUpperCase() +
      '-' +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    const order: Order = {
      id: orderNumber,
      orderNumber,
      items: orderData.items,
      customer: orderData.customer,
      total: orderData.total,
      shipping: orderData.shipping,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    ordersStore.push(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return ordersStore.find((o) => o.id === id) || null;
  }

  async findByEmail(email: string): Promise<Order[]> {
    return ordersStore.filter((o) => o.customer.email === email);
  }
}

export const productRepository = new MockProductRepository();
export const lookRepository = new MockLookRepository();
export const categoryRepository = new MockCategoryRepository();
export const orderRepository = new MockOrderRepository();
