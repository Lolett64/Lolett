# AUDIT TECHNIQUE - LOLETT (Next.js App Router)

**Date**: 2026-01-30
**Version**: 1.0
**Stack**: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Zustand 5

---

## RESUME EXECUTIF

### Risques Critiques

| Priorite | Probleme                    | Impact                               | Fichier(s)                         |
| -------- | --------------------------- | ------------------------------------ | ---------------------------------- |
| P0       | Homepage 478 lignes         | Maintenance impossible, performances | `app/page.tsx`                     |
| P0       | Duplication icones sociales | 3 definitions identiques             | Header, Footer, page.tsx           |
| P0       | Checkout 313 lignes         | UI + logique mixees                  | `app/checkout/page.tsx`            |
| P1       | Header 311 lignes           | Composant monolithique               | `components/layout/Header.tsx`     |
| P1       | Client-only sur homepage    | Hydration inutile, SEO degrade       | `app/page.tsx`                     |
| P2       | Logique panier dupliquee    | Calculs prix en 2 fichiers           | panier/page.tsx, checkout/page.tsx |

### Quick Wins (< 1h chacun)

1. **Extraire les icones sociales** vers `components/icons/` (duplication x3)
2. **Creer hook `useCartCalculation`** pour centraliser calculs prix/livraison
3. **Convertir homepage en Server Component** avec sections client isolees
4. **Extraire `OrderSummary`** reutilise entre panier et checkout

---

## 1. ANALYSE ARCHITECTURE

### 1.1 App Router - Structure Routes

```
app/
├── layout.tsx          (57 lignes) - OK
├── page.tsx            (478 lignes) - CRITIQUE
├── checkout/
│   ├── page.tsx        (313 lignes) - CRITIQUE
│   └── success/page.tsx (87 lignes) - OK
├── contact/page.tsx    (184 lignes) - MEDIUM
├── favoris/page.tsx    (?) - A verifier
├── nouveautes/page.tsx (?) - A verifier
├── panier/page.tsx     (205 lignes) - MEDIUM
├── produit/[slug]/page.tsx (67 lignes) - OK
└── shop/
    ├── page.tsx        (65 lignes) - OK
    ├── homme/page.tsx  (65 lignes) - OK
    ├── femme/page.tsx  (?) - A verifier
    └── [gender]/[category]/page.tsx (99 lignes) - OK
```

**Verdict**: Routes dynamiques bien structurees. Probleme concentre sur les pages "lourdes".

### 1.2 Server vs Client Components

| Fichier                                 | Directive      | Devrait etre     | Probleme                           |
| --------------------------------------- | -------------- | ---------------- | ---------------------------------- |
| `app/page.tsx`                          | `'use client'` | Server (partiel) | Scroll effect = seul besoin client |
| `app/checkout/page.tsx`                 | `'use client'` | Server (partiel) | Form = client, summary = server    |
| `app/panier/page.tsx`                   | `'use client'` | `'use client'`   | OK (store)                         |
| `app/contact/page.tsx`                  | `'use client'` | `'use client'`   | OK (form)                          |
| `app/shop/[gender]/[category]/page.tsx` | Server         | Server           | OK                                 |
| `app/produit/[slug]/page.tsx`           | Server         | Server           | OK                                 |
| `components/layout/Header.tsx`          | `'use client'` | `'use client'`   | OK (state)                         |
| `components/layout/Footer.tsx`          | Server         | Server           | OK                                 |

**Probleme majeur**: `app/page.tsx` est full client alors que 90% du contenu est statique.

### 1.3 Data Layer

**Pattern actuel**: Mock data + Repository pattern (bon pour migration future)

```
data/
├── products.ts    (295 lignes) - Donnees mock
├── categories.ts  (66 lignes) - OK
├── looks.ts       (?) - A verifier
└── reviews.ts     (?) - A verifier

lib/adapters/
├── types.ts       - Interfaces Repository
├── mock.ts        - Implementations mock
└── index.ts       - Guide migration Supabase
```

**Verdict**: Architecture data bien preparee pour backend. Pas de probleme ici.

### 1.4 State Management (Zustand)

```
features/
├── cart/store.ts      (88 lignes) - OK
└── favorites/store.ts (66 lignes) - OK
```

**Verdict**: Stores bien isoles, persistence localStorage OK. Pattern correct.

---

## 2. ANALYSE ORGANISATION DOSSIERS

