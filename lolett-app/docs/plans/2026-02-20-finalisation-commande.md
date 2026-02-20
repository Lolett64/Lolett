# Finalisation Commande — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implémenter le flux complet de commande avec paiement en mode DEMO (simulation), création de commande en BDD, emails de confirmation via Resend, attribution de points fidélité, et page succès réelle.

**Architecture:** Mode DEMO par défaut — un bouton "Simuler le paiement" remplace Stripe/PayPal. Toute l'infrastructure (API routes, webhook endpoint, email templates) est prête pour brancher de vraies clés. Le flux : PaymentStep → API `/api/checkout` → créer Order en BDD + vider panier serveur + attribuer points fidélité + envoyer email Resend → redirect `/checkout/success?orderId=xxx` → fetch la vraie commande.

**Tech Stack:** Next.js 15 App Router, Supabase (admin client), Resend, TypeScript

---

### Task 1: API route POST `/api/checkout` — Créer la commande

**Files:**
- Create: `app/api/checkout/route.ts`
- Modify: `lib/adapters/supabase.ts` (ajouter `user_id` au create d'Order)

**Step 1: Modifier OrderRepository.create pour accepter user_id et paymentProvider**

Dans `lib/adapters/supabase.ts`, ajouter `userId?: string` et `paymentProvider?: string` au paramètre de `create()`, et les passer à l'insert.

```typescript
// Dans SupabaseOrderRepository.create, ajouter au paramètre :
userId?: string;
paymentProvider?: 'stripe' | 'paypal' | 'demo';

// Dans l'insert :
user_id: orderData.userId || null,
payment_provider: orderData.paymentProvider || 'demo',
```

**Step 2: Créer l'API route `/api/checkout`**

```typescript
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import type { CustomerInfo, Size } from '@/types';

interface CheckoutBody {
  items: {
    productId: string;
    productName: string;
    size: Size;
    quantity: number;
    price: number;
  }[];
  customer: CustomerInfo;
  total: number;
  shipping: number;
  userId?: string;
  paymentProvider?: 'stripe' | 'paypal' | 'demo';
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();

    // Validation basique
    if (!body.items?.length || !body.customer?.email || !body.total) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const orderRepo = new SupabaseOrderRepository();
    const order = await orderRepo.create({
      items: body.items,
      customer: body.customer,
      total: body.total,
      shipping: body.shipping,
      userId: body.userId,
      paymentProvider: body.paymentProvider || 'demo',
    });

    // Mettre le statut à "paid" (mode demo = paiement immédiat)
    const admin = createAdminClient();
    await admin.from('orders').update({ status: 'paid' }).eq('id', order.id);

    // Vider le panier serveur si user connecté
    if (body.userId) {
      await admin.from('cart_items').delete().eq('user_id', body.userId);
    }

    // Attribuer points fidélité (1 point par euro dépensé)
    if (body.userId) {
      const points = Math.floor(body.total);
      await admin.rpc('increment_loyalty_points', {
        p_user_id: body.userId,
        p_points: points,
      });
      // Fallback si la RPC n'existe pas : update direct
      // await admin.from('profiles')
      //   .update({ loyalty_points: supabase.sql`loyalty_points + ${points}` })
      //   .eq('id', body.userId);
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
```

**Step 3: Créer la migration pour la RPC `increment_loyalty_points`**

```sql
-- supabase/migrations/20250220000008_increment_loyalty_points.sql
CREATE OR REPLACE FUNCTION increment_loyalty_points(p_user_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET loyalty_points = COALESCE(loyalty_points, 0) + p_points,
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 4: Commit**

```bash
git add app/api/checkout/route.ts lib/adapters/supabase.ts supabase/migrations/20250220000008_increment_loyalty_points.sql
git commit -m "feat: add checkout API route with order creation, cart clearing, and loyalty points"
```

---

### Task 2: Mettre à jour `useCheckout` et `PaymentStep` — mode DEMO

**Files:**
- Modify: `features/checkout/hooks/useCheckout.ts`
- Modify: `features/checkout/components/PaymentStep.tsx`
- Modify: `features/checkout/components/CheckoutContent.tsx`

**Step 1: Refactorer `useCheckout.ts` pour appeler l'API**

Remplacer le `handleSubmit` simulé par un vrai appel à `/api/checkout` :

```typescript
const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setIsSubmitting(true);

  try {
    // Construire les items avec nom + prix depuis cartProducts
    const orderItems = cartProducts.map((cp) => ({
      productId: cp.productId,
      productName: cp.product.name,
      size: cp.size,
      quantity: cp.quantity,
      price: cp.product.price,
    }));

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: orderItems,
        customer: formData,
        total,
        shipping,
        userId: user?.id,
        paymentProvider: 'demo',
      }),
    });

    if (!res.ok) throw new Error('Checkout failed');

    const { orderId } = await res.json();
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  } catch (error) {
    console.error('Checkout error:', error);
    setIsSubmitting(false);
  }
};
```

Il faut aussi exposer `cartProducts` et `shipping` depuis le hook. Ajouter :

```typescript
const { cartProducts, subtotal, shipping, total } = useCartCalculation(items);
```

Et retourner `shipping` dans l'objet retourné.

**Step 2: Mettre à jour `PaymentStep.tsx` pour le mode DEMO**

Remplacer les champs de carte désactivés par un message clair "Mode démonstration" et un bouton "Simuler le paiement" :

```tsx
{method === 'card' && (
  <div className="ml-9 space-y-3 rounded-lg border border-[#c4b49c]/10 bg-[#faf9f7] p-4">
    <div className="flex items-center gap-2 text-sm text-[#8a7d6b]">
      <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      Mode démonstration
    </div>
    <p className="text-xs text-[#8a7d6b]">
      Le paiement par carte sera activé une fois les clés Stripe configurées.
      En attendant, vous pouvez simuler une commande complète.
    </p>
  </div>
)}

