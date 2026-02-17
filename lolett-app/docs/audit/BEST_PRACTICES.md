# BEST PRACTICES - LOLETT Next.js

**Version**: 1.0
**Stack**: Next.js 16+ App Router, React 19, TypeScript 5, Tailwind CSS 4

---

## 1. LIMITES DE TAILLE (OBLIGATOIRE)

### Pages (`app/**/page.tsx`)

| Niveau   | Lignes  | Action             |
| -------- | ------- | ------------------ |
| OK       | 0-120   | Aucune             |
| Warning  | 121-180 | Planifier refactor |
| Interdit | > 180   | Refactor immediat  |

**Regle**: Une page = composition + data fetching. Pas de logique UI.

```tsx
// BIEN: Page legere (composition)
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  return (
    <div className="container">
      <Breadcrumbs items={[...]} />
      <ProductDetails product={product} />
      <RelatedProducts productId={product.id} />
    </div>
  );
}

// MAL: Page lourde (UI + logique)
export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // ... 200 lignes de JSX et logique
}
```

### Composants (`components/**/*.tsx`)

| Niveau   | Lignes  | Action               |
| -------- | ------- | -------------------- |
| OK       | 0-100   | Aucune               |
| Warning  | 101-150 | Considerer split     |
| Interdit | > 150   | Refactor obligatoire |

**Regle**: Un composant = une responsabilite claire.

### Hooks (`hooks/**/*.ts`, `features/**/hooks.ts`)

| Niveau   | Lignes | Action               |
| -------- | ------ | -------------------- |
| OK       | 0-80   | Aucune               |
| Warning  | 81-120 | Considerer split     |
| Interdit | > 120  | Refactor obligatoire |

### Utilitaires (`lib/**/*.ts`)

| Niveau   | Lignes | Action               |
| -------- | ------ | -------------------- |
| OK       | 0-60   | Aucune               |
| Warning  | 61-80  | Considerer split     |
| Interdit | > 80   | Refactor obligatoire |

---

## 2. STRUCTURE DES FICHIERS

### Architecture Feature-First

```
lolett-app/
├── app/                          # Routes UNIQUEMENT
│   ├── layout.tsx               # Layout global
│   ├── page.tsx                 # Composition de sections
│   └── [route]/
│       └── page.tsx             # Composition + metadata
│
├── components/
│   ├── ui/                      # Shadcn/primitives (ne pas modifier)
│   ├── brand/                   # Composants marque (Logo, Badge)
│   ├── layout/                  # Header, Footer, Container
│   ├── icons/                   # Icones custom partagees
│   ├── forms/                   # Composants form reutilisables
│   └── sections/                # Sections de pages
│       └── home/                # Sections homepage
│
├── features/                    # Logique metier par feature
│   ├── cart/
│   │   ├── components/         # CartItem, OrderSummary
│   │   ├── hooks.ts            # useCartCalculation
│   │   ├── store.ts            # Zustand store
│   │   └── index.ts            # Barrel export
│   ├── checkout/
│   ├── favorites/
│   └── [feature]/
│
├── hooks/                       # Hooks globaux partages
│   ├── useScrollPosition.ts
│   └── useMediaQuery.ts
│
├── lib/
│   ├── utils.ts                # Utilitaires (cn, etc.)
│   ├── constants.ts            # Constantes globales
│   └── adapters/               # Data layer
│
├── data/                        # Mock data (temporaire)
│
└── types/                       # Types globaux
    └── index.ts
```

### Barrel Exports (index.ts)

Chaque dossier feature doit avoir un `index.ts`:

```typescript
// features/cart/index.ts
export { useCartStore } from './store';
export { useCartCalculation } from './hooks';
export { CartItem } from './components/CartItem';
export { OrderSummary } from './components/OrderSummary';
```

---

## 3. SERVER VS CLIENT COMPONENTS

### Regle d'Or

> **Server par defaut. Client uniquement si necessaire.**

### Quand utiliser `'use client'`

| Besoin                              | Directive      |
| ----------------------------------- | -------------- |
| useState, useEffect                 | `'use client'` |
| Event handlers (onClick, onChange)  | `'use client'` |
| Browser APIs (window, localStorage) | `'use client'` |
| Hooks tiers (Zustand, etc.)         | `'use client'` |

### Quand rester Server

| Cas                 | Directive       |
| ------------------- | --------------- |
| Data fetching       | Server (defaut) |
| Metadata generation | Server          |
| Static content      | Server          |
| Layout composition  | Server          |

### Pattern: Isoler le Client

