# Click & Collect — PR4 : UI admin & workflow transitions — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Donner à Lola l'interface admin pour gérer ses points de retrait Click & Collect (CRUD soft-delete + réordonnancement) et brancher le workflow serveur des transitions `ready_for_pickup` / `picked_up` (génération atomique du code de retrait + email transactionnel), tout en refactorant les composants admin de statut sur les constantes centralisées de PR2 et en recâblant `REFUNDABLE_STATUSES` (décision D2) pour autoriser le remboursement d'une commande C&C non retirée.

**Architecture:** 6 routes API REST sous `app/api/admin/pickup-points/` (5 routes CRUD/reorder/détail + 1 route `[id]/usage` qui expose la RPC `count_orders_with_pickup_point` — auth cookie admin + `createAdminClient` service-role + Zod), une page admin `/admin/pickup-points` (RSC liste + table client `PickupPointsTable` + modale client `PickupPointFormModal`), l'extension du `PATCH /api/admin/orders/[id]` avec la logique §8.2 (guard C&C, `assignPickupCodeAtomic`, email `after()`, skip net de l'email shipped — décision D4 : c'est PR4 qui porte cette branche, PAS PR5), le recâblage de `REFUNDABLE_STATUSES` dans `refund/route.ts` + `RefundDialog.tsx` (décision D2, scénario A9), et le refactor des composants `OrderStatusBadge` / `OrderStatusUpdate` / `OrderFilters` / `DashboardCharts` + dashboard pour consommer `ORDER_STATUS_LABELS` / `ORDER_STATUS_COLORS` / `ORDER_STATUS_TRANSITIONS` (PR2). Co-déploiement obligatoire avec PR5 (cf. spec §11) : `pickup_points.is_active DEFAULT FALSE` protège tant que Lola n'active pas.

**Tech Stack:** Next.js App Router (route handlers + RSC + `next/server` `after`), TypeScript strict (aucun `any`), Zod, Supabase service-role (`createAdminClient`), Tailwind (composants shadcn `Card`/`Dialog`/`Select`/`Input`/`Button`/`Label`), lucide-react (icône `Store`, `Eye`, `EyeOff`, `Pencil`, `ArrowUp`, `ArrowDown`, `Plus`), Sentry (`@sentry/nextjs`), vitest (tests d'intégration des routes avec mocks `vi.hoisted`).

---

## Notes de cadrage (corrections vs spec)

Ces écarts spec↔réalité (déjà actés en PR1/PR2/PR3) s'appliquent à PR4 — la réalité du codebase fait foi :

1. **13 statuts** (PR1) : le CHECK DB et `ORDER_STATUS_VALUES` (PR2) incluent `ready_for_pickup` + `picked_up`. La table locale `ORDER_STATUSES` de `app/api/admin/orders/[id]/route.ts` (L16-19, 8 statuts) et `STATUSES`/`VALID_TRANSITIONS` de `OrderStatusUpdate.tsx` (L25-51) sont **obsolètes** → on les remplace par les constantes centralisées `ORDER_STATUS_VALUES` / `ORDER_STATUS_TRANSITIONS` / `STRIPE_MANAGED_STATUSES` de `@/lib/constants` (PR2).

2. **Labels au féminin** : `ORDER_STATUS_LABELS` (PR2) harmonise tout au féminin (`'Payée'`, `'Expédiée'`, `'Prête au retrait'`, `'Retirée'`). Les composants actuels portent du masculin hardcodé (`'Payé'`/`'Expédié'` dans `OrderStatusBadge` L4-16 et `OrderFilters` L43-51) → on bascule sur la constante.

3. **`ORDER_STATUS_COLORS`** (PR2) fournit `{ hex, tw, twFull }` par statut : `hex` pour Recharts (`DashboardCharts`), `twFull` pour les badges Tailwind (`OrderStatusBadge`). On remplace les maps locales `STATUS_CLASSES` / `STATUS_COLORS` / `STATUS_LABELS` dupliquées.

4. **`shipping_method` peut valoir `'click_collect'`** : le type `ShippingMethod` (PR2, dérivé de `SHIPPING_METHOD_VALUES`) inclut `click_collect`. Le snapshot `pickup_point` est une **union discriminée par `provider`** (`'mondial_relay' | 'click_collect'`) backfillée par `mapPickupPoint` (PR2). Le narrowing se fait sur `provider`.

5. **Helpers PR3 réutilisés** (déjà créés par PR3, **ne pas redéfinir**) :
   - `assignPickupCodeAtomic(supabase, orderId, extraPayload)` → `Promise<{ code: string; updated: unknown } | null>` dans `@/lib/orders/pickup-code` (UPDATE atomique `.is('pickup_code', null)` + retry sur `error.code === '23505'`, `MAX_ATTEMPTS = 8`).
   - `sendOrderReadyForPickupEmail(data)` → `Promise<void>` dans `@/lib/email/order-ready-for-pickup` (moteur `interpolate()` `{{var}}`, guards données partielles + Sentry). **Décision D1** : la signature accepte `pickupPoint: PickupPoint | null` (PAS `ClickCollectPickupPoint` non-nullable). Le guard interne du sender (`if (!data.pickupCode || !data.pickupPoint || data.pickupPoint.provider !== 'click_collect' || !data.pickupPoint.name) → Sentry.captureMessage + return`) prend en charge le narrowing. Côté appelant (PATCH, Task 4), on passe donc `pickupPoint: updatedOrder.pickup_point` **sans cast ni narrowing** : `updatedOrder.pickup_point` est typé `PickupPoint | null`, ce qui est exactement le type attendu — pas d'erreur de type-check.

6. **`ORDER_STATUS_TRANSITIONS`** (PR2) est la source de vérité des transitions (incluant `confirmed → ['shipped','ready_for_pickup','cancelled','refunded']` et `ready_for_pickup → ['picked_up','cancelled','refunded']`). Le PATCH admin et `OrderStatusUpdate` valident **via cette constante moins `STRIPE_MANAGED_STATUSES`**, pas via une table locale.

7. **Reorder = swap `{ fromId, toId }`** (pattern choisi spec §19, pas de modèle existant côté pickup-points — `materials/route.ts` n'a pas de reorder). On échange les deux `sort_order` en deux UPDATE successifs (pas de transaction Postgres possible via PostgREST, donc deux requêtes idempotentes).

8. **POST init `sort_order = MAX(sort_order) + 10`** (pas `?? 0` comme `materials`). On lit le max courant puis on insère.

9. **Pas de DELETE** sur les points de retrait : soft-delete pur via `is_active` (spec §7.2 / §19). Avant de masquer, l'UI appelle `count_orders_with_pickup_point` (RPC PR1) via la route `[id]/usage`.

10. **`getTrackingUrl` retourne `string | null`** (PR2, `null` pour `click_collect`). Le label tracking est `null` pour C&C dans `OrderStatusUpdate`.

11. **Doc Lola** : sous `lolett-app/docs/` (cohérent avec l'existant : `docs/operations/`, `docs/plans/`). Chemin retenu : `lolett-app/docs/click-collect-guide-lola.md` (spec §17).

12. **Décision D2 — `REFUNDABLE_STATUSES` recâblé par PR4** : aujourd'hui la liste est **dupliquée et hardcodée** à deux endroits, sans `ready_for_pickup` :
    - `app/api/admin/orders/[id]/refund/route.ts` L36 : `const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'] as const;` (et L90 fait `order.status as typeof REFUNDABLE_STATUSES[number]`).
    - `components/admin/RefundDialog.tsx` L52 : `const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'];` (et L60 fait `REFUNDABLE_STATUSES.includes(status)`).

    PR4 (et **seule** PR4, pas PR5) remplace ces deux listes par l'import de `REFUNDABLE_STATUSES` depuis `@/lib/constants` (PR2 fournit la constante incluant `ready_for_pickup`). Sans ce recâblage, le scénario A9 (« cliente C&C non venue → on rembourse depuis `ready_for_pickup` ») est cassé (API 400 + bouton grisé). Implémenté en **Task 4bis**.

13. **Décision D4 — la branche transitions C&C du PATCH est dans PR4** : l'extension du `PATCH /api/admin/orders/[id]` (statuts `ready_for_pickup`/`picked_up`, génération du code, timestamps `ready_for_pickup_at`/`picked_up_at`, email `order_ready_for_pickup`) est implémentée par PR4 (Task 4), PAS PR5. PR6 (E2E) attribue A3/A4 à PR4.

14. **Décision D5 — clés métadata Stripe** (rappel pour cohérence inter-PR, pas de code dans PR4) : `metadata.pickup_point_id` + `metadata.pickup_provider` sont des clés **plates snake_case** posées par le checkout (PR5), distinctes du snapshot JSON `pickup_point` en **camelCase** (`postalCode`, etc.). Aucune lecture de `metadata.pickupPoint.postal_code` nulle part. PR4 lit uniquement le snapshot `pickup_point` (camelCase) sur la ligne `orders`.

15. **TOUS les `=== 'click_collect'` et les accès `SHIPPING_METHODS[...]` de ce plan supposent l'élargissement de `ShippingMethod` (PR2) à inclure `'click_collect'` ET l'ajout de `SHIPPING_METHODS.click_collect` (PR2).** Tant que PR2 n'est pas mergée d'abord, ces comparaisons sont des erreurs TS « comparaison sans recouvrement » et `SHIPPING_METHODS[order.shipping_method]` accède à une clé inexistante. État actuel vérifié : `types/index.ts` L83 `export type ShippingMethod = 'home' | 'mondial_relay';` et `lib/constants.ts` L43 `SHIPPING_METHODS` sans `click_collect`. C'est une dépendance dure de PR4 → PR2.

---

### Task 1: Routes API `/api/admin/pickup-points` — GET liste + POST création

**Files:**
- Create: `lolett-app/app/api/admin/pickup-points/route.ts`
- Test: `lolett-app/__tests__/api/admin-pickup-points.test.ts`

- [ ] **Step 1 — Écrire le test qui échoue (GET liste + POST init sort_order MAX+10).** Créer `lolett-app/__tests__/api/admin-pickup-points.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock, rpcMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({
  checkAdminCookieFromRequest: checkAdminMock,
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: fromMock, rpc: rpcMock }),
}));

// Import AFTER mocks
import { GET, POST } from '@/app/api/admin/pickup-points/route';

function jsonReq(body: unknown, cookie = 'admin=ok'): Request {
  return new Request('http://x/api/admin/pickup-points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
}

describe('GET /api/admin/pickup-points', () => {
  beforeEach(() => {
    checkAdminMock.mockReset();
    fromMock.mockReset();
  });

  it('401 quand non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await GET(new Request('http://x/api/admin/pickup-points'));
    expect(res.status).toBe(401);
  });

  it('renvoie { pickupPoints } incluant les inactifs', async () => {
    checkAdminMock.mockResolvedValue(true);
    const rows = [
      { id: 'p1', name: 'A', is_active: true, sort_order: 0 },
      { id: 'p2', name: 'B', is_active: false, sort_order: 10 },
    ];
    fromMock.mockReturnValue({
      select: () => ({ order: () => Promise.resolve({ data: rows, error: null }) }),
    });
    const res = await GET(new Request('http://x/api/admin/pickup-points'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoints).toHaveLength(2);
    expect(json.pickupPoints[1].is_active).toBe(false);
  });
});

describe('POST /api/admin/pickup-points', () => {
  beforeEach(() => {
    checkAdminMock.mockReset();
    fromMock.mockReset();
  });

  it('401 quand non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await POST(jsonReq({ name: 'X', address: 'a', postalCode: '75001', city: 'Paris' }));
    expect(res.status).toBe(401);
  });

  it('400 sur payload invalide (name manquant)', async () => {
    checkAdminMock.mockResolvedValue(true);
    const res = await POST(jsonReq({ address: 'a', postalCode: '75001', city: 'Paris' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
    expect(json.details).toBeDefined();
  });

  it('initialise sort_order = MAX + 10 et renvoie { pickupPoint }', async () => {
    checkAdminMock.mockResolvedValue(true);
    // 1er from() : lecture du max sort_order
    // 2e from() : insert
    let insertedPayload: Record<string, unknown> | null = null;
    fromMock
      .mockReturnValueOnce({
        select: () => ({
          order: () => ({
            limit: () =>
              Promise.resolve({ data: [{ sort_order: 30 }], error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: (payload: Record<string, unknown>) => {
          insertedPayload = payload;
          return {
            select: () => ({
              single: () =>
                Promise.resolve({ data: { id: 'new', ...payload }, error: null }),
            }),
          };
        },
      });

    const res = await POST(
      jsonReq({ name: 'Boutique', address: '1 rue', postalCode: '75001', city: 'Paris' }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoint.id).toBe('new');
    expect(insertedPayload!.sort_order).toBe(40);
  });

  it('initialise sort_order = 10 quand la table est vide', async () => {
    checkAdminMock.mockResolvedValue(true);
    let insertedPayload: Record<string, unknown> | null = null;
    fromMock
      .mockReturnValueOnce({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: (payload: Record<string, unknown>) => {
          insertedPayload = payload;
          return {
            select: () => ({ single: () => Promise.resolve({ data: { id: 'n', ...payload }, error: null }) }),
          };
        },
      });
    const res = await POST(jsonReq({ name: 'X', address: 'a', postalCode: '75001', city: 'P' }));
    expect(res.status).toBe(200);
    expect(insertedPayload!.sort_order).toBe(10);
  });
});
```

- [ ] **Step 2 — Lancer le test → échec attendu.**

```
npm run test -- admin-pickup-points
```

Sortie attendue : `Failed to resolve import "@/app/api/admin/pickup-points/route"` (le fichier route n'existe pas encore).

- [ ] **Step 3 — Implémenter la route GET + POST.** Créer `lolett-app/app/api/admin/pickup-points/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PickupPointCreateSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(300),
  postalCode: z.string().min(1).max(20),
  city: z.string().min(1).max(120),
  country: z.string().min(2).max(2).default('FR'),
  hours: z.string().max(500).nullable().optional(),
  instructions: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .select('*')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pickupPoints: data ?? [] });
}

export async function POST(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = PickupPointCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;
  const supabase = createAdminClient();

  // sort_order = MAX + 10 (init par pas de 10, cf. spec §4.1 / §7.3)
  const { data: maxRows, error: maxError } = await supabase
    .from('pickup_points')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (maxError) return NextResponse.json({ error: maxError.message }, { status: 500 });
  const currentMax = maxRows?.[0]?.sort_order ?? 0;
  const sortOrder = currentMax + 10;

  const { data, error } = await supabase
    .from('pickup_points')
    .insert({
      name: body.name,
      address: body.address,
      postal_code: body.postalCode,
      city: body.city,
      country: body.country,
      hours: body.hours ?? null,
      instructions: body.instructions ?? null,
      is_active: body.isActive ?? false,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pickupPoint: data });
}
```

- [ ] **Step 4 — Relancer → succès.**

```
npm run test -- admin-pickup-points
```

Sortie attendue : les 6 tests des blocs `GET` et `POST` passent (`6 passed`).

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 6 — Commit.**

```
git add lolett-app/app/api/admin/pickup-points/route.ts lolett-app/__tests__/api/admin-pickup-points.test.ts
git commit -m "feat(admin): routes GET/POST /api/admin/pickup-points"
```

---

### Task 2: Routes API `/api/admin/pickup-points/[id]` — GET détail + PATCH

**Files:**
- Create: `lolett-app/app/api/admin/pickup-points/[id]/route.ts`
- Test: `lolett-app/__tests__/api/admin-pickup-points-id.test.ts`

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/admin-pickup-points-id.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));

import { GET, PATCH } from '@/app/api/admin/pickup-points/[id]/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/admin/pickup-points/[id]', () => {
  beforeEach(() => { checkAdminMock.mockReset(); fromMock.mockReset(); });

  it('401 si non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(401);
  });

  it('renvoie { pickupPoint }', async () => {
    checkAdminMock.mockResolvedValue(true);
    fromMock.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: 'p1', name: 'A' }, error: null }) }) }),
    });
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoint.id).toBe('p1');
  });

  it('404 quand introuvable', async () => {
    checkAdminMock.mockResolvedValue(true);
    fromMock.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'not found' } }) }) }),
    });
    const res = await GET(new Request('http://x'), params('nope'));
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/admin/pickup-points/[id]', () => {
  beforeEach(() => { checkAdminMock.mockReset(); fromMock.mockReset(); });

  it('400 sur isActive non booléen', async () => {
    checkAdminMock.mockResolvedValue(true);
    const req = new Request('http://x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: 'yes' }),
    });
    const res = await PATCH(req, params('p1'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details).toBeDefined();
  });

  it('mappe isActive → is_active et renvoie { pickupPoint }', async () => {
    checkAdminMock.mockResolvedValue(true);
    let updatePayload: Record<string, unknown> | null = null;
    fromMock.mockReturnValue({
      update: (payload: Record<string, unknown>) => {
        updatePayload = payload;
        return { eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'p1', is_active: false }, error: null }) }) }) };
      },
    });
    const req = new Request('http://x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false, hours: '9h-18h' }),
    });
    const res = await PATCH(req, params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoint.is_active).toBe(false);
    expect(updatePayload!.is_active).toBe(false);
    expect(updatePayload!.hours).toBe('9h-18h');
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.**

