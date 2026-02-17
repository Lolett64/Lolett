# Document D — Spécification paiements (Stripe + PayPal)

---

## Objectif du document

Spécifier le flux de paiement complet : création de session, capture, webhooks, statuts commande, idempotence, gestion d'erreurs et sécurité.

## Contenu

Architecture technique des paiements Stripe Checkout et PayPal, diagrammes de flux, routes API, webhooks, modèle de commande.

## Hypothèses

- Stripe Checkout (hosted) — pas d'Elements custom en MVP.
- PayPal Checkout SDK (bouton standard + API serveur).
- Les prix sont **toujours recalculés côté serveur** à partir des IDs produit.
- Le stock est vérifié côté serveur avant création de la session de paiement.

## Points à valider

- Voir section "Questions ouvertes" en fin de document.

---

## 1. Modèle de commande & statuts

### Cycle de vie

```
                    ┌─────────────┐
                    │   pending    │  Commande créée, paiement en cours
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌────────────┐ ┌─────────┐ ┌───────────┐
       │  cancelled  │ │  paid   │ │  expired   │
       │ (user abort)│ │(webhook)│ │(timeout)   │
       └────────────┘ └────┬────┘ └───────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  fulfilled   │  Expédiée (mise à jour manuelle)
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  refunded    │  Remboursée (si applicable)
                    └─────────────┘
```

### Statuts

| Statut | Déclencheur | Description |
|---|---|---|
| `pending` | Création côté serveur | Commande créée, en attente de paiement |
| `paid` | Webhook Stripe / Capture PayPal | Paiement confirmé. Stock décrémenté, email envoyé |
| `cancelled` | Annulation utilisateur / Expiration session | Paiement jamais complété |
| `fulfilled` | Action admin manuelle | Commande expédiée |
| `refunded` | Action admin (Stripe dashboard ou API) | Commande remboursée |
| `expired` | Session Stripe expirée (30 min) / Timeout PayPal | Nettoyage automatique |

### Type mis à jour

```typescript
// types/index.ts — modifier le type Order
export interface Order {
  id: string;
  items: OrderItem[];
  customer: CustomerInfo;
  total: number;
  shipping: number;
  status: 'pending' | 'paid' | 'cancelled' | 'fulfilled' | 'refunded' | 'expired';
  paymentProvider: 'stripe' | 'paypal';
  paymentId: string;          // Stripe session_id ou PayPal order_id
  idempotencyKey: string;     // Pour éviter les doublons
  createdAt: string;
  updatedAt: string;
}
```

---

## 2. Flux Stripe Checkout

### Diagramme

```
Client (Browser)          Serveur (Next.js API)          Stripe
     │                           │                         │
     │  1. POST /api/checkout/   │                         │
     │     stripe/session         │                         │
     │  {items, customer}  ───►  │                         │
     │                           │  2. Valider stock        │
     │                           │  3. Recalculer prix      │
     │                           │  4. Créer commande       │
     │                           │     (status: pending)    │
     │                           │                         │
     │                           │  5. stripe.checkout.     │
     │                           │     sessions.create() ──►│
     │                           │                         │
     │                           │  ◄── 6. session {id, url}│
     │                           │                         │
     │  ◄── 7. {sessionUrl}     │                         │
     │                           │                         │
     │  8. redirect(sessionUrl)  │                         │
     │  ──────────────────────────────────────────────────►│
     │                           │                         │
     │                           │  ◄── 9. webhook         │
     │                           │  checkout.session.       │
     │                           │  completed               │
     │                           │                         │
     │                           │  10. Vérifier signature  │
     │                           │  11. Vérifier idempotence│
     │                           │  12. Commande → paid     │
     │                           │  13. Décrémenter stock   │
     │                           │  14. Envoyer email       │
     │                           │                         │
     │                           │  ──► 15. return 200     │
     │                           │                         │
     │  ◄── 16. redirect         │                         │
     │  /checkout/success?       │                         │
     │  session_id=xxx           │                         │
     │                           │                         │
     │  17. GET /api/checkout/   │                         │
     │      status?session_id=   │                         │
     │  ──────────────────────►  │                         │
     │                           │  18. Fetch commande     │
     │  ◄── 19. {order}         │                         │
```

### Routes API

#### `POST /api/checkout/stripe/session`

**Request body :**

```typescript
interface CreateStripeSessionRequest {
  items: {
    productId: string;
    size: Size;
    quantity: number;
  }[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
}
```

