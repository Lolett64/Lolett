import type {
  OrderStatus,
  ShippingMethod,
  ShippingCarrier,
  ShippingCountryCode,
} from '@/lib/types/domain';

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

// ============================================================================
// STATUTS DE COMMANDE — source de vérité unique (13 statuts alignés DB)
// ============================================================================

// Ré-export pratique pour les consommateurs (PR4 OrderFilters dérive la liste).
export { ORDER_STATUS_VALUES } from '@/lib/types/domain';

// Labels FR au féminin (cohérent avec « commande »)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:            'En attente',
  paid:               'Payée',
  confirmed:          'Confirmée',
  shipped:            'Expédiée',
  delivered:          'Livrée',
  ready_for_pickup:   'Prête au retrait',
  picked_up:          'Retirée',
  cancelled:          'Annulée',
  refunded:           'Remboursée',
  partially_refunded: 'Remb. partiel',
  disputed:           'Litige Stripe',
  expired:            'Expirée',
  payment_review:     'À vérifier',
};

// Couleurs unifiées : hex (Recharts), tw (préfixe), twFull (classes badge complètes)
export const ORDER_STATUS_COLORS: Record<OrderStatus, { hex: string; tw: string; twFull: string }> = {
  pending:            { hex: '#94a3b8', tw: 'slate',   twFull: 'bg-slate-50 text-slate-700 border-slate-200' },
  paid:               { hex: '#3b82f6', tw: 'blue',    twFull: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed:          { hex: '#8b5cf6', tw: 'violet',  twFull: 'bg-violet-50 text-violet-700 border-violet-200' },
  shipped:            { hex: '#f59e0b', tw: 'amber',   twFull: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivered:          { hex: '#10b981', tw: 'emerald', twFull: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ready_for_pickup:   { hex: '#06b6d4', tw: 'cyan',    twFull: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  picked_up:          { hex: '#14b8a6', tw: 'teal',    twFull: 'bg-teal-50 text-teal-700 border-teal-200' },
  cancelled:          { hex: '#ef4444', tw: 'red',     twFull: 'bg-red-50 text-red-700 border-red-200' },
  refunded:           { hex: '#f97316', tw: 'orange',  twFull: 'bg-orange-50 text-orange-700 border-orange-200' },
  partially_refunded: { hex: '#fb923c', tw: 'orange',  twFull: 'bg-orange-50 text-orange-600 border-orange-200' },
  disputed:           { hex: '#dc2626', tw: 'red',     twFull: 'bg-red-100 text-red-800 border-red-300' },
  expired:            { hex: '#6b7280', tw: 'gray',    twFull: 'bg-gray-50 text-gray-600 border-gray-200' },
  payment_review:     { hex: '#eab308', tw: 'yellow',  twFull: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

// Transitions autorisées par statut (workflow domicile + Click & Collect, spec §4.5)
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:            ['paid', 'cancelled', 'expired', 'payment_review'],
  paid:               ['confirmed', 'cancelled', 'refunded'],
  confirmed:          ['shipped', 'ready_for_pickup', 'cancelled', 'refunded'],
  shipped:            ['delivered', 'refunded'],
  delivered:          ['refunded', 'partially_refunded'],
  ready_for_pickup:   ['picked_up', 'cancelled', 'refunded'],
  picked_up:          ['refunded', 'partially_refunded'],
  cancelled:          [],
  refunded:           [],
  partially_refunded: [],
  disputed:           ['refunded'],
  expired:            [],
  payment_review:     ['paid', 'cancelled'],
};

// Statuts gérés par les webhooks Stripe (non éditables manuellement depuis l'admin)
export const STRIPE_MANAGED_STATUSES: OrderStatus[] = [
  'refunded', 'partially_refunded', 'disputed', 'payment_review',
];

// Statuts éligibles à un refund Stripe depuis l'admin (inclut ready_for_pickup : no-show C&C)
export const REFUNDABLE_STATUSES: OrderStatus[] = [
  'paid', 'confirmed', 'shipped', 'delivered',
  'ready_for_pickup',
  'partially_refunded',
];

// Étapes parcours timeline (UI client + admin workflow viz)
export const ORDER_STEPS_HOME   = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'] as const;
export const ORDER_STEPS_PICKUP = ['pending', 'confirmed', 'paid', 'ready_for_pickup', 'picked_up'] as const;

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

export const SHIPPING_METHODS: Record<ShippingMethod, { id: ShippingMethod; label: string; carrier: ShippingCarrier }> = {
  home:          { id: 'home',          label: 'Livraison à domicile',                  carrier: 'colissimo' },
  mondial_relay: { id: 'mondial_relay', label: 'Point Relais Mondial Relay',            carrier: 'mondial_relay' },
  click_collect: { id: 'click_collect', label: 'Retrait en boutique (Click & Collect)', carrier: 'click_collect' },
};

// Dérivé dynamiquement — source unique pour la validation Stripe/webhook.
export const VALID_SHIPPING_METHODS = Object.keys(SHIPPING_METHODS) as ShippingMethod[];

// Libellés transporteur — source unique pour l'admin et les emails.
export const SHIPPING_CARRIER_LABELS: Record<ShippingCarrier, string> = {
  colissimo: 'Colissimo',
  mondial_relay: 'Mondial Relay',
  click_collect: 'Click & Collect',
};

// Tarifs plats (€) par zone × méthode. click_collect UNIQUEMENT en FR (gratuit).
export const SHIPPING_RATES: Record<ShippingZone, Partial<Record<ShippingMethod, number>>> = {
  FR:      { home: 5.90, mondial_relay: 4.90, click_collect: 0 },
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
  // Garde sécurisée — Click & Collect FR-only au niveau code (anti-DevTools).
  if (method === 'click_collect') {
    if (country !== 'FR') {
      throw new Error('Click & Collect est disponible uniquement en France');
    }
    return 0;
  }
  const zone = getShippingZone(country);
  if (!zone) return 0;
  const threshold = SHIPPING_FREE_THRESHOLD[zone];
  if (threshold !== null && subtotal >= threshold) return 0;
  return SHIPPING_RATES[zone][method] ?? 0;
}

export function getShippingCarrier(method: ShippingMethod): ShippingCarrier {
  return SHIPPING_METHODS[method].carrier;
}

// URL publique de suivi par transporteur. null pour click_collect (pas de suivi).
export function getTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string | null {
  if (carrier === 'click_collect') return null;
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
  COST: SHIPPING_RATES.FR.home ?? 0,
  FREE_THRESHOLD: SHIPPING_FREE_THRESHOLD.FR ?? 100,
} as const;
