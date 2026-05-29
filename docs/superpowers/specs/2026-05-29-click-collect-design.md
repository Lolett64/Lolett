# Click & Collect — Design

**Date** : 2026-05-29
**Status** : Spec validée par Lyes, prête pour passage en plan d'implémentation
**Auteur** : Lyes + Claude Opus 4.7
**Branch cible** : `main` (à brancher en feature branches successives, cf. §10)
**Lien commercial** : proposition "Option 1 — Artisanale, 300€ / 5 jours ouvrés" envoyée à Lola

---

## 1. Contexte & objectif

Lola souhaite proposer un mode de livraison **Click & Collect** : le client choisit au checkout l'un des 3 points de retrait partenaires (boutiques en France), paie en ligne, puis va récupérer sa commande sur place.

Le fonctionnement est **artisanal** : Lola reçoit la notification de commande, relaie manuellement au point de vente, qui lui confirme le retrait. Aucun système de scan ou d'intégration tierce avec les points partenaires.

La fonctionnalité s'intègre dans le tunnel existant à côté de **Domicile** (Colissimo) et **Mondial Relay**, et réutilise au maximum les briques déjà déployées (table `orders`, snapshot JSONB `pickup_point`, CMS `email_settings`, workflow admin, facture PDF).

---

## 2. Périmètre

### 2.1 Inclus
- Choix Click & Collect au checkout, gating **France uniquement** (les 3 points sont en France)
- Sélection d'un des points actifs depuis une UI dédiée (composant `ClickCollectPicker`)
- CRUD admin des points de retrait (`/admin/pickup-points`) éditable par Lola
- Workflow admin C&C : statuts `ready_for_pickup` + `picked_up` + transitions + timestamps
- Génération d'un **code de retrait** unique (format `LOL-XXXXX`) à la transition `ready_for_pickup`
- 3 emails transactionnels : confirmation modifiée, notif admin modifiée, **nouveau template "Prête au retrait"** avec code
- Adaptation facture PDF, page de succès checkout, espace client `/compte/commandes/[id]`
- Validation serveur stricte (anti-DevTools) + observabilité Sentry + KPIs monitoring

### 2.2 Exclus (V1)
- Système de scan QR-code ou app dédiée pour les points partenaires
- Intégration API tierce avec les boutiques partenaires
- Notifications SMS (email uniquement)
- Adresse de livraison facultative en mode C&C (le formulaire reste complet et obligatoire)
- Cron auto-expiration des commandes non retirées (peut être ajouté en V2)

---

## 3. Décisions structurantes (validées en brainstorming)

| Décision | Choix | Raison |
|---|---|---|
| Stockage des points | **Base + écran admin** | Lola édite sans dev. Cohérent avec les autres CMS du site. |
| Éligibilité | **France uniquement** | Les 3 points sont en France. Gating UI + validation serveur. |
| Coût C&C | **Gratuit (0€)** | Argument de vente classique. |
| Adresse client en C&C | **Complète et obligatoire (inchangé)** | Moins de risque de régression. Facture PDF reste légale. |
| Statuts dédiés | **`ready_for_pickup` + `picked_up`** | Workflow propre, distinct de `shipped` / `delivered`. |
| Emails | **1 nouveau template** ("Prête au retrait") + adaptation conditionnelle des 2 templates existants (`order_confirmation`, `order_new_admin`) | L'email "Expédiée" n'est **jamais** envoyé pour C&C. |
| Schéma `pickup_point` | **Snapshot JSONB avec discriminant `provider`** | Réutilise la colonne existante (Mondial Relay), préserve l'historique si Lola modifie/supprime un point. |
| Code de retrait | **Code court aléatoire** `LOL-XXXXX` (5 chars, alphabet 32 chars sans 0/O/1/I) | Évite les retraits frauduleux, lisible. Généré atomiquement à la transition. |

---

## 4. Design — Base de données

### 4.1 Nouvelle table `pickup_points`

```sql
-- Migration: 20260530000001_pickup_points.sql

CREATE TABLE pickup_points (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  address       text NOT NULL,
  postal_code   text NOT NULL,
  city          text NOT NULL,
  country       text NOT NULL DEFAULT 'FR',
  hours         text,
  instructions  text,
  is_active     boolean NOT NULL DEFAULT false,   -- défaut FALSE pour soft-launch (cf. §10.3)
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pickup_points_active_sort ON pickup_points (is_active, sort_order);

CREATE TRIGGER pickup_points_set_updated_at
  BEFORE UPDATE ON pickup_points
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pickup_points_public_select_active"
  ON pickup_points FOR SELECT
  USING (is_active = true);

CREATE POLICY "pickup_points_service_role_all"
  ON pickup_points FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE pickup_points IS
  'Points de retrait Click & Collect. CRUD via /admin/pickup-points (service role). Lecture publique limitée à is_active=true.';
COMMENT ON COLUMN pickup_points.is_active IS
  'Soft-delete : false = masqué côté public, snapshots historiques dans orders.pickup_point préservés.';
COMMENT ON COLUMN pickup_points.sort_order IS
  'Ordre d''affichage croissant dans le sélecteur checkout. Init par pas de 10 à la création (max+10).';
```

### 4.2 Extensions sur `orders`

