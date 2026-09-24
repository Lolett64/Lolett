/**
 * Un produit a deux listes de couleurs : `products.colors` (ce que le client
 * choisit sur la fiche) et `product_variants.color_name` (le stock par
 * couleur × taille). Le décrément de stock à la commande les rapproche par
 * nom exact : si elles divergent (casse, doublon), le stock baisse sur la
 * mauvaise couleur. On aligne la casse du stock et on refuse les doublons.
 *
 * On ne renomme JAMAIS une couleur (pas de trim) : des produits en base ont
 * des noms comme « Gris␣ », et les paniers en cours portent ce nom exact.
 */
interface ColorInput {
  name: string;
  hex: string;
}

interface VariantInput {
  colorName: string;
}

const colorKey = (name: string) => name.trim().toLowerCase();

export function normalizeProductColors<C extends ColorInput, V extends VariantInput>(
  colors: C[] | undefined,
  variants: V[] | undefined
): { colors?: C[]; variants?: V[]; error?: string } {
  const byKey = new Map<string, string>();

  for (const color of colors ?? []) {
    if (!color.name.trim()) return { error: 'Une couleur n’a pas de nom.' };
    const key = colorKey(color.name);
    if (byKey.has(key)) return { error: `La couleur « ${color.name.trim()} » est en double.` };
    byKey.set(key, color.name);
  }

  // Mise à jour partielle (stock seul) : rien à comparer, on ne touche à rien.
  if (!colors || !variants) return { colors, variants };

  // Stock rattaché à une couleur absente (produit ancien, « Par défaut »…) :
  // gardé tel quel, jamais bloquant — il n'apparaît pas dans le formulaire,
  // donc un refus empêcherait toute modification du produit depuis l'admin.
  const aligned = variants.map((v) => ({ ...v, colorName: byKey.get(colorKey(v.colorName)) ?? v.colorName }));
  return { colors, variants: aligned };
}
