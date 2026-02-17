# LOLETT — CLAUDE.md

> Règles de génération et d'implémentation pour tout agent ou développeur travaillant sur LOLETT.
> Ce fichier fait autorité. En cas de doute, se référer au PRD (`docs/A-PRD.md`).

---

## Objectif du document

Fixer les conventions, contraintes et règles que tout code généré ou modifié doit respecter, afin de garantir la cohérence du projet LOLETT.

## Contenu

Stack, architecture, conventions de code, ton de marque, règles paiement/livraison, qualité.

## Hypothèses

- Le code existant dans `lolett-app/` fait référence (types, stores, adapters).
- Les décisions techniques s'appuient sur ce qui est déjà en place.

## Points à valider

- Aucun pour ce document (découle directement du PRD validé).

---

## 1. Règle d'or

**Toujours respecter le PRD et le ton LOLETT** : proche, complice, stylé, sans jargon technique visible par l'utilisateur. Le site parle comme une amie qui a du goût, pas comme un robot.

### Règle de processus

**OBLIGATOIRE : Poser des questions avant chaque phase de développement.** Ne jamais commencer à coder une nouvelle phase sans avoir posé les questions nécessaires et obtenu le feu vert explicite du porteur de projet. Cela inclut : les dépendances manquantes, les décisions à valider, les credentials nécessaires, et toute zone d'ombre.

---

## 2. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Langage | TypeScript (strict) | 5.x |
| UI | React | 19.x |
| CSS | Tailwind CSS | 4.x |
| Composants UI | Radix UI + shadcn/ui | dernière |
| Icônes | Lucide React | dernière |
| État client | Zustand (persist) | 5.x |
| Paiement | Stripe Checkout + PayPal | — |
| Hébergement | Vercel | — |
| Linting | ESLint + Prettier | — |

### Ne PAS ajouter sans validation

- Pas de Redux, React Query, SWR ou autre lib d'état.
- Pas de CSS-in-JS (styled-components, emotion).
- Pas d'ORM côté client.
- Pas de dépendance lourde sans justification dans un ADR.

---

## 3. Architecture du projet

```
lolett-app/
├── app/                    # Pages (App Router)
│   ├── page.tsx            # Accueil
│   ├── nouveautes/         # Nouveautés
│   ├── shop/               # Marketplace
│   │   ├── homme/          # Sélection Homme
│   │   ├── femme/          # Sélection Femme
│   │   └── [gender]/[category]/  # Catégorie dynamique
│   ├── produit/[slug]/     # Fiche produit
│   ├── favoris/            # Favoris
│   ├── panier/             # Panier
│   ├── checkout/           # Checkout
│   │   └── success/        # Confirmation
│   └── contact/            # Contact
├── components/
│   ├── ui/                 # Primitives shadcn/ui (ne pas modifier)
│   ├── layout/             # Header, Footer, Container, Breadcrumbs
│   ├── product/            # ProductCard, ProductGrid, Gallery, Selectors
│   ├── brand/              # Logo, BrandBadge, BrandHeading
│   ├── sections/home/      # Sections de la page d'accueil
│   ├── icons/              # Icônes custom (réseaux sociaux)
│   └── [domaine]/          # Composants par domaine
├── features/
│   ├── cart/               # Store, hooks, composants panier
│   ├── checkout/           # Composants + hooks checkout
│   └── favorites/          # Store favoris
├── lib/
│   ├── adapters/           # Repository pattern (types + mock + futur Supabase)
│   ├── constants.ts        # Constantes métier (livraison, stock)
│   ├── storage.ts          # Helpers localStorage
│   └── utils.ts            # cn() et utilitaires
├── data/                   # Données mock (produits, looks, catégories, avis)
├── types/                  # Types TypeScript partagés
├── hooks/                  # Hooks custom globaux
└── public/                 # Assets statiques
```

### Règles d'architecture

- **App Router uniquement** : pas de `pages/` directory.
- **Server Components par défaut** : n'utiliser `'use client'` que quand nécessaire (interactivité, hooks, stores).
- **Repository pattern** : toute donnée passe par `lib/adapters/`. Les composants ne connaissent pas la source (mock, Supabase, API).
- **Features isolées** : chaque feature (`cart`, `checkout`, `favorites`) exporte via `index.ts`.
- **Types centralisés** : tous les types dans `types/index.ts`. Ne pas dupliquer.

---

## 4. Sitemap MVP — Routes obligatoires

| Route | Page | Statut |
|---|---|---|
| `/` | Accueil | Existante |
| `/nouveautes` | Nouveautés | Existante |
| `/shop` | Marketplace (landing) | Existante |
| `/shop/homme` | Sélection Homme | Existante |
| `/shop/femme` | Sélection Femme | Existante |
| `/shop/[gender]/[category]` | Catégorie | Existante |
| `/produit/[slug]` | Fiche produit | Existante |
| `/favoris` | Favoris | Existante |
| `/panier` | Panier | Existante |
| `/checkout` | Checkout | Existante |
| `/checkout/success` | Confirmation | Existante |
| `/contact` | Contact | Existante |

