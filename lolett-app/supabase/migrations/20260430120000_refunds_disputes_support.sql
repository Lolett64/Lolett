-- =============================================================
-- Refunds & Disputes support — Niveau 2 autonomie Lola
-- =============================================================
-- 1. Étend orders.status enum : ajoute 'partially_refunded' + 'disputed'
-- 2. Ajoute colonnes dispute (disputed_at, dispute_id, dispute_status, dispute_reason, dispute_amount)
-- 3. Crée table stripe_webhook_events pour idempotency event-id global
-- 4. Crée RPC increment_stock_for_order_partial(order_id, ratio) — réincrémente stock prorata
-- 5. Crée RPC decrement_loyalty_points(user_id, points) — retire points sur refund

-- ── 1. Étendre l'enum status ─────────────────────────────────
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending', 'paid', 'confirmed', 'shipped', 'delivered',
    'cancelled', 'refunded', 'partially_refunded',
    'disputed', 'expired', 'payment_review'
  )
);

-- ── 2. Colonnes dispute sur orders ────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dispute_id TEXT,
  ADD COLUMN IF NOT EXISTS dispute_status TEXT,
  ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
  ADD COLUMN IF NOT EXISTS dispute_amount NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_orders_dispute_id ON orders(dispute_id) WHERE dispute_id IS NOT NULL;

-- ── 3. Table d'idempotency pour webhooks Stripe ──────────────
-- Stripe peut renvoyer un même event si on n'a pas répondu sous 5s.
-- Cette table empêche les doubles traitements (refund x2, dispute mail x2, etc).
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed_at DESC);

-- ── 4. RPC increment_stock_for_order_partial ──────────────────
-- Réincrémente le stock des variants (ou products en fallback) pour les items d'une commande.
-- ratio = 1.0 → restock total, ratio = 0.5 → restock 50% (FLOOR conservateur).
-- Pattern strictement aligné avec decrement_stock_for_order (matching size/color insensible casse).
CREATE OR REPLACE FUNCTION increment_stock_for_order_partial(
  p_order_id UUID,
  p_ratio NUMERIC DEFAULT 1.0
)
RETURNS TABLE(product_id UUID, product_name TEXT, size TEXT, color TEXT, incremented INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
  v_variant_id UUID;
  v_increment INTEGER;
BEGIN
  IF p_ratio <= 0 OR p_ratio > 1 THEN
    RAISE EXCEPTION 'p_ratio must be between 0 (exclusive) and 1 (inclusive), got %', p_ratio;
  END IF;

  FOR item IN
    SELECT oi.product_id, oi.product_name, oi.size, oi.color, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    v_variant_id := NULL;
    v_increment := FLOOR(item.quantity * p_ratio)::INTEGER;

    -- Skip si rien à restock (ratio trop bas pour cette quantité)
    IF v_increment <= 0 THEN
      CONTINUE;
    END IF;

    -- Match variant par product_id + size + color (insensible casse)
    IF item.color IS NOT NULL AND item.color <> '' THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = item.product_id
        AND lower(product_variants.size) = lower(item.size)
        AND lower(product_variants.color_name) = lower(item.color)
      LIMIT 1;
    END IF;

    -- Fallback : premier variant pour ce produit+taille
    IF v_variant_id IS NULL THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = item.product_id
        AND lower(product_variants.size) = lower(item.size)
      ORDER BY created_at
      LIMIT 1;
    END IF;

    IF v_variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock = stock + v_increment,
          updated_at = NOW()
      WHERE id = v_variant_id;
    ELSE
      -- Fallback legacy products.stock
      UPDATE products
      SET stock = stock + v_increment,
          updated_at = NOW()
      WHERE id = item.product_id;
    END IF;

    product_id := item.product_id;
    product_name := item.product_name;
    size := item.size;
    color := item.color;
    incremented := v_increment;
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_stock_for_order_partial(UUID, NUMERIC) TO service_role;

COMMENT ON FUNCTION increment_stock_for_order_partial IS
  'Réincrémente le stock des variants (ou products en fallback) pour tous les items d''une commande, prorata du ratio fourni (FLOOR conservateur). Utilisé sur refund pour restock retours produits.';

-- ── 5. RPC decrement_loyalty_points ──────────────────────────
-- Retire des points fidélité (clamp à 0). Idempotent niveau métier
-- (le webhook charge.refunded vérifie déjà event_id en amont).
CREATE OR REPLACE FUNCTION decrement_loyalty_points(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_points <= 0 THEN
    RETURN;
  END IF;

  UPDATE profiles
  SET loyalty_points = GREATEST(0, COALESCE(loyalty_points, 0) - p_points)
  WHERE id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_loyalty_points(UUID, INTEGER) TO service_role;

COMMENT ON FUNCTION decrement_loyalty_points IS
  'Retire des points fidélité d''un utilisateur (clamp à 0). Utilisé sur refund pour reverser les points crédités à l''achat.';
