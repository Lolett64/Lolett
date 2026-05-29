// Module de domaine NEUTRE : n'importe rien (brise tout cycle d'imports).
// Source unique des valeurs/types partagés par constants.ts et types/index.ts.

export const ORDER_STATUS_VALUES = [
  'pending', 'paid', 'confirmed',
  'shipped', 'delivered',
  'ready_for_pickup', 'picked_up',
  'cancelled', 'refunded', 'partially_refunded', 'disputed',
  'expired', 'payment_review',
] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const SHIPPING_METHOD_VALUES = ['home', 'mondial_relay', 'click_collect'] as const;
export type ShippingMethod = (typeof SHIPPING_METHOD_VALUES)[number];

export const SHIPPING_CARRIER_VALUES = ['colissimo', 'mondial_relay', 'click_collect'] as const;
export type ShippingCarrier = (typeof SHIPPING_CARRIER_VALUES)[number];

export const SHIPPING_COUNTRY_CODES = ['FR', 'BE', 'LU', 'NL', 'ES', 'PT'] as const;
export type ShippingCountryCode = (typeof SHIPPING_COUNTRY_CODES)[number];

export type PickupPointProvider = 'mondial_relay' | 'click_collect';
