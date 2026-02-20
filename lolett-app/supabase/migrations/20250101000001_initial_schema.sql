-- LOLETT MVP — Migration initiale
-- À exécuter dans le SQL Editor du dashboard Supabase

-- ============================================
-- TABLES
-- ============================================

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
  slug TEXT NOT NULL,
  label TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gender, slug)
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
  category_slug TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors JSONB NOT NULL DEFAULT '[]',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_new BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Looks
CREATE TABLE looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
  cover_image TEXT NOT NULL,
  vibe TEXT,
  short_pitch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Look ↔ Product (junction table)
CREATE TABLE look_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  look_id UUID NOT NULL REFERENCES looks(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(look_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded', 'expired')),
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal')),
  payment_id TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON SET NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price > 0)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_category ON products(gender, category_slug);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_new ON products(is_new) WHERE is_new = TRUE;
CREATE INDEX idx_categories_gender ON categories(gender);
CREATE INDEX idx_looks_gender ON looks(gender);
CREATE INDEX idx_look_products_look ON look_products(look_id);
CREATE INDEX idx_look_products_product ON look_products(product_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- AUTO-UPDATE updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_looks_updated_at
  BEFORE UPDATE ON looks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE look_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read access on catalog (categories, products, looks, look_products)
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public read looks" ON looks
  FOR SELECT USING (true);

CREATE POLICY "Public read look_products" ON look_products
  FOR SELECT USING (true);

-- Orders: service_role only (no public access)
CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access order_items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- Admin write access on catalog (service_role only)
CREATE POLICY "Service role manage categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manage products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update products" ON products
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role delete products" ON products
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Service role manage looks" ON looks
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update looks" ON looks
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role delete looks" ON looks
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Service role manage look_products" ON look_products
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update look_products" ON look_products
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Service role delete look_products" ON look_products
  FOR DELETE USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE BUCKET (product images)
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Service role upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'service_role');

CREATE POLICY "Service role delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'service_role');
