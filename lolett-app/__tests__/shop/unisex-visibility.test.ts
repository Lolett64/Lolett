import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPublicClient = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => mockPublicClient,
}));

import { SupabaseProductRepository } from '@/lib/adapters/supabase-product';

describe('findByCategory — visibilité des produits unisexes', () => {
  beforeEach(() => {
    mockPublicClient.from.mockReset();
  });

  it('interroge le genre demandé ET les unisexes', async () => {
    const productsBuilder: Record<string, unknown> = {};
    productsBuilder.select = vi.fn(() => productsBuilder);
    productsBuilder.eq = vi.fn(() => productsBuilder);
    productsBuilder.in = vi.fn(() => productsBuilder);
    productsBuilder.then = (resolve: (v: { data: never[]; error: null }) => unknown) =>
      resolve({ data: [], error: null });

    const variantsBuilder: Record<string, unknown> = {};
    variantsBuilder.select = vi.fn(() => variantsBuilder);
    variantsBuilder.eq = vi.fn(() => Promise.resolve({ data: [], error: null }));

    mockPublicClient.from.mockImplementation((table: string) =>
      table === 'product_variants' ? variantsBuilder : productsBuilder,
    );

    const repo = new SupabaseProductRepository();
    await repo.findByCategory('homme', 'hauts');

    expect(productsBuilder.in).toHaveBeenCalledWith('gender', ['homme', 'both']);
    expect(productsBuilder.eq).toHaveBeenCalledWith('category_slug', 'hauts');
  });
});
