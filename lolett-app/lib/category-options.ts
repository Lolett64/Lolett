import { isShopGender, type ShopGender } from '@/lib/gender';

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
 * - Produit homme / femme : catégories de ce genre.
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

  const matching = isShopGender(productGender)
    ? categories.filter((c) => c.gender === productGender)
    : categories;

  const bySlug = new Map<string, CategoryOption>();
  for (const c of matching) {
    if (!bySlug.has(c.slug)) bySlug.set(c.slug, { slug: c.slug, label: c.label });
  }

  if (currentSlug && !bySlug.has(currentSlug)) {
    bySlug.set(currentSlug, { slug: currentSlug, label: `${currentSlug} (catégorie actuelle)` });
  }

  return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
}

/**
 * Genres cochés à la création d'une catégorie (page Catégories).
 * Cocher Homme et Femme crée la catégorie des deux côtés, avec le même slug,
 * comme « Hauts » aujourd'hui. Accepte aussi l'ancien format `{ gender }`.
 */
export function categoryGendersFromBody(body: unknown): ShopGender[] {
  if (typeof body !== 'object' || body === null) return [];
  const { genders, gender } = body as { genders?: unknown; gender?: unknown };
  const raw: unknown[] = Array.isArray(genders) ? genders : [gender];

  const result: ShopGender[] = [];
  for (const value of raw) {
    if (typeof value === 'string' && isShopGender(value) && !result.includes(value)) {
      result.push(value);
    }
  }
  return result;
}
