import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  ProductRepository,
  LookRepository,
  CategoryRepository,
  OrderRepository,
} from './types';
import type { Product, Look, Category, Order, CustomerInfo, Size, Gender } from '@/types';

// ─── Mappers (snake_case DB → camelCase TS) ───────────────────────────────────

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  gender: string;
  category_slug: string;
  price: number;
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

type DbLook = {
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

type DbCategory = {
  id: string;
  gender: string;
  slug: string;
  label: string;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

type DbOrder = {
  id: string;
  order_number: string;
  customer: CustomerInfo;
  total: number;
  shipping: number;
  status: Order['status'];
  payment_provider: Order['paymentProvider'] | null;
  payment_id: string | null;
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

function mapProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    gender: row.gender as Gender,
    categorySlug: row.category_slug,
    price: Number(row.price),
    images: row.images ?? [],
    description: row.description ?? '',
    sizes: (row.sizes ?? []) as Size[],
    colors: row.colors ?? [],
    stock: row.stock,
    isNew: row.is_new,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLook(row: DbLook): Look {
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

function mapCategory(row: DbCategory): Category {
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

function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    total: Number(row.total),
    shipping: Number(row.shipping),
    status: row.status,
    paymentProvider: row.payment_provider ?? undefined,
    paymentId: row.payment_id ?? undefined,
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

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LOL-${ts}-${rand}`;
}

// ─── Product Repository ───────────────────────────────────────────────────────

export class SupabaseProductRepository implements ProductRepository {
  async findMany(options?: {
    gender?: string;
    category?: string;
    isNew?: boolean;
    limit?: number;
  }): Promise<Product[]> {
    const supabase = await createClient();
    let query = supabase.from('products').select('*');

    if (options?.gender) {
      query = query.eq('gender', options.gender);
    }
    if (options?.category) {
      query = query.eq('category_slug', options.category);
    }
    if (options?.isNew) {
      query = query.eq('is_new', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SupabaseProductRepository.findMany]', error.message);
      return [];
    }
    return (data as DbProduct[]).map(mapProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[SupabaseProductRepository.findById]', error.message);
      return null;
    }
    return data ? mapProduct(data as DbProduct) : null;
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseProductRepository.findBySlug]', error.message);
      return null;
    }
    return data ? mapProduct(data as DbProduct) : null;
  }

  async findByCategory(gender: string, categorySlug: string): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('gender', gender)
      .eq('category_slug', categorySlug);
    if (error) {
      console.error('[SupabaseProductRepository.findByCategory]', error.message);
      return [];
    }
    return (data as DbProduct[]).map(mapProduct);
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*').in('id', ids);
    if (error) {
      console.error('[SupabaseProductRepository.findByIds]', error.message);
      return [];
    }
    // Preserve the requested order
    const map = new Map((data as DbProduct[]).map((row) => [row.id, mapProduct(row)]));
    return ids.flatMap((id) => {
      const product = map.get(id);
      return product ? [product] : [];
    });
  }
}

// ─── Look Repository ──────────────────────────────────────────────────────────

export class SupabaseLookRepository implements LookRepository {
  async findMany(options?: { gender?: string; limit?: number }): Promise<Look[]> {
    const supabase = await createClient();
    let query = supabase.from('looks').select('*, look_products(product_id)');

    if (options?.gender) {
      query = query.eq('gender', options.gender);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SupabaseLookRepository.findMany]', error.message);
      return [];
    }
    return (data as DbLook[]).map(mapLook);
  }

  async findById(id: string): Promise<Look | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('looks')
      .select('*, look_products(product_id)')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseLookRepository.findById]', error.message);
      return null;
    }
    return data ? mapLook(data as DbLook) : null;
  }

  async findByGender(gender: string): Promise<Look[]> {
    return this.findMany({ gender });
  }

  async findLooksForProduct(productId: string): Promise<Look[]> {
    const supabase = await createClient();
    // Get look IDs from junction table, then fetch full look rows with their products
    const { data: junctionRows, error: junctionError } = await supabase
      .from('look_products')
      .select('look_id')
      .eq('product_id', productId);

    if (junctionError) {
      console.error('[SupabaseLookRepository.findLooksForProduct]', junctionError.message);
      return [];
    }
    if (!junctionRows || junctionRows.length === 0) return [];

    const lookIds = junctionRows.map((r) => r.look_id as string);

    const { data, error } = await supabase
      .from('looks')
      .select('*, look_products(product_id)')
      .in('id', lookIds);

    if (error) {
      console.error('[SupabaseLookRepository.findLooksForProduct] fetch looks', error.message);
      return [];
    }
    return (data as DbLook[]).map(mapLook);
  }
}

// ─── Category Repository ──────────────────────────────────────────────────────

export class SupabaseCategoryRepository implements CategoryRepository {
  async findMany(options?: { gender?: string }): Promise<Category[]> {
    const supabase = await createClient();
    let query = supabase.from('categories').select('*');

    if (options?.gender) {
      query = query.eq('gender', options.gender);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[SupabaseCategoryRepository.findMany]', error.message);
      return [];
    }
    return (data as DbCategory[]).map(mapCategory);
  }

  async findBySlug(gender: string, slug: string): Promise<Category | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('gender', gender)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseCategoryRepository.findBySlug]', error.message);
      return null;
    }
    return data ? mapCategory(data as DbCategory) : null;
  }

  async findByGender(gender: string): Promise<Category[]> {
    return this.findMany({ gender });
  }
}

// ─── Order Repository ─────────────────────────────────────────────────────────

export class SupabaseOrderRepository implements OrderRepository {
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
    const admin = createAdminClient();
    const orderNumber = generateOrderNumber();

    const { data: orderRow, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer: orderData.customer,
        total: orderData.total,
        shipping: orderData.shipping,
        status: 'pending',
      })
      .select('*')
      .single();

    if (orderError || !orderRow) {
      throw new Error(
        `[SupabaseOrderRepository.create] Failed to insert order: ${orderError?.message ?? 'no data'}`
      );
    }

    const orderItems = orderData.items.map((item) => ({
      order_id: orderRow.id as string,
      product_id: item.productId,
      product_name: item.productName,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await admin.from('order_items').insert(orderItems);

    if (itemsError) {
      throw new Error(
        `[SupabaseOrderRepository.create] Failed to insert order items: ${itemsError.message}`
      );
    }

    return {
      id: orderRow.id as string,
      orderNumber,
      items: orderData.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: orderData.customer,
      total: orderData.total,
      shipping: orderData.shipping,
      status: 'pending',
      createdAt: orderRow.created_at as string,
      updatedAt: orderRow.updated_at as string,
    };
  }

  async findById(id: string): Promise<Order | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('[SupabaseOrderRepository.findById]', error.message);
      return null;
    }
    return data ? mapOrder(data as DbOrder) : null;
  }

  async findByEmail(email: string): Promise<Order[]> {
    const admin = createAdminClient();
    // customer is stored as JSONB; filter by the email field inside it
    const { data, error } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer->>email', email)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[SupabaseOrderRepository.findByEmail]', error.message);
      return [];
    }
    return (data as DbOrder[]).map(mapOrder);
  }
}

// ─── Singleton instances ──────────────────────────────────────────────────────

export const productRepository = new SupabaseProductRepository();
export const lookRepository = new SupabaseLookRepository();
export const categoryRepository = new SupabaseCategoryRepository();
export const orderRepository = new SupabaseOrderRepository();
