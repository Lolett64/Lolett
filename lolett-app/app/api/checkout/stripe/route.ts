import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { SHIPPING } from '@/lib/constants';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe non configuré' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { items, customer, userId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items requis' }, { status: 400 });
    }

    // Server-side price verification
    const admin = createAdminClient();
    const productIds = items.map((i: { productId: string }) => i.productId);
    const { data: dbProducts, error: dbError } = await admin
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      return NextResponse.json({ error: 'Failed to verify prices' }, { status: 500 });
    }

    const priceMap = new Map(dbProducts.map((p: { id: string; name: string; price: number }) => [p.id, p]));

    const verifiedItems = items.map((item: { productId: string; productName: string; size: string; quantity: number }) => {
      const dbProduct = priceMap.get(item.productId);
      if (!dbProduct) throw new Error(`Product ${item.productId} not found`);
      return { ...item, productName: dbProduct.name, price: dbProduct.price };
    });

    const subtotal = verifiedItems.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.COST;
    const total = subtotal + shipping;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = verifiedItems.map(
      (item: { productName: string; price: number; quantity: number }) => ({
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

    const siteUrl = process.env.CHECKOUT_REDIRECT_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email,
      allow_promotion_codes: true,
      metadata: {
        // Store order data in metadata for the webhook (server-verified prices)
        customer: JSON.stringify(customer),
        items: JSON.stringify(
          verifiedItems.map((i: { productId: string; productName: string; size: string; quantity: number; price: number }) => ({
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
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[POST /api/checkout/stripe]', error);
    return NextResponse.json(
      { error: 'Erreur Stripe' },
      { status: 500 }
    );
  }
}
