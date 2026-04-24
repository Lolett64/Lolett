import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';

const VALID_SIZES = [
  'TU', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '29', '30', '31', '32', '33', '34', '35', '36', '37', '38',
  '39', '40', '41', '42', '43', '44',
  'S/M', 'M/L',
] as const;

const WebhookItemSchema = z.array(z.object({
  productId: z.string(),
  productName: z.string(),
  size: z.enum(VALID_SIZES),
  color: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
}));

const WebhookCustomerSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
    }
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata?.items || !metadata?.customer) {
      console.error('[Stripe webhook] Missing metadata');
      return NextResponse.json({ received: true });
    }

    try {
      const items = WebhookItemSchema.parse(JSON.parse(metadata.items));
      const customer = WebhookCustomerSchema.parse(JSON.parse(metadata.customer));
      const total = parseFloat(metadata.total || '0');
      const shipping = parseFloat(metadata.shipping || '0');
      const userId = metadata.userId || undefined;

      const admin = createAdminClient();

      // Idempotency: skip if order already created (e.g. inline by /session endpoint)
      const { data: existingOrder } = await admin
        .from('orders')
        .select('id')
        .eq('payment_id', session.payment_intent as string)
        .maybeSingle();

      if (existingOrder) {
        console.log(`[Stripe webhook] Order already exists for payment ${session.payment_intent}, skipping`);
        return NextResponse.json({ received: true });
      }

      // 1. Create order
      const orderRepo = new SupabaseOrderRepository();
      const order = await orderRepo.create({
        items,
        customer,
        total,
        shipping,
        userId,
        paymentProvider: 'stripe',
      });

      // 2. Mark as paid
      await admin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: session.payment_intent as string,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // 2.5 Decrement stock atomically
      await decrementStockForOrder(order.id);

      // 3. Clear cart
      if (userId) {
        await admin.from('cart_items').delete().eq('user_id', userId);
      }

      // 4. Loyalty points
      if (userId) {
        const points = Math.floor(total);
        if (points > 0) {
          await admin.rpc('increment_loyalty_points', {
            p_user_id: userId,
            p_points: points,
          });
        }
      }

      // 5. Confirmation email
      await sendOrderConfirmation({
        to: customer.email,
        orderNumber: order.orderNumber,
        items: items.map((i: { productName: string; size: string; quantity: number; price: number }) => ({
          productName: i.productName,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        customer,
        subtotal: total - shipping,
        shipping,
        total,
      });

      // 6. Apply gift card redemption if present
      try {
        if (metadata.giftCardCode && metadata.giftCardRedeemAmount) {
          const code = String(metadata.giftCardCode).trim().toUpperCase();
          const amount = parseFloat(String(metadata.giftCardRedeemAmount));

          if (code && Number.isFinite(amount) && amount > 0) {
            const { data: card, error: cardErr } = await admin
              .from('gift_cards')
              .select('id, balance')
              .eq('code', code)
              .maybeSingle();

            if (cardErr) {
              console.error('[Stripe webhook] gift_card lookup error:', cardErr);
            } else if (card) {
              // Idempotency: skip if a redemption already exists for this order.
              const { data: existingRedemption } = await admin
                .from('gift_card_redemptions')
                .select('id')
                .eq('gift_card_id', card.id)
                .eq('order_id', order.id)
                .maybeSingle();

              if (!existingRedemption) {
                const currentBalance = Number(card.balance);
                const redeemed = Math.min(currentBalance, amount);
                const newBalance = Math.max(0, +(currentBalance - redeemed).toFixed(2));

                const { error: redErr } = await admin
                  .from('gift_card_redemptions')
                  .insert({
                    gift_card_id: card.id,
                    order_id: order.id,
                    amount: redeemed,
                    stripe_payment_intent: session.payment_intent as string,
                  });

                if (redErr) {
                  console.error('[Stripe webhook] gift_card_redemption insert error:', redErr);
                } else {
                  const { error: updErr } = await admin
                    .from('gift_cards')
                    .update({
                      balance: newBalance,
                      status: newBalance <= 0 ? 'fully_redeemed' : 'active',
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', card.id);
                  if (updErr) console.error('[Stripe webhook] gift_card update error:', updErr);
                }
              }
            }
          }
        }
      } catch (giftErr) {
        // Never fail the webhook because of a gift-card redemption issue.
        console.error('[Stripe webhook] gift card redemption error:', giftErr);
      }

      console.log(`[Stripe webhook] Order ${order.orderNumber} created successfully`);
    } catch (error) {
      console.error('[Stripe webhook] Error processing order:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
