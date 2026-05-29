# Click & Collect — PR5 : UI client, Stripe & facture — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher Click & Collect dans tout le parcours client (sélecteur de mode, picker boutique, validation, page de succès, espace client) et sécuriser le paiement Stripe + le webhook + la facture PDF côté serveur.

**Architecture:** Le checkout consomme `VALID_SHIPPING_METHODS` / `SHIPPING_METHODS` (issus de PR2) pour exposer une 3e option `click_collect` gatée FR. Un nouveau composant `ClickCollectPicker` lit les points actifs via le client Supabase anon (RLS `is_active=true`) et construit un snapshot `ClickCollectPickupPoint`. La route `/api/checkout/stripe` re-vérifie le point en base (anti-DevTools) et reconstruit le snapshot avant de créer la session ; le webhook bascule en `payment_review` toute session C&C dont le point n'est plus valide. La facture PDF affiche un bloc Click & Collect dédié.

**Tech Stack:** Next.js App Router (route handlers + `after()`), React 19 client components, Zustand v5, Stripe SDK, Supabase JS (anon + service_role), `@react-pdf/renderer`, Vitest (jsdom), Sentry.

---

## Notes de cadrage (corrections vs spec)

Ces écarts spec↔réalité sont déjà actés en PR1→PR4 et **doivent être respectés** par PR5 :

- **Types `ShippingMethod` / `ShippingCarrier` / `PickupPoint`** : à partir de PR2, `ShippingMethod = 'home' | 'mondial_relay' | 'click_collect'`, et `PickupPoint` est une **union discriminée par `provider`** (`MondialRelayPickupPoint` | `ClickCollectPickupPoint`). Les fichiers PR5 doivent narrower sur `provider` (jamais accéder à `point.hours` sans avoir vérifié `provider === 'click_collect'`). `lib/types/domain.ts` et l'épuration de `types/index.ts` sont livrés par PR2 — PR5 les **consomme**, ne les crée pas.
- **`VALID_SHIPPING_METHODS`** existe dans `@/lib/constants` (dérivé de `SHIPPING_METHODS`, PR2). La route Stripe et le webhook PR5 l'importent au lieu du tableau hardcodé `['home','mondial_relay']` actuel.
- **Tarifs réels conservés** : `SHIPPING_RATES.FR.mondial_relay` reste à la valeur réelle du code (la spec §5.3 écrivait 4.50, c'est faux). PR5 ne touche pas aux tarifs ; `click_collect:0` (FR uniquement) est ajouté par PR2. PR5 s'appuie sur `computeShippingCost` qui renvoie `0` pour `click_collect` en FR.
- **`Order` étendu** (PR2) : `pickupCode?: string | null`, `readyForPickupAt?`, `pickedUpAt?`. PR5 lit `order.pickupCode` sur la page succès et l'espace client.
- **Mappers PR2 (dépendance silencieuse à tracer — corrigé B6)** : les lectures d'order qui alimentent l'UI PR5 doivent passer par `mapPickupPoint` (`lib/adapters/supabase-mappers.ts`) qui **backfille `provider`** sur les snapshots legacy. Concrètement : `SupabaseOrderRepository.findById` (utilisé par `/api/orders/[id]` → `SuccessContent`) et `getOrderById` (`lib/adapters/supabase-user` → `OrderDetail`) doivent renvoyer `shippingMethod`, `pickupCode` ET un `pickupPoint` mappé. **État actuel vérifié (pré-PR2)** : `getOrderById` (`lib/adapters/user/orders.ts`) ne renvoie ni `shippingMethod`, ni `pickupPoint`, ni `pickupCode`. Sans le backfill PR2, `order.pickupPoint?.provider === 'click_collect'` est toujours `false` → le bloc C&C ne s'affiche jamais. Les Tasks 6a/6b incluent une **étape de vérification explicite** de cette dépendance.
- **Cart store v3** (PR2) : `setShippingMethod` reset `pickupPoint` à **tout** changement de méthode (plus seulement `home`). PR5 n'a donc pas à reset manuellement le point quand on passe de MR à C&C — mais `ClickCollectPicker` et `MondialRelayWidget` resettent quand même sur changement de **pays** (`useEffect([country])`), comportement complémentaire conservé.
- **`MondialRelayWidget` cleanup incomplet** (actuel L205-207) : seul `cancelSignal.cancelled = true` est posé ; il manque le garde `isMounted` sur `OnParcelShopSelected` et le `jQuery(container).empty().removeData()` + destruction de la map Leaflet. PR5 complète (§6.3) pour qu'un callback MR orphelin n'écrase pas un point C&C.
- **Provider sur le payload** : `useCheckout` envoie déjà `pickupPoint` au serveur ; en PR5 il devient `requiresPickupPoint ? pickupPoint : null` avec `requiresPickupPoint = method ∈ {mondial_relay, click_collect}`.
- **Ordre des steps timeline (préexistant, propagé sans modif)** : `ORDER_STEPS_HOME = ['pending','confirmed','paid','shipped','delivered']` et `ORDER_STEPS_PICKUP = ['pending','confirmed','paid','ready_for_pickup','picked_up']` (PR2) placent `confirmed` AVANT `paid`, alors que le workflow réel est `pending → paid → confirmed` (spec §4.5). Conséquence d'affichage : une commande au statut `paid` (mais pas encore `confirmed`) verra la pastille "Confirmée" remplie en même temps que "Payée" (la barre remplit tous les indices `≤ currentStep`). Ce comportement est **hérité de l'ancien `statusSteps`** (`['pending','confirmed','paid','shipped','delivered']`, L11 actuel de `OrderDetail`) — PR5 ne le corrige pas (hors scope ; toucherait l'ordre canonique partagé PR2). À garder à l'esprit pour la recette ; ne pas le traiter comme une régression PR5.
- **Styles** : les composants `ShippingMethodSelect`, `MondialRelayWidget`, `SuccessContent` utilisent déjà du **style inline** (héritage existant du tunnel checkout). On conserve ce style local pour rester cohérent et minimiser le diff (la règle "pas de styles inline" du CLAUDE.md ne sera pas régressée davantage : on suit le pattern du fichier modifié). `OrderDetail` utilise Tailwind — on y reste en Tailwind.
- **Metadata Stripe — clés plates vs snapshot (décision D5)** : `metadata.pickup_point_id` et `metadata.pickup_provider` sont des **clés PLATES en snake_case** servant de lookup rapide côté webhook (re-vérification BD). Elles sont **distinctes** du snapshot `metadata.pickupPoint` qui est un **JSON sérialisé en camelCase** (`postalCode`, `provider`, `hours`, …). Aucune PR ne doit lire `JSON.parse(metadata.pickupPoint).postal_code` (snake) ni `metadata.pickupPoint.postalCode` directement (c'est une string JSON, pas un objet). Le webhook lit **`metadata.pickup_point_id`** pour la re-vérification, jamais le snapshot pour le lookup.
- **Périmètre PR4 (décision D2/D4) — PR5 n'y touche pas** : l'extension du PATCH `/api/admin/orders/[id]` (statuts `ready_for_pickup`/`picked_up`, génération du code via `assignPickupCodeAtomic`, timestamps, email "Prête au retrait") est livrée par **PR4**. De même, le recâblage de `REFUNDABLE_STATUSES` dans `app/api/admin/orders/[id]/refund/route.ts` et `components/admin/RefundDialog.tsx` est **PR4**. PR5 ne modifie ni la route refund, ni `RefundDialog`, ni le PATCH admin.

---

## Task 1 : `ClickCollectPicker` — fetch des points actifs + sélection

Nouveau composant client qui liste les points de retrait actifs (RLS `is_active=true` via client anon) et alimente le store.

**Files:**
- Create: `lolett-app/features/checkout/components/ClickCollectPicker.tsx`
- Test: `lolett-app/__tests__/checkout/click-collect-picker.test.tsx`

Le composant lit la table `pickup_points` via `createClient()` (browser anon) de `@/lib/supabase/client`. La RLS publique filtre déjà `is_active=true` (cf. spec §4.1), donc le `select` ne re-filtre pas `is_active` mais ajoute `.eq('country', 'FR')` et trie par `sort_order`.

**Note de cohérence FR-only (corrigé B5)** : Click & Collect est gaté FR partout (sélecteur, route Stripe, webhook). Or la table `pickup_points` autorise n'importe quel `country` (défaut `'FR'`, mais éditable par Lola en admin). Pour éviter qu'un point actif créé par erreur avec `country != 'FR'` n'apparaisse dans un parcours FR-only, le picker filtre explicitement `.eq('country', 'FR')` dans le `select`. C'est cohérent avec le gating et sans risque (les 3 points by design sont FR).

### Étapes

- [ ] **(1) Écrire le test qui échoue.** Crée `lolett-app/__tests__/checkout/click-collect-picker.test.tsx` :

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

const { eqMock, setPickupPointMock } = vi.hoisted(() => ({
  eqMock: vi.fn(),
  setPickupPointMock: vi.fn(),
}));

// Le picker fait : .from('pickup_points').select(...).eq('country','FR').order('sort_order',...)
// On mocke la chaîne : select() -> { eq() } -> { order() résolu }.
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: eqMock,
        }),
      }),
    }),
  }),
}));

vi.mock('@/features/cart', () => ({
  useCartStore: (selector: (s: unknown) => unknown) =>
    selector({
      shippingCountry: 'FR',
      pickupPoint: null,
      setPickupPoint: setPickupPointMock,
    }),
}));

import { ClickCollectPicker } from '@/features/checkout/components/ClickCollectPicker';

const DB_POINTS = [
  {
    id: 'pt-1',
    name: 'Boutique du Marais',
    address: '12 rue des Archives',
    postal_code: '75004',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: 'Demandez Lola a la caisse',
  },
];

