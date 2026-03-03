# Transactional Emails Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add order-shipped, order-delivered, and abandoned-cart emails with CMS support and Vercel cron.

**Architecture:** 3 new HTML templates (same Luxe Whisper design), 3 sender functions, email triggers in admin order PATCH route, and a Vercel cron for abandoned carts. All templates editable via existing admin panel.

**Tech Stack:** Next.js API routes, Nodemailer (Brevo SMTP), Resend fallback, Supabase, Vercel Cron

---

### Task 1: Supabase migration — new email_settings rows + cart column

**Files:**
- Create: `supabase/migrations/XXXXXX_transactional_emails.sql`

**Step 1: Create the migration**

```sql
-- Insert new email_settings rows
INSERT INTO email_settings (template_key, label, from_name, from_email, subject_template, greeting, body_text, cta_text, cta_url, signoff)
VALUES
  ('order_shipped', 'Commande expédiée', 'LOLETT', 'contact@lolett.fr',
   'Votre commande {orderNumber} est en route',
   'Bonne nouvelle, {firstName} !',
   'Votre commande a été expédiée et arrivera sous 24 à 48h.',
   'Suivre ma livraison',
   'https://lolett.fr/compte',
   'Avec amour, LOLETT ♥'),
  ('order_delivered', 'Commande livrée', 'LOLETT', 'contact@lolett.fr',
   'Votre commande {orderNumber} est arrivée',
   '{firstName}, votre commande est arrivée !',
   'On espère que vos nouvelles pièces vous plaisent autant qu''à nous.',
   'Donner mon avis',
   'https://lolett.fr/compte',
   'Avec amour, LOLETT ♥'),
  ('cart_abandoned', 'Panier abandonné', 'LOLETT', 'contact@lolett.fr',
   'Tu as oublié quelque chose ?',
   'Hey {firstName} !',
   'Tes pièces t''attendent encore dans ton panier.',
   'Reprendre mon panier',
   'https://lolett.fr/panier',
   'À très vite, LOLETT ♥')
ON CONFLICT (template_key) DO NOTHING;

-- Add abandoned email tracking column
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS abandoned_email_sent_at timestamptz DEFAULT NULL;
```

**Step 2: Run migration**

Run: `cd /Users/trikilyes/Desktop/Lorett/lolett-app && npx supabase db push`

If supabase CLI not linked, run the SQL directly via Supabase Dashboard SQL Editor.

**Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add email_settings rows for shipped/delivered/abandoned + cart column"
```

---

### Task 2: Order Shipped email template + sender

**Files:**
- Create: `lib/email/templates/order-shipped-v3.ts`
- Create: `lib/email/order-shipped.ts`

**Step 1: Create the shipped template**

Create `lib/email/templates/order-shipped-v3.ts`. It follows the exact same Luxe Whisper structure as `order-confirmation-v3.ts` but with:
- Title badge: "Commande expédiée" (instead of "Commande confirmée")
- Default greeting: "Bonne nouvelle, {firstName} !"
- Body: "Votre commande a été expédiée"
- Items recap (same table layout)
- Tracking link section (if trackingNumber provided)
- Address block (same)
- CTA: "Suivre ma livraison"

Interface:
```typescript
interface ShippedEmailData {
  firstName: string;
  orderNumber: string;
  items: { productName: string; size: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  address: { firstName: string; lastName: string; address: string; postalCode: string; city: string; country: string };
  trackingNumber?: string;
}

interface EmailOverrides {
  greeting?: string;
  body_text?: string;
  cta_text?: string;
  cta_url?: string;
  signoff?: string;
}

export function renderOrderShippedV3(data: ShippedEmailData, overrides?: EmailOverrides): string
```

Copy the full HTML structure from `order-confirmation-v3.ts` and modify:
- The title badge text to "Commande expédiée"
- The default greeting
- The default body text
- Add a tracking section after the address block (only if `data.trackingNumber` is provided):
```html
<tr>
  <td style="padding: 0 8px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width: 3px; background: #C4956A; border-radius: 2px;"></td>
        <td style="padding-left: 18px;">
          <p style="margin: 0 0 6px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Suivi</p>
          <p style="margin: 0; font-size: 13px; color: #2C2420;">N° de suivi : ${data.trackingNumber}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

**Step 2: Create the sender**

Create `lib/email/order-shipped.ts`:

```typescript
import { sendHtmlEmail } from '@/lib/email-provider';
import { renderOrderShippedV3 } from './templates/order-shipped-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface ShippedEmailData {
  to: string;
  orderNumber: string;
  items: { productName: string; size: string; quantity: number; price: number }[];
  customer: { firstName: string; lastName: string; address: string; city: string; postalCode: string; country?: string };
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber?: string;
}

export async function sendOrderShipped(data: ShippedEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_shipped');
    } catch { /* DB unavailable */ }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      cta_text: settings.cta_text,
      cta_url: settings.cta_url,
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderShippedV3({
      firstName: data.customer.firstName,
      orderNumber: data.orderNumber,
      items: data.items,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      address: {
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        address: data.customer.address,
        postalCode: data.customer.postalCode,
        city: data.customer.city,
        country: data.customer.country || 'France',
      },
      trackingNumber: data.trackingNumber,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template?.replace('{orderNumber}', data.orderNumber)
      || `Votre commande ${data.orderNumber} est en route`;

    const result = await sendHtmlEmail({ from: `${fromName} <${fromEmail}>`, to: data.to, subject, html });
    if (result.success) {
      console.log(`[Email] Shipped email sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send shipped email: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send shipped email:', error);
  }
}
```

**Step 3: Verify build**

Run: `cd /Users/trikilyes/Desktop/Lorett/lolett-app && npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add lib/email/templates/order-shipped-v3.ts lib/email/order-shipped.ts
git commit -m "feat: add order-shipped email template and sender"
```

---

### Task 3: Order Delivered email template + sender

Same pattern as Task 2 but for delivered status.

**Files:**
- Create: `lib/email/templates/order-delivered-v3.ts`
- Create: `lib/email/order-delivered.ts`

**Step 1: Create the delivered template**

Create `lib/email/templates/order-delivered-v3.ts`. Same Luxe Whisper structure but:
- Title badge: "Commande livrée"
- Default greeting: "{firstName}, votre commande est arrivée !"
- Body: "On espère que vos nouvelles pièces vous plaisent."
- NO items recap (keep it short — the customer already knows what they ordered)
- NO address block
- CTA: "Donner mon avis" (link to account page)

Interface:
```typescript
interface DeliveredEmailData {
  firstName: string;
  orderNumber: string;
}

export function renderOrderDeliveredV3(data: DeliveredEmailData, overrides?: EmailOverrides): string
```

Simpler template: logo → title badge → greeting → body text → order number → golden line → CTA → signoff → footer.

**Step 2: Create the sender**

Create `lib/email/order-delivered.ts`:

```typescript
import { sendHtmlEmail } from '@/lib/email-provider';
import { renderOrderDeliveredV3 } from './templates/order-delivered-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface DeliveredEmailData {
  to: string;
  orderNumber: string;
  firstName: string;
}

