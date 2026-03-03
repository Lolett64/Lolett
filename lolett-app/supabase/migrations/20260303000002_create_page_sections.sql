CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  section_key TEXT NOT NULL,
  label TEXT NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_slug, section_key)
);

CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION update_page_sections_updated_at();

INSERT INTO page_sections (page_slug, section_key, label, sort_order) VALUES
  ('home', 'hero', 'Hero / Vidéo', 0),
  ('home', 'collections', 'Collections', 1),
  ('home', 'new_arrivals', 'Nouveautés', 2),
  ('home', 'brand_story', 'Histoire de marque', 3),
  ('home', 'looks', 'Looks du moment', 4),
  ('home', 'testimonials', 'Témoignages', 5),
  ('home', 'newsletter', 'Newsletter', 6);

INSERT INTO page_sections (page_slug, section_key, label, sort_order) VALUES
  ('notre-histoire', 'hero', 'Hero', 0),
  ('notre-histoire', 'lola', 'Texte Lola', 1),
  ('notre-histoire', 'origine', 'L''origine', 2),
  ('notre-histoire', 'materials', 'Matières', 3),
  ('notre-histoire', 'vision', 'Notre vision', 4),
  ('notre-histoire', 'carousel', 'Carousel inspirations', 5),
  ('notre-histoire', 'cta', 'Call to action', 6);

INSERT INTO page_sections (page_slug, section_key, label, sort_order) VALUES
  ('contact', 'hero', 'Hero', 0),
  ('contact', 'faq', 'FAQ', 1),
  ('contact', 'form', 'Formulaire', 2),
  ('contact', 'newsletter', 'Newsletter', 3);

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page_sections"
  ON page_sections FOR SELECT USING (true);

CREATE POLICY "Service role can manage page_sections"
  ON page_sections FOR ALL USING (true) WITH CHECK (true);
