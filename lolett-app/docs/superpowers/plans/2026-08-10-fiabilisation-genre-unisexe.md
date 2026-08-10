# Fiabilisation du genre « Unisexe » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre le genre `both` (Unisexe) réellement utilisable de bout en bout, en supprimant la cause structurelle des bugs en cascade : la logique « quel produit appartient à quelle boutique » est aujourd'hui réécrite à la main dans 6 endroits différents.

**Architecture:** On crée un module unique `lib/gender.ts` qui détient toute la connaissance du genre (correspondance, libellé, lien boutique). Chaque endroit qui décidait seul est rebranché dessus. Le jour où un 4ᵉ genre apparaît, un seul fichier change — c'est précisément ce qui manquait en avril 2026 et qui a produit la cascade actuelle.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Supabase (Postgres + PostgREST), Vitest + @testing-library/react.

## Global Constraints

- TypeScript strict, **jamais de `any`** — utiliser `unknown` puis restreindre, ou typer correctement.
- Path aliases obligatoires (`@/...`), jamais d'import relatif `../../`.
- Max ~200 lignes par fichier.
- Le type check ET les tests doivent passer avant de considérer une tâche terminée : `npm run type-check` puis `npm test`.
- Les tests existent déjà (suite Vitest, 40 fichiers) : **écrire le test avant le code**.
- Toute la copie visible par l'utilisateur est en français. Le libellé retenu pour `both` est **« Unisexe »** (jamais « Both », jamais « Mixte »).
- La valeur stockée en base reste `both` — aucune migration de données dans ce plan.

---

## État des lieux (audit du 2026-08-10)

La migration `20260810000001_allow_unisex_gender.sql` est **appliquée en production** et un produit unisexe **existe déjà**. Les problèmes ci-dessous sont donc en ligne.

Origine de la cascade : le chantier du 13/04/2026 (`2026-04-13-retours-lola.md`, Task 7) a mis à jour `findMany()`, le type `Gender` et le formulaire admin — mais ni la contrainte SQL, ni les **9 autres endroits** qui lisent le genre.

### Déjà corrigé le 2026-08-10 (à couvrir par des tests, Task 2)

| # | Problème | Fichier |
|---|---|---|
| 1 | 🔴 Produit unisexe absent des pages catégorie (`findByCategory` filtrait strictement) | `lib/adapters/supabase-product.ts:104` |
| 2 | 🟠 Fil d'Ariane vers `/shop/both` → 404, y compris dans le JSON-LD envoyé à Google | `app/produit/[slug]/page.tsx:85-153` |
| 3 | 🟡 Produit unisexe étiqueté « Femme » | `app/produit/[slug]/page.tsx:71` |
| 4 | 🟡 Niveau catégorie perdu dans le fil d'Ariane | `app/produit/[slug]/page.tsx:70` |
| 5 | ⚪ Admin affichait « Both » | `app/admin/products/page.tsx:32-35` |
| 6 | ⚪ Filtre admin sans option « Unisexe » | `components/admin/ProductFilters.tsx:55-58` |

### Restant à corriger (Tasks 3 à 6)

| # | Problème | Fichier | Gravité |
|---|---|---|---|
| 7 | Les produits unisexes n'apparaissent sur **aucun** onglet de la page Nouveautés — or ce sont précisément les T-shirts que la cliente vient de marquer « nouveau » | `components/product/nouveautes/useNouveautesFilters.ts:25` | 🔴 |
| 8 | Les favoris pointent vers `/shop/<genre>/<slug-produit>` → 404. **Bug préexistant qui touche tous les produits**, pas seulement les unisexes | `components/compte/FavoritesList.tsx:89,101` | 🔴 |
| 9 | Un produit unisexe est introuvable dans le sélecteur de produits d'un look : impossible de l'ajouter à un look | `app/api/admin/products/route.ts:47` | 🟡 |
| 10 | Le comptage par genre du dashboard ignore les unisexes. **Donnée morte** : `productsByGender` n'est affiché nulle part | `components/admin/dashboard/getDashboardStats.ts:146-152` | ⚪ |

