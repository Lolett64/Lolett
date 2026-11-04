import { UNISEX, isShopGender } from '@/lib/gender';

/** Ligne de la table `categories` utile au choix d'une catégorie. */
export interface CategoryRow {
  gender: string;
  slug: string;
  label: string;
}

export interface CategoryOption {
  slug: string;
  label: string;
}

/**
 * Catégories proposées dans le formulaire produit, lues depuis la base.
 *
 * - Produit homme / femme : catégories de ce genre + catégories unisexes.
 * - Produit unisexe : toutes les catégories (il apparaît dans les deux boutiques).
 * - La catégorie actuelle du produit reste proposée même si elle a disparu,
 *   pour ne jamais vider le champ à l'ouverture d'une fiche existante.
 */
export function categoryOptionsForGender(
  categories: CategoryRow[],
  productGender: string,
  currentSlug = '',
): CategoryOption[] {
  if (!productGender) return [];

  const matching = categories.filter((c) =>
    isShopGender(productGender) ? c.gender === productGender || c.gender === UNISEX : true,
  );

  const bySlug = new Map<string, CategoryOption>();
  for (const c of matching) {
    if (!bySlug.has(c.slug)) bySlug.set(c.slug, { slug: c.slug, label: c.label });
  }

  if (currentSlug && !bySlug.has(currentSlug)) {
    bySlug.set(currentSlug, { slug: currentSlug, label: `${currentSlug} (catégorie actuelle)` });
  }

  return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}