describe('ClickCollectPicker', () => {
  beforeEach(() => {
    eqMock.mockReset();
    setPickupPointMock.mockReset();
  });

  it('liste les points actifs renvoyes par Supabase', async () => {
    eqMock.mockResolvedValueOnce({ data: DB_POINTS, error: null });
    render(<ClickCollectPicker />);
    await waitFor(() => {
      expect(screen.getByText('Boutique du Marais')).toBeInTheDocument();
    });
    expect(screen.getByText(/12 rue des Archives/)).toBeInTheDocument();
    expect(screen.getByText(/Lun-Sam 10h-19h/)).toBeInTheDocument();
  });

  it('construit un ClickCollectPickupPoint et appelle setPickupPoint au clic', async () => {
    eqMock.mockResolvedValueOnce({ data: DB_POINTS, error: null });
    render(<ClickCollectPicker />);
    await waitFor(() => screen.getByText('Boutique du Marais'));
    fireEvent.click(screen.getByText('Boutique du Marais'));
    expect(setPickupPointMock).toHaveBeenCalledWith({
      provider: 'click_collect',
      id: 'pt-1',
      name: 'Boutique du Marais',
      address: '12 rue des Archives',
      postalCode: '75004',
      city: 'Paris',
      country: 'FR',
      hours: 'Lun-Sam 10h-19h',
      instructions: 'Demandez Lola a la caisse',
    });
  });

  it('affiche un etat vide quand aucun point actif', async () => {
    eqMock.mockResolvedValueOnce({ data: [], error: null });
    render(<ClickCollectPicker />);
    await waitFor(() => {
      expect(screen.getByText(/Aucun point de retrait/i)).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le fetch echoue', async () => {
    eqMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    render(<ClickCollectPicker />);
    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **(2) Lancer le test → échec attendu** (le module n'existe pas) :
  `npm run test -- click-collect-picker`
  Sortie attendue : `Failed to resolve import "@/features/checkout/components/ClickCollectPicker"`.

- [ ] **(3) Implémentation minimale.** Crée `lolett-app/features/checkout/components/ClickCollectPicker.tsx` :

```tsx
'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Info, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/features/cart';
import type { ClickCollectPickupPoint } from '@/types';

interface DbPickupPointRow {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  hours: string | null;
  instructions: string | null;
}

type Status = 'loading' | 'ready' | 'empty' | 'error';

export function ClickCollectPicker() {
  const country = useCartStore((s) => s.shippingCountry);
  const pickupPoint = useCartStore((s) => s.pickupPoint);
  const setPickupPoint = useCartStore((s) => s.setPickupPoint);

  const [points, setPoints] = useState<DbPickupPointRow[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  // Reset le point sélectionné si le pays change (C&C est FR-only ; un point
  // sélectionné en FR ne doit pas survivre à une bascule vers un autre pays).
  useEffect(() => {
    setPickupPoint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      // La RLS publique filtre is_active=true : on ne récupère que les points
      // visibles. On filtre aussi country='FR' (C&C est FR-only) pour ne pas
      // exposer un point créé par erreur avec un autre pays. Tri par sort_order
      // croissant (ordre défini par Lola en admin).
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pickup_points')
        .select('id, name, address, postal_code, city, country, hours, instructions')
        .eq('country', 'FR')
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        setStatus('error');
        return;
      }
      const rows = (data ?? []) as DbPickupPointRow[];
      setPoints(rows);
      setStatus(rows.length === 0 ? 'empty' : 'ready');
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (row: DbPickupPointRow) => {
    const point: ClickCollectPickupPoint = {
      provider: 'click_collect',
      id: row.id,
      name: row.name,
      address: row.address,
      postalCode: row.postal_code,
      city: row.city,
      country: row.country,
      hours: row.hours,
      instructions: row.instructions,
    };
    setPickupPoint(point);
  };

  return (
    <div
      aria-live="polite"
      style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {status === 'loading' && (
        <p style={{ fontSize: 13, color: '#9B8E82', fontFamily: "'DM Sans', sans-serif" }}>
          Chargement des points de retrait…
        </p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#B85555', fontFamily: "'DM Sans', sans-serif" }}>
          Impossible de charger les points de retrait. Merci de réessayer ou de choisir une autre méthode.
        </p>
      )}
      {status === 'empty' && (
        <p style={{ fontSize: 13, color: '#9B8E82', fontFamily: "'DM Sans', sans-serif" }}>
          Aucun point de retrait disponible pour le moment.
        </p>
      )}
      {status === 'ready' &&
        points.map((row) => {
          const selected = pickupPoint?.provider === 'click_collect' && pickupPoint.id === row.id;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => handleSelect(row)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '14px 18px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: selected ? '#C4956A' : '#E8E0D6',
                borderLeft: selected ? '3px solid #C4956A' : '1px solid #E8E0D6',
                backgroundColor: selected ? '#FFFBF7' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  marginTop: 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? '#C4956A' : '#D4CBC0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selected && (
                  <Check size={12} style={{ color: '#C4956A' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{row.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7A6E62', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} />
                  {row.address}, {row.postal_code} {row.city}
                </p>
                {row.hours && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9B8E82', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {row.hours}
                  </p>
                )}
                {row.instructions && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9B8E82', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Info size={12} />
                    {row.instructions}
                  </p>
                )}
              </div>
            </button>
          );
        })}
    </div>
  );
}
```

- [ ] **(4) Relancer le test → succès** : `npm run test -- click-collect-picker` → `4 passed`.
- [ ] **(5) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(6) Commit** :
  `git add lolett-app/features/checkout/components/ClickCollectPicker.tsx lolett-app/__tests__/checkout/click-collect-picker.test.tsx`
  `git commit -m "feat(checkout): composant ClickCollectPicker (points actifs FR via RLS anon)"`

---

## Task 2 : `ShippingMethodSelect` — 3e option click_collect + gating FR + a11y

**Files:**
- Modify: `lolett-app/features/checkout/components/ShippingMethodSelect.tsx` (imports L1-12, options L25-38, mapping L40-92)
- Test: `lolett-app/__tests__/checkout/shipping-method-select.test.tsx`

### Étapes

- [ ] **(1) Écrire le test qui échoue (corrigé B16 — la logique de gating FR + reset auto est réellement testable et couvre le scénario A6/bascule FR→BE).** Crée `lolett-app/__tests__/checkout/shipping-method-select.test.tsx`. On mocke `useCartStore` (sélecteur) et on vérifie : (a) en FR les 3 options s'affichent ; (b) en BE `click_collect` disparaît ; (c) si `method === 'click_collect'` et qu'on est en BE, `setMethod('home')` est appelé (reset auto via `useEffect`).

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const { setMethodMock, storeState } = vi.hoisted(() => ({
  setMethodMock: vi.fn(),
  storeState: {
    value: {
      shippingCountry: 'FR' as string,
      shippingMethod: 'home' as string,
      setShippingMethod: (m: string) => {},
    },
  },
}));

vi.mock('@/features/cart', () => ({
  useCartStore: (selector: (s: unknown) => unknown) => selector(storeState.value),
}));

// constants : on ne mocke pas, on utilise les vraies valeurs PR2 (SHIPPING_METHODS,
// SHIPPING_DELAYS, computeShippingCost, getShippingZone). Si l'environnement de test
// n'a pas encore PR2 mergée, cette suite échoue à l'import — signal attendu.
import { ShippingMethodSelect } from '@/features/checkout/components/ShippingMethodSelect';

describe('ShippingMethodSelect — gating FR + reset auto', () => {
  beforeEach(() => {
    setMethodMock.mockReset();
    storeState.value = {
      shippingCountry: 'FR',
      shippingMethod: 'home',
      setShippingMethod: setMethodMock,
    };
  });

  it('affiche les 3 options en France (dont Click & Collect)', () => {
    render(<ShippingMethodSelect subtotal={49.9} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(screen.getByText(/Click & Collect/i)).toBeInTheDocument();
  });

  it('masque Click & Collect hors France (BE)', () => {
    storeState.value = {
      shippingCountry: 'BE',
      shippingMethod: 'home',
      setShippingMethod: setMethodMock,
    };
    render(<ShippingMethodSelect subtotal={49.9} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(screen.queryByText(/Click & Collect/i)).not.toBeInTheDocument();
  });

  it('reset auto vers home si click_collect sélectionné mais pays hors FR', () => {
    storeState.value = {
      shippingCountry: 'BE',
      shippingMethod: 'click_collect',
      setShippingMethod: setMethodMock,
    };
    render(<ShippingMethodSelect subtotal={49.9} />);
    expect(setMethodMock).toHaveBeenCalledWith('home');
  });

  it('ne reset pas quand la méthode courante reste disponible', () => {
    storeState.value = {
      shippingCountry: 'FR',
      shippingMethod: 'click_collect',
      setShippingMethod: setMethodMock,
    };
    render(<ShippingMethodSelect subtotal={49.9} />);
    expect(setMethodMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **(2) Lancer le test → échec attendu** : `npm run test -- shipping-method-select`
  Sortie attendue : la 1re assertion échoue (`getAllByRole('radio')` renvoie 2 et non 3, et `Click & Collect` introuvable) car le composant actuel n'expose que 2 options sans `role="radio"`.

- [ ] **(3) Implémentation.** Remplacer les imports et la définition `options`. Éditer le haut du fichier :

```tsx
'use client';

import { useEffect, useMemo } from 'react';
import { Truck, MapPin, Store } from 'lucide-react';
import {
  SHIPPING_METHODS,
  SHIPPING_DELAYS,
  computeShippingCost,
  getShippingZone,
} from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/features/cart';
import type { ShippingMethod, ShippingCountryCode } from '@/types';

interface ShippingMethodSelectProps {
  subtotal: number;
}

interface MethodOption {
  id: ShippingMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  restrictTo?: ShippingCountryCode[];
}

export function ShippingMethodSelect({ subtotal }: ShippingMethodSelectProps) {
  const country = useCartStore((s) => s.shippingCountry);
  const method = useCartStore((s) => s.shippingMethod);
  const setMethod = useCartStore((s) => s.setShippingMethod);
  const zone = getShippingZone(country);
  const delay = zone ? SHIPPING_DELAYS[zone] : '';

  const filteredOptions = useMemo<MethodOption[]>(() => {
    const allOptions: MethodOption[] = [
      {
        id: 'home',
        label: SHIPPING_METHODS.home.label,
        description: 'À votre adresse, par Colissimo',
        icon: <Truck size={18} />,
      },
      {
        id: 'mondial_relay',
        label: SHIPPING_METHODS.mondial_relay.label,
        description: 'Retrait dans un point relais proche de chez vous',
        icon: <MapPin size={18} />,
      },
      {
        id: 'click_collect',
        label: SHIPPING_METHODS.click_collect.label,
        description: 'Retrait gratuit en boutique partenaire',
        icon: <Store size={18} />,
        restrictTo: ['FR'],
      },
    ];
    // Le filtre dépend uniquement de `country` (les options et leur `restrictTo`
    // sont statiques). On reconstruit `allOptions` dans le useMemo pour que le
    // tableau JSX (icônes incluses) soit stable tant que le pays ne change pas.
    return allOptions.filter((o) => !o.restrictTo || o.restrictTo.includes(country));
  }, [country]);

  // Reset auto si la méthode courante n'est plus disponible (bascule de pays :
  // ex. click_collect sélectionné puis passage en BE → retombe sur 'home').
  useEffect(() => {
    if (!filteredOptions.find((o) => o.id === method)) {
      setMethod('home');
    }
  }, [filteredOptions, method, setMethod]);

  return (
    <div
      role="radiogroup"
      aria-label="Mode de livraison"
      style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}
    >
      {filteredOptions.map((opt) => {
        const cost = computeShippingCost(subtotal, country, opt.id);
        const isFree = cost === 0 && subtotal > 0;
        const selected = method === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setMethod(opt.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 18px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: selected ? '#C4956A' : '#E8E0D6',
              borderLeft: selected ? '3px solid #C4956A' : '1px solid #E8E0D6',
              backgroundColor: selected ? '#FFFBF7' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${selected ? '#C4956A' : '#D4CBC0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C4956A' }} />}
            </div>
            <div style={{ color: '#C4956A', flexShrink: 0 }}>{opt.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{opt.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9B8E82' }}>
                {opt.description}{delay ? ` · ${delay}` : ''}
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: isFree ? '#7B9E6B' : '#2C2420', flexShrink: 0 }}>
              {isFree ? 'Offerte' : formatPrice(cost)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

  Note : `computeShippingCost` (PR2) renvoie `0` pour `click_collect` en FR sans throw ; comme `restrictTo:['FR']` masque l'option hors FR, `computeShippingCost` n'est jamais appelé avec `click_collect` + pays ≠ FR depuis ce composant. Le `useMemo` reconstruit `allOptions` à l'intérieur (deps `[country]` exactes) → plus besoin de `eslint-disable` ni de commentaire trompeur sur la stabilité de `allOptions`.

- [ ] **(4) Relancer le test → succès** : `npm run test -- shipping-method-select` → `4 passed`.
- [ ] **(5) Vérification manuelle complémentaire** : `npm run dev`, ouvrir `/checkout` (panier non vide), confirmer en FR les 3 options (`Click & Collect` avec icône `Store` et "Offerte") ; basculer le pays vers BE → 2 options, `click_collect` disparaît ; si `click_collect` était sélectionné, la sélection retombe sur `home`.
- [ ] **(6) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(7) Commit** :
  `git add lolett-app/features/checkout/components/ShippingMethodSelect.tsx lolett-app/__tests__/checkout/shipping-method-select.test.tsx`
  `git commit -m "feat(checkout): 3e option Click & Collect gatee FR + reset auto + a11y radiogroup"`

---

## Task 3 : `CheckoutForm` — mutex MR / C&C

**Files:**
- Modify: `lolett-app/features/checkout/components/CheckoutForm.tsx` (dynamic imports L12-20, branchement L313-318)

### Étapes

- [ ] **(1) Vérification manuelle (UI de composition — pas de logique unitaire isolable au-delà du mutex trivial).** Critère observable : en sélectionnant `mondial_relay` seul le widget MR s'affiche ; en sélectionnant `click_collect` seul le `ClickCollectPicker` s'affiche ; en `home` aucun des deux.

- [ ] **(2) Implémentation.** Ajouter le dynamic import du picker à côté de celui de MR (L12-20) :

```tsx
const MondialRelayWidget = dynamic(
  () => import('./MondialRelayWidget').then((m) => ({ default: m.MondialRelayWidget })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-stone-500">Chargement du sélecteur de point relais…</p>
    ),
  },
);

const ClickCollectPicker = dynamic(
  () => import('./ClickCollectPicker').then((m) => ({ default: m.ClickCollectPicker })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-stone-500">Chargement des points de retrait…</p>
    ),
  },
);
```

  Puis remplacer le bloc de branchement (L313-318 actuel) par le mutex :

```tsx
        {shippingMethod === 'mondial_relay' && (
          <MondialRelayWidget
            postalCode={formData.postalCode}
            country={formData.country}
          />
        )}

        {shippingMethod === 'click_collect' && <ClickCollectPicker />}
```

- [ ] **(3) Vérification manuelle effective** : `npm run dev`, `/checkout`, alterner les 3 méthodes et vérifier le mutex. En basculant MR→C&C, le widget MR disparaît proprement (validé par Task 4) et le picker s'affiche.
- [ ] **(4) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(5) Commit** :
  `git add lolett-app/features/checkout/components/CheckoutForm.tsx`
  `git commit -m "feat(checkout): branchement mutex MondialRelayWidget / ClickCollectPicker"`

---

## Task 4 : `MondialRelayWidget` — cleanup complet (anti callback orphelin)

**Files:**
- Modify: `lolett-app/features/checkout/components/MondialRelayWidget.tsx` (refs L136-146, callback L181-194, cleanup L205-207)

Objectif (spec §6.3) : un `useRef(isMounted)` ignore `OnParcelShopSelected` après démontage, et la cleanup function vide le conteneur jQuery + détruit la map Leaflet, pour qu'un callback MR retardé n'écrase pas un point C&C fraîchement sélectionné.

### Étapes

- [ ] **(1) Vérification manuelle (intégration DOM/jQuery non mockable en unit ; vérif observable).** Critère : sélectionner un point MR, basculer en C&C, choisir un point C&C → le store conserve le point `provider:'click_collect'` (vérifier via React DevTools / `localStorage['lolett-cart']` qui contient bien `provider:"click_collect"`). Avant le fix, un événement MR retardé pouvait réécrire un point `provider:'mondial_relay'`.

- [ ] **(2) Implémentation.** Ajouter le ref `isMounted` dans le corps du composant (après `containerRef`, L136) :

```tsx
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const setPickupPoint = useCartStore((s) => s.setPickupPoint);
```

  Garder le callback à l'abri d'un démontage (remplacer le corps de `OnParcelShopSelected`, L181-193). On ajoute `provider: 'mondial_relay'` au point (cohérent avec l'union discriminée PR2) :

```tsx
          OnParcelShopSelected: (data: MondialRelayPoint) => {
            // Garde-fou : si le widget a été démonté (bascule vers C&C / home)
            // entre le rendu de la liste MR et le clic utilisateur, on ignore
            // l'événement pour ne pas écraser un point C&C déjà sélectionné.
            if (!isMountedRef.current) return;
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
            setPickupPoint(point);
          },
```

  Remplacer la cleanup function de l'effet d'init (L205-207) par une cleanup complète. Capturer le nœud conteneur en début d'effet pour un cleanup stable :

```tsx
  useEffect(() => {
    isMountedRef.current = true;
    const cancelSignal = { cancelled: false };
    const containerNode = containerRef.current;

    async function init() {
      // ... corps inchangé ...
    }

    init();
    return () => {
      isMountedRef.current = false;
      cancelSignal.cancelled = true;
      // Détruit proprement le widget jQuery + la carte Leaflet pour éviter
      // les fuites (carte fantôme, handlers orphelins) et les collisions d'ID
      // au re-mount. empty().removeData() retire le markup et les data jQuery
      // attachées au conteneur (le plugin MR injecte la carte dans ce nœud).
      const $ = window.jQuery;
      if ($ && containerNode) {
        try {
          $(`#${containerNode.id}`).empty().removeData();
        } catch {
          // jQuery indisponible / déjà nettoyé — no-op.
        }
      }
    };
    // Re-init si pays change pour rebrancher le widget sur le bon pays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);
```

  Note : `empty().removeData()` sur le conteneur retire le nœud Leaflet injecté par le plugin MR et les data jQuery attachées au DOM supprimé. On ne référence pas l'instance Leaflet directement car le plugin MR ne l'expose pas. Limite connue (tolérable) : d'éventuels listeners globaux que Leaflet attache à `window`/`document` (resize…) ne sont pas explicitement retirés ; en pratique le widget est `dynamic({ssr:false})` monté une fois dans `CheckoutForm` (pas de StrictMode double-mount problématique ici), la fuite résiduelle est négligeable.

- [ ] **(3) Vérification manuelle effective** : exécuter le scénario du (1) dans `npm run dev`. Confirmer dans `localStorage['lolett-cart']` que `state.pickupPoint.provider === 'click_collect'` après la bascule.
- [ ] **(4) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(5) Commit** :
  `git add lolett-app/features/checkout/components/MondialRelayWidget.tsx`
  `git commit -m "fix(checkout): cleanup complet MondialRelayWidget (garde isMounted + provider MR + empty conteneur)"`

---

## Task 5 : `useCheckout` — validation + payload C&C

**Files:**
- Modify: `lolett-app/features/checkout/hooks/useCheckout.ts` (import L10, payload L163-175, validation L241-243)
- Test: `lolett-app/__tests__/checkout/use-checkout-pickup.test.ts`

### Étapes

- [ ] **(1) Écrire le test qui échoue.** Crée `lolett-app/__tests__/checkout/use-checkout-pickup.test.ts`. On teste la **logique pure** `computePickupValidity` extraite du hook (le hook complet dépend de React/Zustand, difficile à isoler ; on exporte donc un helper pur). Crée d'abord le test :

```ts
import { describe, it, expect } from 'vitest';
import { computePickupValidity } from '@/features/checkout/hooks/useCheckout';
import type { PickupPoint } from '@/types';

const CC_POINT: PickupPoint = {
  provider: 'click_collect',
  id: 'pt-1',
  name: 'Boutique du Marais',
  address: '12 rue des Archives',
  postalCode: '75004',
  city: 'Paris',
  country: 'FR',
  hours: null,
  instructions: null,
};

describe('computePickupValidity', () => {
  it('exige un point pour mondial_relay', () => {
    expect(computePickupValidity('mondial_relay', null)).toEqual({
      requiresPickupPoint: true,
      missing: true,
    });
  });

  it('exige un point pour click_collect', () => {
    expect(computePickupValidity('click_collect', null)).toEqual({
      requiresPickupPoint: true,
      missing: true,
    });
  });

  it("n'exige pas de point pour home", () => {
    expect(computePickupValidity('home', null)).toEqual({
      requiresPickupPoint: false,
      missing: false,
    });
  });

  it('valide quand le point est present pour click_collect', () => {
    expect(computePickupValidity('click_collect', CC_POINT)).toEqual({
      requiresPickupPoint: true,
      missing: false,
    });
  });
});
```

- [ ] **(2) Lancer le test → échec attendu** : `npm run test -- use-checkout-pickup`
  Sortie attendue : `computePickupValidity is not a function` / import non résolu.

- [ ] **(3) Implémentation minimale.** Dans `lolett-app/features/checkout/hooks/useCheckout.ts`, mettre à jour la ligne d'import existante (L10) pour inclure `ShippingMethod` et `PickupPoint`, puis ajouter le helper exporté (après les imports, avant `useCheckout`) :

```ts
import type { UserAddress, ShippingCountryCode, ShippingMethod, PickupPoint } from '@/types';

// Helper pur (testable) : détermine si un point de retrait est requis et
// s'il manque. mondial_relay ET click_collect exigent un point sélectionné.
export function computePickupValidity(
  method: ShippingMethod,
  pickupPoint: PickupPoint | null,
): { requiresPickupPoint: boolean; missing: boolean } {
  const requiresPickupPoint = method === 'mondial_relay' || method === 'click_collect';
  return {
    requiresPickupPoint,
    missing: requiresPickupPoint && !pickupPoint,
  };
}
```

  (La ligne d'import réelle actuelle est `import type { UserAddress, ShippingCountryCode } from '@/types';` — on y ajoute `ShippingMethod, PickupPoint`. Le fichier n'a pas d'`export default`, l'ajout d'un export nommé ne casse rien.)

  Puis remplacer la validation `pickupPoint` (L241-243) :

```ts
    const { missing: pickupMissing } = computePickupValidity(shippingMethod, pickupPoint);
    if (pickupMissing) {
      errors.pickupPoint = 'Merci de sélectionner un point de retrait';
    }
```

  Et le champ `pickupPoint` du payload (L172, actuellement `pickupPoint: shippingMethod === 'mondial_relay' ? pickupPoint : null,`) :

```ts
        pickupPoint: computePickupValidity(shippingMethod, pickupPoint).requiresPickupPoint ? pickupPoint : null,
```

- [ ] **(4) Relancer le test → succès** : `npm run test -- use-checkout-pickup` → `4 passed`.
- [ ] **(5) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(6) Commit** :
  `git add lolett-app/features/checkout/hooks/useCheckout.ts lolett-app/__tests__/checkout/use-checkout-pickup.test.ts`
  `git commit -m "feat(checkout): validation + payload pickupPoint pour MR et Click & Collect"`

---

## Task 6 : Page succès + espace client — affichage conditionnel sur `provider`

**Files:**
- Modify: `lolett-app/components/checkout/success/SuccessContent.tsx` (bloc adresse L114-124)
- Modify: `lolett-app/components/compte/OrderDetail.tsx` (imports L3-9, constantes locales L11-24, timeline L62 + L81-99, bloc adresse L141-152)

> **Dépendance silencieuse à vérifier AVANT d'implémenter (corrigé B6) :** le rendu C&C de cette Task repose sur `order.pickupPoint?.provider === 'click_collect'`, `order.shippingMethod` et `order.pickupCode`. Ces champs doivent être renvoyés par les lectures d'order qui alimentent ces deux composants :
> - `SuccessContent` charge l'order via `useOrderLoader` → `/api/orders/[id]` → `SupabaseOrderRepository.findById`.
> - `OrderDetail` charge l'order via `getOrderById` (`lib/adapters/supabase-user` → `lib/adapters/user/orders.ts`).
>
> **État vérifié dans le repo (pré-PR2)** : `getOrderById` (`lib/adapters/user/orders.ts`) ne renvoie actuellement ni `shippingMethod`, ni `pickupPoint`, ni `pickupCode`. Tant que PR2 n'a pas étendu ces deux mappers pour renvoyer `shippingMethod`, `pickupCode` et un `pickupPoint` passé par `mapPickupPoint` (qui backfille `provider` sur les snapshots legacy), le bloc C&C **ne s'affichera jamais** (le narrowing sur `provider` reste `false`). PR5 ne corrige pas ces mappers (c'est PR2) mais **ajoute une étape de vérification bloquante** ci-dessous.

### Étapes — 6a : SuccessContent

- [ ] **(1) Vérifier la dépendance mapper (bloquant — corrigé B6).** Confirmer par lecture que `SupabaseOrderRepository.findById` (`lib/adapters/supabase-order.ts`) renvoie `shippingMethod`, `pickupCode` et un `pickupPoint` mappé via `mapPickupPoint`. Si ce n'est pas le cas, **arrêter** : PR2 n'est pas mergée / incomplète → la Task ne peut pas être validée (le bloc C&C resterait invisible). Critère : pour un order C&C de test, `JSON.stringify(order.pickupPoint)` contient `"provider":"click_collect"`.

- [ ] **(2) Vérification manuelle (UI pure pilotée par `order`).** Critère : pour une commande C&C avec `pickupCode`, le bloc affiche "Point de retrait", nom + adresse + horaires + instructions + encadré "Code à présenter" en monospace ; pour MR, bloc point relais ; pour home, adresse domicile. À la sortie immédiate du checkout, `pickupCode` est encore `null` (généré seulement à `ready_for_pickup` par PR4) → afficher un message d'attente du code (corrigé B13).

- [ ] **(3) Implémentation.** Remplacer le bloc `{/* Address */}` (L114-124) de `SuccessContent.tsx` par un rendu conditionnel. Le `order.pickupPoint` est une union discriminée ; on narrow sur `provider` :

```tsx
                {/* Point de retrait / adresse — narrowing sur provider */}
                <div style={{ textAlign: 'left' as const }}>
                  {order.shippingMethod === 'click_collect' && order.pickupPoint?.provider === 'click_collect' ? (
                    <>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9B8E82', margin: '0 0 8px' }}>Point de retrait</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#2C2420', margin: 0 }}>{order.pickupPoint.name}</p>
                      <p style={{ fontSize: 13, color: '#7A6E62', margin: '2px 0 0' }}>
                        {order.pickupPoint.address}, {order.pickupPoint.postalCode} {order.pickupPoint.city}
                      </p>
                      {order.pickupPoint.hours && (
                        <p style={{ fontSize: 12, color: '#9B8E82', margin: '4px 0 0' }}>Horaires : {order.pickupPoint.hours}</p>
                      )}
                      {order.pickupPoint.instructions && (
                        <p style={{ fontSize: 12, color: '#9B8E82', margin: '2px 0 0', fontStyle: 'italic' }}>{order.pickupPoint.instructions}</p>
                      )}
                      {order.pickupCode ? (
                        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, background: '#FFFBF0', borderLeft: '3px solid #C4956A' }}>
                          <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9B8E82', margin: 0 }}>Code à présenter</p>
                          <p style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: '0.12em', color: '#2C2420', margin: '4px 0 0' }}>{order.pickupCode}</p>
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: '#9B8E82', margin: '10px 0 0', fontStyle: 'italic' }}>
                          Vous recevrez un email avec votre code de retrait dès que votre commande sera prête en boutique.
                        </p>
                      )}
                    </>
                  ) : order.shippingMethod === 'mondial_relay' && order.pickupPoint?.provider === 'mondial_relay' ? (
                    <>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9B8E82', margin: '0 0 8px' }}>Point Relais Mondial Relay</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#2C2420', margin: 0 }}>{order.pickupPoint.name}</p>
                      <p style={{ fontSize: 13, color: '#7A6E62', margin: '2px 0 0' }}>
                        {order.pickupPoint.address}, {order.pickupPoint.postalCode} {order.pickupPoint.city}
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#9B8E82', margin: '0 0 8px' }}>Adresse de livraison</p>
                      <p style={{ fontSize: 13, color: '#2C2420', margin: 0 }}>
                        {order.customer.firstName} {order.customer.lastName}
                      </p>
                      <p style={{ fontSize: 13, color: '#7A6E62', margin: '2px 0 0' }}>{order.customer.address}</p>
                      <p style={{ fontSize: 13, color: '#7A6E62', margin: '2px 0 0' }}>
                        {order.customer.postalCode} {order.customer.city}, {order.customer.country}
                      </p>
                    </>
                  )}
                </div>
```

- [ ] **(4) Vérification manuelle effective** : `npm run dev`, ouvrir une page succès pour une commande C&C (id connu) ; sans `pickupCode` → message d'attente affiché ; avec `pickupCode` (commande déjà passée `ready_for_pickup` par PR4) → encadré code monospace. Confirmer aussi le bloc MR et le bloc domicile sur des commandes correspondantes.
- [ ] **(5) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(6) Commit** :
  `git add lolett-app/components/checkout/success/SuccessContent.tsx`
  `git commit -m "feat(checkout): page succes affiche point C&C + code (ou attente du code)"`

### Étapes — 6b : OrderDetail (espace client)

- [ ] **(7) Vérifier la dépendance mapper (bloquant — corrigé B6).** Confirmer par lecture que `getOrderById` (`lib/adapters/user/orders.ts`) renvoie `shippingMethod`, `pickupCode` et `pickupPoint` mappé via `mapPickupPoint` (extension PR2). État actuel vérifié : il ne renvoie aucun de ces 3 champs. Si après PR2 ils sont absents → arrêter (le bloc C&C resterait invisible et la timeline retomberait toujours sur `ORDER_STEPS_HOME`).

- [ ] **(8) Implémentation.** Dans `lolett-app/components/compte/OrderDetail.tsx`, remplacer l'import (L3-9) et supprimer les constantes locales (L11-24) :

```tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getOrderById } from '@/lib/adapters/supabase-user';
import { ORDER_STATUS_LABELS, ORDER_STEPS_HOME, ORDER_STEPS_PICKUP } from '@/lib/constants';
import type { Order, OrderStatus } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
```

  Supprimer les anciennes constantes locales `statusSteps` (L11) et `statusLabels` (L12-24) — elles sont remplacées par `ORDER_STATUS_LABELS` (PR2) et les steps dérivés du mode.

  Dans le corps, calculer les steps selon le mode (remplacer `const currentStep = statusSteps.indexOf(order.status);`, L62). On type `steps` en `readonly OrderStatus[]` pour supprimer tout cast lors de l'accès à `ORDER_STATUS_LABELS` (corrigé B19) :

```tsx
  // Timeline adaptée au mode : C&C suit le parcours retrait, sinon livraison.
  // Fallback 'home' pour les commandes legacy sans shipping_method.
  const steps: readonly OrderStatus[] =
    (order.shippingMethod ?? 'home') === 'click_collect' ? ORDER_STEPS_PICKUP : ORDER_STEPS_HOME;
  const currentStep = steps.indexOf(order.status);
```

  Remplacer le bloc `{/* Status timeline */}` (L81-99). `steps` étant `readonly OrderStatus[]` et `ORDER_STATUS_LABELS` indexé par `OrderStatus`, l'accès `ORDER_STATUS_LABELS[step]` est direct (aucun cast) :

```tsx
        {/* Status timeline */}
        {!['cancelled', 'refunded', 'partially_refunded', 'disputed', 'expired'].includes(order.status) && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={cn(
                    'h-3 w-3 rounded-full mb-1',
                    i <= currentStep ? 'bg-[#1B0B94]' : 'bg-[#c4b49c]/30'
                  )} />
                  <span className={cn(
                    'text-[10px] font-body',
                    i <= currentStep ? 'text-[#1B0B94]' : 'text-[#8a7d6b]'
                  )}>
                    {ORDER_STATUS_LABELS[step]}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-[-22px] mx-[6px] h-0.5 bg-[#c4b49c]/20">
              <div
                className="absolute h-full bg-[#1B0B94] transition-all"
                style={{ width: `${Math.max(0, currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
```

  Remplacer le bloc `{/* Shipping address */}` (L141-152) par le rendu conditionnel narrowé :

```tsx
        {/* Point de retrait / adresse — narrowing sur provider */}
        {order.shippingMethod === 'click_collect' && order.pickupPoint?.provider === 'click_collect' ? (
          <div>
            <h3 className="font-body text-sm font-semibold text-[#1a1510] mb-2">Point de retrait</h3>
            <p className="text-sm text-[#1a1510] font-body font-medium">{order.pickupPoint.name}</p>
            <p className="text-sm text-[#5a4d3e] font-body">
              {order.pickupPoint.address}, {order.pickupPoint.postalCode} {order.pickupPoint.city}
            </p>
            {order.pickupPoint.hours && (
              <p className="text-xs text-[#8a7d6b] font-body mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {order.pickupPoint.hours}
              </p>
            )}
            {order.pickupPoint.instructions && (
              <p className="text-xs text-[#8a7d6b] font-body italic mt-1">{order.pickupPoint.instructions}</p>
            )}
            {order.pickupCode && (
              <div className="mt-3 p-3 bg-[#FFFBF0] border-l-2 border-[#C4956A] rounded">
                <span className="text-[10px] uppercase tracking-wider text-[#8a7d6b] font-body">Code à présenter</span>
                <p className="font-mono text-lg tracking-widest text-[#1a1510]">{order.pickupCode}</p>
              </div>
            )}
          </div>
        ) : order.shippingMethod === 'mondial_relay' && order.pickupPoint?.provider === 'mondial_relay' ? (
          <div>
            <h3 className="font-body text-sm font-semibold text-[#1a1510] mb-2">Point Relais Mondial Relay</h3>
            <p className="text-sm text-[#1a1510] font-body font-medium">{order.pickupPoint.name}</p>
            <p className="text-sm text-[#5a4d3e] font-body">
              {order.pickupPoint.address}, {order.pickupPoint.postalCode} {order.pickupPoint.city}
            </p>
          </div>
        ) : order.customer ? (
          <div>
            <h3 className="font-body text-sm font-semibold text-[#1a1510] mb-2">Adresse de livraison</h3>
            <p className="text-sm text-[#5a4d3e] font-body">
              {order.customer.firstName} {order.customer.lastName}<br />
              {order.customer.address}<br />
              {order.customer.postalCode} {order.customer.city}<br />
              {order.customer.country}
            </p>
          </div>
        ) : null}
```

  Note : `ORDER_STATUS_LABELS` (PR2) couvre les 13 statuts. La timeline n'affiche que les steps du parcours ; comme `steps` est `readonly OrderStatus[]`, l'accès `ORDER_STATUS_LABELS[step]` est typé sans cast.

- [ ] **(9) Vérification manuelle effective** : `npm run dev`, `/compte/commandes/<id-C&C>` → timeline `Prête au retrait`/`Retirée`, bloc point + code ; `/compte/commandes/<id-home>` → timeline livraison + adresse domicile.
- [ ] **(10) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(11) Commit** :
  `git add lolett-app/components/compte/OrderDetail.tsx`
  `git commit -m "feat(compte): timeline + bloc point C&C avec code dans le detail commande"`

---

## Task 7 : Route `/api/checkout/stripe` — validation C&C stricte + reconstruction snapshot

**Files:**
- Modify: `lolett-app/app/api/checkout/stripe/route.ts` (import + `VALID_METHODS` L5-20, validation L71-82, sessionParams L453-484)
- Test: `lolett-app/__tests__/api/checkout-stripe-click-collect.test.ts`

Logique (spec §10.1-10.2) : `VALID_METHODS` dérivé de `VALID_SHIPPING_METHODS` (inclut `click_collect`) ; guard `click_collect && country !== 'FR'` → 400 ; `requiresPickupPoint` pour MR et C&C ; pour C&C, vérifier `provider === 'click_collect'`, charger le point en BD (`is_active=true`), 400 si introuvable, **reconstruire le snapshot depuis la BD** ; `shipping_address_collection` omis si C&C ; `metadata.pickup_point_id` + `pickup_provider` (clés plates snake, lookup webhook) ; pas de line_item livraison si `shipping === 0` (déjà le cas via `if (shipping > 0)`).

> **PR5 ne touche PAS** `app/api/admin/orders/[id]/refund/route.ts` ni `components/admin/RefundDialog.tsx` (recâblage `REFUNDABLE_STATUSES` = PR4, décision D2).

### Étapes

- [ ] **(1) Écrire le test qui échoue.** Crée `lolett-app/__tests__/api/checkout-stripe-click-collect.test.ts`. On mocke `@/lib/supabase/admin` (produits + pickup_points), Stripe, et les dépendances email/facture. Le test cible les rejets de validation et la reconstruction (cas 400 n'atteignant pas Stripe ; le cas valide doit appeler Stripe avec la metadata reconstruite).

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  productsRows,
  pickupPointRow,
  sessionCreateMock,
  customersListMock,
  customersCreateMock,
} = vi.hoisted(() => ({
  productsRows: [{ id: 'prod-1', name: 'Robe Lola', price: 49.9 }],
  pickupPointRow: {
    value: null as null | Record<string, unknown>,
  },
  sessionCreateMock: vi.fn().mockResolvedValue({ url: 'https://stripe.test/session' }),
  customersListMock: vi.fn().mockResolvedValue({ data: [] }),
  customersCreateMock: vi.fn().mockResolvedValue({ id: 'cus_1' }),
}));

// Client admin mocké : router les tables products / pickup_points.
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'products') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: productsRows, error: null }),
          }),
        };
      }
      if (table === 'pickup_points') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: pickupPointRow.value, error: pickupPointRow.value ? null : { message: 'not found' } }),
              }),
            }),
          }),
        };
      }
      // promo_codes / gift_cards : non utilisés ici → maybeSingle null
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    },
  }),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: sessionCreateMock } },
    customers: { list: customersListMock, create: customersCreateMock, update: vi.fn() },
    coupons: { create: vi.fn() },
  })),
}));

