# Plan d'incident — Lolett

> **Pour qui** : Lola (et toute personne en charge de la boutique en cas d'urgence).
> **Quand l'utiliser** : quand quelque chose ne fonctionne plus côté boutique.
> **Comment** : trouver le runbook qui correspond au symptôme, suivre les étapes dans l'ordre.

## Liens utiles à avoir sous la main

- **Stripe Dashboard** : https://dashboard.stripe.com/
- **Supabase Dashboard** : https://supabase.com/dashboard/project/qczdwrudgmozyxkdidmr
- **Vercel Dashboard** : https://vercel.com/lolett64s-projects/lolett
- **Sentry** : https://sentry.io/organizations/lolett/projects/lolett-app/
- **Resend Dashboard** : https://resend.com/emails
- **CNIL — déclaration de fuite** : https://notifications.cnil.fr/notifications/index

---

## Runbook 1 — Webhook Stripe down

**Symptômes possibles :**
- Une commande apparaît payée dans Stripe mais aucun email de confirmation n'a été reçu par le client.
- La commande n'apparaît pas dans la liste des commandes admin (table `orders` côté Supabase).
- Sentry signale des erreurs sur `app/api/webhooks/stripe/route.ts`.

**Ce qu'il faut savoir avant d'agir :**
- Le webhook Stripe ne traite qu'**un seul type d'événement** : `checkout.session.completed`.
- Le code est **idempotent** : on peut rejouer le même événement sans créer de doublon (déduplication via `stripe_session_id` pour les commandes et `payment_id` pour les cartes cadeaux).
- → Donc rejouer manuellement un événement est **safe**.

**Action — rejouer les événements manqués :**
1. Aller sur Stripe Dashboard → Developers → Events
2. Filtrer par type : `checkout.session.completed`
3. Identifier les événements où la colonne "Webhook delivery" est en erreur (rouge)
4. Cliquer sur chaque événement → bouton "Resend" (en haut à droite)
5. Vérifier dans Supabase que la commande est bien apparue dans `orders`

**Si le webhook lui-même est cassé (toutes les requêtes 500) :**
1. Vérifier les logs Vercel : Dashboard → Project → Functions → `/api/webhooks/stripe`
2. Vérifier que les variables d'environnement Stripe sont à jour : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
3. Si rotation de la clé Stripe : il faut **mettre à jour le webhook secret** dans Stripe Dashboard → Developers → Webhooks → endpoint Lolett → "Reveal signing secret"

**Prévention :** alerte Sentry "Webhook Stripe error rate > 1%" → email à Lola (à configurer dans Sentry, voir `sentry-setup.md`).

---

## Runbook 2 — Supabase down

**Symptômes possibles :**
- L'endpoint `https://lolettshop.com/api/health` retourne 503 (au lieu de 200).
- Le checkout est cassé : message d'erreur au moment de payer.
- Le login admin renvoie un timeout.
- Les pages produits affichent un état vide.

**Vérification rapide :**
1. Ouvrir https://status.supabase.com/ — y a-t-il un incident en cours ?
2. Tester directement le dashboard Supabase : https://supabase.com/dashboard

**Action — activer le mode maintenance :**
1. Aller sur Vercel Dashboard → Project → Settings → **Deployment Protection**
2. Activer "Vercel Authentication" temporairement (toutes les pages deviennent inaccessibles au public)
3. Communiquer sur Instagram Lola : *"Notre boutique est temporairement indisponible suite à un incident technique. Retour prévu sous peu, merci de votre patience."*

**Récupération :**
- Si Supabase remonte sans perte de données → désactiver le mode maintenance, vérifier le checkout end-to-end (cf. tests E2E).
- Si données perdues → activer le **PITR (Point-In-Time Recovery)** Supabase :
  1. Dashboard Supabase → Settings → Database → Point in Time Recovery
  2. Choisir le timestamp avant l'incident
  3. ⚠️ Le PITR doit être activé en amont (plan Pro requis, ~25$/mois) — voir `backup-setup.md`.

**Plan B si pas de PITR :**
- Récupérer le dernier snapshot quotidien depuis Vercel Blob (`/api/cron/backup` tourne tous les jours à 3h UTC).
- Format : JSON avec toutes les tables principales. Restauration manuelle = rejouer chaque INSERT.

---

## Runbook 3 — Fuite de données (PII clients exposées)

> Une **fuite de données personnelles** = des informations clients (email, adresse, données de commande) ont été accessibles à des personnes non autorisées.

**Obligations légales — TIMELINE STRICTE :**
- **Sous 72h** : déclaration à la CNIL via https://notifications.cnil.fr/notifications/index
- **Dès que possible** : notification individuelle des clients impactés (email)
- À conserver : trace écrite de tous les actes de remédiation (post-mortem).

**Actions immédiates (dans l'ordre) :**

### 1. Stopper la fuite
1. Si la fuite vient d'une faille code identifiée → revert le commit fautif sur Vercel (Dashboard → Deployments → "Promote to Production" sur la dernière version saine).
2. Si la fuite vient d'un secret compromis → rotation immédiate de **tous** les secrets :
   - `STRIPE_SECRET_KEY` (Stripe Dashboard → Developers → API keys → Reveal/Roll)
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase Dashboard → Settings → API → Reset service_role key)
   - `RESEND_API_KEY` (Resend Dashboard → API Keys → revoke + create new)
   - `ADMIN_TOKEN_SECRET` (régénérer : `openssl rand -hex 32`) → **invalide tous les cookies admin existants** (= force-logout tous les admins)
   - `ADMIN_PASSWORD_HASH` (regénérer un nouveau MDP fort + bcrypt)
   - `CRON_SECRET` (régénérer)
3. Mettre à jour ces secrets dans Vercel → Settings → Environment Variables (Production + Preview).
4. Redéployer (`vercel deploy --prod` ou Dashboard → Redeploy).

### 2. Estimer l'ampleur
- Combien de clients potentiellement impactés ?
- Quelles données ? (email seul / email + adresse / paiement ?)
- Sur quelle période ?
- Garder les preuves (logs Vercel, logs Supabase, Sentry).

### 3. Notifier
- **CNIL** : formulaire en ligne, joindre un dossier détaillé.
- **Clients impactés** : email type *"Nous vous informons qu'une faille a permis l'accès à [X données]. Nous avons immédiatement [actions]. Aucune donnée bancaire n'a été compromise (Stripe gère les paiements de façon isolée). Pour toute question : contact@lolettshop.com"*.

### 4. Post-mortem
Créer un fichier `lolett-app/docs/post-mortems/{YYYY-MM-DD}-{slug}.md` avec :
- Timeline détaillée (qu'est-ce qui s'est passé, à quelle heure)
- Root cause (cause racine technique)
- Impact (combien de clients, quelles données)
- Actions correctives (qu'est-ce qu'on change pour éviter la récidive)

---

## Runbook 4 — Fraude / chargeback Stripe

**Symptômes possibles :**
- Email Stripe : *"A new dispute was opened on your payment"*.
- Notification Stripe Dashboard.
- Demande de remboursement suspecte d'un client.

**Actions :**

### 1. Identifier la commande
- Stripe Dashboard → Disputes → cliquer sur la dispute
- Récupérer le `payment_intent_id` ou le `customer.email`
- Retrouver la commande dans Supabase :

```sql
-- L'email est stocké en JSONB dans la colonne customer
SELECT * FROM orders
WHERE customer->>'email' = 'email_du_client@example.com'
ORDER BY created_at DESC;
```

### 2. Fournir les preuves à Stripe
Stripe Dashboard → Disputes → cette dispute → "Submit evidence". Joindre :
- Capture d'écran de la commande Lolett (admin → commandes)
- Tracking Mondial Relay si livraison → preuve de dépôt + signature de retrait
- Copie de la facture PDF (récupérable depuis le bucket Supabase `invoices/{order_id}.pdf` ou la sauvegarde Vercel Blob)
- Preuve de communication avec le client (emails de confirmation, suivi)
- Conditions générales de vente acceptées au checkout

**Délai Stripe** : généralement 7 jours pour soumettre les preuves.

### 3. Si fraude avérée et récurrente
> Aujourd'hui Lolett n'a **pas encore** de table pour bannir les emails frauduleux.
- **TODO post-launch si récurrent** : créer une migration pour une table `banned_emails` (colonnes : `email`, `reason`, `banned_at`, `banned_by`) + check au checkout dans `app/api/checkout/stripe/route.ts`.
- En attendant : noter manuellement l'email/IP suspecte et refuser manuellement les commandes correspondantes côté admin.

### 4. Documenter
- Si plusieurs cas du même profil → créer `lolett-app/docs/operations/FRAUD.md` avec le pattern observé.

---

## Runbook 5 — Email provider down (Resend)

**Symptômes possibles :**
- Aucun email de confirmation reçu après une commande.
- Sentry signale des erreurs sur `lib/email-provider.ts` ou `sendHtmlEmail`.
- L'endpoint `/api/health` indique `resend: down`.

**Ce qu'il faut savoir :**
- Le code a déjà un **fallback automatique** : `lolett-app/lib/email-provider.ts` essaie d'abord SMTP Gmail, puis bascule sur Resend si Gmail échoue.
- → Si **Resend seul tombe**, Gmail prend le relais sans intervention.
- → Si **les deux tombent**, aucun email ne part, mais **les commandes sont quand même créées** dans Supabase.

**Vérification rapide :**
1. Ouvrir https://status.resend.com/
2. Vérifier les logs Sentry : filtrer par `email-provider`
3. Tester manuellement : aller sur https://lolettshop.com/api/health → vérifier `{ resend: "ok" }` et `{ smtp: "ok" }` (selon ce que retourne le health check)

**Action — si les deux providers tombent :**
1. Communiquer sur Instagram Lola : *"Si vous venez de passer commande et n'avez pas reçu de confirmation par email, pas de panique : votre commande est bien enregistrée. Nous vous enverrons la confirmation manuellement dès que possible."*
2. Récupérer la liste des commandes du jour dans Supabase :
```sql
SELECT id, customer->>'email' AS email, customer->>'firstName' AS firstname, total
FROM orders
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```
3. Renvoyer les confirmations manuellement une fois le service rétabli (Resend Dashboard → Compose).

**Action — si seul Resend est down et le fallback Gmail fonctionne :**
- Rien à faire en urgence, les emails partent par Gmail.
- Surveiller Sentry, attendre que Resend remonte.

**Prévention :** alerte Sentry "Email send failure" → email à Lola.

---

## Annexe — Rotation complète des secrets (procédure)

Pour le runbook 3 (fuite) ou en routine pré-production :

| Secret | Où le générer | Où le mettre à jour |
|---|---|---|
| `ADMIN_TOKEN_SECRET` | `openssl rand -hex 32` | Vercel → Production + Preview |
| `ADMIN_PASSWORD_HASH` | bcrypt (cost 12) du nouveau MDP | Vercel → Production + Preview |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | Vercel + mettre à jour `STRIPE_WEBHOOK_SECRET` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Reset | Vercel |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | Vercel |
| `CRON_SECRET` | `openssl rand -hex 32` | Vercel |
| `UPSTASH_REDIS_KV_REST_API_TOKEN` | Upstash Console → reset | Vercel (auto-injecté via Marketplace) |

**Après rotation :** redéployer (`vercel --prod`), tester `/api/health`, faire un commande test pour vérifier le checkout end-to-end.
