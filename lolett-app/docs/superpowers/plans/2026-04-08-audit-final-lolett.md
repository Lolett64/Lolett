# Audit Final LOLETT — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger tous les problèmes bloquants et importants identifiés lors de l'audit pré-rendu final du site LOLETT.

**Architecture:** Fixes en 4 axes — (1) Code Next.js (routes, meta, SEO), (2) Base de données Supabase via API REST, (3) Fichiers statiques (robots, sitemap, favicon), (4) Nettoyage données de test.

**Tech Stack:** Next.js 14 App Router, Supabase REST API, TypeScript

---

## Fichiers concernés

| Action | Fichier |
|--------|---------|
| Modifier | `app/page.tsx` — OG image + suppression sections orphelines du fallback |
| Modifier | `components/sections/home-v3/NewArrivalsSection.tsx` — lien `/shop/nouveautes` → `/nouveautes` |
| Créer | `app/robots.ts` — robots.txt dynamique |
| Créer | `app/sitemap.ts` — sitemap.xml dynamique |
| Créer | `app/opengraph-image.jpg` (ou `public/og-image.jpg`) — image OG statique |
| DB | Désactiver sections `collections` + `testimonials` dans `page_sections` |
| DB | Réduire produits `is_new=true` → seulement les 8 plus récents |
| DB | Mettre à jour images CMS `collections` avec vraies photos locales |
| DB | Supprimer les 2 commandes de test |
| DB | Remplir `email_settings` (type, active, subject) |

---

## Task 1 : Corriger le lien "Voir toute la sélection" dans NewArrivalsSection

**Problème:** Le lien pointe vers `/shop/nouveautes` qui n'existe pas — la vraie page est `/nouveautes`.

**Fichier:** `components/sections/home-v3/NewArrivalsSection.tsx`

- [ ] **Step 1: Corriger le href**

Dans `NewArrivalsSection.tsx`, remplacer :
```tsx
href="/shop/nouveautes"
```
par :
```tsx
href="/nouveautes"
```
(Apparaît deux fois dans le fichier — desktop et mobile.)

- [ ] **Step 2: Vérifier TypeScript**
```bash
cd lolett-app && npx tsc --noEmit
```
Expected: aucune erreur

- [ ] **Step 3: Commit**
```bash
git add components/sections/home-v3/NewArrivalsSection.tsx
git commit -m "fix: lien nouveautés /shop/nouveautes → /nouveautes"
```

---

## Task 2 : Désactiver les sections orphelines en DB (collections + testimonials)

**Problème:** `page_sections` DB a `collections` et `testimonials` visibles pour la home, mais `home/page.tsx` ne les implémente pas → silencieusement ignorées mais confus en admin.

**Fichier:** DB Supabase via REST API

- [ ] **Step 1: Désactiver `collections` et `testimonials` dans page_sections**

```bash
SUPABASE_URL="https://utgwrfqnaoggckfruzzo.supabase.co"
SERVICE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY lolett-app/.env.local | cut -d= -f2)"

# Désactiver collections
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/page_sections?page_slug=eq.home&section_key=eq.collections" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"visible": false}'

# Désactiver testimonials
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/page_sections?page_slug=eq.home&section_key=eq.testimonials" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"visible": false}'
```

- [ ] **Step 2: Vérifier**
```bash
curl -s "${SUPABASE_URL}/rest/v1/page_sections?page_slug=eq.home&section_key=in.(collections,testimonials)&select=section_key,visible" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}"
```
Expected: `[{"section_key":"collections","visible":false},{"section_key":"testimonials","visible":false}]`

---

## Task 3 : Réduire les produits "Nouveau" (36 → 8 max)

**Problème:** 64% du catalogue est marqué `is_new=true`, vidant le badge de sens.

**Stratégie:** Garder "Nouveau" uniquement sur les 8 produits les plus récemment ajoutés (selon `created_at`).

- [ ] **Step 1: Identifier les 8 produits à garder**
```bash
SUPABASE_URL="https://utgwrfqnaoggckfruzzo.supabase.co"
SERVICE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY lolett-app/.env.local | cut -d= -f2)"

curl -s "${SUPABASE_URL}/rest/v1/products?is_new=eq.true&select=id,name,created_at&order=created_at.desc&limit=8" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | python3 -m json.tool
```

- [ ] **Step 2: Mettre tous les produits is_new=false**
```bash
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/products?is_new=eq.true" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"is_new": false}'
```

- [ ] **Step 3: Remettre is_new=true sur les 8 les plus récents**

(Utiliser les IDs récupérés en step 1)
```bash
# Pour chaque ID des 8 produits récents :
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/products?id=eq.{ID}" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"is_new": true}'
```

