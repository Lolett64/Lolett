export type PromoType = 'percentage' | 'fixed';

export function computePromoDiscount(
  type: PromoType,
  value: number,
  subtotal: number
): number {
  const raw =
    type === 'percentage'
      ? Math.round(subtotal * value) / 100
      : value;
  return Math.min(Math.max(0, raw), subtotal);
}