// Pas de redemption / facture / email dans ces scénarios C&C (pas de promo, pas de gift card).
vi.mock('@/lib/email/order-confirmation', () => ({ sendOrderConfirmation: vi.fn() }));
vi.mock('@/lib/email/order-new-admin', () => ({ sendNewOrderAlertToAdmin: vi.fn() }));
vi.mock('@/lib/invoice/generate-invoice', () => ({ generateInvoicePdf: vi.fn() }));

import { POST } from '@/app/api/checkout/stripe/route';

const BASE_BODY = {
  items: [{ productId: 'prod-1', productName: 'Robe Lola', size: 'M', quantity: 1 }],
  customer: {
    firstName: 'Marie', lastName: 'Durand', email: 'marie@ex.fr', phone: '+33612345678',
    address: '1 rue de Paris', city: 'Paris', postalCode: '75001', country: 'France',
  },
  total: 49.9,
  shipping: 0,
  userId: undefined,
};

function makeReq(body: unknown) {
  return new Request('http://x/api/checkout/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/checkout/stripe — Click & Collect', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sessionCreateMock.mockClear();
    pickupPointRow.value = null;
  });

  it('rejette click_collect hors France (400)', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'BE',
      pickupPoint: { provider: 'click_collect', id: 'pt-1' },
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });

  it('rejette un pickupPoint inconnu / inactif (400)', async () => {
    pickupPointRow.value = null; // .single() renvoie not found
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      pickupPoint: { provider: 'click_collect', id: 'pt-unknown' },
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });

  it('rejette un provider falsifie (400)', async () => {
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      pickupPoint: { provider: 'mondial_relay', id: 'pt-1' },
    }));
    expect(res.status).toBe(400);
    expect(sessionCreateMock).not.toHaveBeenCalled();
  });

  it('accepte un C&C valide et remet a plat le snapshot depuis la BD', async () => {
    pickupPointRow.value = {
      id: 'pt-1', name: 'Boutique du Marais', address: '12 rue des Archives',
      postal_code: '75004', city: 'Paris', country: 'FR',
      hours: 'Lun-Sam 10h-19h', instructions: 'Demandez Lola', is_active: true,
    };
    const res = await POST(makeReq({
      ...BASE_BODY,
      shippingMethod: 'click_collect',
      shippingCountry: 'FR',
      // snapshot client volontairement falsifie : doit etre ignore au profit de la BD
      pickupPoint: { provider: 'click_collect', id: 'pt-1', name: 'FAKE', address: 'FAKE', postalCode: '00000', city: 'FAKE', country: 'FR' },
    }));
    expect(res.status).toBe(200);
    expect(sessionCreateMock).toHaveBeenCalledTimes(1);
    const params = sessionCreateMock.mock.calls[0][0];
    // shipping_address_collection omis pour C&C
    expect(params.shipping_address_collection).toBeUndefined();
    // metadata reconstruite depuis la BD ; clés plates snake = lookup webhook
    expect(params.metadata.shippingMethod).toBe('click_collect');
    expect(params.metadata.pickup_point_id).toBe('pt-1');
    expect(params.metadata.pickup_provider).toBe('click_collect');
    // snapshot JSON camelCase, distinct des clés plates snake
    const snap = JSON.parse(params.metadata.pickupPoint);
    expect(snap.name).toBe('Boutique du Marais'); // BD, pas 'FAKE'
    expect(snap.postalCode).toBe('75004');
  });
});
```

- [ ] **(2) Lancer le test → échec attendu** : `npm run test -- checkout-stripe-click-collect`
  Sortie attendue : échecs sur les 4 cas (la route actuelle limite `VALID_METHODS` à `['home','mondial_relay']`, n'a pas de guard FR pour C&C, et n'omet pas `shipping_address_collection`).

- [ ] **(3) Implémentation.** Modifier `lolett-app/app/api/checkout/stripe/route.ts`.

  Import + `VALID_METHODS` (L5-20) — utiliser `VALID_SHIPPING_METHODS` dérivé (le `import type` L16 inclut déjà `ShippingMethod, ShippingCountryCode, PickupPoint`) :

```ts
import {
  computeShippingCost,
  getShippingCarrier,
  SHIPPING_COUNTRIES,
  VALID_SHIPPING_METHODS,
} from '@/lib/constants';
```

```ts
const VALID_COUNTRIES = SHIPPING_COUNTRIES.map((c) => c.code) as ShippingCountryCode[];
const VALID_METHODS: ShippingMethod[] = VALID_SHIPPING_METHODS;
```

  Bloc de validation + reconstruction (remplacer L71-82). On rend `pickupPoint` réassignable (`let`). **Remplacer aussi la déclaration `const pickupPoint` (L82) et déplacer le `const admin = createAdminClient();` ici** (corrigé B17) :

```ts
    // Validation pays + mode (sécurité serveur — ne jamais faire confiance au client).
    const shippingCountry: ShippingCountryCode = (rawCountry && VALID_COUNTRIES.includes(rawCountry)) ? rawCountry : 'FR';
    const shippingMethod: ShippingMethod = (rawMethod && VALID_METHODS.includes(rawMethod)) ? rawMethod : 'home';
    const shippingCarrier = getShippingCarrier(shippingMethod);

    // Click & Collect : disponible uniquement en France (les points sont en FR).
    if (shippingMethod === 'click_collect' && shippingCountry !== 'FR') {
      return NextResponse.json(
        { error: 'Click & Collect est disponible uniquement en France' },
        { status: 400 }
      );
    }

    const requiresPickupPoint = shippingMethod === 'mondial_relay' || shippingMethod === 'click_collect';
    if (requiresPickupPoint && (!rawPickup || !rawPickup.id)) {
      return NextResponse.json(
        { error: 'Point de retrait manquant' },
        { status: 400 }
      );
    }

    // Pour mondial_relay on garde le snapshot client (revérifié par le transporteur) ;
    // pour click_collect il sera ÉCRASÉ par la reconstruction BD ci-dessous.
    let pickupPoint: PickupPoint | null = requiresPickupPoint ? (rawPickup ?? null) : null;

    // Client admin (service_role) — utilisé pour la vérif produits/prix, promo,
    // gift card ET la re-vérification du point C&C ci-dessous. Une seule instance.
    const admin = createAdminClient();

    // Click & Collect : on ne fait JAMAIS confiance au snapshot client. On
    // vérifie que le point existe et est actif, puis on RECONSTRUIT le snapshot
    // depuis la BD (anti-DevTools : un client peut forger name/address/id).
    if (shippingMethod === 'click_collect') {
      if (!rawPickup || rawPickup.provider !== 'click_collect') {
        return NextResponse.json({ error: 'Provider invalide' }, { status: 400 });
      }
      // .single() ici (route) : 0 ligne renvoie { data: null, error: PGRST116 } ;
      // on ne lit que `data` → dbPoint null → le guard !dbPoint attrape le cas.
      const { data: dbPoint } = await admin
        .from('pickup_points')
        .select('id, name, address, postal_code, city, country, hours, instructions, is_active')
        .eq('id', rawPickup.id)
        .eq('is_active', true)
        .single();
      if (!dbPoint) {
        return NextResponse.json(
          { error: 'Point de retrait introuvable ou inactif' },
          { status: 400 }
        );
      }
      pickupPoint = {
        provider: 'click_collect',
        id: dbPoint.id,
        name: dbPoint.name,
        address: dbPoint.address,
        postalCode: dbPoint.postal_code,
        city: dbPoint.city,
        country: dbPoint.country,
        hours: dbPoint.hours,
        instructions: dbPoint.instructions,
      };
    }