```
npm run test -- admin-pickup-points-id
```

Sortie attendue : `Failed to resolve import "@/app/api/admin/pickup-points/[id]/route"`.

- [ ] **Step 3 — Implémenter.** Créer `lolett-app/app/api/admin/pickup-points/[id]/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PickupPointPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(300).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  city: z.string().min(1).max(120).optional(),
  country: z.string().min(2).max(2).optional(),
  hours: z.string().max(500).nullable().optional(),
  instructions: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Point de retrait introuvable' }, { status: 404 });
  }
  return NextResponse.json({ pickupPoint: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const raw = await request.json().catch(() => null);
  const parsed = PickupPointPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updatePayload.name = body.name;
  if (body.address !== undefined) updatePayload.address = body.address;
  if (body.postalCode !== undefined) updatePayload.postal_code = body.postalCode;
  if (body.city !== undefined) updatePayload.city = body.city;
  if (body.country !== undefined) updatePayload.country = body.country;
  if (body.hours !== undefined) updatePayload.hours = body.hours;
  if (body.instructions !== undefined) updatePayload.instructions = body.instructions;
  if (body.isActive !== undefined) updatePayload.is_active = body.isActive;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('pickup_points')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pickupPoint: data });
}
```

- [ ] **Step 4 — Relancer → succès.**

```
npm run test -- admin-pickup-points-id
```

Sortie attendue : `5 passed`.

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 6 — Commit.**

```
git add lolett-app/app/api/admin/pickup-points/[id]/route.ts lolett-app/__tests__/api/admin-pickup-points-id.test.ts
git commit -m "feat(admin): routes GET/PATCH /api/admin/pickup-points/[id]"
```

---

### Task 3: Route API `/api/admin/pickup-points/reorder` — swap sort_order

**Files:**
- Create: `lolett-app/app/api/admin/pickup-points/reorder/route.ts`
- Test: `lolett-app/__tests__/api/admin-pickup-points-reorder.test.ts`

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/admin-pickup-points-reorder.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));

import { POST } from '@/app/api/admin/pickup-points/reorder/route';

function reorderReq(body: unknown): Request {
  return new Request('http://x/api/admin/pickup-points/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/pickup-points/reorder', () => {
  beforeEach(() => { checkAdminMock.mockReset(); fromMock.mockReset(); });

  it('401 si non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await POST(reorderReq({ fromId: 'a', toId: 'b' }));
    expect(res.status).toBe(401);
  });

  it('400 si fromId ou toId manquant', async () => {
    checkAdminMock.mockResolvedValue(true);
    const res = await POST(reorderReq({ fromId: 'a' }));
    expect(res.status).toBe(400);
  });

  it('400 si fromId === toId', async () => {
    checkAdminMock.mockResolvedValue(true);
    const res = await POST(reorderReq({ fromId: 'a', toId: 'a' }));
    expect(res.status).toBe(400);
  });

  it('échange les sort_order des deux points et renvoie { pickupPoints }', async () => {
    checkAdminMock.mockResolvedValue(true);
    const updates: Array<{ id: string; sort_order: number }> = [];

    // from() est appelé : (1) select des 2 lignes, (2) update A, (3) update B, (4) select final liste
    fromMock
      // (1) lecture des deux sort_order
      .mockReturnValueOnce({
        select: () => ({
          in: () =>
            Promise.resolve({
              data: [
                { id: 'a', sort_order: 10 },
                { id: 'b', sort_order: 20 },
              ],
              error: null,
            }),
        }),
      })
      // (2) update A → sort_order de B
      .mockReturnValueOnce({
        update: (payload: { sort_order: number }) => ({
          eq: (_col: string, id: string) => {
            updates.push({ id, sort_order: payload.sort_order });
            return Promise.resolve({ error: null });
          },
        }),
      })
      // (3) update B → sort_order de A
      .mockReturnValueOnce({
        update: (payload: { sort_order: number }) => ({
          eq: (_col: string, id: string) => {
            updates.push({ id, sort_order: payload.sort_order });
            return Promise.resolve({ error: null });
          },
        }),
      })
      // (4) liste finale
      .mockReturnValueOnce({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: [
                { id: 'b', sort_order: 10 },
                { id: 'a', sort_order: 20 },
              ],
              error: null,
            }),
        }),
      });

    const res = await POST(reorderReq({ fromId: 'a', toId: 'b' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.pickupPoints).toHaveLength(2);
    // a prend l'ordre de b (20), b prend l'ordre de a (10)
    expect(updates).toContainEqual({ id: 'a', sort_order: 20 });
    expect(updates).toContainEqual({ id: 'b', sort_order: 10 });
  });

  it('404 si un des deux ids est introuvable', async () => {
    checkAdminMock.mockResolvedValue(true);
    fromMock.mockReturnValueOnce({
      select: () => ({ in: () => Promise.resolve({ data: [{ id: 'a', sort_order: 10 }], error: null }) }),
    });
    const res = await POST(reorderReq({ fromId: 'a', toId: 'ghost' }));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.**

```
npm run test -- admin-pickup-points-reorder
```

Sortie attendue : `Failed to resolve import "@/app/api/admin/pickup-points/reorder/route"`.

- [ ] **Step 3 — Implémenter.** Créer `lolett-app/app/api/admin/pickup-points/reorder/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const ReorderSchema = z.object({
  fromId: z.string().min(1),
  toId: z.string().min(1),
});

export async function POST(request: Request) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { fromId, toId } = parsed.data;
  if (fromId === toId) {
    return NextResponse.json({ error: 'fromId et toId identiques' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Lecture des deux sort_order courants
  const { data: rows, error: readError } = await supabase
    .from('pickup_points')
    .select('id, sort_order')
    .in('id', [fromId, toId]);
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });

  const fromRow = rows?.find((r) => r.id === fromId);
  const toRow = rows?.find((r) => r.id === toId);
  if (!fromRow || !toRow) {
    return NextResponse.json({ error: 'Point de retrait introuvable' }, { status: 404 });
  }

  // Swap : fromId prend l'ordre de toId et inversement (deux UPDATE séparés —
  // PostgREST n'autorise pas de transaction multi-row, mais chaque écriture est
  // idempotente et l'ordre final reste cohérent même si rejoué).
  const { error: errA } = await supabase
    .from('pickup_points')
    .update({ sort_order: toRow.sort_order, updated_at: new Date().toISOString() })
    .eq('id', fromId);
  if (errA) return NextResponse.json({ error: errA.message }, { status: 500 });

  const { error: errB } = await supabase
    .from('pickup_points')
    .update({ sort_order: fromRow.sort_order, updated_at: new Date().toISOString() })
    .eq('id', toId);
  if (errB) return NextResponse.json({ error: errB.message }, { status: 500 });

  const { data: pickupPoints, error: listError } = await supabase
    .from('pickup_points')
    .select('*')
    .order('sort_order');
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  return NextResponse.json({ pickupPoints: pickupPoints ?? [] });
}
```

- [ ] **Step 4 — Relancer → succès.**

```
npm run test -- admin-pickup-points-reorder
```

Sortie attendue : `5 passed` (401, 400 champ manquant, 400 `fromId === toId`, swap OK, 404).

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 6 — Commit.**

```
git add lolett-app/app/api/admin/pickup-points/reorder/route.ts lolett-app/__tests__/api/admin-pickup-points-reorder.test.ts
git commit -m "feat(admin): route POST /api/admin/pickup-points/reorder (swap sort_order)"
```

---

### Task 4: Extension `PATCH /api/admin/orders/[id]` — transitions C&C (§8.2 + §9.4)

**Files:**
- Modify: `lolett-app/app/api/admin/orders/[id]/route.ts` (L1-19 imports + bloc `ORDER_STATUSES` ; L21-28 schéma Zod ; insertion validation transition + branche `ready_for_pickup` après le guard Stripe L106-114 et avant `const now` L116 ; L126-136 timestamps `picked_up_at` ; L156-189 garde-fou shipped + casts `ShippingMethod`/`ShippingCarrier`)
- Test: `lolett-app/__tests__/api/admin-orders-patch-click-collect.test.ts`

> **Contexte réel vérifié** (route actuelle) : le PATCH lit `currentOrder` via `.select('*').eq('id', id).single()` (L92-96), pose un guard `STRIPE_MANAGED_STATUSES` runtime (L102-114), construit `updatePayload` (L116-136), fait l'UPDATE `.select().single()` (L138-143), puis envoie les emails dans un seul bloc `if (statusChanged && customer?.email) { ... }` (L150-224) où `customer` (L151) et `orderNumber` (L154) sont calculés AVANT les branches `shipped`/`delivered`/`cancelled`. Le type `OrderCustomer` est déjà défini L30-39. `supabase` (L78) et `id` (L77) sont en scope dans tout le PATCH. La branche C&C `ready_for_pickup` est un **chemin dédié** inséré AVANT `const now` qui sort tôt (`return`) → il ne passe pas par l'UPDATE générique ni le bloc emails générique.

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/api/admin-orders-patch-click-collect.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  checkAdminMock, fromMock, afterMock,
  assignPickupCodeAtomicMock, sendReadyMock, sendShippedMock, captureMessageMock,
} = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
  afterMock: vi.fn((cb: () => unknown) => { void cb(); }),
  assignPickupCodeAtomicMock: vi.fn(),
  sendReadyMock: vi.fn().mockResolvedValue(undefined),
  sendShippedMock: vi.fn().mockResolvedValue({ success: true }),
  captureMessageMock: vi.fn(),
}));

