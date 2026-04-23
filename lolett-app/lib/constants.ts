export const SHIPPING = {
  COST: 5.9,
  FREE_THRESHOLD: 100,
} as const;

export const STOCK = {
  LOW_THRESHOLD: 3,
} as const;

// TVA standard France (20%). Les prix produits sont stockés et affichés TTC.
// On expose la part TVA et le HT dans le récap panier / email / facture
// pour respecter l'obligation légale B2C (décret n°87-1045).
export const VAT = {
  RATE: 0.20,
} as const;

// Helper : depuis un prix TTC, renvoie { ht, vat, ttc }
export function computeVAT(ttc: number, rate: number = VAT.RATE) {
  const ht = ttc / (1 + rate);
  const vat = ttc - ht;
  return { ht, vat, ttc };
}
