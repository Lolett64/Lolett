-- =============================================================
-- PR 1 — Homepage CMS : rendre éditables les textes de la homepage
-- =============================================================
-- Ajoute / met à jour les clés CMS pour :
--   • brand_story : eyebrow, body_text_2, founder_label, founder_caption
--                   + sync quote + body_text pour matcher le rendu actuel
--   • looks (NOUVELLE) : section "Le Look Complet" sur homepage
--   • new_arrivals (NOUVELLE) : section "Fraîchement Arrivées"
--   • newsletter : sync title + description + button_text pour matcher rendu actuel

-- ── BRAND STORY — sync + nouvelles clés ──────────────────────
UPDATE site_content SET value = 'Je sélectionne chaque pièce comme si c''était pour moi'
  WHERE section = 'brand_story' AND key = 'quote';
UPDATE site_content SET value = 'LOLETT est née d''une envie simple : proposer des pièces que j''aurais moi-même envie de porter. Des matières que l''on sent, des coupes qui restent — sans jamais sacrifier le confort au style.'
  WHERE section = 'brand_story' AND key = 'body_text';

INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('brand_story', 'eyebrow',         'Mon histoire', 'text',     'Sur-titre (eyebrow)',              5),
  ('brand_story', 'body_text_2',     'Chaque sélection est pensée depuis le Sud-Ouest, avec cette idée que s''habiller, c''est s''exprimer — pas impressionner.', 'textarea', 'Texte paragraphe 2', 16),
  ('brand_story', 'founder_label',   'Fondatrice',   'text',     'Label fondatrice (bloc flottant)', 81),
  ('brand_story', 'founder_caption', 'Lolett',       'text',     'Nom fondatrice (bloc flottant)',   82)
ON CONFLICT (section, key) DO NOTHING;

-- ── LOOKS (homepage "Le Look Complet") — NOUVELLE ────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('looks', 'eyebrow',  'Prêt à sortir',                                                 'text',     'Sur-titre (eyebrow)', 10),
  ('looks', 'title',    'Le Look Complet',                                               'text',     'Titre',               20),
  ('looks', 'subtitle', 'Pas envie de réfléchir ? On a composé des ensembles pour toi.', 'textarea', 'Sous-titre',          30),
  ('looks', 'cta_text', 'Adopter ce look',                                               'text',     'Texte bouton CTA',    40)
ON CONFLICT (section, key) DO NOTHING;

-- ── NEW ARRIVALS (homepage "Fraîchement Arrivées") — NOUVELLE ─
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
  ('new_arrivals', 'eyebrow',       'Nouveautés',              'text', 'Sur-titre (eyebrow)',           10),
  ('new_arrivals', 'title_line1',   'Fraîchement',             'text', 'Titre ligne 1',                 20),
  ('new_arrivals', 'title_line2',   'Arrivées',                'text', 'Titre ligne 2 (italique)',      30),
  ('new_arrivals', 'see_all_cta',   'Voir toute la sélection', 'text', 'CTA voir tout (desktop)',       40),
  ('new_arrivals', 'load_more_cta', 'Voir la suite',           'text', 'CTA voir plus (mobile)',        50),
  ('new_arrivals', 'new_tag',       'New',                     'text', 'Tag "New" sur les 1ères cartes', 60)
ON CONFLICT (section, key) DO NOTHING;

-- ── NEWSLETTER — sync avec rendu actuel ──────────────────────
UPDATE site_content SET value = 'Privilèges & Inspirations'
  WHERE section = 'newsletter' AND key = 'title';
UPDATE site_content SET value = 'Inscrivez-vous pour recevoir nos nouvelles créations et exclusivités.'
  WHERE section = 'newsletter' AND key = 'description';
UPDATE site_content SET value = 'Rejoindre'
  WHERE section = 'newsletter' AND key = 'button_text';