**Logique serveur :**

1. **Valider les données** : items non vide, customer complet, email valide, code postal FR (5 chiffres).
2. **Récupérer les produits** depuis la BDD par IDs.
3. **Vérifier le stock** : chaque item a un stock >= quantité demandée. Si non → erreur 400 avec le produit en rupture.
4. **Calculer les totaux** côté serveur (ne jamais utiliser les prix du client) :
   - Sous-total = somme (prix unitaire * quantité)
   - Livraison = sous-total >= 100 ? 0 : 5.90
   - Total = sous-total + livraison
5. **Créer la commande** en BDD avec statut `pending`.
6. **Créer la session Stripe Checkout** :

```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'payment',
  customer_email: customer.email,
  line_items: items.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: product.name,
        images: [product.images[0]],
      },
      unit_amount: Math.round(product.price * 100), // Stripe = centimes
    },
    quantity: item.quantity,
  })),
  // Ajouter la livraison si applicable
  ...(shippingCost > 0 && {
    shipping_options: [{
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount: Math.round(shippingCost * 100), currency: 'eur' },
        display_name: 'Livraison standard France',
      },
    }],
  }),
  metadata: {
    orderId: order.id,
  },
  success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/panier`,
});
```

7. **Retourner** `{ sessionUrl: session.url }` au client.

**Response :** `200 { sessionUrl: string }` ou `400 { error: string, details?: object }`

---

#### `POST /api/webhooks/stripe`

**Logique serveur :**

```typescript
// 1. Vérifier la signature
const event = stripe.webhooks.constructEvent(
  body,               // raw body (pas de JSON.parse)
  sig,                // header stripe-signature
  process.env.STRIPE_WEBHOOK_SECRET
);

// 2. Traiter l'événement
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const orderId = session.metadata.orderId;

  // 3. Idempotence : vérifier si déjà traité
  //    Clé = event.id ou session.id
  const existingOrder = await orderRepo.findById(orderId);
  if (existingOrder.status !== 'pending') {
    return Response.json({ received: true }); // Déjà traité
  }

  // 4. Vérifier que le paiement est bien 'paid'
  if (session.payment_status !== 'paid') {
    return Response.json({ received: true }); // Pas encore payé
  }

  // 5. Mettre à jour la commande
  await orderRepo.updateStatus(orderId, 'paid');

  // 6. Décrémenter le stock
  for (const item of existingOrder.items) {
    await productRepo.decrementStock(item.productId, item.quantity);
  }

  // 7. Envoyer email de confirmation
  await sendConfirmationEmail(existingOrder);
}

// 8. Retourner 200
return Response.json({ received: true });
```

**Points critiques :**
- Le body doit être lu en **raw** (pas de middleware JSON). Configurer `export const config = { api: { bodyParser: false } }` (ou équivalent App Router).
- **Idempotence** : si la commande n'est plus `pending`, ne rien faire.
- **Log** tous les événements webhook pour debugging.

---

#### `GET /api/checkout/status?session_id=xxx`

Utilisée par la page `/checkout/success` pour afficher le récap.

**Logique :**
1. Récupérer la session Stripe par `session_id`.
2. Extraire `orderId` des metadata.
3. Retourner la commande depuis la BDD.

**Response :** `200 { order: Order }` ou `404 { error: "Commande non trouvée" }`

---

## 3. Flux PayPal Checkout

### Diagramme

```
Client (Browser)          Serveur (Next.js API)          PayPal
     │                           │                         │
     │  1. Clic bouton PayPal    │                         │
     │  (SDK PayPal côté client) │                         │
     │                           │                         │
     │  2. POST /api/checkout/   │                         │
     │     paypal/order           │                         │
     │  {items, customer}  ───►  │                         │
     │                           │  3. Valider stock        │
     │                           │  4. Recalculer prix      │
     │                           │  5. Créer commande       │
     │                           │     (status: pending)    │
     │                           │                         │
     │                           │  6. POST /v2/checkout/   │
     │                           │     orders ─────────────►│
     │                           │                         │
     │                           │  ◄── 7. {id, status}    │
     │                           │                         │
     │  ◄── 8. {paypalOrderId}  │                         │
     │                           │                         │
     │  9. SDK PayPal:           │                         │
     │     approve popup   ──────────────────────────────►│
     │                           │                         │
     │  ◄── 10. onApprove       │                         │
     │  (paypalOrderId)          │                         │
     │                           │                         │
     │  11. POST /api/checkout/  │                         │
     │      paypal/capture       │                         │
     │  {paypalOrderId}   ───►   │                         │
     │                           │  12. POST /v2/checkout/  │
     │                           │      orders/{id}/capture│
     │                           │  ─────────────────────► │
     │                           │                         │
     │                           │  ◄── 13. capture result │
     │                           │                         │
     │                           │  14. Vérifier COMPLETED  │
     │                           │  15. Idempotence check   │
     │                           │  16. Commande → paid     │
     │                           │  17. Décrémenter stock   │
     │                           │  18. Envoyer email       │
     │                           │                         │
     │  ◄── 19. {order}         │                         │
     │                           │                         │
     │  20. redirect /checkout/  │                         │
     │      success              │                         │
