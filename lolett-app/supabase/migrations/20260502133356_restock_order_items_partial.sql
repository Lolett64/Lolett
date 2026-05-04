-- Refund par articles (Scénario B) — RPC qui restock UNIQUEMENT les items spécifiés.
--
-- Pourquoi : le RPC existant `increment_stock_for_order_partial(order_id, ratio)`
-- restock proportionnellement au montant remboursé / total commande. Comportement
-- faux dans 100% des cas multi-articles (ex commande 3 articles, retour pantalon
-- seul → on veut +1 sur le pantalon, pas FLOOR(qty*ratio) sur chaque article).
--
-- Ce nouveau RPC reçoit la liste exacte des items retournés (product_id, size,
-- color, quantity) et restock pile-poil le bon variant.
--
-- Utilisé par le webhook charge.refunded quand metadata.refund_kind === 'items'.
-- Le RPC `increment_stock_for_order_partial` est conservé pour le fallback :
-- refund initié depuis Stripe Dashboard (sans metadata) ou geste commercial avec
-- restock proportionnel hérité.

CREATE OR REPLACE FUNCTION public.restock_order_items_partial(
  p_order_id UUID,
  p_items JSONB
)
RETURNS TABLE(product_id UUID, size TEXT, color TEXT, restocked INTEGER, matched BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
  v_product_id UUID;
  v_size TEXT;
  v_color TEXT;
  v_qty INTEGER;
  v_variant_id UUID;
  v_matched BOOLEAN;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Parse + sécurité de typage. Skip silencieusement si payload mal formé.
    BEGIN
      v_product_id := NULLIF(item->>'product_id', '')::UUID;
      v_size := item->>'size';
      v_color := NULLIF(item->>'color', '');
      v_qty := NULLIF(item->>'quantity', '')::INTEGER;
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;

    IF v_product_id IS NULL OR v_size IS NULL OR v_qty IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- Sécurité métier : vérifier que l'item appartient bien à la commande
    -- ET que la quantité demandée n'excède pas la quantité vendue.
    -- Si pas trouvé → skip silencieusement (rapport via RETURNED matched=false).
    IF NOT EXISTS (
      SELECT 1 FROM order_items oi
      WHERE oi.order_id = p_order_id
        AND oi.product_id = v_product_id
        AND lower(oi.size) = lower(v_size)
        AND COALESCE(lower(oi.color), '') = COALESCE(lower(v_color), '')
        AND oi.quantity >= v_qty
    ) THEN
      product_id := v_product_id;
      size := v_size;
      color := v_color;
      restocked := 0;
      matched := false;
      RETURN NEXT;
      CONTINUE;
    END IF;

    -- Match variant (même pattern que decrement_stock_for_order : color match
    -- prioritaire si color présent, sinon fallback sur size only ordered by created_at).
    v_variant_id := NULL;
    IF v_color IS NOT NULL AND v_color <> '' THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = v_product_id
        AND lower(product_variants.size) = lower(v_size)
        AND lower(product_variants.color_name) = lower(v_color)
      LIMIT 1;
    END IF;

    IF v_variant_id IS NULL THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = v_product_id
        AND lower(product_variants.size) = lower(v_size)
      ORDER BY created_at
      LIMIT 1;
    END IF;

    v_matched := false;
    IF v_variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock = stock + v_qty, updated_at = NOW()
      WHERE id = v_variant_id;
      v_matched := true;
    ELSE
      -- Fallback ultime : produit sans variants → restock products.stock
      UPDATE products
      SET stock = stock + v_qty, updated_at = NOW()
      WHERE products.id = v_product_id;
      IF FOUND THEN
        v_matched := true;
      END IF;
    END IF;

    product_id := v_product_id;
    size := v_size;
    color := v_color;
    restocked := CASE WHEN v_matched THEN v_qty ELSE 0 END;
    matched := v_matched;
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.restock_order_items_partial(UUID, JSONB) TO service_role;
REVOKE EXECUTE ON FUNCTION public.restock_order_items_partial(UUID, JSONB) FROM PUBLIC, anon, authenticated;
