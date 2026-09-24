import { describe, it, expect } from 'vitest';
import { encodeItemsMetadata, decodeItemsMetadata } from '@/lib/checkout/items-metadata';

const ITEM = {
  productId: '0b6f3c1e-8f2a-4d6b-9a57-2c1d3e4f5a6b',
  productName: 'Tee shirt Mission',
  size: 'L',
  color: 'Rose poudré',
  quantity: 1,
  price: 16.03,
};

describe('items metadata Stripe (limite 500 caractères par valeur)', () => {
  it('garde une seule clé `items` pour un petit panier', () => {
    const meta = encodeItemsMetadata([ITEM]);
    expect(Object.keys(meta)).toEqual(['items']);
    expect(JSON.parse(meta.items)).toEqual([ITEM]);
  });

  it('découpe un gros panier en morceaux de 500 caractères max et le reconstitue', () => {
    const items = Array.from({ length: 12 }, () => ITEM);
    const meta = encodeItemsMetadata(items);
    expect(Object.keys(meta).length).toBeGreaterThan(1);
    for (const value of Object.values(meta)) expect(value.length).toBeLessThanOrEqual(500);
    expect(JSON.parse(decodeItemsMetadata(meta) ?? '')).toEqual(items);
  });

  it('relit une ancienne session (clé `items` seule, sans couleur)', () => {
    const legacy = JSON.stringify([{ productId: 'p1', productName: 'Robe', size: 'M', quantity: 1, price: 49.9 }]);
    expect(decodeItemsMetadata({ items: legacy })).toBe(legacy);
  });

  it('renvoie null si la metadata ne contient pas d’articles', () => {
    expect(decodeItemsMetadata({})).toBeNull();
    expect(decodeItemsMetadata(null)).toBeNull();
  });
});
