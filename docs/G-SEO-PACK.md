# Document G — SEO Pack (Minimum Viable)

---

## Objectif du document

Définir la stratégie SEO minimale pour le lancement : pages indexables, meta tags, données structurées, performance technique et mots-clés cibles.

## Contenu

Pages indexables, templates de meta tags, corrections des catégories existantes, checklist technique SEO, mots-clés cibles.

## Hypothèses

- Le SEO MVP se concentre sur le on-page (balises, contenu, technique).
- Pas de stratégie de backlinks ni de content marketing en V1.
- Les catégories SEO existantes dans `data/categories.ts` ont des problèmes d'encodage à corriger.

## Points à valider

- Voir section "Questions ouvertes" en fin de document.

---

## 1. Pages indexables

| Route | Indexable | Priorité sitemap | Fréquence mise à jour |
|---|---|---|---|
| `/` | Oui | 1.0 | weekly |
| `/nouveautes` | Oui | 0.9 | daily |
| `/shop/homme` | Oui | 0.8 | weekly |
| `/shop/femme` | Oui | 0.8 | weekly |
| `/shop/homme/[categorie]` | Oui | 0.7 | weekly |
| `/shop/femme/[categorie]` | Oui | 0.7 | weekly |
| `/produit/[slug]` | Oui | 0.6 | monthly |
| `/contact` | Oui | 0.3 | yearly |
| `/mentions-legales` | Oui (ou noindex) | 0.1 | yearly |
| `/cgv` | Oui (ou noindex) | 0.1 | yearly |
| `/politique-confidentialite` | Oui (ou noindex) | 0.1 | yearly |
| `/politique-retours` | Oui (ou noindex) | 0.1 | yearly |

### Pages NON indexables

| Route | Raison |
|---|---|
| `/favoris` | Page personnelle, pas de contenu SEO |
| `/panier` | Page personnelle |
| `/checkout` | Tunnel de conversion |
| `/checkout/success` | Page post-achat |
| `/api/*` | Routes API |

---

## 2. Templates meta tags

### Accueil

```typescript
export const metadata: Metadata = {
  title: 'LOLETT — Mode Homme & Femme | Looks complets, style accessible',
  description: 'Découvrez LOLETT : des looks complets homme et femme, sélectionnés avec soin. Pièces stylées, prix accessibles, livraison France.',
  openGraph: {
    title: 'LOLETT — Mode Homme & Femme',
    description: 'Des looks complets, du style et zéro prise de tête.',
    type: 'website',
    url: 'https://lolett.fr',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};
```

### Page catégorie

```typescript
// Template dynamique
export function generateMetadata({ params }): Metadata {
  const category = getCategoryBySlug(params.gender, params.category);
  return {
    title: category.seoTitle,  // ex: "Chemises Homme | LOLETT"
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
    },
  };
}
```

### Fiche produit

```typescript
export function generateMetadata({ params }): Metadata {
  const product = getProductBySlug(params.slug);
  return {
    title: `${product.name} | LOLETT`,
    description: `${product.description.slice(0, 155)}`,
    openGraph: {
      title: `${product.name} | LOLETT`,
      description: product.description,
      type: 'product',
      images: [{ url: product.images[0] }],
    },
  };
}
```

### Nouveautés

```typescript
export const metadata: Metadata = {
  title: 'Nouveautés | LOLETT — Les dernières pièces mode',
  description: 'Découvrez les derniers arrivages LOLETT : nouvelles pièces homme et femme, looks frais et style accessible.',
};
```

### Contact

```typescript
export const metadata: Metadata = {
  title: 'Contact | LOLETT — On papote',
  description: 'Une question ? Une envie ? Contactez LOLETT. On répond vite et avec le sourire.',
};
```

---

## 3. Catégories SEO — Corrections et mise à jour

### Problèmes identifiés dans `data/categories.ts`

1. **Encodage cassé** : les accents sont corrompus (`DÃ©couvrez` au lieu de `Découvrez`).
2. **Catégories du cahier des charges** : hauts, bas, chaussures, accessoires. Le fichier actuel a : chemises, pantalons, robes, tops — **décalage à corriger**.
3. **Pas de catégories chaussures** dans les données existantes.

### Catégories corrigées (alignées sur le cahier des charges)

