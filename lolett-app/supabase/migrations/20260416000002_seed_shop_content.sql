-- Shop page CMS content
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  -- Hero
  ('shop', 'hero_badge', 'Collection Été 2026', 'text', 'Badge hero', 10),
  ('shop', 'hero_title', 'La Boutique', 'text', 'Titre principal', 20),
  ('shop', 'hero_subtitle', 'Des pièces pensées pour le Sud. Pour lui, pour elle.', 'textarea', 'Sous-titre', 30),
  -- Card Homme
  ('shop', 'homme_image', '/images/chemise-lin-mediterranee.png', 'image', 'Image hero Homme', 40),
  ('shop', 'homme_label', 'Pour Lui', 'text', 'Label Homme', 50),
  ('shop', 'homme_categories', 'Chemises · Pantalons · Accessoires', 'text', 'Catégories Homme', 60),
  -- Card Femme
  ('shop', 'femme_image', '/images/robe-midi-provencale.png', 'image', 'Image hero Femme', 70),
  ('shop', 'femme_label', 'Pour Elle', 'text', 'Label Femme', 80),
  ('shop', 'femme_categories', 'Robes · Tops · Accessoires', 'text', 'Catégories Femme', 90),
  -- Nouvelles arrivées
  ('shop', 'new_arrivals_badge', 'Just in', 'text', 'Badge nouvelles arrivées', 100),
  ('shop', 'new_arrivals_title', 'Nouvelles arrivées', 'text', 'Titre nouvelles arrivées', 110),
  -- Looks
  ('shop', 'looks_badge', 'Prêt à sortir', 'text', 'Badge looks', 120),
  ('shop', 'looks_title', 'Looks du moment', 'text', 'Titre looks', 130),
  -- Trust bar
  ('shop', 'trust_1_title', 'Livraison offerte', 'text', 'Trust 1 — Titre', 140),
  ('shop', 'trust_1_desc', 'Dès 100€ d''achat en France', 'text', 'Trust 1 — Description', 150),
  ('shop', 'trust_2_title', 'Retours 14 jours', 'text', 'Trust 2 — Titre', 160),
  ('shop', 'trust_2_desc', 'Satisfait ou remboursé', 'text', 'Trust 2 — Description', 170),
  ('shop', 'trust_3_title', 'Qualité premium', 'text', 'Trust 3 — Titre', 180),
  ('shop', 'trust_3_desc', 'Matières nobles & durables', 'text', 'Trust 3 — Description', 190)
ON CONFLICT (section, key) DO NOTHING;

-- Shop page sections visibility
INSERT INTO page_sections (page_slug, section_key, label, visible, sort_order) VALUES
  ('shop', 'hero', 'Hero', true, 0),
  ('shop', 'new_arrivals', 'Nouvelles arrivées', true, 1),
  ('shop', 'looks', 'Looks du moment', true, 2),
  ('shop', 'trust_bar', 'Barre de confiance', true, 3)
ON CONFLICT (page_slug, section_key) DO NOTHING;
