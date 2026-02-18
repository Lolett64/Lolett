# LOLETT — Suivi du projet

> Ce fichier est mis à jour à chaque session pour garder le fil du développement.

---

## Stack
- **Front** : Next.js 16 (App Router) / React 19 / TypeScript strict / Tailwind 4
- **State** : Zustand
- **UI** : Radix UI + shadcn/ui
- **BDD** : Supabase (PostgreSQL)
- **Email** : Resend
- **Paiement** : Stripe Checkout + PayPal SDK (à connecter)
- **Compte Supabase** : lyestriki@yahoo.fr

---

## Historique des sessions

### Session 1 — Initial commit
- Création du projet Next.js complet
- Front-end e-commerce : pages shop, produit, panier, checkout, favoris
- Données mock statiques dans `data/`

### Session 2 — Backend + Admin
- Backend Supabase codé (adapters, repositories, clients)
- Interface admin complète : dashboard, CRUD produits, commandes, looks, catégories
- Système d'auth admin (cookie)
- Routes API protégées (`/api/admin/`)
- Migration SQL `001_initial_schema.sql`
- Emails transactionnels Resend
- Toggle `USE_MOCK_DATA` pour basculer mock/Supabase

### Session 3 — Polish frontend
- Landing page améliorée : scroll-reveal, marquee, grain texture, trust bar
- Page `/notre-histoire`
- Animations cinématiques CSS

### Session 4 — 2026-02-17/18
- **Fix formulaires admin** : ProductForm et LookForm recodés from scratch (inline styles) car le CSS global Tailwind cassait les composants Card de shadcn
- Pages `/admin/products/new` et `/admin/looks/new` centrées
- **Seed SQL** : fichier `002_seed_data.sql` prêt
- **Activation Supabase** : TERMINÉ ✅
  - Projet "Proejt Laurett" (`utgwrfqnaoggckfruzzo`) sur compte Yahoo
  - Schéma + seed appliqués (12 catégories, 13 produits, 3 looks)
  - `USE_MOCK_DATA=false`
  - **Migration front-end** : toutes les pages migrées de `@/data/*` (mock) vers `@/lib/adapters` (Supabase)
  - Hostname Supabase ajouté dans `next.config.ts` pour `next/image`
  - API `/api/products/by-ids` créée pour la page favoris (client component)
- **Fix StoryQuote** : composant recodé avec inline styles (même problème CSS global)

---

## État actuel

### Ce qui est FAIT ✅
- Front-end complet (toutes les pages)
- Landing page premium (animations, scroll-reveal, marquee)
- Page `/notre-histoire`
- Backend Supabase codé (adapters, repositories)
- Interface admin complète (dashboard, CRUD)
- Auth admin (login/cookie)
- Routes API admin protégées
- Migration SQL schéma (`001_initial_schema.sql`)
- Migration SQL seed (`002_seed_data.sql`)
- Formulaires admin (ProductForm, LookForm) fonctionnels
- Toggle mock/Supabase via env

### Ce qui reste À FAIRE 🔲
- [x] Créer projet Supabase (compte Yahoo)
- [x] Appliquer schéma SQL + seed
- [x] Mettre à jour clés `.env.local`
- [x] Migrer front-end vers Supabase
- [x] Tester site complet avec données Supabase
- [ ] Connecter Stripe Checkout
- [ ] Connecter PayPal SDK
- [ ] Comptes clients (V1.1)
- [ ] Déploiement Vercel

---

## Fichiers clés
| Fichier | Rôle |
|---------|------|
| `lib/adapters/supabase.ts` | Repositories Supabase (Product, Look, Category, Order) |
| `lib/adapters/index.ts` | Toggle mock/Supabase via `USE_MOCK_DATA` |
| `lib/adapters/types.ts` | Interfaces Repository |
| `lib/supabase/server.ts` | Client Supabase côté serveur |
| `lib/supabase/client.ts` | Client Supabase côté client |
| `lib/supabase/admin.ts` | Client Supabase service_role |
| `supabase/migrations/001_initial_schema.sql` | Schéma BDD |
| `supabase/migrations/002_seed_data.sql` | Données initiales |
| `.env.local` | Clés Supabase, Resend, config |
| `features/checkout/hooks/useCheckout.ts` | Checkout (Stripe/PayPal à connecter) |

## Décisions validées
- Livraison : FR uniquement, 5.90€, gratuit >= 100€
- Paiement : Stripe + PayPal (après activation Supabase)
- Comptes clients : reporté V1.1
