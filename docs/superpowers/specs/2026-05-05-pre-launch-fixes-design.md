# Pre-launch fixes — Lolett (ouverture publique 2026-05-06)

## Contexte

Audit pré-launch lancé via 3 sub-agents (sécurité, code quality, UX/SEO).
9 issues remontées, 7 vraies (2 faux positifs / nuancés écartés après vérification manuelle avec démo en navigation privée et lecture du middleware).

**Objectif** : fixer tous les bloquants avant l'ouverture publique du 6 mai 2026.

---

## Issues fixées (par priorité)

### #2 — Commande guest 401 sur page succès (CRITIQUE)

**Symptôme** : un client invité (non connecté) paye via Stripe → est redirigé sur `/checkout/success?session_id=cs_xxx` → la page tente de fetch `/api/orders/[id]` qui exige un user connecté → 401 → affiche "Commande introuvable" alors que le paiement est validé.

**Fichiers concernés** :
- `app/api/orders/[id]/route.ts` (route à modifier)
- `components/checkout/success/useOrderLoader.ts` (passer le session_id)

**Solution retenue (approche C — validation par `session_id` Stripe)** :

La route `/api/orders/[id]` accepte maintenant 2 modes d'authentification :

1. **User connecté** (comportement actuel) : auth via cookie Supabase, vérifie que `order.userId === user.id`
2. **Guest avec session_id** (nouveau) : si query param `?session_id=cs_xxx` fourni, on appelle Stripe `stripe.checkout.sessions.retrieve(session_id)` pour vérifier :
   - `payment_status === 'paid'`
   - `metadata.orderId === order.id` (lien session ↔ commande, posé au moment de la création de la session)

Si **aucun** des 2 modes ne valide → 401.

**Modif `useOrderLoader`** : ajouter `&session_id=${sessionId}` au fetch quand on a un `sessionId` mais pas de user.

**Pré-requis vérifié** : la session Stripe **DOIT** contenir l'`orderId` dans ses metadata lors de la création. À vérifier dans `app/api/checkout/stripe/route.ts` — si pas le cas, ajouter l'`orderId` dans `metadata` au moment de `stripe.checkout.sessions.create()`.

**Sécurité** : un attaquant ne peut pas lire une commande au hasard car il lui faut le `session_id` Stripe (token long, signé, non-énumérable) ET on vérifie côté serveur que la session est bien `paid` ET correspond à l'orderId.

---

### #3 — Email de confirmation perdu (CRITIQUE)

**Symptôme** : `fulfillOrder` (lib/checkout/fulfill-order.ts:83) envoie l'email avec `sendOrderConfirmation(...).catch(...)` sans `await`. Sur Vercel, la lambda peut être tuée dès la réponse HTTP envoyée → email parfois jamais parti.

**Solution retenue (approche A — fix centralisé dans `fulfillOrder`)** :

Wrapper `sendOrderConfirmation(...)` dans `after()` de `next/server`. Cela garde la lambda vivante jusqu'à ce que la promesse résolve, **sans bloquer la réponse HTTP**.

```ts
import { after } from 'next/server';
// ...
after(async () => {
  try {
    await sendOrderConfirmation({...});
  } catch (err) {
    console.error('[fulfillOrder] Email error:', err);
  }
});
```

**Pourquoi `fulfillOrder` et pas le callsite** : `fulfillOrder` est appelé depuis 2 routes (`/api/checkout/stripe/session` et `/api/webhooks/stripe`). Centraliser dans `fulfillOrder` garantit que les deux paths sont protégés sans duplication.

**Risque** : `after()` n'est utilisable que dans un contexte de request Next.js. `fulfillOrder` est uniquement appelé depuis des routes Next.js, donc OK. Si un jour quelqu'un l'appelle depuis un cron/script, le `after()` lèvera une erreur claire — comportement préférable au silence actuel.

---

### #5 — XSS dans email contact (HIGH)

