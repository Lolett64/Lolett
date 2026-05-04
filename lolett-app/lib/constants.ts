import type { ShippingMethod, ShippingCountryCode } from '@/types';

export const STOCK = {
  LOW_THRESHOLD: 3,
} as const;

// TVA standard France (20%). Les prix produits sont stockés et affichés TTC.
// On expose la part TVA et le HT dans le récap panier / email / facture
// pour respecter l'obligation légale B2C (décret n°87-1045).
export const VAT = {
  RATE: 0.20,
} as const;

export function computeVAT(ttc: number, rate: number = VAT.RATE) {
  const ht = ttc / (1 + rate);
  const vat = ttc - ht;
  return { ht, vat, ttc };
}

// ============================================================================
// LIVRAISON — Mondial Relay + Domicile sur 6 pays UE (3 zones tarifaires)
// ============================================================================

export type ShippingZone = 'FR' | 'BENELUX' | 'IBERIA';

export const SHIPPING_COUNTRIES: ReadonlyArray<{
  code: ShippingCountryCode;
  name: string;
  zone: ShippingZone;
  phonePrefix: string;
  phoneRegex: RegExp;
  postalCodeRegex: RegExp;
  postalCodeExample: string;
}> = [
  { code: 'FR', name: 'France',     zone: 'FR',      phonePrefix: '+33',  phoneRegex: /^(?:\+33|0)[1-9]\d{8}$/,        postalCodeRegex: /^\d{5}$/,            postalCodeExample: '75001' },
  { code: 'BE', name: 'Belgique',   zone: 'BENELUX', phonePrefix: '+32',  phoneRegex: /^\+32\d{8,9}$/,                 postalCodeRegex: /^\d{4}$/,            postalCodeExample: '1000' },
  { code: 'LU', name: 'Luxembourg', zone: 'BENELUX', phonePrefix: '+352', phoneRegex: /^\+352\d{6,9}$/,                postalCodeRegex: /^\d{4}$/,            postalCodeExample: '1234' },
  { code: 'NL', name: 'Pays-Bas',   zone: 'BENELUX', phonePrefix: '+31',  phoneRegex: /^\+31\d{9}$/,                   postalCodeRegex: /^\d{4} ?[A-Z]{2}$/i, postalCodeExample: '1011 AB' },
  { code: 'ES', name: 'Espagne',    zone: 'IBERIA',  phonePrefix: '+34',  phoneRegex: /^\+34\d{9}$/,                   postalCodeRegex: /^\d{5}$/,            postalCodeExample: '28013' },
  { code: 'PT', name: 'Portugal',   zone: 'IBERIA',  phonePrefix: '+351', phoneRegex: /^\+351\d{9}$/,                  postalCodeRegex: /^\d{4}-\d{3}$/,      postalCodeExample: '1100-148' },
];

export const SHIPPING_METHODS: Record<ShippingMethod, { id: ShippingMethod; label: string; carrier: 'colissimo' | 'mondial_relay' }> = {
  home:          { id: 'home',          label: 'Livraison à domicile',         carrier: 'colissimo' },
  mondial_relay: { id: 'mondial_relay', label: 'Point Relais Mondial Relay',   carrier: 'mondial_relay' },
};

// Tarifs plats (€) par zone × méthode.
export const SHIPPING_RATES: Record<ShippingZone, Record<ShippingMethod, number>> = {
  FR:      { home: 5.90, mondial_relay: 4.90 },
  BENELUX: { home: 7.90, mondial_relay: 6.90 },
  IBERIA:  { home: 9.90, mondial_relay: 7.90 },
};

// Seuil de livraison gratuite (sous-total ≥ seuil → port = 0). null = pas de gratuit.
export const SHIPPING_FREE_THRESHOLD: Record<ShippingZone, number | null> = {
  FR: 100,
  BENELUX: 150,
  IBERIA: null,
};

// Délais indicatifs affichés sur /livraison + emails.
export const SHIPPING_DELAYS: Record<ShippingZone, string> = {
  FR: '2-4 jours ouvrés',
  BENELUX: '3-5 jours ouvrés',
  IBERIA: '4-6 jours ouvrés',
};

export function getShippingZone(country: ShippingCountryCode): ShippingZone | null {
  return SHIPPING_COUNTRIES.find((c) => c.code === country)?.zone ?? null;
}

export function getShippingCountry(country: ShippingCountryCode) {
  return SHIPPING_COUNTRIES.find((c) => c.code === country) ?? null;
}

// Calcul des frais de port côté client ET serveur.
// Source de vérité unique : ne JAMAIS faire confiance à un montant transmis
// par le client — recalculer systématiquement via cette fonction.
export function computeShippingCost(
  subtotal: number,
  country: ShippingCountryCode,
  method: ShippingMethod
): number {
  const zone = getShippingZone(country);
  if (!zone) return 0;
  const threshold = SHIPPING_FREE_THRESHOLD[zone];
  if (threshold !== null && subtotal >= threshold) return 0;
  return SHIPPING_RATES[zone][method];
}

export function getShippingCarrier(method: ShippingMethod): 'colissimo' | 'mondial_relay' {
  return SHIPPING_METHODS[method].carrier;
}

// URL publique de suivi par transporteur. Utilisée dans l'email "Expédié".
export function getTrackingUrl(carrier: 'colissimo' | 'mondial_relay', trackingNumber: string): string {
  if (carrier === 'mondial_relay') {
    const brand = process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID ?? '';
    return `https://www.mondialrelay.com/suivi-de-colis/?codeMarque=${encodeURIComponent(brand)}&NumeroExpedition=${encodeURIComponent(trackingNumber)}`;
  }
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
}

// ============================================================================
// Legacy — alias France/Domicile pour compat avec les emplacements
// pas encore migrés (HighBar, OrderSummary, etc.). Nouvelles fonctionnalités
// doivent utiliser computeShippingCost().
// ============================================================================
export const SHIPPING = {
  COST: SHIPPING_RATES.FR.home,
  FREE_THRESHOLD: SHIPPING_FREE_THRESHOLD.FR ?? 100,
} as const;
