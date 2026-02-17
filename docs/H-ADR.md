# Document H — ADR (Architecture Decision Records)

---

## Objectif du document

Documenter les décisions techniques structurantes du projet LOLETT, leurs raisons, alternatives envisagées et conséquences. Servir de référence pour toute évolution future.

## Contenu

Décisions prises (stack, paiement, données, livraison, emails), impacts techniques, fichiers à créer.

## Hypothèses

- Les décisions sont prises pour le MVP et doivent supporter l'évolution V2 sans refonte.
- Le code existant dans `lolett-app/` est la base de travail.

## Points à valider

- Voir les questions ouvertes dans chaque ADR.

---

## ADR-001 — Stack front-end

### Contexte

Site e-commerce sur mesure, responsive, optimisé SEO, avec rendu serveur nécessaire pour les fiches produit et les pages catégories.

### Décision

**Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS 4**

### Alternatives envisagées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| Next.js App Router | SSR/SSG, SEO natif, Server Components, écosystème riche | Complexité App Router | **Choisi** |
| Remix | SSR, forms natifs, loader/action | Écosystème plus petit, moins de composants UI | Rejeté |
| Astro + React | Ultra-rapide, islands architecture | Moins mature pour e-commerce dynamique | Rejeté |
| Shopify + thème custom | Clé en main, paiement intégré | Pas de contrôle total, abonnement mensuel | Hors cahier des charges |

### Conséquences

- Hébergement naturel sur Vercel (optimisé pour Next.js).
- Server Components par défaut → moins de JS côté client.
- App Router impose une structure de dossiers spécifique (`app/`).
- TypeScript strict = plus de rigueur à l'écriture, moins de bugs en prod.

### Fichiers concernés

- `lolett-app/` (tout le projet)
- `tsconfig.json` (strict: true)
- `next.config.ts`

---

## ADR-002 — Gestion d'état client

### Contexte

Le panier et les favoris doivent persister entre les sessions (refresh, retour ultérieur) sans compte utilisateur en MVP.

### Décision

**Zustand 5 avec middleware `persist` (localStorage)**

### Alternatives envisagées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| Zustand + persist | Simple, léger (1.5kb), persist natif, compatible Server Components | Pas de sync multi-onglet natif | **Choisi** |
| React Context | Natif React, pas de dépendance | Pas de persist, re-render cascade | Rejeté |
| Redux Toolkit | Écosystème riche, DevTools | Overkill pour 2 stores simples | Rejeté |
| Jotai | Atomique, léger | Moins de structure pour persist | Rejeté |

### Conséquences

- Stores dans `features/[feature]/store.ts`.
- `'use client'` requis sur les composants qui lisent les stores.
- localStorage limité à ~5MB (largement suffisant pour panier + favoris).
- **V2** : si comptes utilisateurs, migrer les données localStorage vers la BDD au login.

### Fichiers concernés

- `features/cart/store.ts` (existant)
- `features/favorites/store.ts` (existant)

---

## ADR-003 — Paiement : Stripe Checkout + PayPal

### Contexte

Le cahier des charges impose carte bancaire, Apple Pay et PayPal. Le paiement doit être sécurisé, conforme SCA/3DS, et le plus simple possible à intégrer en MVP.

### Décision

**Stripe Checkout (hosted) pour CB + Apple Pay, PayPal Checkout SDK (bouton) pour PayPal.**

### Alternatives envisagées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| Stripe Checkout (hosted) | Clé en main, SCA/3DS natif, Apple Pay intégré, hébergé par Stripe | Moins de personnalisation UI | **Choisi** |
| Stripe Elements (embedded) | UI personnalisable | Complexité PCI DSS, plus de code | Rejeté pour MVP |
| PayPal Checkout SDK | Bouton standard reconnu, popup PayPal | UX séparée du flux Stripe | **Choisi** |
| Stripe + PayPal via Stripe | PayPal comme méthode dans Stripe | Limité, pas natif PayPal | Rejeté |

### Conséquences

- 2 flux de paiement séparés (Stripe et PayPal) → 2 jeux de routes API.
- Webhooks Stripe obligatoires pour la confirmation fiable.
- Capture PayPal synchrone + webhook IPN en backup.
- **Idempotence** obligatoire sur les 2 flux.
- Packages à ajouter : `stripe` (serveur), `@paypal/react-paypal-js` (client).
- Variables d'environnement : 6 clés (voir Doc D §8).

### Fichiers à créer

| Fichier | Rôle |
|---|---|
| `app/api/checkout/stripe/session/route.ts` | Créer session Stripe |
| `app/api/webhooks/stripe/route.ts` | Webhook Stripe |
| `app/api/checkout/paypal/order/route.ts` | Créer commande PayPal |
| `app/api/checkout/paypal/capture/route.ts` | Capturer paiement PayPal |
| `app/api/checkout/status/route.ts` | Statut commande |
| `lib/stripe.ts` | Instance Stripe serveur |
| `lib/paypal.ts` | Helpers PayPal (auth token, API calls) |

---

## ADR-004 — Couche de données : Repository Pattern + Adapter

