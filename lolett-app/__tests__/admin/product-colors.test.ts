import { describe, it, expect } from 'vitest';
import { normalizeProductColors } from '@/lib/admin/product-colors';

const variant = (colorName: string, size = 'M', stock = 1) => ({ colorName, colorHex: '#000', size, stock });

describe('normalizeProductColors — couleurs du produit et stock par couleur alignés', () => {
  it('ne renomme jamais une couleur existante (18 produits en base ont « Gris␣ »…)', () => {
    // Renommer casserait les paniers en cours qui portent encore l'ancien nom.
    const res = normalizeProductColors([{ name: 'Gris ', hex: '#999' }], [variant('Gris ')]);
    expect(res.error).toBeUndefined();
    expect(res.colors?.[0].name).toBe('Gris ');
    expect(res.variants?.[0].colorName).toBe('Gris ');
  });

  it('aligne le stock sur le nom exact de la couleur (espaces compris)', () => {
    const res = normalizeProductColors([{ name: 'Gris ', hex: '#999' }], [variant('gris')]);
    expect(res.variants?.[0].colorName).toBe('Gris ');
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

  it('ne bloque pas l’enregistrement si du stock ancien pointe vers une couleur absente', () => {
    // Ce stock n'est pas visible dans le formulaire : refuser l'enregistrement
    // empêcherait de modifier le produit (même son prix) depuis l'admin.
    const res = normalizeProductColors([{ name: 'Beige', hex: '#eee' }], [variant('Rose')]);
    expect(res.error).toBeUndefined();
    expect(res.variants?.[0].colorName).toBe('Rose');
  });

  it('ne bloque pas un produit sans couleurs qui a du stock « Par défaut »', () => {
    const res = normalizeProductColors([], [variant('Par défaut')]);
    expect(res.error).toBeUndefined();
    expect(res.variants).toHaveLength(1);
  });

  it('laisse passer une mise à jour partielle (couleurs seules ou stock seul)', () => {
    expect(normalizeProductColors(undefined, [variant('Rose')]).error).toBeUndefined();
    expect(normalizeProductColors([{ name: 'Rose', hex: '#f0c' }], undefined).error).toBeUndefined();
  });
});