{method === 'paypal' && (
  <div className="ml-9 rounded-lg border border-[#c4b49c]/10 bg-[#faf9f7] p-4">
    <div className="flex items-center gap-2 text-sm text-[#8a7d6b]">
      <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      Mode démonstration
    </div>
    <p className="text-xs text-[#8a7d6b]">
      PayPal sera activé une fois le Client ID configuré.
    </p>
  </div>
)}
```

Le bouton reste le même, il appelle `onConfirm` qui déclenche `handleSubmit`.

**Step 3: Commit**

```bash
git add features/checkout/hooks/useCheckout.ts features/checkout/components/PaymentStep.tsx
git commit -m "feat: connect checkout to real API with demo payment mode"
```

---

### Task 3: Email de confirmation via Resend

**Files:**
- Create: `lib/email/order-confirmation.ts`
- Modify: `app/api/checkout/route.ts` (ajouter l'envoi d'email)

**Step 1: Créer le template et l'envoi d'email**

```typescript
// lib/email/order-confirmation.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  to: string;
  orderNumber: string;
  items: { productName: string; size: string; quantity: number; price: number }[];
  customer: { firstName: string; lastName: string; address: string; city: string; postalCode: string };
  subtotal: number;
  shipping: number;
  total: number;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe4">${item.productName}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:center">${item.size}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:right">${(item.price * item.quantity).toFixed(2)} €</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1510">
      <div style="text-align:center;padding:32px 0;border-bottom:2px solid #c4a44e">
        <h1 style="font-size:28px;color:#c4a44e;margin:0">LOLETT</h1>
      </div>

      <div style="padding:32px 24px">
        <h2 style="font-size:20px;margin:0 0 8px">Merci pour votre commande !</h2>
        <p style="color:#8a7d6b;margin:0 0 24px">Commande <strong>${data.orderNumber}</strong></p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
          <thead>
            <tr style="border-bottom:2px solid #c4a44e">
              <th style="text-align:left;padding:8px 0;font-size:12px;text-transform:uppercase;color:#8a7d6b">Article</th>
              <th style="text-align:center;padding:8px 0;font-size:12px;text-transform:uppercase;color:#8a7d6b">Taille</th>
              <th style="text-align:center;padding:8px 0;font-size:12px;text-transform:uppercase;color:#8a7d6b">Qté</th>
              <th style="text-align:right;padding:8px 0;font-size:12px;text-transform:uppercase;color:#8a7d6b">Prix</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align:right;margin:0 0 24px">
          <p style="margin:4px 0;color:#5a4d3e">Sous-total : ${data.subtotal.toFixed(2)} €</p>
          <p style="margin:4px 0;color:#5a4d3e">Livraison : ${data.shipping === 0 ? 'Offerte' : data.shipping.toFixed(2) + ' €'}</p>
          <p style="margin:8px 0 0;font-size:18px;font-weight:bold;color:#1a1510">Total : ${data.total.toFixed(2)} €</p>
        </div>

        <div style="background:#faf9f7;border-radius:12px;padding:16px;margin:0 0 24px">
          <p style="margin:0 0 4px;font-weight:bold;font-size:14px">Adresse de livraison</p>
          <p style="margin:0;color:#5a4d3e;font-size:14px">
            ${data.customer.firstName} ${data.customer.lastName}<br/>
            ${data.customer.address}<br/>
            ${data.customer.postalCode} ${data.customer.city}
          </p>
        </div>

        <p style="text-align:center;color:#8a7d6b;font-size:14px">
          À bientôt sur <strong style="color:#c4a44e">LOLETT</strong>
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'LOLETT <onboarding@resend.dev>',
      to: data.to,
      subject: `Confirmation de commande ${data.orderNumber}`,
      html,
    });
  } catch (error) {
    console.error('[sendOrderConfirmation]', error);
    // Ne pas bloquer la commande si l'email échoue
  }
}
```

**Step 2: Appeler l'envoi d'email dans l'API checkout**

Ajouter après la création de la commande dans `app/api/checkout/route.ts` :

```typescript
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';