```tsx
// app/page.tsx - SERVER (pas de directive)
import { HeroSection } from '@/components/sections/home/HeroSection';

export default function HomePage() {
  const products = await getProducts(); // Server-side

  return (
    <>
      <HeroSection /> {/* Client isole */}
      <ProductGrid products={products} /> {/* Server, passe data */}
    </>
  );
}

// components/sections/home/HeroSection.tsx - CLIENT
('use client');

import { useScrollPosition } from '@/hooks/useScrollPosition';

export function HeroSection() {
  const scrollY = useScrollPosition(); // Hook client necessaire
  // ...
}
```

---

## 4. CONVENTIONS DE CODE

### Naming

| Element           | Convention         | Exemple                   |
| ----------------- | ------------------ | ------------------------- |
| Fichier composant | PascalCase         | `ProductCard.tsx`         |
| Fichier hook      | camelCase          | `useCart.ts`              |
| Fichier util      | camelCase          | `formatPrice.ts`          |
| Constante         | SCREAMING_SNAKE    | `FREE_SHIPPING_THRESHOLD` |
| Type/Interface    | PascalCase         | `Product`, `CartItem`     |
| Props interface   | PascalCase + Props | `ProductCardProps`        |

### Ordre des Imports

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// 2. Librairies externes
import { Heart, ShoppingBag } from 'lucide-react';

// 3. Components internes
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';

// 4. Features/Hooks
import { useCartStore } from '@/features/cart';
import { useScrollPosition } from '@/hooks/useScrollPosition';

// 5. Lib/Utils
import { cn } from '@/lib/utils';
import { SHIPPING_COST } from '@/lib/constants';

// 6. Types
import type { Product, CartItem } from '@/types';

// 7. Data (mock)
import { products } from '@/data/products';
```

### Structure d'un Composant

```tsx
'use client'; // Si necessaire, toujours en premiere ligne

// Imports (dans l'ordre ci-dessus)
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

// Types/Interfaces du composant
interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
}

// Composant principal (export nomme)
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // 1. Hooks
  const [isHovered, setIsHovered] = useState(false);

  // 2. Derived state / computed values
  const isLowStock = product.stock <= 3;

  // 3. Handlers
  const handleClick = () => {
    onAddToCart?.(product.id);
  };

  // 4. Early returns (loading, error, empty states)
  if (!product) return null;

  // 5. Render
  return <div className="...">{/* JSX */}</div>;
}
```

---

## 5. PATTERNS RECOMMANDES

### Pattern: Composition over Props Drilling

```tsx
// MAL: Props drilling
<Page>
  <Section user={user} cart={cart} onUpdate={onUpdate}>
    <SubSection user={user} cart={cart} onUpdate={onUpdate}>
      <Component user={user} cart={cart} onUpdate={onUpdate} />
    </SubSection>
  </Section>
</Page>

// BIEN: Composition
<Page>
  <Section>
    <UserContext.Provider value={user}>
      <CartActions>
        <Component />
      </CartActions>
    </UserContext.Provider>
  </Section>
</Page>
```

### Pattern: Hooks pour Logique Metier

```tsx
// MAL: Logique dans composant
function CheckoutForm() {
  const [formData, setFormData] = useState({...});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitOrder(formData);
      // ...
    } catch (e) {
      setError(e);
    }
    setIsSubmitting(false);
  };

  // 100+ lignes de logique...
}

// BIEN: Logique dans hook
function CheckoutForm() {
  const { formData, handleChange, handleSubmit, isSubmitting, error } = useCheckout();

  return (
    <form onSubmit={handleSubmit}>
      {/* JSX uniquement */}
    </form>
  );
}
```

### Pattern: Constantes Centralisees

```typescript
// lib/constants.ts
export const SHIPPING = {
  COST: 5.9,
  FREE_THRESHOLD: 100,
} as const;

export const STOCK = {
  LOW_THRESHOLD: 3,
} as const;

// Utilisation
import { SHIPPING, STOCK } from '@/lib/constants';

const isLowStock = product.stock <= STOCK.LOW_THRESHOLD;
const shipping = subtotal >= SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.COST;
```

### Pattern: Types Stricts

```typescript
// BIEN: Types explicites
interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  onAddToCart?: (productId: string, size: Size) => void;
}

// MAL: any ou types implicites
interface ProductCardProps {
  product: any;
  variant?: string;
  onAddToCart?: Function;
}
```

---

## 6. ANTI-PATTERNS A EVITER

### Anti-pattern: Mega Composant

```tsx
// MAL: 300+ lignes, multiple responsabilites
export function ProductPage() {
  // State pour gallery
  // State pour size selection
  // State pour cart
  // State pour favorites
  // Handlers pour tout
  // JSX de 200 lignes
}

