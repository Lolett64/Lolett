-- Migration : ajout champ image fondatrice (CMS) + champ lola_message contact
-- Permet à Lola de modifier ces éléments depuis /admin/contenu

-- Photo fondatrice — page d'accueil (section brand_story)
INSERT INTO site_content (section, key, value, type, label, sort_order)
VALUES ('brand_story', 'founder_image', '/images/fondatrice.jpg', 'image', 'Photo de la fondatrice', 20)
ON CONFLICT (section, key) DO NOTHING;

-- Photo fondatrice — page Notre Histoire (section notre_histoire)
INSERT INTO site_content (section, key, value, type, label, sort_order)
VALUES ('notre_histoire', 'founder_image', '/images/fondatrice.jpg', 'image', 'Photo fondatrice (Notre Histoire)', 20)
ON CONFLICT (section, key) DO NOTHING;

-- Citation de Lola — page Contact
INSERT INTO site_content (section, key, value, type, label, sort_order)
VALUES (
  'contact',
  'lola_message',
  '"Derrière chaque commande, il y a quelqu''un. Et je veux que tu saches que c''est moi qui te réponds. Pas un robot, pas un service client externalisé — moi. Si tu as une question, une idée, ou juste envie de discuter, écris-moi."',
  'textarea',
  'Citation de Lola (page Contact)',
  10
)
ON CONFLICT (section, key) DO UPDATE SET value = EXCLUDED.value;