```sql
-- Migration: 20260530000002_orders_click_collect.sql

-- 1. CHECK constraint statuts (DROP + ADD pattern cf. 20260429000001)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending', 'paid', 'confirmed',
    'shipped', 'delivered',
    'ready_for_pickup', 'picked_up',
    'cancelled', 'refunded', 'partially_refunded', 'disputed',
    'expired', 'payment_review'
  ));

-- 2. Timestamps workflow C&C (symétrie avec shipped_at, delivered_at)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS ready_for_pickup_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at        timestamptz;

-- 3. Code de retrait + index UNIQUE PARTIAL (pour retry atomique)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_code text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pickup_code_unique
  ON orders (pickup_code) WHERE pickup_code IS NOT NULL;

-- 4. CHECK constraints défensives sur shipping_method et shipping_carrier
ALTER TABLE orders ADD CONSTRAINT orders_shipping_method_check
  CHECK (shipping_method IS NULL OR shipping_method IN ('home', 'mondial_relay', 'click_collect'));
ALTER TABLE orders ADD CONSTRAINT orders_shipping_carrier_check
  CHECK (shipping_carrier IS NULL OR shipping_carrier IN ('colissimo', 'mondial_relay', 'click_collect'));

-- 5. Index GIN sur pickup_point->id (pour count_orders_with_pickup_point)
CREATE INDEX IF NOT EXISTS idx_orders_pickup_point_id
  ON orders USING GIN ((pickup_point -> 'id'));

-- 6. Commentaires
COMMENT ON COLUMN orders.shipping_method IS 'home | mondial_relay | click_collect';
COMMENT ON COLUMN orders.shipping_carrier IS 'colissimo | mondial_relay | click_collect';
COMMENT ON COLUMN orders.pickup_point IS
  'Snapshot JSONB du point sélectionné. Forme : { id, name, address, postalCode, city, country, hours, instructions, provider }. provider = "mondial_relay" | "click_collect".';
COMMENT ON COLUMN orders.ready_for_pickup_at IS 'Auto-posé par PATCH admin sur transition ready_for_pickup.';
COMMENT ON COLUMN orders.picked_up_at IS 'Auto-posé par PATCH admin sur transition picked_up.';
COMMENT ON COLUMN orders.pickup_code IS
  'Code court aléatoire LOL-XXXXX (5 chars alphanumériques, alphabet 32 chars excluant 0/O/1/I). Généré atomiquement à la transition ready_for_pickup.';
```

### 4.3 RPC `count_orders_with_pickup_point`

```sql
CREATE OR REPLACE FUNCTION count_orders_with_pickup_point(point_id text)
RETURNS int LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM orders WHERE pickup_point->>'id' = point_id;
$$;

REVOKE EXECUTE ON FUNCTION count_orders_with_pickup_point(text) FROM public, anon, authenticated;
GRANT  EXECUTE ON FUNCTION count_orders_with_pickup_point(text) TO service_role;
```

Utilisée par l'UI admin pour afficher dans la modale d'édition d'un point : *"⚠ Référencé par N commandes historiques. Le masquer ne supprime pas ces données."*

### 4.4 Seed `email_settings` pour le nouveau template

```sql
-- Migration: 20260530000003_seed_email_settings_ready_for_pickup.sql

INSERT INTO email_settings (
  template_key, label, from_name, from_email,
  subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params
) VALUES (
  'order_ready_for_pickup',
  'Commande prête au retrait',
  'LOLETT',
  'bonjour@lolettshop.com',
  'Votre commande {orderNumber} est prête au retrait — code {pickupCode}',
  'Bonne nouvelle, {firstName} ✨',
  'Votre commande vous attend au point de retrait choisi. Présentez le code ci-dessous au point de vente.',
  '', '',  -- pas de CTA (cohérent avec design template focus code+point)
  'Avec amour, LOLETT ♡',
  '{}'::jsonb
) ON CONFLICT (template_key) DO NOTHING;
```

### 4.5 Workflow des statuts

```
Livraison classique :
  pending → paid → confirmed → shipped → delivered
                     ↓
                 cancelled / refunded / partially_refunded / disputed

Click & Collect :
  pending → paid → confirmed → ready_for_pickup → picked_up  (terminal)
                     ↓                ↓
                 cancelled        cancelled
                     ↓                ↓
                 refunded         refunded
```

Les commandes C&C ne passent **jamais** par `shipped` / `delivered`. `picked_up` est terminal (sauf `refunded`/`partially_refunded`/`disputed` posés par les webhooks Stripe).

---

## 5. Design — Types & constantes

### 5.1 Nouveau fichier neutre `lib/types/domain.ts`

Brise le cycle d'imports potentiel (`constants.ts` importait déjà depuis `types/index.ts`) :

```ts
// lolett-app/lib/types/domain.ts

export const ORDER_STATUS_VALUES = [
  'pending', 'paid', 'confirmed',
  'shipped', 'delivered',
  'ready_for_pickup', 'picked_up',
  'cancelled', 'refunded', 'partially_refunded', 'disputed',
  'expired', 'payment_review',
] as const;
export type OrderStatus = typeof ORDER_STATUS_VALUES[number];

export const SHIPPING_METHOD_VALUES = ['home', 'mondial_relay', 'click_collect'] as const;
export type ShippingMethod = typeof SHIPPING_METHOD_VALUES[number];

export const SHIPPING_CARRIER_VALUES = ['colissimo', 'mondial_relay', 'click_collect'] as const;
export type ShippingCarrier = typeof SHIPPING_CARRIER_VALUES[number];

export const SHIPPING_COUNTRY_CODES = ['FR', 'BE', 'LU', 'NL', 'ES', 'PT'] as const;
export type ShippingCountryCode = typeof SHIPPING_COUNTRY_CODES[number];

export type PickupPointProvider = 'mondial_relay' | 'click_collect';
```

### 5.2 `PickupPoint` en union discriminée

```ts
// lolett-app/types/index.ts

interface BasePickupPoint {
  id: string; name: string; address: string;
  postalCode: string; city: string; country: string;
}

export interface MondialRelayPickupPoint extends BasePickupPoint {
  provider: 'mondial_relay';
  lat?: number; lng?: number;
}

export interface ClickCollectPickupPoint extends BasePickupPoint {
  provider: 'click_collect';
  hours?: string | null;
  instructions?: string | null;
}

export type PickupPoint = MondialRelayPickupPoint | ClickCollectPickupPoint;
```

**Compatibilité ascendante** : les snapshots Mondial Relay historiques sans `provider` sont backfillés par le mapper Supabase :

```ts
function mapPickupPoint(raw: unknown, shippingMethod: ShippingMethod | null): PickupPoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const point = raw as Record<string, unknown>;
  const provider: PickupPointProvider = (point.provider as PickupPointProvider | undefined)
    ?? (shippingMethod === 'click_collect' ? 'click_collect' : 'mondial_relay');
  return { ...point, provider } as PickupPoint;
}
```

### 5.3 `lib/constants.ts` (centralisation source de vérité)