### 2.1 Structure Actuelle

```
lolett-app/
├── app/                    # Routes (Next.js App Router)
├── components/
│   ├── brand/             # Logo, Badge, Heading (3 fichiers)
│   ├── layout/            # Header, Footer, Container, Breadcrumbs
│   ├── look/              # LookCard (1 fichier)
│   ├── product/           # ProductCard, Details, Grid, etc. (6 fichiers)
│   └── ui/                # Shadcn components (11 fichiers)
├── data/                  # Mock data (4 fichiers)
├── features/              # Zustand stores (2 dossiers)
├── lib/                   # Utils + adapters
├── types/                 # TypeScript definitions
└── public/                # Assets statiques
```

### 2.2 Problemes Identifies

| Probleme                        | Localisation   | Impact                            |
| ------------------------------- | -------------- | --------------------------------- |
| Pas de dossier `hooks/`         | Global         | Hooks eparpilles ou inexistants   |
| Pas de dossier `icons/`         | Global         | Icones dupliquees dans 3 fichiers |
| Pas de feature `checkout/`      | `features/`    | Logique checkout dans page        |
| Pas de separation page/sections | `app/page.tsx` | Homepage monolithique             |

### 2.3 Structure Cible Recommandee

```
lolett-app/
├── app/                    # Routes only (composition + metadata)
│   └── page.tsx           # Compose sections, pas de logique UI
├── components/
│   ├── brand/             # Unchanged
│   ├── icons/             # NEW: TikTok, Instagram, Facebook icons
│   ├── layout/            # Unchanged
│   ├── sections/          # NEW: Homepage sections
│   │   ├── HeroSection.tsx
│   │   ├── MarqueeSection.tsx
│   │   ├── NewArrivalsSection.tsx
│   │   ├── CollectionsSection.tsx
│   │   ├── LooksSection.tsx
│   │   ├── BrandStorySection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── SocialFeedSection.tsx
│   │   └── NewsletterSection.tsx
│   ├── look/              # Unchanged
│   ├── product/           # Unchanged
│   └── ui/                # Unchanged
├── features/
│   ├── cart/
│   │   ├── store.ts
│   │   ├── hooks.ts       # NEW: useCartCalculation
│   │   └── components/    # NEW: CartItem, OrderSummary
│   ├── checkout/          # NEW
│   │   ├── components/
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── OrderSummary.tsx
│   │   └── hooks.ts       # useCheckout
│   └── favorites/         # Unchanged
├── hooks/                 # NEW: Global shared hooks
│   └── useScrollPosition.ts
├── data/                  # Unchanged
├── lib/                   # Unchanged
└── types/                 # Unchanged
```

---

## 3. ANALYSE QUALITE DU CODE

### 3.1 Single Responsibility Principle (SRP)

| Fichier                 | Responsabilites                  | Verdict           |
| ----------------------- | -------------------------------- | ----------------- |
| `app/page.tsx`          | 9 sections + scroll + data fetch | VIOLATION MAJEURE |
| `app/checkout/page.tsx` | Form, validation, cart calc, UI  | VIOLATION         |
| `Header.tsx`            | Nav, mobile menu, social, badges | VIOLATION         |
| `ProductDetails.tsx`    | Gallery, selectors, actions      | VIOLATION         |
| `ProductCard.tsx`       | Card, quick-add, size selector   | LIMITE            |
| `Footer.tsx`            | Links, social, branding          | OK                |

### 3.2 Duplication de Code

#### Duplication Critique: Icones Sociales

**TikTokIcon** definie 3 fois (identique):

- `app/page.tsx:15-21`
- `components/layout/Header.tsx:14-20`
- `components/layout/Footer.tsx:6-12`

**InstagramIcon** definie 3 fois (identique):

- `app/page.tsx:24-32`
- `components/layout/Header.tsx:23-31`
- `components/layout/Footer.tsx:15-23`

**Cout**: ~50 lignes dupliquees, maintenance x3

#### Duplication Moyenne: Calculs Panier

**Logique prix/livraison** dupliquee:

```typescript
// app/panier/page.tsx:13-14
const SHIPPING_COST = 5.9;
const FREE_SHIPPING_THRESHOLD = 100;

// app/checkout/page.tsx:16-17
const SHIPPING_COST = 5.9;
const FREE_SHIPPING_THRESHOLD = 100;
```