```typescript
export const categories: Category[] = [
  // HOMME
  {
    id: 'cat-h-hauts',
    gender: 'homme',
    slug: 'hauts',
    label: 'Hauts',
    seoTitle: 'Hauts Homme — LOLETT | T-shirts, Chemises, Pulls',
    seoDescription: 'Découvrez la sélection LOLETT de hauts pour homme : t-shirts, chemises, pulls. Des pièces stylées, validées par LOLETT.',
  },
  {
    id: 'cat-h-bas',
    gender: 'homme',
    slug: 'bas',
    label: 'Bas',
    seoTitle: 'Bas Homme — LOLETT | Pantalons, Jeans, Shorts',
    seoDescription: 'Pantalons, jeans et shorts homme sélectionnés par LOLETT. Des coupes qui tombent bien, pour tous les styles.',
  },
  {
    id: 'cat-h-chaussures',
    gender: 'homme',
    slug: 'chaussures',
    label: 'Chaussures',
    seoTitle: 'Chaussures Homme — LOLETT | Baskets, Boots, Mocassins',
    seoDescription: 'Chaussures homme LOLETT : baskets, boots, mocassins. Les paires qui complètent le look.',
  },
  {
    id: 'cat-h-accessoires',
    gender: 'homme',
    slug: 'accessoires',
    label: 'Accessoires',
    seoTitle: 'Accessoires Homme — LOLETT | Sacs, Ceintures, Bijoux',
    seoDescription: 'Accessoires homme LOLETT. Les détails qui font tout, sélectionnés avec soin.',
  },
  // FEMME
  {
    id: 'cat-f-hauts',
    gender: 'femme',
    slug: 'hauts',
    label: 'Hauts',
    seoTitle: 'Hauts Femme — LOLETT | Tops, Blouses, T-shirts',
    seoDescription: 'Tops, blouses et t-shirts femme LOLETT. Des pièces qu\'on enfile sans hésiter.',
  },
  {
    id: 'cat-f-bas',
    gender: 'femme',
    slug: 'bas',
    label: 'Bas',
    seoTitle: 'Bas Femme — LOLETT | Jupes, Pantalons, Shorts',
    seoDescription: 'Jupes, pantalons et shorts femme sélectionnés par LOLETT. Style et confort, toujours.',
  },
  {
    id: 'cat-f-chaussures',
    gender: 'femme',
    slug: 'chaussures',
    label: 'Chaussures',
    seoTitle: 'Chaussures Femme — LOLETT | Baskets, Sandales, Boots',
    seoDescription: 'Chaussures femme LOLETT : baskets, sandales, boots. La paire qui manquait au look.',
  },
  {
    id: 'cat-f-accessoires',
    gender: 'femme',
    slug: 'accessoires',
    label: 'Accessoires',
    seoTitle: 'Accessoires Femme — LOLETT | Sacs, Bijoux, Foulards',
    seoDescription: 'Accessoires femme LOLETT. Ce n\'est jamais "en trop".',
  },
];
```

---

## 4. Mots-clés cibles

### Principaux (volume moyen, concurrence modérée)

| Mot-clé | Page cible | Volume estimé |
|---|---|---|
| look complet homme | `/shop/homme` | Moyen |
| look complet femme | `/shop/femme` | Moyen |
| tenue homme complète | `/shop/homme` | Moyen |
| tenue femme complète | `/shop/femme` | Moyen |
| mode accessible | `/` (accueil) | Moyen |
| boutique mode en ligne | `/` (accueil) | Élevé |

### Longue traîne (par catégorie)

| Mot-clé | Page cible |
|---|---|
| t-shirt homme stylé | `/shop/homme/hauts` |
| pantalon homme tendance | `/shop/homme/bas` |
| baskets homme look | `/shop/homme/chaussures` |
| accessoires homme mode | `/shop/homme/accessoires` |
| top femme tendance | `/shop/femme/hauts` |
| jupe femme été | `/shop/femme/bas` |
| sandales femme mode | `/shop/femme/chaussures` |
| bijoux femme tendance | `/shop/femme/accessoires` |

### Intégration dans le contenu

- Les mots-clés doivent apparaître **naturellement** dans les `<h1>`, descriptions, et textes de page.
- Pas de keyword stuffing.
- Le ton LOLETT prime toujours sur l'optimisation SEO.

---

## 5. Données structurées (Schema.org)

### Fiche produit — JSON-LD