```ts
import {
  ORDER_STATUS_VALUES, type OrderStatus,
  SHIPPING_METHOD_VALUES, type ShippingMethod, type ShippingCarrier, type ShippingCountryCode,
} from '@/lib/types/domain';

// Labels harmonisés FR au féminin (cohérent avec "commande")
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

// Couleurs unifiées (hex pour Recharts, tw partiel + complet pour Tailwind)
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

// Statuts éligibles à un refund Stripe depuis l'admin
export const REFUNDABLE_STATUSES: OrderStatus[] = [
  'paid', 'confirmed', 'shipped', 'delivered',
  'ready_for_pickup',                  // C&C : client paye, ne vient pas
  'partially_refunded',
];

// Étapes parcours timeline (UI client + admin workflow viz)
export const ORDER_STEPS_HOME   = ['pending', 'confirmed', 'paid', 'shipped', 'delivered'] as const;
export const ORDER_STEPS_PICKUP = ['pending', 'confirmed', 'paid', 'ready_for_pickup', 'picked_up'] as const;

// Méthodes de livraison
export const SHIPPING_METHODS: Record<ShippingMethod, { id: ShippingMethod; label: string; carrier: ShippingCarrier }> = {
  home:          { id: 'home',          label: 'Livraison à domicile',                  carrier: 'colissimo' },
  mondial_relay: { id: 'mondial_relay', label: 'Point Relais Mondial Relay',            carrier: 'mondial_relay' },
  click_collect: { id: 'click_collect', label: 'Retrait en boutique (Click & Collect)', carrier: 'click_collect' },
};

// Dérivé dynamiquement — single source pour la validation Stripe
export const VALID_SHIPPING_METHODS = Object.keys(SHIPPING_METHODS) as ShippingMethod[];

// Tarifs — click_collect UNIQUEMENT dans la zone FR (sécurité serveur)
export const SHIPPING_RATES: Record<ShippingZone, Partial<Record<ShippingMethod, number>>> = {
  FR:      { home: 5.90,  mondial_relay: 4.50, click_collect: 0 },
  BENELUX: { home: 9.90,  mondial_relay: 7.90 },                   // pas de click_collect
  IBERIA:  { home: 12.90, mondial_relay: 9.90 },                   // pas de click_collect
};

export function computeShippingCost(
  subtotal: number, country: ShippingCountryCode, method: ShippingMethod
): number {
  // Garde sécurisée — Click & Collect FR-only au niveau code
  if (method === 'click_collect') {
    if (country !== 'FR') {
      throw new Error('Click & Collect est disponible uniquement en France');
    }
    return 0;
  }
  // ... logique existante (seuil free shipping etc.)
}

export function getTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string | null {
  if (carrier === 'click_collect') return null;
  // ... existant
}
```

### 5.4 `types/index.ts` épuré

```ts
export type {
  OrderStatus, ShippingMethod, ShippingCarrier, ShippingCountryCode,
  PickupPointProvider,
} from '@/lib/types/domain';

// PickupPoint comme union discriminée (cf. §5.2)
// Order interface ajoute :
//   readyForPickupAt?: string;
//   pickedUpAt?: string;
//   pickupCode?: string | null;
```

### 5.5 Cart store défensif (Zustand v3)

```ts
// features/cart/store.ts
import { VALID_SHIPPING_METHODS } from '@/lib/constants';

setShippingMethod: (method) => set((state) => ({
  shippingMethod: method,
  // Reset TOUJOURS au changement (évite résidu MR↔C&C)
  pickupPoint: state.shippingMethod !== method ? null : state.pickupPoint,
})),

persist(/* ... */, {
  name: 'lolett-cart',
  version: 3,
  migrate: (persisted: any, version) => {
    // v1/v2 → v3 : backfill provider sur anciens pickupPoint
    if (version < 3 && persisted?.pickupPoint && !persisted.pickupPoint.provider) {
      persisted.pickupPoint.provider = 'mondial_relay'; // legacy = MR
    }
    // Reset si shippingMethod invalide (revert deployment, ancien cookie)
    if (persisted && !VALID_SHIPPING_METHODS.includes(persisted.shippingMethod)) {
      persisted.shippingMethod = 'home';
      persisted.pickupPoint = null;
    }
    return persisted;
  },
}),
```

---

## 6. Design — UI client

### 6.1 `ShippingMethodSelect` — 3 options + gating FR

```tsx
const allOptions = [
  { id: 'home',          label: SHIPPING_METHODS.home.label,          icon: <Truck />,  description: 'À votre adresse, par Colissimo' },
  { id: 'mondial_relay', label: SHIPPING_METHODS.mondial_relay.label, icon: <MapPin />, description: 'Retrait dans un point relais' },
  { id: 'click_collect', label: SHIPPING_METHODS.click_collect.label, icon: <Store />,  description: 'Retrait gratuit en boutique partenaire', restrictTo: ['FR'] },
];

// Mémoïser pour éviter les re-renders
const filteredOptions = useMemo(
  () => allOptions.filter(o => !o.restrictTo || o.restrictTo.includes(country)),
  [country]
);

// Reset auto si la méthode actuelle n'est plus disponible (changement de pays)
useEffect(() => {
  if (method !== 'home' && !filteredOptions.find(o => o.id === method)) {
    setMethod('home');
  }
}, [filteredOptions, method, setMethod]);
```

**Accessibilité** : container `role="radiogroup"` + `aria-label`, chaque option `role="radio"` + `aria-checked`.

### 6.2 Nouveau composant `ClickCollectPicker`

`'use client'`. `useEffect` fetch via le client Supabase **anon** (la policy RLS filtre automatiquement `is_active=true`). Liste de boutons avec nom, adresse, horaires, instructions. Au clic, construit un `ClickCollectPickupPoint` avec `provider: 'click_collect'` et appelle `setPickupPoint()` du store.

`useEffect([country])` : reset `pickupPoint` si le pays change. Container `aria-live="polite"` pour les états loading/error/empty.

### 6.3 Branchement dans `CheckoutForm`

```tsx
{shippingMethod === 'mondial_relay' && <MondialRelayWidget ... />}
{shippingMethod === 'click_collect' && <ClickCollectPicker />}
```