vi.mock('next/server', async (orig) => {
  const actual = await orig<typeof import('next/server')>();
  return { ...actual, after: afterMock };
});
vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
vi.mock('@/lib/orders/pickup-code', () => ({ assignPickupCodeAtomic: assignPickupCodeAtomicMock }));
vi.mock('@/lib/email/order-ready-for-pickup', () => ({ sendOrderReadyForPickupEmail: sendReadyMock }));
vi.mock('@/lib/email/order-shipped', () => ({ sendOrderShipped: sendShippedMock }));
vi.mock('@/lib/email/order-delivered', () => ({ sendOrderDelivered: vi.fn().mockResolvedValue({ success: true }) }));
vi.mock('@/lib/email/order-cancelled', () => ({ sendOrderCancelled: vi.fn().mockResolvedValue({ success: true }) }));
vi.mock('@sentry/nextjs', () => ({ captureMessage: captureMessageMock, captureException: vi.fn() }));

import { PATCH } from '@/app/api/admin/orders/[id]/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });
function patchReq(body: unknown): Request {
  return new Request('http://x/api/admin/orders/o1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie: 'admin=ok' },
    body: JSON.stringify(body),
  });
}

const CUSTOMER = { firstName: 'Marie', lastName: 'D', email: 'marie@ex.fr', phone: '06', address: 'a', city: 'Paris', postalCode: '75001' };

/** Mock fromMock pour un fetch initial de currentOrder donné. */
function mockCurrentOrder(order: Record<string, unknown>) {
  fromMock.mockReturnValue({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: order, error: null }) }) }),
  });
}

describe('PATCH /api/admin/orders/[id] — Click & Collect', () => {
  beforeEach(() => {
    checkAdminMock.mockReset().mockResolvedValue(true);
    fromMock.mockReset();
    assignPickupCodeAtomicMock.mockReset();
    sendReadyMock.mockClear();
    sendShippedMock.mockClear();
    captureMessageMock.mockClear();
  });

  it('rejette une transition non autorisée (400)', async () => {
    mockCurrentOrder({ id: 'o1', status: 'delivered', customer: CUSTOMER, shipping_method: 'home' });
    const res = await PATCH(patchReq({ status: 'paid' }), params('o1'));
    expect(res.status).toBe(400);
  });

  it('refuse ready_for_pickup sans point C&C valide (400)', async () => {
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'home', pickup_point: null,
    });
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(400);
    expect(assignPickupCodeAtomicMock).not.toHaveBeenCalled();
  });

  it('refuse ready_for_pickup si provider != click_collect (400)', async () => {
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'click_collect',
      pickup_point: { id: 'p1', name: 'B', provider: 'mondial_relay' },
    });
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(400);
  });

  it('ready_for_pickup valide : génère le code, pose timestamp, envoie l email', async () => {
    // NB : sur ce chemin, from() n'est appelé QU'UNE FOIS (fetch currentOrder).
    // Tout le reste passe par le mock assignPickupCodeAtomic (qui ne touche pas fromMock).
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'click_collect',
      pickup_point: { id: 'p1', name: 'Boutique du Marais', address: '3 rue', postalCode: '75004', city: 'Paris', provider: 'click_collect' },
    });
    assignPickupCodeAtomicMock.mockResolvedValue({
      code: 'LOL-A7K2X',
      updated: {
        id: 'o1', order_number: 'LOL-20260530-1', status: 'ready_for_pickup',
        customer: CUSTOMER,
        pickup_point: { id: 'p1', name: 'Boutique du Marais', provider: 'click_collect' },
      },
    });
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.order.status).toBe('ready_for_pickup');
    expect(assignPickupCodeAtomicMock).toHaveBeenCalledWith(
      expect.anything(),
      'o1',
      expect.objectContaining({ status: 'ready_for_pickup', ready_for_pickup_at: expect.any(String) }),
    );
    expect(sendReadyMock).toHaveBeenCalledTimes(1);
    expect(sendReadyMock.mock.calls[0][0].pickupCode).toBe('LOL-A7K2X');
  });

  it('ready_for_pickup : 500 + Sentry si la génération du code échoue', async () => {
    mockCurrentOrder({
      id: 'o1', status: 'confirmed', customer: CUSTOMER,
      shipping_method: 'click_collect',
      pickup_point: { id: 'p1', name: 'B', provider: 'click_collect' },
    });
    assignPickupCodeAtomicMock.mockResolvedValue(null);
    const res = await PATCH(patchReq({ status: 'ready_for_pickup' }), params('o1'));
    expect(res.status).toBe(500);
    expect(captureMessageMock).toHaveBeenCalled();
    expect(captureMessageMock.mock.calls[0][1].tags).toMatchObject({
      feature: 'click_and_collect', step: 'generate_code',
    });
    expect(sendReadyMock).not.toHaveBeenCalled();
  });

  it('picked_up : pose picked_up_at et n envoie aucun email', async () => {
    let updatePayload: Record<string, unknown> | null = null;
    fromMock
      // fetch currentOrder
      .mockReturnValueOnce({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({
          data: { id: 'o1', status: 'ready_for_pickup', customer: CUSTOMER, shipping_method: 'click_collect' },
          error: null,
        }) }) }),
      })
      // update
      .mockReturnValueOnce({
        update: (payload: Record<string, unknown>) => {
          updatePayload = payload;
          return { eq: () => ({ select: () => ({ single: () => Promise.resolve({
            data: { id: 'o1', status: 'picked_up', order_number: 'LOL-1', customer: CUSTOMER },
            error: null,
          }) }) }) };
        },
      });
    const res = await PATCH(patchReq({ status: 'picked_up' }), params('o1'));
    expect(res.status).toBe(200);
    expect(updatePayload!.picked_up_at).toEqual(expect.any(String));
    expect(sendReadyMock).not.toHaveBeenCalled();
    expect(sendShippedMock).not.toHaveBeenCalled();
  });
});
```

> Note sur le mock `after` : `afterMock` invoque `cb()` de façon synchrone. La lambda `after(async () => { try { await sendOrderReadyForPickupEmail({...}) } ... })` évalue ses arguments et appelle `sendOrderReadyForPickupEmail({...})` (donc `sendReadyMock`) AVANT le premier `await` qui suspend la coroutine. L'assertion synchrone `expect(sendReadyMock).toHaveBeenCalledTimes(1)` après `await PATCH(...)` voit donc bien l'appel.

- [ ] **Step 2 — Lancer → échec attendu.**

```
npm run test -- admin-orders-patch-click-collect
```

Sortie attendue : plusieurs échecs — la transition `confirmed → ready_for_pickup` est rejetée (la table locale `ORDER_STATUSES` ne contient pas `ready_for_pickup`, et il n'y a aucune logique de génération de code) ; `assignPickupCodeAtomicMock` jamais appelé.

- [ ] **Step 3 — Implémenter.** Remplacer dans `lolett-app/app/api/admin/orders/[id]/route.ts` :

(3a) Imports — remplacer les lignes 1-19 (imports + bloc commentaire + `ORDER_STATUSES`) par :

```ts
import { NextResponse, after } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOrderShipped } from '@/lib/email/order-shipped';
import { sendOrderDelivered } from '@/lib/email/order-delivered';
import { sendOrderCancelled } from '@/lib/email/order-cancelled';
import { sendOrderReadyForPickupEmail } from '@/lib/email/order-ready-for-pickup';
import { assignPickupCodeAtomic } from '@/lib/orders/pickup-code';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_TRANSITIONS,
  STRIPE_MANAGED_STATUSES,
} from '@/lib/constants';
import type { OrderStatus, PickupPoint, ShippingMethod, ShippingCarrier } from '@/types';

// Statuts manuellement éditables = tous SAUF ceux gérés par Stripe (refunded /
// partially_refunded / disputed / payment_review). payment_review reste accessible
// EN SORTIE via ORDER_STATUS_TRANSITIONS (payment_review → paid|cancelled) mais
// n'est pas une CIBLE manuelle ; le guard STRIPE_MANAGED_STATUSES ci-dessous le bloque
// comme cible, ce qui est le comportement voulu (Stripe pose payment_review, pas l'admin).
const MANUAL_STATUS_VALUES = ORDER_STATUS_VALUES.filter(
  (s) => !STRIPE_MANAGED_STATUSES.includes(s),
) as [OrderStatus, ...OrderStatus[]];
```

> Note (correctif d'incohérence) : `ShippingMethod` et `ShippingCarrier` sont importés ICI dès (3a), car (3e) en a besoin pour les casts `as ShippingMethod | null` / `as ShippingCarrier | null`. Ne PAS laisser ces deux types hors de la ligne d'import — sinon type-check rouge `Cannot find name 'ShippingMethod'` en (3e).

(3b) Schéma Zod — remplacer le bloc `const PatchSchema = z.object({ status: z.enum(ORDER_STATUSES).optional(), ... })` (L21-28) par :

```ts
const PatchSchema = z.object({
  status: z.enum(MANUAL_STATUS_VALUES).optional(),
  trackingNumber: z.string().max(50).optional(),
  adminNotes: z.string().max(2000).nullable().optional(),
  cancelReason: z.string().max(500).optional(),
  // Pas de refundAmount/refundReason ici — le refund passe par
  // POST /api/admin/orders/:id/refund qui appelle Stripe.
});
```

> Note : le guard runtime existant `const STRIPE_MANAGED_STATUSES = new Set([...]); if (body.status && STRIPE_MANAGED_STATUSES.has(body.status)) { ... }` (L106-114) **reste tel quel** — c'est une variable locale `Set` distincte de la constante importée `STRIPE_MANAGED_STATUSES` (tableau). Le shadowing est volontaire et sans effet de bord : la constante importée est consommée uniquement par `MANUAL_STATUS_VALUES` (calculée AVANT le corps de la fonction) et par `manualTransitions` côté composant. Garder le `Set` local évite de toucher au guard défensif déjà testé.

(3c) Validation de transition + branche C&C — dans `PATCH`, après le bloc `STRIPE_MANAGED_STATUSES` guard (actuel L106-114, **conservé tel quel**), insérer juste avant `const now = new Date().toISOString();` (L116) :

```ts
  // Validation de transition via la table centralisée (PR2). On n'autorise
  // que les cibles déclarées dans ORDER_STATUS_TRANSITIONS pour le statut courant.
  const currentStatus = currentOrder.status as OrderStatus;
  const statusChanging = !!body.status && body.status !== currentStatus;
  if (statusChanging) {
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(body.status as OrderStatus)) {
      return NextResponse.json(
        { error: `Transition non autorisée : "${currentStatus}" → "${body.status}".` },
        { status: 400 },
      );
    }
  }

  // ── Branche Click & Collect : ready_for_pickup ──────────────────────────
  // Génération atomique du code de retrait + email transactionnel. On sort
  // tôt de la fonction (chemin dédié) pour ne pas mélanger avec l'update générique.
  if (body.status === 'ready_for_pickup' && currentStatus !== 'ready_for_pickup') {
    const pickupPoint = currentOrder.pickup_point as PickupPoint | null;
    if (
      currentOrder.shipping_method !== 'click_collect'
      || !pickupPoint
      || pickupPoint.provider !== 'click_collect'
    ) {
      return NextResponse.json(
        { error: 'Cette commande n\'a pas de point Click & Collect valide.' },
        { status: 400 },
      );
    }

    const result = await assignPickupCodeAtomic(supabase, id, {
      status: 'ready_for_pickup',
      ready_for_pickup_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!result) {
      Sentry.captureMessage('pickup_code generation failed after 8 attempts', {
        level: 'error',
        tags: { feature: 'click_and_collect', step: 'generate_code' },
        extra: { orderId: id },
      });
      return NextResponse.json(
        { error: 'Impossible de générer un code de retrait unique. Réessayez.' },
        { status: 500 },
      );
    }

    // result.updated est typé `unknown` (signature PR3). On le projette sur la
    // forme attendue. OrderCustomer est déjà défini dans ce fichier (L30-39).
    const updatedOrder = result.updated as {
      order_number: string;
      customer: OrderCustomer | null;
      pickup_point: PickupPoint | null;
    };

    if (updatedOrder.customer?.email) {
      const customer = updatedOrder.customer;
      after(async () => {
        try {
          // Décision D1 : on passe pickupPoint: updatedOrder.pickup_point
          // SANS cast ni narrowing — la signature PR3 accepte PickupPoint | null
          // (le guard provider !== 'click_collect' est interne au sender).
          await sendOrderReadyForPickupEmail({
            to: customer.email,
            firstName: customer.firstName,
            orderNumber: updatedOrder.order_number,
            pickupCode: result.code,
            pickupPoint: updatedOrder.pickup_point,
          });
        } catch (err) {
          Sentry.captureException(err, {
            tags: { feature: 'click_and_collect', step: 'email' },
            extra: { orderId: id },
          });
        }
      });
    }

    return NextResponse.json({ order: result.updated });
  }
```

(3d) Timestamps `picked_up_at` — dans le bloc `if (body.status && body.status !== currentOrder.status)` (actuel L126-136), ajouter après la branche `cancelled` (L133-135), avant la `}` qui clôt le bloc :

```ts
    if (body.status === 'picked_up' && !currentOrder.picked_up_at) {
      updatePayload.picked_up_at = now;
    }