### Vérifié et sain — ne pas toucher

- `findMany()` — inclut déjà `both` (`supabase-product.ts:45-46`).
- `app/shop/[gender]/[category]/page.tsx:35` — renvoie correctement un 404 sur `/shop/both/...`.
- `app/sitemap.ts:23` — gère déjà `cat.gender === 'both'`.
- `app/api/products/suggestions/route.ts` — gère `both` comme cas de départage.
- `ShopContentV4.tsx` — reçoit un genre déjà restreint à homme/femme par la page appelante.
- `app/admin/products/page.tsx:42` — le filtre admin reste **strict** volontairement : quand la cliente filtre « Homme », elle veut voir les produits homme, pas les unisexes. La section « 👕 Unisexe » de la liste les montre séparément.

---

## ⚠️ Préalable bloquant : ce dossier n'est pas un dépôt git

`git rev-parse` échoue à la racine comme dans `lolett-app/` : **il n'y a aucun historique de version ici.** Concrètement, aucun `git diff` pour relire les changements, aucun `git revert` si une correction tourne mal, aucune revue possible.

C'est le plus gros risque de bug en cascade du projet, bien avant le genre. Avant d'exécuter ce plan, choisir :

- **(a)** travailler dans la copie versionnée du projet si elle existe ailleurs sur le disque — à privilégier ;
- **(b)** faire un `git init` ici avec un premier commit de l'état actuel, pour que le travail soit relisible ;
- **(c)** accepter de continuer sans filet, en sauvegardant manuellement le dossier avant de commencer.

Les étapes « Commit » de ce plan supposent l'option (a) ou (b). Sous l'option (c), les remplacer par une copie de sauvegarde du dossier.

## Base de référence des tests (2026-08-10)

`npm test` → **195 tests passent, 1 échoue**. L'échec est `__tests__/api/newsletter-subscribe.test.ts` (envoi d'e-mail de bienvenue) : **antérieur et sans aucun rapport avec le genre**. Ne pas le corriger dans ce plan, mais ne pas le confondre avec une régression : à la fin, on doit toujours avoir exactement 1 échec, celui-là.

---

## File Structure

**Créé :**
- `lib/gender.ts` — source unique de vérité du genre : correspondance produit ↔ boutique, libellés, liens. ~40 lignes.
- `__tests__/lib/gender.test.ts` — tests du module ci-dessus.
- `__tests__/shop/unisex-visibility.test.ts` — non-régression : un produit unisexe est visible côté boutique.

**Modifié :**
- `lib/adapters/supabase-product.ts:104-112` — rebrancher `findByCategory` sur le module.
- `app/produit/[slug]/page.tsx:69-83` — rebrancher libellé et liens sur le module.
- `components/product/nouveautes/useNouveautesFilters.ts:10-27` — filtre de la page Nouveautés.
- `components/compte/FavoritesList.tsx:89,101` — lien produit.
- `app/api/admin/products/route.ts:47` — inclusion des unisexes pour le sélecteur de looks.
- `components/admin/dashboard/getDashboardStats.ts:25,146-165` — comptage.

---

### Task 1 : Le socle — `lib/gender.ts`

C'est la tâche qui supprime la cause des cascades. Toutes les suivantes en dépendent.

**Files:**
- Create: `lib/gender.ts`
- Test: `__tests__/lib/gender.test.ts`