### Contexte

Le MVP démarre avec des données mock (fichiers TypeScript statiques). Il faut pouvoir migrer vers une BDD (Supabase, PostgreSQL) sans modifier les composants.

### Décision

**Repository Pattern avec interfaces TypeScript + adapters interchangeables.**

### Architecture

```
Composants/Pages
     │
     ▼
lib/adapters/index.ts    ← Point d'entrée unique
     │
     ├── lib/adapters/types.ts    ← Interfaces (ProductRepository, LookRepository, etc.)
     │
     ├── lib/adapters/mock.ts     ← Adapter mock (données statiques)  ← MVP actuel
     │
     └── lib/adapters/supabase.ts ← Adapter Supabase (futur)
```

### Alternatives envisagées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| Repository + Adapter | Découplage, testable, migration facile | Un niveau d'abstraction | **Choisi** (déjà en place) |
| Appels directs Supabase | Simple | Couplage fort, pas de mock | Rejeté |
| ORM (Prisma, Drizzle) | Typage fort, migrations | Dépendance lourde, overkill en MVP | Rejeté pour MVP |
| API REST externe | Découplé | Latence, complexité | Rejeté |

### Conséquences

- Les composants importent uniquement depuis `@/lib/adapters`.
- Pour migrer vers Supabase : créer `lib/adapters/supabase.ts` qui implémente les mêmes interfaces, puis changer l'import dans `lib/adapters/index.ts`.
- Les types (`Product`, `Look`, `Order`, etc.) restent identiques.
- **V2** : ajouter un adapter Supabase quand la BDD sera configurée.

### Fichiers concernés