```

### Routes API

#### `POST /api/checkout/paypal/order`

**Request body :** identique à Stripe (items + customer).

**Logique serveur :**

1. Valider données, vérifier stock, recalculer prix (identique à Stripe).
2. Créer la commande en BDD (status: `pending`, paymentProvider: `paypal`).
3. Appeler l'API PayPal :

```typescript
const paypalOrder = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: order.id,
      amount: {
        currency_code: 'EUR',
        value: total.toFixed(2),
        breakdown: {
          item_total: { currency_code: 'EUR', value: subtotal.toFixed(2) },
          shipping: { currency_code: 'EUR', value: shippingCost.toFixed(2) },
        },
      },
      items: items.map(item => ({
        name: product.name,
        unit_amount: { currency_code: 'EUR', value: product.price.toFixed(2) },
        quantity: String(item.quantity),
      })),
    }],
  }),
});
```

4. Retourner `{ paypalOrderId: paypalOrder.id }` au client.

---

#### `POST /api/checkout/paypal/capture`

**Request body :** `{ paypalOrderId: string }`

**Logique serveur :**

1. Capturer le paiement :

```typescript
const capture = await fetch(
  `${PAYPAL_API_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);
```

2. Vérifier que `capture.status === 'COMPLETED'`.
3. **Idempotence** : clé = `paypalOrderId` + `captureId`. Si commande déjà `paid`, retourner la commande existante.
4. Si COMPLETED : commande → `paid`, décrémenter stock, envoyer email.
5. Si non COMPLETED : commande reste `pending`, retourner erreur au client.

**Response :** `200 { order: Order }` ou `400 { error: string }`

---

## 4. Intégration côté client

### Stripe (bouton checkout)

```typescript
// Dans le composant Checkout
async function handleStripeCheckout() {
  setLoading(true);
  try {
    const res = await fetch('/api/checkout/stripe/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems, customer: formData }),
    });

    if (!res.ok) {
      const error = await res.json();
      // Afficher l'erreur (stock insuffisant, etc.)
      return;
    }

    const { sessionUrl } = await res.json();
    window.location.href = sessionUrl; // Redirect vers Stripe
  } catch (err) {
    // Erreur réseau
  } finally {
    setLoading(false);
  }
}
```

### PayPal (SDK bouton)

```typescript
// Charger le SDK PayPal
// <Script src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`} />

// Bouton PayPal
<PayPalButtons
  createOrder={async () => {
    const res = await fetch('/api/checkout/paypal/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems, customer: formData }),
    });
    const { paypalOrderId } = await res.json();
    return paypalOrderId;
  }}
  onApprove={async (data) => {
    const res = await fetch('/api/checkout/paypal/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paypalOrderId: data.orderID }),
    });
    if (res.ok) {
      router.push('/checkout/success?provider=paypal&order_id=...');
    }
  }}
  onCancel={() => {
    // Retour au panier ou message
  }}
  onError={(err) => {
    // Afficher erreur
  }}
/>
```

---

## 5. Sécurité

| Règle | Détail |
|---|---|
| Clés secrètes | `STRIPE_SECRET_KEY` et `PAYPAL_CLIENT_SECRET` en variables d'environnement serveur uniquement |
| Clés publiques | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` et `NEXT_PUBLIC_PAYPAL_CLIENT_ID` côté client |
| Prix serveur | Les totaux sont **toujours** recalculés côté serveur à partir des IDs produit |
| Signature webhook | Vérifier avec `stripe.webhooks.constructEvent()` — rejeter si signature invalide |
| Raw body | Le webhook Stripe nécessite le body brut (pas de JSON.parse middleware) |
| HTTPS | Toutes les routes API en HTTPS (assuré par Vercel) |
| Rate limiting | Limiter les appels aux routes `/api/checkout/*` (ex: 10/min par IP) |
| Validation input | Tous les champs client validés côté serveur (email, code postal FR, quantités > 0) |

