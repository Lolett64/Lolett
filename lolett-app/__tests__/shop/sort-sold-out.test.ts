import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock du client Supabase public avant l'import du repo.
const mockPublicClient = vi.hoisted(() => {
  return {
    from: vi.fn(),
  };
});

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => mockPublicClient,
}));

import { SupabaseProductRepository } from '@/lib/adapters/supabase-product';

type Row = {
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
  composition: string | null;
  model_info: string | null;
  created_at: string;
  updated_at: string;
};

function mkProduct(id: string, stock: number): Row {
  return {
    id,
    slug: id,
    name: id,
    gender: 'femme',
    category_slug: 'robes',
    price: 100,
    compare_at_price: null,
    images: [],
    description: '',
    sizes: [],
    colors: [],
    stock,
    is_new: false,
    tags: [],
    composition: null,
    model_info: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };
}

describe('SupabaseProductRepository.findMany — tri sold-out en dernier', () => {
  beforeEach(() => {
    mockPublicClient.from.mockReset();
  });

  it('place les produits à stock 0 après les produits disponibles', async () => {
    const rows: Row[] = [
      mkProduct('out-1', 0),
      mkProduct('in-1', 4),
      mkProduct('out-2', 0),
      mkProduct('in-2', 2),
    ];

    // Builder pour `products` : order est le point final.
    const productsBuilder: Record<string, unknown> = {};
    productsBuilder.select = vi.fn(() => productsBuilder);
    productsBuilder.in = vi.fn(() => productsBuilder);
    productsBuilder.eq = vi.fn(() => productsBuilder);
    productsBuilder.limit = vi.fn(() => Promise.resolve({ data: rows, error: null }));
    productsBuilder.order = vi.fn(() => ({
      ...productsBuilder,
      then: (resolve: (v: { data: Row[]; error: null }) => unknown) =>
        resolve({ data: rows, error: null }),
    }));

    // Builder pour `product_variants` : select + eq renvoie une promesse.
    const variantsBuilder: Record<string, unknown> = {};
    variantsBuilder.select = vi.fn(() => variantsBuilder);
    variantsBuilder.eq = vi.fn(() => Promise.resolve({ data: [], error: null }));

    mockPublicClient.from.mockImplementation((table: string) => {
      if (table === 'product_variants') return variantsBuilder;
      return productsBuilder;
    });

    const repo = new SupabaseProductRepository();
    const result = await repo.findMany();

    expect(result).toHaveLength(4);
    // Les deux premiers doivent être en stock, les deux derniers épuisés.
    expect(result[0].stock).toBeGreaterThan(0);
    expect(result[1].stock).toBeGreaterThan(0);
    expect(result[2].stock).toBe(0);
    expect(result[3].stock).toBe(0);
  });
});
