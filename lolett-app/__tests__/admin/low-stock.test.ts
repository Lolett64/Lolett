import { describe, it, expect, vi } from 'vitest';
import { getLowStockVariants, getOutOfStockVariants } from '@/lib/admin/low-stock';

type QueryResult<T> = { data: T | null; error: { message: string } | null };

/**
 * Construit un mock minimaliste du query builder Supabase pour product_variants.
 * Chaque méthode chainable renvoie le builder lui-même ; le `then`-like est émulé
 * via la résolution de la promesse finale (select/order/limit/eq/lt/gt → thenable).
 */
function buildSupabaseMock<T>(result: QueryResult<T>) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.select = vi.fn(chain);
  builder.gt = vi.fn(chain);
  builder.lt = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.limit = vi.fn(() => Promise.resolve(result));

  const from = vi.fn(() => builder);
  return { from } as unknown as ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>;
}

describe('getLowStockVariants', () => {
  it('retourne les variantes avec stock entre 1 et LOW_THRESHOLD - 1', async () => {
    const rows = [
      {
        id: 'v1',
        product_id: 'p1',
        color_name: 'Noir',
        color_hex: '#000',
        size: 'M',
        stock: 1,
        products: { name: 'Chemise', slug: 'chemise' },
      },
      {
        id: 'v2',
        product_id: 'p2',
        color_name: 'Blanc',
        color_hex: '#FFF',
        size: 'L',
        stock: 2,
        products: { name: 'Pantalon', slug: 'pantalon' },
      },
    ];
    const supabase = buildSupabaseMock({ data: rows, error: null });

    const result = await getLowStockVariants({ supabase });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'v1',
      productId: 'p1',
      productName: 'Chemise',
      productSlug: 'chemise',
      colorName: 'Noir',
      colorHex: '#000',
      size: 'M',
      stock: 1,
    });
    expect(result[1].productName).toBe('Pantalon');
  });

  it('gère le cas où products est un tableau (relation one-to-many Supabase)', async () => {
    const rows = [
      {
        id: 'v3',
        product_id: 'p3',
        color_name: 'Rouge',
        color_hex: '#F00',
        size: 'S',
        stock: 2,
        products: [{ name: 'Veste', slug: 'veste' }],
      },
    ];
    const supabase = buildSupabaseMock({ data: rows, error: null });

    const result = await getLowStockVariants({ supabase });

    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe('Veste');
    expect(result[0].productSlug).toBe('veste');
  });

  it('retourne un tableau vide si la query échoue', async () => {
    const supabase = buildSupabaseMock({ data: null, error: { message: 'boom' } });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getLowStockVariants({ supabase });

    expect(result).toEqual([]);
    spy.mockRestore();
  });

  it('utilise un fallback lorsque le produit joint est null', async () => {
    const rows = [
      {
        id: 'v4',
        product_id: 'p4',
        color_name: 'Bleu',
        color_hex: '#00F',
        size: 'XL',
        stock: 1,
        products: null,
      },
    ];
    const supabase = buildSupabaseMock({ data: rows, error: null });

    const result = await getLowStockVariants({ supabase });

    expect(result).toHaveLength(1);
    expect(result[0].productName).toBe('—');
    expect(result[0].productSlug).toBe('');
  });
});

describe('getOutOfStockVariants', () => {
  it('retourne uniquement les variantes à stock 0', async () => {
    const rows = [
      {
        id: 'v10',
        product_id: 'p10',
        color_name: 'Noir',
        color_hex: '#000',
        size: 'M',
        stock: 0,
        products: { name: 'Pull', slug: 'pull' },
      },
    ];
    const supabase = buildSupabaseMock({ data: rows, error: null });

    const result = await getOutOfStockVariants({ supabase });

    expect(result).toHaveLength(1);
    expect(result[0].stock).toBe(0);
    expect(result[0].productName).toBe('Pull');
  });

  it('retourne [] en cas d\'erreur', async () => {
    const supabase = buildSupabaseMock({ data: null, error: { message: 'nope' } });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getOutOfStockVariants({ supabase });

    expect(result).toEqual([]);
    spy.mockRestore();
  });
});
