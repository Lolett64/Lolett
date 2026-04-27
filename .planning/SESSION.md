# Session State — 2026-04-27 20:00

## Branch
preview (HEAD = 5488832)

## Completed This Session
- **Phase 1 livrée et pushée (commit 21c02fb)** : admin Mon Histoire nettoyé, MaterialsManager UI admin, campagne 110 emails (table pre_launch_contacts + UI + 4 routes API + template launch-invitation-v3)
- **Phase 2A livrée et pushée (commit 05107c2)** : cartes cadeaux complètes via 3 agents en parallèle (worktrees) — backend achat (Stripe + 2 emails) + redemption au checkout + UI admin + pages publiques /cartes-cadeaux × 3 + sidebar admin
- **Migrations Supabase appliquées** : `pre_launch_contacts`, `gift_cards`, `gift_card_redemptions`
- **Phase 3 — migration domaine `lolettshop.com`** :
  - Code (commit 582aac4) : 24 fallbacks URL + textes CGV/mentions/cartes-cadeaux + emails contact `hello@lolett.com → contact.lolett@gmail.com` + DEFAULT_FROM email-provider
  - Code (commit 402543e) : rename env vars `BREVO_SMTP_*` → `SMTP_*`
  - Code (commit 5488832) : `vercel.json` redirect www → apex (mais override par Vercel domain config plus tard)
- **DNS Namecheap configuré** : A `@` → 216.198.79.1, CNAME `www` → `b9dfaeed29992cac.vercel-dns-017.com`
- **Vercel Domains** : `lolettshop.com` (canonical) + `www.lolettshop.com` (308 → apex), Valid Configuration
- **Deploys** : preview + production sur lolettshop.com
- **Vercel env vars (production + preview)** : `NEXT_PUBLIC_BASE_URL`, `CHECKOUT_REDIRECT_URL`, `SMTP_HOST/PORT/USER/PASSWORD` (Gmail). Cleanup de `NEXT_PUBLIC_SITE_URL` orpheline.
- **Stripe webhook live** : URL configurée sur `https://lolettshop.com/api/webhooks/stripe`, event `checkout.session.completed`
- **Supabase Auth** (via Management API) : Site URL = `https://lolettshop.com` + 7 redirect URLs (apex, www, vercel.app legacy)
- **Vercel Bypass Secret créé** par Lyes (Settings → Deployment Protection → Protection Bypass for Automation)

## Next Task — Reprendre les tests dans nouvelle session

⚠️ **Erreur en fin de session précédente** : `vercel env rm STRIPE_SECRET_KEY preview` a supprimé l'entry entière (Production aussi) car la var était scopée Preview+Production. **Les 3 vars Stripe sont à reposer.**

### Step 1 — Lyes pose 6 vars Stripe dans Vercel dashboard

Settings → Environment Variables → Add New, **6 fois** (penser à décocher l'environnement non concerné) :

| Key | Value | Env |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (live) | Production |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Preview |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Preview |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (test) | Preview |

Cocher "Sensitive" pour `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`.

### Step 2 — Lyes crée le webhook TEST Stripe

Si pas déjà fait : https://dashboard.stripe.com/test/webhooks → Add endpoint :
- URL :
  ```
  https://lolett-git-preview-lolett64s-projects.vercel.app/api/webhooks/stripe?x-vercel-protection-bypass=BYPASS_SECRET&x-vercel-set-bypass-cookie=samesitenone
  ```
  (Remplacer `BYPASS_SECRET` par le secret Vercel créé en fin de session — récupérable dans Settings → Deployment Protection → Protection Bypass for Automation)
- Event : `checkout.session.completed`
- Récupérer le `whsec_test_...` → mettre dans Vercel Preview (étape 1 ligne 5)

### Step 3 — Redeploy preview + production

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett && vercel deploy --prod --yes
cd /Users/trikilyes/Desktop/Privé/Lorett && vercel deploy --yes
```

### Step 4 — Tester en preview avec carte test

1. Ouvrir une fois (pour poser le cookie bypass) :
   ```
   https://lolett-git-preview-lolett64s-projects.vercel.app?x-vercel-protection-bypass=BYPASS_SECRET&x-vercel-set-bypass-cookie=samesitenone
   ```
2. Naviguer librement (cookie bypass actif). Carte test : `4242 4242 4242 4242` / `12/30` / CVC `123` / CP `75001`
3. Tester aux montants voulus (multiples tests, gratuits)

### Step 5 — Tests end-to-end checklist

- [ ] **Site basique** sur https://lolettshop.com : home charge, footer = `contact.lolett@gmail.com`, /cgv et /mentions-legales mentionnent lolettshop.com, /cartes-cadeaux liste 4 montants, www → apex redirect 308 OK
- [ ] **Email contact** : envoi via /contact → reçu sur Gmail Lola, expéditeur = `LOLETT <contact.lolett@gmail.com>`
- [ ] **Commande standard preview** (carte 4242) : ajout panier → checkout → paiement → email confirmation Gmail → commande visible /admin/orders → Webhook 200 OK dans Stripe TEST dashboard
- [ ] **Carte cadeau preview** : achat 50€ avec 4242 → email destinataire reçu → utilisation au checkout d'une autre commande → balance décrémentée → /admin/gift-cards visible
- [ ] **Reset password** sur /connexion : email reçu → lien fonctionne → arrive sur /reset-password
- [ ] **Test final live** sur lolettshop.com : 1 commande à 0,50€ avec vraie CB → refund après pour valider que la prod marche aussi

## Blockers
- Stripe vars (3 live + 3 test) à reposer côté Lyes (5-10 min)
- DNS lolettshop.com propagé ✓, HTTPS ✓, redirect canonique ✓ — base infra OK

## Key Context
- **Domaine canonique** : `lolettshop.com` (sans www). `www.` redirige en 308.
- **Email transactionnel** : Gmail SMTP via `contact.lolett@gmail.com` + mot de passe d'application Gmail (16 chars, déjà posé dans Vercel `SMTP_PASSWORD`). Limite 500 emails/jour, suffisant pour ouverture.
- **Vercel CLI v52.0.0** (updated). Token Supabase Management API : `sbp_061733a493116363fbd6bc123ed01fc9fc5a5499` (dans .env.local).
- **Project Vercel correct** : `lolett` (PAS `lolett-app` qui est un projet vide). `cd lolett-app && vercel link --project lolett --yes` si besoin de re-link.
- **Bypass Vercel** : pour les preview deploys protégés par Vercel SSO, utiliser query param `x-vercel-protection-bypass=SECRET&x-vercel-set-bypass-cookie=samesitenone` sur l'URL.
- **Leçon apprise** : ne plus jamais faire `vercel env rm NAME env` sur une var multi-env (supprime tout). Toujours `vercel env pull` + readd.