- [ ] **Step 4: Vérifier**
```bash
curl -s "${SUPABASE_URL}/rest/v1/products?is_new=eq.true&select=name&order=created_at.desc" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'{len(d)} produits Nouveau')"
```
Expected: `8 produits Nouveau`

---

## Task 4 : Mettre à jour les images CMS collections (Unsplash → photos locales)

**Problème:** `site_content` section `collections` utilise des images Unsplash génériques.

**Fix:** Remplacer par des photos produits réelles déjà dans `/public/images/products/`.

- [ ] **Step 1: Mettre à jour l'image collection femme**
```bash
SUPABASE_URL="https://utgwrfqnaoggckfruzzo.supabase.co"
SERVICE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY lolett-app/.env.local | cut -d= -f2)"

curl -s -X PATCH "${SUPABASE_URL}/rest/v1/site_content?section=eq.collections&key=eq.femme_image" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"value": "/images/products/isa-marron/1.jpg"}'
```

- [ ] **Step 2: Mettre à jour l'image collection homme**
```bash
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/site_content?section=eq.collections&key=eq.homme_image" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"value": "/images/products/emoticoeurs-noir-homme/1.jpg"}'
```

- [ ] **Step 3: Vérifier**
```bash
curl -s "${SUPABASE_URL}/rest/v1/site_content?section=eq.collections&key=in.(femme_image,homme_image)&select=key,value" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | python3 -m json.tool
```

---

## Task 5 : Supprimer les commandes de test

**Problème:** 2 commandes de test en DB à nettoyer avant lancement.

- [ ] **Step 1: Voir les commandes existantes**
```bash
SUPABASE_URL="https://utgwrfqnaoggckfruzzo.supabase.co"
SERVICE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY lolett-app/.env.local | cut -d= -f2)"

curl -s "${SUPABASE_URL}/rest/v1/orders?select=id,order_number,total,status,created_at&order=created_at.desc" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | python3 -m json.tool
```

- [ ] **Step 2: Supprimer toutes les commandes de test**
```bash
curl -s -X DELETE "${SUPABASE_URL}/rest/v1/orders?id=neq.00000000-0000-0000-0000-000000000000" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Prefer: return=representation"
```

- [ ] **Step 3: Vérifier**
```bash
curl -s "${SUPABASE_URL}/rest/v1/orders?select=count" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Prefer: count=exact" -I | grep content-range
```
Expected: `content-range: */0`

---

## Task 6 : Ajouter l'image OG sur la home page

**Problème:** `app/page.tsx` metadata `openGraph` n'a pas d'image → partages réseaux sans aperçu.