**Calcul subtotal/shipping/total** duplique dans les 2 fichiers.

### 3.3 Naming Conventions

| Element             | Convention            | Status       |
| ------------------- | --------------------- | ------------ |
| Composants          | PascalCase            | OK           |
| Fichiers composants | PascalCase.tsx        | OK           |
| Hooks               | camelCase (useXxx)    | OK           |
| Routes              | kebab-case (francais) | OK           |
| Types               | PascalCase            | OK           |
| Constants           | SCREAMING_CASE        | Inconsistant |

**Probleme**: Constantes parfois en camelCase, parfois SCREAMING_CASE.

### 3.4 Coupling Analysis

| Composant        | Dependances directes               | Couplage    |
| ---------------- | ---------------------------------- | ----------- |
| `ProductCard`    | store cart, store favorites, types | FORT        |
| `ProductDetails` | store cart, store favorites, types | FORT        |
| `LookCard`       | store cart, data/looks, types      | FORT        |
| `Header`         | store cart, store favorites        | MOYEN       |
| `Footer`         | Aucune store                       | FAIBLE (OK) |

**Recommandation**: Injecter les handlers plutot que consommer directement les stores dans certains cas.

---

## 4. ANALYSE PERFORMANCE

### 4.1 Bundle Analysis

| Aspect          | Status                    | Recommandation |
| --------------- | ------------------------- | -------------- |
| Images Unsplash | Optimisees via next/image | OK             |
| Fonts Google    | `display: swap`           | OK             |
| Icons Lucide    | Tree-shakeable            | OK             |
| Tailwind v4     | PostCSS build             | OK             |
| Zustand         | Leger (~2kb)              | OK             |

### 4.2 Rendering Issues

| Probleme                           | Fichier              | Impact                        |
| ---------------------------------- | -------------------- | ----------------------------- |
| Homepage full client               | `app/page.tsx`       | TTI degrade, hydration lourde |
| Scroll listener sans throttle      | `app/page.tsx:40-44` | Performance scroll            |
| Multiple useState dans ProductCard | `ProductCard.tsx`    | Re-renders                    |

**Code problematique** (`app/page.tsx:40-44`):

