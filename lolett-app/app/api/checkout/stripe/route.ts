import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  computeShippingCost,
  getShippingCarrier,
  SHIPPING_COUNTRIES,
} from '@/lib/constants';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { generateInvoicePdf } from '@/lib/invoice/generate-invoice';
import { computePromoDiscount, type PromoType } from '@/lib/promo/discount';
import type { Size, ShippingMethod, ShippingCountryCode, PickupPoint } from '@/types';

const VALID_COUNTRIES = SHIPPING_COUNTRIES.map((c) => c.code) as ShippingCountryCode[];
const VALID_METHODS: ShippingMethod[] = ['home', 'mondial_relay'];

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
    const {
      items,
      customer,
      userId,
      giftCardCode,
      promoCode,
      shippingMethod: rawMethod,
      shippingCountry: rawCountry,
      pickupPoint: rawPickup,
    } = body as {
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
      promoCode?: string;
      shippingMethod?: ShippingMethod;
      shippingCountry?: ShippingCountryCode;
      pickupPoint?: PickupPoint | null;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items requis' }, { status: 400 });
    }

    // Validation pays + mode (sécurité serveur — ne jamais faire confiance au client).
    const shippingCountry: ShippingCountryCode = (rawCountry && VALID_COUNTRIES.includes(rawCountry)) ? rawCountry : 'FR';
    const shippingMethod: ShippingMethod = (rawMethod && VALID_METHODS.includes(rawMethod)) ? rawMethod : 'home';
    const shippingCarrier = getShippingCarrier(shippingMethod);

    if (shippingMethod === 'mondial_relay' && (!rawPickup || !rawPickup.id)) {
      return NextResponse.json(
        { error: 'Point relais Mondial Relay manquant' },
        { status: 400 }
      );
    }
    const pickupPoint: PickupPoint | null = shippingMethod === 'mondial_relay' ? (rawPickup ?? null) : null;

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
    // Recalcul SERVEUR des frais de port — source de vérité.
    const shipping = computeShippingCost(subtotal, shippingCountry, shippingMethod);
    const total = subtotal + shipping;

    // --- Promo code re-validation (server-side) ---
    let promoDiscount = 0;
    let promoId: string | null = null;
    let promoValidatedCode: string | null = null;
    let promoUsedCount = 0;

    if (promoCode && typeof promoCode === 'string') {
      const code = promoCode.trim().toUpperCase();
      if (code.length === 0 || code.length > 64) {
        return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 });
      }

      const { data: promo, error: promoErr } = await admin
        .from('promo_codes')
        .select('id, code, type, value, min_order, usage_limit, used_count, active, starts_at, expires_at')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle();

      if (promoErr) {
        console.error('[POST /api/checkout/stripe] promo lookup error:', promoErr);
        return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 });
      }

      const now = new Date();
      const expiresAt = promo?.expires_at ? new Date(promo.expires_at) : null;
      const startsAt = promo?.starts_at ? new Date(promo.starts_at) : null;
      const minOrder = Number(promo?.min_order ?? 0);

      const usable =
        promo &&
        (!expiresAt || expiresAt > now) &&
        (!startsAt || startsAt <= now) &&
        (!promo.usage_limit || Number(promo.used_count) < Number(promo.usage_limit)) &&
        (minOrder <= 0 || subtotal >= minOrder);

      if (!usable || !promo) {
        return NextResponse.json({ error: 'Code promo invalide ou expiré' }, { status: 400 });
      }

      promoDiscount = computePromoDiscount(promo.type as PromoType, Number(promo.value), subtotal);
      promoId = promo.id;
      promoValidatedCode = promo.code;
      promoUsedCount = Number(promo.used_count ?? 0);
    }

    const discountedSubtotal = +(subtotal - promoDiscount).toFixed(2);
    const totalAfterPromo = +(discountedSubtotal + shipping).toFixed(2);

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
      giftCardRedeemAmount = Math.min(Number(card.balance), totalAfterPromo);
    }

    const stripeAmount = +(totalAfterPromo - giftCardRedeemAmount).toFixed(2);
    const siteUrl = process.env.CHECKOUT_REDIRECT_URL || 'http://localhost:3000';

    // --- Case 1: discounts (promo + gift card) fully cover the order (stripeAmount <= 0) ---
    if ((giftCardRedeemAmount > 0 || promoDiscount > 0) && stripeAmount <= 0.0001) {
      // Create order directly, mark paid, decrement balance, insert redemption.
      const finalTotal = Math.max(0, +(total - promoDiscount - giftCardRedeemAmount).toFixed(2));
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
        total: finalTotal,
        shipping,
        promoCode: promoValidatedCode ?? undefined,
        promoDiscount,
        giftCardCode: giftCardValidatedCode ?? undefined,
        giftCardAmount: giftCardRedeemAmount,
        shippingMethod,
        shippingCarrier,
        shippingCountry,
        pickupPoint,
        userId: userId || undefined,
        paymentProvider: 'stripe',
      });

      const paymentPseudoId = giftCardId
        ? `giftcard_${order.id}`
        : `promo_${order.id}`;

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

      // Increment promo used_count if applicable
      if (promoId) {
        await admin
          .from('promo_codes')
          .update({
            used_count: promoUsedCount + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', promoId);
      }

      // Loyalty points (based on amount actually paid)
      if (userId) {
        const points = Math.floor(finalTotal);
        if (points > 0) {
          await admin.rpc('increment_loyalty_points', {
            p_user_id: userId,
            p_points: points,
          });
        }
      }

      // Génération facture PDF (fire-and-forget)
      generateInvoicePdf({
        ...order,
        shippingMethod,
        shippingCarrier,
        shippingCountry,
        pickupPoint,
      }).catch((err) => {
        console.error('[POST /api/checkout/stripe] Invoice generation failed:', err);
      });

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
          total: finalTotal,
          promoCode: promoValidatedCode ?? undefined,
          promoDiscount,
          giftCardCode: giftCardValidatedCode ?? undefined,
          giftCardAmount: giftCardRedeemAmount,
          shippingMethod,
          pickupPoint,
        });
      } catch (emailErr) {
        console.error('[POST /api/checkout/stripe] email error:', emailErr);
      }

      return NextResponse.json({
        url: `${siteUrl}/checkout/success?gift_card=1&order_id=${order.id}`,
      });
    }

    // --- Case 2: discount present but leftover below Stripe minimum ---
    if ((giftCardRedeemAmount > 0 || promoDiscount > 0) && stripeAmount > 0 && stripeAmount < STRIPE_MIN_AMOUNT_EUR) {
      return NextResponse.json(
        {
          error:
            'Le montant restant est trop faible pour un paiement par carte. Retirez un avantage ou ajoutez un article au panier.',
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
      shipping_address_collection: {
        allowed_countries: VALID_COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
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
        shippingMethod,
        shippingCarrier,
        shippingCountry,
        pickupPoint: pickupPoint ? JSON.stringify(pickupPoint) : '',
        userId: userId || '',
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    };

    const totalAmountOff = +(promoDiscount + giftCardRedeemAmount).toFixed(2);

    if (totalAmountOff > 0) {
      // Combine promo + gift card into a single Stripe coupon (Stripe Checkout
      // only allows one coupon per session — see plan).
      const couponName = [
        promoValidatedCode ? `Promo ${promoValidatedCode}` : null,
        giftCardValidatedCode ? `Carte cadeau ${giftCardValidatedCode}` : null,
      ]
        .filter(Boolean)
        .join(' + ');

      const coupon = await getStripe().coupons.create({
        amount_off: Math.round(totalAmountOff * 100),
        currency: 'eur',
        duration: 'once',
        name: couponName || 'Réduction',
      });
      sessionParams.discounts = [{ coupon: coupon.id }];

      const extraMeta: Record<string, string> = {};
      if (giftCardValidatedCode) {
        extraMeta.giftCardCode = giftCardValidatedCode;
        extraMeta.giftCardRedeemAmount = String(giftCardRedeemAmount);
      }
      if (promoValidatedCode && promoId) {
        extraMeta.promoCode = promoValidatedCode;
        extraMeta.promoId = promoId;
        extraMeta.promoDiscount = String(promoDiscount);
      }
      extraMeta.couponId = coupon.id;

      sessionParams.metadata = {
        ...(sessionParams.metadata || {}),
        ...extraMeta,
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
