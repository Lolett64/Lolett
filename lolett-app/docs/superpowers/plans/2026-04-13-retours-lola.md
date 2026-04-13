# Retours Lola — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter les 7 retours de Lola du 12/04/2026 : tailles numériques, looks 404, bannières shop, photo CMS, contact CMS, taille hero, produits unisexes.

**Architecture:** Changements ciblés dans types/index.ts (tailles + genre), composants UI (ShopContentV4, HeroSection, NouveautesLooks), nouvelle route `/looks/[id]`, et champs CMS via SQL INSERT dans site_content.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase, Tailwind CSS

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `types/index.ts` | Modifier — ajout tailles numériques + gender 'both' |
| `components/admin/product-form/types.ts` | Modifier — AVAILABLE_SIZES étendu |
| `app/api/webhooks/stripe/route.ts` | Modifier — VALID_SIZES étendu |
| `components/product/HeroProductPanel.tsx` | Modifier — liste tailles hardcodée |
| `components/product/nouveautes/NouveautesLooks.tsx` | Modifier — fix href + texte titre |
| `components/sections/home-v3/LooksSection.tsx` | Vérifier — href déjà bon |
| `app/looks/[id]/page.tsx` | Créer — page détail look |
| `components/product/ShopContentV4.tsx` | Modifier — heroImage optionnel + heroColor |
| `app/shop/femme/page.tsx` | Modifier — fond bleu, pas d'image Unsplash |
| `app/shop/homme/page.tsx` | Modifier — fond bleu, pas d'image Unsplash |
| `components/sections/home-v3/BrandStorySection.tsx` | Modifier — image depuis CMS |
| `components/sections/notre-histoire/OrigineSection.tsx` | Modifier — image depuis CMS |
| `components/sections/home-v3/HeroSection.tsx` | Modifier — réduire taille texte titre |
| `lib/adapters/supabase-product.ts` | Modifier — findMany inclut gender='both' |

---

## Task 1 : Tailles numériques (pantalons + chaussures + XXL + S/M + M/L)

**Files:**
- Modify: `types/index.ts`
- Modify: `components/admin/product-form/types.ts`
- Modify: `app/api/webhooks/stripe/route.ts`
- Modify: `components/product/HeroProductPanel.tsx`

- [ ] **Step 1 : Modifier le type Size dans types/index.ts**

```typescript
// types/index.ts — ligne 3, remplacer l'ancienne ligne
export type Size =
  | 'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  | '29' | '30' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38'
  | '39' | '40' | '41' | '42' | '43' | '44'
  | 'S/M' | 'M/L';
```

- [ ] **Step 2 : Mettre à jour AVAILABLE_SIZES dans l'admin**

```typescript
// components/admin/product-form/types.ts — ligne 1, remplacer
export const AVAILABLE_SIZES = [
  'TU', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '29', '30', '31', '32', '33', '34', '35', '36', '37', '38',
  '39', '40', '41', '42', '43', '44',
  'S/M', 'M/L',
] as const;
```

- [ ] **Step 3 : Mettre à jour VALID_SIZES dans le webhook Stripe**

```typescript
// app/api/webhooks/stripe/route.ts — lignes 8-16, remplacer
const VALID_SIZES = [
  'TU', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '29', '30', '31', '32', '33', '34', '35', '36', '37', '38',
  '39', '40', '41', '42', '43', '44',
  'S/M', 'M/L',
] as const;

const WebhookItemSchema = z.array(z.object({
  productId: z.string(),
  productName: z.string(),
  size: z.enum(VALID_SIZES),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
}));
```

- [ ] **Step 4 : Corriger le sélecteur hardcodé dans HeroProductPanel**

Trouver `components/product/HeroProductPanel.tsx:92` — remplacer `(['XS', 'S', 'M', 'L', 'XL'] as Size[])` par la liste dynamique depuis les tailles du produit :

```typescript
// Remplacer la ligne qui hardcode les tailles :
// AVANT :
{(['XS', 'S', 'M', 'L', 'XL'] as Size[]).map((size) => (

// APRÈS — utiliser les tailles du produit :
{product.sizes.map((size) => (
```

- [ ] **Step 5 : Vérifier TypeScript**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app && npx tsc --noEmit 2>&1 | head -30
```

Expected : aucune erreur liée à Size.

- [ ] **Step 6 : Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
git add types/index.ts components/admin/product-form/types.ts app/api/webhooks/stripe/route.ts components/product/HeroProductPanel.tsx
git commit -m "feat: étendre tailles — numérique 29-44, XXL, S/M, M/L"
```

---

## Task 2 : Looks 404 — créer la page + corriger liens + renommer titre

**Files:**
- Create: `app/looks/[id]/page.tsx`
- Modify: `components/product/nouveautes/NouveautesLooks.tsx`