**Ne pas créer de nouvelles routes** sans mise à jour du PRD.

---

## 5. Paiement — Règles strictes

### Stripe Checkout

- Utiliser **Stripe Checkout (hosted)** — pas d'Elements custom en MVP.
- Moyens acceptés : CB (Visa, Mastercard, CB), Apple Pay.
- Devise : **EUR uniquement**.
- Créer la session Checkout côté serveur (`app/api/checkout/route.ts`).
- **Jamais de prix calculé côté client** — le serveur recalcule à partir des IDs produit.
- Activer SCA / 3D Secure (automatique via Stripe Checkout).

### PayPal

- Bouton PayPal séparé du flux Stripe.
- Utiliser PayPal Checkout SDK (bouton standard).
- Validation serveur obligatoire après paiement PayPal.

### Webhooks

- Écouter `checkout.session.completed` (Stripe).
- Écouter la notification IPN/webhook PayPal.
- **Idempotence obligatoire** : ne pas créer une commande en double.
- Mettre à jour le statut commande uniquement via webhook, pas côté client.

### Statuts commande

```
pending → confirmed → shipped → delivered
```

- `pending` : commande créée, paiement en cours.
- `confirmed` : paiement validé (webhook reçu).
- `shipped` : expédiée (mise à jour manuelle ou transporteur).
- `delivered` : livrée.

---

## 6. Livraison — Constantes

Déjà définies dans `lib/constants.ts` :

```typescript
export const SHIPPING = {
  COST: 5.9,        // 5,90 EUR
  FREE_THRESHOLD: 100,  // Gratuit dès 100 EUR
} as const;
```

### Règles d'affichage panier

- Si sous-total < 100 EUR : afficher "Livraison : 5,90 EUR".
- Si sous-total >= 100 EUR : afficher "Livraison offerte".
- **Toujours afficher le seuil restant** : "Plus que X,XX EUR pour la livraison offerte !"
- Zone : **France métropolitaine uniquement**. Le formulaire checkout n'accepte que les adresses françaises.

---

## 7. Look complet ("Prêt à sortir")

### Données

- Un `Look` a un tableau `productIds: string[]` (voir `types/index.ts`).
- Un produit peut appartenir à plusieurs looks.
- La relation est bidirectionnelle : depuis un produit, on retrouve ses looks via `LookRepository.findLooksForProduct(productId)`.

### Affichage (fiche produit)

- Si le produit a des looks associés : afficher le bloc "Prêt à sortir".
- Montrer les autres pièces du look (photo, nom, prix).
- CTA individuel "Ajouter" par pièce.
- CTA global "Ajouter le look complet".
- Si aucun look associé : ne rien afficher (pas de bloc vide).

---

## 8. Micro-copies obligatoires

### Règle

Les micro-copies sont **intégrées en dur dans le code** (pas de CMS pour le MVP). Elles doivent apparaître exactement comme ci-dessous.

### Fixes

| Emplacement | Texte exact |
|---|---|
| Accueil — Hero | "Entre. Tu verras, ça vaut le coup d'oeil et parfois plus." |
| Accueil — Disclaimer | "LOLETT décline toute responsabilité en cas de coup de coeur." |
| Fiche produit — Badge | "Validé par LOLETT. Tu peux y aller tranquille." |
| Favoris — Page (titre ou état vide) | "Reviens, on a gardé tes coups de coeur." |
| Panier — Titre ou accroche | "T'es à deux clics d'être le plus stylé de ta terrasse." |
| Confirmation — Ligne 1 | "Excellente décision. Vraiment." |
| Confirmation — Ligne 2 | "Tu vas recevoir des compliments. Beaucoup." |
| Confirmation — Ligne 3 | "LOLETT te remercie." |

### Contextuelles (rotation aléatoire)

| Contexte | Phrases (une au hasard) |
|---|---|
| Fiche produit (général) | "Tu n'étais pas venue pour ça. On sait." / "Oui, celui-là aussi est bien." / "Il ne sera pas là éternellement." / "On n'a pas inventé le tissu, mais on sait quoi en faire." |
| Accessoires (catégorie) | "Ce n'est jamais 'en trop'." / "Parce que sans, ce n'est pas pareil." / "Ceux qu'on ajoute sans hésiter." / "Les détails qui font tout." |

### Implémentation

```typescript
// Exemple helper dans lib/microcopy.ts
const PRODUCT_QUOTES = [
  "Tu n'étais pas venue pour ça. On sait.",
  "Oui, celui-là aussi est bien.",
  "Il ne sera pas là éternellement.",
  "On n'a pas inventé le tissu, mais on sait quoi en faire.",
] as const;

export function getRandomProductQuote(): string {
  return PRODUCT_QUOTES[Math.floor(Math.random() * PRODUCT_QUOTES.length)];
}
```

---

## 9. Conventions de code

### TypeScript

- **`strict: true`** — pas de `any` sauf cas exceptionnel documenté.
- Types dans `types/index.ts`. Interfaces préférées aux types pour les objets.
- Utiliser les types existants (`Product`, `Look`, `CartItem`, `Size`, `Gender`, etc.).