```typescript
// À ajouter dans app/produit/[slug]/page.tsx
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images,
  brand: {
    '@type': 'Brand',
    name: 'LOLETT',
  },
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'EUR',
    availability: product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    url: `https://lolett.fr/produit/${product.slug}`,
  },
};

// Dans le JSX
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
/>
```

### Organisation — JSON-LD (accueil)

```typescript
const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LOLETT',
  url: 'https://lolett.fr',
  logo: 'https://lolett.fr/logo.svg',
  sameAs: [
    'https://instagram.com/lolett',
    'https://tiktok.com/@lolett',
    'https://facebook.com/lolett',
  ],
};
```

### Breadcrumb — JSON-LD

```typescript
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://lolett.fr' },
    { '@type': 'ListItem', position: 2, name: 'Homme', item: 'https://lolett.fr/shop/homme' },
    { '@type': 'ListItem', position: 3, name: 'Hauts', item: 'https://lolett.fr/shop/homme/hauts' },
  ],
};
```

---

## 6. Checklist technique SEO

| # | Vérification | Statut |
|---|---|---|
| 1 | `<title>` unique par page | [ ] |
| 2 | `<meta name="description">` unique par page (150-160 car.) | [ ] |
| 3 | Un seul `<h1>` par page | [ ] |
| 4 | Hiérarchie de titres logique (h1 > h2 > h3) | [ ] |
| 5 | URLs propres avec slugs (pas d'IDs) | [ ] |
| 6 | `sitemap.xml` dynamique contenant toutes les pages indexables | [ ] |
| 7 | `robots.txt` : autoriser crawl, exclure `/checkout`, `/api`, `/favoris`, `/panier` | [ ] |
| 8 | Images : attribut `alt` descriptif sur toutes les images | [ ] |
| 9 | Images : `<Image>` Next.js avec `width` et `height` | [ ] |
| 10 | Images : lazy loading sous le fold (natif Next.js) | [ ] |
| 11 | Open Graph tags (`og:title`, `og:description`, `og:image`) sur les fiches produit | [ ] |
| 12 | Twitter Card tags sur les fiches produit | [ ] |
| 13 | Schema.org JSON-LD Product sur les fiches produit | [ ] |
| 14 | Schema.org JSON-LD Organization sur l'accueil | [ ] |
| 15 | Schema.org JSON-LD BreadcrumbList sur les pages catégories | [ ] |
| 16 | Canonical URLs sur toutes les pages | [ ] |
| 17 | Pas de contenu dupliqué entre pages homme/femme | [ ] |
| 18 | Temps de chargement < 2s (FCP) | [ ] |
| 19 | Score Lighthouse SEO > 90 | [ ] |
| 20 | Pas de liens cassés (404) | [ ] |

---

## 7. robots.txt recommandé

```
# robots.txt — LOLETT
User-agent: *
Allow: /

Disallow: /api/
Disallow: /checkout
Disallow: /panier
Disallow: /favoris

Sitemap: https://lolett.fr/sitemap.xml
```

---

## 8. Actions post-lancement

| # | Action | Quand |
|---|---|---|
| 1 | Soumettre sitemap à Google Search Console | Jour du lancement |
| 2 | Vérifier l'indexation après 1 semaine | J+7 |
| 3 | Soumettre sitemap à Bing Webmaster Tools | J+1 |
| 4 | Vérifier les Core Web Vitals dans Search Console | J+14 |
| 5 | Configurer Google Analytics 4 (si choisi) | Avant le lancement |
| 6 | Monitorer les erreurs 404 dans Search Console | Continu |

---

## Questions ouvertes

| # | Question | Impact |
|---|---|---|
| 1 | Nom de domaine final ? (`lolett.fr`, `lolett.com`, autre) | Toutes les URLs, canonical, sitemap |
| 2 | Google Analytics 4 ou autre solution analytics ? | Bandeau cookies, RGPD |
| 3 | Les catégories actuelles (chemises, pantalons, robes, tops) doivent-elles être remplacées par celles du cahier des charges (hauts, bas, chaussures, accessoires) ? | Données + SEO |
| 4 | Les liens réseaux sociaux sont-ils déjà créés ? (URLs nécessaires pour Schema.org) | Données structurées |

---

*Document G — SEO Pack v1.0 — Généré le 17/02/2026*
