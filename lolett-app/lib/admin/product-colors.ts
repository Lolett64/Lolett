/**
 * Un produit a deux listes de couleurs : `products.colors` (ce que le client
 * choisit sur la fiche) et `product_variants.color_name` (le stock par
 * couleur × taille). Le décrément de stock à la commande les rapproche par
 * nom : si elles divergent (espace en trop, doublon, couleur orpheline), le
 * stock baisse sur la mauvaise couleur. On les normalise à l'enregistrement.
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
  const cleanColors = colors?.map((c) => ({ ...c, name: c.name.trim() }));
  const byKey = new Map<string, string>();

  for (const color of cleanColors ?? []) {
    if (!color.name) return { error: 'Une couleur n’a pas de nom.' };
    const key = colorKey(color.name);
    if (byKey.has(key)) return { error: `La couleur « ${color.name} » est en double.` };
    byKey.set(key, color.name);
  }

  const cleanVariants = variants?.map((v) => {
    // Mise à jour partielle (stock seul) : on ne touche à rien, sinon les noms
    // divergeraient de products.colors resté en base.
    if (!cleanColors) return v;
    return { ...v, colorName: byKey.get(colorKey(v.colorName)) ?? v.colorName.trim() };
  });

  if (cleanColors && cleanVariants) {
    const orphan = cleanVariants.find((v) => !byKey.has(colorKey(v.colorName)));
    if (orphan) {
      return { error: `Du stock est rattaché à « ${orphan.colorName} », qui n’est pas une couleur du produit.` };
    }
  }

  return { colors: cleanColors, variants: cleanVariants };
}