**Interfaces:**
- Consumes: `Gender` depuis `@/types` (`'homme' | 'femme' | 'both'`).
- Produces:
  - `UNISEX: 'both'`
  - `type ShopGender = 'homme' | 'femme'`
  - `isShopGender(value: string): value is ShopGender`
  - `matchesShopGender(productGender: string, shopGender: ShopGender): boolean`
  - `genderQueryValues(shopGender: ShopGender): string[]`
  - `genderLabel(gender: string): string`
  - `shopHrefForGender(gender: string): string`

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `__tests__/lib/gender.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import {
  UNISEX,
  isShopGender,
  matchesShopGender,
  genderQueryValues,
  genderLabel,
  shopHrefForGender,
} from '@/lib/gender';

describe('matchesShopGender', () => {
  it('montre un produit homme dans la boutique homme', () => {
    expect(matchesShopGender('homme', 'homme')).toBe(true);
  });

  it('cache un produit homme dans la boutique femme', () => {
    expect(matchesShopGender('homme', 'femme')).toBe(false);
  });

  it('montre un produit unisexe dans les DEUX boutiques', () => {
    expect(matchesShopGender(UNISEX, 'homme')).toBe(true);
    expect(matchesShopGender(UNISEX, 'femme')).toBe(true);
  });
});

describe('genderLabel', () => {
  it('traduit les trois genres en français', () => {
    expect(genderLabel('homme')).toBe('Homme');
    expect(genderLabel('femme')).toBe('Femme');
    expect(genderLabel(UNISEX)).toBe('Unisexe');
  });

  it('renvoie la valeur brute pour un genre inconnu plutôt que de planter', () => {
    expect(genderLabel('enfant')).toBe('enfant');
  });
});

describe('shopHrefForGender', () => {
  it('renvoie la boutique du genre pour homme et femme', () => {
    expect(shopHrefForGender('homme')).toBe('/shop/homme');
    expect(shopHrefForGender('femme')).toBe('/shop/femme');
  });

  it('renvoie la boutique générale pour un unisexe : aucune page /shop/both n existe', () => {
    expect(shopHrefForGender(UNISEX)).toBe('/shop');
  });
});

describe('isShopGender et genderQueryValues', () => {
  it('reconnaît uniquement les genres qui ont une boutique', () => {
    expect(isShopGender('homme')).toBe(true);
    expect(isShopGender('femme')).toBe(true);
    expect(isShopGender(UNISEX)).toBe(false);
  });

  it('interroge le genre demandé ET les unisexes', () => {
    expect(genderQueryValues('femme')).toEqual(['femme', 'both']);
    expect(genderQueryValues('homme')).toEqual(['homme', 'both']);
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
cd lolett-app && npm test -- __tests__/lib/gender.test.ts
```

Attendu : ÉCHEC, `Failed to resolve import "@/lib/gender"`.

- [ ] **Step 3 : Écrire l'implémentation minimale**

Créer `lib/gender.ts` :

```ts
/**
 * Source unique de vérité pour le genre d'un produit.
 *
 * Historique : en avril 2026, le genre « unisexe » a été ajouté au formulaire admin
 * et au type TypeScript, mais la règle « un produit unisexe appartient aux deux
 * boutiques » a été réécrite à la main à chaque endroit qui en avait besoin — et
 * oubliée dans six autres. Toute nouvelle logique de genre passe par ce fichier.
 */

/** Valeur stockée en base pour un article porté par les deux genres. */
export const UNISEX = 'both';

/** Genres disposant d'une vraie page boutique (`/shop/homme`, `/shop/femme`). */
export type ShopGender = 'homme' | 'femme';

export function isShopGender(value: string): value is ShopGender {
  return value === 'homme' || value === 'femme';
}

/** Un produit doit-il apparaître dans la boutique d'un genre donné ? */
export function matchesShopGender(productGender: string, shopGender: ShopGender): boolean {
  return productGender === shopGender || productGender === UNISEX;
}

/** Valeurs à passer à un `.in('gender', …)` Supabase pour peupler une boutique. */
export function genderQueryValues(shopGender: ShopGender): string[] {
  return [shopGender, UNISEX];
}

/** Libellé affiché à l'utilisateur. */
export function genderLabel(gender: string): string {
  switch (gender) {
    case 'homme':
      return 'Homme';
    case 'femme':
      return 'Femme';
    case UNISEX:
      return 'Unisexe';
    default:
      return gender;
  }
}

/**
 * Lien boutique d'un produit. Les unisexes n'ont pas de boutique dédiée :
 * la route `/shop/[gender]` renvoie un 404 pour tout genre autre que homme/femme.
 */
export function shopHrefForGender(gender: string): string {
  return isShopGender(gender) ? `/shop/${gender}` : '/shop';
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
cd lolett-app && npm test -- __tests__/lib/gender.test.ts
```

