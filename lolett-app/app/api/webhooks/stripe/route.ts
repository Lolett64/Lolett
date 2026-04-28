import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { generateInvoicePdf } from '@/lib/invoice/generate-invoice';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';
import { sendHtmlEmail } from '@/lib/email-provider';
import { renderGiftCardDeliveryV3 } from '@/lib/email/templates/gift-card-delivery-v3';
import { renderGiftCardPurchaseConfirmationV3 } from '@/lib/email/templates/gift-card-purchase-confirmation-v3';
import { SHIPPING_COUNTRIES } from '@/lib/constants';
import type { ShippingMethod, ShippingCountryCode, PickupPoint } from '@/types';

const VALID_COUNTRY_CODES = SHIPPING_COUNTRIES.map((c) => c.code) as ShippingCountryCode[];
const VALID_SHIPPING_METHODS: ShippingMethod[] = ['home', 'mondial_relay'];

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

    // --- Gift card purchase branch ---
    if (metadata?.kind === 'gift_card') {
      try {
        const admin = createAdminClient();

        // Idempotence : récupère la carte associée à la session
        const { data: existingGc, error: fetchErr } = await admin
          .from('gift_cards')
          .select('id, code, initial_amount, balance, status, purchaser_email, purchaser_name, recipient_email, recipient_name, message, expires_at, email_sent_at')
          .eq('stripe_session_id', session.id)
          .maybeSingle();

        if (fetchErr) {
          console.error('[Stripe webhook] Gift card lookup error:', fetchErr);
          return NextResponse.json({ received: true });
        }

        if (!existingGc) {
          console.error(`[Stripe webhook] No gift_card row for session ${session.id}`);
          return NextResponse.json({ received: true });
        }

        // Skip si déjà traité
        if (existingGc.status === 'active' || existingGc.email_sent_at) {
          console.log(`[Stripe webhook] Gift card ${existingGc.code} already active, skipping`);
          return NextResponse.json({ received: true });
        }

        const nowIso = new Date().toISOString();

        // Active la carte cadeau
        const { error: updateErr } = await admin
          .from('gift_cards')
          .update({
            status: 'active',
            activated_at: nowIso,
            stripe_payment_intent: session.payment_intent as string,
            email_sent_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', existingGc.id);

        if (updateErr) {
          console.error('[Stripe webhook] Gift card update error:', updateErr);
          return NextResponse.json({ received: true });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';

        // Email destinataire
        try {
          const deliveryHtml = renderGiftCardDeliveryV3({
            recipientName: existingGc.recipient_name || undefined,
            purchaserName: existingGc.purchaser_name || undefined,
            amount: Number(existingGc.initial_amount),
            code: existingGc.code,
            message: existingGc.message || undefined,
            expiresAt: existingGc.expires_at,
            shopUrl: baseUrl,
          });
          const deliveryRes = await sendHtmlEmail({
            to: existingGc.recipient_email,
            subject: `${existingGc.purchaser_name ? `${existingGc.purchaser_name} vous offre` : 'Une carte cadeau'} une carte cadeau LOLETT`,
            html: deliveryHtml,
          });
          if (!deliveryRes.success) {
            console.error('[Stripe webhook] Gift card delivery email failed:', deliveryRes.error);
          }
        } catch (e) {
          console.error('[Stripe webhook] Gift card delivery email exception:', e);
        }

        // Email acheteur
        try {
          const purchaseHtml = renderGiftCardPurchaseConfirmationV3({
            purchaserName: existingGc.purchaser_name || undefined,
            recipientEmail: existingGc.recipient_email,
            recipientName: existingGc.recipient_name || undefined,
            amount: Number(existingGc.initial_amount),
            code: existingGc.code,
          });
          const purchaseRes = await sendHtmlEmail({
            to: existingGc.purchaser_email,
            subject: 'Votre achat de carte cadeau LOLETT',
            html: purchaseHtml,
          });
          if (!purchaseRes.success) {
            console.error('[Stripe webhook] Gift card purchase email failed:', purchaseRes.error);
          }
        } catch (e) {
          console.error('[Stripe webhook] Gift card purchase email exception:', e);
        }

        console.log(`[Stripe webhook] Gift card ${existingGc.code} activated`);
      } catch (error) {
        console.error('[Stripe webhook] Gift card processing error:', error);
      }
      return NextResponse.json({ received: true });
    }

    if (!metadata?.items || !metadata?.customer) {
      console.error('[Stripe webhook] Missing metadata');
      return NextResponse.json({ received: true });
    }

    try {
      const items = WebhookItemSchema.parse(JSON.parse(metadata.items));
      const customer = WebhookCustomerSchema.parse(JSON.parse(metadata.customer));
      const grossTotal = parseFloat(metadata.total || '0');
      const shipping = parseFloat(metadata.shipping || '0');
      const userId = metadata.userId || undefined;

      const promoCode = metadata.promoCode || undefined;
      const promoDiscount = parseFloat(metadata.promoDiscount || '0') || 0;
      const giftCardCode = metadata.giftCardCode || undefined;
      const giftCardAmount = parseFloat(metadata.giftCardRedeemAmount || '0') || 0;

      // Livraison — récupérée depuis la metadata stockée à la création de session.
      const rawMethod = metadata.shippingMethod as ShippingMethod | undefined;
      const rawCountry = metadata.shippingCountry as ShippingCountryCode | undefined;
      const shippingMethod: ShippingMethod = rawMethod && VALID_SHIPPING_METHODS.includes(rawMethod) ? rawMethod : 'home';
      const shippingCountry: ShippingCountryCode = rawCountry && VALID_COUNTRY_CODES.includes(rawCountry) ? rawCountry : 'FR';
      const shippingCarrier = shippingMethod === 'mondial_relay' ? 'mondial_relay' : 'colissimo';
      let pickupPoint: PickupPoint | null = null;
      if (metadata.pickupPoint) {
        try {
          pickupPoint = JSON.parse(metadata.pickupPoint) as PickupPoint;
        } catch {
          pickupPoint = null;
        }
      }

      const finalTotal = Math.max(0, +(grossTotal - promoDiscount - giftCardAmount).toFixed(2));

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
        total: finalTotal,
        shipping,
        promoCode,
        promoDiscount,
        giftCardCode,
        giftCardAmount,
        shippingMethod,
        shippingCarrier,
        shippingCountry,
        pickupPoint,
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

      // 4. Loyalty points (based on amount actually paid)
      if (userId) {
        const points = Math.floor(finalTotal);
        if (points > 0) {
          await admin.rpc('increment_loyalty_points', {
            p_user_id: userId,
            p_points: points,
          });
        }
      }

      // 4.5 Génération facture PDF (await — on veut joindre le PDF à l'email).
      // En cas d'échec, on log et on envoie l'email sans PJ pour ne pas bloquer
      // la confirmation (le PDF pourra être régénéré manuellement plus tard).
      let invoicePdf: { buffer: Buffer; filename: string } | undefined;
      try {
        const invoice = await generateInvoicePdf({
          ...order,
          shippingMethod,
          shippingCarrier,
          shippingCountry,
          pickupPoint,
          promoCode,
          promoDiscount,
          giftCardCode,
          giftCardAmount,
        });
        if (invoice.pdf) {
          invoicePdf = { buffer: invoice.pdf, filename: `Facture-${invoice.number}.pdf` };
        }
      } catch (err) {
        console.error('[Stripe webhook] Invoice generation failed:', err);
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
        subtotal: grossTotal - shipping,
        shipping,
        total: finalTotal,
        promoCode,
        promoDiscount,
        giftCardCode,
        giftCardAmount,
        shippingMethod,
        pickupPoint,
        invoicePdf,
      });

      // 6. Apply gift card redemption if present (atomic via RPC).
      // Lock + idempotency check + decrement + insert dans 1 transaction.
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
              const redeemed = Math.min(Number(card.balance), amount);
              const { data: redeemResult, error: redeemError } = await admin.rpc(
                'redeem_gift_card_atomic',
                {
                  p_card_id: card.id,
                  p_order_id: order.id,
                  p_amount: redeemed,
                  p_stripe_payment_intent: session.payment_intent as string,
                },
              );
              if (redeemError) {
                console.error('[Stripe webhook] redeem_gift_card_atomic failed:', redeemError);
              } else if (redeemResult && (redeemResult as { success?: boolean }).success === false) {
                console.error('[Stripe webhook] redeem_gift_card_atomic rejected:', redeemResult);
              }
            }
          }
        }
      } catch (giftErr) {
        // Never fail the webhook because of a gift-card redemption issue.
        console.error('[Stripe webhook] gift card redemption error:', giftErr);
      }

      // 7. Increment promo_codes.used_count if a promo was applied
      try {
        if (metadata.promoId) {
          const promoId = String(metadata.promoId);
          const { data: promo, error: promoErr } = await admin
            .from('promo_codes')
            .select('id, used_count')
            .eq('id', promoId)
            .maybeSingle();

          if (promoErr) {
            console.error('[Stripe webhook] promo lookup error:', promoErr);
          } else if (promo) {
            const { error: updErr } = await admin
              .from('promo_codes')
              .update({
                used_count: Number(promo.used_count ?? 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', promo.id);
            if (updErr) console.error('[Stripe webhook] promo used_count update error:', updErr);
          }
        }
      } catch (promoErr) {
        // Never fail the webhook because of a promo increment issue.
        console.error('[Stripe webhook] promo increment error:', promoErr);
      }

      console.log(`[Stripe webhook] Order ${order.orderNumber} created successfully`);
    } catch (error) {
      console.error('[Stripe webhook] Error processing order:', error);
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