- [ ] **Step 1 : Créer la page /looks/[id]**

```typescript
// app/looks/[id]/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { lookRepository, productRepository } from '@/lib/adapters';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const look = await lookRepository.findById(id);
  if (!look) return { title: 'Look introuvable' };
  return {
    title: `${look.title} — LOLETT`,
    description: look.shortPitch,
  };
}

export default async function LookPage({ params }: Props) {
  const { id } = await params;
  const look = await lookRepository.findById(id);
  if (!look) notFound();

  const products = await productRepository.findByIds(look.productIds);

  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6">
      <div className="max-w-[1200px] mx-auto">

        {/* Back */}
        <Link
          href="/nouveautes"
          className="inline-flex items-center gap-2 text-sm text-[#1B0B94]/60 hover:text-[#1B0B94] mb-10 transition-colors"
        >
          ← Retour aux Nouveautés
        </Link>

        {/* Cover */}
        <div className="relative aspect-[16/7] rounded-sm overflow-hidden mb-10">
          <Image
            src={look.coverImage}
            alt={look.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B0B94]/80 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#B89547] mb-2">{look.vibe}</p>
            <h1 className="font-[family-name:var(--font-newsreader)] text-4xl md:text-6xl text-white font-light">
              {look.title}
            </h1>
            <p className="text-white/70 text-sm mt-2">{look.shortPitch}</p>
          </div>
        </div>

        {/* Products */}
        <h2 className="font-[family-name:var(--font-newsreader)] text-2xl text-[#1B0B94] mb-8 italic">
          Les pièces du look
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/produit/${product.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#F5ECD8] mb-3">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <p className="text-[#1B0B94] text-sm font-medium">{product.name}</p>
              <p className="text-[#1B0B94]/60 text-sm">{product.price} €</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2 : Corriger le href dans NouveautesLooks.tsx (ligne 38)**

```typescript
// components/product/nouveautes/NouveautesLooks.tsx — ligne 38
// AVANT :
href={`/look/${look.id}`}

// APRÈS :
href={`/looks/${look.id}`}
```

- [ ] **Step 3 : Renommer "Nos Looks du Moment" → "Looks du Moment"**

```typescript
// components/product/nouveautes/NouveautesLooks.tsx — ligne ~25
// AVANT :
Nos Looks du Moment

// APRÈS :
Looks du Moment
```

- [ ] **Step 4 : Vérifier que lookRepository.findById existe**

```bash
grep -n "findById" /Users/trikilyes/Desktop/Privé/Lorett/lolett-app/lib/adapters/supabase-look.ts | head -5
```

Si absent, ajouter la méthode dans `supabase-look.ts` :

```typescript
async findById(id: string): Promise<Look | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('looks')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapLook(data);
}
```

Et l'exposer dans `lib/adapters/types.ts` interface LookRepository si nécessaire.

- [ ] **Step 5 : Vérifier productRepository.findByIds**

```bash
grep -n "findByIds" /Users/trikilyes/Desktop/Privé/Lorett/lolett-app/lib/adapters/supabase-product.ts | head -5
```

Si absent, ajouter dans `supabase-product.ts` :

```typescript
async findByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', ids);
  if (error || !data) return [];
  const products = await Promise.all(
    (data as DbProduct[]).map(async (row) => {
      const variants = await loadProductVariants(supabase, row.id);
      return mapProduct(row, variants);
    })
  );
  return products;
}
```

- [ ] **Step 6 : Build check**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7 : Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
git add app/looks/ components/product/nouveautes/NouveautesLooks.tsx lib/adapters/
git commit -m "fix: créer page /looks/[id], corriger liens looks 404, renommer titre"
```

---

## Task 3 : Bannières shop → fond bleu #2418a6

**Files:**
- Modify: `components/product/ShopContentV4.tsx`
- Modify: `app/shop/femme/page.tsx`
- Modify: `app/shop/homme/page.tsx`

- [ ] **Step 1 : Rendre heroImage optionnel dans ShopContentV4**

```typescript
// components/product/ShopContentV4.tsx
// Modifier l'interface :
interface ShopContentV4Props {
    gender: 'homme' | 'femme';
    products: Product[];
    categories: Category[];
    heroImage?: string;           // OPTIONNEL maintenant
    heroColor?: string;           // NOUVEAU — couleur de fond si pas d'image
    heroImagePosition?: string;
    heroImageScale?: number;
    heroTitle: string;
    heroSubtitle: string;
    activeCategory?: string;
    heroHeight?: string;
}
```

- [ ] **Step 2 : Modifier le rendu hero dans ShopContentV4**

