# Plan — Sécurisation Lolett Tier 3

## Context

La boutique Lolett (Next.js 15 App Router + Supabase + Stripe + Mondial Relay) est en branche `preview`, à quelques jours du lancement public chez Lola. Le scan **securityheaders.com → note D** a déclenché un audit complet (Tier 3). L'audit conjoint **code-reviewer + 2 agents Explore** a révélé **3 findings critiques** au-delà des headers HTTP.

### Décisions arbitrées (2026-04-28)

1. **Rate-limit** : **Upstash Redis** (le plus flexible et sécurisé, gratuit jusqu'à 10k req/jour, granularité fine par route)
2. **Mot de passe admin** : passage à **bcrypt** (hash en env, pas de MDP en clair)
3. **Exécution** : **1 sprint = 1 session future** — chaque sprint ci-dessous est auto-suffisant
4. **Rotation des secrets `.env.local` et provisioning Vercel** : Lyes s'en occupe **hors session Claude**

### Ce qui reste hors-session (à faire par Lyes manuellement)

| Action | Quand | Comment |
|---|---|---|
| Générer `ADMIN_TOKEN_SECRET` | Avant Sprint 1 | `openssl rand -hex 32` → ajouter dans Vercel env vars (Production + Preview) |
| Générer `ADMIN_PASSWORD_HASH` | Avant Sprint 1 | Voir Sprint 1 §1.3 — Claude fournira un script Node one-liner |
| Provisionner **Upstash Redis** via Vercel Marketplace | Avant Sprint 2 | Vercel Dashboard → Storage → Add Database → Upstash Redis |
| Rotater `STRIPE_SECRET_KEY` live + `service_role` Supabase + `RESEND_API_KEY` | Avant prod (pas urgent en preview) | Dashboards Stripe / Supabase / Resend |
| Vider `.env.local` (placeholders) | Avant prod | Manuel — ne sera **pas** touché par Claude |

---

# 🚦 Vue d'ensemble des 4 sprints

| Sprint | Durée | Bloque prod ? | Objectif |
|---|---|---|---|
| **S1 — Admin auth + RLS critiques** | 2-3h | 🔴 OUI | bcrypt admin, kill `dev-fallback`, RLS `email_settings`, race condition gift card |
| **S2 — Headers HTTP + rate-limit Upstash** | 2-3h | 🔴 OUI | CSP, X-Frame, nosniff, Referrer, Permissions, rate-limit 3 endpoints, middleware admin |
| **S3 — RGPD + monitoring** | ½ journée | 🟠 OUI (légal) | `/api/account/delete`, `/api/account/export`, `/api/health`, alertes Sentry |
| **S4 — Plan d'incident + backups** | ½ journée | 🟢 NON (post-launch OK) | `docs/INCIDENT.md`, validation PITR, archivage factures |

---

# 🟦 SPRINT 1 — Admin auth + RLS critiques

## Préambule (à lire en début de session)

> Bug critique **C2** : `lib/admin/auth.ts:17` et `app/api/admin/auth/login/route.ts:41` ont un fallback `'dev-fallback'` comme secret HMAC ⇒ n'importe qui peut forger un cookie admin valide.
> Bug critique **C3** : comparaison `password !== adminPassword` (timing attack) + rate-limit `Map` mémoire (inutile en serverless).
> Bug critique **email_settings** : table sans RLS, exposée publiquement.
> Bug haute **gift card race** : 2 requêtes parallèles peuvent débiter une carte 100% deux fois.

## Pré-requis hors session (Lyes)

- [ ] Générer `ADMIN_TOKEN_SECRET` : `openssl rand -hex 32` → ajouter dans Vercel env vars (Production + Preview)
- [ ] Générer le hash bcrypt du mot de passe admin actuel (ou nouveau MDP fort) :
  ```bash
  cd lolett-app && node -e "import('bcryptjs').then(m=>m.default.hash('TON_MDP_ICI',12).then(h=>console.log(h)))"
  ```
  → ajouter dans Vercel env vars : `ADMIN_PASSWORD_HASH=<hash>` (Production + Preview)
- [ ] **Supprimer** `ADMIN_PASSWORD` (ancien, en clair) des Vercel env vars

## §1.1 — Installer bcryptjs

```bash
cd lolett-app && npm install bcryptjs && npm install -D @types/bcryptjs
```

## §1.2 — Kill `dev-fallback`

**Fichier** : [lolett-app/lib/admin/auth.ts:17](lolett-app/lib/admin/auth.ts#L17)
```ts
// AVANT
const secret = process.env.ADMIN_TOKEN_SECRET || 'dev-fallback';

// APRÈS
const secret = process.env.ADMIN_TOKEN_SECRET;
if (!secret) throw new Error('ADMIN_TOKEN_SECRET is required');
```

**Fichier** : [lolett-app/app/api/admin/auth/login/route.ts:41](lolett-app/app/api/admin/auth/login/route.ts#L41)
→ même pattern.

## §1.3 — bcrypt pour le mot de passe admin

**Fichier** : [lolett-app/app/api/admin/auth/login/route.ts:36](lolett-app/app/api/admin/auth/login/route.ts#L36)

```ts
// AVANT
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (body.email !== adminEmail || body.password !== adminPassword) { ... }

// APRÈS
import bcrypt from 'bcryptjs';

const adminEmail = process.env.ADMIN_EMAIL;
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
if (!adminEmail || !adminPasswordHash) {
  return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
}
const emailMatch = body.email === adminEmail;
const passMatch = emailMatch ? await bcrypt.compare(body.password ?? '', adminPasswordHash) : false;
if (!emailMatch || !passMatch) {
  return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
}
```

> Note : `bcrypt.compare` est déjà résistant aux timing attacks (constant-time interne).

## §1.4 — Cookie admin `sameSite: strict`

**Fichier** : [lolett-app/app/api/admin/auth/login/route.ts:59](lolett-app/app/api/admin/auth/login/route.ts#L59)

```ts
// AVANT : sameSite: 'lax'
// APRÈS : sameSite: 'strict'
```

## §1.5 — RLS `email_settings` + fix `newsletter_subscribers`

**Nouvelle migration** : `lolett-app/supabase/migrations/20260428000002_rls_security_hardening.sql`

```sql
-- Fix CRITIQUE : email_settings sans RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON email_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Fix policy newsletter (using(false) bloque même service_role selon contexte)
DROP POLICY IF EXISTS "deny_all" ON newsletter_subscribers;

CREATE POLICY "service_role_full_access" ON newsletter_subscribers
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Permettre insert public pour la souscription newsletter (page front)
CREATE POLICY "public_insert_subscribe" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);
```

**Application** : via MCP Supabase (`mcp__supabase-lola__apply_migration`).

> Lire d'abord la migration `20260424130000_newsletter_subscribers.sql` pour récupérer le vrai nom de la policy à DROP.

## §1.6 — Race condition gift card 100%

**Nouvelle migration** : `lolett-app/supabase/migrations/20260428000003_redeem_gift_card_atomic.sql`

```sql
CREATE OR REPLACE FUNCTION redeem_gift_card_atomic(
  p_code TEXT,
  p_amount NUMERIC,
  p_order_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_card_id UUID;
  v_balance NUMERIC;
BEGIN
  -- Lock la ligne pour éviter race
  SELECT id, balance INTO v_card_id, v_balance
  FROM gift_cards
  WHERE code = p_code
  FOR UPDATE;

  IF v_card_id IS NULL THEN
    RETURN json_build_object('success', false, 'reason', 'not_found');
  END IF;

  IF v_balance < p_amount THEN
    RETURN json_build_object('success', false, 'reason', 'insufficient');
  END IF;

  UPDATE gift_cards SET balance = balance - p_amount WHERE id = v_card_id;

  INSERT INTO gift_card_redemptions (gift_card_id, order_id, amount)
  VALUES (v_card_id, p_order_id, p_amount);

  RETURN json_build_object('success', true, 'card_id', v_card_id);
END;
$$;
```

**Fichier consommateur** : [lolett-app/app/api/checkout/stripe/route.ts:252-266](lolett-app/app/api/checkout/stripe/route.ts#L252-L266)
→ remplacer la séquence d'appels par un seul `admin.rpc('redeem_gift_card_atomic', { p_code, p_amount, p_order_id })`.

## Vérification Sprint 1

- [ ] `tsc --noEmit` clean
- [ ] Login admin avec MDP correct → 200 + cookie
- [ ] Login admin avec MDP faux → 401
- [ ] Forge cookie HMAC avec `'dev-fallback'` → 401 (secret rotaté)
- [ ] `mcp__supabase-lola__list_tables` → `email_settings.rls_enabled = true`
- [ ] Test 2 requêtes parallèles `/api/checkout/stripe` avec gift card 100% → une seule réussit

## Commit suggéré

```
fix(security/S1): admin auth bcrypt + kill dev-fallback + RLS email_settings + atomic gift card

- bcrypt sur ADMIN_PASSWORD_HASH (timing-safe)
- ADMIN_TOKEN_SECRET obligatoire (throw si absent)
- Cookie admin sameSite: strict
- Migration RLS email_settings (CRITIQUE) + fix newsletter_subscribers policy
- RPC redeem_gift_card_atomic (résout race condition checkout 100%)
```

---

# 🟦 SPRINT 2 — Headers HTTP + rate-limit Upstash

## Préambule

> securityheaders.com note **D** — manquent : CSP, X-Frame, nosniff, Referrer-Policy, Permissions-Policy. `x-powered-by: Next.js` exposé.
> 3 endpoints sans rate-limit : `/api/promo/validate`, `/api/gift-cards/checkout`, `/api/admin/auth/login` (Map mémoire = volatile).
> Middleware ne protège pas `/api/admin/*` centralement.

## Pré-requis hors session (Lyes)

- [ ] Provisionner **Upstash Redis** via Vercel Marketplace
  - Vercel Dashboard → Project → Storage → Create Database → Upstash Redis (Free tier)
  - Connecter au projet → variables `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` auto-injectées en Production + Preview

## §2.1 — Installer dépendances

```bash
cd lolett-app && npm install @upstash/redis @upstash/ratelimit
```

## §2.2 — Headers HTTP + masquer x-powered-by

**Fichier** : [lolett-app/next.config.ts](lolett-app/next.config.ts)

Ajouter :
```ts
poweredByHeader: false,

async headers() {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ajax.googleapis.com https://unpkg.com https://widget.mondialrelay.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://qczdwrudgmozyxkdidmr.supabase.co https://*.tile.openstreetmap.org",
    "connect-src 'self' https://qczdwrudgmozyxkdidmr.supabase.co https://*.ingest.sentry.io https://api-adresse.data.gouv.fr https://widget.mondialrelay.com",
    "frame-src 'self' https://js.stripe.com https://www.googletagmanager.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return [{
    source: '/:path*',
    headers: [
      // Phase 1 : Report-Only (observe sans bloquer)
      { key: 'Content-Security-Policy-Report-Only', value: csp },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ],
  }];
},
```

> **Stratégie 2 phases** :
> - **Sprint 2** : déployer en `Content-Security-Policy-Report-Only` (n'empêche rien, observe)
> - **48h plus tard** (toujours en preview) : si DevTools console est clean → basculer en `Content-Security-Policy` strict (engagement Sprint 4 ou hors-sprint).

## §2.3 — Rate-limit Upstash

**Nouveau fichier** : `lolett-app/lib/security/ratelimit.ts`

```ts
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = Redis.fromEnv();

export const promoLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'),
  prefix: 'rl:promo',
});

export const giftCardLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix: 'rl:gift',
});

export const adminLoginLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  prefix: 'rl:admin',
});

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';
}
```

**Wiring** :
- [lolett-app/app/api/promo/validate/route.ts](lolett-app/app/api/promo/validate/route.ts) — au début du POST, `await promoLimit.limit(ip)`, retour 429 si bloqué
- [lolett-app/app/api/gift-cards/checkout/route.ts](lolett-app/app/api/gift-cards/checkout/route.ts) — idem `giftCardLimit`
- [lolett-app/app/api/admin/auth/login/route.ts](lolett-app/app/api/admin/auth/login/route.ts) — remplacer la `Map` mémoire par `adminLoginLimit`

## §2.4 — Middleware admin centralisé

**Fichier** : [lolett-app/lib/supabase/middleware.ts:42-43](lolett-app/lib/supabase/middleware.ts#L42-L43)

Ajouter dans `updateSession` :
```ts
if (request.nextUrl.pathname.startsWith('/api/admin') &&
    !request.nextUrl.pathname.startsWith('/api/admin/auth/login')) {
  const adminAuth = await checkAdminCookieFromRequest(request);
  if (!adminAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

## §2.5 — Cookie `lolett-consent` flag `secure`

Localiser via `grep -rn "lolett-consent" lolett-app/` puis ajouter `secure: process.env.NODE_ENV === 'production'`.

## Vérification Sprint 2

- [ ] securityheaders.com → **A-** ou **A**
- [ ] DevTools Console (preview) : aucune violation CSP critique
- [ ] 21e requête `/api/promo/validate` depuis même IP en 15min → 429
- [ ] 6e tentative login admin → 429
- [ ] `curl /api/admin/orders` sans cookie → 401 (middleware central)
- [ ] Tests E2E 4 scénarios checkout (FR Domicile, FR MR, ES Domicile, BE MR) → tous OK

## Commit suggéré

```
feat(security/S2): headers HTTP + CSP report-only + rate-limit Upstash

- next.config: headers() avec CSP-Report-Only, X-Frame, nosniff, Referrer, Permissions
- poweredByHeader: false (masque Next.js)
- Upstash Redis ratelimit sur /api/promo/validate, /api/gift-cards/checkout, /api/admin/auth/login
- Middleware Supabase: guard centralisé /api/admin/*
- Cookie lolett-consent: secure flag en prod
```

---

# 🟦 SPRINT 3 — RGPD + monitoring

## Préambule

> Manques RGPD : pas de droit à l'oubli (Art. 17), pas de portabilité (Art. 20). Risque amende CNIL.
> Manques observabilité : pas de health check, alertes Sentry non configurées.
> Tables `gift_cards` / `gift_card_redemptions` peut-être hors migrations versionnées.

## §3.1 — Vérifier état des tables `gift_cards`

Avant de coder : via MCP Supabase :
```
mcp__supabase-lola__list_tables → vérifier gift_cards / gift_card_redemptions existent
mcp__supabase-lola__list_migrations → vérifier si elles sont versionnées
```
Si elles existent en DB mais pas dans `migrations/` → créer une migration "init catch-up" (`pg_dump --schema-only -t gift_cards -t gift_card_redemptions`).

## §3.2 — Droit à l'oubli (Art. 17)

**Nouveau fichier** : `lolett-app/app/api/account/delete/route.ts`

Logique :
1. Auth Supabase requise (récupérer `userId`)
2. Confirmation textuelle requise dans le body (`confirm: "SUPPRIMER"`)
3. Cascade :
   - DELETE `cart_items` WHERE user_id
   - DELETE `addresses` WHERE user_id
   - DELETE `loyalty_points` (ou rows correspondantes)
   - UPDATE `orders` SET `customer = anonymized JSON` WHERE user_id (garder pour compta)
   - DELETE `profiles` WHERE id = user_id
   - `admin.auth.admin.deleteUser(userId)`
4. Log dans une table `account_deletions` pour traçabilité (timestamp + email anonymisé)

**UI** : ajouter un bouton dans `lolett-app/app/compte/parametres/page.tsx` (modale de confirmation 2 étapes).

## §3.3 — Portabilité (Art. 20)

**Nouveau fichier** : `lolett-app/app/api/account/export/route.ts` (GET authentifié)

Retourne JSON :
```json
{
  "exportedAt": "...",
  "profile": {...},
  "addresses": [...],
  "orders": [...],
  "loyaltyPoints": ...
}
```
Avec header `Content-Disposition: attachment; filename="lolett-export-{userId}.json"`.

**UI** : bouton "Télécharger mes données" dans `app/compte/parametres/page.tsx`.

## §3.4 — Health check

**Nouveau fichier** : `lolett-app/app/api/health/route.ts`

```ts
export async function GET() {
  const checks = await Promise.allSettled([
    fetch('https://api.stripe.com/v1', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      signal: AbortSignal.timeout(5000),
    }),
    createAdminClient().from('products').select('id').limit(1),
    fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    }),
  ]);
  const status = {
    stripe: checks[0].status === 'fulfilled' ? 'ok' : 'down',
    supabase: checks[1].status === 'fulfilled' ? 'ok' : 'down',
    resend: checks[2].status === 'fulfilled' ? 'ok' : 'down',
  };
  const allOk = Object.values(status).every((s) => s === 'ok');
  return NextResponse.json(status, { status: allOk ? 200 : 503 });
}
```

## §3.5 — Alertes Sentry

Sentry est déjà installé ([sentry.server.config.ts](lolett-app/sentry.server.config.ts)). À configurer **dans le dashboard Sentry** (hors code) :
- Alert rule "Webhook Stripe error rate > 1%" → email Lola
- Alert rule "Email send failure" → email Lola
- Alert rule "Order creation failure" → email Lola

## Vérification Sprint 3

- [ ] Compte test : créer → exporter données → supprimer → vérifier purge en DB
- [ ] `GET /api/health` → 200 avec `{ stripe: "ok", supabase: "ok", resend: "ok" }`
- [ ] Sentry dashboard : 3 alertes actives

## Commit suggéré

```
feat(security/S3): RGPD compliance + monitoring

- /api/account/delete: droit à l'oubli RGPD Art. 17 (cascade + anonymisation orders)
- /api/account/export: portabilité RGPD Art. 20
- /api/health: check Stripe + Supabase + Resend
- UI compte: boutons supprimer/exporter données
```

---

# 🟦 SPRINT 4 — Plan d'incident + backups

## Préambule

> Pas de runbook si Stripe/Supabase/email tombent. PITR Supabase non vérifié. Factures PDF dans bucket Supabase Storage sans archivage externe.

## §4.1 — `docs/INCIDENT.md`

Créer le fichier avec 5 runbooks :

1. **Webhook Stripe down**
   - Symptômes : commandes payées sans confirmation
   - Action : Stripe Dashboard → Developers → Events → rejouer manuellement les events `checkout.session.completed`
   - Prévention : alerte Sentry §3.5

2. **Supabase down**
   - Activer page maintenance Vercel (Deployment Protection ou edge config flag)
   - Communiquer via réseaux sociaux Lola

3. **Fuite données**
   - Notification CNIL <72h (formulaire en ligne)
   - Communication clients impactés
   - Rotation immédiate de tous les secrets
   - Post-mortem dans `docs/POST_MORTEMS/`

4. **Fraude carte / chargeback**
   - Stripe Dashboard → Disputes → fournir preuves (commande, livraison, signature)
   - Banir l'email/IP via une nouvelle table `banned_emails`
   - Process documenté dans `docs/FRAUD.md`

5. **Email provider down (Resend)**
   - Le code a déjà un fallback nodemailer (Gmail) — vérifier qu'il fonctionne
   - Communiquer aux clients que les confirmations peuvent arriver en retard

## §4.2 — Validation PITR Supabase

Action **hors session** (Lyes) : vérifier dans Supabase Dashboard → Settings → Database → Point-in-Time Recovery est **enabled** (plan Pro requis).

Test : créer une branche Supabase → restaurer un point dans le passé → vérifier données.

## §4.3 — Archivage factures externe

Cron mensuel pour copier le bucket `invoices` vers **Vercel Blob** ou un S3 externe (obligation comptable 10 ans).

**Nouveau fichier** : `lolett-app/app/api/cron/backup-invoices/route.ts`

Cron Vercel dans `vercel.json` :
```json
{
  "crons": [{ "path": "/api/cron/backup-invoices", "schedule": "0 3 1 * *" }]
}
```

(1er du mois à 3h du matin)

## §4.4 — Bascule CSP Report-Only → strict

Après 48h d'observation Sentry/console DevTools sans violation critique :

[next.config.ts](lolett-app/next.config.ts) :
```ts
// AVANT
{ key: 'Content-Security-Policy-Report-Only', value: csp }
// APRÈS
{ key: 'Content-Security-Policy', value: csp }
```

## Vérification Sprint 4

- [ ] `docs/INCIDENT.md` couvre les 5 scénarios
- [ ] PITR Supabase validé manuellement
- [ ] Cron backup-invoices testé en preview (trigger manuel)
- [ ] CSP en mode strict → tests E2E 4 scénarios checkout passent

## Commit suggéré

```
feat(security/S4): incident runbooks + invoice backup + CSP strict

- docs/INCIDENT.md: 5 runbooks (Stripe/Supabase/data leak/fraud/email)
- /api/cron/backup-invoices: archivage mensuel Vercel Blob
- CSP: bascule Report-Only → strict (48h sans violation observée)
```

---

# 📌 Workflow de reprise (chaque sprint future)

À chaque session future :
1. `/token-saver début` → reprend SESSION.md à jour
2. Lyes annonce le sprint ciblé : *"on attaque Sprint 1"*
3. Claude lit la section correspondante de ce plan
4. Vérifier les pré-requis hors session (env vars, packages installés)
5. Implémenter, tester, commit selon le template fourni
6. `/token-saver fin` → SESSION.md mis à jour avec progress + push

# 📌 Blockers connus (héritage)

- Webhook GitHub→Vercel cassé : déploiements via CLI uniquement
- Compte MR `BDTEST  ` toujours en démo (orthogonal à la sécurité)
- Branche `preview` à merger vers `main` avant prod
