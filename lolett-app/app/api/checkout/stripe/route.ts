import { NextRequest, NextResponse, after } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  computeShippingCost,
  getShippingCarrier,
  SHIPPING_COUNTRIES,
  VALID_SHIPPING_METHODS,
} from '@/lib/constants';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { decrementStockForOrder } from '@/lib/orders/decrement-stock';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';
import { sendNewOrderAlertToAdmin } from '@/lib/email/order-new-admin';
import { generateInvoicePdf } from '@/lib/invoice/generate-invoice';
import { computePromoDiscount, type PromoType } from '@/lib/promo/discount';
import type { Size, ShippingMethod, ShippingCountryCode, PickupPoint } from '@/types';
import type { RedeemGiftCardResult } from '@/lib/types/gift-card';

const VALID_COUNTRIES = SHIPPING_COUNTRIES.map((c) => c.code) as ShippingCountryCode[];
const VALID_METHODS: ShippingMethod[] = VALID_SHIPPING_METHODS;

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

    // Click & Collect : disponible uniquement en France (les points sont en FR).
    if (shippingMethod === 'click_collect' && shippingCountry !== 'FR') {
      return NextResponse.json(
        { error: 'Click & Collect est disponible uniquement en France' },
        { status: 400 }
      );
    }

    const requiresPickupPoint = shippingMethod === 'mondial_relay' || shippingMethod === 'click_collect';
    if (requiresPickupPoint && (!rawPickup || !rawPickup.id)) {
      return NextResponse.json(
        { error: 'Point de retrait manquant' },
        { status: 400 }
      );
    }

    // Pour mondial_relay on garde le snapshot client (revérifié par le transporteur) ;
    // pour click_collect il sera ÉCRASÉ par la reconstruction BD ci-dessous.
    let pickupPoint: PickupPoint | null = requiresPickupPoint ? (rawPickup ?? null) : null;

    // Client admin (service_role) — utilisé pour la vérif produits/prix, promo,
    // gift card ET la re-vérification du point C&C ci-dessous. Une seule instance.
    const admin = createAdminClient();

    // Click & Collect : on ne fait JAMAIS confiance au snapshot client. On
    // vérifie que le point existe et est actif, puis on RECONSTRUIT le snapshot
    // depuis la BD (anti-DevTools : un client peut forger name/address/id).
    if (shippingMethod === 'click_collect') {
      if (!rawPickup || rawPickup.provider !== 'click_collect') {
        return NextResponse.json({ error: 'Provider invalide' }, { status: 400 });
      }
      // .maybeSingle() (convention D3, alignée sur le webhook) : 0 ligne renvoie
      // { data: null, error: null } sans bruit PGRST116. Le guard !dbPoint attrape l'absence.
      const { data: dbPoint } = await admin
        .from('pickup_points')
        .select('id, name, address, postal_code, city, country, hours, instructions, is_active')
        .eq('id', rawPickup.id)
        .eq('is_active', true)
        .maybeSingle();
      if (!dbPoint) {
        return NextResponse.json(
          { error: 'Point de retrait introuvable ou inactif' },
          { status: 400 }
        );
      }
      pickupPoint = {
        provider: 'click_collect',
        id: dbPoint.id,
        name: dbPoint.name,
        address: dbPoint.address,
        postalCode: dbPoint.postal_code,
        city: dbPoint.city,
        country: dbPoint.country,
        hours: dbPoint.hours,
        instructions: dbPoint.instructions,
      };
    }

    // Server-side price verification
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

      // Atomic gift card redemption AVANT mark paid : si le débit échoue
      // (race condition résiduelle, carte expirée entre validate et confirm),
      // l'order reste 'pending' puis bascule 'payment_review' → on évite
      // d'envoyer une confirmation pour une commande gratuite non débitée.
      if (giftCardId) {
        const { data: redeemRaw, error: redeemError } = await admin.rpc(
          'redeem_gift_card_atomic',
          {
            p_card_id: giftCardId,
            p_order_id: order.id,
            p_amount: giftCardRedeemAmount,
            p_stripe_payment_intent: paymentPseudoId,
          },
        );
        const redeemResult = redeemRaw as RedeemGiftCardResult | null;

        if (redeemError || !redeemResult || redeemResult.success === false) {
          console.error('[POST /api/checkout/stripe] redeem_gift_card_atomic failed:', { redeemError, redeemResult });
          await admin.from('orders').update({
            status: 'payment_review',
            updated_at: new Date().toISOString(),
          }).eq('id', order.id);
          Sentry.captureMessage(
            `Gift card redeem failed for full-discount order ${order.orderNumber}`,
            {
              level: 'error',
              extra: {
                orderId: order.id,
                giftCardId,
                amount: giftCardRedeemAmount,
                reason: redeemResult?.success === false ? redeemResult.reason : 'rpc_error',
                rpcError: redeemError?.message,
              },
            },
          );
          return NextResponse.json(
            { error: 'Échec du débit de la carte cadeau. Notre équipe a été alertée et reviendra vers vous.' },
            { status: 503 },
          );
        }
      }

      await admin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentPseudoId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      await decrementStockForOrder(order.id);

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

      // Génération facture PDF (await — pour joindre le PDF à l'email).
      let invoicePdf: { buffer: Buffer; filename: string } | undefined;
      try {
        const invoice = await generateInvoicePdf({
          ...order,
          shippingMethod,
          shippingCarrier,
          shippingCountry,
          pickupPoint,
        });
        if (invoice.pdf) {
          invoicePdf = { buffer: invoice.pdf, filename: `Facture-${invoice.number}.pdf` };
        }
      } catch (err) {
        console.error('[POST /api/checkout/stripe] Invoice generation failed:', err);
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
          total: finalTotal,
          promoCode: promoValidatedCode ?? undefined,
          promoDiscount,
          giftCardCode: giftCardValidatedCode ?? undefined,
          giftCardAmount: giftCardRedeemAmount,
          shippingMethod,
          pickupPoint,
          invoicePdf,
        });
      } catch (emailErr) {
        console.error('[POST /api/checkout/stripe] email error:', emailErr);
      }

      // Admin notification — post-réponse via after() pour ne pas bloquer le
      // user, mais garde la lambda vivante (sinon Vercel suspend la fonction
      // et le fetch Brevo est tué → "fetch failed").
      after(async () => {
        try {
          await sendNewOrderAlertToAdmin({
            orderId: order.id,
            orderNumber: order.orderNumber,
            customer,
            items: verifiedItems.map((i) => ({
              productName: i.productName,
              size: i.size,
              quantity: i.quantity,
              price: i.price,
            })),
            subtotal,
            shipping,
            total: finalTotal,
            shippingMethod,
            pickupPoint,
            promoCode: promoValidatedCode ?? undefined,
            giftCardCode: giftCardValidatedCode ?? undefined,
          });
        } catch (err) {
          console.error('[POST /api/checkout/stripe] admin alert failed:', err);
        }
      });

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

    // --- Stripe Customer (dédup par email + adresse complète pour pré-remplissage) ---
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const stripeAddress: Stripe.AddressParam = {
      line1: customer.address,
      city: customer.city,
      postal_code: customer.postalCode,
      country: shippingCountry,
    };
    const customerData: Stripe.CustomerCreateParams = {
      email: customer.email,
      name: fullName,
      phone: customer.phone,
      address: stripeAddress,
      shipping: { name: fullName, phone: customer.phone, address: stripeAddress },
    };

    let stripeCustomerId: string | null = null;
    try {
      const existing = await getStripe().customers.list({ email: customer.email, limit: 1 });
      if (existing.data.length > 0) {
        const updated = await getStripe().customers.update(existing.data[0].id, customerData);
        stripeCustomerId = updated.id;
      } else {
        const created = await getStripe().customers.create(customerData);
        stripeCustomerId = created.id;
      }
    } catch (err) {
      console.error('[Stripe] Customer create/update failed, fallback to customer_email:', err);
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      ...(stripeCustomerId
        ? { customer: stripeCustomerId, customer_update: { shipping: 'auto', address: 'auto', name: 'auto' } }
        : { customer_email: customer.email }),
      // Pas de collecte d'adresse de livraison en Click & Collect (retrait boutique).
      // Ce spread REMPLACE l'ancien bloc shipping_address_collection inconditionnel :
      // ne pas réintroduire de version inconditionnelle après ce spread, sinon elle
      // écraserait l'omission C&C (dernière clé du littéral gagne).
      ...(shippingMethod !== 'click_collect' && {
        shipping_address_collection: {
          allowed_countries: VALID_COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
      }),
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
        // --- Snapshot complet du point (JSON, clés camelCase: postalCode, provider, hours…).
        // Sert à reconstruire l'affichage client. NE PAS lire pour le lookup webhook.
        pickupPoint: pickupPoint ? JSON.stringify(pickupPoint) : '',
        // --- Clés PLATES snake_case = lookup rapide côté webhook (re-vérification BD).
        // Distinctes du snapshot ci-dessus. Pour mondial_relay, pickup_provider
        // provient du snapshot client (non re-vérifié serveur, acceptable : MR ne
        // déclenche pas la garde C&C du webhook). Pour click_collect, ces valeurs
        // viennent du point reconstruit depuis la BD.
        pickup_point_id: requiresPickupPoint && pickupPoint ? pickupPoint.id : '',
        pickup_provider: requiresPickupPoint && pickupPoint ? pickupPoint.provider : '',
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
