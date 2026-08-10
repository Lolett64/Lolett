import { describe, it, expect } from 'vitest';
import {
  UNISEX,
  isShopGender,
  matchesShopGender,
  genderQueryValues,
  genderLabel,
  shopHrefForGender,
} from '@/lib/gender';

describe('matchesShopGender', () => {
  it('montre un produit homme dans la boutique homme', () => {
    expect(matchesShopGender('homme', 'homme')).toBe(true);
  });

  it('cache un produit homme dans la boutique femme', () => {
    expect(matchesShopGender('homme', 'femme')).toBe(false);
  });

  it('montre un produit unisexe dans les DEUX boutiques', () => {
    expect(matchesShopGender(UNISEX, 'homme')).toBe(true);
    expect(matchesShopGender(UNISEX, 'femme')).toBe(true);
  });
});

describe('genderLabel', () => {
  it('traduit les trois genres en français', () => {
    expect(genderLabel('homme')).toBe('Homme');
    expect(genderLabel('femme')).toBe('Femme');
    expect(genderLabel(UNISEX)).toBe('Unisexe');
  });

  it('renvoie la valeur brute pour un genre inconnu plutôt que de planter', () => {
    expect(genderLabel('enfant')).toBe('enfant');
  });
});

describe('shopHrefForGender', () => {
  it('renvoie la boutique du genre pour homme et femme', () => {
    expect(shopHrefForGender('homme')).toBe('/shop/homme');
    expect(shopHrefForGender('femme')).toBe('/shop/femme');
  });

  it("renvoie la boutique générale pour un unisexe : aucune page /shop/both n'existe", () => {
    expect(shopHrefForGender(UNISEX)).toBe('/shop');
  });
});

describe('isShopGender et genderQueryValues', () => {
  it('reconnaît uniquement les genres qui ont une boutique', () => {
    expect(isShopGender('homme')).toBe(true);
    expect(isShopGender('femme')).toBe(true);
    expect(isShopGender(UNISEX)).toBe(false);
  });

  it('interroge le genre demandé ET les unisexes', () => {
    expect(genderQueryValues('femme')).toEqual(['femme', 'both']);
    expect(genderQueryValues('homme')).toEqual(['homme', 'both']);
  });
});