**Fichier:** `app/page.tsx` + `public/og-lolett.jpg` (copie d'une photo produit en attendant une vraie OG)

- [ ] **Step 1: Créer l'image OG statique**
```bash
cp lolett-app/public/images/products/isa-marron/1.jpg lolett-app/public/og-lolett.jpg
```

- [ ] **Step 2: Ajouter l'image OG dans le metadata de `app/page.tsx`**

Dans le bloc `openGraph` :
```tsx
openGraph: {
  title: 'LOLETT — Mode Homme & Femme | Looks complets prêt à sortir',
  description: 'Des looks complets pensés au Sud. Pour lui, pour elle. Livraison offerte dès 100 €.',
  url: BASE_URL,
  siteName: 'LOLETT',
  locale: 'fr_FR',
  type: 'website',
  images: [
    {
      url: `${BASE_URL}/og-lolett.jpg`,
      width: 800,
      height: 1000,
      alt: 'LOLETT — Mode Méditerranéenne',
    },
  ],
},
twitter: {
  card: 'summary_large_image',
  title: 'LOLETT — Mode Homme & Femme | Looks complets prêt à sortir',
  description: 'Des looks complets pensés au Sud. Pour lui, pour elle.',
  images: [`${BASE_URL}/og-lolett.jpg`],
},
```

- [ ] **Step 3: Vérifier TypeScript**
```bash
cd lolett-app && npx tsc --noEmit
```

- [ ] **Step 4: Commit**
```bash
git add app/page.tsx public/og-lolett.jpg
git commit -m "feat(seo): ajouter image OG sur la home page"
```

---

## Task 7 : Créer robots.txt dynamique

**Problème:** Pas de `robots.txt` → crawlers non guidés, pages admin potentiellement indexées.

**Fichier:** `app/robots.ts` (Next.js App Router)

- [ ] **Step 1: Créer `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin-login', '/api/', '/test/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Vérifier TypeScript**
```bash
cd lolett-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add app/robots.ts
git commit -m "feat(seo): ajouter robots.txt dynamique"
```

---

## Task 8 : Créer sitemap.xml dynamique

**Problème:** Pas de sitemap → Google ne découvre pas les pages produits.

**Fichier:** `app/sitemap.ts`

- [ ] **Step 1: Créer `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';
import { productRepository } from '@/lib/adapters';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

  const products = await productRepository.findMany();

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/produit/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/shop/femme`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/shop/homme`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/nouveautes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/notre-histoire`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/cgv`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  return [...staticPages, ...productUrls];
}
```

- [ ] **Step 2: Vérifier TypeScript**
```bash
cd lolett-app && npx tsc --noEmit
```

- [ ] **Step 3: Commit**
```bash
git add app/sitemap.ts
git commit -m "feat(seo): ajouter sitemap.xml dynamique avec 56 produits"
```

---

## Task 9 : Vérifier et corriger le favicon

**Problème:** Le favicon pourrait être le Next.js par défaut.

**Fichier:** `app/favicon.ico` (Next.js utilise ce fichier automatiquement)

- [ ] **Step 1: Vérifier le favicon actuel**
```bash
ls -la lolett-app/app/favicon.ico lolett-app/public/favicon.ico 2>/dev/null
file lolett-app/app/favicon.ico 2>/dev/null
```

- [ ] **Step 2: Si favicon par défaut — créer depuis le logo**
```bash
# Vérifier si le logo est exploitable
ls -la "lolett-app/public/images/Logo Lolett.jpeg"
# Copier comme favicon (navigateurs acceptent JPEG renommé en ico pour les bases)
cp "lolett-app/public/images/Logo Lolett.jpeg" lolett-app/app/favicon.ico
```

- [ ] **Step 3: Ajouter icon metadata dans `app/layout.tsx`**

Vérifier que `app/layout.tsx` a :
```tsx
export const metadata: Metadata = {
  // ...
  icons: {
    icon: '/favicon.ico',
  },
};
```

- [ ] **Step 4: Commit si changement**
```bash
git add app/favicon.ico
git commit -m "fix: favicon Lolett (remplace favicon Next.js par défaut)"
```

---

## Task 10 : Corriger email_settings en DB

**Problème:** Les `email_settings` ont type/active/subject vides → emails transactionnels potentiellement non envoyés.

- [ ] **Step 1: Voir l'état actuel**
```bash
SUPABASE_URL="https://utgwrfqnaoggckfruzzo.supabase.co"
SERVICE_KEY="$(grep SUPABASE_SERVICE_ROLE_KEY lolett-app/.env.local | cut -d= -f2)"

curl -s "${SUPABASE_URL}/rest/v1/email_settings?select=*" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | python3 -m json.tool
```

- [ ] **Step 2: Activer les emails transactionnels si `active=false`**

Pour chaque email type (`order_confirmation`, `order_shipped`, `order_delivered`, `welcome_newsletter`) :
```bash
curl -s -X PATCH "${SUPABASE_URL}/rest/v1/email_settings?type=eq.order_confirmation" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"active": true}'
```

- [ ] **Step 3: Vérifier**
```bash
curl -s "${SUPABASE_URL}/rest/v1/email_settings?select=type,active,subject" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" | python3 -m json.tool
```

---

## Task 11 : Protéger les pages /test/* en production

**Problème:** `/test/contact-a`, `/test/contact-b`, `/test/contact-c`, `/test/footer-preview` accessibles publiquement en prod.

**Fichier:** `middleware.ts`

- [ ] **Step 1: Lire le middleware actuel**
```bash
cat lolett-app/middleware.ts
```

- [ ] **Step 2: Ajouter la protection des routes /test en production**

Dans `middleware.ts`, ajouter avant le return final :
```ts
// Bloquer les pages /test en production
if (request.nextUrl.pathname.startsWith('/test') && process.env.NODE_ENV === 'production') {
  return NextResponse.redirect(new URL('/', request.url));
}
```

- [ ] **Step 3: Vérifier TypeScript**
```bash
cd lolett-app && npx tsc --noEmit
```

- [ ] **Step 4: Commit**
```bash
git add middleware.ts
git commit -m "fix: bloquer routes /test en production"
```

---

## Task 12 : Vérifier le lint final et lancer le build

- [ ] **Step 1: Lint**
```bash
cd lolett-app && npm run lint
```
Expected: 0 errors (warnings acceptés)

- [ ] **Step 2: TypeScript check**
```bash
npx tsc --noEmit
```
Expected: aucune erreur

- [ ] **Step 3: Build de production**
```bash
npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit final**
```bash
git add -A
git commit -m "chore: audit final pré-livraison — SEO, DB, nettoyage"
```

---

## Points hors scope (à faire manuellement)

- **Stripe live keys** : À obtenir depuis le dashboard Stripe et configurer dans Vercel env vars
- **Photo fondatrice** : Remplacer `public/images/fondatrice-placeholder.jpg` par la vraie photo
- **Descriptions produits** : Relecture manuelle dans l'admin
- **Codes promo** : À créer dans admin si nécessaire avant lancement