```

  **Supprimer l'ancienne déclaration `const admin = createAdminClient();` (L85, désormais redondante)** — `admin` est maintenant déclaré dans le bloc de validation ci-dessus, AVANT toutes ses utilisations (produits L87, promo, gift card). Ne garder qu'un seul `const admin`.

  Construction `sessionParams` (L453-484). **Remplacer le bloc `shipping_address_collection` INCONDITIONNEL actuel (L460-462)** par un spread conditionnel (corrigé B9 — sans cette suppression, la clé inconditionnelle écraserait le spread et l'adresse serait collectée même en C&C). Et documenter les clés plates snake vs snapshot camelCase (D5) :

```ts
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      ...(stripeCustomerId
        ? { customer: stripeCustomerId, customer_update: { shipping: 'auto', address: 'auto', name: 'auto' } }
        : { customer_email: customer.email }),
      // Pas de collecte d'adresse de livraison en Click & Collect (retrait boutique).
      // ⚠ Ce spread REMPLACE l'ancien bloc shipping_address_collection inconditionnel
      // (ex-L460-462). Ne pas réintroduire de version inconditionnelle après ce spread,
      // sinon elle écraserait l'omission C&C (dernière clé du littéral gagne).
      ...(shippingMethod !== 'click_collect' && {
        shipping_address_collection: {
          allowed_countries: VALID_COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
        },
      }),
      metadata: {
        customer: JSON.stringify(customer),
        items: JSON.stringify(
          verifiedItems.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
          }))
        ),
        total: String(total),
        shipping: String(shipping),
        shippingMethod,
        shippingCarrier,
        shippingCountry,
        // --- Snapshot complet du point (JSON, clés camelCase: postalCode, provider, hours…).
        // Sert à reconstruire l'affichage client. NE PAS lire pour le lookup webhook.
        pickupPoint: pickupPoint ? JSON.stringify(pickupPoint) : '',
        // --- Clés PLATES snake_case = lookup rapide côté webhook (re-vérification BD).
        // Distinctes du snapshot ci-dessus. Pour mondial_relay, pickup_provider
        // provient du snapshot client (non re-vérifié serveur, acceptable : MR ne
        // déclenche pas la garde C&C du webhook). Pour click_collect, ces valeurs
        // viennent du point reconstruit depuis la BD.
        pickup_point_id: requiresPickupPoint && pickupPoint ? pickupPoint.id : '',
        pickup_provider: requiresPickupPoint && pickupPoint ? pickupPoint.provider : '',
        userId: userId || '',
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    };
```

  Le line_item "Livraison" reste inchangé : `if (shipping > 0)` (L412) ne pousse rien quand `shipping === 0` (cas C&C) — conforme spec §10.1.

  Le type du body (L62-64) est déjà `pickupPoint?: PickupPoint | null` ; comme `PickupPoint` est la nouvelle union (PR2), `rawPickup.provider` est accessible après le narrowing `rawPickup.provider !== 'click_collect'`.

- [ ] **(4) Relancer le test → succès** : `npm run test -- checkout-stripe-click-collect` → `4 passed`.
- [ ] **(5) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(6) Commit** :
  `git add lolett-app/app/api/checkout/stripe/route.ts lolett-app/__tests__/api/checkout-stripe-click-collect.test.ts`
  `git commit -m "feat(checkout): validation Stripe C&C stricte + reconstruction snapshot BD"`

---

## Task 8 : Webhook Stripe — validation C&C + bascule `payment_review`

**Files:**
- Modify: `lolett-app/app/api/webhooks/stripe/route.ts` (`VALID_SHIPPING_METHODS` L16-21, carrier L239, branche `checkout.session.completed` après idempotence L264, juste avant `// 1. Create order` L269)
- Test: `lolett-app/__tests__/api/webhook-stripe-click-collect.test.ts`