Attendu : 11 tests PASS.

- [ ] **Step 5 : Type check**

```bash
cd lolett-app && npm run type-check
```

Attendu : aucune erreur.

- [ ] **Step 6 : Commit**

```bash
git add lib/gender.ts __tests__/lib/gender.test.ts
git commit -m "feat: module gender partagé, source unique de vérité du genre"
```

---

### Task 2 : Verrouiller les correctifs déjà appliqués

Les six correctifs du 2026-08-10 fonctionnent mais ne sont couverts par **aucun test** : rien n'empêche de les défaire. Cette tâche pose le filet et rebranche le code sur le socle de la Task 1.

**Files:**
- Test: `__tests__/shop/unisex-visibility.test.ts`
- Modify: `lib/adapters/supabase-product.ts:104-112`
- Modify: `app/produit/[slug]/page.tsx:69-83`

**Interfaces:**
- Consumes: `genderQueryValues`, `isShopGender`, `genderLabel`, `shopHrefForGender`, `UNISEX` (Task 1).
- Produces: rien de nouveau.

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `__tests__/shop/unisex-visibility.test.ts`. Le mock suit la convention de `__tests__/shop/sort-sold-out.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPublicClient = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => mockPublicClient,
}));

import { SupabaseProductRepository } from '@/lib/adapters/supabase-product';

describe('findByCategory — visibilité des produits unisexes', () => {
  beforeEach(() => {
    mockPublicClient.from.mockReset();
  });

  it('interroge le genre demandé ET les unisexes', async () => {
    const productsBuilder: Record<string, unknown> = {};
    productsBuilder.select = vi.fn(() => productsBuilder);
    productsBuilder.eq = vi.fn(() => productsBuilder);
    productsBuilder.in = vi.fn(() => productsBuilder);
    productsBuilder.then = (resolve: (v: { data: never[]; error: null }) => unknown) =>
      resolve({ data: [], error: null });

    const variantsBuilder: Record<string, unknown> = {};
    variantsBuilder.select = vi.fn(() => variantsBuilder);
    variantsBuilder.eq = vi.fn(() => Promise.resolve({ data: [], error: null }));

    mockPublicClient.from.mockImplementation((table: string) =>
      table === 'product_variants' ? variantsBuilder : productsBuilder,
    );

    const repo = new SupabaseProductRepository();
    await repo.findByCategory('homme', 'hauts');

    expect(productsBuilder.in).toHaveBeenCalledWith('gender', ['homme', 'both']);
    expect(productsBuilder.eq).toHaveBeenCalledWith('category_slug', 'hauts');
  });
});
```

- [ ] **Step 2 : Lancer le test**

```bash
cd lolett-app && npm test -- __tests__/shop/unisex-visibility.test.ts
```

Attendu : PASS immédiatement — le correctif est déjà en place. Ce test est un **verrou de non-régression**, pas une découverte. Pour prouver qu'il verrouille bien quelque chose : remettre temporairement `.eq('gender', gender)` dans `findByCategory`, relancer, constater l'ÉCHEC, puis annuler.

- [ ] **Step 3 : Rebrancher `findByCategory` sur le socle**

Dans `lib/adapters/supabase-product.ts`, ajouter l'import en haut du fichier :

```ts
import { genderQueryValues, isShopGender } from '@/lib/gender';
```

Puis remplacer le corps de la requête dans `findByCategory` :