- `lib/adapters/types.ts` (existant — interfaces)
- `lib/adapters/mock.ts` (existant — données statiques)
- `lib/adapters/index.ts` (existant — export de l'adapter actif)
- `lib/adapters/supabase.ts` (**à créer** quand Supabase configuré)

---

## ADR-005 — Livraison : France uniquement, frais fixes

### Contexte

Le MVP cible la France métropolitaine uniquement. Le modèle de livraison doit être simple.

### Décision

**Frais fixes 5,90 EUR, gratuit dès 100 EUR. France métropolitaine uniquement.**

### Alternatives envisagées

| Option | Avantages | Inconvénients | Verdict |
|---|---|---|---|
| Frais fixes + seuil | Ultra-simple, prévisible | Pas de calcul au poids/distance | **Choisi** |
| Calcul au poids (API transporteur) | Précis | Complexité, intégration API, overkill en MVP | Rejeté pour MVP |
| Livraison gratuite systématique | UX simple | Coût absorbé par la marque | Rejeté par le client |

### Conséquences

- Constantes dans `lib/constants.ts` (déjà en place).
- Le checkout n'accepte que les adresses françaises (code postal 5 chiffres).
- Le seuil restant pour la gratuité doit être affiché dans le panier.
- **V2** : si expansion internationale, ajouter un calcul par zone + API transporteur.

### Fichiers concernés

- `lib/constants.ts` (existant : `SHIPPING.COST`, `SHIPPING.FREE_THRESHOLD`)

---

## ADR-006 — Email transactionnel

### Contexte

Le site doit envoyer des emails de confirmation de commande et des notifications de contact. Il faut un service fiable, simple à intégrer.

### Décision

**À confirmer** — 3 options proposées au client :

| Option | Avantages | Inconvénients | Coût |
|---|---|---|---|
| **Resend** (recommandé) | API moderne, React Email (templates JSX), bon DX | Service récent | Gratuit < 3000 emails/mois |
| SendGrid | Très fiable, réputation | API plus lourde, UI complexe | Gratuit < 100 emails/jour |
| Stripe Receipts | Zéro config, natif Stripe | Uniquement pour les paiements Stripe, pas pour PayPal ni contact | Inclus |

### Recommandation

**Resend** pour tous les emails (confirmation commande Stripe + PayPal + contact). Templates en React (JSX) pour cohérence avec la stack.

### Conséquences

- Package à ajouter : `resend` (ou `@sendgrid/mail`).
- Variable d'environnement : `RESEND_API_KEY`.
- Templates email à créer avec le ton LOLETT.
- L'envoi d'email est **best-effort** : si ça échoue, la commande reste confirmée.

### Fichiers à créer

| Fichier | Rôle |
|---|---|
| `lib/email.ts` | Service d'envoi (abstraction sur Resend/SendGrid) |
| `lib/email-templates/order-confirmation.tsx` | Template email confirmation commande |
| `lib/email-templates/contact-notification.tsx` | Template email notification contact |

---

## ADR-007 — Base de données (à confirmer)

### Contexte

Le MVP tourne actuellement avec des données mock (fichiers `.ts`). Pour le paiement réel, les commandes et la gestion admin, une base de données est nécessaire.

### Décision

**À confirmer avec le client** — option recommandée : **Supabase (PostgreSQL managé)**.

| Option | Avantages | Inconvénients | Coût |
|---|---|---|---|
| **Supabase** (recommandé) | PostgreSQL, Auth intégré (V2), Storage (images), API auto-générée, bon DX | Service tiers | Gratuit < 500MB |
| PlanetScale (MySQL) | Serverless, branching | MySQL (pas PostgreSQL), pricing | Gratuit limité |
| Vercel Postgres | Intégré à Vercel | Plus cher, moins de features | Payant |
| SQLite (Turso) | Ultra-simple, edge | Pas d'auth intégré, limité | Gratuit limité |

### Recommandation

**Supabase** pour les raisons suivantes :
- PostgreSQL robuste et standard.
- Auth intégré pour les comptes clients V1.1.
- Storage pour les images produit (upload admin).
- Dashboard/Studio utilisable comme admin temporaire.
- Gratuit pour le volume MVP.

### Conséquences

- Créer les tables : `products`, `looks`, `look_products`, `categories`, `orders`, `order_items`.
- Créer `lib/adapters/supabase.ts` qui implémente les interfaces existantes.
- Migrer les données mock vers Supabase.
- Variables : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### Fichiers à créer

| Fichier | Rôle |
|---|---|
| `lib/supabase/client.ts` | Client Supabase (browser) |
| `lib/supabase/server.ts` | Client Supabase (server-side) |
| `lib/adapters/supabase.ts` | Adapter Supabase (implémente les interfaces Repository) |
| `supabase/migrations/001_initial_schema.sql` | Schéma initial BDD |

---

## Résumé des impacts techniques

### Packages à ajouter

| Package | Usage | Côté |
|---|---|---|
| `stripe` | SDK Stripe | Serveur |
| `@paypal/react-paypal-js` | SDK PayPal | Client |
| `resend` (recommandé) | Email transactionnel | Serveur |
| `@supabase/supabase-js` (si confirmé) | Client BDD | Client + Serveur |

### Fichiers à créer (vue complète)

```
app/
├── api/
│   ├── checkout/
│   │   ├── stripe/session/route.ts      # Créer session Stripe
│   │   ├── paypal/order/route.ts        # Créer commande PayPal
│   │   ├── paypal/capture/route.ts      # Capturer paiement PayPal
│   │   └── status/route.ts             # Statut commande
│   ├── webhooks/
│   │   └── stripe/route.ts             # Webhook Stripe
│   └── contact/route.ts                # Envoi formulaire contact
├── mentions-legales/page.tsx            # Mentions légales
├── cgv/page.tsx                         # CGV
├── politique-confidentialite/page.tsx   # Confidentialité
└── politique-retours/page.tsx           # Retours

lib/
├── stripe.ts                            # Instance Stripe serveur
├── paypal.ts                            # Helpers PayPal
├── email.ts                             # Service email
├── email-templates/
│   ├── order-confirmation.tsx           # Template confirmation
│   └── contact-notification.tsx         # Template notification contact
├── microcopy.ts                         # Micro-copies LOLETT (rotation)
├── supabase/                            # Si Supabase confirmé
│   ├── client.ts
│   └── server.ts
└── adapters/
    └── supabase.ts                      # Adapter Supabase

supabase/
└── migrations/
    └── 001_initial_schema.sql           # Schéma BDD
```

### Fichiers à modifier

| Fichier | Modification |
|---|---|
| `types/index.ts` | Ajouter statuts commande (`cancelled`, `fulfilled`, `refunded`, `expired`), champs `paymentProvider`, `paymentId`, `idempotencyKey`, `updatedAt` |
| `lib/adapters/types.ts` | Ajouter `updateStatus()`, `findByPaymentId()`, `decrementStock()` |
| `data/categories.ts` | Corriger encodage, aligner sur cahier des charges (hauts, bas, chaussures, accessoires) |
| `features/checkout/` | Connecter aux routes API réelles |
| `app/checkout/success/page.tsx` | Fetch commande via API |
| `components/layout/Footer.tsx` | Ajouter liens pages légales |
| `app/robots.ts` | Exclure `/checkout`, `/panier`, `/favoris`, `/api` |
| `package.json` | Ajouter dépendances (stripe, paypal, resend, supabase) |
| `.env.local` | Ajouter toutes les variables d'environnement |
| `.gitignore` | S'assurer que `.env.local` est exclu |

---

## Questions ouvertes consolidées (tous ADR)

| # | Question | ADR | Impact |
|---|---|---|---|
| 1 | **Supabase confirmé** comme BDD ? | ADR-007 | Architecture complète, admin, commandes |
| 2 | **Resend confirmé** comme service email ? | ADR-006 | H2, L1 |
| 3 | **Nom de domaine final** ? | ADR-003 | Apple Pay (vérification domaine), SEO, emails |
| 4 | **Comptes clients** en MVP ou V1.1 ? | ADR-002 | Si MVP : Supabase Auth dès le départ |
| 5 | **Admin** : interface custom Next.js ou Supabase Studio ? | ADR-007 | Effort de développement EPIC J |
| 6 | **Catégories** : aligner sur le cahier des charges (hauts/bas/chaussures/accessoires) ? | ADR-004 | Données, SEO, navigation |

---

*Document H — ADR v1.0 — Généré le 17/02/2026*