Logique (spec §10.3) : `VALID_SHIPPING_METHODS` inclut `click_collect` ; dans `checkout.session.completed`, **avant** le create order / mark paid, si `shipping_method === 'click_collect'`, vérifier `pickup_point_id` actif en BD ET `pickup_provider === 'click_collect'` ; sinon créer l'order, le passer en `payment_review`, `Sentry.captureMessage(step:'webhook')`, **skip l'email de confirmation** et return 200. Le lookup BD utilise **`.maybeSingle()`** (décision D3 — cohérent avec `assignPickupCodeAtomic` et les mocks PR6, évite PGRST116 sur 0 ligne).

### Étapes

- [ ] **(1) Écrire le test qui échoue.** Crée `lolett-app/__tests__/api/webhook-stripe-click-collect.test.ts`. On mocke la vérification de signature Stripe pour injecter directement un event, l'idempotence (insert ok), le repo order, et le client admin (table pickup_points en `.maybeSingle()` + orders update). On vérifie que pour un point invalide l'order passe `payment_review`, l'email n'est pas envoyé, et le status 200.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  constructEventMock,
  sendOrderConfirmationMock,
  orderCreateMock,
  ordersUpdateEqMock,
  pickupPointValue,
  captureMessageMock,
} = vi.hoisted(() => ({
  constructEventMock: vi.fn(),
  sendOrderConfirmationMock: vi.fn().mockResolvedValue({ success: true }),
  orderCreateMock: vi.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'LOL-TEST' }),
  ordersUpdateEqMock: vi.fn().mockResolvedValue({ data: null, error: null }),
  pickupPointValue: { value: null as null | Record<string, unknown> },
  captureMessageMock: vi.fn(),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: { constructEvent: constructEventMock },
  })),
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage: captureMessageMock,
  captureException: vi.fn(),
}));

