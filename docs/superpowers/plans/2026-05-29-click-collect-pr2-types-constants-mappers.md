# Click & Collect — PR2 : Types, constantes, mappers & cart store — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser le socle TypeScript de Click & Collect — fichier de domaine neutre, union discriminée `PickupPoint`, constantes de statuts/transitions/tarifs alignées sur les 13 statuts DB, mappers Supabase et cart store v3 — entièrement testé en unitaire, sans aucune UI. **Chaque commit doit laisser `npm run type-check` ET `npm run lint` au vert** (la task qui introduit une rupture de type corrige ses call-sites dans la même task, cf. Notes de cadrage §10).

**Architecture:** Un nouveau module `lib/types/domain.ts` qui ne dépend de rien centralise les `as const` + types (`OrderStatus`, `ShippingMethod`, `ShippingCarrier`, `ShippingCountryCode`, `PickupPointProvider`). `types/index.ts` les ré-exporte et transforme `PickupPoint` en union discriminée par `provider`. `lib/constants.ts` importe les arrays de `domain.ts` et expose labels/couleurs/transitions/tarifs comme source de vérité unique. Les mappers Supabase backfillent `provider` sur les snapshots legacy ; le cart store migre en v3 et reset le point relais à chaque changement de méthode. Le sens des imports est strictement `domain.ts → (constants.ts, types/index.ts)` pour briser tout cycle.

**Tech Stack:** TypeScript strict (zéro `any`, `unknown` + narrowing), Zustand v5 (persist + migrate), Vitest (jsdom), alias `@/`.

---

## Notes de cadrage (corrections vs spec)

Ces écarts entre le texte du spec §5 et la réalité du code sont **actés** et doivent être respectés dans cette PR :

1. **Tarifs `SHIPPING_RATES` : garder les VRAIES valeurs existantes, pas celles du spec.** Le spec §5.3 écrit `FR.mondial_relay: 4.50`, `BENELUX.home: 9.90`, `IBERIA.home: 12.90` — ces chiffres sont **faux**. Les vraies valeurs de `lib/constants.ts` L49-53 sont :
   - FR `{ home: 5.90, mondial_relay: 4.90 }`
   - BENELUX `{ home: 7.90, mondial_relay: 6.90 }`
   - IBERIA `{ home: 9.90, mondial_relay: 7.90 }`
   On **conserve ces valeurs** et on ajoute uniquement `click_collect: 0` dans la zone FR. Le type devient `Record<ShippingZone, Partial<Record<ShippingMethod, number>>>`.

2. **`computeShippingCost` doit conserver sa logique de seuil existante** (`getShippingZone` + `SHIPPING_FREE_THRESHOLD`) et seulement préfixer la garde `click_collect` (throw si `country !== 'FR'`, sinon `0`). Le spec montre `// ... logique existante` ; on l'écrit en entier ici.

3. **`getTrackingUrl` change de signature de retour** : `string` → `string | null` (null si `carrier === 'click_collect'`). Le seul call-site est `lib/email/templates/order-shipped-v3.ts` L193 ; le résultat y est interpolé dans un template literal (`href="${trackingUrl}"` L208) — `null` n'y provoque **pas** d'erreur de type-check (et le `carrier` y est typé `ShippingCarrier` mais ne vaut jamais `'click_collect'` au runtime). Pas de modification de ce call-site nécessaire (vérifié : `order-shipped-v3.ts` L191-193).

4. **`getShippingCarrier` : type de retour élargi** de `'colissimo' | 'mondial_relay'` à `ShippingCarrier`, car `SHIPPING_METHODS[method].carrier` peut désormais valoir `'click_collect'`. Les deux call-sites (`features/checkout/hooks/useCheckout.ts` L170, `app/api/checkout/stripe/route.ts` L74) assignent à un champ `shippingCarrier?: ShippingCarrier` — compatible (vérifié).

5. **`PickupPoint` union discriminée casse UN seul call-site au type-check** : `features/checkout/components/MondialRelayWidget.tsx` L182 construit un `PickupPoint` **sans** `provider`. On ajoute `provider: 'mondial_relay'` à cet objet **dans la même task que la transformation de l'union (Task 2)**, pour garder le commit type-check-vert. Tous les autres consommateurs (`ShippingLabelInfo.tsx`, pages admin `orders/[id]`) n'accèdent qu'aux champs communs (`id/name/address/postalCode/city/country`) de `BasePickupPoint` et ne cassent pas.

6. **`mapPickupPoint` backfille `provider`** : `point.provider` si présent, sinon `'click_collect'` si `shippingMethod === 'click_collect'`, sinon `'mondial_relay'` (legacy = MR). Aligné §5.2 et §16.

7. **Cart store v3** : `setShippingMethod` reset `pickupPoint` à **chaque** changement de méthode (le code actuel L118-121 ne reset que si `method === 'home'` — résidu MR↔C&C possible). La migration v3 backfill `provider='mondial_relay'` sur l'ancien `pickupPoint` sans provider (sur une **copie**, sans muter l'objet d'entrée) et reset `shippingMethod`→`'home'` + `pickupPoint`→`null` si la méthode persistée n'est plus dans `VALID_SHIPPING_METHODS`.

8. **`Order.status` étendu aux 13 statuts** : résout une désynchronisation pré-existante (`payment_review`, `partially_refunded`, `disputed` étaient déjà en DB mais absents du type TS — qui ne déclarait que `pending | confirmed | paid | shipped | delivered | cancelled | refunded | expired`). Voir §16 du spec.

9. **`DbOrder` (supabase-types.ts)** : ajout des colonnes `ready_for_pickup_at`, `picked_up_at`, `pickup_code` créées en PR1. **La colonne `pickup_point` est re-typée `Record<string, unknown> | null`** (et non plus `PickupPoint | null`) car c'est un snapshot JSONB qui, sur les lignes legacy, n'a PAS le discriminant `provider` requis par l'union — le type DB ne doit pas mentir sur la donnée réelle. C'est `mapPickupPoint` qui produit le `PickupPoint` conforme.

