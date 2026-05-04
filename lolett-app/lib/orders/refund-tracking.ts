// Parse les refunds Stripe d'une commande pour calculer les quantités déjà
// remboursées par (product_id, size, color). Sert au RefundDialog admin et au
// endpoint /api/admin/orders/[id]/refund (defence-in-depth) pour empêcher Lola
// de re-cocher des items déjà remboursés.

import Stripe from 'stripe';

export interface RefundedItemEntry {
  productId: string;
  size: string;
  color: string; // '' si null/absent — match avec normalisation côté lecture
  quantity: number;
}

// Clé canonique pour agréger des items (insensible casse couleur, comme le endpoint refund).
export function refundItemKey(productId: string, size: string, color: string | null | undefined): string {
  const normColor = (color ?? '').trim().toLowerCase();
  const normSize = size.trim().toLowerCase();
  return `${productId}::${normSize}::${normColor}`;
}

// Parse les metadata.items_json de tous les refunds Stripe d'un payment_intent
// et agrège les quantités par item key. Ignore les refunds en mode commercial_gesture
// (pas d'items) et ceux sans metadata.items_json (refunds dashboard externe).
export async function getAlreadyRefundedQtyMap(
  stripe: Stripe,
  paymentIntentId: string | null,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!paymentIntentId) return map;

  let refunds: Stripe.ApiList<Stripe.Refund>;
  try {
    refunds = await stripe.refunds.list({ payment_intent: paymentIntentId, limit: 100 });
  } catch {
    // En cas d'erreur Stripe (clé manquante, network…), on retourne map vide :
    // le dialog laissera Lola tenter l'opération, le endpoint serveur refera la vérif.
    return map;
  }

  for (const refund of refunds.data) {
    if (refund.status === 'failed' || refund.status === 'canceled') continue;
    const kind = refund.metadata?.refund_kind;
    if (kind === 'commercial_gesture') continue;

    const itemsJson = refund.metadata?.items_json;
    if (!itemsJson) continue;

    try {
      const compact = JSON.parse(itemsJson) as Array<{ p: string; s: string; c: string; q: number }>;
      for (const c of compact) {
        const key = refundItemKey(c.p, c.s, c.c || null);
        map.set(key, (map.get(key) ?? 0) + Number(c.q || 0));
      }
    } catch {
      // metadata corrompue → ignorer ce refund mais ne pas crash le dialog.
    }
  }

  return map;
}