Strict mutex.

**Cleanup `MondialRelayWidget`** : `useRef(isMounted)` qui ignore `OnParcelShopSelected` après démontage + cleanup function qui appelle `jQuery(container).empty().removeData()` et détruit la map Leaflet. Évite qu'un callback orphelin écrase un point C&C déjà sélectionné.

### 6.4 `useCheckout` — validation + payload

```ts
const requiresPickupPoint = shippingMethod === 'mondial_relay' || shippingMethod === 'click_collect';

// Validation
if (requiresPickupPoint && !pickupPoint) {
  errors.pickupPoint = 'Merci de sélectionner un point de retrait';
}

// Payload
{ ...payload, pickupPoint: requiresPickupPoint ? pickupPoint : null }
```

### 6.5 Page `/checkout/success` et `/compte/commandes/[id]`

Affichage conditionnel via narrowing sur `provider` :

```tsx
{order.shippingMethod === 'click_collect' && order.pickupPoint?.provider === 'click_collect' ? (
  <SectionBlock title="Point de retrait">
    <p className="font-medium">{order.pickupPoint.name}</p>
    <p>{order.pickupPoint.address}, {order.pickupPoint.postalCode} {order.pickupPoint.city}</p>
    {order.pickupPoint.hours && <p><Clock /> {order.pickupPoint.hours}</p>}
    {order.pickupPoint.instructions && <p className="italic">{order.pickupPoint.instructions}</p>}
    {order.pickupCode && (
      <div className="mt-3 p-3 bg-amber-50 border-l-2 border-amber-400">
        <span className="text-xs uppercase tracking-wider">Code à présenter</span>
        <p className="font-mono text-lg tracking-widest">{order.pickupCode}</p>
      </div>
    )}
  </SectionBlock>
) : order.shippingMethod === 'mondial_relay' && order.pickupPoint?.provider === 'mondial_relay' ? (
  /* Bloc MR existant */
) : (
  /* Adresse client */
)}
```

**Timeline** côté client : `const steps = (order.shippingMethod ?? 'home') === 'click_collect' ? ORDER_STEPS_PICKUP : ORDER_STEPS_HOME`. Fallback pour commandes legacy sans `shipping_method`.

---

## 7. Design — UI admin

### 7.1 Sidebar : nouvelle entrée `/admin/pickup-points` (icône `Store`).

### 7.2 Page `/admin/pickup-points`

Tableau : nom, adresse, ville, horaires, statut (Actif/Masqué), ordre (↑/↓), actions (toggle `is_active`, edit). **Pas de bouton DELETE** — soft-delete pur via `is_active`. Bouton "Ajouter un point" → modal `PickupPointFormModal`.

### 7.3 Routes API admin

```
GET    /api/admin/pickup-points              → { pickupPoints }   (incl. inactifs)
GET    /api/admin/pickup-points/[id]         → { pickupPoint }
POST   /api/admin/pickup-points              → { pickupPoint }    (créé avec sort_order = MAX+10)
PATCH  /api/admin/pickup-points/[id]         → { pickupPoint }
POST   /api/admin/pickup-points/reorder      → { pickupPoints }   (body: { fromId, toId } pattern Materials)
```

Pattern auth : `checkAdminCookieFromRequest()` en premier + `createAdminClient()` + Zod `safeParse` avec `{ error, details: parsed.error.flatten() }` en cas d'erreur 400.

Avant d'afficher la modale "Masquer", appel à `supabase.rpc('count_orders_with_pickup_point', { point_id })` pour afficher *"Référencé par N commandes historiques"*.

### 7.4 Composants admin existants refactorisés

| Composant | Refactor |
|---|---|
| `OrderStatusBadge` | Consomme `ORDER_STATUS_LABELS` + `ORDER_STATUS_COLORS` |
| `OrderFilters` | Liste dérivée de `ORDER_STATUS_VALUES` + nouveau filtre `shipping_method` |
| `OrderStatusUpdate` | Reçoit `shippingMethod` en prop. `WORKFLOW_STEPS` = `ORDER_STEPS_PICKUP` si C&C sinon `ORDER_STEPS_HOME`. Transitions filtrées via `ORDER_STATUS_TRANSITIONS` en excluant `STRIPE_MANAGED_STATUSES`. `trackingLabel` = `null` pour C&C. Boutons rapides "Marquer prête au retrait" (sur `confirmed` + C&C) et "Marquer retirée" (sur `ready_for_pickup`). |
| `DashboardCharts` | Consomme `ORDER_STATUS_LABELS` + `ORDER_STATUS_COLORS` |
| `DashboardStats` | Nouveau widget "À retirer" (count `status='ready_for_pickup'`) avec lien vers `/admin/orders?status=ready_for_pickup` |

### 7.5 Page expédition `/admin/orders/[id]/expedition`

Early return avec écran dédié si `shipping_method === 'click_collect'` : *"Cette commande est en retrait magasin. Aucune étiquette ni transporteur nécessaire. Marquez-la 'Prête au retrait' depuis la fiche commande."*

Le bouton "Page expédition" est masqué pour les commandes C&C sur la fiche commande.

### 7.6 Page admin détail commande

- Timeline ajoutée : `ready_for_pickup_at` + `picked_up_at` si présents
- Bloc point de retrait conditionnel sur `provider`
- **Code de retrait visible** dès la transition `ready_for_pickup` (encadré, monospace, copiable)

### 7.7 Backend transitions

Voir §8.2 pour la logique de génération atomique du `pickup_code` et le trigger email.

---

## 8. Design — Génération atomique du code de retrait

### 8.1 Helper `assignPickupCodeAtomic`

