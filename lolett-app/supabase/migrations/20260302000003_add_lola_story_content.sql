-- Add Lola's personal story text to site_content
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('notre_histoire', 'lola_intro', 'Moi c''est Lola, je suis de celles qui ont toujours "un projet en route".', 'textarea', 'Lola — phrase d''accroche', 25),
('notre_histoire', 'lola_text1', 'Des idées plein la tête, l''envie de créer, de construire quelque chose qui me ressemble. Et puis un jour, ce projet-là a pris plus de place que les autres.', 'textarea', 'Lola — paragraphe 1', 26),
('notre_histoire', 'lola_text2', 'Ouvrir ma boutique en ligne de vêtements et accessoires pour femmes et hommes. Un univers à moi. Une sélection pensée avec envie. Une marque construite avec le cœur.', 'textarea', 'Lola — paragraphe 2', 27),
('notre_histoire', 'lola_text3', 'Rien n''est arrivé par hasard. Il y a eu des réflexions, des doutes, des carnets remplis d''idées, et surtout beaucoup d''envie. L''envie de proposer des pièces qui font se sentir bien. L''envie de créer plus qu''une boutique : un projet vivant.', 'textarea', 'Lola — paragraphe 3', 28),
('notre_histoire', 'lola_closing', 'Si tu es ici aujourd''hui, c''est que l''aventure commence vraiment. Et ça, c''est déjà énorme.', 'textarea', 'Lola — conclusion', 29),
('notre_histoire', 'lola_merci', 'Merci d''être là', 'text', 'Lola — remerciement', 30),
-- Update vision to match current content
('notre_histoire', 'vision_gold_text', 'Nous, on te propose des looks complets.', 'text', 'Vision — phrase dorée', 125)
ON CONFLICT DO NOTHING;