```ts
    // Les produits unisexes doivent remonter dans les deux boutiques, exactement
    // comme dans findMany() — sinon ils apparaissent sur /shop/homme mais
    // disparaissent de /shop/homme/hauts.
    let query = supabase.from('products').select('*').eq('category_slug', categorySlug);
    if (isShopGender(gender)) {
      query = query.in('gender', genderQueryValues(gender));
    }

    const { data, error } = await query;
```

- [ ] **Step 4 : Rebrancher la fiche produit sur le socle**

Dans `app/produit/[slug]/page.tsx`, ajouter l'import :

```ts
import { UNISEX, genderLabel, shopHrefForGender } from '@/lib/gender';
```

Puis remplacer le bloc introduit le 2026-08-10 (juste après `const category = await categoryRepository.findBySlug(...)`) :

```ts
  // Produits unisexes : aucune boutique /shop/both n'existe (la route [gender] renvoie
  // un 404 pour tout genre autre que homme/femme), donc le fil d'Ariane pointe vers la
  // boutique générale au lieu d'un lien mort — y compris dans les données envoyées à Google.
  const isUnisex = product.gender === UNISEX;
  const genderLabelText = genderLabel(product.gender);
  const genderHref = shopHrefForGender(product.gender);

  // Un produit unisexe est listé à la fois sous /shop/homme/… et /shop/femme/… :
  // aucune des deux pages ne fait autorité, on retire donc ce niveau du fil d'Ariane.
  const categoryCrumb =
    category && !isUnisex
      ? { label: category.label, href: `/shop/${product.gender}/${category.slug}` }
      : null;
```

Puis remplacer les deux occurrences restantes de `genderLabel` (la variable locale supprimée) par `genderLabelText` : une dans `breadcrumbJsonLd` (`name: genderLabelText`) et une dans `<Breadcrumbs items={...}>` (`{ label: genderLabelText, href: genderHref }`).

- [ ] **Step 5 : Vérifier**

```bash
cd lolett-app && npm run type-check && npm test
```

Attendu : type check propre, et toujours **1 seul échec** (`newsletter-subscribe`, préexistant).

- [ ] **Step 6 : Commit**

```bash
git add lib/adapters/supabase-product.ts "app/produit/[slug]/page.tsx" __tests__/shop/unisex-visibility.test.ts
git commit -m "refactor: fiche produit et findByCategory branchées sur lib/gender"
```

---

### Task 3 : Page Nouveautés — le bug le plus visible

Les T-shirts unisexes que la cliente vient de mettre en ligne sont marqués « nouveau ». Ils n'apparaissent aujourd'hui **sur aucun des deux onglets** de la page Nouveautés.

**Files:**
- Modify: `components/product/nouveautes/useNouveautesFilters.ts:10-27`
- Test: `__tests__/shop/nouveautes-unisex.test.ts`

**Interfaces:**
- Consumes: `matchesShopGender`, `ShopGender` (Task 1) ; `useNouveautesFilters(products: Product[])`.
- Produces: rien de nouveau — la signature publique du hook ne change pas.

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `__tests__/shop/nouveautes-unisex.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNouveautesFilters } from '@/components/product/nouveautes/useNouveautesFilters';
import type { Gender, Product } from '@/types';

function mkProduct(id: string, gender: Gender): Product {
  return {
    id,
    slug: id,
    name: id,
    gender,
    categorySlug: 'hauts',
    price: 30,
    images: [],
    description: '',
    sizes: ['M'],
    colors: [],
    stock: 5,
    isNew: true,
    tags: [],
  };
}

const products: Product[] = [
  mkProduct('robe-femme', 'femme'),
  mkProduct('chemise-homme', 'homme'),
  mkProduct('tshirt-unisexe', 'both'),
];

describe('useNouveautesFilters — produits unisexes', () => {
  it("montre l'unisexe dans l'onglet Femme (onglet par défaut)", () => {
    const { result } = renderHook(() => useNouveautesFilters(products));
    const ids = result.current.genderProducts.map((p) => p.id);

    expect(ids).toContain('tshirt-unisexe');
    expect(ids).toContain('robe-femme');
    expect(ids).not.toContain('chemise-homme');
  });

  it("montre aussi l'unisexe dans l'onglet Homme", () => {
    const { result } = renderHook(() => useNouveautesFilters(products));

    act(() => {
      result.current.handleGenderChange('homme');
    });

    const ids = result.current.genderProducts.map((p) => p.id);
    expect(ids).toContain('tshirt-unisexe');
    expect(ids).toContain('chemise-homme');
    expect(ids).not.toContain('robe-femme');
  });
});
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
cd lolett-app && npm test -- __tests__/shop/nouveautes-unisex.test.ts
```