```ts
// lolett-app/lib/orders/pickup-code.ts

const PICKUP_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars, sans 0/O/1/I
const PICKUP_CODE_LENGTH = 5;
const MAX_ATTEMPTS = 8;

function generatePickupCode(): string {
  const bytes = new Uint8Array(PICKUP_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return 'LOL-' + Array.from(bytes)
    .map(b => PICKUP_CODE_ALPHABET[b % PICKUP_CODE_ALPHABET.length])
    .join('');
}

export async function assignPickupCodeAtomic(
  supabase: SupabaseClient,
  orderId: string,
  extraPayload: Record<string, unknown> = {},
): Promise<{ code: string; updated: unknown } | null> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = generatePickupCode();
    const { data, error } = await supabase
      .from('orders')
      .update({ pickup_code: code, ...extraPayload })
      .eq('id', orderId)
      .is('pickup_code', null)   // safety : ne ré-écrit pas si déjà posé
      .select()
      .single();
    if (!error && data) return { code, updated: data };
    if (error?.code === '23505') continue;   // unique violation → retry
    console.error('[pickup-code] unexpected error', error);
    return null;
  }
  return null;
}
```

**Espace de codes** : 32⁵ ≈ 33.5M combinaisons. Probabilité de collision <0.1% jusqu'à 100k commandes en attente. `MAX_ATTEMPTS=8` aligne avec le pattern gift cards.

**Atomicité** : la même requête `UPDATE` écrit `status + ready_for_pickup_at + pickup_code` en une seule transaction. Pas de fenêtre où l'un est posé sans l'autre. La clause `.is('pickup_code', null)` garantit l'idempotence (retry safe).

### 8.2 Utilisation dans `PATCH /api/admin/orders/[id]`

```ts
if (body.status === 'ready_for_pickup' && currentOrder.status !== 'ready_for_pickup') {
  // Guard préalable
  if (currentOrder.shipping_method !== 'click_collect'
      || !currentOrder.pickup_point
      || currentOrder.pickup_point.provider !== 'click_collect') {
    return NextResponse.json(
      { error: 'Cette commande n\'a pas de point Click & Collect valide' },
      { status: 400 }
    );
  }

  const result = await assignPickupCodeAtomic(supabase, params.id, {
    status: 'ready_for_pickup',
    ready_for_pickup_at: new Date().toISOString(),
  });

  if (!result) {
    Sentry.captureMessage('pickup_code generation failed after 8 attempts', {
      tags: { feature: 'click_and_collect', step: 'generate_code' },
      extra: { orderId: params.id },
    });
    return NextResponse.json(
      { error: 'Impossible de générer un code de retrait unique. Réessayez.' },
      { status: 500 }
    );
  }

  after(async () => {
    try {
      await sendOrderReadyForPickupEmail({
        to: result.updated.customer.email,
        firstName: result.updated.customer.firstName,
        orderNumber: result.updated.order_number,
        pickupCode: result.code,
        pickupPoint: result.updated.pickup_point,
      });
    } catch (err) {
      Sentry.captureException(err, {
        tags: { feature: 'click_and_collect', step: 'email' },
      });
    }
  });

  return NextResponse.json({ order: result.updated });
}
```

---

## 9. Design — Emails

### 9.1 Nouveau template `order-ready-for-pickup-v3.ts`

Pattern v3 (HTML inline-styled, mêmes fonts et couleurs que les autres templates) :

- Palette : `#FAF7F2` / `#2C2420` / `#C4956A` / `#B5A99A` / `#7A6E62`
- Fonts : `Cormorant Garamond` (titres) + `DM Sans` (body)
- Structure :
  1. Header avec logo SVG
  2. Badge "Prête au retrait"
  3. Greeting interpolé
  4. Body texte
  5. **Bloc CODE DE RETRAIT** (hero) : encadré or sur fond `#FAF7F2`, code en monospace 24px `letter-spacing: 0.08em`
  6. Bloc point de retrait : 📍 nom, adresse, ⏰ horaires, 💡 instructions
  7. Pas de CTA (focus sur code + point)
  8. Signoff + footer
- **`escapeHtml` obligatoire** sur tous les champs dynamiques (name, address, instructions) → prévient injection HTML via CMS

### 9.2 Helper `sendOrderReadyForPickupEmail`

Pattern Groupe A (async void, nested try/catch sur `getEmailSettings`, fonction `interpolate()` supportant `{var}` et `{{var}}`).

```ts
export async function sendOrderReadyForPickupEmail(data: Params): Promise<void> {
  // Guards : ne JAMAIS envoyer un email partiel
  if (!data.pickupCode || !data.pickupPoint?.name) {
    Sentry.captureMessage('order-ready-for-pickup: missing data', {
      tags: { feature: 'click_and_collect', step: 'email' },
      extra: { orderNumber: data.orderNumber },
    });
    return;
  }
  // ... récupération settings, interpolation subject, envoi
}
```

### 9.3 Modifications templates existants

**`order-confirmation-v3`** — bloc pickup dynamique :

```ts
const showPickup = pickupPoint
  && (shippingMethod === 'mondial_relay' || shippingMethod === 'click_collect');
const pickupTitle = pickupPoint?.provider === 'click_collect'
  ? 'Point de retrait Click & Collect'
  : 'Point Relais Mondial Relay';
```

Pour C&C : ajouter ligne *"Vous recevrez un nouvel email avec votre code de retrait dès que votre commande sera prête."*

**`order-new-admin`** (notif Lola) :

```ts
const hasPickupPoint = pickupPoint
  && (shippingMethod === 'mondial_relay' || shippingMethod === 'click_collect');
```

Pour C&C : afficher le point + ligne *"Action attendue : relayer la commande au point de vente, puis marquer 'Prête au retrait' dans l'admin."*

### 9.4 Skip explicite `order-shipped` pour C&C

```ts
if (body.status === 'shipped' && previousStatus !== 'shipped') {
  if (updated.shipping_method === 'click_collect') {
    console.warn('[admin/orders] illegal transition: shipped on click_collect order', { orderId });
    // Garde-fou : la transition `confirmed → shipped` est déjà bloquée par ORDER_STATUS_TRANSITIONS
    // pour C&C, mais on n'envoie aucun email même si cela arrive.
  } else {
    after(async () => sendOrderShippedEmail({ ... }));
  }
}
```

### 9.5 CMS preview/test

Branches `order_ready_for_pickup` ajoutées dans `/api/admin/emails/preview/route.ts`, `test/route.ts`, `preview-all/route.ts` avec `MOCK_PICKUP_DATA` (firstName Marie, orderNumber LOL-20260530-TEST, pickupCode LOL-A7K2X, pickupPoint Boutique du Marais).

