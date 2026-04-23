-- Audit CMS : aligner pages admin et pages publiques
-- 1) Supprimer les sections orphelines de page_sections (home)
DELETE FROM page_sections WHERE page_slug = 'home' AND section_key IN ('collections', 'testimonials');

-- 2) Supprimer le contenu orphelin de site_content (testimonials)
DELETE FROM site_content WHERE section = 'testimonials';

-- 3) Ajouter le contenu CMS pour les pages manquantes

-- Collection Femme
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('shop_femme', 'hero_title', 'Collection Femme', 'text', 'Titre hero', 10),
  ('shop_femme', 'hero_subtitle', 'Robes fluides, tops en lin. L''art de vivre à la mode du Sud-Ouest.', 'textarea', 'Sous-titre hero', 20)
ON CONFLICT (section, key) DO NOTHING;

-- Collection Homme
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('shop_homme', 'hero_title', 'Collection Homme', 'text', 'Titre hero', 10),
  ('shop_homme', 'hero_subtitle', 'Lin léger, coton premium. Tout ce qu''il faut pour un été au Sud.', 'textarea', 'Sous-titre hero', 20)
ON CONFLICT (section, key) DO NOTHING;

-- Page Nouveautés
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('nouveautes', 'badge', 'Nouvelle Collection', 'text', 'Badge', 10),
  ('nouveautes', 'hero_title', 'Fraîchement Débarquées', 'text', 'Titre hero', 20),
  ('nouveautes', 'hero_subtitle', 'Les pièces de la saison. À peine arrivées, déjà indispensables.', 'textarea', 'Sous-titre hero', 30)
ON CONFLICT (section, key) DO NOTHING;

-- Page Looks
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('looks_page', 'badge', 'Inspiration', 'text', 'Badge', 10),
  ('looks_page', 'hero_title', 'Looks du moment', 'text', 'Titre hero', 20),
  ('looks_page', 'hero_subtitle', 'Des tenues complètes, pensées pour vous. Cliquez sur un look pour découvrir les pièces.', 'textarea', 'Sous-titre hero', 30)
ON CONFLICT (section, key) DO NOTHING;