vi.mock('@/lib/adapters/supabase', () => ({
  SupabaseOrderRepository: vi.fn().mockImplementation(() => ({
    create: orderCreateMock,
  })),
}));

vi.mock('@/lib/email/order-confirmation', () => ({ sendOrderConfirmation: sendOrderConfirmationMock }));
vi.mock('@/lib/email/order-new-admin', () => ({ sendNewOrderAlertToAdmin: vi.fn() }));
vi.mock('@/lib/invoice/generate-invoice', () => ({ generateInvoicePdf: vi.fn().mockResolvedValue({ pdf: null }) }));
vi.mock('@/lib/orders/decrement-stock', () => ({ decrementStockForOrder: vi.fn() }));
vi.mock('@/lib/email-provider', () => ({ sendHtmlEmail: vi.fn() }));
vi.mock('@/lib/email/templates/gift-card-delivery-v3', () => ({ renderGiftCardDeliveryV3: vi.fn() }));
vi.mock('@/lib/email/templates/gift-card-purchase-confirmation-v3', () => ({ renderGiftCardPurchaseConfirmationV3: vi.fn() }));
vi.mock('@/lib/email/order-refunded', () => ({ sendOrderRefunded: vi.fn() }));
vi.mock('@/lib/email/dispute-alert', () => ({ sendDisputeAlertToAdmin: vi.fn(), sendDisputeClosedToAdmin: vi.fn() }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'stripe_webhook_events') {
        return {
          insert: () => Promise.resolve({ error: null }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
          delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
        };
      }
      if (table === 'pickup_points') {
        // D3 : .maybeSingle() (pas .single()) côté webhook.
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: pickupPointValue.value, error: null }),
            }),
          }),
        };
      }
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
          }),
          update: () => ({ eq: ordersUpdateEqMock }),
        };
      }
      return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }) };
    },
  }),
}));

import { POST } from '@/app/api/webhooks/stripe/route';