10. **`npm run validate` exécute le lint** (`validate = lint && type-check`, cf. `package.json` L18) et la config ESLint étend `next/typescript` (cf. `eslint.config.mjs` L13), qui inclut `@typescript-eslint/no-unused-vars` en **error**. Conséquence directe : tout import **value** inutilisé fait échouer `validate` même si `tsc` (sans `noUnusedLocals`, cf. `tsconfig.json`) ne le voit pas. Deux règles d'or pour cette PR :
    - **Ne jamais importer un symbole « pour usage futur »** : ré-exporter via `export { X } from '...'` (un ré-export n'est pas un import inutilisé) ou ne pas l'introduire.
    - **La task qui introduit une rupture de type corrige ses propres call-sites dans la même task** : on ne laisse aucun commit avec un type-check rouge (l'ancienne Task 6 « correctif différé » est supprimée et fusionnée dans Task 2). `livraison/page.tsx` (cassé par le passage de `SHIPPING_RATES` en `Partial`) est corrigé dans Task 3.

---

### Task 1 : Module de domaine neutre `lib/types/domain.ts`

Fichier socle : aucune dépendance d'import (brise tout cycle). Définit les `as const` + types réutilisés par `constants.ts` ET `types/index.ts`.

**Files:**
- Create: `lolett-app/lib/types/domain.ts`
- Test: `lolett-app/__tests__/lib/types/domain.test.ts`

**Steps:**

- [ ] (1) Écrire le test qui échoue — `lolett-app/__tests__/lib/types/domain.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_VALUES,
  SHIPPING_METHOD_VALUES,
  SHIPPING_CARRIER_VALUES,
  SHIPPING_COUNTRY_CODES,
} from '@/lib/types/domain';

describe('domain enums', () => {
  it('declares the 13 order statuses', () => {
    expect(ORDER_STATUS_VALUES).toEqual([
      'pending', 'paid', 'confirmed',
      'shipped', 'delivered',
      'ready_for_pickup', 'picked_up',
      'cancelled', 'refunded', 'partially_refunded', 'disputed',
      'expired', 'payment_review',
    ]);
    expect(ORDER_STATUS_VALUES).toHaveLength(13);
  });

  it('declares the 3 shipping methods including click_collect', () => {
    expect(SHIPPING_METHOD_VALUES).toEqual(['home', 'mondial_relay', 'click_collect']);
  });

  it('declares the 3 shipping carriers including click_collect', () => {
    expect(SHIPPING_CARRIER_VALUES).toEqual(['colissimo', 'mondial_relay', 'click_collect']);
  });

  it('declares the 6 shipping country codes', () => {
    expect(SHIPPING_COUNTRY_CODES).toEqual(['FR', 'BE', 'LU', 'NL', 'ES', 'PT']);
  });
});
```

- [ ] (2) Lancer le test → échec attendu :

```
npm run test -- __tests__/lib/types/domain.test.ts
```

Sortie attendue : `Error: Failed to resolve import "@/lib/types/domain"` (le fichier n'existe pas encore).

- [ ] (3) Implémentation minimale — `lolett-app/lib/types/domain.ts` :

```ts
// Module de domaine NEUTRE : n'importe rien (brise tout cycle d'imports).
// Source unique des valeurs/types partagés par constants.ts et types/index.ts.

export const ORDER_STATUS_VALUES = [
  'pending', 'paid', 'confirmed',
  'shipped', 'delivered',
  'ready_for_pickup', 'picked_up',
  'cancelled', 'refunded', 'partially_refunded', 'disputed',
  'expired', 'payment_review',
] as const;
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const SHIPPING_METHOD_VALUES = ['home', 'mondial_relay', 'click_collect'] as const;
export type ShippingMethod = (typeof SHIPPING_METHOD_VALUES)[number];

export const SHIPPING_CARRIER_VALUES = ['colissimo', 'mondial_relay', 'click_collect'] as const;
export type ShippingCarrier = (typeof SHIPPING_CARRIER_VALUES)[number];

export const SHIPPING_COUNTRY_CODES = ['FR', 'BE', 'LU', 'NL', 'ES', 'PT'] as const;
export type ShippingCountryCode = (typeof SHIPPING_COUNTRY_CODES)[number];

export type PickupPointProvider = 'mondial_relay' | 'click_collect';
```

- [ ] (4) Relancer le test → succès :

```
npm run test -- __tests__/lib/types/domain.test.ts
```

Sortie attendue : `Test Files  1 passed`, `Tests  4 passed`.

- [ ] (5) Type-check + lint : `npm run validate` → aucune erreur (le module est consommé par son test ; aucun import inutilisé).

- [ ] (6) Commit :

```
git add lolett-app/lib/types/domain.ts lolett-app/__tests__/lib/types/domain.test.ts
git commit -m "feat(types): module de domaine neutre pour Click & Collect (13 statuts, 3 methodes)"
```

---

### Task 2 : `types/index.ts` — ré-exports + `PickupPoint` union discriminée + `Order` étendu + correctif `MondialRelayWidget`

Ré-exporte les types depuis `domain.ts`, transforme `PickupPoint` en union discriminée par `provider`, étend `Order.status` aux 13 statuts, ajoute `readyForPickupAt` / `pickedUpAt` / `pickupCode`, **et corrige immédiatement le seul call-site cassé (`MondialRelayWidget`) pour garder le commit type-check-vert** (Note de cadrage §10).

**Files:**
- Modify: `lolett-app/types/index.ts` (L83-85 types shipping, L87-96 `PickupPoint`, L98-130 `Order`)
- Modify: `lolett-app/features/checkout/components/MondialRelayWidget.tsx` (L182-191)
- Test: pas de test unitaire dédié (types purs + composant UI à callback jQuery non testable en unitaire isolé) — vérification par `npm run validate`.

**Steps:**

- [ ] (1) Remplacer les 3 lignes de types shipping (L83-85 de `types/index.ts`) par des ré-exports depuis `domain.ts`. Remplacer :

```ts
export type ShippingMethod = 'home' | 'mondial_relay';
export type ShippingCarrier = 'colissimo' | 'mondial_relay';
export type ShippingCountryCode = 'FR' | 'BE' | 'LU' | 'NL' | 'ES' | 'PT';
```

par :

```ts
export type {
  OrderStatus,
  ShippingMethod,
  ShippingCarrier,
  ShippingCountryCode,
  PickupPointProvider,
} from '@/lib/types/domain';
```

- [ ] (2) Remplacer l'interface plate `PickupPoint` (L87-96) par l'union discriminée :

```ts
interface BasePickupPoint {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface MondialRelayPickupPoint extends BasePickupPoint {
  provider: 'mondial_relay';
  lat?: number;
  lng?: number;
}

export interface ClickCollectPickupPoint extends BasePickupPoint {
  provider: 'click_collect';
  hours?: string | null;
  instructions?: string | null;
}

export type PickupPoint = MondialRelayPickupPoint | ClickCollectPickupPoint;
```

- [ ] (3) Ajouter, juste après le bloc de ré-export de l'étape 1, l'import **type-only** de `OrderStatus` pour pouvoir l'utiliser comme annotation de `Order.status`. Le `export type { ... } from '@/lib/types/domain'` ré-exporte mais n'apporte pas le binding local utilisable comme annotation. Ajouter donc :

```ts
import type { OrderStatus } from '@/lib/types/domain';
```

Note (Note de cadrage §10) : c'est un import **type-only** (`import type`), il sera **utilisé** comme annotation à l'étape 4, donc il n'est pas un import inutilisé pour `no-unused-vars`.

- [ ] (4) Dans l'interface `Order`, remplacer la ligne `status` (L115) :

```ts
  status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'expired';
```

par :

```ts
  status: OrderStatus;
```

- [ ] (5) Dans l'interface `Order`, ajouter trois champs C&C juste après `cancelReason?: string;` (L127) :

```ts
  readyForPickupAt?: string;
  pickedUpAt?: string;
  pickupCode?: string | null;
```

- [ ] (6) Corriger le seul call-site cassé par l'union discriminée — `features/checkout/components/MondialRelayWidget.tsx`, callback `OnParcelShopSelected` (L182-191). Ajouter le discriminant `provider: 'mondial_relay'`. Remplacer :

```ts
            const point: PickupPoint = {
              id: data.ID,
              name: data.Nom,
              address: [data.Adresse1, data.Adresse2].filter(Boolean).join(' '),
              postalCode: data.CP,
              city: data.Ville,
              country: data.Pays,
              lat: parseFloat(data.Latitude),
              lng: parseFloat(data.Longitude),
            };
```

par :

```ts
            const point: PickupPoint = {
              provider: 'mondial_relay',
              id: data.ID,
              name: data.Nom,
              address: [data.Adresse1, data.Adresse2].filter(Boolean).join(' '),
              postalCode: data.CP,
              city: data.Ville,
              country: data.Pays,
              lat: parseFloat(data.Latitude),
              lng: parseFloat(data.Longitude),
            };
```

- [ ] (7) Vérifier qu'aucun consommateur ne casse. `npm run type-check` doit être **100% vert** : la seule rupture (`MondialRelayWidget` L182, erreur TS2741 `Property 'provider' is missing ... required in type 'MondialRelayPickupPoint'`) est corrigée à l'étape 6 dans la même task. Toutes les autres références (`ShippingLabelInfo.tsx`, `app/admin/orders/[id]/page.tsx`, `app/admin/orders/[id]/expedition/page.tsx`, `supabase-order.ts`, webhook/checkout via `JSON.parse(...) as PickupPoint`) compilent car elles n'accèdent qu'aux champs communs.

```
npm run type-check
```

Sortie attendue : exit code 0, aucune erreur.

- [ ] (8) Commit (les deux fichiers ensemble — le widget fait partie intégrante de la rupture de type introduite ici) :

```
git add lolett-app/types/index.ts lolett-app/features/checkout/components/MondialRelayWidget.tsx
git commit -m "refactor(types): PickupPoint en union discriminee + Order.status 13 statuts + champs C&C"
```

---

### Task 3 : `lib/constants.ts` — statuts, couleurs, transitions, tarifs C&C (+ correctif `livraison/page.tsx`)

Centralise la source de vérité : labels/couleurs/transitions des 13 statuts, ajout de `click_collect` aux méthodes/tarifs, garde `computeShippingCost`, `getTrackingUrl` retournant `null` pour C&C. **Le passage de `SHIPPING_RATES` en `Partial<Record<...>>` casse `app/livraison/page.tsx` L53-54 (accès direct `.home.toFixed()` / `.mondial_relay.toFixed()` sur un `number | undefined`) : on le corrige dans la même task** (Note de cadrage §10).

**Files:**
- Modify: `lolett-app/lib/constants.ts` (L1 import, L43-53 methods/rates, L80-103 fonctions, + insertion bloc statuts)
- Modify: `lolett-app/app/livraison/page.tsx` (L53-54)
- Test: `lolett-app/__tests__/lib/constants/shipping.test.ts`, `lolett-app/__tests__/lib/constants/order-status.test.ts`

**Steps:**

- [ ] (1) Écrire les tests qui échouent.

`lolett-app/__tests__/lib/constants/shipping.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import {
  computeShippingCost,
  getTrackingUrl,
  SHIPPING_RATES,
  SHIPPING_METHODS,
  VALID_SHIPPING_METHODS,
} from '@/lib/constants';

describe('computeShippingCost', () => {
  it('returns 0 for click_collect in FR', () => {
    expect(computeShippingCost(20, 'FR', 'click_collect')).toBe(0);
  });

  it('throws for click_collect outside FR', () => {
    expect(() => computeShippingCost(20, 'BE', 'click_collect')).toThrow(
      /France/
    );
  });

  it('returns the FR home rate below the free-shipping threshold', () => {
    // seuil FR = 100, tarif home FR = 5.90
    expect(computeShippingCost(50, 'FR', 'home')).toBe(5.90);
  });

  it('returns 0 for FR home at or above the free-shipping threshold', () => {
    expect(computeShippingCost(100, 'FR', 'home')).toBe(0);
  });

  it('keeps the real existing rates (mondial_relay FR = 4.90, not 4.50)', () => {
    expect(SHIPPING_RATES.FR.mondial_relay).toBe(4.90);
    expect(SHIPPING_RATES.FR.click_collect).toBe(0);
    expect(SHIPPING_RATES.BENELUX.home).toBe(7.90);
    expect(SHIPPING_RATES.IBERIA.home).toBe(9.90);
    expect(SHIPPING_RATES.BENELUX.click_collect).toBeUndefined();
    expect(SHIPPING_RATES.IBERIA.click_collect).toBeUndefined();
  });
});

describe('getTrackingUrl', () => {
  it('returns null for click_collect', () => {
    expect(getTrackingUrl('click_collect', 'ANY')).toBeNull();
  });

  it('returns a La Poste URL for colissimo', () => {
    expect(getTrackingUrl('colissimo', 'XYZ123')).toContain('laposte.fr');
    expect(getTrackingUrl('colissimo', 'XYZ123')).toContain('XYZ123');
  });
});

describe('VALID_SHIPPING_METHODS', () => {
  it('is derived from SHIPPING_METHODS keys and includes click_collect', () => {
    expect(VALID_SHIPPING_METHODS).toEqual(Object.keys(SHIPPING_METHODS));
    expect(VALID_SHIPPING_METHODS).toContain('click_collect');
  });
});
```

`lolett-app/__tests__/lib/constants/order-status.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TRANSITIONS,
  STRIPE_MANAGED_STATUSES,
  REFUNDABLE_STATUSES,
} from '@/lib/constants';
import { ORDER_STATUS_VALUES } from '@/lib/types/domain';

describe('ORDER_STATUS_TRANSITIONS', () => {
  it('has an entry for every status', () => {
    for (const status of ORDER_STATUS_VALUES) {
      expect(ORDER_STATUS_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(ORDER_STATUS_TRANSITIONS[status])).toBe(true);
    }
  });

  it('allows confirmed -> ready_for_pickup (C&C entry point)', () => {
    expect(ORDER_STATUS_TRANSITIONS.confirmed).toContain('ready_for_pickup');
  });

  it('makes picked_up only refundable', () => {
    expect(ORDER_STATUS_TRANSITIONS.picked_up).toEqual([
      'refunded',
      'partially_refunded',
    ]);
  });

  it('makes cancelled/refunded/expired terminal', () => {
    expect(ORDER_STATUS_TRANSITIONS.cancelled).toEqual([]);
    expect(ORDER_STATUS_TRANSITIONS.refunded).toEqual([]);
    expect(ORDER_STATUS_TRANSITIONS.expired).toEqual([]);
  });
});

describe('ORDER_STATUS_LABELS / COLORS', () => {
  it('has a feminine label for every status', () => {
    for (const status of ORDER_STATUS_VALUES) {
      expect(typeof ORDER_STATUS_LABELS[status]).toBe('string');
      expect(ORDER_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
    expect(ORDER_STATUS_LABELS.ready_for_pickup).toBe('Prête au retrait');
    expect(ORDER_STATUS_LABELS.picked_up).toBe('Retirée');
  });

  it('has a color triple for every status', () => {
    for (const status of ORDER_STATUS_VALUES) {
      const c = ORDER_STATUS_COLORS[status];
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(typeof c.tw).toBe('string');
      expect(typeof c.twFull).toBe('string');
    }
  });
});

describe('STRIPE_MANAGED_STATUSES / REFUNDABLE_STATUSES', () => {
  it('marks Stripe-managed statuses', () => {
    expect(STRIPE_MANAGED_STATUSES).toEqual([
      'refunded', 'partially_refunded', 'disputed', 'payment_review',
    ]);
  });

  it('includes ready_for_pickup as refundable (C&C no-show)', () => {
    expect(REFUNDABLE_STATUSES).toContain('ready_for_pickup');
  });
});
```

- [ ] (2) Lancer les tests → échec attendu :

```
npm run test -- __tests__/lib/constants/shipping.test.ts __tests__/lib/constants/order-status.test.ts
```

Sortie attendue : échecs sur les imports non encore exportés (`ORDER_STATUS_LABELS`, `STRIPE_MANAGED_STATUSES`, etc.) et sur `getTrackingUrl('click_collect', ...)` non géré (`computeShippingCost`/`SHIPPING_RATES` non typés pour click_collect).

- [ ] (3) Implémentation `lib/constants.ts`. Remplacer l'import L1 :

```ts
import type { ShippingMethod, ShippingCountryCode } from '@/types';
```

par l'import des arrays/types depuis le module neutre. **Attention (Note de cadrage §10)** : on n'importe PAS `ORDER_STATUS_VALUES` ici car il ne sera pas référencé dans `constants.ts` (les tests l'importent depuis `@/lib/types/domain`, pas depuis `constants.ts`) ; un import value inutilisé ferait échouer `npm run lint`. On le **ré-exporte** plutôt en bas de la section statuts (cf. plus bas), ce qui n'est pas un import inutilisé.

```ts
import {
  type OrderStatus,
  type ShippingMethod,
  type ShippingCarrier,
  type ShippingCountryCode,
} from '@/lib/types/domain';
```

Remplacer le bloc `SHIPPING_METHODS` + `SHIPPING_RATES` (L43-53) par :

```ts
export const SHIPPING_METHODS: Record<ShippingMethod, { id: ShippingMethod; label: string; carrier: ShippingCarrier }> = {
  home:          { id: 'home',          label: 'Livraison à domicile',                  carrier: 'colissimo' },
  mondial_relay: { id: 'mondial_relay', label: 'Point Relais Mondial Relay',            carrier: 'mondial_relay' },
  click_collect: { id: 'click_collect', label: 'Retrait en boutique (Click & Collect)', carrier: 'click_collect' },
};

// Dérivé dynamiquement — source unique pour la validation Stripe (remplace le tableau hardcodé du webhook)
export const VALID_SHIPPING_METHODS = Object.keys(SHIPPING_METHODS) as ShippingMethod[];

// Tarifs plats (€) par zone × méthode. click_collect UNIQUEMENT en FR (gratuit).
// VRAIES valeurs existantes conservées (le spec §5.3 affiche des chiffres erronés).
export const SHIPPING_RATES: Record<ShippingZone, Partial<Record<ShippingMethod, number>>> = {
  FR:      { home: 5.90, mondial_relay: 4.90, click_collect: 0 },
  BENELUX: { home: 7.90, mondial_relay: 6.90 },
  IBERIA:  { home: 9.90, mondial_relay: 7.90 },
};
```

Insérer le bloc statuts juste après la déclaration `export type ShippingZone = 'FR' | 'BENELUX' | 'IBERIA';` (L24) :

```ts
// ============================================================================
// STATUTS DE COMMANDE — source de vérité unique (13 statuts alignés DB)
// ============================================================================

// Ré-export pratique pour les consommateurs (PR4 OrderFilters dérive la liste).
// Ré-export (et non import) : pas d'import value inutilisé qui ferait échouer le lint.
export { ORDER_STATUS_VALUES } from '@/lib/types/domain';

// Labels FR au féminin (cohérent avec « commande »)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:            'En attente',
  paid:               'Payée',
  confirmed:          'Confirmée',
  shipped:            'Expédiée',
  delivered:          'Livrée',
  ready_for_pickup:   'Prête au retrait',
  picked_up:          'Retirée',
  cancelled:          'Annulée',
  refunded:           'Remboursée',
  partially_refunded: 'Remb. partiel',
  disputed:           'Litige Stripe',
  expired:            'Expirée',
  payment_review:     'À vérifier',
};

// Couleurs unifiées : hex (Recharts), tw (préfixe), twFull (classes badge complètes)
export const ORDER_STATUS_COLORS: Record<OrderStatus, { hex: string; tw: string; twFull: string }> = {
  pending:            { hex: '#94a3b8', tw: 'slate',   twFull: 'bg-slate-50 text-slate-700 border-slate-200' },
  paid:               { hex: '#3b82f6', tw: 'blue',    twFull: 'bg-blue-50 text-blue-700 border-blue-200' },
  confirmed:          { hex: '#8b5cf6', tw: 'violet',  twFull: 'bg-violet-50 text-violet-700 border-violet-200' },
  shipped:            { hex: '#f59e0b', tw: 'amber',   twFull: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivered:          { hex: '#10b981', tw: 'emerald', twFull: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ready_for_pickup:   { hex: '#06b6d4', tw: 'cyan',    twFull: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  picked_up:          { hex: '#14b8a6', tw: 'teal',    twFull: 'bg-teal-50 text-teal-700 border-teal-200' },
  cancelled:          { hex: '#ef4444', tw: 'red',     twFull: 'bg-red-50 text-red-700 border-red-200' },
  refunded:           { hex: '#f97316', tw: 'orange',  twFull: 'bg-orange-50 text-orange-700 border-orange-200' },
  partially_refunded: { hex: '#fb923c', tw: 'orange',  twFull: 'bg-orange-50 text-orange-600 border-orange-200' },
  disputed:           { hex: '#dc2626', tw: 'red',     twFull: 'bg-red-100 text-red-800 border-red-300' },
  expired:            { hex: '#6b7280', tw: 'gray',    twFull: 'bg-gray-50 text-gray-600 border-gray-200' },
  payment_review:     { hex: '#eab308', tw: 'yellow',  twFull: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
};

// Transitions autorisées par statut (workflow domicile + Click & Collect, cf. spec §4.5)
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:            ['paid', 'cancelled', 'expired', 'payment_review'],
  paid:               ['confirmed', 'cancelled', 'refunded'],
  confirmed:          ['shipped', 'ready_for_pickup', 'cancelled', 'refunded'],
  shipped:            ['delivered', 'refunded'],
  delivered:          ['refunded', 'partially_refunded'],
  ready_for_pickup:   ['picked_up', 'cancelled', 'refunded'],
  picked_up:          ['refunded', 'partially_refunded'],
  cancelled:          [],
  refunded:           [],
  partially_refunded: [],
  disputed:           ['refunded'],
  expired:            [],
  payment_review:     ['paid', 'cancelled'],
};

// Statuts gérés par les webhooks Stripe (non éditables manuellement depuis l'admin)
export const STRIPE_MANAGED_STATUSES: OrderStatus[] = [
  'refunded', 'partially_refunded', 'disputed', 'payment_review',
];

// Statuts éligibles à un refund Stripe depuis l'admin (inclut ready_for_pickup : no-show C&C)
export const REFUNDABLE_STATUSES: OrderStatus[] = [
  'paid', 'confirmed', 'shipped', 'delivered',
  'ready_for_pickup',
  'partially_refunded',
];

// Étapes parcours timeline (UI client + admin workflow viz)
export const ORDER_STEPS_HOME   = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'] as const;
export const ORDER_STEPS_PICKUP = ['pending', 'confirmed', 'paid', 'ready_for_pickup', 'picked_up'] as const;
```

Remplacer `computeShippingCost` (L80-90) par la version avec garde C&C, **logique de seuil conservée** :

```ts
export function computeShippingCost(
  subtotal: number,
  country: ShippingCountryCode,
  method: ShippingMethod
): number {
  // Garde sécurisée — Click & Collect FR-only au niveau code (anti-DevTools).
  if (method === 'click_collect') {
    if (country !== 'FR') {
      throw new Error('Click & Collect est disponible uniquement en France');
    }
    return 0;
  }
  const zone = getShippingZone(country);
  if (!zone) return 0;
  const threshold = SHIPPING_FREE_THRESHOLD[zone];
  if (threshold !== null && subtotal >= threshold) return 0;
  return SHIPPING_RATES[zone][method] ?? 0;
}
```

Remplacer `getShippingCarrier` (L92-94) — type de retour élargi :

```ts
export function getShippingCarrier(method: ShippingMethod): ShippingCarrier {
  return SHIPPING_METHODS[method].carrier;
}
```

Remplacer `getTrackingUrl` (L96-103) — retour `string | null`, signature carrier élargie :

```ts
// URL publique de suivi par transporteur. null pour click_collect (pas de suivi).
export function getTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string | null {
  if (carrier === 'click_collect') return null;
  if (carrier === 'mondial_relay') {
    const brand = process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID ?? '';
    return `https://www.mondialrelay.com/suivi-de-colis/?codeMarque=${encodeURIComponent(brand)}&NumeroExpedition=${encodeURIComponent(trackingNumber)}`;
  }
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
}
```

- [ ] (4) Corriger `app/livraison/page.tsx` (cassé par le passage de `SHIPPING_RATES` en `Partial<Record<...>>` : `SHIPPING_RATES[c.zone].home` et `.mondial_relay` deviennent `number | undefined`, et `.toFixed()` sur `number | undefined` = erreur TS2532). Remplacer les lignes L53-54 :

```tsx
                    <td className="px-4 py-3 text-right">{SHIPPING_RATES[c.zone].home.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right">{SHIPPING_RATES[c.zone].mondial_relay.toFixed(2)} €</td>
```

par (fallback `'—'` si la méthode n'existe pas dans la zone — robuste à toute évolution de tarifs) :

```tsx
                    <td className="px-4 py-3 text-right">{SHIPPING_RATES[c.zone].home != null ? `${SHIPPING_RATES[c.zone].home!.toFixed(2)} €` : '—'}</td>
                    <td className="px-4 py-3 text-right">{SHIPPING_RATES[c.zone].mondial_relay != null ? `${SHIPPING_RATES[c.zone].mondial_relay!.toFixed(2)} €` : '—'}</td>
```

Note : `home` et `mondial_relay` sont définis pour les 3 zones (FR/BENELUX/IBERIA), donc l'affichage reste inchangé en pratique ; le fallback ne sert qu'à satisfaire le type `number | undefined`. `features/cart/hooks.ts` L84 est déjà safe (`(zone && SHIPPING_RATES[zone][shippingMethod]) ?? 0`) — aucune modification nécessaire (vérifié).

- [ ] (5) Relancer les tests → succès :

```
npm run test -- __tests__/lib/constants/shipping.test.ts __tests__/lib/constants/order-status.test.ts
```

Sortie attendue : `Test Files  2 passed`, tous les `it` au vert.

- [ ] (6) Type-check + lint : `npm run validate` → **aucune erreur** (le `livraison/page.tsx` est corrigé dans cette task ; pas d'import inutilisé grâce au ré-export de `ORDER_STATUS_VALUES`). Vérifier en particulier que les call-sites `getShippingCarrier` (`features/checkout/hooks/useCheckout.ts` L170, `app/api/checkout/stripe/route.ts` L74) et `getTrackingUrl` (`order-shipped-v3.ts` L193, dans un template literal) compilent toujours.

```
npm run validate
```

- [ ] (7) Commit :

```
git add lolett-app/lib/constants.ts lolett-app/app/livraison/page.tsx lolett-app/__tests__/lib/constants/shipping.test.ts lolett-app/__tests__/lib/constants/order-status.test.ts
git commit -m "feat(constants): statuts/transitions/couleurs + tarifs click_collect (FR gratuit)"
```

---

### Task 4 : Mappers Supabase — `mapPickupPoint` + `mapOrder` + `DbOrder`

Ajoute `mapPickupPoint(raw, shippingMethod)` (backfill `provider`), l'utilise dans `mapOrder`, mappe les nouvelles colonnes, et étend `DbOrder`. **`DbOrder.pickup_point` est re-typé `Record<string, unknown> | null`** (snapshot JSONB legacy sans `provider` ; le type ne doit pas mentir — Note de cadrage §9).

**Files:**
- Modify: `lolett-app/lib/adapters/supabase-types.ts` (`DbOrder` L58-88, imports L1)
- Modify: `lolett-app/lib/adapters/supabase-mappers.ts` (imports L1, `mapOrder` L69-100)
- Test: `lolett-app/__tests__/lib/adapters/map-pickup-point.test.ts`

**Steps:**

- [ ] (1) Écrire le test qui échoue — `lolett-app/__tests__/lib/adapters/map-pickup-point.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { mapPickupPoint } from '@/lib/adapters/supabase-mappers';

const RAW_LEGACY = {
  id: '12345',
  name: 'Tabac de la Gare',
  address: '1 rue de la Gare',
  postalCode: '75001',
  city: 'Paris',
  country: 'FR',
};

describe('mapPickupPoint', () => {
  it('returns null when raw is null', () => {
    expect(mapPickupPoint(null, 'mondial_relay')).toBeNull();
  });

  it('returns null when raw is not an object', () => {
    expect(mapPickupPoint('nope', 'mondial_relay')).toBeNull();
  });

  it('backfills provider="mondial_relay" on a legacy snapshot with MR shipping method', () => {
    const point = mapPickupPoint(RAW_LEGACY, 'mondial_relay');
    expect(point?.provider).toBe('mondial_relay');
    expect(point?.name).toBe('Tabac de la Gare');
  });

  it('backfills provider="mondial_relay" when no shipping method (legacy default)', () => {
    const point = mapPickupPoint(RAW_LEGACY, null);
    expect(point?.provider).toBe('mondial_relay');
  });

  it('backfills provider="click_collect" when shipping method is click_collect', () => {
    const point = mapPickupPoint(RAW_LEGACY, 'click_collect');
    expect(point?.provider).toBe('click_collect');
  });

  it('preserves an explicit provider on the snapshot over the inference', () => {
    const point = mapPickupPoint(
      { ...RAW_LEGACY, provider: 'click_collect' },
      'mondial_relay'
    );
    expect(point?.provider).toBe('click_collect');
  });
});
```

- [ ] (2) Lancer le test → échec attendu :

```
npm run test -- __tests__/lib/adapters/map-pickup-point.test.ts
```

Sortie attendue : `mapPickupPoint is not a function` / import non résolu (la fonction n'est pas encore exportée).

- [ ] (3a) Implémentation `supabase-types.ts`. Étape A — retirer l'import de `PickupPoint` (L1) qui devient inutilisé après le re-typage de la colonne (sinon `no-unused-vars` casse le lint). L1 actuelle :

```ts
import type { CustomerInfo, Order, PickupPoint } from '@/types';
```

devient :

```ts
import type { CustomerInfo, Order } from '@/types';
```

Étape B — dans `DbOrder` (L58-88), re-typer la colonne `pickup_point` (L71) et ajouter les 3 colonnes PR1 juste après `payment_id: string | null;` (L77). Remplacer :

```ts
  pickup_point: PickupPoint | null;
```

par :

```ts
  // Snapshot JSONB brut : les lignes legacy n'ont PAS le discriminant `provider`.
  // Le type reflète la donnée réelle ; mapPickupPoint produit le PickupPoint conforme.
  pickup_point: Record<string, unknown> | null;
```

et ajouter, juste après `payment_id: string | null;` :

```ts
  ready_for_pickup_at: string | null;
  picked_up_at: string | null;
  pickup_code: string | null;
```

- [ ] (3b) Implémentation `supabase-mappers.ts`. Étendre l'import de types L1 pour inclure `PickupPoint`, `ShippingMethod`, `PickupPointProvider` :

```ts
import type { Product, Look, Category, Order, Size, Gender, ProductVariant, PickupPoint, ShippingMethod, PickupPointProvider } from '@/types';
```

Ajouter la fonction `mapPickupPoint` juste avant `mapOrder` (avant L69). Le cast final utilise `as unknown as PickupPoint` (pattern existant du repo, cf. `lib/admin/low-stock.ts` L82 `as unknown as`) : le spread d'un `Record<string, unknown>` n'est pas directement comparable à l'union d'interfaces sans index signature, donc un cast direct `as PickupPoint` risque l'erreur TS2352 :

```ts
// Normalise le snapshot JSONB pickup_point en union discriminée.
// Backfill du discriminant `provider` pour les snapshots legacy (sans provider) :
// click_collect si la méthode l'indique, sinon mondial_relay (historique).
export function mapPickupPoint(
  raw: unknown,
  shippingMethod: ShippingMethod | null
): PickupPoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const point = raw as Record<string, unknown>;
  const provider: PickupPointProvider =
    (point.provider as PickupPointProvider | undefined) ??
    (shippingMethod === 'click_collect' ? 'click_collect' : 'mondial_relay');
  return { ...point, provider } as unknown as PickupPoint;
}
```

Dans `mapOrder`, remplacer la ligne `pickupPoint: row.pickup_point ?? null,` (L83) par un appel au mapper, et ajouter les 3 champs C&C. Le bloc `mapOrder` devient :

```ts
export function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    total: Number(row.total),
    shipping: Number(row.shipping),
    promoCode: row.promo_code ?? undefined,
    promoDiscount: row.promo_discount != null ? Number(row.promo_discount) : undefined,
    giftCardCode: row.gift_card_code ?? undefined,
    giftCardAmount: row.gift_card_amount != null ? Number(row.gift_card_amount) : undefined,
    shippingMethod: row.shipping_method ?? undefined,
    shippingCarrier: row.shipping_carrier ?? undefined,
    shippingCountry: (row.shipping_country as Order['shippingCountry']) ?? undefined,
    pickupPoint: mapPickupPoint(row.pickup_point, row.shipping_method ?? null),
    invoiceNumber: row.invoice_number ?? undefined,
    invoicePdfUrl: row.invoice_pdf_url ?? undefined,
    status: row.status,
    paymentProvider: row.payment_provider ?? undefined,
    paymentId: row.payment_id ?? undefined,
    userId: row.user_id ?? undefined,
    readyForPickupAt: row.ready_for_pickup_at ?? undefined,
    pickedUpAt: row.picked_up_at ?? undefined,
    pickupCode: row.pickup_code ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id ?? '',
      productName: item.product_name,
      size: item.size as Size,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  };
}
```

Note : `row.pickup_point` est désormais typé `Record<string, unknown> | null` dans `DbOrder` — assignable à `unknown` (paramètre `raw` de `mapPickupPoint`) sans cast. Le retour `pickupPoint` est `PickupPoint | null`, conforme à `Order.pickupPoint?: PickupPoint | null`. OK.

- [ ] (4) Relancer le test → succès :

```
npm run test -- __tests__/lib/adapters/map-pickup-point.test.ts
```

Sortie attendue : `Test Files  1 passed`, `Tests  6 passed`.

- [ ] (5) Type-check + lint : `npm run validate`. Vérifier que `mapOrder` compile, que `mapPickupPoint` ne déclenche pas TS2352 (grâce au `as unknown as`), et qu'aucun import (notamment `PickupPoint` retiré de `supabase-types.ts`) n'est inutilisé.

```
npm run validate
```

- [ ] (6) Commit :

```
git add lolett-app/lib/adapters/supabase-mappers.ts lolett-app/lib/adapters/supabase-types.ts lolett-app/__tests__/lib/adapters/map-pickup-point.test.ts
git commit -m "feat(mappers): mapPickupPoint backfill provider + colonnes C&C dans mapOrder/DbOrder"
```

---

### Task 5 : Cart store v3 — reset systématique + migration backfill provider

`setShippingMethod` reset `pickupPoint` à chaque changement de méthode ; persist v2→v3 backfille `provider` sur l'ancien snapshot (sur une copie, sans muter l'entrée) et reset si la méthode persistée est invalide. La migration est extraite dans une fonction pure exportée `migrateCart`, typée via un état persisté dédié (pas de double-cast `as unknown as CartState` trompeur).

**Files:**
- Modify: `lolett-app/features/cart/store.ts` (imports L5, `setShippingMethod` L118-121, persist config L135-146)
- Test: `lolett-app/__tests__/features/cart/migrate.test.ts`

**Steps:**

- [ ] (1) Écrire le test qui échoue — `lolett-app/__tests__/features/cart/migrate.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { migrateCart } from '@/features/cart/store';