// BIEN: Composition de composants focuses
export function ProductPage() {
  return (
    <>
      <ProductGallery images={product.images} />
      <ProductInfo product={product} />
      <ProductActions product={product} />
    </>
  );
}
```

### Anti-pattern: Duplication de Code

```tsx
// MAL: Meme icone definie 3 fois
// Header.tsx
function TikTokIcon() { ... }

// Footer.tsx
function TikTokIcon() { ... }

// page.tsx
function TikTokIcon() { ... }

// BIEN: Icone partagee
// components/icons/TikTokIcon.tsx
export function TikTokIcon({ className }: { className?: string }) { ... }

// Utilisation partout
import { TikTokIcon } from '@/components/icons/TikTokIcon';
```

### Anti-pattern: Client inutile

```tsx
// MAL: Full client pour du contenu statique
'use client';

export default function AboutPage() {
  return (
    <div>
      <h1>A propos</h1>
      <p>Notre histoire...</p>
      {/* Aucune interactivite */}
    </div>
  );
}

// BIEN: Server component (pas de directive)
export default function AboutPage() {
  return (
    <div>
      <h1>A propos</h1>
      <p>Notre histoire...</p>
    </div>
  );
}
```

### Anti-pattern: Logique dans JSX

```tsx
// MAL: Logique complexe inline
return (
  <div>
    {items
      .filter((item) => item.status === 'active')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((item) => (
        <Card key={item.id}>
          {item.price > 100 ? (
            <Badge>Premium</Badge>
          ) : item.price > 50 ? (
            <Badge>Standard</Badge>
          ) : null}
        </Card>
      ))}
  </div>
);

// BIEN: Logique extraite
const activeItems = useMemo(
  () =>
    items
      .filter((item) => item.status === 'active')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5),
  [items]
);

const getBadgeVariant = (price: number) => {
  if (price > 100) return 'premium';
  if (price > 50) return 'standard';
  return null;
};

return (
  <div>
    {activeItems.map((item) => (
      <Card key={item.id}>
        {getBadgeVariant(item.price) && <Badge variant={getBadgeVariant(item.price)} />}
      </Card>
    ))}
  </div>
);
```

---

## 7. ACCESSIBILITE (OBLIGATOIRE)

### Checklist Minimale

- [ ] `aria-label` sur tous les boutons icones
- [ ] `alt` descriptif sur toutes les images
- [ ] Focus visible sur elements interactifs
- [ ] Structure semantique (`<header>`, `<main>`, `<nav>`, `<footer>`)
- [ ] Labels associes aux inputs
- [ ] Contraste suffisant (WCAG AA)

### Exemples

```tsx
// Bouton icone
<button
  onClick={handleFavorite}
  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
>
  <Heart className={cn(isFavorite && 'fill-current')} />
</button>

// Image
<Image
  src={product.images[0]}
  alt={`${product.name} - ${product.colors[0].name}`}
  // pas juste alt="product"
/>

// Form
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

---

## 8. PERFORMANCE

### Optimisation Images

```tsx
// Toujours specifier sizes
<Image
  src={product.images[0]}
  alt={product.name}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
/>

// Priority uniquement sur above-the-fold
<Image priority={isAboveFold} ... />
```

### Eviter Re-renders

```tsx
// Utiliser useCallback pour handlers passes en props
const handleAddToCart = useCallback(
  (size: Size) => {
    addItem(product.id, size);
  },
  [product.id, addItem]
);

// Utiliser useMemo pour calculs couteux
const sortedProducts = useMemo(() => products.sort((a, b) => b.price - a.price), [products]);
```

### Throttle/Debounce

```typescript
// hooks/useScrollPosition.ts
import { useState, useEffect } from 'react';

export function useScrollPosition(throttleMs = 100) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}
```

---

## 9. VERIFICATION PRE-COMMIT

### Checklist Manuelle

- [ ] Fichier sous la limite de lignes
- [ ] Pas de `'use client'` si non necessaire
- [ ] Imports dans le bon ordre
- [ ] Pas de `any` TypeScript
- [ ] aria-labels presents
- [ ] Pas de duplication de code
- [ ] Logique extraite dans hooks si complexe

### Scripts Recommandes

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "validate": "npm run lint && npm run type-check"
  }
}
```

---

_Best Practices LOLETT - Staff Engineer Frontend_