function makeWebhookReq() {
  return new Request('http://x/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: '{}',
  }) as unknown as import('next/server').NextRequest;
}

const BASE_METADATA = {
  items: JSON.stringify([{ productId: 'p1', productName: 'Robe', size: 'M', quantity: 1, price: 49.9 }]),
  customer: JSON.stringify({ firstName: 'Marie', lastName: 'D', email: 'm@x.fr', phone: '+33612345678', address: '1 rue', city: 'Paris', postalCode: '75001', country: 'France' }),
  total: '49.9',
  shipping: '0',
  shippingMethod: 'click_collect',
  shippingCountry: 'FR',
};

describe('Webhook Stripe — Click & Collect', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_x';
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
    sendOrderConfirmationMock.mockClear();
    ordersUpdateEqMock.mockClear();
    captureMessageMock.mockClear();
    pickupPointValue.value = null;
  });

  it('bascule payment_review + skip email quand le point C&C est invalide', async () => {
    pickupPointValue.value = null; // point introuvable / inactif (maybeSingle → data:null)
    constructEventMock.mockReturnValueOnce({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', payment_intent: 'pi_1', metadata: { ...BASE_METADATA, pickup_point_id: 'pt-x', pickup_provider: 'click_collect' } } },
    });

    const res = await POST(makeWebhookReq());
    expect(res.status).toBe(200);
    expect(sendOrderConfirmationMock).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalled();
    // Au moins un update a posé payment_review
    const updatedToReview = ordersUpdateEqMock.mock.calls.length > 0;
    expect(updatedToReview).toBe(true);
  });

  it('poursuit le flow normal quand le point C&C est actif', async () => {
    pickupPointValue.value = { id: 'pt-x', is_active: true };
    constructEventMock.mockReturnValueOnce({
      id: 'evt_2',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_2', payment_intent: 'pi_2', metadata: { ...BASE_METADATA, pickup_point_id: 'pt-x', pickup_provider: 'click_collect' } } },
    });

    const res = await POST(makeWebhookReq());
    expect(res.status).toBe(200);
    expect(sendOrderConfirmationMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **(2) Lancer le test → échec attendu** : `npm run test -- webhook-stripe-click-collect`
  Sortie attendue : le 1er cas échoue (le webhook actuel ne connaît pas `click_collect`, traite la session normalement et envoie l'email).

- [ ] **(3) Implémentation.** Modifier `lolett-app/app/api/webhooks/stripe/route.ts`.

  `VALID_SHIPPING_METHODS` (L16-21) — dériver de constants. L'import type L17 inclut déjà `ShippingMethod, ShippingCountryCode, PickupPoint` :

```ts
import { SHIPPING_COUNTRIES, VALID_SHIPPING_METHODS } from '@/lib/constants';
import type { ShippingMethod, ShippingCountryCode, PickupPoint } from '@/types';

const VALID_COUNTRY_CODES = SHIPPING_COUNTRIES.map((c) => c.code) as ShippingCountryCode[];
```

  Supprimer la ligne `const VALID_SHIPPING_METHODS: ShippingMethod[] = ['home', 'mondial_relay'];` (L21) — on importe désormais la constante.

  Mettre à jour le carrier dérivé (L239) pour gérer C&C :

```ts
      const shippingCarrier = shippingMethod === 'mondial_relay'
        ? 'mondial_relay'
        : shippingMethod === 'click_collect'
          ? 'click_collect'
          : 'colissimo';
```

  Insérer le guard C&C **après** le check d'idempotence `existingOrder` (après L264, juste avant `// 1. Create order` à L269). À ce point, `items`, `customer`, `finalTotal`, `shipping`, `promoCode`, `promoDiscount`, `giftCardCode`, `giftCardAmount`, `shippingMethod`, `shippingCarrier`, `shippingCountry`, `pickupPoint`, `userId` et `admin` sont en scope (vérifié L223-251). Le guard crée d'abord l'order (pour avoir une trace), puis le bascule en `payment_review` et return si invalide. **Lookup BD en `.maybeSingle()` (D3)** :

```ts
      // --- Garde Click & Collect : valider le point AVANT de marquer paid ---
      // Si le point n'est plus valide (désactivé entre paiement et webhook, ou
      // provider falsifié), on crée l'order mais on le met en payment_review et
      // on N'ENVOIE PAS l'email de confirmation (Lola traite manuellement).
      // On lit metadata.pickup_point_id (clé plate snake = lookup), JAMAIS le
      // snapshot JSON metadata.pickupPoint (camelCase, affichage seulement).
      if (shippingMethod === 'click_collect') {
        const pickupPointId = metadata.pickup_point_id || '';
        const pickupProvider = metadata.pickup_provider || '';
        let pointValid = false;
        if (pickupPointId && pickupProvider === 'click_collect') {
          // D3 : .maybeSingle() (convention partagée avec assignPickupCodeAtomic
          // et les mocks PR6) — 0 ligne renvoie { data: null } sans erreur PGRST116.
          const { data: dbPoint } = await admin
            .from('pickup_points')
            .select('id, is_active')
            .eq('id', pickupPointId)
            .maybeSingle();
          pointValid = dbPoint?.is_active === true;
        }

        if (!pointValid) {
          const orderRepoReview = new SupabaseOrderRepository();
          const reviewOrder = await orderRepoReview.create({
            items,
            customer,
            total: finalTotal,
            shipping,
            promoCode,
            promoDiscount,
            giftCardCode,
            giftCardAmount,
            shippingMethod,
            shippingCarrier,
            shippingCountry,
            pickupPoint,
            userId,
            paymentProvider: 'stripe',
          });
          await admin
            .from('orders')
            .update({
              status: 'payment_review',
              payment_id: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', reviewOrder.id);
          Sentry.captureMessage('C&C order without valid pickup_point at webhook', {
            tags: { feature: 'click_and_collect', step: 'webhook' },
            extra: {
              orderId: reviewOrder.id,
              pickupPointId,
              pickupProvider,
              sessionId: session.id,
            },
          });
          await markEventProcessed(event);
          return NextResponse.json({ received: true, warning: 'click_collect_invalid_pickup' });
        }
      }
```

  Le reste de la branche (`// 1. Create order` … `sendOrderConfirmation` …) reste inchangé pour le cas valide. `pickupPoint` est déjà parsé depuis `metadata.pickupPoint` (L240-247) ; comme `PickupPoint` est l'union (PR2), `pickupPoint` typé `PickupPoint | null` est compatible avec `orderRepo.create`.

- [ ] **(4) Relancer le test → succès** : `npm run test -- webhook-stripe-click-collect` → `2 passed`.
- [ ] **(5) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(6) Commit** :
  `git add lolett-app/app/api/webhooks/stripe/route.ts lolett-app/__tests__/api/webhook-stripe-click-collect.test.ts`
  `git commit -m "feat(webhook): bascule payment_review si point Click & Collect invalide (maybeSingle, D3)"`

---

## Task 9 : Facture PDF — bloc Click & Collect + ligne frais

**Files:**
- Modify: `lolett-app/lib/invoice/template.tsx` (discriminant L53-54, bloc Livraison L87-106, ligne frais L143-146)
- Test: `lolett-app/__tests__/invoice/invoice-click-collect.test.tsx`

Logique (spec §10.4) : ajouter `isClickCollect = order.shippingMethod === 'click_collect'`, un bloc "Point de retrait Click & Collect" (nom/adresse/postal/city + horaires optionnels), et une ligne frais "Retrait en boutique (Click & Collect)" / "Offert".

> **⚠ Risque test à lever AVANT de figer l'approche TDD (corrigé B8).** Aucun test `@react-pdf/renderer` n'existe dans le repo aujourd'hui (vérifié : les tests `@testing-library/react` ne couvrent que des composants HTML standard). `@react-pdf/renderer` v3+ rend des primitives custom (`Document`/`Page`/`Text`) qui ne montent pas de DOM HTML interrogeable par `screen.getByText` sous jsdom de façon fiable. L'étape (0) ci-dessous valide la faisabilité ; en cas d'échec, on bascule sur `react-test-renderer` (inspection de l'arbre React, pas du DOM).

### Étapes

- [ ] **(0) Spike de faisabilité (bloquant — corrigé B8).** Écrire un micro-test jetable qui `render(<InvoiceTemplate .../>)` (testing-library) puis `screen.getByText('Boutique du Marais')` sur l'order C&C ci-dessous, et le lancer. 
  - **Si le texte est trouvé** → `@testing-library/react` monte bien les primitives `@react-pdf/renderer` dans cet environnement : conserver l'approche `render`/`screen` du test (1) tel quel.
  - **Si `render` lève ou ne trouve rien** → remplacer dans le test (1) `import { render, screen } from '@testing-library/react'` par `react-test-renderer` et interroger l'arbre. Helper d'extraction de texte à utiliser dans ce cas :

```tsx
import TestRenderer from 'react-test-renderer';

function renderTexts(node: React.ReactElement): string[] {
  const tree = TestRenderer.create(node).toJSON();
  const texts: string[] = [];
  const walk = (n: unknown): void => {
    if (typeof n === 'string') { texts.push(n); return; }
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n && typeof n === 'object' && 'children' in n) {
      const kids = (n as { children?: unknown }).children;
      if (Array.isArray(kids)) kids.forEach(walk);
      else if (kids != null) walk(kids);
    }
  };
  if (Array.isArray(tree)) tree.forEach(walk); else if (tree) walk(tree);
  return texts;
}
```

  Puis remplacer chaque `expect(screen.getByText(X)).toBeInTheDocument()` par `expect(renderTexts(node).some((t) => t.includes(X))).toBe(true)`. Supprimer le micro-test jetable après décision.

- [ ] **(1) Écrire le test qui échoue.** Crée `lolett-app/__tests__/invoice/invoice-click-collect.test.tsx`. Version `@testing-library/react` (à adapter selon l'issue de l'étape (0)) :

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InvoiceTemplate } from '@/lib/invoice/template';
import type { Order } from '@/types';

const BASE_ORDER: Order = {
  id: 'o1',
  orderNumber: 'LOL-CC-1',
  items: [{ productId: 'p1', productName: 'Robe Lola', size: 'M', quantity: 1, price: 49.9 }],
  customer: {
    firstName: 'Marie', lastName: 'Durand', email: 'marie@ex.fr', phone: '+33612345678',
    address: '1 rue de Paris', city: 'Paris', postalCode: '75001', country: 'France',
  },
  total: 49.9,
  shipping: 0,
  status: 'paid',
  shippingMethod: 'click_collect',
  shippingCarrier: 'click_collect',
  shippingCountry: 'FR',
  pickupPoint: {
    provider: 'click_collect',
    id: 'pt-1',
    name: 'Boutique du Marais',
    address: '12 rue des Archives',
    postalCode: '75004',
    city: 'Paris',
    country: 'FR',
    hours: 'Lun-Sam 10h-19h',
    instructions: null,
  },
  createdAt: '2026-05-29T10:00:00Z',
};

describe('InvoiceTemplate — Click & Collect', () => {
  it('affiche le bloc Point de retrait Click & Collect avec horaires', () => {
    render(<InvoiceTemplate invoiceNumber="LOL-2026-00001" invoiceDate="29/05/2026" order={BASE_ORDER} />);
    expect(screen.getByText('Point de retrait Click & Collect')).toBeInTheDocument();
    expect(screen.getByText('Boutique du Marais')).toBeInTheDocument();
    expect(screen.getByText('12 rue des Archives')).toBeInTheDocument();
    expect(screen.getByText(/Horaires : Lun-Sam 10h-19h/)).toBeInTheDocument();
  });

  it('affiche la ligne frais "Retrait en boutique" / "Offert"', () => {
    render(<InvoiceTemplate invoiceNumber="LOL-2026-00001" invoiceDate="29/05/2026" order={BASE_ORDER} />);
    expect(screen.getByText('Retrait en boutique (Click & Collect)')).toBeInTheDocument();
    expect(screen.getByText('Offert')).toBeInTheDocument();
  });

  it('conserve le bloc Facturé à (adresse client obligatoire)', () => {
    render(<InvoiceTemplate invoiceNumber="LOL-2026-00001" invoiceDate="29/05/2026" order={BASE_ORDER} />);
    expect(screen.getByText('1 rue de Paris')).toBeInTheDocument();
  });
});
```

- [ ] **(2) Lancer le test → échec attendu** : `npm run test -- invoice-click-collect`
  Sortie attendue : échec (la facture rend "Livraison à domicile" car `isMondialRelay` est faux pour C&C, et la ligne frais affiche "Offerte" pas "Offert"). Si l'étape (0) a basculé sur `react-test-renderer`, l'échec porte sur les mêmes contenus via `renderTexts`.

- [ ] **(3) Implémentation.** Modifier `lolett-app/lib/invoice/template.tsx`.

  Discriminants (remplacer L53-54) :

```tsx
  const isMondialRelay = order.shippingMethod === 'mondial_relay';
  const isClickCollect = order.shippingMethod === 'click_collect';
  const pickup = order.pickupPoint;
```

  Bloc Livraison (remplacer le `<View style={styles.col}>` "Livraison", L87-106). On narrow sur `provider` pour accéder à `hours` :

```tsx
          <View style={styles.col}>
            <Text style={styles.colTitle}>
              {isClickCollect
                ? 'Point de retrait Click & Collect'
                : isMondialRelay
                  ? 'Point Relais Mondial Relay'
                  : 'Livraison à domicile'}
            </Text>
            {(isClickCollect || isMondialRelay) && pickup ? (
              <>
                <Text style={styles.colLine}>{pickup.name}</Text>
                <Text style={styles.colLine}>{pickup.address}</Text>
                <Text style={styles.colLine}>{pickup.postalCode} {pickup.city}</Text>
                <Text style={styles.colLine}>{pickup.country}</Text>
                {isClickCollect && pickup.provider === 'click_collect' && pickup.hours ? (
                  <Text style={styles.colLine}>Horaires : {pickup.hours}</Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.colLine}>{customer.firstName} {customer.lastName}</Text>
                <Text style={styles.colLine}>{customer.address}</Text>
                <Text style={styles.colLine}>{customer.postalCode} {customer.city}</Text>
                <Text style={styles.colLine}>{customer.country}</Text>
              </>
            )}
          </View>
```

  Ligne frais (remplacer le `<View style={styles.totalRow}>` "Frais de livraison", L143-146) :

```tsx
          {isClickCollect ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Retrait en boutique (Click & Collect)</Text>
              <Text style={styles.totalValue}>Offert</Text>
            </View>
          ) : (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frais de livraison</Text>
              <Text style={styles.totalValue}>{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)} €`}</Text>
            </View>
          )}
```

  Note : le bloc "Facturé à" (adresse client, L78-86) reste inchangé — l'adresse de livraison est obligatoire au formulaire et garde la facture légalement complète (spec §10.4 in fine).

- [ ] **(4) Relancer le test → succès** : `npm run test -- invoice-click-collect` → `3 passed`.
- [ ] **(5) Type-check** : `npm run type-check` → 0 erreur.
- [ ] **(6) Commit** :
  `git add lolett-app/lib/invoice/template.tsx lolett-app/__tests__/invoice/invoice-click-collect.test.tsx`
  `git commit -m "feat(invoice): bloc Click & Collect + ligne frais Offert sur la facture PDF"`

---

## Vérification finale PR5

- [ ] **Type-check vert** : `npm run type-check` → 0 erreur (aucun `any` introduit ; narrowing systématique sur `provider`).
- [ ] **Lint + type-check** : `npm run validate` → succès.
- [ ] **Tests verts** : `npm run test` → toutes les suites passent, incluant les 6 nouvelles suites :
  - `__tests__/checkout/click-collect-picker.test.tsx`
  - `__tests__/checkout/shipping-method-select.test.tsx`
  - `__tests__/checkout/use-checkout-pickup.test.ts`
  - `__tests__/api/checkout-stripe-click-collect.test.ts`
  - `__tests__/api/webhook-stripe-click-collect.test.ts`
  - `__tests__/invoice/invoice-click-collect.test.tsx`
- [ ] **Build** : `npm run build` → succès (les dynamic imports `ssr:false` du picker compilent).
- [ ] **Dépendances mappers confirmées (B6)** : `SupabaseOrderRepository.findById` ET `getOrderById` renvoient `shippingMethod`, `pickupCode` et un `pickupPoint` mappé via `mapPickupPoint` (sinon les blocs C&C de Task 6 restent invisibles — c'est PR2, mais à vérifier avant de clôturer PR5).
- [ ] **Scénarios spec couverts** :
  - §6.1 : `ShippingMethodSelect` 3 options + gating FR + reset auto + a11y, **testé unitairement** (Task 2).
  - §6.2 : `ClickCollectPicker` fetch anon RLS (filtre `country='FR'`), sélection, reset pays, `aria-live` (Task 1).
  - §6.3 : mutex MR/C&C (Task 3) + cleanup complet MR anti callback orphelin + `provider` MR (Task 4).
  - §6.4 : `useCheckout` validation + payload (Task 5).
  - §6.5 : page succès + espace client, narrowing `provider`, code de retrait (ou message d'attente), timeline `ORDER_STEPS_PICKUP` (Task 6).
  - §10.1-10.2 : route Stripe — `VALID_SHIPPING_METHODS`, guard FR, vérif BD + reconstruction snapshot, omission `shipping_address_collection` (remplacement du bloc inconditionnel), metadata `pickup_point_id`/`pickup_provider` (clés plates snake, D5), pas de line_item livraison à 0€ (Task 7).
  - §10.3 : webhook — validation point actif + provider (`.maybeSingle()`, D3), bascule `payment_review`, Sentry `step:'webhook'`, skip email (Task 8).
  - §10.4 : facture — bloc C&C + horaires, ligne "Retrait en boutique" / "Offert", adresse client conservée (Task 9).
  - Scénarios d'acceptation directement vérifiés : A1 (confirmation C&C), A6 (BE force C&C → 400 + reset auto côté client), A10 (webhook sans point valide → payment_review + pas d'email).

---

## Lien avec les autres PRs

- **Dépend de PR1** (migrations) : table `pickup_points` + colonnes `orders.pickup_code`/`ready_for_pickup_at`/`picked_up_at` + CHECK 13 statuts (incl. `payment_review`) + CHECK `shipping_method`/`shipping_carrier` incluant `click_collect`. Sans elles, l'insert d'un order C&C, l'update `payment_review` et le `select` sur `pickup_points` échouent.
- **Dépend de PR2** (types + constants + mappers + store v3) : `ShippingMethod`/`ShippingCarrier`/`PickupPoint` (union discriminée), `ClickCollectPickupPoint`, `VALID_SHIPPING_METHODS`, `SHIPPING_METHODS.click_collect`, `computeShippingCost` (0 pour C&C FR), `ORDER_STATUS_LABELS`, `ORDER_STEPS_HOME`/`ORDER_STEPS_PICKUP`, `Order.pickupCode`/`shippingMethod`, `mapPickupPoint` (backfill `provider`) **branché dans `findById` ET `getOrderById`**, `setShippingMethod` reset systématique. PR5 **consomme** ces symboles ; si une suite PR5 échoue à l'import (ou si les blocs C&C restent invisibles), c'est que PR2 n'est pas mergée / incomplète (mappers non branchés — cf. vérifs B6 des Tasks 6a/6b).
- **Dépend de PR3** (email "Prête au retrait" + helper `sendOrderReadyForPickupEmail`) : la page succès C&C affiche le code, mais le code est **généré** côté admin (PR4) via `assignPickupCodeAtomic` ; PR5 se contente de le lire (`order.pickupCode`) et, en son absence, affiche un message d'attente (B13). Rappel D1 : `sendOrderReadyForPickupEmail` accepte `pickupPoint: PickupPoint | null` avec garde interne (provider/name/code) — PR5 n'appelle pas ce sender (c'est PR4).
- **Dépend de PR4 (CO-DÉPLOIEMENT OBLIGATOIRE, §11)** : PR4 fournit l'admin `/admin/pickup-points` qui rend des points `is_active=true`, ET implémente les transitions C&C du PATCH `/api/admin/orders/[id]` (statuts `ready_for_pickup`/`picked_up`, génération du code, timestamps, email — décision D4 ; scénarios A3/A4) ET le recâblage de `REFUNDABLE_STATUSES` dans la route refund + `RefundDialog` (décision D2 ; scénario A9). PR5 ne touche à aucun de ces fichiers. Déployer PR5 sans PR4 laisserait Lola incapable de créer/activer un point et de générer un code ; déployer PR4 sans PR5 rendrait des points actifs visibles via l'API publique mais sans UI client. La mitigation `pickup_points.is_active DEFAULT FALSE` (PR1) couvre la fenêtre de déploiement.
- **Suivi par PR6** (E2E + edge cases) : reprend en Playwright le parcours C&C complet, la bascule MR→C&C (résidu store), la bascule FR→BE (reset auto), et les attaques DevTools déjà testées en intégration ici. PR6 dépend de PR4 ET PR5, partage la convention `.maybeSingle()` (D3) dans ses mocks pickup_points, et attribue A3/A4 à PR4.
