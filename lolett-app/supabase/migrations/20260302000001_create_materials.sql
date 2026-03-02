-- Materials table for "Notre Histoire" page
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Allow public read
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "materials_public_read" ON materials FOR SELECT USING (true);

-- Seed with current + extra materials
INSERT INTO materials (name, icon, sort_order, active) VALUES
  ('Lin', '≡', 1, true),
  ('Coton', '❛', 2, true),
  ('Soie', '〰', 3, true),
  ('Cuir', '◉', 4, true),
  ('Osier', '⌘', 5, true),
  ('Laine', '◎', 6, false),
  ('Cachemire', '❖', 7, false),
  ('Velours', '▣', 8, false),
  ('Denim', '▤', 9, false),
  ('Satin', '◇', 10, false),
  ('Viscose', '∿', 11, false),
  ('Tweed', '⊞', 12, false);