export async function sendOrderDelivered(data: DeliveredEmailData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('order_delivered');
    } catch { /* DB unavailable */ }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      cta_text: settings.cta_text,
      cta_url: settings.cta_url,
      signoff: settings.signoff,
    } : undefined;

    const html = renderOrderDeliveredV3({
      firstName: data.firstName,
      orderNumber: data.orderNumber,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template?.replace('{orderNumber}', data.orderNumber)
      || `Votre commande ${data.orderNumber} est arrivée`;

    const result = await sendHtmlEmail({ from: `${fromName} <${fromEmail}>`, to: data.to, subject, html });
    if (result.success) {
      console.log(`[Email] Delivered email sent to ${data.to} for ${data.orderNumber}`);
    } else {
      console.error(`[Email] Failed to send delivered email: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send delivered email:', error);
  }
}
```

**Step 3: Verify build**

Run: `cd /Users/trikilyes/Desktop/Lorett/lolett-app && npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add lib/email/templates/order-delivered-v3.ts lib/email/order-delivered.ts
git commit -m "feat: add order-delivered email template and sender"
```

---

### Task 4: Hook emails into admin order status PATCH

**Files:**
- Modify: `app/api/admin/orders/[id]/route.ts`

**Step 1: Add email triggers to the PATCH handler**

After the successful status update (line 67 `const { data, error } = ...`), add email sending logic:

```typescript
import { sendOrderShipped } from '@/lib/email/order-shipped';
import { sendOrderDelivered } from '@/lib/email/order-delivered';

// After the successful update, inside the PATCH handler, after line 73:
// Send transactional emails on status change (fire-and-forget)
if (body.status === 'shipped' || body.status === 'delivered') {
  // Fetch order items + customer info for the email
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_name, size, quantity, price')
    .eq('order_id', id);

  const customer = data.customer as { firstName: string; lastName: string; email: string; address: string; city: string; postalCode: string; country?: string };

  if (body.status === 'shipped') {
    sendOrderShipped({
      to: customer.email,
      orderNumber: data.order_number,
      items: (orderItems || []).map((i: { product_name: string; size: string; quantity: number; price: number }) => ({
        productName: i.product_name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
      customer,
      subtotal: data.total - data.shipping,
      shipping: data.shipping,
      total: data.total,
      trackingNumber: body.trackingNumber || data.tracking_number,
    }).catch((err: Error) => console.error('[Admin] Shipped email error:', err));
  }

  if (body.status === 'delivered') {
    sendOrderDelivered({
      to: customer.email,
      orderNumber: data.order_number,
      firstName: customer.firstName,
    }).catch((err: Error) => console.error('[Admin] Delivered email error:', err));
  }
}
```

**Step 2: Verify build**

Run: `cd /Users/trikilyes/Desktop/Lorett/lolett-app && npx next build 2>&1 | tail -20`

**Step 3: Commit**

```bash
git add app/api/admin/orders/[id]/route.ts
git commit -m "feat: send shipped/delivered emails on admin status change"
```

---

### Task 5: Abandoned Cart email template + sender

**Files:**
- Create: `lib/email/templates/cart-abandoned-v3.ts`
- Create: `lib/email/cart-abandoned.ts`

**Step 1: Create the abandoned cart template**

Create `lib/email/templates/cart-abandoned-v3.ts`. Luxe Whisper style:
- Title badge: "Tu as oublié quelque chose"
- Default greeting: "Hey {firstName} !"
- Body: "Tes pièces t'attendent encore."
- Items preview (product names + sizes only, no prices — create urgency without being pushy)
- CTA: "Reprendre mon panier" → /panier

Interface:
```typescript
interface CartAbandonedEmailData {
  firstName: string;
  items: { productName: string; size: string }[];
}

export function renderCartAbandonedV3(data: CartAbandonedEmailData, overrides?: EmailOverrides): string
```

**Step 2: Create the sender**

Create `lib/email/cart-abandoned.ts`:

```typescript
import { sendHtmlEmail } from '@/lib/email-provider';
import { renderCartAbandonedV3 } from './templates/cart-abandoned-v3';
import { getEmailSettings } from '@/lib/cms/emails';

interface CartAbandonedData {
  to: string;
  firstName: string;
  items: { productName: string; size: string }[];
}

export async function sendCartAbandoned(data: CartAbandonedData) {
  try {
    let settings: Awaited<ReturnType<typeof getEmailSettings>> = null;
    try {
      settings = await getEmailSettings('cart_abandoned');
    } catch { /* DB unavailable */ }

    const overrides = settings ? {
      greeting: settings.greeting,
      body_text: settings.body_text,
      cta_text: settings.cta_text,
      cta_url: settings.cta_url,
      signoff: settings.signoff,
    } : undefined;

    const html = renderCartAbandonedV3({
      firstName: data.firstName,
      items: data.items,
    }, overrides);

    const fromName = settings?.from_name || 'LOLETT';
    const fromEmail = settings?.from_email || 'onboarding@resend.dev';
    const subject = settings?.subject_template || 'Tu as oublié quelque chose ?';

    const result = await sendHtmlEmail({ from: `${fromName} <${fromEmail}>`, to: data.to, subject, html });
    if (result.success) {
      console.log(`[Email] Abandoned cart email sent to ${data.to}`);
    } else {
      console.error(`[Email] Failed to send abandoned cart email: ${result.error}`);
    }
  } catch (error) {
    console.error('[Email] Failed to send abandoned cart email:', error);
  }
}
```

**Step 3: Verify build**

Run: `cd /Users/trikilyes/Desktop/Lorett/lolett-app && npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add lib/email/templates/cart-abandoned-v3.ts lib/email/cart-abandoned.ts
git commit -m "feat: add abandoned cart email template and sender"
```

---

### Task 6: Vercel Cron for abandoned carts

**Files:**
- Create: `app/api/cron/abandoned-carts/route.ts`
- Modify: `vercel.json`

**Step 1: Create the cron API route**

Create `app/api/cron/abandoned-carts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCartAbandoned } from '@/lib/email/cart-abandoned';

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Find users with cart items older than 24h, no abandoned email sent yet
  const { data: abandonedCarts, error } = await supabase
    .from('cart_items')
    .select('user_id, product_id, size, created_at')
    .is('abandoned_email_sent_at', null)
    .lt('created_at', twentyFourHoursAgo);

  if (error || !abandonedCarts?.length) {
    return NextResponse.json({ processed: 0 });
  }

  // Group by user_id
  const userCarts = new Map<string, typeof abandonedCarts>();
  for (const item of abandonedCarts) {
    const existing = userCarts.get(item.user_id) || [];
    existing.push(item);
    userCarts.set(item.user_id, existing);
  }

  // Check these users don't have a recent order (last 24h)
  const userIds = [...userCarts.keys()];
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('user_id')
    .in('user_id', userIds)
    .gte('created_at', twentyFourHoursAgo);

  const usersWithRecentOrders = new Set((recentOrders || []).map((o: { user_id: string }) => o.user_id));

  let sent = 0;
  for (const [userId, cartItems] of userCarts) {
    if (usersWithRecentOrders.has(userId)) continue;

    // Get user profile + email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();

    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const email = authUser?.user?.email;
    if (!email) continue;

    // Get product names
    const productIds = cartItems.map((i: { product_id: string }) => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productMap = new Map((products || []).map((p: { id: string; name: string }) => [p.id, p.name]));

    const items = cartItems.map((i: { product_id: string; size: string }) => ({
      productName: productMap.get(i.product_id) || 'Article',
      size: i.size,
    }));

    await sendCartAbandoned({
      to: email,
      firstName: profile?.first_name || 'toi',
      items,
    });

    // Mark as sent
    await supabase
      .from('cart_items')
      .update({ abandoned_email_sent_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('abandoned_email_sent_at', null);

    sent++;
  }

  console.log(`[Cron] Abandoned cart emails sent: ${sent}`);
  return NextResponse.json({ processed: sent });
}
```

**Step 2: Update vercel.json**

```json
{
  "framework": "nextjs",
  "crons": [
    {
      "path": "/api/cron/abandoned-carts",
      "schedule": "0 * * * *"
    }
  ]
}
```

Note: `CRON_SECRET` env var must be set in Vercel Dashboard. Vercel automatically sends it as `Authorization: Bearer <CRON_SECRET>`.

**Step 3: Verify build**

Run: `cd /Users/trikilyes/Desktop/Lorett/lolett-app && npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add app/api/cron/abandoned-carts/route.ts vercel.json
git commit -m "feat: add Vercel cron for abandoned cart emails (hourly)"
```
