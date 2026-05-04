import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateUniqueGiftCardCode } from '@/lib/gift-cards/code';
import { giftCardLimit, getClientIp, checkLimit } from '@/lib/security/ratelimit';

const GiftCardCheckoutSchema = z.object({
  amount: z.union([
    z.literal(25),
    z.literal(50),
    z.literal(100),
    z.literal(150),
  ]),
  purchaserEmail: z.string().email(),
  purchaserName: z.string().trim().max(120).optional(),
  recipientEmail: z.string().email(),
  recipientName: z.string().trim().max(120).optional(),
  message: z.string().max(500).optional(),
});

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';
}

export async function POST(req: NextRequest) {
  const limit = await checkLimit(giftCardLimit, getClientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe non configuré' },
      { status: 503 }
    );
  }

  let payload: z.infer<typeof GiftCardCheckoutSchema>;
  try {
    const body = await req.json();
    payload = GiftCardCheckoutSchema.parse(body);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Requête invalide', details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const {
    amount,
    purchaserEmail,
    purchaserName,
    recipientEmail,
    recipientName,
    message,
  } = payload;

  try {
    const admin = createAdminClient();

    // Génère un code unique
    const code = await generateUniqueGiftCardCode(admin);

    const baseUrl = getBaseUrl();
    const stripe = getStripe();

    // Tronque le message pour rester sous les 500 chars côté metadata Stripe
    const safeMessage = message ? message.slice(0, 450) : '';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Carte cadeau LOLETT ${amount}€`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      customer_email: purchaserEmail,
      metadata: {
        kind: 'gift_card',
        code,
        amount: String(amount),
        purchaserEmail,
        purchaserName: purchaserName || '',
        recipientEmail,
        recipientName: recipientName || '',
        message: safeMessage,
      },
      success_url: `${baseUrl}/cartes-cadeaux/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cartes-cadeaux`,
    });

    // INSERT row pending
    const { error: insertError } = await admin.from('gift_cards').insert({
      code,
      initial_amount: amount,
      balance: amount,
      purchaser_email: purchaserEmail,
      purchaser_name: purchaserName || null,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      message: message || null,
      stripe_session_id: session.id,
      status: 'pending',
    });

    if (insertError) {
      console.error('[gift-cards/checkout] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la carte cadeau' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[POST /api/gift-cards/checkout]', error);
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 });
  }
}
