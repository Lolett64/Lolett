-- =============================================================
-- PR Stock : décrément automatique du stock à l'achat
-- =============================================================
-- 1. Ajoute order_items.color pour matcher le bon variant
-- 2. Crée RPC decrement_stock_for_order() atomique qui :
--    - Pour chaque item, décrémente product_variants.stock (match product_id + size + color)
--    - Si le produit n'a pas de variant matching, décrémente products.stock en fallback
--    - Refuse de rendre un stock négatif (GREATEST avec 0) → protection overselling
--    - Retourne la liste des items dont le stock n'a pas pu être décrémenté

-- ── 1. Colonne color sur order_items ─────────────────────────
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS color text;

-- ── 2. Flag d'idempotence sur orders ─────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_decremented_at timestamptz;

-- ── 3. Fonction de décrémentation atomique ───────────────────
CREATE OR REPLACE FUNCTION decrement_stock_for_order(p_order_id uuid)
RETURNS TABLE(product_id uuid, product_name text, size text, color text, decremented integer, insufficient boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
  v_variant_id uuid;
  v_current_stock integer;
  v_decrement integer;
  v_insufficient boolean;
  v_already_decremented timestamptz;
BEGIN
  -- Idempotence : si déjà décrémenté, on ne fait rien (protège contre double webhook)
  SELECT stock_decremented_at INTO v_already_decremented
  FROM orders WHERE id = p_order_id FOR UPDATE;

  IF v_already_decremented IS NOT NULL THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT oi.product_id, oi.product_name, oi.size, oi.color, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    v_variant_id := NULL;
    v_insufficient := false;

    -- Chercher le variant matching (product_id + size + color, insensible à la casse)
    IF item.color IS NOT NULL AND item.color <> '' THEN
      SELECT id, stock INTO v_variant_id, v_current_stock
      FROM product_variants
      WHERE product_variants.product_id = item.product_id
        AND lower(product_variants.size) = lower(item.size)
        AND lower(product_variants.color_name) = lower(item.color)
      LIMIT 1;
    END IF;

    -- Fallback : premier variant pour ce produit+taille (sans contrainte couleur)
    IF v_variant_id IS NULL THEN
      SELECT id, stock INTO v_variant_id, v_current_stock
      FROM product_variants
      WHERE product_variants.product_id = item.product_id
        AND lower(product_variants.size) = lower(item.size)
      ORDER BY created_at
      LIMIT 1;
    END IF;

    IF v_variant_id IS NOT NULL THEN
      v_decrement := LEAST(item.quantity, COALESCE(v_current_stock, 0));
      IF v_decrement < item.quantity THEN
        v_insufficient := true;
      END IF;
      IF v_decrement > 0 THEN
        UPDATE product_variants
        SET stock = GREATEST(0, stock - v_decrement),
            updated_at = now()
        WHERE id = v_variant_id;
      END IF;
    ELSE
      -- Aucun variant : fallback sur products.stock legacy
      SELECT stock INTO v_current_stock FROM products WHERE id = item.product_id;
      v_decrement := LEAST(item.quantity, COALESCE(v_current_stock, 0));
      IF v_decrement < item.quantity THEN
        v_insufficient := true;
      END IF;
      IF v_decrement > 0 THEN
        UPDATE products
        SET stock = GREATEST(0, stock - v_decrement),
            updated_at = now()
        WHERE id = item.product_id;
      END IF;
    END IF;

    product_id := item.product_id;
    product_name := item.product_name;
    size := item.size;
    color := item.color;
    decremented := v_decrement;
    insufficient := v_insufficient;
    RETURN NEXT;
  END LOOP;

  -- Marque la commande comme décrémentée
  UPDATE orders SET stock_decremented_at = now() WHERE id = p_order_id;

  RETURN;
END;
$$;

COMMENT ON FUNCTION decrement_stock_for_order IS
  'Décrémente le stock des variants (ou products.stock en fallback) pour tous les items d''une commande. Retourne la liste des décréments effectués et un flag insufficient si le stock demandé dépassait le stock disponible.';