**Symptôme** : `lib/email-templates/contact-notification.tsx` interpole `name`, `email`, `subject` dans le HTML sans les échapper (lignes 81, 86, 91). Le champ `message` est correctement échappé (ligne 16) — incohérence à corriger.

**Solution** :

Extraire la fonction d'escape déjà présente dans une `escapeHtml()` réutilisable, et l'appliquer aux 4 champs.

```ts
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

Appliqué à : `name`, `email`, `subject`, et le `message` existant (refacto pour utiliser la même fonction).

**Cas particulier `email`** : utilisé aussi dans `mailto:${email}` (ligne 15) et `<a href="mailto:${email}">${email}</a>` (ligne 86). L'escape HTML protège l'affichage. Pour le `mailto:`, le browser tolère mais on ajoute aussi `encodeURIComponent` sur le `mailto:` pour propreté.

---

### #6 — Liens cassés dans email confirmation commande (LÉGAL)

**Symptôme** : `lib/email/templates/order-confirmation-v3.ts` contient 3 liens `href="#"` :
- Ligne 225 : CTA "Suivre ma commande"
- Ligne 248 : "Se désabonner"
- Ligne 248 : "Mentions légales"

**Solution** :

1. **CTA "Suivre ma commande"** → **supprimer entièrement le bouton** (lignes 219-232). Pas de page de suivi guest disponible. Décision validée par Lyes : on enverra le lien de suivi plus tard quand on aura un système de tracking.

2. **"Se désabonner"** → **supprimer du footer transactionnel**. Email de confirmation commande = transactionnel, pas marketing → pas obligation légale. Décision validée par Lyes.

3. **"Mentions légales"** → pointer vers `https://lolettshop.com/mentions-legales`. Construire l'URL via une variable d'env `NEXT_PUBLIC_SITE_URL` ou fallback `https://lolettshop.com`.

**Footer email après fix** :
```html
<p>LOLETT — Mode du Sud-Ouest</p>
<p><a href="${SITE_URL}/mentions-legales">Mentions légales</a></p>
```

**Vérification à faire** : `grep -rn 'href="#"' lib/email` pour détecter d'autres liens vides dans tous les templates. Pour chaque match : remplacer par une vraie URL (mentions légales, désabonnement marketing si template marketing) ou supprimer le bouton/lien si pas de cible disponible. Étape obligatoire dans le plan d'impl.

---

### #7 — Page `/politique-cookies` manquante (LÉGAL)

**Symptôme** : tu utilises GTM + GA4 → cookies tiers déposés → CNIL exige page dédiée listant chaque cookie. Footer pointe vers CGV / Mentions légales / Confidentialité, mais pas de politique cookies.

**Solution** :