describe('migrateCart (v3)', () => {
  it('backfills provider="mondial_relay" on a legacy pickupPoint without provider', () => {
    const result = migrateCart(
      {
        shippingMethod: 'mondial_relay',
        pickupPoint: { id: '1', name: 'Relais', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR' },
      },
      2
    );
    expect(result.pickupPoint).not.toBeNull();
    expect((result.pickupPoint as { provider?: string }).provider).toBe('mondial_relay');
  });

  it('does not overwrite an existing provider', () => {
    const result = migrateCart(
      {
        shippingMethod: 'click_collect',
        pickupPoint: { id: '1', name: 'Boutique', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR', provider: 'click_collect' },
      },
      2
    );
    expect((result.pickupPoint as { provider?: string }).provider).toBe('click_collect');
  });

  it('does not mutate the input pickupPoint object', () => {
    const input = {
      shippingMethod: 'mondial_relay',
      pickupPoint: { id: '1', name: 'Relais', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR' },
    };
    migrateCart(input, 2);
    expect('provider' in input.pickupPoint).toBe(false);
  });

  it('resets to home + null pickupPoint when shippingMethod is invalid', () => {
    const result = migrateCart(
      { shippingMethod: 'drone_delivery', pickupPoint: { id: '1' } },
      2
    );
    expect(result.shippingMethod).toBe('home');
    expect(result.pickupPoint).toBeNull();
  });

  it('keeps a valid click_collect method untouched', () => {
    const result = migrateCart(
      {
        shippingMethod: 'click_collect',
        pickupPoint: { id: '1', name: 'B', address: 'x', postalCode: '75001', city: 'Paris', country: 'FR', provider: 'click_collect' },
      },
      2
    );
    expect(result.shippingMethod).toBe('click_collect');
  });

  it('is a no-op on an empty persisted state', () => {
    const result = migrateCart({}, 2);
    expect(result).toBeDefined();
    // état vide → shippingMethod absent → reset à 'home'
    expect(result.shippingMethod).toBe('home');
  });
});
```

- [ ] (2) Lancer le test → échec attendu :

```
npm run test -- __tests__/features/cart/migrate.test.ts
```

Sortie attendue : `migrateCart is not exported` / import non résolu.

- [ ] (3) Implémentation `features/cart/store.ts`.

(3a) Étendre l'import L5 pour ajouter `PickupPointProvider` depuis `@/types`, et ajouter l'import value `VALID_SHIPPING_METHODS` depuis `@/lib/constants`. L5 actuelle :

```ts
import type { CartItem, Size, ShippingCountryCode, ShippingMethod, PickupPoint } from '@/types';
```

devient :

```ts
import type { CartItem, Size, ShippingCountryCode, ShippingMethod, PickupPoint, PickupPointProvider } from '@/types';
import { VALID_SHIPPING_METHODS } from '@/lib/constants';
```

(3b) Modifier `setShippingMethod` (L118-121) pour reset le point à **chaque** changement de méthode. La condition `state.shippingMethod !== method` ne reset pas si on ré-appelle avec la même méthode, mais c'est exactement le comportement voulu (re-sélectionner la méthode déjà active ne doit pas effacer le point déjà choisi — spec §5.5). Le commentaire est aligné sur le code (« reset au **changement** ») :

```ts
      setShippingMethod: (method) => set((state) => ({
        shippingMethod: method,
        // Reset au CHANGEMENT de méthode (évite un résidu MR↔C&C).
        // Re-sélectionner la même méthode conserve le point déjà choisi (spec §5.5).
        pickupPoint: state.shippingMethod !== method ? null : state.pickupPoint,
      })),
```

(3c) Ajouter la fonction pure exportée `migrateCart` juste avant `export const useCartStore` (avant L38). Elle est typée sans `any` (narrowing depuis `unknown`), travaille sur une **copie** (ne mute jamais l'objet d'entrée ni son `pickupPoint` imbriqué), et retourne un état persisté dédié `PersistedCartState` (pas de double-cast `as unknown as CartState` trompeur — zustand re-merge les actions après migrate, donc le type retourné ne contient que les champs persistés) :

```ts
// Champs réellement persistés (zustand re-fusionne les actions après migrate).
type PersistedCartState = {
  items?: CartItem[];
  giftCard?: CartState['giftCard'];
  promo?: { code?: string } | null;
  shippingCountry?: ShippingCountryCode;
  shippingMethod?: ShippingMethod;
  pickupPoint?: (Record<string, unknown> & { provider?: PickupPointProvider }) | null;
};

// Migration pure et testable du panier persisté.
// v1→v2 : normalise la forme de `promo`. v2→v3 : backfill `provider='mondial_relay'`
// sur l'ancien pickupPoint (sur une COPIE, sans muter l'entrée), reset
// shippingMethod→home + pickupPoint→null si la méthode n'est plus valide.
export function migrateCart(persisted: unknown, version: number): PersistedCartState {
  const input = (persisted ?? {}) as PersistedCartState;
  // Copie de surface — ne jamais muter l'objet passé par zustand/l'appelant.
  const state: PersistedCartState = { ...input };

  // v1→v2 : forme du promo.
  if (version < 2 && state.promo) {
    state.promo = state.promo.code ? { code: state.promo.code } : null;
  }

  // v3 : backfill du discriminant provider sur les snapshots legacy.
  // Cloner le pickupPoint avant d'écrire `provider` (pas de mutation imbriquée).
  if (version < 3 && state.pickupPoint && !state.pickupPoint.provider) {
    state.pickupPoint = { ...state.pickupPoint, provider: 'mondial_relay' };
  }

  // Reset si la méthode persistée n'est plus supportée (revert deploy / cookie ancien).
  if (
    !state.shippingMethod ||
    !VALID_SHIPPING_METHODS.includes(state.shippingMethod)
  ) {
    state.shippingMethod = 'home';
    state.pickupPoint = null;
  }

  return state;
}
```

(3d) Mettre à jour la config persist (L135-146) : bump version à 3 et déléguer à `migrateCart`. Le retour de `migrateCart` (`PersistedCartState`) est compatible avec la signature `migrate` de zustand (qui attend l'état partiel persisté, pas le `CartState` complet avec actions) :

```ts
    {
      name: 'lolett-cart',
      version: 3,
      migrate: (persisted: unknown, version: number) => migrateCart(persisted, version),
    }
```

Note de typage : `PickupPoint` reste importé (utilisé par l'interface `CartState` L22 `pickupPoint: PickupPoint | null`). `PersistedCartState.pickupPoint` est volontairement typé en `Record<string, unknown>` (snapshot brut potentiellement sans provider) et non `PickupPoint`, ce qui reflète la réalité du localStorage legacy.

- [ ] (4) Relancer le test → succès :

```
npm run test -- __tests__/features/cart/migrate.test.ts
```

Sortie attendue : `Test Files  1 passed`, `Tests  6 passed`.

- [ ] (5) Type-check + lint : `npm run validate`. Vérifier qu'importer `VALID_SHIPPING_METHODS` (valeur runtime) depuis `@/lib/constants` dans un fichier `'use client'` compile (constants.ts n'a aucune dépendance serveur), et qu'aucun symbole importé n'est inutilisé (`PickupPointProvider` est utilisé par `PersistedCartState`).

```
npm run validate
```

- [ ] (6) Commit :

```
git add lolett-app/features/cart/store.ts lolett-app/__tests__/features/cart/migrate.test.ts
git commit -m "feat(cart): store v3 — reset pickupPoint au changement de methode + migrate backfill provider"
```

---

## Vérification finale PR2

- [ ] **Type-check vert à chaque commit** : `npm run type-check` (tsc --noEmit) sans aucune erreur. Aucun commit de cette PR ne laisse le type-check rouge (la task qui introduit une rupture corrige ses call-sites dans la même task : Task 2 fixe `MondialRelayWidget`, Task 3 fixe `livraison/page.tsx`).
- [ ] **Lint vert** : `npm run lint` (eslint étend `next/typescript`, `no-unused-vars` en error) — aucun import value inutilisé. En particulier `ORDER_STATUS_VALUES` est **ré-exporté** depuis `constants.ts` (pas importé inutilisé), et `PickupPoint` est retiré de `supabase-types.ts` après re-typage.
- [ ] **`npm run validate`** (lint + type-check) au vert.
- [ ] **Tests verts** : `npm run test` — les 5 nouveaux fichiers passent :
  - `__tests__/lib/types/domain.test.ts` (4 tests)
  - `__tests__/lib/constants/shipping.test.ts` (8 tests : C&C FR→0, BE→throw, home<seuil→tarif, home≥seuil→0, vrais tarifs conservés + click_collect BE/IBERIA undefined, getTrackingUrl C&C→null + colissimo, VALID_SHIPPING_METHODS dérivé)
  - `__tests__/lib/constants/order-status.test.ts` (transitions exhaustives, picked_up→[refunded, partially_refunded], confirmed→ready_for_pickup, cancelled/refunded/expired terminaux, labels féminins, couleurs, STRIPE_MANAGED/REFUNDABLE)
  - `__tests__/lib/adapters/map-pickup-point.test.ts` (6 tests : null, non-objet, backfill MR, backfill défaut, backfill C&C, provider explicite préservé)
  - `__tests__/features/cart/migrate.test.ts` (6 tests : backfill provider, pas d'écrasement, pas de mutation de l'entrée, reset si méthode invalide, méthode C&C conservée, état vide)
  - Et les fichiers de test pré-existants (15) restent verts.
- [ ] **Scénarios du spec couverts par PR2** (§12.1) :
  - `computeShippingCost` : `(FR, click_collect) → 0`, `(BE, click_collect) → throw`, `(FR, home, <seuil) → tarif`, `(FR, home, ≥seuil) → 0` ✓
  - `mapPickupPoint` : backfill `mondial_relay` si absent + MR, `click_collect` si méthode C&C ✓
  - `ORDER_STATUS_TRANSITIONS` : entrée pour chaque statut, `picked_up → ['refunded', 'partially_refunded']`, `confirmed` inclut `ready_for_pickup` ✓
  - Cart store : `setShippingMethod` reset `pickupPoint` au changement, `migrate v3` backfill provider ✓
  - `getTrackingUrl('click_collect') → null` ✓
- [ ] **Conventions** : zéro `any` (narrowing depuis `unknown` dans `mapPickupPoint` et `migrateCart` ; cast `as unknown as PickupPoint` aligné sur le pattern repo `low-stock.ts`), imports en alias `@/`, aucun cycle d'import (`domain.ts` → `constants.ts`/`types/index.ts`), pas de styles inline ajoutés, aucun fichier > 200 lignes ajouté (`domain.ts` ≈ 20 lignes). Si `constants.ts` dépasse ~200 lignes après l'ajout des blocs statuts, proposer de scinder la section statuts dans `lib/constants-order-status.ts` ré-exporté depuis `constants.ts`.

---

## Lien avec les autres PRs

- **PR1 (migrations DB)** — prérequis : crée les colonnes `orders.ready_for_pickup_at`, `picked_up_at`, `pickup_code`, le CHECK des 13 statuts (via `update_updated_at`, pas `moddatetime`), les CHECK `shipping_method`/`shipping_carrier` incluant `click_collect`, et le seed `email_settings.order_ready_for_pickup` (clé `'order_ready_for_pickup'`, variables en `{{var}}` double accolade, signoff `♥` U+2665). PR2 type ces colonnes côté TS (`DbOrder`, `Order`). Plan : `docs/superpowers/plans/2026-05-29-click-collect-pr1-migrations-db.md`.
- **PR3 (code atomique + emails)** — consomme `ShippingCarrier`, `PickupPoint`, `ORDER_STATUS_*` de PR2 ; pose les helpers `lib/orders/pickup-code.ts` (`generatePickupCode()`, `assignPickupCodeAtomic(supabase, orderId, extraPayload)`) et `lib/email/order-ready-for-pickup.ts` (`sendOrderReadyForPickupEmail`, suffixe `Email` exact). Décision **D1** : `sendOrderReadyForPickupEmail` accepte `pickupPoint: PickupPoint | null` (pas `ClickCollectPickupPoint` non-nullable) — un guard interne `Sentry.captureMessage + return` si `!pickupCode || !pickupPoint || pickupPoint.provider !== 'click_collect' || !pickupPoint.name`, pour que PR4 puisse l'appeler avec `updatedOrder.pickup_point` (qui est `PickupPoint | null` via `mapOrder`) sans narrowing/cast. Le sender réutilise le moteur `interpolate()` (cf. `lib/email/order-refunded.ts`), jamais `.replace('{orderNumber}', ...)`. `escapeHtml` provient de `lib/email/escape-html.ts`. La validation des transitions s'appuiera sur `ORDER_STATUS_TRANSITIONS` / `STRIPE_MANAGED_STATUSES`.
- **PR4 (UI admin)** — `OrderStatusBadge` consommera `ORDER_STATUS_LABELS` + `ORDER_STATUS_COLORS` ; `OrderStatusUpdate` utilisera `ORDER_STATUS_TRANSITIONS` + `ORDER_STEPS_HOME`/`ORDER_STEPS_PICKUP` ; `OrderFilters` dérivera la liste de `ORDER_STATUS_VALUES` (ré-exporté par `constants.ts`) ; le PATCH `/api/admin/orders/[id]` (statuts `ready_for_pickup`/`picked_up`, génération code via `assignPickupCodeAtomic`, timestamps `ready_for_pickup_at`/`picked_up_at`, email) est implémenté par **PR4 (décision D4)**, pas PR5 (scénarios A3/A4). Décision **D2** : c'est PR4 qui remplace les listes hardcodées de `app/api/admin/orders/[id]/refund/route.ts` (L36) ET `components/admin/RefundDialog.tsx` (~L52) par l'import de `REFUNDABLE_STATUSES` depuis `@/lib/constants` (scénario A9) ; PR2 et PR5 n'y touchent pas. Tous ces symboles sont posés en PR2.
- **PR5 (UI client + Stripe + facture)** — `ShippingMethodSelect`/`ClickCollectPicker` consommeront `SHIPPING_METHODS.click_collect`, `VALID_SHIPPING_METHODS`, `computeShippingCost` (garde C&C) ; le webhook remplacera son `VALID_SHIPPING_METHODS` hardcodé par l'import de `@/lib/constants` ; le webhook lit `pickup_points` via `.maybeSingle()` (décision **D3**, convention partagée avec les mocks PR6, évite PGRST116 sur 0 ligne). Décision **D5** : `metadata.pickup_point_id` + `metadata.pickup_provider` sont des clés PLATES snake_case (lookup rapide Stripe), DISTINCTES du snapshot JSON `pickupPoint` en camelCase (`postalCode`, etc.) — ne jamais lire `metadata.pickupPoint.postal_code`. Le `JSON.parse(...) as PickupPoint` du checkout devra poser `provider` (déjà permis par l'union) ; la facture PDF narrowera sur `provider`. Le cart store v3 (reset systématique) sécurise la bascule MR↔C&C testée en E2E (§12.4).
- **PR6 (E2E + edge cases)** — dépend de PR4 ET PR5 ; attribue A3/A4 à PR4 (décision D4). S'appuie sur le socle de types pour les scénarios DevTools (`computeShippingCost` throw hors FR) et la cohérence des transitions ; ses mocks Supabase utilisent `.maybeSingle()` (D3).