Attendu : ÉCHEC sur les deux cas, `expected [...] to contain 'tshirt-unisexe'`.

Si l'erreur porte sur `handleGenderChange` absent du retour du hook, vérifier que le hook l'expose bien dans son objet de retour (ligne ~91) et ajuster le test — pas le code.

- [ ] **Step 3 : Écrire l'implémentation**

Dans `components/product/nouveautes/useNouveautesFilters.ts`, ajouter l'import :

```ts
import { matchesShopGender, type ShopGender } from '@/lib/gender';
```

Puis remplacer les trois emplacements :

```ts
  const [activeGender, setActiveGender] = useState<ShopGender>('femme');
```

```ts
  const handleGenderChange = (gender: ShopGender) => {
```

```ts
  // Un produit unisexe appartient aux deux onglets.
  const genderProducts = useMemo(
    () => products.filter((p) => matchesShopGender(p.gender, activeGender)),
    [products, activeGender],
  );
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
cd lolett-app && npm test -- __tests__/shop/nouveautes-unisex.test.ts
```

Attendu : 2 tests PASS.

- [ ] **Step 5 : Type check complet**

```bash
cd lolett-app && npm run type-check
```

Attendu : aucune erreur. Le passage de `'femme' | 'homme'` à `ShopGender` est un alias du même type — si une erreur apparaît chez un appelant (`NouveautesContentV2.tsx`), c'est qu'il déclare le type en dur de son côté : l'aligner sur `ShopGender` importé de `@/lib/gender`.

- [ ] **Step 6 : Commit**

```bash
git add components/product/nouveautes/useNouveautesFilters.ts __tests__/shop/nouveautes-unisex.test.ts
git commit -m "fix: produits unisexes visibles dans les deux onglets de Nouveautés"
```

---

### Task 4 : Lien des favoris — un 404 pour tous les produits

`FavoritesList` construit `/shop/<genre>/<slug-produit>`, une URL qui mélange une route de catégorie et un slug de produit. Pour un produit homme, `/shop/homme/t-shirt-bugs` cherche une catégorie nommée `t-shirt-bugs`, n'en trouve pas et renvoie un 404. Pour un unisexe, `/shop/both/...` est rejeté encore plus tôt. **Ce bug touche la totalité des favoris depuis toujours** — l'unisexe n'a fait que le rendre visible.

La bonne route est `/produit/<slug>` (`app/produit/[slug]/page.tsx`).

**Files:**
- Modify: `components/compte/FavoritesList.tsx:89,101`

**Interfaces:**
- Consumes: rien de la Task 1 — correction d'URL pure.
- Produces: rien.

- [ ] **Step 1 : Vérifier l'ampleur avant de corriger**

```bash
cd lolett-app && grep -rn "/shop/\${" components app | grep -v "cat.slug" | grep -v "gender}/\${cat"
```

Attendu : les deux lignes de `FavoritesList.tsx`. Si d'autres fichiers apparaissent, les corriger dans cette même tâche — c'est le même bug.

- [ ] **Step 2 : Corriger les deux liens**

Dans `components/compte/FavoritesList.tsx`, remplacer les deux occurrences :

```tsx
              <Link href={`/produit/${p.slug}`}>
```

L'ancienne forme `/shop/${p.gender}/${p.slug}` visait la route catégorie, qui ne connaît pas les slugs de produits.