### Composants React

- **Server Components par défaut.**
- `'use client'` uniquement si : événements, hooks, stores Zustand, useState/useEffect.
- Nommage : PascalCase, un composant par fichier.
- Props typées avec `interface`, pas `type`.
- Pas de `React.FC` — typer les props directement.

```typescript
// Bien
interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
}

export function ProductCard({ product, showBadge = false }: ProductCardProps) {
  // ...
}
```

### Styles

- **Tailwind CSS uniquement** — pas de CSS modules, pas de `style={}`.
- Utiliser `cn()` de `lib/utils.ts` pour les classes conditionnelles.
- Mobile-first : commencer par mobile, ajouter `md:` et `lg:` pour desktop.
- Pas de valeurs arbitraires (`w-[347px]`) sauf cas exceptionnel justifié.

### Fichiers

- Nommage composants : `PascalCase.tsx`
- Nommage utilitaires/hooks : `camelCase.ts`
- Nommage routes : `kebab-case/` (dossiers App Router)
- Imports avec alias `@/` (déjà configuré dans tsconfig).

### État

- **Zustand** pour l'état persisté client (panier, favoris). Stores dans `features/[feature]/store.ts`.
- Pas de Context API pour l'état global — Zustand gère.
- Pas de Redux, pas de useReducer pour l'état global.

---

## 10. Qualité — Checklist obligatoire

### Responsive

- [ ] Mobile-first (320px minimum)
- [ ] Tablette (768px)
- [ ] Desktop (1024px+)
- [ ] Tester sur iPhone SE, iPhone 14, iPad, Desktop 1440px

### Accessibilité

- [ ] Navigation clavier complète (Tab, Enter, Escape)
- [ ] Labels sur tous les inputs (`<label>` ou `aria-label`)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Alt text sur toutes les images produit
- [ ] Contrastes suffisants (ratio 4.5:1 minimum)
- [ ] Rôles ARIA sur les composants custom (dialog, menu, etc.)

### SEO

- [ ] `<title>` et `<meta description>` uniques par page
- [ ] Balises `<h1>` uniques par page
- [ ] `sitemap.xml` (déjà en place : `app/sitemap.ts`)
- [ ] `robots.txt` (déjà en place : `app/robots.ts`)
- [ ] Images avec `alt` descriptif
- [ ] URLs propres et lisibles

### Performance

- [ ] Score Lighthouse > 90 (Performance, Accessibility, SEO, Best Practices)
- [ ] Images optimisées (Next.js `<Image>` avec `width`/`height`)
- [ ] Pas de bundle JS inutile côté client
- [ ] Lazy loading des images sous le fold

### Gestion d'erreurs

- [ ] Paiement échoué : message clair + possibilité de réessayer
- [ ] Produit en rupture : désactiver "Ajouter au panier", afficher "Épuisé"
- [ ] Produit à stock bas (< 3) : afficher "Dernières pièces !"
- [ ] Formulaire contact : validation côté client + serveur
- [ ] 404 : page personnalisée avec ton LOLETT

---

## 11. Sécurité

- **Jamais de clé secrète Stripe/PayPal côté client.** Les clés publiques uniquement dans le navigateur.
- Les clés secrètes vont dans les variables d'environnement serveur (`STRIPE_SECRET_KEY`, pas `NEXT_PUBLIC_`).
- **Validation serveur** : ne jamais faire confiance aux prix/quantités envoyés par le client.
- **Webhooks signés** : vérifier la signature Stripe (`stripe.webhooks.constructEvent`).
- **Sanitization** : tous les inputs utilisateur (formulaire contact, adresse) sont sanitizés côté serveur.
- Pas de données sensibles dans le localStorage (pas de tokens, pas d'emails).

---

## 12. Variables d'environnement

```env
# .env.local (jamais commité)

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...

# Email (à définir)
# RESEND_API_KEY=...

# Site
NEXT_PUBLIC_SITE_URL=https://lolett.fr
```

**Règle** : tout `NEXT_PUBLIC_` est visible côté client. N'y mettre que des clés publiques.

---

## 13. Git & workflow

- Branche principale : `main`.
- Commits en français, format court : `feat: ajout bloc prêt à sortir`, `fix: calcul livraison panier`.
- Pas de commit de fichiers `.env`, `node_modules`, `.next`.
- Lancer `npm run validate` (lint + type-check) avant chaque commit.

---

## 14. Ce qui est hors périmètre (V2 — ne pas coder)

- Filtres (prix, couleur, taille)
- Programme de fidélité
- Click & Collect
- Comptes utilisateurs / authentification
- Avis dynamiques post-achat
- Multi-langue
- International (hors France)

**Si une fonctionnalité V2 est nécessaire pour débloquer le MVP**, ouvrir un ADR (`docs/H-ADR.md`) avant de coder.

---

*Document B — CLAUDE.md v1.0 — Généré le 17/02/2026*
*En attente de validation avant passage au Document C (Backlog)*