```typescript
// Dans la fonction ShopContentV4, mettre à jour la destructuration :
const {
    gender, products, categories,
    heroImage,
    heroColor = '#2418a6',
    heroImagePosition = 'center 65%',
    heroImageScale = 1,
    heroTitle, heroSubtitle,
    activeCategory,
    heroHeight = "h-[35vh] min-h-[280px]",
} = props; // adapter selon la signature existante
```

Puis dans le JSX, remplacer le bloc hero (la `<div>` avec `<Image>`) par :

```tsx
{/* ═══ HERO ═══ */}
<div
  className={cn("relative overflow-hidden", heroHeight)}
  style={{ backgroundColor: heroColor }}
>
  {heroImage && (
    <>
      <Image
        src={heroImage}
        alt={heroTitle}
        fill
        className="object-cover"
        style={{
          objectPosition: heroImagePosition,
          transform: `scale(${heroImageScale})`
        }}
        priority
      />
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </>
  )}
  {!heroImage && (
    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${heroColor} 0%, ${heroColor}dd 100%)` }} />
  )}

  <div className="absolute inset-0 flex flex-col justify-end pb-12 px-6 sm:px-12 lg:px-20 max-w-[1600px] mx-auto">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-[1px] bg-[#B89547]" />
      <span className="font-sans text-sm uppercase tracking-[0.4em] text-[#B89547] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        {gender === 'homme' ? 'Pour Lui' : 'Pour Elle'}
      </span>
    </div>
    <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl text-white mb-4 leading-[0.9] tracking-tight">
      {heroTitle.split(' ')[0]} <span className="italic ml-4">{heroTitle.split(' ').slice(1).join(' ')}</span>
    </h1>
    <p className="max-w-xl text-sm md:text-base text-white/70 font-light leading-relaxed">
      {heroSubtitle}
    </p>
  </div>
</div>
```

- [ ] **Step 3 : Mettre à jour app/shop/femme/page.tsx**

```typescript
// app/shop/femme/page.tsx — supprimer heroImage, heroImagePosition, heroImageScale
<ShopContentV4
  gender="femme"
  products={products}
  categories={categories}
  heroColor="#2418a6"
  heroHeight="h-[35vh] min-h-[280px]"
  heroTitle="Collection Femme"
  heroSubtitle="Robes fluides, tops en lin. L'art de vivre à la mode du Sud-Ouest."
/>
```

- [ ] **Step 4 : Mettre à jour app/shop/homme/page.tsx**

```typescript
// app/shop/homme/page.tsx — supprimer heroImage, heroImagePosition, heroImageScale
<ShopContentV4
  gender="homme"
  products={products}
  categories={categories}
  heroColor="#2418a6"
  heroHeight="h-[35vh] min-h-[280px]"
  heroTitle="Collection Homme"
  heroSubtitle="Lin léger, coton premium. Tout ce qu'il faut pour un été au Sud."
/>
```

- [ ] **Step 5 : Build check**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6 : Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
git add components/product/ShopContentV4.tsx app/shop/femme/page.tsx app/shop/homme/page.tsx
git commit -m "feat: bannières shop — fond bleu #2418a6 au lieu des photos Unsplash"
```

---

## Task 4 : Photo "Mon histoire" modifiable via CMS

**Files:**
- Modify: `components/sections/home-v3/BrandStorySection.tsx`
- Modify: `components/sections/notre-histoire/OrigineSection.tsx`
- Modify: `app/api/admin/content/route.ts` (si besoin de seed SQL)

- [ ] **Step 1 : Rendre l'image BrandStory dynamique via CMS**

```typescript
// components/sections/home-v3/BrandStorySection.tsx — ligne ~30
// AVANT :
src="/images/fondatrice.jpg"

// APRÈS :
src={content?.founder_image || '/images/fondatrice.jpg'}
```

- [ ] **Step 2 : Rendre l'image OrigineSection (Notre Histoire) dynamique**

```typescript
// components/sections/notre-histoire/OrigineSection.tsx
// Trouver la ligne avec fondatrice-placeholder.jpg et remplacer par :
src={content?.founder_image || '/images/fondatrice.jpg'}
```

Vérifier que `OrigineSection` reçoit bien un prop `content` (ou ajouter l'appel `getSiteContent('notre_histoire')` dans la page parente si nécessaire).

- [ ] **Step 3 : Insérer le champ en BDD via l'API Supabase admin**

Exécuter dans le dashboard Supabase (SQL Editor) :

```sql
INSERT INTO site_content (section, key, value, type, label, sort_order)
VALUES 
  ('brand_story', 'founder_image', '/images/fondatrice.jpg', 'image', 'Photo de la fondatrice', 20),
  ('notre_histoire', 'founder_image', '/images/fondatrice.jpg', 'image', 'Photo fondatrice (Notre Histoire)', 20)
ON CONFLICT (section, key) DO NOTHING;
```

Après cet INSERT, le champ apparaît automatiquement dans `/admin/contenu` sous la section "brand_story" et "notre_histoire".

- [ ] **Step 4 : Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
git add components/sections/home-v3/BrandStorySection.tsx components/sections/notre-histoire/OrigineSection.tsx
git commit -m "feat: photo fondatrice modifiable via CMS (brand_story + notre_histoire)"
```

---

## Task 5 : Contact "Derrière chaque commande" modifiable

**Files:**
- Pas de code à modifier (ContactV2.tsx:239 utilise déjà `content?.lola_message` ✅)
- Action : insérer la ligne manquante en BDD

- [ ] **Step 1 : Vérifier que le champ est absent en BDD**

```bash
# Dans le dashboard Supabase SQL Editor :
# SELECT * FROM site_content WHERE section = 'contact';
# Si lola_message absent → faire l'INSERT
```

- [ ] **Step 2 : Insérer le champ contact dans site_content**

```sql
INSERT INTO site_content (section, key, value, type, label, sort_order)
VALUES (
  'contact',
  'lola_message',
  '"Derrière chaque commande, il y a quelqu''un. Et je veux que tu saches que c''est moi qui te réponds. Pas un robot, pas un service client externalisé — moi. Si tu as une question, une idée, ou juste envie de discuter, écris-moi."',
  'textarea',
  'Citation de Lola (page Contact)',
  10
)
ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value;
```

- [ ] **Step 3 : Vérifier dans l'admin**

Naviguer vers `/admin/contenu` → section "contact" → vérifier que le champ "Citation de Lola" est éditable.

---

## Task 6 : Réduire taille texte titre hero

**Files:**
- Modify: `components/sections/home-v3/HeroSection.tsx`

- [ ] **Step 1 : Réduire le clamp des deux lignes de titre**

```typescript
// components/sections/home-v3/HeroSection.tsx — lignes 76 et 86
// AVANT :
className="block text-[clamp(4.5rem,11vw,10rem)]"
// et
className="block text-[clamp(4.5rem,11vw,10rem)] italic text-[#B89547]"

// APRÈS :
className="block text-[clamp(3rem,7vw,6.5rem)]"
// et
className="block text-[clamp(3rem,7vw,6.5rem)] italic text-[#B89547]"
```

- [ ] **Step 2 : Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
git add components/sections/home-v3/HeroSection.tsx
git commit -m "fix: réduire taille texte titre hero (clamp 3-6.5rem au lieu de 4.5-10rem)"
```

---

## Task 7 : Sweat Émoticoeurs — produit unisexe

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/adapters/supabase-product.ts`
- Modify: `components/admin/product-form/types.ts` (CATEGORIES_BY_GENDER)

- [ ] **Step 1 : Ajouter 'both' au type Gender**

```typescript
// types/index.ts — ligne 1
export type Gender = 'homme' | 'femme' | 'both';
```

- [ ] **Step 2 : Modifier findMany pour inclure les produits 'both'**

```typescript
// lib/adapters/supabase-product.ts — dans findMany()
// AVANT :
if (options?.gender) {
  query = query.eq('gender', options.gender);
}

// APRÈS :
if (options?.gender && options.gender !== 'both') {
  query = query.in('gender', [options.gender, 'both']);
}
```

- [ ] **Step 3 : Ajouter le genre 'both' dans l'admin product form**

```typescript
// components/admin/product-form/types.ts — dans CATEGORIES_BY_GENDER
// Ajouter une entrée 'both' pour les articles unisexes :
both: [
  { slug: 'hauts', label: 'Hauts' },
  { slug: 'bas', label: 'Bas' },
  { slug: 'accessoires', label: 'Accessoires' },
],
```

Et dans le select genre du formulaire produit (`ProductFormInfoSection.tsx`), ajouter l'option :

```tsx
<option value="both">Unisexe (Homme & Femme)</option>
```

- [ ] **Step 4 : Build check**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app && npx tsc --noEmit 2>&1 | head -30
```

Expected : pas d'erreurs liées à Gender.

- [ ] **Step 5 : Commit**

```bash
cd /Users/trikilyes/Desktop/Privé/Lorett/lolett-app
git add types/index.ts lib/adapters/supabase-product.ts components/admin/product-form/
git commit -m "feat: genre 'both' pour produits unisexes (Émoticoeurs)"
```

---

## Récap ordre d'exécution recommandé

1. Task 1 — Tailles (débloque la saisie produit en admin)
2. Task 2 — Looks 404 (bug visible par les visiteurs)
3. Task 3 — Bannières shop → fond bleu (visuel demandé)
4. Task 7 — Émoticoeurs unisexe (stock critique)
5. Task 6 — Taille titre hero (cosmétique)
6. Task 4 — Photo CMS (nécessite INSERT SQL dans Supabase)
7. Task 5 — Contact CMS (nécessite INSERT SQL dans Supabase)
