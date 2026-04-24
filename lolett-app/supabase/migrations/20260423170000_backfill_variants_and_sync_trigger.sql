-- =============================================================
-- Backfill product_variants + trigger auto-sync products.stock
-- =============================================================
-- Pour les ~53 produits existants qui ont products.stock > 0
-- mais aucun variant en product_variants, on crée les variants
-- par (couleur × taille) en distribuant le stock uniformément.
-- Ensuite on met en place un trigger qui maintient
-- products.stock = SUM(variants.stock) à tout moment.

-- ── 1. Backfill : créer les variants manquants ────────────────
DO $$
DECLARE
  prod RECORD;
  color JSONB;
  size TEXT;
  color_idx INT;
  size_idx INT;
  nb_colors INT;
  nb_sizes INT;
  nb_variants INT;
  base_qty INT;
  remainder INT;
  variant_idx INT;
  qty INT;
BEGIN
  FOR prod IN
    SELECT p.id, p.stock, p.sizes, p.colors, p.name
    FROM products p
    WHERE NOT EXISTS (
      SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
    )
      AND p.sizes IS NOT NULL AND array_length(p.sizes, 1) > 0
      AND p.colors IS NOT NULL AND jsonb_array_length(p.colors) > 0
  LOOP
    nb_colors := jsonb_array_length(prod.colors);
    nb_sizes := array_length(prod.sizes, 1);
    nb_variants := nb_colors * nb_sizes;
    base_qty := COALESCE(prod.stock, 0) / nb_variants;
    remainder := COALESCE(prod.stock, 0) % nb_variants;

    variant_idx := 0;
    color_idx := 0;
    WHILE color_idx < nb_colors LOOP
      color := prod.colors -> color_idx;
      size_idx := 1;
      WHILE size_idx <= nb_sizes LOOP
        size := prod.sizes[size_idx];
        qty := base_qty + CASE WHEN variant_idx < remainder THEN 1 ELSE 0 END;
        INSERT INTO product_variants (product_id, color_name, color_hex, size, stock)
        VALUES (
          prod.id,
          color ->> 'name',
          color ->> 'hex',
          size,
          qty
        )
        ON CONFLICT DO NOTHING;
        variant_idx := variant_idx + 1;
        size_idx := size_idx + 1;
      END LOOP;
      color_idx := color_idx + 1;
    END LOOP;

    RAISE NOTICE 'Backfilled % variants for % (stock=% → base=% +% remainder)',
      nb_variants, prod.name, prod.stock, base_qty, remainder;
  END LOOP;
END $$;

-- ── 2. Trigger : maintenir products.stock = SUM(variants.stock) ─
CREATE OR REPLACE FUNCTION sync_product_stock_from_variants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  pid uuid;
  total INT;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  IF pid IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(stock), 0) INTO total
  FROM product_variants
  WHERE product_id = pid;

  UPDATE products
  SET stock = total, updated_at = now()
  WHERE id = pid;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_product_stock_from_variants ON product_variants;

CREATE TRIGGER trg_sync_product_stock_from_variants
AFTER INSERT OR UPDATE OF stock OR DELETE
ON product_variants
FOR EACH ROW
EXECUTE FUNCTION sync_product_stock_from_variants();

COMMENT ON FUNCTION sync_product_stock_from_variants IS
  'Maintient products.stock = SUM(product_variants.stock) automatiquement à chaque mutation sur les variants (inclut le décrément stock à l''achat).';

-- ── 3. Re-synchro initiale de products.stock pour tous les produits ─
-- (après backfill, on force products.stock = SUM(variants.stock) partout)
UPDATE products p
SET stock = COALESCE((
  SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id
), p.stock);
