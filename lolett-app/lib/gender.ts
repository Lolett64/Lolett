/**
 * Source unique de vérité pour le genre d'un produit.
 *
 * Historique : en avril 2026, le genre « unisexe » a été ajouté au formulaire admin
 * et au type TypeScript, mais la règle « un produit unisexe appartient aux deux
 * boutiques » a été réécrite à la main à chaque endroit qui en avait besoin — et
 * oubliée dans six autres. Toute nouvelle logique de genre passe par ce fichier.
 */

/** Valeur stockée en base pour un article porté par les deux genres. */
export const UNISEX = 'both';

/** Genres disposant d'une vraie page boutique (`/shop/homme`, `/shop/femme`). */
export type ShopGender = 'homme' | 'femme';

export function isShopGender(value: string): value is ShopGender {
  return value === 'homme' || value === 'femme';
}

/** Un produit doit-il apparaître dans la boutique d'un genre donné ? */
export function matchesShopGender(productGender: string, shopGender: ShopGender): boolean {
  return productGender === shopGender || productGender === UNISEX;
}

/** Valeurs à passer à un `.in('gender', …)` Supabase pour peupler une boutique. */
export function genderQueryValues(shopGender: ShopGender): string[] {
  return [shopGender, UNISEX];
}

/** Libellé affiché à l'utilisateur. */
export function genderLabel(gender: string): string {
  switch (gender) {
    case 'homme':
      return 'Homme';
    case 'femme':
      return 'Femme';
    case UNISEX:
      return 'Unisexe';
    default:
      return gender;
  }
}

/**
 * Lien boutique d'un produit. Les unisexes n'ont pas de boutique dédiée :
 * la route `/shop/[gender]` renvoie un 404 pour tout genre autre que homme/femme.
 */
export function shopHrefForGender(gender: string): string {
  return isShopGender(gender) ? `/shop/${gender}` : '/shop';
}
