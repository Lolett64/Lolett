import { createAdminClient } from '@/lib/supabase/admin';

interface DecrementResult {
  product_id: string;
  product_name: string;
  size: string;
  color: string | null;
  decremented: number;
  insufficient: boolean;
}

/**
 * Décrémente le stock des variants (ou products.stock en fallback) pour tous
 * les items d'une commande. Appelée après la confirmation du paiement pour
 * éviter l'overselling.
 *
 * Idempotent côté appelant : la RPC peut être appelée plusieurs fois pour
 * une même commande si le webhook Stripe retry, donc ne l'invoquer qu'après
 * une transition "pending" → "paid" réussie (check idempotency en amont).
 */
export async function decrementStockForOrder(orderId: string): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('decrement_stock_for_order', {
    p_order_id: orderId,
  });

  if (error) {
    console.error('[decrementStockForOrder]', { orderId, error: error.message });
    return;
  }

  const results = (data ?? []) as DecrementResult[];
  const insufficient = results.filter((r) => r.insufficient);
  if (insufficient.length > 0) {
    console.warn('[decrementStockForOrder] stock insuffisant', {
      orderId,
      items: insufficient,
    });
  }
}
