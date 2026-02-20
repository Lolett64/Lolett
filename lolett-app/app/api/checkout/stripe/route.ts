import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe non configuré' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { items, customer, total, shipping, userId } = body;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      customer_email: customer.email,
      metadata: {
        // Store order data in metadata for the webhook
        customer: JSON.stringify(customer),
        items: JSON.stringify(
          items.map((i: { productId: string; productName: string; size: string; quantity: number; price: number }) => ({
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
