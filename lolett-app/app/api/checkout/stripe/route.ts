import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { SHIPPING } from '@/lib/constants';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import type { Size } from '@/types';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const STRIPE_MIN_AMOUNT_EUR = 0.5;

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe non configuré' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { items, customer, userId, giftCardCode } = body as {
      items: Array<{ productId: string; productName: string; size: string; quantity: number }>;
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
      userId?: string;
      giftCardCode?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items requis' }, { status: 400 });
    }

    // Server-side price verification
    const admin = createAdminClient();
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts, error: dbError } = await admin
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Failed to verify prices' }, { status: 500 });
    }

    const priceMap = new Map(dbProducts.map((p: { id: string; name: string; price: number }) => [p.id, p]));

    const verifiedItems = items.map((item) => {
      const dbProduct = priceMap.get(item.productId);
      if (!dbProduct) throw new Error(`Product ${item.productId} not found`);
      return { ...item, productName: dbProduct.name, price: dbProduct.price };
    });

    const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.COST;
    const total = subtotal + shipping;

    // --- Gift card redemption ---
    let giftCardRedeemAmount = 0;
    let giftCardId: string | null = null;
    let giftCardValidatedCode: string | null = null;

    if (giftCardCode && typeof giftCardCode === 'string') {
      const code = giftCardCode.trim().toUpperCase();
      const { data: card, error: cardErr } = await admin
        .from('gift_cards')
        .select('id, code, balance, status, expires_at')
        .eq('code', code)
        .maybeSingle();

      if (cardErr) {
        console.error('[POST /api/checkout/stripe] gift card lookup error:', cardErr);
        return NextResponse.json(
          { error: 'Carte cadeau invalide' },
          { status: 400 }
        );
      }

      const now = new Date();
      const expiresAt = card?.expires_at ? new Date(card.expires_at) : null;
      const isUsable =
        card &&
        card.status === 'active' &&
        Number(card.balance) > 0 &&
        (!expiresAt || expiresAt > now);

      if (!isUsable) {
        return NextResponse.json(
          { error: 'Carte cadeau invalide ou expirée' },
          { status: 400 }
        );
      }

      giftCardId = card.id;
      giftCardValidatedCode = card.code;
      giftCardRedeemAmount = Math.min(Number(card.balance), total);
    }

    const stripeAmount = +(total - giftCardRedeemAmount).toFixed(2);
    const siteUrl = process.env.CHECKOUT_REDIRECT_URL || 'http://localhost:3000';

    // --- Case 1: gift card fully covers the order (stripeAmount <= 0) ---
    if (giftCardRedeemAmount > 0 && stripeAmount <= 0.0001) {
      // Create order directly, mark paid, decrement balance, insert redemption.
      const orderRepo = new SupabaseOrderRepository();
      const order = await orderRepo.create({
        items: verifiedItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          size: i.size as Size,
          quantity: i.quantity,
          price: i.price,
        })),
        customer,
        total,
        shipping,
        userId: userId || undefined,
        paymentProvider: 'stripe',
      });

      const paymentPseudoId = `giftcard_${order.id}`;

      await admin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentPseudoId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      await decrementStockForOrder(order.id);

      // Insert redemption + decrement gift-card balance
      if (giftCardId) {
        await admin.from('gift_card_redemptions').insert({
          gift_card_id: giftCardId,
          order_id: order.id,
          amount: giftCardRedeemAmount,
          stripe_payment_intent: paymentPseudoId,
        });

        const { data: cardAfter } = await admin
          .from('gift_cards')
          .select('balance')
          .eq('id', giftCardId)
          .maybeSingle();

        const currentBalance = Number(cardAfter?.balance ?? 0);
        const newBalance = Math.max(0, +(currentBalance - giftCardRedeemAmount).toFixed(2));
        await admin
          .from('gift_cards')
          .update({
            balance: newBalance,
            status: newBalance <= 0 ? 'fully_redeemed' : 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', giftCardId);
      }

      // Loyalty points (same rule as webhook)
      if (userId) {
        const points = Math.floor(total);
        if (points > 0) {
          await admin.rpc('increment_loyalty_points', {
            p_user_id: userId,
            p_points: points,
          });
        }
      }

      // Confirmation email
      try {
        await sendOrderConfirmation({
          to: customer.email,
          orderNumber: order.orderNumber,
          items: verifiedItems.map((i) => ({
            productName: i.productName,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          })),
          customer,
          subtotal,
          shipping,
          total,
        });
      } catch (emailErr) {
        console.error('[POST /api/checkout/stripe] email error:', emailErr);
      }

      return NextResponse.json({
        url: `${siteUrl}/checkout/success?gift_card=1&order_id=${order.id}`,
      });
    }

    // --- Case 2: gift card present but leftover below Stripe minimum ---
    if (giftCardRedeemAmount > 0 && stripeAmount > 0 && stripeAmount < STRIPE_MIN_AMOUNT_EUR) {
      return NextResponse.json(
        {
          error:
            'Le montant restant est trop faible pour un paiement par carte. Retirez la carte cadeau ou ajoutez un article au panier.',
        },
        { status: 400 }
      );
    }

    // --- Case 3: normal Stripe session, with optional gift-card coupon ---
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = verifiedItems.map(
      (item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.productName,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    // Add shipping as a line item if > 0
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Livraison' },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email,
      metadata: {
        customer: JSON.stringify(customer),
        items: JSON.stringify(
          verifiedItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          }))
        ),
        total: String(total),
        shipping: String(shipping),
        userId: userId || '',
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    };

    if (giftCardRedeemAmount > 0 && giftCardValidatedCode) {
      // Create a one-off Stripe coupon for the redemption amount
      const coupon = await getStripe().coupons.create({
        amount_off: Math.round(giftCardRedeemAmount * 100),
        currency: 'eur',
        duration: 'once',
        name: `Carte cadeau ${giftCardValidatedCode}`,
      });
      sessionParams.discounts = [{ coupon: coupon.id }];
      sessionParams.metadata = {
        ...(sessionParams.metadata || {}),
        giftCardCode: giftCardValidatedCode,
        giftCardRedeemAmount: String(giftCardRedeemAmount),
        giftCardCouponId: coupon.id,
      };
      // NOTE: allow_promotion_codes cannot be combined with discounts.
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[POST /api/checkout/stripe]', error);
    return NextResponse.json(
      { error: 'Erreur Stripe' },
      { status: 500 }
    );
  }
}
