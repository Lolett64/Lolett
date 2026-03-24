-- LOLETT — Promotions system
-- 1. Add compare_at_price to products (for sales/soldes)
-- 2. Create promo_codes table

-- ============================================
-- 1. PRIX BARRÉ (soldes)
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2) DEFAULT NULL;

-- ============================================
-- 2. CODES PROMO
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order NUMERIC(10,2) DEFAULT 0,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active) WHERE active = TRUE;

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active promo codes" ON promo_codes
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Service role manage promo codes" ON promo_codes
  FOR ALL USING (auth.role() = 'service_role');

CREATE TRIGGER tr_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