- [ ] **Step 3 : Vérifier qu'aucun lien mort ne subsiste**

```bash
cd lolett-app && grep -n "href=" components/compte/FavoritesList.tsx
```

Attendu : uniquement des `/produit/...`.

- [ ] **Step 4 : Type check et tests**

```bash
cd lolett-app && npm run type-check && npm test
```

Attendu : type check propre, toujours 1 seul échec préexistant.

- [ ] **Step 5 : Vérification manuelle**

Lancer `npm run dev`, se connecter, ajouter un produit aux favoris, aller sur la page compte, cliquer sur le favori. Attendu : la fiche produit s'ouvre. Avant ce correctif : page 404.

- [ ] **Step 6 : Commit**

```bash
git add components/compte/FavoritesList.tsx
git commit -m "fix: les favoris pointaient vers une route catégorie inexistante"
```

---

### Task 5 : Sélecteur de produits des looks

`LookProductSelector` appelle `/api/admin/products?gender=femme`, et la route filtre strictement. Résultat : la cliente ne peut pas ajouter un T-shirt unisexe à un look.

Cette route GET n'a **qu'un seul consommateur** — le sélecteur de looks (vérifié : la liste admin des produits fait sa propre requête Supabase). L'élargir est donc sans effet de bord.

**Files:**
- Modify: `app/api/admin/products/route.ts:47`

**Interfaces:**
- Consumes: `genderQueryValues`, `isShopGender` (Task 1).
- Produces: rien.

- [ ] **Step 1 : Modifier le filtre de la route**

Dans `app/api/admin/products/route.ts`, ajouter l'import :

```ts
import { genderQueryValues, isShopGender } from '@/lib/gender';
```

Puis remplacer la ligne du filtre genre :

```ts
  // Le sélecteur de produits d'un look demande les articles d'un genre : les unisexes
  // doivent en faire partie, sinon ils sont impossibles à ajouter à un look.
  // Une demande explicite de `both` reste stricte (afficher uniquement les unisexes).
  if (gender) {
    query = isShopGender(gender)
      ? query.in('gender', genderQueryValues(gender))
      : query.eq('gender', gender);
  }
```

- [ ] **Step 2 : Type check**

```bash
cd lolett-app && npm run type-check
```

Attendu : aucune erreur.

- [ ] **Step 3 : Vérification manuelle**

Lancer `npm run dev`, aller dans Admin → Looks → créer un look, choisir le genre « Femme », ouvrir le sélecteur de produits. Attendu : le T-shirt unisexe figure dans la liste. Refaire avec « Homme » : il doit y figurer aussi.

- [ ] **Step 4 : Tests complets**

```bash
cd lolett-app && npm test
```

Attendu : toujours 1 seul échec préexistant.

- [ ] **Step 5 : Commit**

```bash
git add app/api/admin/products/route.ts
git commit -m "fix: produits unisexes sélectionnables dans les looks"
```

---

### Task 6 : Comptage du dashboard

`productsByGender` compte homme et femme, et laisse tomber les unisexes. À faire pour la cohérence, mais sans urgence : **cette donnée n'est affichée nulle part** (aucun consommateur de `productsByGender` dans le code). Si l'exécution du plan doit être écourtée, c'est la tâche à sacrifier.

**Files:**
- Modify: `components/admin/dashboard/getDashboardStats.ts:25,146-152,165`

**Interfaces:**
- Consumes: `UNISEX` (Task 1).
- Produces: `productsByGender` gagne une clé `unisexe: number`.

- [ ] **Step 1 : Élargir le type**

Ligne 25, remplacer :

```ts
  productsByGender: { homme: number; femme: number; unisexe: number };
```

- [ ] **Step 2 : Compter les unisexes**

Ajouter l'import :

```ts
import { UNISEX } from '@/lib/gender';
```

Puis remplacer le bloc de comptage :

