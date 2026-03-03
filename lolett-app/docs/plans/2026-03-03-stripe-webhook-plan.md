# Stripe Webhook Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Stripe webhook endpoint so orders are created server-side even if the client never returns after payment.

**Architecture:** Single new API route `POST /api/webhook/stripe` receives Stripe events, verifies signature, and creates orders idempotently. Shared order-fulfillment logic extracted from existing `/api/checkout/stripe/session` into a reusable helper.

**Tech Stack:** Next.js API routes, Stripe SDK, Supabase admin client

---

### Task 1: Extract shared order-fulfillment helper

The order creation logic (create order, mark paid, clear cart, loyalty points, email) is duplicated in `/api/checkout/stripe/session/route.ts` and `/api/checkout/route.ts`. Extract it so the webhook can reuse it.

**Files:**
- Create: `lib/checkout/fulfill-order.ts`
- Modify: `app/api/checkout/stripe/session/route.ts`

**Step 1: Create the helper**

Create `lib/checkout/fulfill-order.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';

interface FulfillOrderParams {
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  total: number;
  shipping: number;
  userId?: string;
  paymentProvider: string;
  paymentId: string;
}

/**
 * Creates an order from a paid session. Idempotent — skips if order already exists for this paymentId.
 * Returns the orderId.
 */
export async function fulfillOrder(params: FulfillOrderParams): Promise<string> {
  const { items, customer, total, shipping, userId, paymentProvider, paymentId } = params;
  const admin = createAdminClient();

  // Idempotency check
  const { data: existing } = await admin
    .from('orders')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existing) {
    console.log(`[fulfillOrder] Order already exists for payment ${paymentId}`);
    return existing.id;
  }

  // Create order
  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.create({
    items,
    customer,
    total,
    shipping,
    userId,
    paymentProvider,
  });

  // Mark as paid
  await admin
    .from('orders')
    .update({
      status: 'paid',
      payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  // Clear cart
  if (userId) {
    await admin.from('cart_items').delete().eq('user_id', userId);
  }

  // Loyalty points
  if (userId) {
    const points = Math.floor(total);
    if (points > 0) {
      await admin.rpc('increment_loyalty_points', {
        p_user_id: userId,
        p_points: points,
      });
    }
  }

  // Confirmation email (fire-and-forget)
  sendOrderConfirmation({
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
  }).catch((err) => console.error('[fulfillOrder] Email error:', err));

  console.log(`[fulfillOrder] Order ${order.orderNumber} created`);
  return order.id;
}
```

**Step 2: Refactor session route to use helper**

Replace lines 41-106 in `app/api/checkout/stripe/session/route.ts` with:

```typescript
import { fulfillOrder } from '@/lib/checkout/fulfill-order';

// ... inside the GET handler, after the existing order check:
const orderId = await fulfillOrder({
  items: JSON.parse(metadata.items),
  customer: JSON.parse(metadata.customer),
  total: parseFloat(metadata.total || '0'),
  shipping: parseFloat(metadata.shipping || '0'),
  userId: metadata.userId || undefined,
  paymentProvider: 'stripe',
  paymentId: paymentIntent,
});

return NextResponse.json({ orderId, status: 'paid' });
```

**Step 3: Verify the app still builds**

Run: `cd lolett-app && npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add lib/checkout/fulfill-order.ts app/api/checkout/stripe/session/route.ts
git commit -m "refactor: extract fulfillOrder helper from stripe session route"
```

---

### Task 2: Create the webhook route

**Files:**
- Create: `app/api/webhook/stripe/route.ts`

**Step 1: Create the webhook handler**

Create `app/api/webhook/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { fulfillOrder } from '@/lib/checkout/fulfill-order';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== 'paid') {
      console.log('[webhook] Session not paid yet, skipping');
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata;
    if (!metadata?.items || !metadata?.customer) {
      console.error('[webhook] Missing metadata on session', session.id);
      return NextResponse.json({ received: true });
    }

    try {
      const paymentIntent = session.payment_intent as string;
      await fulfillOrder({
        items: JSON.parse(metadata.items),
        customer: JSON.parse(metadata.customer),
        total: parseFloat(metadata.total || '0'),
        shipping: parseFloat(metadata.shipping || '0'),
        userId: metadata.userId || undefined,
        paymentProvider: 'stripe',
        paymentId: paymentIntent,
      });
    } catch (err) {
      console.error('[webhook] Failed to fulfill order:', err);
      return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
```

**Step 2: Verify build**

Run: `cd lolett-app && npx next build 2>&1 | tail -20`

**Step 3: Commit**

```bash
git add app/api/webhook/stripe/route.ts
git commit -m "feat: add Stripe webhook endpoint for order fulfillment"
```

---

### Task 3: Setup Stripe webhook secret

**Step 1: Install Stripe CLI (if not installed)**

Run: `brew list stripe 2>/dev/null || brew install stripe`

**Step 2: Login to Stripe CLI**

Run: `stripe login`

**Step 3: Get webhook secret for local testing**

Run: `stripe listen --forward-to localhost:3000/api/webhook/stripe`

This prints a webhook signing secret (`whsec_...`). Copy it.

**Step 4: Add to .env.local**

Add the `STRIPE_WEBHOOK_SECRET=whsec_...` line to `.env.local`.

**Step 5: Commit note** — Do NOT commit `.env.local`. Just note the secret needs to be set in Vercel env vars for production.

---

### Task 4: Test the full flow

**Step 1: Start dev server + Stripe listener in parallel**

Terminal 1: `cd lolett-app && npm run dev`
Terminal 2: `stripe listen --forward-to localhost:3000/api/webhook/stripe`

**Step 2: Test checkout**

1. Add items to cart on localhost:3000
2. Go to /checkout, fill shipping form
3. Select card payment, click "Payer"
4. Use Stripe test card: `4242 4242 4242 4242`, any future date, any CVC
5. Verify:
   - Webhook terminal shows `checkout.session.completed` received
   - Order created in Supabase `orders` table
   - Redirected to success page with order recap

**Step 3: Test idempotency**

Both webhook AND session route may try to create the order. Verify only one order is created (check `orders` table — should have exactly 1 row for the payment).
