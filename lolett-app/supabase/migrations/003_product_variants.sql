-- Migration 003 — Gestion du stock par variante (couleur + taille)
-- À exécuter dans le SQL Editor du dashboard Supabase

-- ============================================
-- TABLE: product_variants
-- ============================================

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, color_name, size)
);

-- Index pour performances
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_stock ON product_variants(stock) WHERE stock > 0;

-- Trigger pour auto-update updated_at
CREATE TRIGGER tr_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- MIGRATION DES DONNÉES EXISTANTES
-- ============================================

-- Créer des variantes pour tous les produits existants
-- En utilisant le stock global et en créant une variante pour chaque combinaison couleur/taille
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock)
SELECT 
  p.id as product_id,
  color->>'name' as color_name,
  color->>'hex' as color_hex,
  size as size,
  -- Répartir le stock global équitablement entre les variantes
  -- (arrondi vers le haut pour éviter 0 partout)
  CASE 
    WHEN (SELECT COUNT(*) FROM jsonb_array_elements(p.colors) AS color, unnest(p.sizes) AS size) > 0
    THEN CEIL(p.stock::numeric / NULLIF((SELECT COUNT(*) FROM jsonb_array_elements(p.colors) AS color, unnest(p.sizes) AS size), 0))
    ELSE p.stock
  END as stock
FROM products p
CROSS JOIN LATERAL jsonb_array_elements(p.colors) AS color
CROSS JOIN LATERAL unnest(p.sizes) AS size
WHERE p.stock > 0 OR (SELECT COUNT(*) FROM jsonb_array_elements(p.colors) AS color, unnest(p.sizes) AS size) > 0;

-- Pour les produits sans couleurs définies, créer une variante "par défaut"
INSERT INTO product_variants (product_id, color_name, color_hex, size, stock)
SELECT 
  p.id as product_id,
  'Par défaut' as color_name,
  '#000000' as color_hex,
  size as size,
  p.stock as stock
FROM products p
CROSS JOIN LATERAL unnest(p.sizes) AS size
WHERE NOT EXISTS (
  SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id
)
AND array_length(p.colors, 1) IS NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read product_variants" ON product_variants
  FOR SELECT USING (true);

-- Admin write access (service_role only)
CREATE POLICY "Service role manage product_variants" ON product_variants
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- FONCTION: Calculer le stock total d'un produit
-- ============================================

CREATE OR REPLACE FUNCTION get_product_total_stock(product_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(stock) FROM product_variants WHERE product_id = product_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- VUE: Produits avec stock total calculé
-- ============================================

CREATE OR REPLACE VIEW products_with_stock AS
SELECT 
  p.*,
  COALESCE(SUM(pv.stock), 0) as total_stock,
  COUNT(pv.id) FILTER (WHERE pv.stock > 0) as available_variants_count
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE product_variants IS 'Stock par variante (couleur + taille) pour chaque produit';
COMMENT ON COLUMN product_variants.color_name IS 'Nom de la couleur (ex: "Blanc Écume")';
COMMENT ON COLUMN product_variants.color_hex IS 'Code hexadécimal de la couleur (ex: "#F5F5F5")';
COMMENT ON COLUMN product_variants.size IS 'Taille (ex: "S", "M", "L", "38", "40")';
COMMENT ON FUNCTION get_product_total_stock IS 'Calcule le stock total d''un produit en sommant toutes ses variantes';
