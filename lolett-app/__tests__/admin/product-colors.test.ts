import { describe, it, expect } from 'vitest';
import { normalizeProductColors } from '@/lib/admin/product-colors';

const variant = (colorName: string, size = 'M', stock = 1) => ({ colorName, colorHex: '#000', size, stock });

describe('normalizeProductColors — couleurs du produit et stock par couleur alignés', () => {
  it('retire les espaces autour des noms, dans les couleurs comme dans le stock', () => {
    const res = normalizeProductColors([{ name: ' Rose ', hex: '#f0c' }], [variant('Rose ')]);
    expect(res.error).toBeUndefined();
    expect(res.colors?.[0].name).toBe('Rose');
    expect(res.variants?.[0].colorName).toBe('Rose');
  });

  it('aligne la casse du stock sur le nom de la couleur', () => {
    const res = normalizeProductColors([{ name: 'Beige', hex: '#eee' }], [variant('beige')]);
    expect(res.variants?.[0].colorName).toBe('Beige');
  });

  it('refuse une couleur en double (même nom, casse ou espaces différents)', () => {
    const res = normalizeProductColors([{ name: 'Rose', hex: '#f0c' }, { name: 'rose ', hex: '#f0d' }], []);
    expect(res.error).toMatch(/rose/i);
  });

  it('refuse une couleur sans nom', () => {
    const res = normalizeProductColors([{ name: '  ', hex: '#000' }], []);
    expect(res.error).toBeDefined();
  });

  it('refuse un stock rattaché à une couleur qui n’existe pas sur le produit', () => {
    const res = normalizeProductColors([{ name: 'Beige', hex: '#eee' }], [variant('Rose')]);
    expect(res.error).toMatch(/Rose/);
  });

  it('laisse passer une mise à jour partielle (couleurs seules ou stock seul)', () => {
    expect(normalizeProductColors(undefined, [variant('Rose')]).error).toBeUndefined();
    expect(normalizeProductColors([{ name: 'Rose', hex: '#f0c' }], undefined).error).toBeUndefined();
  });
});
