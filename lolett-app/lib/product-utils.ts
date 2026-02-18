import type { Product } from '@/types';

/**
 * Obtient la première couleur disponible d'un produit
 * Utilise les variantes si disponibles, sinon retourne la première couleur
 */
export function getFirstAvailableColor(product: Product): string | undefined {
  if (!product.colors || product.colors.length === 0) return undefined;
  
  if (!product.variants || product.variants.length === 0) {
    return product.colors[0]?.name;
  }
  
  // Trouver la première couleur qui a du stock
  for (const color of product.colors) {
    const hasStock = product.variants.some(
      (v) => v.colorName === color.name && v.stock > 0
    );
    if (hasStock) return color.name;
  }
  
  // Fallback: première couleur même si pas de stock
  return product.colors[0]?.name;
}