Créer `app/politique-cookies/page.tsx` avec :
- Layout cohérent avec les autres pages légales (`app/cgv/page.tsx`, `app/mentions-legales/page.tsx`)
- Métadonnées Next.js (`title`, `description`, `robots`)
- Sections :
  1. **Qu'est-ce qu'un cookie ?** — paragraphe explicatif court
  2. **Cookies utilisés sur lolettshop.com** — tableau ou liste avec :
     - **Cookies techniques (toujours actifs)** : `cookie_consent` (Lolett, 1 an), session Supabase (Lolett, durée de session/30 jours), cookies Stripe (transactionnels, durée session)
     - **Cookies analytiques (sur consentement)** : `_ga`, `_ga_XXX` (Google Analytics 4, 2 ans, mesure d'audience)
  3. **Comment gérer vos cookies** — référence au bandeau de consentement + instructions pour modifier les préférences via les boutons en bas de page (à implémenter via le composant `CookieConsent` existant si possible, ou note "videz le cookie `cookie_consent` pour ré-afficher le bandeau")
  4. **Contact** — lien `mailto:bonjour@lolettshop.com`
  5. **Date de dernière mise à jour** — `2026-05-05`

Ajouter le lien dans `components/layout/Footer.tsx` (après "Confidentialité").

---

### #8 — Mentions légales et confidentialité périmées (HIGH)

**Symptôme** : références à `contact.lolett@gmail.com` (ancienne adresse) et "Google (Gmail SMTP) et Resend" (anciens providers email).

**Solution** :

1. **`app/mentions-legales/page.tsx`** : remplacer les 4 occurrences `contact.lolett@gmail.com` par `bonjour@lolettshop.com` (lignes 43, 44, 74, 75). Inclut le `mailto:` ET le texte affiché.

2. **`app/confidentialite/page.tsx`** :
   - Ligne 26 : remplacer `contact.lolett@gmail.com` → `bonjour@lolettshop.com` (1 occurrence)
   - Ligne 81 : remplacer `<strong>Google (Gmail SMTP) et Resend</strong>` → `<strong>Brevo (Sendinblue SAS, France)</strong>` avec mention que **SMTP Gmail et Resend** sont conservés en fallback de secours en cas d'indisponibilité Brevo

3. **Mettre à jour la date "dernière mise à jour"** des deux pages à `2026-05-05` si présente.

---

### #9 — OG image globale manquante (EASY-WIN SEO)

**Symptôme** : `public/og-lolett.jpg` existe mais n'est pas référencé dans `app/layout.tsx:50` (clé `images:` absente du `openGraph`).

**Solution** :

Ajouter dans `app/layout.tsx` metadata.openGraph :

```ts
openGraph: {
  type: 'website',
  locale: 'fr_FR',
  siteName: 'LOLETT',
  title: 'LOLETT | Mode du Sud-Ouest',
  description: '...',
  url: 'https://lolettshop.com',
  images: [
    {
      url: '/og-lolett.jpg',
      width: 1200,
      height: 630,
      alt: 'LOLETT — Mode du Sud-Ouest',
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  title: '...',
  description: '...',
  images: ['/og-lolett.jpg'],
},
```

**Vérification dimensions** : ouvrir `public/og-lolett.jpg` et confirmer qu'elle fait 1200×630 (ratio standard OG/Twitter). Si ce n'est pas le cas, ajuster les valeurs `width`/`height` dans la metadata pour matcher la taille réelle (Next.js ne le fait pas automatiquement). Si l'image est trop petite (< 600×314), Twitter affichera une carte `summary` au lieu de `summary_large_image` → pas critique, juste moins beau.

---

### NOUVEAU — Page `/desabonnement` minimaliste (LÉGAL marketing)

**Contexte** : décision Lyes — on ne fixe pas le lien désabo dans l'email transactionnel (#6) mais on le doit pour les emails **marketing** (newsletter, launch-campaign). Scope minimal validé.

**Fichiers à créer** :

1. `app/desabonnement/page.tsx` — page React (Server Component + petit Client Component pour le bouton)
2. `app/api/unsubscribe/route.ts` — POST endpoint pour effectuer la désinscription
3. `lib/unsubscribe/token.ts` — génération + vérification HMAC du token
4. `lib/email/unsubscribe-link.ts` — helper pour construire le lien à insérer dans les emails marketing

**Flow** :

1. **Émission du lien** (côté code, pas runtime) : pour chaque email marketing envoyé à `email@example.com`, on génère :
   ```ts
   const token = await generateUnsubscribeToken(email); // HMAC-SHA256
   const link = `${SITE_URL}/desabonnement?email=${encodeURIComponent(email)}&token=${token}`;
   ```

2. **Réception du lien** : le client clique → arrive sur `/desabonnement?email=...&token=...`
   - Server Component vérifie le token
   - Si invalide → page d'erreur "Lien invalide ou expiré"
   - Si valide → affiche : titre "Confirmer le désabonnement" + email pré-rempli (lecture seule) + bouton "Confirmer"

3. **Confirmation** : clic → POST `/api/unsubscribe` avec `{ email, token }`
   - Re-vérification du token
   - Suppression de l'entrée dans la table `newsletter_subscribers` (nom confirmé via `app/api/newsletter/subscribe/route.ts:87`)
   - Réponse JSON `{ success: true }`
   - Le client affiche "C'est fait, vous ne recevrez plus de mails de notre part."

**Token HMAC** :
- Secret : `UNSUBSCRIBE_TOKEN_SECRET` (nouvelle env var, à ajouter dans Vercel **Production** + **Preview** + **Development**)
- Format : `HMAC-SHA256(secret, email).toString('hex').slice(0, 32)` (32 chars suffisent contre brute force, on n'a pas besoin de timestamping car la suppression est idempotente)
- **Pas d'expiration** — un client peut se désabonner à tout moment, même 5 ans après réception du mail

**Sécurité** : sans le secret, impossible de forger un token valide pour un email donné → on ne peut pas désabonner les autres en devinant juste l'email. **Un email donné = un token unique**, donc si l'attaquant intercepte un email il peut désabonner cette personne précise — risque accepté car (a) ça nécessite intercepter l'email, (b) la conséquence (perdre une newsletter) est faible.

**Templates email marketing à mettre à jour** :
- `lib/email/templates/welcome-newsletter.ts` — ajouter le lien dans le footer
- `lib/email/templates/launch-invitation-v3.ts` — idem

Le helper `buildUnsubscribeLink(email)` dans `lib/email/unsubscribe-link.ts` est appelé au moment du rendu du template.

---

## Architecture — vue d'ensemble

```
[Client paye Stripe]
  ↓
[/checkout/success?session_id=cs_xxx]
  ↓
useOrderLoader → fetch /api/checkout/stripe/session?session_id=...
                     → résout orderId, déclenche fulfillOrder() → after(sendEmail)
                  ↓
                  fetch /api/orders/[orderId]?session_id=cs_xxx
                     → si guest, valide via Stripe API que session.paid && metadata.orderId === orderId
                     → renvoie order
                  ↓
[Page succès affiche le récap]

[Email confirmation envoyé via Brevo]
  → footer : "Mentions légales" (vrai lien), pas de "Suivre commande", pas de "Désabonner"

[Email marketing (newsletter, launch)]
  → footer : "Se désabonner" → /desabonnement?email=...&token=HMAC
                                  → /api/unsubscribe → DELETE FROM newsletter_subscribers
```

---

## Tests à écrire / vérifier

Approche TDD pour les changements à risque (#2, #3, partie token de la page désabo).

### Issue #2 — `/api/orders/[id]` guest mode

Test manuel obligatoire **après deploy preview** :
1. Ouvrir le site preview en mode incognito (pas connecté)
2. Ajouter un produit au panier, checkout, payer avec carte test Stripe
3. Vérifier que `/checkout/success` affiche bien le récap commande (pas "Commande introuvable")
4. Tester avec un autre browser un session_id volé d'un autre user → doit échouer avec 401
5. Tester avec un orderId valide MAIS sans session_id (et pas connecté) → doit échouer 401

Test automatisé si simple à monter dans le harness vitest existant : mock du Stripe SDK, vérifier que la route renvoie 200 quand `session.payment_status === 'paid'` ET `session.metadata.orderId === orderId`.

### Issue #3 — `fulfillOrder` après refacto

- Le test existant `order-cancelled.test.ts` passe toujours
- Run `pnpm test` → all green
- Test manuel : passer commande en preview, vérifier email reçu

### Issue #5 — XSS escape

Test manuel après deploy preview :
- Soumettre formulaire `/contact` avec nom = `<img src=x onerror=alert(1)>` 
- Recevoir l'email admin
- Le nom doit s'afficher littéralement comme texte, pas comme balise HTML

### Issue #7 — page politique cookies

- Vérifier que la page rend correctement (responsive, dark text, fond beige cohérent)
- Vérifier le lien Footer
- Lighthouse SEO score sur la page

### Issue désabonnement

- Test unitaire pour `generateUnsubscribeToken` + `verifyUnsubscribeToken` (round-trip)
- Test manuel : générer un lien, cliquer, confirmer, vérifier suppression DB

---

## Plan de validation pré-merge

1. `pnpm tsc --noEmit` → 0 erreur
2. `pnpm test` → all green
3. Spawn `feature-dev:code-reviewer` pour audit final (pattern token-saver standard)
4. Triage VRAI/FAUX-POSITIF, fix les VRAIS
5. Merge preview → main
6. Test prod : passer une vraie commande guest, vérifier email reçu, vérifier page politique cookies, vérifier OG image en partageant le lien

---

## Issues écartées (faux positifs / nuancés)

- **#1 Cartes cadeaux admin sans auth** : le middleware `lib/supabase/middleware.ts:12-17` protège déjà toutes les `/api/admin/*` non-auth. Démontré en navigation privée par Lyes (`{"error":"Unauthorized"}` retourné). **Fix non urgent**, downgrade en dette technique post-launch (cohérence avec les autres routes).
- **#4 Open redirect login** : le risque est marginal car Next.js `NextResponse.redirect()` valide les URLs. Le fix d'1 ligne (rejeter les `next` ne commençant pas par `/` ou commençant par `//`) sera fait en passant **DANS LE MÊME PR** vu que c'est trivial.
- **#10 Erreur checkout silencieuse** : path `demo` (pas Stripe). Pas critique pour le launch. Post-launch.

---

## Décisions clés

- **Approche C** pour #2 (validation Stripe session_id) plutôt que JWT signé maison → utilise l'existant
- **Approche A** pour #3 (`after()` dans `fulfillOrder`) plutôt que au callsite → centralisé
- **Suppression** des liens cassés #6 plutôt que les corriger avec page placeholder → plus propre
- **Page minimaliste** pour désabonnement plutôt que système préférences complet → scope launch
- **Token HMAC** pour désabonnement plutôt que UUID en DB → pas de table additionnelle, secret partagé suffit

---

## Liste env vars à ajouter sur Vercel

| Var | Production | Preview | Development | Notes |
|-----|------------|---------|-------------|-------|
| `UNSUBSCRIBE_TOKEN_SECRET` | ✅ | ✅ | ✅ | Random 32+ chars hex, ne jamais le révoquer (les liens deviendraient invalides) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | ✅ | `https://lolettshop.com` en prod, URL preview en preview, `http://localhost:3000` en dev — utilisé pour construire les liens emails |

⚠️ Action manuelle Lyes : ajouter ces 2 vars dans Vercel avant deploy.

---

## Estimation temps

| Issue | Temps fix | Temps test |
|-------|-----------|------------|
| #2 commande guest 401 | 25 min | 15 min |
| #3 email perdu after() | 5 min | 5 min |
| #4 open redirect (bonus) | 2 min | 2 min |
| #5 XSS contact escape | 5 min | 5 min |
| #6 liens emails cassés | 15 min (audit complet templates) | 5 min |
| #7 page politique cookies | 25 min | 5 min |
| #8 mentions périmées | 10 min | 5 min |
| #9 OG image | 3 min | 5 min (partage test) |
| Désabo page + token + helpers | 40 min | 10 min |
| **Code review final + fix issues** | 20 min | — |
| **Total** | **~2h30** | **~1h** |

= **~3h30** total, marge de sécurité incluse.

---

## Rollback plan

Si après deploy prod on détecte une régression critique :
1. `git revert <merge_commit>` → push main → Vercel re-déploie le state d'avant
2. Cas spécial : si la régression touche la page paiement, alternative = remettre l'ancienne version de `/api/orders/[id]` qui exige user, on revient sur le bug initial connu (commande guest 401) plutôt qu'une nouvelle régression inconnue.

Le code étant testé en preview avant merge, ce plan est un dernier recours.