```typescript
useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

**Probleme**: Pas de throttle/debounce sur le scroll.

### 4.3 Hydration

| Page     | Contenu statique | Contenu dynamique   | Verdict                 |
| -------- | ---------------- | ------------------- | ----------------------- |
| Homepage | 90%              | 10% (scroll effect) | MAUVAIS: tout en client |
| Checkout | 40%              | 60% (form, cart)    | ACCEPTABLE              |
| Panier   | 20%              | 80% (cart state)    | OK                      |
| Shop     | 100%             | 0%                  | OK (server)             |
| Produit  | 80%              | 20%                 | ACCEPTABLE              |

---

## 5. ANALYSE SEO

### 5.1 Metadata

| Page            | Title              | Description | OG       | Status     |
| --------------- | ------------------ | ----------- | -------- | ---------- |
| Layout (global) | Template OK        | OK          | OK       | OK         |
| Homepage        | Herite layout      | -           | -        | OK         |
| Shop/Category   | `generateMetadata` | OK          | -        | PARTIAL    |
| Produit         | Server component   | -           | MANQUANT | A VERIFIER |
| Checkout        | -                  | -           | -        | N/A        |

### 5.2 Problemes SEO

1. **Homepage `'use client'`**: Le contenu n'est pas pre-rendu server-side
2. **Pas de sitemap.xml** detecte
3. **Pas de robots.txt** detecte
4. **Images sans alt descriptifs** parfois (ex: social feed)

### 5.3 Routing & Canonical

| Route             | Canonical | Status   |
| ----------------- | --------- | -------- |
| `/shop/homme`     | -         | MANQUANT |
| `/shop/femme`     | -         | MANQUANT |
| `/produit/[slug]` | -         | MANQUANT |

---

## 6. ANALYSE ACCESSIBILITE

### 6.1 Points Positifs

- `aria-label` sur boutons icones (Header, ProductCard)
- Labels sur inputs de formulaires
- Structure semantique `<header>`, `<main>`, `<footer>`
- `lang="fr"` sur `<html>`

### 6.2 Problemes Identifies

| Probleme                           | Fichier            | Ligne | Severite |
| ---------------------------------- | ------------------ | ----- | -------- |
| Focus invisible sur certains liens | Global             | -     | MEDIUM   |
| Contrast ratio a verifier          | Header transparent | -     | LOW      |
| Skip-to-content manquant           | `layout.tsx`       | -     | MEDIUM   |
| Focus trap mobile menu             | `Header.tsx`       | -     | LOW      |

### 6.3 ARIA Manquants

- `aria-expanded` sur dropdown Shop (Header)
- `aria-current="page"` sur navigation active
- `role="alert"` sur messages succes/erreur forms

---

## 7. ANALYSE DX (Developer Experience)

### 7.1 Configuration

| Outil             | Status       | Fichier                          |
| ----------------- | ------------ | -------------------------------- |
| TypeScript strict | OK           | `tsconfig.json`                  |
| ESLint            | Present      | `eslint.config.mjs` (a verifier) |
| Prettier          | MANQUANT     | -                                |
| Path aliases      | OK (`@/*`)   | `tsconfig.json`                  |
| Tailwind          | v4 + PostCSS | OK                               |

### 7.2 Scripts npm

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

**Manquants**:

- `lint:fix`
- `format` (Prettier)
- `type-check`
- `test` (aucun test)

### 7.3 Conventions Manquantes

- Pas de `.prettierrc`
- Pas de `.editorconfig`
- Pas de `CONTRIBUTING.md`
- Pas de limites de lignes documentees

---

## 8. TOP 10 FICHIERS PROBLEMATIQUES

| #   | Fichier                                 | Lignes | Probleme Principal        | Recommandation                                   |
| --- | --------------------------------------- | ------ | ------------------------- | ------------------------------------------------ |
| 1   | `app/page.tsx`                          | 478    | 9 sections dans 1 fichier | Extraire 9 composants Section                    |
| 2   | `app/checkout/page.tsx`                 | 313    | UI + logique mixees       | Extraire CheckoutForm, OrderSummary, useCheckout |
| 3   | `components/layout/Header.tsx`          | 311    | Composant monolithique    | Extraire MobileMenu, DesktopNav, SocialDropdown  |
| 4   | `data/products.ts`                      | 295    | Mock data (acceptable)    | Migrer vers DB a terme                           |
| 5   | `components/product/ProductDetails.tsx` | 233    | Trop de responsabilites   | Extraire Gallery, Selectors, Actions             |
| 6   | `app/panier/page.tsx`                   | 205    | Logique dupliquee         | Extraire CartItem, OrderSummary, useCartCalc     |
| 7   | `components/ui/select.tsx`              | 190    | Shadcn (acceptable)       | Pas de changement                                |
| 8   | `app/contact/page.tsx`                  | 184    | Form dans page            | Extraire ContactForm                             |
| 9   | `components/layout/Footer.tsx`          | 180    | Icones dupliquees         | Extraire vers icons/                             |
| 10  | `components/product/ProductCard.tsx`    | 172    | Quick-add complexe        | Extraire SizeSelectorPopup                       |

---

## 9. METRIQUES GLOBALES

| Metrique                   | Valeur     | Seuil Recommande | Status |
| -------------------------- | ---------- | ---------------- | ------ |
| Fichiers > 200 lignes      | 6          | 0                | ECHEC  |
| Fichiers > 150 lignes      | 10         | < 5              | ECHEC  |
| Duplication code           | ~50 lignes | 0                | ECHEC  |
| Couverture tests           | 0%         | > 70%            | ECHEC  |
| Pages full-client inutiles | 1          | 0                | ECHEC  |
| Types TypeScript           | 100%       | 100%             | OK     |
| Stores isoles              | 100%       | 100%             | OK     |

---

## 10. CONCLUSION

### Forces du Projet

- Architecture data-layer bien preparee (repository pattern)
- TypeScript strict avec bons types
- Zustand stores bien structures
- Shadcn UI components standards
- Routes dynamiques correctes

### Faiblesses Critiques

1. Homepage monolithique (478 lignes)
2. Duplication de code (icones sociales, calculs panier)
3. `'use client'` abusif sur homepage
4. Pas de tests
5. Composants trop gros (Header, ProductDetails, Checkout)

### Priorite d'Action

1. **Immediate**: Extraire icones sociales (quick win)
2. **Court terme**: Decomposer homepage en sections
3. **Moyen terme**: Refactorer checkout et header
4. **Long terme**: Ajouter tests et documentation

---

_Audit realise par Claude Code - Staff Engineer Frontend_