---

## 6. Gestion d'erreurs

| Erreur | Côté | Comportement |
|---|---|---|
| Stock insuffisant | Serveur (avant session) | 400 + message "Produit X en rupture" → client affiche l'erreur |
| Carte refusée | Stripe (hosted page) | Stripe affiche l'erreur, l'utilisateur peut réessayer |
| 3DS échoué | Stripe | Retour au checkout avec message |
| Session expirée (Stripe) | Stripe (30 min) | Commande reste `pending` → nettoyage par cron ou TTL |
| Capture PayPal échouée | Serveur | 400 + message → client affiche "Paiement échoué" |
| Webhook signature invalide | Serveur | 400, commande non modifiée, log l'erreur |
| Webhook doublon (idempotence) | Serveur | 200 (déjà traité), aucune action |
| Email échoué | Serveur | Log l'erreur, commande reste `paid` (email best-effort) |
| Erreur réseau client | Client | Message "Erreur de connexion, réessayer" |

---

## 7. Fichiers à créer / modifier

### Nouvelles routes API

| Fichier | Rôle |
|---|---|
| `app/api/checkout/stripe/session/route.ts` | Créer session Stripe Checkout |
| `app/api/webhooks/stripe/route.ts` | Recevoir webhooks Stripe |
| `app/api/checkout/paypal/order/route.ts` | Créer commande PayPal |
| `app/api/checkout/paypal/capture/route.ts` | Capturer paiement PayPal |
| `app/api/checkout/status/route.ts` | Statut commande (page confirmation) |

### Librairies à ajouter

| Package | Usage |
|---|---|
| `stripe` | SDK Stripe Node.js (côté serveur) |
| `@paypal/react-paypal-js` | SDK PayPal React (bouton côté client) |

### Fichiers à modifier

| Fichier | Modification |
|---|---|
| `types/index.ts` | Ajouter statuts `cancelled`, `fulfilled`, `refunded`, `expired` + champs `paymentProvider`, `paymentId`, `idempotencyKey`, `updatedAt` |
| `lib/adapters/types.ts` | Ajouter `updateStatus()`, `findByPaymentId()` à `OrderRepository` |
| `features/checkout/` | Connecter aux vraies routes API |
| `app/checkout/success/page.tsx` | Fetch commande via `/api/checkout/status` |
| `.env.local` | Ajouter toutes les variables Stripe + PayPal |

---

## 8. Variables d'environnement

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...              # Serveur uniquement
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Client
STRIPE_WEBHOOK_SECRET=whsec_...            # Serveur uniquement

# PayPal
PAYPAL_CLIENT_SECRET=...                   # Serveur uniquement
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...           # Client
PAYPAL_API_URL=https://api-m.sandbox.paypal.com  # Sandbox (test)
# PAYPAL_API_URL=https://api-m.paypal.com        # Production

# Site
NEXT_PUBLIC_SITE_URL=https://lolett.fr
```

---

## 9. Tests manuels (cartes test)

### Stripe

| Carte | Comportement |
|---|---|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0027 6000 3184` | 3D Secure requis (réussi) |
| `4000 0084 0000 1629` | 3D Secure échoué |
| `4000 0000 0000 0002` | Carte refusée |
| `4000 0000 0000 9995` | Fonds insuffisants |

### PayPal

- Utiliser les comptes sandbox créés dans le PayPal Developer Dashboard.

### Webhook local

```bash
# Installer Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Rejouer un événement
stripe events resend evt_xxx
```

---

## Questions ouvertes

| # | Question | Impact |
|---|---|---|
| 1 | **Nettoyage commandes `pending`** : cron job ou TTL en BDD ? Après combien de temps ? (suggestion : 1h) | Architecture |
| 2 | **Remboursements** : gérés via Stripe Dashboard ou via une interface admin ? | EPIC J |
| 3 | **Apple Pay** : nécessite un fichier de vérification de domaine sur Stripe. Domaine final requis. | Déploiement |
| 4 | **Webhooks PayPal IPN** : à configurer en complément de la capture synchrone ? | Robustesse |
| 5 | **Email transactionnel** : Resend, SendGrid, ou Stripe Receipts natifs ? | H2 |

---

*Document D — Spécification paiements v1.0 — Généré le 17/02/2026*