`VARIABLES_BY_TEMPLATE.order_ready_for_pickup` = `['{firstName}', '{orderNumber}', '{pickupCode}', '{pickupPointName}']`.

---

## 10. Design — Stripe & facture

### 10.1 Création de session Stripe

```ts
const sessionParams: Stripe.Checkout.SessionCreateParams = {
  mode: 'payment',
  // ...
  ...(shippingMethod !== 'click_collect' && {
    shipping_address_collection: { allowed_countries: [...] },
  }),
  metadata: {
    order_id: order.id,
    shipping_method: shippingMethod,
    pickup_point_id: requiresPickupPoint ? pickupPoint!.id : '',
    pickup_provider: requiresPickupPoint ? pickupPoint!.provider : '',
  },
};

// Pas de line_item "Livraison" si shippingCost=0 (ne pas afficher 0€)
if (shippingCost > 0) {
  lineItems.push({ /* ... */ });
}
```

### 10.2 Validation serveur stricte (`/api/checkout/stripe`)

```ts
import { VALID_SHIPPING_METHODS } from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';

// 1. Méthode valide (dérivée dynamiquement, plus de hardcoded)
if (!VALID_SHIPPING_METHODS.includes(shippingMethod)) {
  return NextResponse.json({ error: 'Mode de livraison invalide' }, { status: 400 });
}

// 2. C&C FR-only
if (shippingMethod === 'click_collect' && shippingCountry !== 'FR') {
  return NextResponse.json({ error: 'Click & Collect FR uniquement' }, { status: 400 });
}

// 3. PickupPoint pour MR et C&C
const requiresPickupPoint = shippingMethod === 'mondial_relay' || shippingMethod === 'click_collect';
if (requiresPickupPoint && !pickupPoint?.id) {
  return NextResponse.json({ error: 'Point de retrait manquant' }, { status: 400 });
}

// 4. Pour C&C : vérifier le point en BD (anti-DevTools)
if (shippingMethod === 'click_collect') {
  if (pickupPoint!.provider !== 'click_collect') {
    return NextResponse.json({ error: 'Provider invalide' }, { status: 400 });
  }
  const supabaseAdmin = createAdminClient();
  const { data: dbPoint } = await supabaseAdmin
    .from('pickup_points')
    .select('id, name, address, postal_code, city, country, hours, instructions, is_active')
    .eq('id', pickupPoint!.id)
    .eq('is_active', true)
    .single();
  if (!dbPoint) {
    return NextResponse.json({ error: 'Point de retrait introuvable ou inactif' }, { status: 400 });
  }
  // Re-construire le snapshot depuis la DB (jamais faire confiance au client)
  pickupPoint = {
    provider: 'click_collect',
    id: dbPoint.id, name: dbPoint.name,
    address: dbPoint.address, postalCode: dbPoint.postal_code,
    city: dbPoint.city, country: dbPoint.country,
    hours: dbPoint.hours, instructions: dbPoint.instructions,
  };
}
```

### 10.3 Webhook : validation C&C + bascule `payment_review`

```ts
// Dans checkout.session.completed, AVANT mark paid
const shippingMethod = session.metadata?.shipping_method;
const pickupPointId  = session.metadata?.pickup_point_id;
const pickupProvider = session.metadata?.pickup_provider;

if (shippingMethod === 'click_collect') {
  const { data: dbPoint } = await supabase
    .from('pickup_points').select('id, is_active')
    .eq('id', pickupPointId).single();
  const isValid = dbPoint?.is_active === true && pickupProvider === 'click_collect';
  if (!isValid) {
    await supabase.from('orders').update({ status: 'payment_review' }).eq('id', orderId);
    Sentry.captureMessage('C&C order without valid pickup_point at webhook', {
      tags: { feature: 'click_and_collect', step: 'webhook' },
      extra: { orderId, pickupPointId, pickupProvider, sessionId: session.id },
    });
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }
}

// Sinon flow normal : mark paid + send confirmation
```

### 10.4 Facture PDF

```tsx
const isMondialRelay = order.shippingMethod === 'mondial_relay';
const isClickCollect = order.shippingMethod === 'click_collect';

<Section title={
  isClickCollect ? 'Point de retrait Click & Collect' :
  isMondialRelay ? 'Point Relais Mondial Relay' :
  'Livraison à domicile'
}>
  {(isMondialRelay || isClickCollect) && order.pickupPoint ? (
    <>
      <Text>{order.pickupPoint.name}</Text>
      <Text>{order.pickupPoint.address}</Text>
      <Text>{order.pickupPoint.postalCode} {order.pickupPoint.city}</Text>
      {isClickCollect && order.pickupPoint.hours && (
        <Text size={9}>Horaires : {order.pickupPoint.hours}</Text>
      )}
    </>
  ) : (
    /* Adresse client */
  )}
</Section>

{/* Ligne frais */}
{isClickCollect ? (
  <Row label="Retrait en boutique (Click & Collect)" value="Offert" />
) : order.shippingCost > 0 ? (
  <Row label={`Livraison (${SHIPPING_METHODS[order.shippingMethod].label})`} value={formatPrice(order.shippingCost)} />
) : (
  <Row label="Livraison" value="Offerte" />
)}
```

L'**adresse de facturation** (`customer.address`, obligatoire dans le formulaire) reste affichée dans le bloc destinataire. La facture reste légalement complète.

---

## 11. Plan d'implémentation (ordre des PRs)

