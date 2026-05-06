-- =============================================================
-- RPC restore_stock_for_order : inverse de decrement_stock_for_order
-- =============================================================
-- Pourquoi : avant le launch, on supprime les commandes test qui ont
-- décrémenté le stock à tort. Cette RPC restitue les unités décrémentées
-- AVANT le DELETE des commandes, pour que Lola retrouve son stock initial.
--
-- Comportement (miroir de decrement_stock_for_order) :
--   - Pour chaque order_item, ré-incrémente product_variants.stock
--     (match product_id + size + color, insensible à la casse)
--   - Fallback sur products.stock si pas de variant matching
--   - Idempotent via stock_decremented_at : si NULL, ne fait rien
--   - Met stock_decremented_at = NULL après restore (re-appel = no-op)
--
-- Sécurité : SECURITY DEFINER + GRANT service_role uniquement.

CREATE OR REPLACE FUNCTION restore_stock_for_order(p_order_id uuid)
RETURNS TABLE(product_id uuid, product_name text, size text, color text, restored integer, matched boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  item RECORD;
  v_variant_id uuid;
  v_was_decremented timestamptz;
  v_matched boolean;
BEGIN
  -- Idempotence : si jamais décrémenté, rien à restaurer (no-op)
  SELECT stock_decremented_at INTO v_was_decremented
  FROM orders WHERE id = p_order_id FOR UPDATE;

  IF v_was_decremented IS NULL THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT oi.product_id, oi.product_name, oi.size, oi.color, oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    v_variant_id := NULL;
    v_matched := false;

    -- Match variant prioritaire avec color si présent
    IF item.color IS NOT NULL AND item.color <> '' THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = item.product_id
        AND lower(product_variants.size) = lower(item.size)
        AND lower(product_variants.color_name) = lower(item.color)
      LIMIT 1;
    END IF;

    -- Fallback : premier variant pour ce produit+taille (sans color)
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
      SET stock = stock + item.quantity,
          updated_at = now()
      WHERE id = v_variant_id;
      v_matched := true;
    ELSE
      -- Fallback ultime : produit sans variants → products.stock legacy
      UPDATE products
      SET stock = stock + item.quantity,
          updated_at = now()
      WHERE products.id = item.product_id;
      IF FOUND THEN
        v_matched := true;
      END IF;
    END IF;

    product_id := item.product_id;
    product_name := item.product_name;
    size := item.size;
    color := item.color;
    restored := CASE WHEN v_matched THEN item.quantity ELSE 0 END;
    matched := v_matched;
    RETURN NEXT;
  END LOOP;

  -- Réinitialise le flag pour rendre l'opération idempotente
  UPDATE orders SET stock_decremented_at = NULL WHERE id = p_order_id;

  RETURN;
END;
$$;

COMMENT ON FUNCTION restore_stock_for_order IS
  'Inverse de decrement_stock_for_order. Restitue les unités décrémentées sur product_variants.stock (ou products.stock en fallback) pour tous les items d''une commande, puis remet orders.stock_decremented_at à NULL. Idempotent.';

REVOKE ALL ON FUNCTION restore_stock_for_order(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION restore_stock_for_order(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION restore_stock_for_order(uuid) TO service_role;
