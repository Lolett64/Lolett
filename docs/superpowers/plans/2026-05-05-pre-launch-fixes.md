# Pre-launch Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fixer 7 issues bloquantes (sécurité, légal, UX) + 1 bonus avant l'ouverture publique de Lolett le 2026-05-06.

**Architecture:** Fixes ciblés sur fichiers existants — pas de nouveau service ni de nouvelle abstraction. Pour le bug commande guest, on étend la route `/api/orders/[id]` pour accepter un mode "guest validé par session_id Stripe" (validation côté serveur via Stripe API). Pour l'email perdu, on wrap dans `after()` Next.js. Pour les XSS, on extrait une fonction `escapeHtml`. Pour les pages légales, mises à jour de texte simples.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase, Stripe SDK, vitest.

**Spec:** `docs/superpowers/specs/2026-05-05-pre-launch-fixes-design.md`

---

## File Structure

**Files créés** :
- `lolett-app/lib/utils/escape-html.ts` — utility shared (XSS fix #5 + futur)
- `lolett-app/app/politique-cookies/page.tsx` — page légale CNIL (#7)

**Files modifiés** :
- `lolett-app/app/api/orders/[id]/route.ts` (#2 — auth dual-mode)
- `lolett-app/components/checkout/success/useOrderLoader.ts` (#2 — pass session_id)
- `lolett-app/lib/checkout/fulfill-order.ts` (#3 — `after()`)
- `lolett-app/app/auth/callback/route.ts` (#4 — bonus open redirect)
- `lolett-app/lib/email-templates/contact-notification.tsx` (#5 — escape HTML)
- `lolett-app/lib/email/templates/order-confirmation-v3.ts` (#6 — liens cassés)
- `lolett-app/lib/email/templates/order-shipped-v3.ts` (#6 — liens cassés)
- `lolett-app/lib/email/templates/order-delivered-v3.ts` (#6 — liens cassés)
- `lolett-app/lib/email/templates/order-cancelled-v3.ts` (#6 — liens cassés)
- `lolett-app/lib/email/templates/order-refunded-v3.ts` (#6 — liens cassés)
- `lolett-app/lib/email/templates/welcome-newsletter-v3.ts` (#6 — fallback texte désabo)
- `lolett-app/lib/email/templates/launch-invitation-v3.ts` (#6 — fallback texte désabo, à vérifier)
- `lolett-app/components/layout/Footer.tsx` (#7 — ajouter lien politique-cookies)
- `lolett-app/app/mentions-legales/page.tsx` (#8 — email + date)
- `lolett-app/app/confidentialite/page.tsx` (#8 — email + provider + date)
- `lolett-app/app/layout.tsx` (#9 — OG image)

**Tests créés** :
- `lolett-app/__tests__/lib/utils/escape-html.test.ts` (#5)
- `lolett-app/__tests__/app/api/orders/[id]/guest-mode.test.ts` (#2 — si possible avec mock Stripe)

---

## Task 1: Setup branche + env var + sanity check

- [ ] **Step 1.1: Créer branche feature**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett
git checkout main
git pull origin main
git checkout -b feat/pre-launch-fixes
```

- [ ] **Step 1.2: Sanity check tsc + tests baseline**

```bash
cd lolett-app
pnpm tsc --noEmit
pnpm test
```

Expected: 0 erreurs tsc, tous les tests passent. Si échec → STOP, ne pas commencer le travail sur du code cassé.

- [ ] **Step 1.3: Action manuelle Lyes — env var Vercel**

Lyes doit ajouter dans **Vercel Settings → Environment Variables** :

```
NEXT_PUBLIC_SITE_URL = https://lolettshop.com
```

Cocher : **Production** + **Preview** + **Development**.

Sans ça : les liens "Mentions légales" dans les emails seront cassés en preview (pointeront vers preview URL), mais OK en prod.

- [ ] **Step 1.4: Pull les env vars Vercel en local**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
vercel env pull .env.local
```

Expected: `NEXT_PUBLIC_SITE_URL` apparaît dans `.env.local`.

---

## Task 2: #5 — XSS escape helper (TDD)

**Files:**
- Create: `lolett-app/lib/utils/escape-html.ts`
- Test: `lolett-app/__tests__/lib/utils/escape-html.test.ts`

- [ ] **Step 2.1: Écrire le test d'abord**

Créer `lolett-app/__tests__/lib/utils/escape-html.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { escapeHtml } from '@/lib/utils/escape-html';

describe('escapeHtml', () => {
  it('escapes < and > to entities', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
  });

  it('escapes & to &amp; first (so existing entities are not double-escaped)', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('escapes double and single quotes', () => {
    expect(escapeHtml(`"hello" 'world'`)).toBe('&quot;hello&quot; &#39;world&#39;');
  });

  it('preserves plain text unchanged', () => {
    expect(escapeHtml('Bonjour Lola')).toBe('Bonjour Lola');
  });

  it('handles empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('escapes onerror XSS payload', () => {
    const payload = '<img src=x onerror="alert(1)">';
    const result = escapeHtml(payload);
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror=');
    expect(result).toContain('&lt;img');
  });
});
```

- [ ] **Step 2.2: Run test — doit FAIL**

```bash
cd lolett-app
pnpm test __tests__/lib/utils/escape-html.test.ts
```

Expected: FAIL avec "Cannot find module '@/lib/utils/escape-html'".

- [ ] **Step 2.3: Implémenter la fonction**

Créer `lolett-app/lib/utils/escape-html.ts` :

```ts
/**
 * Escape les caractères HTML spéciaux pour empêcher XSS lors d'interpolation
 * dans des templates email ou HTML.
 *
 * Ordre IMPORTANT : `&` doit être escapé en premier sinon les entités déjà
 * présentes seraient double-escapées.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

- [ ] **Step 2.4: Run test — doit PASS**

```bash
pnpm test __tests__/lib/utils/escape-html.test.ts
```

Expected: tous les tests passent (6 ✓).

- [ ] **Step 2.5: Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett
git add lolett-app/lib/utils/escape-html.ts lolett-app/__tests__/lib/utils/escape-html.test.ts
git commit -m "feat(utils): add escapeHtml() helper for XSS prevention

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: #5 — Appliquer escapeHtml aux 4 champs du contact email

**Files:**
- Modify: `lolett-app/lib/email-templates/contact-notification.tsx`

- [ ] **Step 3.1: Modifier le template**

Remplacer **uniquement** la fonction `renderContactNotification` (lignes 14-136) :

```tsx
import { escapeHtml } from '@/lib/utils/escape-html';

export function renderContactNotification({ name, email, subject, message, sentAt }: ContactNotificationProps): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=Re: ${encodeURIComponent(subject)}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nouveau message — LOLETT</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #FAF7F2; font-family: 'DM Sans', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right: 14px;"><div style="width: 28px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                  <td><p style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 500; letter-spacing: 0.15em; color: #2C2420;">LOLETT</p></td>
                  <td style="padding-left: 14px;"><div style="width: 28px; height: 1px; background: #D4CBC0; margin-top: 10px;"></div></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <p style="margin: 0; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.25em; color: #C4956A;">Notification admin</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-weight: 400; font-size: 32px; color: #2C2420; line-height: 1.15;">
                Nouveau message de contact
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <p style="margin: 0; font-size: 12px; color: #9B8E82; letter-spacing: 0.06em;">${escapeHtml(sentAt)}</p>
            </td>
          </tr>

          <!-- Golden line -->
          <tr>
            <td align="center" style="padding-bottom: 40px;">
              <div style="width: 60px; height: 1px; background: #C4956A;"></div>
            </td>
          </tr>

          <!-- Message card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius: 16px;">
                <tr>
                  <td style="padding: 32px;">
                    <!-- Name -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Nom</p>
                    <p style="margin: 0 0 20px; font-size: 15px; color: #2C2420; font-family: 'Cormorant Garamond', Georgia, serif;">${safeName}</p>

                    <!-- Email -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Email</p>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #2C2420;">
                      <a href="${replyHref}" style="color: #2C2420; text-decoration: none;">${safeEmail}</a>
                    </p>

                    <!-- Subject -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Sujet</p>
                    <p style="margin: 0 0 20px; font-size: 15px; color: #2C2420; font-family: 'Cormorant Garamond', Georgia, serif;">${safeSubject}</p>

                    <!-- Separator -->
                    <div style="height: 1px; background: #F0EBE4; margin: 8px 0 20px;"></div>

                    <!-- Message -->
                    <p style="margin: 0 0 4px; font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #C4956A;">Message</p>
                    <p style="margin: 0; font-size: 14px; color: #5A4D3E; line-height: 1.7;">${safeMessage}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 32px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #C4956A; border-radius: 50px; padding: 14px 48px;">
                    <a href="${replyHref}" style="font-family: 'DM Sans', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; color: #FFFFFF; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase;">
                      Répondre à ${escapeHtml(name.split(' ')[0])}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center">
              <div style="height: 1px; background: #E8E0D6; margin-bottom: 20px;"></div>
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                LOLETT — Mode du Sud-Ouest
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

- [ ] **Step 3.2: Run tsc**

```bash
cd lolett-app
pnpm tsc --noEmit
```

Expected: 0 erreur.

- [ ] **Step 3.3: Test manuel rapide (optionnel mais recommandé)**

Démarrer dev server :

```bash
pnpm dev
```

Aller sur `http://localhost:3000/contact`, soumettre :
- Nom : `<img src=x onerror=alert(1)>`
- Email : `test@test.com`
- Sujet : `Test XSS`
- Message : `Test`

Vérifier dans les logs Vercel (ou via Brevo si dev branchée) que l'email reçu affiche `&lt;img src=x onerror=alert(1)&gt;` littéralement, pas comme balise HTML.

Stopper le serveur dev (Ctrl+C).

- [ ] **Step 3.4: Commit**

```bash
git add lolett-app/lib/email-templates/contact-notification.tsx
git commit -m "fix(security): escape HTML dans contact email (XSS prevention)

Avant: name, email, subject interpolés sans escape — un attaquant
pouvait injecter du HTML/JS exécuté à l'ouverture de l'email admin.

Maintenant: escapeHtml() appliqué aux 4 champs (incluant message qui
était déjà escapé mais via inline replace, refacto pour cohérence).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: #3 — Email confirmation perdu (after())

**Files:**
- Modify: `lolett-app/lib/checkout/fulfill-order.ts`

- [ ] **Step 4.1: Modifier `fulfill-order.ts`**

Remplacer le bloc lignes 83-96 par :

```ts
// Avant : sendOrderConfirmation({...}).catch(err => console.error(...));
// Maintenant : after() pour garder la lambda Vercel vivante jusqu'à
// la résolution de l'envoi email, sans bloquer la réponse HTTP.
after(async () => {
  try {
    await sendOrderConfirmation({
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
    });
  } catch (err) {
    console.error('[fulfillOrder] Email error:', err);
  }
});
```

Et ajouter en haut du fichier l'import :

```ts
import { after } from 'next/server';
```

(à mettre après l'import existant `import type { Size } from '@/types';`)

- [ ] **Step 4.2: Run tsc**

```bash
cd lolett-app
pnpm tsc --noEmit
```

Expected: 0 erreur. Si erreur sur `after` → vérifier la version Next.js (doit être ≥ 15.0). `package.json` doit montrer `"next": "^15..."`.

- [ ] **Step 4.3: Run tests**

```bash
pnpm test
```

Expected: tous passent. Le test `order-cancelled.test.ts` ne doit pas casser.

- [ ] **Step 4.4: Commit**

```bash
git add lolett-app/lib/checkout/fulfill-order.ts
git commit -m "fix(email): wrap sendOrderConfirmation dans after() pour Vercel lambda

Avant: fire-and-forget (.catch()) sans await — Vercel pouvait tuer
la lambda avant l'envoi de l'email, perdant silencieusement la
confirmation commande pour le client.

Maintenant: after() garde la lambda vivante jusqu'à la résolution,
sans bloquer la réponse HTTP. Mêmement pattern que webhook Stripe.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: #2 — Commande guest 401 (route + hook)

**Files:**
- Modify: `lolett-app/app/api/orders/[id]/route.ts`
- Modify: `lolett-app/components/checkout/success/useOrderLoader.ts`

**Approche** : on ajoute un mode "guest validé par session_id Stripe" à la route. Le `payment_intent` de la session Stripe est utilisé comme lien session ↔ commande (déjà stocké dans `order.payment_id`).

- [ ] **Step 5.1: Modifier `app/api/orders/[id]/route.ts`**

Remplacer **tout le contenu du fichier** par :

```ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SupabaseOrderRepository } from '@/lib/adapters/supabase';
import { createClient } from '@/lib/supabase/server';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = req.nextUrl.searchParams.get('session_id');

  const orderRepo = new SupabaseOrderRepository();
  const order = await orderRepo.findById(id);

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  // Mode 1 — User connecté : vérifie qu'il est bien le owner
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }
    return NextResponse.json(order);
  }

  // Mode 2 — Guest avec session_id Stripe : valide via Stripe API
  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Paiement non finalisé' }, { status: 402 });
      }

      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

      // Le order.paymentId DOIT correspondre au payment_intent de la session
      // (lien posé par fulfillOrder lors de la création de la commande).
      if (!paymentIntentId || paymentIntentId !== order.paymentId) {
        return NextResponse.json({ error: 'Session invalide' }, { status: 403 });
      }

      return NextResponse.json(order);
    } catch (err) {
      console.error('[GET /api/orders/:id] Stripe session validation failed:', err);
      return NextResponse.json({ error: 'Session invalide' }, { status: 403 });
    }
  }

  // Aucun mode d'auth valide
  return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
}
```

- [ ] **Step 5.2: Vérifier le type `Order` a bien la prop `paymentId`**

```bash
cd lolett-app
grep -n "paymentId\|payment_id" types/index.ts lib/adapters/supabase.ts | head -10
```

Si `Order` n'a pas la prop `paymentId` exposée, il faut l'ajouter dans le mapper Supabase. Vérifier en lisant `lib/adapters/supabase.ts` (recherche du nom du fichier exact) :

```bash
find lolett-app/lib/adapters -name "supabase*" -type f
```

Lire le fichier qui contient `SupabaseOrderRepository`, identifier le mapper qui transforme la row DB en `Order`, et confirmer que `payment_id` (DB) → `paymentId` (Order). Si non, l'ajouter dans le type `Order` (`types/index.ts`) et le mapper.

⚠️ **Cette étape est conditionnelle** — exécuter SEULEMENT si la prop manque. Si elle existe déjà, passer à 5.3.

- [ ] **Step 5.3: Modifier `useOrderLoader.ts`**

Remplacer la ligne 36 :

```ts
const res = await fetch(`/api/orders/${resolvedOrderId}`);
```

Par :

```ts
const url = sessionId
  ? `/api/orders/${resolvedOrderId}?session_id=${encodeURIComponent(sessionId)}`
  : `/api/orders/${resolvedOrderId}`;
const res = await fetch(url);
```

- [ ] **Step 5.4: Run tsc**

```bash
pnpm tsc --noEmit
```

Expected: 0 erreur.

- [ ] **Step 5.5: Run tests**

```bash
pnpm test
```

Expected: tous passent.

- [ ] **Step 5.6: Test manuel preview (OBLIGATOIRE — bug critique)**

Push la branche pour déclencher un deploy Vercel preview :

```bash
git add lolett-app/app/api/orders/[id]/route.ts lolett-app/components/checkout/success/useOrderLoader.ts
git commit -m "fix(checkout): commande guest 401 sur page success

Avant: la route /api/orders/[id] exigeait un user Supabase connecté.
Les commandes guest (cas majoritaire au launch) recevaient 401 et la
page success affichait 'Commande introuvable' alors que le paiement
était validé.

Maintenant: dual-mode auth — soit user connecté propriétaire de la
commande, soit session_id Stripe valide (paid + payment_intent matche
order.paymentId). useOrderLoader passe le session_id à la route.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push -u origin feat/pre-launch-fixes
```

Attendre 1-2 min que le deploy preview soit prêt. Puis dans une **fenêtre incognito** :

1. Aller sur `https://lolett-git-feat-pre-launch-fixes-lolett64s-projects.vercel.app` (URL exacte à confirmer dans Vercel Dashboard)
2. Ajouter un produit au panier
3. Aller checkout, payer avec carte test Stripe `4242 4242 4242 4242` exp `12/30` cvc `123`
4. **Vérifier** : la page `/checkout/success` affiche bien le récap commande (numéro, items, adresse, total) — PAS "Commande introuvable"
5. **Test négatif** : essayer de fetch directement `https://[preview-url]/api/orders/[un-orderId-d-une-vraie-commande]` SANS session_id → doit renvoyer 401
6. **Test négatif** : essayer de fetch avec un session_id arbitraire `cs_test_xxxxxxxxxxxxxxxxxxx` → doit renvoyer 403 ou 404

Si tous les tests OK → continuer. Sinon → diagnostiquer + fix.

---

## Task 6: #4 — Open redirect bonus (1 ligne)

**Files:**
- Modify: `lolett-app/app/auth/callback/route.ts`

- [ ] **Step 6.1: Modifier le fichier**

Remplacer la ligne 7 :

```ts
const next = searchParams.get('next') ?? '/compte';
```

Par :

```ts
const rawNext = searchParams.get('next') ?? '/compte';
// Sécurité: n'accepte que les chemins internes (pas //evil.com qui serait
// interprété comme protocole-relatif et redirigerait vers un site externe).
const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/compte';
```

- [ ] **Step 6.2: Run tsc + tests**

```bash
pnpm tsc --noEmit
pnpm test
```

Expected: 0 erreur, tous tests passent.

- [ ] **Step 6.3: Commit**

```bash
git add lolett-app/app/auth/callback/route.ts
git commit -m "fix(security): bloque open redirect dans /auth/callback

Avant: paramètre 'next' utilisé tel quel dans NextResponse.redirect.
Un attaquant pouvait forger ?next=//evil.com pour rediriger les users
authentifiés vers un site externe (phishing post-login).

Maintenant: rejette toute valeur ne commençant pas par '/' ou
commençant par '//'. Fallback sur '/compte'.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: #6 — Fix liens cassés tous les templates email

**Files modifiés** (10 templates) :
- `lolett-app/lib/email/templates/order-confirmation-v3.ts`
- `lolett-app/lib/email/templates/order-shipped-v3.ts`
- `lolett-app/lib/email/templates/order-delivered-v3.ts`
- `lolett-app/lib/email/templates/order-cancelled-v3.ts`
- `lolett-app/lib/email/templates/order-refunded-v3.ts`
- `lolett-app/lib/email/templates/welcome-newsletter-v3.ts`

Chaque template a 2 `href="#"` à fixer (footer "Se désabonner" + "Mentions légales") sauf `order-confirmation-v3.ts` et `order-shipped-v3.ts` qui ont en plus un CTA `href="#"`.

**Stratégie** : pour chaque template, faire les modifs suivantes en une fois.

- [ ] **Step 7.1: Audit complet**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett
grep -rn 'href="#"' lolett-app/lib/email/templates
```

Lister tous les matches. **Pour chaque match**, classifier :
- Footer "Se désabonner" + "Mentions légales" (templates **transactionnels**) → suppression "Se désabonner", remplacement "Mentions légales"
- Footer "Se désabonner" + "Mentions légales" (templates **marketing** : `welcome-newsletter`, `launch-invitation`) → fallback texte "Pour vous désabonner, écrivez à bonjour@lolettshop.com" (au lieu du lien) + remplacement "Mentions légales"
- CTA "Suivre ma commande" → suppression complète du bouton

- [ ] **Step 7.2: Helper SITE_URL pour les templates**

Créer `lolett-app/lib/email/site-url.ts` :

```ts
export function getEmailSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://lolettshop.com';
}
```

Pourquoi un helper : on veut un fallback hardcodé `https://lolettshop.com` au cas où l'env var n'est pas définie (preview qui aurait raté le pull, env dev oubliée). Et on enlève le `/` final si présent.

- [ ] **Step 7.3: Fix `order-confirmation-v3.ts`**

Tout en haut du fichier, ajouter :

```ts
import { getEmailSiteUrl } from '@/lib/email/site-url';
```

Au début de la fonction `renderOrderConfirmationV3`, ajouter :

```ts
const siteUrl = getEmailSiteUrl();
```

Remplacer le bloc lignes 219-232 (CTA "Suivre ma commande") par :

```ts
          <!-- (CTA "Suivre ma commande" supprimé — pas de page de suivi guest disponible.) -->
```

(commentaire HTML pour conserver la structure visuelle des autres tr/td)

Remplacer la ligne 248 (footer) par :

```html
                <a href="${siteUrl}/mentions-legales" style="color: #B5A99A; text-decoration: none;">Mentions légales</a>
```

(suppression du `Se désabonner` et du `&middot;` séparateur)

- [ ] **Step 7.4: Fix `order-shipped-v3.ts`** (même pattern)

Ajouter import + `siteUrl` en haut.
Supprimer le CTA ligne 216 (bloc `<a href="#"...>` jusqu'à `</a>`).
Remplacer ligne 239 par le même footer Mentions légales seulement.

- [ ] **Step 7.5: Fix `order-delivered-v3.ts`** (footer seulement)

Ajouter import + `siteUrl`. 
Remplacer ligne 115 par footer Mentions légales seulement.

- [ ] **Step 7.6: Fix `order-cancelled-v3.ts`** (footer seulement)

Idem 7.5 mais ligne 127.

- [ ] **Step 7.7: Fix `order-refunded-v3.ts`** (footer seulement)

Idem 7.5 mais ligne 127.

- [ ] **Step 7.8: Fix `welcome-newsletter-v3.ts`** (CTA + footer marketing)

Ajouter import + `siteUrl`.

Pour le CTA ligne 115 — c'est probablement un "Découvrir la boutique" ou similaire. Lire le contexte autour de la ligne et :
- Si c'est un CTA fonctionnel (genre "Voir la boutique") → remplacer `href="#"` par `href="${siteUrl}/shop"`
- Si c'est confus → supprimer le bouton

Pour le footer ligne 138 (template **marketing** donc fallback texte désabo) :

```html
              <p style="margin: 0; font-size: 11px; color: #B5A99A; line-height: 1.8;">
                Pour vous désabonner, écrivez à <a href="mailto:bonjour@lolettshop.com" style="color: #B5A99A;">bonjour@lolettshop.com</a> &middot; <a href="${siteUrl}/mentions-legales" style="color: #B5A99A; text-decoration: none;">Mentions légales</a>
              </p>
```

- [ ] **Step 7.9: Vérifier `launch-invitation-v3.ts`**

```bash
grep -n 'href="#"\|Se désabonner' lolett-app/lib/email/templates/launch-invitation-v3.ts
```

Si liens cassés ou désabo lien → appliquer le même pattern que `welcome-newsletter-v3.ts`.

Si pas de match → passer.

- [ ] **Step 7.10: Run tsc + tests**

```bash
pnpm tsc --noEmit
pnpm test
```

Expected: 0 erreur, tests passent.

- [ ] **Step 7.11: Vérifier qu'il ne reste plus de href="#"**

```bash
grep -rn 'href="#"' lolett-app/lib/email/templates
```

Expected: aucun résultat (sauf cas justifié documenté en commentaire).

- [ ] **Step 7.12: Commit**

```bash
git add lolett-app/lib/email/site-url.ts lolett-app/lib/email/templates/
git commit -m "fix(email): remplace href=# cassés par vraies URLs (RGPD)

Avant: 11 occurrences de href='#' dans 6 templates email — boutons
'Suivre ma commande', liens 'Se désabonner', 'Mentions légales' tous
non-fonctionnels. Problème UX (client clic dans le vide) ET légal
(article L34-5 CPCE: lien désabonnement obligatoire en email
commercial).

Maintenant:
- Templates transactionnels (commandes): retire 'Se désabonner'
  (transactionnels exemptés), garde 'Mentions légales' fonctionnel.
- Templates marketing (newsletter, launch): fallback texte
  'écrivez à bonjour@lolettshop.com' (page /desabonnement reportée
  post-launch).
- CTA 'Suivre ma commande' supprimé (pas de page suivi guest).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: #8 — Update mentions légales + confidentialité

**Files:**
- Modify: `lolett-app/app/mentions-legales/page.tsx`
- Modify: `lolett-app/app/confidentialite/page.tsx`

- [ ] **Step 8.1: Update `mentions-legales/page.tsx`**

Remplacer **toutes** les occurrences de `contact.lolett@gmail.com` par `bonjour@lolettshop.com` (4 endroits : lignes 43, 44, 74, 75 — texte affiché ET attribut `href` du `mailto:`).

Vérifier aussi s'il y a une "Date de dernière mise à jour" — si oui, la passer à `2026-05-05`.

- [ ] **Step 8.2: Update `confidentialite/page.tsx`**

1. Ligne 26 : remplacer `contact.lolett@gmail.com` (2 occurrences sur la ligne : href + texte) par `bonjour@lolettshop.com`.

2. Ligne 81 : remplacer :

```tsx
<li><strong>Google (Gmail SMTP) et Resend</strong> — envoi d'emails transactionnels et marketing</li>
```

Par :

```tsx
<li><strong>Brevo (Sendinblue SAS, France)</strong> — envoi d'emails transactionnels et marketing. SMTP Google et Resend conservés en fallback de secours en cas d'indisponibilité Brevo.</li>
```

3. Si "Date de dernière mise à jour" présente → passer à `2026-05-05`.

- [ ] **Step 8.3: Run tsc + visual check**

```bash
pnpm tsc --noEmit
pnpm dev
```

Aller sur `http://localhost:3000/mentions-legales` et `http://localhost:3000/confidentialite`. Vérifier :
- Aucune mention `contact.lolett@gmail.com` visible
- Aucune mention "Gmail SMTP", "Resend" en provider principal
- Mise en page intacte (pas de balise cassée)

Stopper le serveur dev.

- [ ] **Step 8.4: Commit**

```bash
git add lolett-app/app/mentions-legales/page.tsx lolett-app/app/confidentialite/page.tsx
git commit -m "fix(legal): mets à jour email contact + provider email

Suite au switch sender Brevo (commit fc6db76):
- Mentions légales: contact.lolett@gmail.com → bonjour@lolettshop.com
- Confidentialité: idem + provider 'Gmail SMTP / Resend' → 'Brevo
  (Sendinblue SAS, France)' avec mention du fallback de secours.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: #7 — Page politique cookies (CNIL)

**Files:**
- Create: `lolett-app/app/politique-cookies/page.tsx`
- Modify: `lolett-app/components/layout/Footer.tsx`

- [ ] **Step 9.1: Lire un exemple existant pour cohérence styling**

```bash
cat /Users/trikilyes/Desktop/Privé/Lorett/lolett-app/app/cgv/page.tsx
```

Noter le style général (className Tailwind, structure Server Component, couleurs).

- [ ] **Step 9.2: Créer `app/politique-cookies/page.tsx`**

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de cookies',
  description: 'Politique de gestion des cookies sur lolettshop.com — informations sur les cookies utilisés, leurs finalités, et comment les gérer.',
  robots: { index: true, follow: true },
};

export default function PolitiqueCookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-serif text-[#2C2420] mb-2">
        Politique de cookies
      </h1>
      <p className="text-sm text-[#9B8E82] mb-12">Dernière mise à jour : 5 mai 2026</p>

      <section className="space-y-6 text-[#5A4D3E] leading-relaxed">
        <div>
          <h2 className="text-xl font-serif text-[#2C2420] mb-3">1. Qu&apos;est-ce qu&apos;un cookie&nbsp;?</h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lorsque vous visitez un site internet. Les cookies permettent de mémoriser des informations utiles sur vos préférences, d&apos;assurer le bon fonctionnement du site, et de mesurer son audience.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif text-[#2C2420] mb-3">2. Cookies utilisés sur lolettshop.com</h2>

          <h3 className="text-lg font-medium text-[#2C2420] mt-6 mb-2">Cookies techniques (toujours actifs)</h3>
          <p className="mb-3">
            Ces cookies sont strictement nécessaires au fonctionnement du site. Ils ne nécessitent pas votre consentement.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>cookie_consent</strong> — Lolett, 12 mois — mémorise vos préférences de cookies.</li>
            <li><strong>sb-* (session Supabase)</strong> — Lolett, durée de session ou 30 jours si « rester connecté » — gestion de votre compte client et de votre panier.</li>
            <li><strong>__stripe_mid, __stripe_sid</strong> — Stripe, durée de session à 1 an — sécurité du paiement, prévention de la fraude.</li>
          </ul>

          <h3 className="text-lg font-medium text-[#2C2420] mt-6 mb-2">Cookies analytiques (sur consentement)</h3>
          <p className="mb-3">
            Ces cookies nous aident à comprendre comment vous utilisez le site afin d&apos;en améliorer l&apos;expérience. Ils ne sont déposés qu&apos;avec votre consentement explicite.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>_ga, _ga_*</strong> — Google (Google Analytics 4), 24 mois — mesure d&apos;audience anonyme (pages visitées, durée, parcours).</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-serif text-[#2C2420] mb-3">3. Comment gérer vos cookies&nbsp;?</h2>
          <p className="mb-3">
            À votre première visite, un bandeau vous propose d&apos;accepter ou de refuser les cookies analytiques. Vous pouvez modifier votre choix à tout moment&nbsp;:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>En supprimant le cookie <code className="bg-[#FAF7F2] px-1 rounded text-sm">cookie_consent</code> dans les paramètres de votre navigateur — le bandeau réapparaîtra à votre prochaine visite.</li>
            <li>En configurant votre navigateur pour bloquer ou supprimer tous les cookies (consultez l&apos;aide de votre navigateur — Chrome, Safari, Firefox, Edge).</li>
          </ul>
          <p className="mt-3">
            Note&nbsp;: refuser tous les cookies peut limiter certaines fonctionnalités du site (par exemple le panier persistant entre sessions).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif text-[#2C2420] mb-3">4. Contact</h2>
          <p>
            Pour toute question sur cette politique, écrivez-nous à{' '}
            <a href="mailto:bonjour@lolettshop.com" className="underline hover:text-[#B89547] transition-colors">
              bonjour@lolettshop.com
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 9.3: Ajouter le lien dans `components/layout/Footer.tsx`**

Modifier le tableau de liens (lignes ~20-22) :

```tsx
{ name: 'CGV', href: '/cgv' },
{ name: 'Mentions légales', href: '/mentions-legales' },
{ name: 'Confidentialité', href: '/confidentialite' },
{ name: 'Politique cookies', href: '/politique-cookies' },
```

- [ ] **Step 9.4: Run tsc + visual check**

```bash
pnpm tsc --noEmit
pnpm dev
```

Aller sur `http://localhost:3000/politique-cookies`. Vérifier :
- Le styling matche les autres pages légales (fond, fontes, espaces)
- La page est responsive (test mobile via DevTools)
- Le lien "Politique cookies" apparaît dans le Footer

Stopper le serveur dev.

- [ ] **Step 9.5: Commit**

```bash
git add lolett-app/app/politique-cookies/page.tsx lolett-app/components/layout/Footer.tsx
git commit -m "feat(legal): page /politique-cookies + lien Footer

Page légale obligatoire CNIL dès lors que le site dépose des cookies
tiers (Google Analytics 4 via GTM). Liste les cookies techniques et
analytiques avec finalité, durée, déposant. Référence au bandeau de
consentement et instructions pour modifier les préférences.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: #9 — OG image dans metadata

**Files:**
- Modify: `lolett-app/app/layout.tsx`

- [ ] **Step 10.1: Vérifier les dimensions de `public/og-lolett.jpg`**

```bash
file /Users/trikilyes/Desktop/Privé/Lorett/lolett-app/public/og-lolett.jpg
```

Si la commande ne donne pas les dimensions, utiliser :

```bash
sips -g pixelWidth -g pixelHeight /Users/trikilyes/Desktop/Privé/Lorett/lolett-app/public/og-lolett.jpg
```

Noter `pixelWidth` et `pixelHeight`. Utilisera ces valeurs dans la metadata.

- [ ] **Step 10.2: Modifier `app/layout.tsx`**

Remplacer le bloc metadata.openGraph (lignes 50-56) par :

```ts
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'LOLETT',
    title: 'LOLETT | Mode du Sud-Ouest',
    description: 'Mode du Sud-Ouest pour homme et femme. Née ici, portée partout.',
    url: 'https://lolettshop.com',
    images: [
      {
        url: '/og-lolett.jpg',
        width: <pixelWidth depuis step 10.1>,
        height: <pixelHeight depuis step 10.1>,
        alt: 'LOLETT — Mode du Sud-Ouest',
      },
    ],
  },
```

Remplacer `<pixelWidth>` et `<pixelHeight>` par les valeurs réelles (par exemple `1200` et `630`).

Et remplacer le bloc `twitter` (lignes 57-61) par :

```ts
  twitter: {
    card: 'summary_large_image',
    title: 'LOLETT | Mode du Sud-Ouest',
    description: 'Mode du Sud-Ouest pour homme et femme. Née ici, portée partout.',
    images: ['/og-lolett.jpg'],
  },
```

- [ ] **Step 10.3: Run tsc**

```bash
pnpm tsc --noEmit
```

Expected: 0 erreur.

- [ ] **Step 10.4: Commit**

```bash
git add lolett-app/app/layout.tsx
git commit -m "feat(seo): référence og-lolett.jpg dans metadata Open Graph + Twitter

L'image existait dans public/ mais n'était pas référencée — les
partages sociaux (Insta, FB, WhatsApp, X) affichaient un aperçu vide.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Validation finale + code review

- [ ] **Step 11.1: Run tsc + tests sur l'ensemble**

```bash
cd lolett-app
pnpm tsc --noEmit
pnpm test
```

Expected: 0 erreur tsc, tous les tests passent.

- [ ] **Step 11.2: Push la branche pour deploy preview**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett
git push origin feat/pre-launch-fixes
```

Attendre le deploy preview Vercel (1-3 min).

- [ ] **Step 11.3: Spawn code-reviewer agent (process token-saver standard)**

Spawn `feature-dev:code-reviewer` avec briefing :

> Audit final pré-merge des fixes pre-launch Lolett (branche `feat/pre-launch-fixes`).
>
> Diff à reviewer : `git diff main..HEAD` depuis `/Users/trikilyes/Desktop/Privé/Lorett`.
>
> Spec de référence : `docs/superpowers/specs/2026-05-05-pre-launch-fixes-design.md`.
>
> Plan suivi : `docs/superpowers/plans/2026-05-05-pre-launch-fixes.md`.
>
> Focus high-confidence issues bloquantes. Pas de style/refactor "nice to have". Cap 600 mots.

- [ ] **Step 11.4: Triage des findings**

Pour chaque finding du reviewer :
- Vérifier via `grep`/`Read`/SQL — les agents font des faux positifs (cf middleware admin déjà constaté)
- Marquer VRAI / FAUX POSITIF / DIFFÉRÉ avec raison
- Fixer les VRAIS en priorité critique → high → medium → low

- [ ] **Step 11.5: Test manuel preview complet**

Dans une fenêtre incognito sur l'URL preview :

1. **Test guest checkout end-to-end** :
   - Ajouter produit → checkout → payer carte test → vérifier `/checkout/success` affiche bien le récap
2. **Test pages légales** :
   - `/politique-cookies` → s'affiche, lien Footer marche
   - `/mentions-legales` → email = `bonjour@lolettshop.com`
   - `/confidentialite` → email + provider Brevo
3. **Test partage social** :
   - Coller l'URL preview dans Slack ou Discord → vérifier que l'OG image apparaît
   - Si l'image ne charge pas → vérifier le path absolu, le `Content-Type`
4. **Test XSS contact** :
   - `/contact` → soumettre nom = `<img src=x onerror=alert(1)>` → vérifier email reçu (Brevo) que le HTML est échappé

- [ ] **Step 11.6: Commit fixes review (si applicable)**

Si des fixes ont été apportés suite au review :

```bash
git add -A
git commit -m "fix(scope): code review hardening (N issues)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push
```

- [ ] **Step 11.7: Merge vers main**

Une fois preview validé + review clean :

```bash
git checkout main
git merge --no-ff feat/pre-launch-fixes -m "Merge branch 'feat/pre-launch-fixes': pre-launch hardening (#2 #3 #4 #5 #6 #7 #8 #9)"
git push origin main
```

Vercel déploie automatiquement en prod.

- [ ] **Step 11.8: Smoke test prod**

Sur `https://lolettshop.com` en incognito :
1. Page d'accueil charge OK
2. `/politique-cookies` accessible
3. Footer contient le lien
4. Mentions légales / confidentialité affichent les bonnes infos
5. Tester un partage WhatsApp/Slack de l'URL → OG image visible

Si tout OK → ✅ launch ready.

Si régression critique → rollback :

```bash
git revert <merge_commit_sha>
git push origin main
```

---

## Self-Review Checklist (rempli)

**Spec coverage** ✅
- #2 → Task 5
- #3 → Task 4
- #4 → Task 6
- #5 → Tasks 2 + 3
- #6 → Task 7 (étendu à 6 templates au lieu de 1 prévu — découvert en exploring)
- #7 → Task 9
- #8 → Task 8
- #9 → Task 10
- Désabo → reportée post-launch (annoté dans spec)

**Placeholder scan** : revu, OK. Pas de "TBD", "à compléter", ni instructions vagues.

**Type consistency** :
- `escapeHtml` (signature `(value: string) => string`) cohérent dans Tasks 2 + 3
- `getEmailSiteUrl()` (signature `() => string`) cohérent dans Task 7
- `paymentId` / `payment_id` : précaution prise dans Step 5.2 pour vérifier que le mapper expose bien la prop avant de baser le check dessus

**Risques résiduels documentés** :
- Dépendance à `payment_intent` dans la session Stripe — si Stripe change la sémantique de cette prop, le check casse. Mitigation : test manuel obligatoire en preview avant merge (Step 5.6 + 11.5).
- `after()` requiert Next.js 15 — vérifié implicitement dans Step 4.2.

**Estimation** : ~2h45 dont ~1h de tests/validation. Plan donc serré mais réaliste. Marge si imprévu : on retire Tasks 6 (open redirect bonus) et 10 (OG image) car non-bloquants.