```ts
  // Products by gender
  let homme = 0;
  let femme = 0;
  let unisexe = 0;
  for (const p of allProductsGender ?? []) {
    const g = p.gender as string;
    if (g === 'homme') homme++;
    else if (g === 'femme') femme++;
    else if (g === UNISEX) unisexe++;
  }
```

- [ ] **Step 3 : Élargir la valeur retournée**

```ts
    productsByGender: { homme, femme, unisexe },
```

- [ ] **Step 4 : Type check et tests**

```bash
cd lolett-app && npm run type-check && npm test
```

Attendu : aucune erreur de type, toujours 1 seul échec préexistant.

- [ ] **Step 5 : Commit**

```bash
git add components/admin/dashboard/getDashboardStats.ts
git commit -m "fix: comptage des produits unisexes dans les stats admin"
```

---

### Task 7 : Vérification de bout en bout

Aucun code n'est écrit ici : on prouve que la fonctionnalité marche vraiment, plutôt que de l'affirmer.

**Files:** aucun.

- [ ] **Step 1 : Vérification automatisée complète**

```bash
cd lolett-app && npm run type-check && npm test && npm run lint
```

Attendu : type check propre, lint propre, **exactement 1 échec** (`newsletter-subscribe`). Tout autre échec est une régression introduite par ce plan.

- [ ] **Step 2 : Parcours manuel du produit unisexe réel**

Avec `npm run dev`, sur le produit unisexe déjà créé en production par la cliente, vérifier les six points :

1. `/shop/homme` — le produit apparaît.
2. `/shop/femme` — le produit apparaît.
3. `/shop/homme/hauts` — le produit apparaît (c'était le bug 🔴 n°1).
4. `/shop/femme/hauts` — le produit apparaît.
5. Fiche produit — le fil d'Ariane affiche « Unisexe » et le lien mène à `/shop`, pas à un 404.
6. `/nouveautes` — le produit apparaît dans l'onglet Femme **et** dans l'onglet Homme.

- [ ] **Step 3 : Vérifier les données envoyées à Google**

Sur la fiche produit, afficher le code source et chercher `BreadcrumbList`. Attendu : aucune URL contenant `/shop/both`.

```bash
cd lolett-app && curl -s http://localhost:3000/produit/<slug-du-produit-unisexe> | grep -o '"item":"[^"]*"'
```

- [ ] **Step 4 : Vérifier le parcours admin**

1. Admin → Produits : le produit figure sous une section « 👕 Unisexe ».
2. Filtre genre → « Unisexe » : la liste se réduit aux produits unisexes.
3. Admin → Looks → nouveau look genre Femme : le produit unisexe est proposé dans le sélecteur.

- [ ] **Step 5 : Commit final**

```bash
git add -A
git commit -m "docs: plan de fiabilisation du genre unisexe exécuté"
```

---

## Ce que ce plan ne couvre pas

À décider séparément, volontairement hors périmètre :

- **La catégorie « Accessoires » n'existe que pour Homme** en base. Un produit unisexe rangé dans « Accessoires » apparaîtra dans la boutique Femme sans entrée correspondante dans le menu Femme. Correction possible : une ligne `('femme', 'accessoires', …)` dans `categories`.
- **Les looks n'acceptent pas le genre unisexe** — `looks.gender` porte toujours la contrainte `CHECK (gender IN ('homme','femme'))` et le formulaire de look ne propose pas l'option. Cohérent aujourd'hui : ne rien faire tant que la cliente ne le demande pas.
- **`categories.gender`** ne connaît pas `both`, alors que `app/sitemap.ts:23` anticipe déjà ce cas. Incohérence dormante, sans effet tant qu'aucune catégorie unisexe n'est créée.
- **Le test `newsletter-subscribe` en échec** — antérieur, à traiter dans son propre chantier.
- **L'erreur 413 à l'upload d'images** — sujet distinct, voir la conversation du 2026-08-10 : la limite affichée a été ramenée de 50 Mo à 4 Mo (la vraie limite de la plateforme Vercel) ; la compression côté navigateur reste à faire.
