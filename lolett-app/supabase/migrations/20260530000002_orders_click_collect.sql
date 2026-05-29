-- =============================================================
-- Click & Collect — PR1 (2/4) : extensions orders
-- =============================================================
-- 1. Étend orders_status_check : ajoute ready_for_pickup + picked_up (→ 13 statuts)
-- 2. Timestamps workflow C&C : ready_for_pickup_at, picked_up_at
-- 3. Code de retrait pickup_code + index UNIQUE PARTIAL (retry atomique)
-- 4. CHECK constraints défensives sur shipping_method / shipping_carrier
-- 5. Index btree d'expression sur (pickup_point->>'id') pour la RPC de comptage
-- NB : orders.pickup_point (JSONB) existe déjà (20260428000001), pas recréée.
-- À exécuter dans le SQL Editor du dashboard Supabase.

-- ── 1. Étendre l'enum status (DROP + ADD, pattern 20260430120000) ──────────
-- État courant : 11 statuts. On ajoute ready_for_pickup + picked_up → 13.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending', 'paid', 'confirmed',
    'shipped', 'delivered',
    'ready_for_pickup', 'picked_up',
    'cancelled', 'refunded', 'partially_refunded', 'disputed',
    'expired', 'payment_review'
  )
);

-- ── 2. Timestamps workflow C&C (symétrie shipped_at / delivered_at) ────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS ready_for_pickup_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at        timestamptz;

-- ── 3. Code de retrait + index UNIQUE PARTIAL ─────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_code text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pickup_code_unique
  ON orders (pickup_code) WHERE pickup_code IS NOT NULL;

-- ── 4. CHECK constraints défensives shipping_method / shipping_carrier ─────
-- PRÉ-VOL OBLIGATOIRE (voir plan PR1 Task 2 Step 2) : ADD CONSTRAINT CHECK valide
-- IMMÉDIATEMENT toutes les lignes existantes (pas de NOT VALID). Confirmer avant
-- d'appliquer que shipping_method ⊆ {home, mondial_relay, NULL} et
-- shipping_carrier ⊆ {colissimo, mondial_relay, NULL}, sinon le ADD échoue sur
-- une donnée orpheline. DROP IF EXISTS avant ADD pour idempotence.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_shipping_method_check
  CHECK (shipping_method IS NULL OR shipping_method IN ('home', 'mondial_relay', 'click_collect'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_carrier_check;
ALTER TABLE orders ADD CONSTRAINT orders_shipping_carrier_check
  CHECK (shipping_carrier IS NULL OR shipping_carrier IN ('colissimo', 'mondial_relay', 'click_collect'));

-- ── 5. Index btree d'expression sur (pickup_point->>'id') ─────────────────
-- Correction vs spec §4.2 (point 5) : la RPC compare pickup_point->>'id' = point_id
-- (égalité TEXTE). Un index GIN sur (pickup_point -> 'id') n'accélère PAS cette
-- égalité ->> ; on utilise un btree d'expression, seul index utile au planner.
CREATE INDEX IF NOT EXISTS idx_orders_pickup_point_id
  ON orders ((pickup_point->>'id'));

-- ── 6. Commentaires ───────────────────────────────────────────────────────
COMMENT ON COLUMN orders.shipping_method IS 'home | mondial_relay | click_collect';
COMMENT ON COLUMN orders.shipping_carrier IS 'colissimo | mondial_relay | click_collect';
COMMENT ON COLUMN orders.pickup_point IS
  'Snapshot JSONB du point sélectionné. Forme : { id, name, address, postalCode, city, country, hours, instructions, provider }. provider = "mondial_relay" | "click_collect".';
COMMENT ON COLUMN orders.ready_for_pickup_at IS 'Auto-posé par PATCH admin sur transition ready_for_pickup.';
COMMENT ON COLUMN orders.picked_up_at IS 'Auto-posé par PATCH admin sur transition picked_up.';
COMMENT ON COLUMN orders.pickup_code IS
  'Code court aléatoire LOL-XXXXX (5 chars, alphabet 32 chars excluant 0/O/1/I). Généré atomiquement à la transition ready_for_pickup.';