| PR | Contenu | Dépendances | Tests embarqués |
|---|---|---|---|
| **PR 1** | Section 4 (DB) : 3 migrations (`pickup_points` + extensions `orders` + seed `email_settings`) | — | Aucun (migrations) |
| **PR 2** | Section 5 (types + constants + mappers + cart store v3) | PR 1 | Unit : `computeShippingCost`, `mapPickupPoint`, cart migrate, `ORDER_STATUS_TRANSITIONS` |
| **PR 3** | Section 8 + 9 : helper `assignPickupCodeAtomic`, template `order-ready-for-pickup-v3`, helper `sendOrderReadyForPickupEmail`, branches CMS preview/test, modifs `order-confirmation` + `order-new-admin` | PR 2 | Unit : `generatePickupCode`, `assignPickupCodeAtomic` (mock), `sendOrderReadyForPickupEmail` (mock `sendHtmlEmail`) |
| **PR 4** | Section 7 (UI admin) : page `/admin/pickup-points`, modal, 5 routes API, refactor `OrderStatusBadge` / `OrderStatusUpdate` / `OrderFilters` / `DashboardCharts`, widget "À retirer", page expédition early return, page détail commande timestamps + code | PR 1, 2, 3 | Intégration : routes `/api/admin/pickup-points/*`, PATCH `/api/admin/orders/[id]` transitions C&C, génération code |
| **PR 5** | Section 6 + 10 (UI client + Stripe + facture) : `ShippingMethodSelect`, `ClickCollectPicker`, `CheckoutForm`, `useCheckout`, cleanup `MondialRelayWidget`, page succès, OrderDetail client, route Stripe (validation §10.2), webhook (validation §10.3), facture PDF | PR 1, 2, 3, 4 | Intégration : route Stripe checkout (rejets), webhook handler |
| **PR 6** | E2E + edge cases : 3 parcours Playwright, tests webhook invalid provider, refund C&C, dispute Stripe sur C&C, attaques DevTools, désactivation point mid-order | Tous précédents | E2E |

**Co-déploiement PR 4 + PR 5 obligatoire** : sinon Lola peut créer des points actifs visibles via l'API publique Supabase mais invisibles côté client. Mitigation : `pickup_points.is_active DEFAULT FALSE` (cf. §4.1) — Lola active manuellement au go-live.

---

## 12. Plan de tests

### 12.1 Tests unitaires (vitest)

| Cible | Cas |
|---|---|
| `computeShippingCost` | `(FR, click_collect, *) → 0`, `(BE, click_collect, *) → throw`, `(FR, home, < seuil) → tarif`, `(FR, home, >= seuil) → 0` |
| `generatePickupCode` | Format `LOL-XXXXX`, alphabet 32 chars, distribution sur 1000 calls (pas de doublon évident) |
| `assignPickupCodeAtomic` | Succès 1er essai, retry sur `23505`, return null après 8 échecs, idempotence si `pickup_code` déjà posé |
| `mapPickupPoint` | Backfill `provider='mondial_relay'` si absent + shipping_method MR, `provider='click_collect'` si shipping_method C&C |
| Cart store | `setShippingMethod` reset `pickupPoint`, `migrate v3` backfill provider sur anciens snapshots |
| `ORDER_STATUS_TRANSITIONS` | Tous les statuts ont une entrée, `picked_up → ['refunded', 'partially_refunded']`, `confirmed` peut aller vers `ready_for_pickup` |

### 12.2 Tests d'intégration

| Route | Cas |
|---|---|
| `POST /api/checkout/stripe` | Rejette `click_collect && country !== 'FR'` (400), rejette `pickupPoint.id` inconnu (400), rejette point inactif (400), accepte C&C valide + remet à plat le snapshot depuis BD |
| `PATCH /api/admin/orders/[id]` | Rejette transition non autorisée (400), refuse `ready_for_pickup` sans `pickup_point` valide (400), auto-set timestamps + `pickup_code`, déclenche email (mock) |
| `POST /api/admin/pickup-points` + reorder | Pattern Materials swap, init `sort_order = MAX+10`, response shape `{ pickupPoints }` |
| Webhook Stripe | C&C avec pickup_point invalide → `payment_review` + skip email confirmation |

### 12.3 Snapshots templates HTML

Pour les 3 templates email (`order-confirmation-v3`, `order-new-admin`, `order-ready-for-pickup-v3`), capturer le rendu pour 3 modes (domicile / MR / C&C). Failer si modification non intentionnelle.

**Note** : la facture PDF utilise `@react-pdf/renderer` qui sort du **binaire**. Tests par `render() + screen queries` sur le composant React, pas par snapshot HTML.

### 12.4 Tests E2E (playwright)

1. **Parcours C&C complet** : produit → checkout → C&C → choix point → paiement Stripe test → succès → email reçu → admin marque `ready_for_pickup` → email avec code → marquage `picked_up`
2. **Bascule MR → C&C** : reset `pickupPoint`, pas de résidu Mondial Relay
3. **Bascule FR → BE** : si C&C sélectionné, bascule auto à `home`

---

## 13. Scénarios d'acceptation

| # | Scénario | Critère |
|---|---|---|
| A1 | Cliente FR commande en C&C | Email confirmation reçu avec point, commande visible admin |
| A2 | Lola voit la commande | Bouton "Marquer prête au retrait" visible, page expédition masquée |
| A3 | Lola clique "Marquer prête au retrait" | `status=ready_for_pickup`, `ready_for_pickup_at` posé, `pickup_code` généré, email parti |
| A4 | Lola clique "Marquer retirée" | `status=picked_up`, `picked_up_at` posé, aucun email envoyé |
| A5 | RGPD suppression compte | Inchangé : commandes C&C anonymisées comme les autres |
| A6 | Client BE force C&C via DevTools | Route Stripe 400 "Click & Collect FR uniquement" |
| A7 | Lola désactive un point référencé par 12 commandes | Modal affiche "Référencé par 12 commandes — masquer plutôt que supprimer", toggle `is_active=false` |
| A8 | Lola modifie le texte de l'email "Prête au retrait" depuis `/admin/emails` | Aperçu fonctionne avec `MOCK_PICKUP_DATA`, prochaine transition utilise le nouveau texte |
| A9 | Client C&C n'est pas venu | `RefundDialog` accepte `ready_for_pickup`, refund Stripe OK |
| A10 | Webhook reçoit session C&C sans `pickup_point` valide | `status=payment_review`, log Sentry, aucun email client |

---

## 14. Observabilité

### 14.1 Sentry tags

Sur tous les events C&C :
```ts
Sentry.captureMessage(msg, {
  tags: { feature: 'click_and_collect', step: 'generate_code' | 'transition' | 'webhook' | 'email' },
  extra: { orderId, pickupPointId, reason },
});
```

