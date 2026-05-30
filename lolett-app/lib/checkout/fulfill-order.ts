import { after } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';
import type { Size, ShippingMethod, ShippingCarrier, ShippingCountryCode, PickupPoint } from '@/types';

interface FulfillOrderParams {
  items: Array<{
    productId: string;
    productName: string;
    size: Size;
    color?: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  total: number;
  shipping: number;
  userId?: string;
  paymentProvider: 'stripe' | 'paypal' | 'demo';
  paymentId: string;
  // Livraison / Click & Collect — mêmes données que le webhook (cohérence).
  shippingMethod?: ShippingMethod;
  shippingCarrier?: ShippingCarrier;
  shippingCountry?: ShippingCountryCode;
  pickupPoint?: PickupPoint | null;
  // Clés plates snake (metadata Stripe) pour la re-validation C&C en BD.
  pickupPointId?: string;
  pickupProvider?: string;
}

export async function fulfillOrder(params: FulfillOrderParams): Promise<string> {
  const {
    items, customer, total, shipping, userId, paymentProvider, paymentId,
    shippingMethod, shippingCarrier, shippingCountry, pickupPoint,
    pickupPointId, pickupProvider,
  } = params;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('orders')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existing) {
    console.log(`[fulfillOrder] Order already exists for payment ${paymentId}`);
    return existing.id;
  }

  // Garde Click & Collect (miroir du webhook §10.3) : on revérifie que le point
  // est TOUJOURS actif (il a pu être désactivé entre paiement et fulfillment).
  // On lit la clé plate pickup_point_id (lookup), JAMAIS le snapshot JSON.
  // D3 : .maybeSingle() — 0 ligne → { data: null } sans bruit PGRST116.
  let pointValid = true;
  if (shippingMethod === 'click_collect') {
    pointValid = false;
    if (pickupPointId && pickupProvider === 'click_collect') {
      const { data: dbPoint } = await admin
        .from('pickup_points')
        .select('id, is_active')
        .eq('id', pickupPointId)
        .maybeSingle();
      pointValid = dbPoint?.is_active === true;
    }
  }

  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.create({
    items,
    customer,
    total,
    shipping,
    userId,
    paymentProvider,
    shippingMethod,
    shippingCarrier,
    shippingCountry,
    pickupPoint,
  });

  const now = new Date().toISOString();

  // C&C avec point invalide → payment_review, AUCUN email, pas de décrément stock
  // ni de points fidélité (Lola traite manuellement). Identique au webhook.
  if (shippingMethod === 'click_collect' && !pointValid) {
    await admin
      .from('orders')
      .update({ status: 'payment_review', payment_id: paymentId, updated_at: now })
      .eq('id', order.id);
    Sentry.captureMessage('C&C order without valid pickup_point at fulfillment (inline)', {
      level: 'error',
      tags: { feature: 'click_and_collect', step: 'fulfill' },
      extra: { orderId: order.id, pickupPointId, pickupProvider },
    });
    console.warn(`[fulfillOrder] Order ${order.orderNumber} → payment_review (C&C point invalide)`);
    return order.id;
  }

  await admin
    .from('orders')
    .update({ status: 'paid', payment_id: paymentId, updated_at: now })
    .eq('id', order.id);

  await decrementStockForOrder(order.id);

  if (userId) {
    await admin.from('cart_items').delete().eq('user_id', userId);
  }

  if (userId) {
    const points = Math.floor(total);
    if (points > 0) {
      await admin.rpc('increment_loyalty_points', {
        p_user_id: userId,
        p_points: points,
      });
    }
  }

  // after() garde la lambda Vercel vivante jusqu'à l'envoi du mail,
  // sans bloquer la réponse HTTP. Sans ça, fire-and-forget pouvait
  // tronquer l'envoi quand fulfillOrder est appelé depuis la session
  // endpoint (pas le webhook qui a son propre after()).
  after(async () => {
    try {
      await sendOrderConfirmation({
        to: customer.email,
        orderNumber: order.orderNumber,
        items: items.map((i) => ({
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        customer,
        subtotal: total - shipping,
        shipping,
        total,
        // Provider-aware : affiche le bloc point de retrait (MR / C&C) dans l'email.
        shippingMethod,
        pickupPoint,
      });
    } catch (err) {
      console.error('[fulfillOrder] Email error:', err);
    }
  });

  console.log(`[fulfillOrder] Order ${order.orderNumber} created`);
  return order.id;
}