```

(3e) Garde-fou shipped pour C&C (§9.4) + casts PR2 — la branche `if (body.status === 'shipped')` actuelle s'étend de L156 à L189. **Remplacer cette branche entière** (de `if (body.status === 'shipped') {` jusqu'à son `}` fermant inclus) par le bloc COMPLET ci-dessous (corps existant déplacé dans le `else`, casts `as 'home' | 'mondial_relay' | null` / `as 'colissimo' | 'mondial_relay' | null` mis à jour vers `ShippingMethod` / `ShippingCarrier`) :

```ts
    if (body.status === 'shipped') {
      // §9.4 — Garde-fou : la transition confirmed → shipped est déjà bloquée par
      // ORDER_STATUS_TRANSITIONS pour les commandes C&C (confirmed → ready_for_pickup),
      // mais on n'envoie JAMAIS l'email "Expédiée" si jamais une commande C&C
      // arrivait ici (3 emails au lieu de 2 = bruit, cf. spec §9.4).
      // updated.shipping_method est issu d'un .select().single() non typé → unknown.
      if ((updated.shipping_method as ShippingMethod | null) === 'click_collect') {
        console.warn('[admin/orders] illegal transition: shipped on click_collect order', { orderId: id });
      } else {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_name, size, quantity, price')
          .eq('order_id', id);

        // after() : envoi post-réponse pour ne pas bloquer l'admin, mais garde
        // la lambda vivante (sinon Vercel suspend la fonction et le fetch Brevo
        // est tué → "fetch failed").
        after(async () => {
          try {
            await sendOrderShipped({
              to: customer.email,
              orderNumber,
              items: (orderItems ?? []).map((i: { product_name: string; size: string; quantity: number; price: number }) => ({
                productName: i.product_name,
                size: i.size,
                quantity: i.quantity,
                price: i.price,
              })),
              customer,
              subtotal: Number(updated.total) - Number(updated.shipping) + Number(updated.promo_discount ?? 0) + Number(updated.gift_card_amount ?? 0),
              shipping: Number(updated.shipping),
              total: Number(updated.total),
              trackingNumber: body.trackingNumber || (updated.tracking_number as string | undefined),
              shippingMethod: (updated.shipping_method as ShippingMethod | null) ?? undefined,
              shippingCarrier: (updated.shipping_carrier as ShippingCarrier | null) ?? undefined,
              pickupPoint: (updated.pickup_point as PickupPoint | null) ?? null,
            });
          } catch (err) {
            console.error('[Admin orders PATCH] Shipped email error:', err);
          }
        });
      }
    }
```

> Note : `pickupPoint` utilise désormais le `PickupPoint` importé en (3a) (l'import inline `import('@/types').PickupPoint` de la version actuelle, L183, est supprimé au profit de l'import nommé en tête). Les branches `delivered` (L191-203) et `cancelled` (L205-220) restent inchangées.

- [ ] **Step 4 — Relancer → succès.**

```
npm run test -- admin-orders-patch-click-collect
```

Sortie attendue : `6 passed`.

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur (vérifier que `MANUAL_STATUS_VALUES` est bien typé `[OrderStatus, ...OrderStatus[]]` pour `z.enum`, et que `ShippingMethod`/`ShippingCarrier` sont bien importés).

- [ ] **Step 6 — Commit.**

```
git add lolett-app/app/api/admin/orders/[id]/route.ts lolett-app/__tests__/api/admin-orders-patch-click-collect.test.ts
git commit -m "feat(admin): transitions Click & Collect dans PATCH /api/admin/orders/[id]"
```

---

### Task 4bis: Recâbler `REFUNDABLE_STATUSES` sur la constante centralisée (décision D2 — scénario A9)

**Files:**
- Modify: `lolett-app/app/api/admin/orders/[id]/refund/route.ts` (L36 suppression liste hardcodée + import ; L90 cast adapté)
- Modify: `lolett-app/components/admin/RefundDialog.tsx` (L52 suppression liste hardcodée + import ; L60 `.includes(...)`)
- Test: `lolett-app/__tests__/api/admin-orders-refund-ready-for-pickup.test.ts`

> **Pourquoi cette Task** : `REFUNDABLE_STATUSES` est aujourd'hui dupliqué et hardcodé SANS `ready_for_pickup` (route L36 + dialog L52). Le scénario A9 (« cliente C&C n'est pas venue → on rembourse depuis `ready_for_pickup` ») exige que la constante centralisée de PR2 (qui inclut `ready_for_pickup`) soit la source de vérité aux deux endroits. Décision D2 : c'est **PR4** qui fait ce recâblage (pas PR5). On ne change PAS la logique Stripe ni les autres gardes de la route refund.

- [ ] **Step 1 — Écrire le test qui échoue (`ready_for_pickup` accepté côté API).** Créer `lolett-app/__tests__/api/admin-orders-refund-ready-for-pickup.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, fromMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: fromMock }) }));
vi.mock('@/lib/orders/refund-tracking', () => ({
  getAlreadyRefundedQtyMap: vi.fn().mockResolvedValue(new Map()),
  refundItemKey: (p: string, s: string, c: string | null) => `${p}|${s}|${c ?? ''}`,
}));

// On stub Stripe pour ne pas appeler le vrai SDK. Le but du test est la GARDE
// de statut (ready_for_pickup accepté), pas le flux Stripe complet.
vi.mock('stripe', () => ({
  default: class {
    refunds = { create: vi.fn().mockResolvedValue({ id: 're_1', amount: 1000 }) };
  },
}));

import { POST } from '@/app/api/admin/orders/[id]/refund/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });

function refundReq(body: unknown): Request {
  return new Request('http://x/api/admin/orders/o1/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: 'admin=ok' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/admin/orders/[id]/refund — statut ready_for_pickup', () => {
  beforeEach(() => {
    checkAdminMock.mockReset().mockResolvedValue(true);
    fromMock.mockReset();
    process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  });

  it('accepte un remboursement (commercial_gesture) depuis ready_for_pickup (A9)', async () => {
    fromMock
      // fetch order
      .mockReturnValueOnce({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                id: 'o1', payment_id: 'pi_1', payment_provider: 'stripe',
                total: 50, status: 'ready_for_pickup', refund_amount: null,
              },
              error: null,
            }),
          }),
        }),
      })
      // réservation préemptive refund_amount (update ... .is(...).select('id'))
      .mockReturnValueOnce({
        update: () => ({
          eq: () => ({
            is: () => ({ select: () => Promise.resolve({ data: [{ id: 'o1' }], error: null }) }),
          }),
        }),
      });

    const res = await POST(
      refundReq({ kind: 'commercial_gesture', amount: 10, reason: 'cliente non venue', nonce: 'abcd1234' }),
      params('o1'),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.**

```
npm run test -- admin-orders-refund-ready-for-pickup
```

Sortie attendue : `400` au lieu de `200` — la liste hardcodée L36 ne contient pas `ready_for_pickup`, donc le guard L90-95 renvoie « Impossible de rembourser une commande en statut "ready_for_pickup" ».

- [ ] **Step 3 — Recâbler `refund/route.ts`.** Dans `lolett-app/app/api/admin/orders/[id]/refund/route.ts` :

  Ajouter l'import (après l'import `@/lib/orders/refund-tracking` L6) :

```ts
import { REFUNDABLE_STATUSES } from '@/lib/constants';
```

  Supprimer la ligne L36 :

```ts
const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'] as const;
```

  Remplacer le guard L90 (`if (!REFUNDABLE_STATUSES.includes(order.status as typeof REFUNDABLE_STATUSES[number])) {`) par :

```ts
  if (!REFUNDABLE_STATUSES.includes(order.status as OrderStatus)) {
```

  Et importer le type `OrderStatus` (la constante centralisée est typée `readonly OrderStatus[]`, donc le cast `as typeof REFUNDABLE_STATUSES[number]` ne fonctionne plus — on cast vers `OrderStatus`). Ajouter à la fin du bloc d'imports :

```ts
import type { OrderStatus } from '@/types';
```

> Note : `order.status` provient d'un `.select(...).single()` non typé (`string`), d'où le cast explicite `as OrderStatus` pour satisfaire `.includes()`.

- [ ] **Step 4 — Recâbler `RefundDialog.tsx`.** Dans `lolett-app/components/admin/RefundDialog.tsx` :

  Ajouter l'import (regrouper avec les imports `@/lib/...` existants, après le bloc d'imports de composants UI) :

```tsx
import { REFUNDABLE_STATUSES } from '@/lib/constants';
import type { OrderStatus } from '@/types';
```

  Supprimer la ligne L52 :

```tsx
const REFUNDABLE_STATUSES = ['paid', 'confirmed', 'shipped', 'delivered', 'partially_refunded'];
```

  Remplacer le `canRefund` L60 :

```tsx
  const canRefund = REFUNDABLE_STATUSES.includes(status as OrderStatus) && remaining > 0;
```

> Note : la prop `status` du dialog est typée `string` (L42). La constante centralisée étant `readonly OrderStatus[]`, on cast `status as OrderStatus` pour `.includes()`. Aucun autre changement dans le composant.

- [ ] **Step 5 — Relancer → succès.**

```
npm run test -- admin-orders-refund-ready-for-pickup
```

Sortie attendue : `1 passed`.

- [ ] **Step 6 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 7 — Commit.**

```
git add lolett-app/app/api/admin/orders/[id]/refund/route.ts lolett-app/components/admin/RefundDialog.tsx lolett-app/__tests__/api/admin-orders-refund-ready-for-pickup.test.ts
git commit -m "fix(admin): REFUNDABLE_STATUSES centralisé (refund possible depuis ready_for_pickup, A9)"
```

---

### Task 5: Refactor `OrderStatusBadge` sur les constantes centralisées

**Files:**
- Modify: `lolett-app/components/admin/OrderStatusBadge.tsx` (remplace L1-45 : maps locales `STATUS_LABELS`/`STATUS_CLASSES` + composant)
- Test: `lolett-app/__tests__/admin/order-status-badge.test.tsx`

- [ ] **Step 1 — Écrire le test qui échoue.** Créer `lolett-app/__tests__/admin/order-status-badge.test.tsx` :

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { ORDER_STATUS_LABELS } from '@/lib/constants';