// Après la création de l'order et le update du statut :
await sendOrderConfirmation({
  to: body.customer.email,
  orderNumber: order.orderNumber,
  items: body.items.map((i) => ({
    productName: i.productName,
    size: i.size,
    quantity: i.quantity,
    price: i.price,
  })),
  customer: body.customer,
  subtotal: body.total - body.shipping,
  shipping: body.shipping,
  total: body.total,
});
```

**Step 3: Vérifier que `resend` est installé**

```bash
cd lolett-app && npm ls resend
# Si pas installé : npm install resend
```

**Step 4: Commit**

```bash
git add lib/email/order-confirmation.ts app/api/checkout/route.ts
git commit -m "feat: add order confirmation email via Resend"
```

---

### Task 4: Page succès réelle — fetch la commande depuis la BDD

**Files:**
- Modify: `app/checkout/success/page.tsx`
- Create: `app/api/orders/[id]/route.ts`

**Step 1: Créer l'API route pour fetch une commande par ID**

```typescript
// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.findById(id);

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  return NextResponse.json(order);
}
```

**Step 2: Refaire la page succès pour afficher le vrai récap**

La page récupère `orderId` des search params, fetch `/api/orders/[id]`, et affiche le récap réel (articles, prix, adresse, numéro de commande).

Garder le ton actuel (félicitations, "Tu vas recevoir des compliments") mais ajouter le détail de la commande : liste des articles, totaux, adresse de livraison.

**Step 3: Commit**

```bash
git add app/api/orders/[id]/route.ts app/checkout/success/page.tsx
git commit -m "feat: real order success page with data from BDD"
```

---

### Task 5: Infrastructure Stripe + PayPal (prête mais inactive)

**Files:**
- Create: `app/api/checkout/stripe/route.ts`
- Create: `app/api/webhooks/stripe/route.ts`
- Create: `lib/payment/stripe.ts`
- Create: `lib/payment/config.ts`

**Step 1: Créer le fichier de config paiement**

```typescript
// lib/payment/config.ts
export const PAYMENT_CONFIG = {
  // Mode demo si pas de clés Stripe/PayPal configurées
  isStripeEnabled: !!process.env.STRIPE_SECRET_KEY,
  isPaypalEnabled: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  isDemoMode: !process.env.STRIPE_SECRET_KEY && !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
} as const;
```

**Step 2: Créer le endpoint Stripe Checkout (inactif sans clé)**

```typescript
// app/api/checkout/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PAYMENT_CONFIG } from '@/lib/payment/config';

export async function POST(req: NextRequest) {
  if (!PAYMENT_CONFIG.isStripeEnabled) {
    return NextResponse.json(
      { error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans .env.local' },
      { status: 503 }
    );
  }

  // Quand les clés seront configurées :
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return NextResponse.json({ url: session.url });

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
```

**Step 3: Créer le webhook Stripe (prêt)**

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Quand Stripe sera configuré :
  // 1. Vérifier la signature du webhook (STRIPE_WEBHOOK_SECRET)
  // 2. Écouter checkout.session.completed
  // 3. Créer l'Order en BDD
  // 4. Vider le panier
  // 5. Attribuer les points fidélité
  // 6. Envoyer l'email de confirmation

  return NextResponse.json({ received: true });
}
```

**Step 4: Mettre à jour PaymentStep pour basculer auto entre demo/réel**

Ajouter un prop `demoMode` à `PaymentStep`. Si `false`, afficher les vrais champs Stripe Elements ou le bouton PayPal.

**Step 5: Commit**

```bash
git add lib/payment/config.ts app/api/checkout/stripe/route.ts app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe/PayPal infrastructure (inactive without keys)"
```

---

### Task 6: Ajout des variables d'environnement et documentation

**Files:**
- Modify: `.env.local` (ajouter les placeholders Stripe/PayPal)

**Step 1: Ajouter les variables placeholder**

```env
# Paiement — Stripe (laisser vide = mode demo)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Paiement — PayPal (laisser vide = mode demo)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
```

**Step 2: Commit**

```bash
git commit -m "docs: add payment env placeholders"
```

---

## Résumé de l'architecture finale

```
User clique "Confirmer et payer"
  ↓
useCheckout.handleSubmit()
  ↓
POST /api/checkout
  ├── Créer Order en BDD (status: paid)
  ├── Vider cart_items serveur (si user connecté)
  ├── Incrémenter loyalty_points (si user connecté)
  └── Envoyer email Resend
  ↓
Redirect /checkout/success?orderId=xxx
  ↓
GET /api/orders/[id]
  ↓
Afficher le récap réel
```

**Quand le client fournira ses clés Stripe :**
1. Ajouter les clés dans `.env.local`
2. `PaymentStep` détecte automatiquement que Stripe est actif
3. Le bouton redirige vers Stripe Checkout (hosted page)
4. Le webhook gère le retour de paiement