### 14.2 Seuils KPI (à monitorer)

| Métrique | Seuil warn | Seuil alert |
|---|---|---|
| No-show (`paid` mais jamais `picked_up`) | >15% | >25% |
| Commandes `ready_for_pickup` >7 jours | inform Lola par email | >30j → auto `expired` (V2) |
| Échec génération `pickup_code` | >1% sur 24h | urgent |
| Bascules `payment_review` C&C / 24h | >5 | urgent |

### 14.3 Cron monitoring (V2 optionnel)

`/api/cron/click-collect-monitoring` toutes les 4h. Compte les commandes `ready_for_pickup` >3 jours. Notification email Lola si dépassement.

---

## 15. Rollback

### 15.1 Stratégie : pas de rollback DB, masque applicatif

Les migrations DB (PR 1) sont conçues pour rester en place même si le code applicatif est revert. Les CHECK constraints étendues, colonnes ajoutées et table `pickup_points` n'ont aucun impact si l'application ne les utilise pas.

### 15.2 Procédure en cas d'incident bloquant

1. Revert PR 5 (UI client) → la feature disparaît côté client
2. Si nécessaire, revert PR 4 (UI admin) → Lola perd l'accès à `/admin/pickup-points`
3. **NE PAS revert les migrations DB (PR 1)** : les commandes C&C existantes restent cohérentes
4. Commandes C&C en cours (`ready_for_pickup`, `picked_up`) : Lola gère manuellement par email client

### 15.3 Re-déploiement

- Migrations DB déjà en place → seuls PR 4/5 à re-merger
- Pas de migration de données nécessaire

---

## 16. Migration data / commandes legacy

Aucune migration de données. Les anciennes commandes `home` / `mondial_relay` :
- Type `Order.status` étendu (les statuts `payment_review`, `partially_refunded`, `disputed` étaient déjà en DB depuis 20260429/20260430 mais absents du type TS — l'alignement résout une **désynchronisation pré-existante**)
- Mapper Supabase backfille `provider='mondial_relay'` sur les snapshots existants
- Aucun ALTER ne change la sémantique des données existantes

---

## 17. Documentation utilisateur

Document à livrer avec PR 4 : `docs/click-collect-guide-lola.md`

```markdown
# Click & Collect — Guide d'utilisation

## Ajouter un point de retrait
1. /admin/pickup-points → Ajouter un point
2. Remplir nom, adresse, horaires, instructions
3. Sauvegarder
4. Toggle "Actif" pour le rendre visible côté client

## Traiter une commande C&C
1. /admin/orders → filtre "À retirer" ou widget dashboard
2. Ouvrir la commande
3. Relayer manuellement au point de vente partenaire
4. Quand le point a la commande en main : "Marquer prête au retrait"
   → Le client reçoit son email avec le code de retrait
5. Quand le point confirme le retrait : "Marquer retirée"

## Désactiver un point
- Bouton œil barré dans la liste
- Le point disparaît côté client mais les commandes historiques gardent leurs infos

## Client n'est pas venu
- Bouton "Annuler" → `cancelled`
- Bouton "Rembourser" → refund Stripe automatique
```

---

## 18. Synthèse des audits

Le design a été audité section par section via 6 workflows successifs (10 + 6 + 6 + 6 + 6 + 6 dimensions). Bilan :

| Section | Verdict | Must-fix confirmés |
|---|---|---|
| §4 (DB) | safe_with_minor_adjustments | 1 (DROP+ADD pattern CHECK) |
| §5 (types) | safe_with_minor_adjustments | 1 (alignement `Order.status`) |
| §6 (UI client) | safe_with_minor_adjustments | 4 (Sections 2/3 prérequis, validation serveur, reset store, migration v3) |
| §7 (UI admin) | safe_with_minor_adjustments | 5 (statuts manquants, types ShippingMethod, query JSONB invalide, helper email manquant) |
| §9 (emails) | safe_with_minor_adjustments | 3 (format 5 chars, atomicité, enums) |
| §10-15 (Stripe + tests + déploiement) | safe_with_minor_adjustments | 3 (tous déjà couverts ailleurs) |

**Total** : 17 must-fix confirmés, tous intégrés dans ce spec. **0 needs_design_change**. Le design est stable.

---

## 19. Alternatives écartées

| Option | Pourquoi écartée |
|---|---|
| Stocker les 3 points en dur dans `lib/constants.ts` | Lola ne peut pas éditer sans dev. Refusé en brainstorming. |
| `pickup_point_id` FK propre vers `pickup_points` au lieu du snapshot JSONB | Casse l'historique des commandes si Lola modifie un point. Le snapshot est cohérent avec ce qui existe déjà pour Mondial Relay. |
| Hard-DELETE des points avec query JSONB count | La query `.filter('pickup_point->>id', 'eq', ...)` n'est pas supportée par PostgREST. Soft-delete pur via `is_active=false` est plus simple et préserve l'historique. |
| Feature flag environnement | Pas nécessaire — `pickup_points.is_active DEFAULT FALSE` joue ce rôle pour le soft-launch. |
| `[k: string]: unknown` sur `PickupPoint` | Désactive l'excess property check, autorise les typos (`pickupPoint.adress`). Préféré : union discriminée par `provider`. |
| RPC Postgres pour la génération du code | Équivalent à l'approche Node + UNIQUE PARTIAL + retry. Plus de couches sans gain. Garder Node. |
| Adresse de livraison optionnelle pour C&C | Augmente la surface de bugs et complique la facture PDF. Décision brainstorming : on garde tout obligatoire. |
| Envoyer `order-shipped` adapté pour C&C | Bruit pour le client (3 emails au lieu de 2). On skip net. |
| Pattern `Sections` (bulk PUT) pour le reorder des points | Plus complexe + plus de surface aux races. Pattern `Materials` swap (`fromId, toId`) est plus simple et plus robuste pour ↑/↓. |

---

## 20. Prochaine étape

Une fois ce spec validé par Lyes, transition vers la skill `writing-plans` pour produire un plan d'implémentation détaillé PR par PR (tâches, fichiers, ordre exact, points de vérification).
