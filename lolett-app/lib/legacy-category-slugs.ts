import { isShopGender, type ShopGender } from '@/lib/gender';

/**
 * Anciennes adresses de catégorie (avril → novembre 2026), encore référencées par
 * Google et le pack SEO, vers la catégorie qui les a remplacées le 2026-11-05.
 * Utilisé seulement quand aucune catégorie ne porte ce slug : une catégorie
 * recréée plus tard avec un de ces slugs reste prioritaire.
 */
const LEGACY_SLUGS: Record<ShopGender, Record<string, string>> = {
  femme: {
    hauts: 't-shirts-bodys-tops',
    bas: 'pantalons-jeans-joggings',
    'pull-gilet': 'pulls-gilets-sweat-shirts',
    vestes: 'vestes-blazers',
    'chemises-et-blouses': 'chemises-blouses',
  },
  homme: {
    hauts: 't-shirts-polos-chemises',
    bas: 'pantalons-jeans-joggings',
    vestes: 'vestes-sweat-shirts-manteaux',
  },
};

export function legacyCategorySlug(gender: string, slug: string): string | null {
  if (!isShopGender(gender)) return null;
  return LEGACY_SLUGS[gender][slug] ?? null;
}