describe('OrderStatusBadge', () => {
  it('affiche le label centralisé pour ready_for_pickup', () => {
    render(<OrderStatusBadge status="ready_for_pickup" />);
    expect(screen.getByText(ORDER_STATUS_LABELS.ready_for_pickup)).toBeInTheDocument();
  });

  it('affiche le label centralisé pour picked_up', () => {
    render(<OrderStatusBadge status="picked_up" />);
    expect(screen.getByText(ORDER_STATUS_LABELS.picked_up)).toBeInTheDocument();
  });

  it('retombe sur le statut brut si inconnu', () => {
    render(<OrderStatusBadge status="bidon" />);
    expect(screen.getByText('bidon')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.**

```
npm run test -- order-status-badge
```

Sortie attendue : échec sur `ready_for_pickup` / `picked_up` — le composant actuel n'a pas ces clés dans `STATUS_LABELS` (L4-16) donc affiche le statut brut au lieu du label « Prête au retrait » / « Retirée ».

- [ ] **Step 3 — Implémenter.** Remplacer l'intégralité de `lolett-app/components/admin/OrderStatusBadge.tsx` par :

```tsx
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/types';

interface OrderStatusBadgeProps {
  status: string;
}

function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUS_LABELS;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const label = isOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status;
  const twFull = isOrderStatus(status)
    ? ORDER_STATUS_COLORS[status].twFull
    : ORDER_STATUS_COLORS.expired.twFull;

  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] font-medium rounded-md tracking-wide', twFull)}
    >
      {label}
    </Badge>
  );
}
```

- [ ] **Step 4 — Relancer → succès.**

```
npm run test -- order-status-badge
```

Sortie attendue : `3 passed`.

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 6 — Commit.**

```
git add lolett-app/components/admin/OrderStatusBadge.tsx lolett-app/__tests__/admin/order-status-badge.test.tsx
git commit -m "refactor(admin): OrderStatusBadge consomme ORDER_STATUS_LABELS/COLORS"
```

---

### Task 6: Refactor `OrderStatusUpdate` (prop shippingMethod, workflow C&C, boutons rapides)

**Files:**
- Modify: `lolett-app/components/admin/OrderStatusUpdate.tsx` (remplace L25-55 maps locales, L57-63 props, L65-71 destructuration, L81-90 logique, L146-157 WORKFLOW_STEPS, L212-225 hints « Prochaine étape », L252/L258/L320 `STATUSES.find`, L263 ouverture bloc tracking, L306 bouton « Enregistrer »)
- Modify: `lolett-app/app/admin/orders/[id]/page.tsx` (L429-435 ajoute `shippingMethod`)

Pas de test unitaire pertinent (composant React interactif lourd avec `useRouter`) → **vérification manuelle** + type-check. La logique pure (transitions, steps) est déjà couverte indirectement par les tests `ORDER_STATUS_TRANSITIONS` de PR2 et par le PATCH (Task 4).

- [ ] **Step 1 — Implémenter le refactor.** Remplacer dans `lolett-app/components/admin/OrderStatusUpdate.tsx` :

(1a) Remplacer les maps locales `STATUSES` / `VALID_TRANSITIONS` / `CANCEL_REQUIRES_CONFIRM` (L25-55) par un import + dérivations :

```tsx
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VALUES,
  ORDER_STATUS_TRANSITIONS,
  STRIPE_MANAGED_STATUSES,
  ORDER_STEPS_HOME,
  ORDER_STEPS_PICKUP,
} from '@/lib/constants';
import type { OrderStatus, ShippingMethod } from '@/types';

// Liste des statuts proposables = tous SAUF ceux gérés par Stripe.
const SELECTABLE_STATUSES: { value: OrderStatus; label: string }[] = ORDER_STATUS_VALUES
  .filter((s) => !STRIPE_MANAGED_STATUSES.includes(s))
  .map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }));

// Transitions manuelles autorisées depuis un statut = transitions centralisées
// (PR2) moins les statuts gérés par Stripe (qu'on ne pose jamais à la main).
function manualTransitions(from: OrderStatus): OrderStatus[] {
  return (ORDER_STATUS_TRANSITIONS[from] ?? []).filter(
    (s) => !STRIPE_MANAGED_STATUSES.includes(s),
  );
}

// Annulation sensible (commande déjà payée/préparée/expédiée/prête).
const CANCEL_REQUIRES_CONFIRM: OrderStatus[] = ['paid', 'confirmed', 'shipped', 'ready_for_pickup'];
```

(1b) Ajouter la prop `shippingMethod` (interface L57-63) :

```tsx
interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentAdminNotes?: string | null;
  currentCancelReason?: string | null;
  shippingMethod?: ShippingMethod | null;
}
```

et la destructurer dans la signature du composant (L65-71) :

```tsx
export function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentAdminNotes,
  currentCancelReason,
  shippingMethod,
}: OrderStatusUpdateProps) {
```

(1c) Remplacer les dérivations basées sur `STATUSES`/`VALID_TRANSITIONS` (L81-90) par :

```tsx
  const isClickCollect = shippingMethod === 'click_collect';
  const currentStatusTyped = currentStatus as OrderStatus;
  const allowedNextStatuses = manualTransitions(currentStatusTyped);
  const availableStatuses = SELECTABLE_STATUSES.filter(
    (s) => s.value === currentStatus || allowedNextStatuses.includes(s.value),
  );
  const isLockedStatus = allowedNextStatuses.length === 0;

  const isStatusChange = status !== currentStatus;
  const isInvalidTransition = isStatusChange && !allowedNextStatuses.includes(status as OrderStatus);
  const isSensitiveCancel = isStatusChange && status === 'cancelled' && CANCEL_REQUIRES_CONFIRM.includes(currentStatusTyped);
```

> Note : remplacer toutes les occurrences résiduelles `STATUSES.find((s) => s.value === ...)` (L252, L258, L320) par `SELECTABLE_STATUSES.find((s) => s.value === ...)` ; le typage `?.label ?? v` reste identique.

(1d) Remplacer `WORKFLOW_STEPS` (L146-157) par une dérivation conditionnelle C&C. Remplacer le bloc :

```tsx
  // Workflow visuel : étapes principales du cycle de vie d'une commande
  const WORKFLOW_STEPS: { value: string; label: string; icon: string }[] = [
    { value: 'paid', label: 'Payée', icon: '💳' },
    { value: 'confirmed', label: 'Confirmée', icon: '✓' },
    { value: 'shipped', label: 'Expédiée', icon: '📦' },
    { value: 'delivered', label: 'Livrée', icon: '🏠' },
  ];
```

par :

```tsx
  // Workflow visuel : étapes du cycle de vie selon le mode de livraison.
  // C&C : Payée → Confirmée → Prête au retrait → Retirée. Sinon : flux domicile.
  const STEP_ICONS: Record<string, string> = {
    paid: '💳', confirmed: '✓', shipped: '📦', delivered: '🏠',
    ready_for_pickup: '🛍️', picked_up: '✅',
  };
  const workflowStatuses = isClickCollect
    ? ['paid', 'confirmed', 'ready_for_pickup', 'picked_up']
    : ['paid', 'confirmed', 'shipped', 'delivered'];
  const WORKFLOW_STEPS = workflowStatuses.map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value as OrderStatus],
    icon: STEP_ICONS[value] ?? '•',
  }));
```

> Note : les `ORDER_STEPS_HOME` / `ORDER_STEPS_PICKUP` importés servent de source de vérité des séquences ; ici on reprend volontairement la sous-séquence visible (sans `pending`) cohérente avec l'affichage existant. Garder l'import pour cohérence sémantique et usage côté client en PR5. (Les variables `currentStepIndex` / `showWorkflow` / `nextStep` immédiatement sous le bloc, L153-157, sont conservées telles quelles — elles dérivent de `WORKFLOW_STEPS`.)

(1e) Adapter le texte « Prochaine étape » (L212-225). Remplacer le bloc des hints `nextStep`/fin de commande par un mapping qui couvre aussi C&C :

```tsx
            {nextStep && (
              <p className="text-[12px] text-[#1a1510]/70 leading-relaxed">
                <span className="font-medium text-[#1B0B94]">Prochaine étape :</span>{' '}
                passer en <strong>{nextStep.label}</strong>
                {nextStep.value === 'confirmed' && ' — vérifier le stock et préparer le colis.'}
                {nextStep.value === 'shipped' && ' — entrer le n° Mondial Relay (un email de suivi sera envoyé au client).'}
                {nextStep.value === 'delivered' && ' — confirmer la réception (un email final sera envoyé au client).'}
                {nextStep.value === 'ready_for_pickup' && ' — un code de retrait est généré et envoyé au client par email.'}
                {nextStep.value === 'picked_up' && ' — confirmer que le client a récupéré sa commande (aucun email).'}
              </p>
            )}
            {!nextStep && (currentStatus === 'delivered' || currentStatus === 'picked_up') && (
              <p className="text-[12px] text-emerald-700 leading-relaxed">
                ✓ Commande terminée. Aucune action supplémentaire requise.
              </p>
            )}
```

(1f) Masquer le champ tracking pour C&C (`trackingLabel` null). Remplacer l'ouverture du bloc tracking (L263) `{status === 'shipped' && (` par `{status === 'shipped' && !isClickCollect && (`.

(1g) Boutons rapides. Juste avant le bouton « Enregistrer » (L306, `<Button onClick={handleSubmit} ...>`), insérer :

```tsx
        {isClickCollect && currentStatus === 'confirmed' && (
          <Button
            type="button"
            onClick={() => { setStatus('ready_for_pickup'); }}
            variant="outline"
            className="w-fit border-cyan-500 text-cyan-700 hover:bg-cyan-50 font-[family-name:var(--font-montserrat)]"
          >
            Marquer prête au retrait
          </Button>
        )}
        {isClickCollect && currentStatus === 'ready_for_pickup' && (
          <Button
            type="button"
            onClick={() => { setStatus('picked_up'); }}
            variant="outline"
            className="w-fit border-teal-500 text-teal-700 hover:bg-teal-50 font-[family-name:var(--font-montserrat)]"
          >
            Marquer retirée
          </Button>
        )}
```

> Ces boutons pré-sélectionnent le statut dans le `Select` ; l'admin valide ensuite via « Enregistrer » (réutilise `handleSubmit` → `performUpdate` → `PATCH`). Cohérent avec le flux existant (pas de double mécanisme de soumission). Vérifié : `manualTransitions('confirmed')` contient `ready_for_pickup`, et `manualTransitions('ready_for_pickup')` contient `picked_up` (PR2), donc `isInvalidTransition` reste `false` après le `setStatus` et le bouton « Enregistrer » n'est pas grisé.

(1h) Brancher la prop dans la page détail. Dans `lolett-app/app/admin/orders/[id]/page.tsx`, remplacer l'appel `<OrderStatusUpdate ... />` (L429-435) par :

```tsx
      <OrderStatusUpdate
        orderId={order.id}
        currentStatus={order.status}
        currentTrackingNumber={order.tracking_number}
        currentAdminNotes={order.admin_notes}
        currentCancelReason={order.cancel_reason}
        shippingMethod={order.shipping_method}
      />
```

- [ ] **Step 2 — Vérification manuelle (concrète).** Lancer `npm run dev` puis ouvrir une commande `click_collect` au statut `confirmed` sur `/admin/orders/[id]`. Observer : (a) le workflow affiche **Payée → Confirmée → Prête au retrait → Retirée** (pas Expédiée/Livrée) ; (b) un bouton « Marquer prête au retrait » est présent ; (c) le sélecteur de statut ne propose pas `shipped`/`delivered` ; (d) sur une commande `home`, le workflow reste **Payée → Confirmée → Expédiée → Livrée** et le champ N° Mondial Relay apparaît au passage en `shipped`.

- [ ] **Step 3 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur (vérifier les casts `as OrderStatus` et que la prop `shippingMethod` est bien `ShippingMethod | null`).

- [ ] **Step 4 — Commit.**

```
git add lolett-app/components/admin/OrderStatusUpdate.tsx lolett-app/app/admin/orders/[id]/page.tsx
git commit -m "refactor(admin): OrderStatusUpdate workflow Click & Collect + boutons rapides"
```

---

### Task 7: Refactor `OrderFilters` (statuts dérivés + filtre shipping_method)

**Files:**
- Modify: `lolett-app/components/admin/OrderFilters.tsx` (imports après L11, remplace L42-52 statuts hardcodés, ajoute un `<Select>` méthode après L53)
- Modify: `lolett-app/app/admin/orders/page.tsx` (L7-13 `SearchParams`, L49 query)

Pas de test unitaire dédié (composant `useSearchParams`) → **vérification manuelle** + type-check.

- [ ] **Step 1 — Implémenter `OrderFilters`.** Dans `lolett-app/components/admin/OrderFilters.tsx`, ajouter les imports en tête (après L11 `import { useCallback, useTransition } from 'react';`) :

```tsx
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_LABELS,
  SHIPPING_METHODS,
} from '@/lib/constants';
import { SHIPPING_METHOD_VALUES } from '@/lib/types/domain';
```

Remplacer le `<SelectContent>` du filtre statut (L42-52) par une liste dérivée :

```tsx
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {ORDER_STATUS_VALUES.map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
```

Ajouter un nouveau `<Select>` filtre méthode de livraison, juste après le `<Select>` statut (après sa balise fermante `</Select>`, L53) :

```tsx
      <Select
        defaultValue={searchParams.get('shipping_method') ?? 'all'}
        onValueChange={(v) => updateFilter('shipping_method', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Mode de livraison" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les modes</SelectItem>
          {SHIPPING_METHOD_VALUES.map((m) => (
            <SelectItem key={m} value={m}>
              {SHIPPING_METHODS[m].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
```

- [ ] **Step 2 — Brancher le filtre côté page orders.** Dans `lolett-app/app/admin/orders/page.tsx` :

Ajouter `shipping_method?: string;` à l'interface `SearchParams` (après L8 `status?: string;`).

Après le filtre status dans `getOrders` (L49 `if (params.status) query = query.eq('status', params.status);`), ajouter :

```ts
  if (params.shipping_method) query = query.eq('shipping_method', params.shipping_method);
```

- [ ] **Step 3 — Vérification manuelle.** Sur `/admin/orders`, vérifier que le sélecteur statut propose les 13 libellés (dont « Prête au retrait » / « Retirée ») et qu'un nouveau sélecteur « Mode de livraison » filtre la liste (`?shipping_method=click_collect` dans l'URL ne retourne que les commandes C&C).

- [ ] **Step 4 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 5 — Commit.**

```
git add lolett-app/components/admin/OrderFilters.tsx lolett-app/app/admin/orders/page.tsx
git commit -m "refactor(admin): OrderFilters statuts dérivés + filtre mode de livraison"
```

---

### Task 8: Refactor `DashboardCharts` + widget « À retirer » (DashboardStats)

**Files:**
- Modify: `lolett-app/components/admin/dashboard/DashboardCharts.tsx` (remplace L18-34 maps locales, L47-53 `statusData`)
- Modify: `lolett-app/components/admin/dashboard/getDashboardStats.ts` (ajoute `ordersReadyForPickup` à l'interface L17, requête dans `Promise.all`, destructuration L54-64, return L151)
- Modify: `lolett-app/app/admin/page.tsx` (import lucide L4, carte « À retirer » après L42, skeleton L214)

Pas de test unitaire dédié (composants Recharts / RSC) → **vérification manuelle** + type-check.

- [ ] **Step 1 — Refactor `DashboardCharts`.** Remplacer les maps locales `STATUS_COLORS` / `STATUS_LABELS` (L18-34) par un import :

```tsx
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants';
import type { OrderStatus } from '@/types';
```

Remplacer le `.map(...)` de `statusData` (L47-53) par :

```tsx
  const statusData = ordersByStatus
    .map((s) => {
      const isKnown = s.status in ORDER_STATUS_LABELS;
      return {
        ...s,
        label: isKnown ? ORDER_STATUS_LABELS[s.status as OrderStatus] : s.status,
        fill: isKnown ? ORDER_STATUS_COLORS[s.status as OrderStatus].hex : '#B89547',
      };
    })
    .sort((a, b) => b.count - a.count);
```

- [ ] **Step 2 — Ajouter le compteur `ordersReadyForPickup` dans `getDashboardStats`.** Dans `lolett-app/components/admin/dashboard/getDashboardStats.ts` :

Ajouter à l'interface `DashboardStats`, **immédiatement après `ordersPending: number;` (L17)** :

```ts
  ordersReadyForPickup: number;
```

> ATTENTION ordre (correctif) : l'ordre des entrées du tableau destructuré (L54-64, 9 éléments) DOIT correspondre EXACTEMENT à l'ordre des requêtes du `Promise.all` (L65-99, 9 requêtes). Insérer la variable destructurée `{ count: ordersReadyForPickup }` **juste après `{ count: ordersPending }` (L57)** ET la requête correspondante **juste après le bloc `ordersPending` qui se termine L73** (`supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'paid']),`). Tout décalage attribue silencieusement à `ordersReadyForPickup` le count d'une autre requête (bug de widget faux).

Destructuration — insérer après `{ count: ordersPending },` (L57) :

```ts
    { count: ordersReadyForPickup },
```

Requête `Promise.all` — insérer après le bloc `.in('status', ['pending', 'paid']),` (fin L73) :

```ts
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready_for_pickup'),
```

Et l'ajouter au `return`, **immédiatement après `ordersPending: ordersPending ?? 0,` (L151)** :

```ts
    ordersReadyForPickup: ordersReadyForPickup ?? 0,
```

- [ ] **Step 3 — Carte « À retirer » dans le dashboard.** Dans `lolett-app/app/admin/page.tsx`, ajouter dans le tableau `statCards`, **après l'objet « En attente » (L37-42, qui se termine par `},`)** :

```tsx
    {
      label: 'À retirer (Click & Collect)',
      value: stats.ordersReadyForPickup,
      icon: Store,
      href: '/admin/orders?status=ready_for_pickup',
    },
```

et importer `Store` dans la ligne d'import lucide (L4) :

```tsx
import { Package, ShoppingBag, Clock, Layers, TrendingUp, Store } from 'lucide-react';
```

> Note grille : `statCards` passe de 5 à 6 cartes. La classe `lg:grid-cols-5` du contenu (L64) reste valide (la 6e carte passe en 2e rangée). Optionnel : passer à `lg:grid-cols-6` pour une rangée unique. **Cohérence skeleton (correctif)** : le `DashboardSkeleton` boucle `[...Array<undefined>(5)]` (L214) avec `lg:grid-cols-5` (L213) → on aligne le skeleton sur 6 cartes pour éviter le décalage visuel au chargement (5 placeholders puis 6 cartes). Remplacer `[...Array<undefined>(5)]` (L214) par `[...Array<undefined>(6)]`. (Garder `lg:grid-cols-5` ou passer aussi le skeleton à `lg:grid-cols-6` si on a changé le contenu — rester cohérent contenu↔skeleton.)

- [ ] **Step 4 — Vérification manuelle.** Sur `/admin`, vérifier : (a) le graphe « Commandes par statut » affiche les libellés féminins centralisés et la couleur `cyan`/`teal` pour `ready_for_pickup`/`picked_up` ; (b) une carte « À retirer (Click & Collect) » affiche le bon compte et pointe vers `/admin/orders?status=ready_for_pickup` ; (c) au chargement, le skeleton montre 6 placeholders (pas 5).

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 6 — Commit.**

```
git add lolett-app/components/admin/dashboard/DashboardCharts.tsx lolett-app/components/admin/dashboard/getDashboardStats.ts lolett-app/app/admin/page.tsx
git commit -m "refactor(admin): DashboardCharts centralisé + widget À retirer"
```

---

### Task 9: Sidebar — entrée « Points de retrait »

**Files:**
- Modify: `lolett-app/components/admin/AdminSidebar.tsx` (L5-21 import icône, L108-117 groupe Gestion)

Pas de test (config statique) → vérification manuelle + type-check.

- [ ] **Step 1 — Implémenter.** Dans `lolett-app/components/admin/AdminSidebar.tsx` :

Ajouter `Store` à l'import lucide (bloc L5-21), après `Gift,` (L20) :

```tsx
  Gift,
  Store,
} from 'lucide-react';
```

Ajouter l'entrée dans le groupe `'Gestion'` (items L110-116). Insérer après la ligne `/admin/gift-cards` (L113) :

```tsx
        { href: '/admin/pickup-points', label: 'Points de retrait', icon: Store, exact: false },
```

> Note : le groupe `'Gestion'` contient aussi `/admin/emails` (L114) et `/admin/launch-campaign` (L115) après `gift-cards` — l'insertion après L113 place « Points de retrait » entre « Cartes cadeaux » et « Emails », ce qui est l'emplacement voulu (cf. doc Lola Task 14 : « Admin → Gestion → Points de retrait »).

- [ ] **Step 2 — Vérification manuelle.** Sur n'importe quelle page admin, vérifier que la sidebar affiche « Points de retrait » sous « Gestion » avec l'icône boutique, et que le lien mène à `/admin/pickup-points`.

- [ ] **Step 3 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 4 — Commit.**

```
git add lolett-app/components/admin/AdminSidebar.tsx
git commit -m "feat(admin): entrée sidebar Points de retrait (Click & Collect)"
```

---

### Task 10: Composant `PickupPointFormModal`

**Files:**
- Create: `lolett-app/components/admin/PickupPointFormModal.tsx`

Composant client (formulaire modale) → **vérification manuelle** + type-check. La logique d'API est déjà testée (Tasks 1-3).

- [ ] **Step 1 — Implémenter.** Créer `lolett-app/components/admin/PickupPointFormModal.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface PickupPointRow {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  hours: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
}

interface PickupPointFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = création, sinon édition. */
  point: PickupPointRow | null;
  onSaved: () => void;
}

export function PickupPointFormModal({
  open,
  onOpenChange,
  point,
  onSaved,
}: PickupPointFormModalProps) {
  const isEdit = point !== null;
  const [name, setName] = useState(point?.name ?? '');
  const [address, setAddress] = useState(point?.address ?? '');
  const [postalCode, setPostalCode] = useState(point?.postal_code ?? '');
  const [city, setCity] = useState(point?.city ?? '');
  const [hours, setHours] = useState(point?.hours ?? '');
  const [instructions, setInstructions] = useState(point?.instructions ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setSaving(true);
    setError('');
    const payload = {
      name,
      address,
      postalCode,
      city,
      country: 'FR',
      hours: hours || null,
      instructions: instructions || null,
    };
    const url = isEdit
      ? `/api/admin/pickup-points/${point.id}`
      : '/api/admin/pickup-points';
    const method = isEdit ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Erreur inconnue');
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-[family-name:var(--font-montserrat)] max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le point de retrait' : 'Ajouter un point de retrait'}</DialogTitle>
          <DialogDescription className="text-[#1a1510]/60">
            Les points sont masqués par défaut. Activez-les depuis la liste pour les rendre visibles au checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-name">Nom de la boutique</Label>
            <Input id="pp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Boutique du Marais" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-address">Adresse</Label>
            <Input id="pp-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex : 3 rue des Rosiers" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pp-postal">Code postal</Label>
              <Input id="pp-postal" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="75004" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pp-city">Ville</Label>
              <Input id="pp-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-hours">Horaires (optionnel)</Label>
            <Input id="pp-hours" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Lun-Sam 10h-19h" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pp-instructions">Instructions de retrait (optionnel)</Label>
            <textarea
              id="pp-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              placeholder="Ex : sonnez à l'interphone Lolett, 1er étage."
              className="w-full resize-y rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 focus:border-[#1B0B94] focus:outline-none focus:ring-2 focus:ring-[#1B0B94]/20"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !name || !address || !postalCode || !city}
            className="bg-[#1B0B94] text-white hover:bg-[#130970]"
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2 — Vérification manuelle (différée à Task 11).** La modale n'est instanciée que par la page `/admin/pickup-points` (Task 11). Vérification visuelle après Task 11.

- [ ] **Step 3 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 4 — Commit.**

```
git add lolett-app/components/admin/PickupPointFormModal.tsx
git commit -m "feat(admin): composant PickupPointFormModal (création/édition point de retrait)"
```

---

### Task 11: Route `usage` + page `/admin/pickup-points` (liste + table client interactive)

**Files:**
- Create: `lolett-app/app/api/admin/pickup-points/[id]/usage/route.ts` (count RPC — 6e route API)
- Create: `lolett-app/components/admin/PickupPointsTable.tsx` (client : actions toggle/edit/reorder + appel `usage`)
- Create: `lolett-app/app/admin/pickup-points/page.tsx` (RSC : titre + bouton + table)
- Test: `lolett-app/__tests__/api/admin-pickup-points-usage.test.ts`

Page admin interactive → **vérification manuelle** + type-check (page + table). La route `usage` est couverte par un test d'intégration (401 + count). Les autres routes API sont déjà testées (Tasks 1-3).

> Architecture : c'est la **6e route API** (`[id]/usage`), exposant la RPC `count_orders_with_pickup_point` (PR1, scénario A7). On la teste comme les 5 autres et on la commite **séparément** de la page/table (commits par changement logique).

- [ ] **Step 1 — Écrire le test de la route `usage` (qui échoue).** Créer `lolett-app/__tests__/api/admin-pickup-points-usage.test.ts` :

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { checkAdminMock, rpcMock } = vi.hoisted(() => ({
  checkAdminMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock('@/lib/admin/auth', () => ({ checkAdminCookieFromRequest: checkAdminMock }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ rpc: rpcMock }) }));

import { GET } from '@/app/api/admin/pickup-points/[id]/usage/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/admin/pickup-points/[id]/usage', () => {
  beforeEach(() => { checkAdminMock.mockReset(); rpcMock.mockReset(); });

  it('401 si non authentifié', async () => {
    checkAdminMock.mockResolvedValue(false);
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(401);
  });

  it('renvoie { count } depuis la RPC count_orders_with_pickup_point', async () => {
    checkAdminMock.mockResolvedValue(true);
    rpcMock.mockResolvedValue({ data: 3, error: null });
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(3);
    expect(rpcMock).toHaveBeenCalledWith('count_orders_with_pickup_point', { point_id: 'p1' });
  });

  it('count = 0 si la RPC renvoie null', async () => {
    checkAdminMock.mockResolvedValue(true);
    rpcMock.mockResolvedValue({ data: null, error: null });
    const res = await GET(new Request('http://x'), params('p1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
  });
});
```

- [ ] **Step 2 — Lancer → échec attendu.**

```
npm run test -- admin-pickup-points-usage
```

Sortie attendue : `Failed to resolve import "@/app/api/admin/pickup-points/[id]/usage/route"`.

- [ ] **Step 3 — Implémenter la route `usage`.** Créer `lolett-app/app/api/admin/pickup-points/[id]/usage/route.ts` :

```ts
import { NextResponse } from 'next/server';
import { checkAdminCookieFromRequest } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAdminCookieFromRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('count_orders_with_pickup_point', {
    point_id: id,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: typeof data === 'number' ? data : 0 });
}
```

- [ ] **Step 4 — Relancer → succès.**

```
npm run test -- admin-pickup-points-usage
```

Sortie attendue : `3 passed`.

- [ ] **Step 5 — Type-check + commit de la route `usage`.**

```
npm run type-check
git add lolett-app/app/api/admin/pickup-points/[id]/usage/route.ts lolett-app/__tests__/api/admin-pickup-points-usage.test.ts
git commit -m "feat(admin): route count usage point de retrait (RPC count_orders_with_pickup_point)"
```

- [ ] **Step 6 — Implémenter la table client.** Créer `lolett-app/components/admin/PickupPointsTable.tsx` :

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PickupPointFormModal, type PickupPointRow } from '@/components/admin/PickupPointFormModal';

interface PickupPointsTableProps {
  points: PickupPointRow[];
}

export function PickupPointsTable({ points }: PickupPointsTableProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PickupPointRow | null>(null);
  const [hideTarget, setHideTarget] = useState<PickupPointRow | null>(null);
  const [hideCount, setHideCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(point: PickupPointRow) {
    setEditing(point);
    setFormOpen(true);
  }

  async function activate(point: PickupPointRow) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/pickup-points/${point.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error('Activation impossible');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  // Avant de masquer : on récupère le nombre de commandes historiques référençant
  // ce point (RPC count_orders_with_pickup_point) et on affiche un avertissement.
  async function askHide(point: PickupPointRow) {
    setHideTarget(point);
    setHideCount(null);
    try {
      const res = await fetch(`/api/admin/pickup-points/${point.id}/usage`);
      if (res.ok) {
        const data = (await res.json()) as { count: number };
        setHideCount(data.count);
      }
    } catch {
      setHideCount(null);
    }
  }

  async function confirmHide() {
    if (!hideTarget) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/pickup-points/${hideTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });
      if (!res.ok) throw new Error('Masquage impossible');
      setHideTarget(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  async function reorder(fromId: string, toId: string) {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/pickup-points/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromId, toId }),
      });
      if (!res.ok) throw new Error('Réordonnancement impossible');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-[#1B0B94] text-white hover:bg-[#130970]">
          <Plus className="size-4" />
          Ajouter un point
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {points.length === 0 ? (
        <p className="text-sm text-[#1a1510]/40 py-8 text-center">
          Aucun point de retrait. Cliquez sur « Ajouter un point » pour commencer.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200/50 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/50 text-left text-[10px] uppercase tracking-[0.12em] text-[#1a1510]/40">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Adresse</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Horaires</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Ordre</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, idx) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#1a1510]">{p.name}</td>
                  <td className="px-4 py-3 text-[#1a1510]/60">{p.address}</td>
                  <td className="px-4 py-3 text-[#1a1510]/60">{p.postal_code} {p.city}</td>
                  <td className="px-4 py-3 text-[#1a1510]/60">{p.hours ?? '—'}</td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-stone-50 text-stone-500 border-stone-200">Masqué</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Monter"
                        disabled={busy || idx === 0}
                        onClick={() => reorder(p.id, points[idx - 1].id)}
                        className="rounded p-1 text-[#1a1510]/40 hover:text-[#1B0B94] disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre"
                        disabled={busy || idx === points.length - 1}
                        onClick={() => reorder(p.id, points[idx + 1].id)}
                        className="rounded p-1 text-[#1a1510]/40 hover:text-[#1B0B94] disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        aria-label={p.is_active ? 'Masquer' : 'Activer'}
                        disabled={busy}
                        onClick={() => (p.is_active ? askHide(p) : activate(p))}
                        className="rounded p-1.5 text-[#1a1510]/50 hover:text-[#1B0B94] disabled:opacity-40"
                      >
                        {p.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Modifier"
                        disabled={busy}
                        onClick={() => openEdit(p)}
                        className="rounded p-1.5 text-[#1a1510]/50 hover:text-[#1B0B94] disabled:opacity-40"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PickupPointFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        point={editing}
        onSaved={() => router.refresh()}
      />

      <Dialog open={hideTarget !== null} onOpenChange={(o) => { if (!o) setHideTarget(null); }}>
        <DialogContent className="font-[family-name:var(--font-montserrat)]">
          <DialogHeader>
            <DialogTitle>Masquer ce point de retrait ?</DialogTitle>
            <DialogDescription className="text-[#1a1510]/70 leading-relaxed">
              {hideTarget?.name} sera retiré du choix au checkout, mais reste visible sur les commandes existantes.
              {hideCount !== null && hideCount > 0 && (
                <span className="mt-2 block font-medium text-[#B89547]">
                  ⚠ Référencé par {hideCount} commande{hideCount > 1 ? 's' : ''} historique{hideCount > 1 ? 's' : ''}. Le masquer ne supprime pas ces données.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHideTarget(null)} disabled={busy}>
              Annuler
            </Button>
            <Button onClick={confirmHide} disabled={busy} className="bg-[#1B0B94] text-white hover:bg-[#130970]">
              {busy ? 'Masquage…' : 'Masquer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

> Note réordonnancement : `busy` désactive les flèches pendant l'appel `reorder()` (anti double-clic). La prop `points` ne se met à jour qu'après `router.refresh()` (RSC), donc on s'appuie sur `busy` pour éviter deux swaps concurrents sur la même paire. Les bornes (`idx === 0`, `idx === points.length - 1`) protègent les accès `points[idx - 1]` / `points[idx + 1]`.

- [ ] **Step 7 — Implémenter la page RSC.** Créer `lolett-app/app/admin/pickup-points/page.tsx` :

```tsx
import { createAdminClient } from '@/lib/supabase/admin';
import { PickupPointsTable } from '@/components/admin/PickupPointsTable';
import type { PickupPointRow } from '@/components/admin/PickupPointFormModal';

async function getPickupPoints(): Promise<PickupPointRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('pickup_points')
    .select('*')
    .order('sort_order');
  return (data ?? []) as PickupPointRow[];
}

export default async function PickupPointsPage() {
  const points = await getPickupPoints();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">
          Points de retrait
        </h2>
        <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">
          Gérez vos boutiques partenaires Click &amp; Collect. Activez un point pour le rendre visible au checkout.
        </p>
      </div>

      <PickupPointsTable points={points} />
    </div>
  );
}
```

- [ ] **Step 8 — Vérification manuelle.** Lancer `npm run dev`, ouvrir `/admin/pickup-points`. Vérifier : (a) « Ajouter un point » ouvre la modale, création OK → la ligne apparaît, statut « Masqué » par défaut ; (b) l'icône œil active/masque (le masquage affiche d'abord la modale avec « Référencé par N commandes historiques » si la RPC retourne >0) ; (c) les flèches ↑/↓ réordonnent la liste après refresh ; (d) le crayon ré-ouvre la modale pré-remplie et l'édition persiste ; (e) aucun bouton de suppression n'est présent.

- [ ] **Step 9 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 10 — Commit de la page + table.**

```
git add lolett-app/app/admin/pickup-points/page.tsx lolett-app/components/admin/PickupPointsTable.tsx
git commit -m "feat(admin): page /admin/pickup-points (CRUD soft-delete + reorder + count)"
```

---

### Task 12: Page expédition — early return pour C&C + masquage du bouton

**Files:**
- Modify: `lolett-app/app/admin/orders/[id]/expedition/page.tsx` (insère un early return après L59)
- Modify: `lolett-app/app/admin/orders/[id]/page.tsx` (L127 condition du bouton expédition)

Pages RSC → **vérification manuelle** + type-check.

- [ ] **Step 1 — Early return dans la page expédition.** Dans `lolett-app/app/admin/orders/[id]/expedition/page.tsx`, après `const { order, items } = data;` (L59) et avant `const weight = estimateWeightGrams(items);` (L60), insérer :

```tsx
  // §7.5 — Click & Collect : aucune étiquette ni transporteur. Écran dédié.
  if (order.shipping_method === 'click_collect') {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="print:hidden">
          <Link
            href={`/admin/orders/${order.id}`}
            className="font-[family-name:var(--font-montserrat)] flex items-center gap-1.5 text-sm text-[#1a1510]/40 hover:text-[#B89547] transition-colors"
          >
            <ChevronLeft className="size-4" />
            Retour à la commande
          </Link>
        </div>
        <div className="rounded-xl border border-[#E8D9C4] bg-[#FFFBF7] p-8 text-center">
          <p className="font-[family-name:var(--font-newsreader)] text-2xl font-light text-[#1a1510]">
            Commande en retrait magasin
          </p>
          <p className="font-[family-name:var(--font-montserrat)] mt-3 text-sm text-[#1a1510]/70 leading-relaxed">
            Cette commande est en retrait magasin (Click &amp; Collect). Aucune étiquette ni transporteur n&rsquo;est nécessaire.
            Marquez-la « Prête au retrait » depuis la fiche commande pour générer le code et prévenir le client.
          </p>
        </div>
      </div>
    );
  }

```

> Note : `Link` et `ChevronLeft` sont déjà importés en tête de ce fichier (L2-3). `order.shipping_method` est typé `ShippingMethod | null` (L29) — le narrowing `=== 'click_collect'` dépend de l'élargissement PR2 (cf. Note de cadrage 15).

- [ ] **Step 2 — Masquer le bouton « Fiche d'expédition » pour C&C.** Dans `lolett-app/app/admin/orders/[id]/page.tsx`, remplacer la condition du bloc bouton (L127) :

```tsx
          {(order.status === 'paid' || order.status === 'confirmed') && (
```

par :

```tsx
          {(order.status === 'paid' || order.status === 'confirmed') && order.shipping_method !== 'click_collect' && (
```

- [ ] **Step 3 — Vérification manuelle.** Sur une commande C&C : (a) la fiche commande n'affiche PAS le bouton « Fiche d'expédition » ; (b) accéder directement à `/admin/orders/[id]/expedition` affiche l'écran « Commande en retrait magasin » au lieu de la fiche d'étiquette. Sur une commande `home`/`mondial_relay`, le bouton et la page d'expédition restent inchangés.

- [ ] **Step 4 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 5 — Commit.**

```
git add lolett-app/app/admin/orders/[id]/expedition/page.tsx lolett-app/app/admin/orders/[id]/page.tsx
git commit -m "feat(admin): page expédition Click & Collect (early return + bouton masqué)"
```

---

### Task 13: Page détail commande — timeline C&C, bloc point conditionnel, code de retrait

**Files:**
- Modify: `lolett-app/app/admin/orders/[id]/page.tsx` (L26-71 interface `OrderDetail`, L141 condition historique, L288-302 bloc livraison)

Page RSC → **vérification manuelle** + type-check.

- [ ] **Step 1 — Étendre l'interface `OrderDetail`.** Dans `lolett-app/app/admin/orders/[id]/page.tsx`, ajouter dans `interface OrderDetail` (après `delivered_at: string | null;` L60) :

```tsx
  ready_for_pickup_at: string | null;
  picked_up_at: string | null;
  pickup_code: string | null;
```

> Note : le selector Supabase utilise `.select('*')` (L76) qui récupère déjà toutes les colonnes — les nouvelles colonnes `ready_for_pickup_at` / `picked_up_at` / `pickup_code` (PR1) sont donc automatiquement présentes. Seul le typage TS doit être étendu (ci-dessus). Aucune modification du `select` n'est requise.

- [ ] **Step 2 — Étendre la condition d'affichage de l'historique.** Remplacer la condition du `Card` historique (L141) :

```tsx
      {(order.shipped_at || order.delivered_at || order.cancelled_at || order.refunded_at || order.disputed_at) && (
```

par :

```tsx
      {(order.shipped_at || order.delivered_at || order.cancelled_at || order.refunded_at || order.disputed_at || order.ready_for_pickup_at || order.picked_up_at) && (
```

Et ajouter, dans le `CardContent` de l'historique (après le bloc `delivered_at`, L153-157), les entrées C&C :

```tsx
            {order.ready_for_pickup_at && (
              <p className="text-[#1a1510]/70">
                <span className="font-medium text-[#1a1510]">Prête au retrait</span> — {formatDate(order.ready_for_pickup_at)}
                {order.pickup_code && <span className="text-[#1a1510]/50"> · Code {order.pickup_code}</span>}
              </p>
            )}
            {order.picked_up_at && (
              <p className="text-[#1a1510]/70">
                <span className="font-medium text-[#1a1510]">Retirée</span> — {formatDate(order.picked_up_at)}
              </p>
            )}
```

- [ ] **Step 3 — Bloc point de retrait conditionnel sur `provider` + code de retrait.** Dans le `Card` « Livraison », remplacer le bloc `{order.pickup_point && (...)}` (L288-302) par un affichage discriminé :

```tsx
          {order.pickup_point && order.pickup_point.provider === 'click_collect' && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-4">
              <p className="text-xs uppercase tracking-wider text-cyan-700 font-medium mb-2">
                Point de retrait Click &amp; Collect
              </p>
              <p className="font-medium text-[#1a1510]">{order.pickup_point.name}</p>
              <p className="text-[#1a1510]/70 mt-1">{order.pickup_point.address}</p>
              <p className="text-[#1a1510]/70">
                {order.pickup_point.postalCode} {order.pickup_point.city}
              </p>
              {order.pickup_point.hours && (
                <p className="text-[#1a1510]/60 mt-1 text-xs">Horaires : {order.pickup_point.hours}</p>
              )}
              {order.pickup_point.instructions && (
                <p className="text-[#1a1510]/60 mt-1 text-xs italic">{order.pickup_point.instructions}</p>
              )}
            </div>
          )}

          {order.pickup_point && order.pickup_point.provider === 'mondial_relay' && (
            <div className="rounded-lg border border-[#E8D9C4] bg-[#FFFBF7] p-4">
              <p className="text-xs uppercase tracking-wider text-[#B89547] font-medium mb-2">
                Point Relais à recopier dans le dashboard MR Pro
              </p>
              <p className="font-medium text-[#1a1510]">{order.pickup_point.name}</p>
              <p className="text-[#1a1510]/70 mt-1">{order.pickup_point.address}</p>
              <p className="text-[#1a1510]/70">
                {order.pickup_point.postalCode} {order.pickup_point.city} · {order.pickup_point.country}
              </p>
              <p className="mt-2 font-mono text-xs text-[#1a1510]/60">
                ID: <span className="text-[#1a1510]">{order.pickup_point.id}</span>
              </p>
            </div>
          )}

          {order.pickup_code && order.shipping_method === 'click_collect' && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="text-xs uppercase tracking-wider text-amber-700 font-medium mb-1">
                Code de retrait à présenter
              </p>
              <p className="font-mono text-2xl tracking-[0.2em] text-[#1a1510] select-all">
                {order.pickup_code}
              </p>
              <p className="text-xs text-[#1a1510]/50 mt-1">
                Le client a reçu ce code par email. Sélectionnez-le pour le copier.
              </p>
            </div>
          )}
```

> Note de narrowing : le narrowing `order.pickup_point.provider === 'click_collect'` permet à TypeScript d'accéder à `hours` / `instructions` (présents uniquement sur `ClickCollectPickupPoint`, cf. union discriminée PR2). Le bloc `mondial_relay` accède à `country` / `id` (présents sur les deux variantes via `BasePickupPoint`). Dépend de l'union discriminée PR2 (cf. Note de cadrage 4).

- [ ] **Step 4 — Vérification manuelle.** Sur une commande C&C au statut `ready_for_pickup` : (a) l'historique affiche « Prête au retrait — [date] · Code LOL-XXXXX » ; (b) le bloc livraison affiche « Point de retrait Click & Collect » avec horaires/instructions ; (c) l'encadré ambre « Code de retrait à présenter » affiche le code en monospace, sélectionnable. Sur une commande `mondial_relay`, le bloc « Point Relais à recopier… » reste affiché, sans encadré code.

- [ ] **Step 5 — Type-check.**

```
npm run type-check
```

Sortie attendue : aucune erreur.

- [ ] **Step 6 — Commit.**

```
git add lolett-app/app/admin/orders/[id]/page.tsx
git commit -m "feat(admin): fiche commande Click & Collect (timeline, point, code de retrait)"
```

---

### Task 14: Documentation utilisateur Lola (§17)

**Files:**
- Create: `lolett-app/docs/click-collect-guide-lola.md`

> Avant d'écrire la section « Personnaliser l'email », **vérifier la forme des variables réellement affichées par `/admin/emails` (PR3)** : ouvrir `VARIABLES_BY_TEMPLATE.order_ready_for_pickup` (livré par PR3). Si PR3 affiche les variables en **simple accolade** (`{firstName}`, etc.), aligner la doc en simple accolade. Si PR3 les affiche en **double accolade** (`{{firstName}}`), garder le double. `interpolate()` supporte les deux (cf. `lib/email/order-refunded.ts` L14-16), mais la doc Lola DOIT refléter exactement ce que l'UI montre à l'utilisatrice. Le guide ci-dessous utilise la double accolade `{{...}}` par défaut (cohérent avec le seed corrigé en `{{var}}`) — à confirmer/ajuster contre PR3.

- [ ] **Step 1 — Écrire le guide.** Créer `lolett-app/docs/click-collect-guide-lola.md` :

```markdown
# Click & Collect — Guide d'utilisation (Lola)

Le Click & Collect permet à une cliente de commander en ligne et de venir récupérer
sa commande dans l'une de tes boutiques partenaires. Le fonctionnement est manuel :
tu reçois la commande, tu la relaies au point de vente, puis tu suis l'avancée depuis
ton espace admin.

## Ajouter un point de retrait

1. Va dans **Admin → Gestion → Points de retrait** (`/admin/pickup-points`).
2. Clique sur **« Ajouter un point »**.
3. Remplis le nom de la boutique, l'adresse, le code postal, la ville.
   Les horaires et les instructions de retrait sont optionnels (mais conseillés —
   ils apparaissent dans l'email envoyé à la cliente).
4. Clique sur **« Créer »**. Le point est créé **masqué** par défaut.
5. Quand tu es prête, clique sur l'icône **œil** dans la liste pour l'**activer** :
   il devient alors visible au moment du paiement, côté boutique.

> Astuce : tant qu'un point est « Masqué », personne ne peut le choisir au checkout.
> C'est volontaire : tu actives tes points seulement quand tout est prêt.

## Réordonner les points

Les flèches **↑ / ↓** dans la colonne « Ordre » changent l'ordre d'affichage des points
dans le sélecteur de la cliente. Le premier de la liste apparaît en haut.

## Traiter une commande Click & Collect

1. Va dans **Admin → Commandes**. Utilise le filtre **« Mode de livraison » → Retrait
   en boutique**, ou la carte **« À retirer »** du tableau de bord, pour repérer les
   commandes concernées.
2. Ouvre la commande. Tu y vois le point de retrait choisi par la cliente.
3. **Relaie manuellement la commande au point de vente partenaire** (téléphone, email…).
4. Quand le point a la commande en main, clique sur **« Marquer prête au retrait »**
   puis **« Enregistrer »**.
   → Un **code de retrait** unique (format `LOL-XXXXX`) est généré et **envoyé à la
   cliente par email**. Ce code s'affiche aussi sur la fiche commande (encadré ambre).
5. Quand le point confirme que la cliente est venue récupérer sa commande, clique sur
   **« Marquer retirée »** puis **« Enregistrer »**. Aucun email n'est envoyé à cette
   étape — c'est juste pour ton suivi.

> Les commandes Click & Collect ne passent jamais par « Expédiée » / « Livrée » :
> il n'y a pas de transporteur ni d'étiquette. La page d'expédition affiche un message
> dédié pour ces commandes.

## Désactiver / masquer un point

- Dans la liste, clique sur l'icône **œil barré** d'un point actif.
- Une fenêtre te prévient s'il est **référencé par des commandes historiques** :
  le masquer ne supprime jamais ces données, les anciennes commandes gardent leur point.
- Le point disparaît du choix au checkout mais reste consultable sur les commandes passées.

> Il n'y a pas de bouton « Supprimer » : on masque toujours, jamais on n'efface,
> pour ne pas casser l'historique de tes commandes.

## La cliente n'est pas venue récupérer sa commande

1. Ouvre la commande.
2. Pour rembourser : utilise **« Rembourser via Stripe »** (remboursement automatique).
   Ce bouton fonctionne aussi quand la commande est au statut « Prête au retrait ».
3. Tu peux aussi passer la commande en **« Annulée »** (cela ne rembourse pas tout seul —
   pense à rembourser via Stripe si la cliente avait payé).

## Personnaliser l'email « Prête au retrait »

Va dans **Admin → Gestion → Emails**, template **« Commande prête au retrait »**.
Tu peux modifier l'objet, le message d'accueil et le texte. Les variables disponibles
sont `{{firstName}}`, `{{orderNumber}}`, `{{pickupCode}}`, `{{pickupPointName}}`.
L'aperçu utilise des données d'exemple (cliente Marie, code `LOL-A7K2X`).
```

- [ ] **Step 2 — Vérification manuelle.** Ouvrir le fichier et relire : chaque étape correspond à un élément réel de l'UI livrée (sidebar « Points de retrait », filtre « Mode de livraison », carte « À retirer », boutons « Marquer prête au retrait » / « Marquer retirée », encadré code, modale de masquage avec count, bouton « Rembourser via Stripe » actif sur `ready_for_pickup` grâce à Task 4bis). Pas de fonctionnalité décrite qui n'existe pas. Confirmer la forme des variables (`{{...}}` vs `{...}`) contre `/admin/emails` (PR3) et ajuster si besoin.

- [ ] **Step 3 — Commit.**

```
git add lolett-app/docs/click-collect-guide-lola.md
git commit -m "docs(admin): guide Click & Collect pour Lola"
```

---

## Vérification finale PR4

- [ ] **Type-check vert** : `npm run type-check` (depuis `lolett-app/`) ne remonte aucune erreur. En particulier : aucun `any`, narrowing correct sur `pickup_point.provider`, `z.enum(MANUAL_STATUS_VALUES)` bien typé en tuple non vide, `REFUNDABLE_STATUSES.includes(status as OrderStatus)` valide aux deux endroits (route + dialog), `ShippingMethod`/`ShippingCarrier` importés dans le PATCH (Task 4, 3a).
- [ ] **Tests verts** : `npm run test` passe. Les 6 nouveaux fichiers de tests d'intégration/unitaires passent :
  - `__tests__/api/admin-pickup-points.test.ts` (GET liste `{pickupPoints}` incl. inactifs ; POST init `sort_order = MAX+10` et `=10` si vide ; 400 invalide ; 401 non auth).
  - `__tests__/api/admin-pickup-points-id.test.ts` (GET `{pickupPoint}` / 404 ; PATCH map `isActive→is_active`, 400 invalide).
  - `__tests__/api/admin-pickup-points-reorder.test.ts` (swap `sort_order`, 404 si id inconnu, 400 si champ manquant, 400 si `fromId === toId`).
  - `__tests__/api/admin-pickup-points-usage.test.ts` (401 ; RPC `count_orders_with_pickup_point` → `{count}` ; count=0 si null) — couvre A7.
  - `__tests__/api/admin-orders-patch-click-collect.test.ts` (rejet transition non autorisée 400 ; refus `ready_for_pickup` sans point C&C valide 400 ; refus provider != click_collect 400 ; succès → `assignPickupCodeAtomic` appelé + email mocké ; échec génération → 500 + Sentry ; `picked_up` → `picked_up_at` posé + aucun email).
  - `__tests__/api/admin-orders-refund-ready-for-pickup.test.ts` (refund `commercial_gesture` accepté depuis `ready_for_pickup` — décision D2 / A9).
  - `__tests__/admin/order-status-badge.test.tsx` (labels centralisés `ready_for_pickup` / `picked_up`, fallback statut brut).
- [ ] **Lint + type-check** : `npm run validate` passe (pas de styles inline, imports en alias `@/`).
- [ ] **Scénarios du spec couverts** :
  - A2 (Lola voit la commande : bouton « Marquer prête au retrait » visible, page expédition masquée) → Tasks 6 + 12.
  - A3 (`status=ready_for_pickup`, `ready_for_pickup_at` posé, `pickup_code` généré, email parti) → Task 4 + Task 13 (affichage).
  - A4 (`status=picked_up`, `picked_up_at` posé, aucun email) → Task 4.
  - A7 (Lola désactive un point référencé par N commandes : modale « Référencé par N commandes historiques », toggle `is_active=false`) → Tasks 1/2 + Task 11 (modale + RPC `usage`).
  - A9 (cliente C&C non venue : refund accepté depuis `ready_for_pickup` côté API ET bouton « Rembourser via Stripe » non grisé) → Task 4bis (décision D2).
  - Refactor §7.4 (Badge / Filters / Charts / Stats + widget « À retirer ») → Tasks 5/7/8.
  - §9.4 (skip net email shipped pour C&C) → Task 4 (3e).
  - §17 (doc Lola) → Task 14.
- [ ] **Aucun secret** dans les diffs (pas de clé API / `.env`).
- [ ] **Co-déploiement PR5 confirmé** : ne pas merger PR4 seule en prod sans PR5 (cf. spec §11). `pickup_points.is_active DEFAULT FALSE` (PR1) protège, mais l'UI client de sélection (PR5) doit être présente pour que les points actifs servent à quelque chose. À valider avec Lyes avant déploiement.

---

## Lien avec les autres PRs

- **Dépend de PR1** (DB) : table `pickup_points`, colonnes `ready_for_pickup_at` / `picked_up_at` / `pickup_code` + index unique partiel, CHECK statuts à 13 valeurs, RPC `count_orders_with_pickup_point`, seed email `order_ready_for_pickup` (en `{{var}}` + signoff `♥`). Toutes ces fondations sont consommées par PR4 (routes, page admin, PATCH, RPC `usage`).
- **Dépend de PR2** (types & constantes) : `ORDER_STATUS_VALUES` / `ORDER_STATUS_LABELS` / `ORDER_STATUS_COLORS` / `ORDER_STATUS_TRANSITIONS` / `STRIPE_MANAGED_STATUSES` / `REFUNDABLE_STATUSES` (inclut `ready_for_pickup`) / `ORDER_STEPS_HOME` / `ORDER_STEPS_PICKUP` / `SHIPPING_METHODS` (avec `click_collect`) (`@/lib/constants`), `SHIPPING_METHOD_VALUES` (`@/lib/types/domain`), union discriminée `PickupPoint` par `provider`, type `ShippingMethod`/`ShippingCarrier`/`OrderStatus` (`@/types`). **État actuel vérifié** : aucun de ces symboles n'existe encore (`lib/constants.ts` n'exporte que les constantes livraison ; `types/index.ts` L83 `ShippingMethod = 'home' | 'mondial_relay'` ; `PickupPoint` L87-96 n'est PAS encore une union discriminée — pas de `provider`). PR2 DOIT être mergée avant PR4, sinon tous les `=== 'click_collect'`, `SHIPPING_METHODS[...]`, `REFUNDABLE_STATUSES` importé, et l'accès `pickup_point.provider` sont des erreurs TS. PR4 refactore ensuite les composants admin pour consommer ces constantes (suppression des maps locales dupliquées).
- **Dépend de PR3** (helpers backend & email) : `assignPickupCodeAtomic` (`@/lib/orders/pickup-code`) et `sendOrderReadyForPickupEmail` (`@/lib/email/order-ready-for-pickup`), utilisés par le PATCH (Task 4). **Décision D1** : la signature de `sendOrderReadyForPickupEmail` accepte `pickupPoint: PickupPoint | null` (guard interne sur `provider`), ce qui permet à PR4 de passer `updatedOrder.pickup_point` sans cast. Le template `order-ready-for-pickup` et les branches CMS preview/test sont livrés par PR3 (la personnalisation de l'email dans `/admin/emails` référencée par la doc Lola Task 14 fonctionne grâce à PR3 ; vérifier la forme des variables affichées). **État actuel vérifié** : `lib/orders/pickup-code.ts` et `lib/email/order-ready-for-pickup.ts` n'existent pas encore (livrés par PR3).
- **Co-déploiement obligatoire avec PR5** (UI client + Stripe + facture) : PR4 donne à Lola les outils pour créer/activer des points et traiter les commandes ; PR5 ajoute le choix Click & Collect au checkout (`ShippingMethodSelect`, `ClickCollectPicker`) et la validation serveur Stripe (§10.2). **Décision D3** : le webhook (PR5) lit `pickup_points` via `.maybeSingle()` (pas `.single()`), convention partagée avec les mocks PR6. **Décision D4** : la branche transitions C&C du PATCH est dans PR4 (pas PR5) ; PR5 n'y touche pas. **Décision D5** : `metadata.pickup_point_id` + `metadata.pickup_provider` sont des clés plates snake_case posées au checkout (PR5), distinctes du snapshot JSON `pickup_point` camelCase. Déployer PR4 sans PR5 exposerait des points actifs via l'API publique Supabase mais invisibles côté client (mitigé par `is_active DEFAULT FALSE`, mais à ne pas laisser durer).
- **Précède PR6** (E2E + edge cases) : les parcours Playwright (admin marque `ready_for_pickup` → email avec code → `picked_up`) et les cas limites (désactivation d'un point mid-order, refund sur `ready_for_pickup`) s'appuient sur l'UI admin et le workflow livrés ici. PR6 attribue A3/A4 à PR4 (décision D4) et A9 à PR4 (décision D2).
