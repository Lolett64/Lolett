-- =============================================================
-- SYNC: brand_story values to match current site hardcoded texts
-- SYNC: contact values to "je" voice (Lola personal tone)
-- =============================================================

-- ── BRAND STORY — match current BrandStorySection.tsx ────────
UPDATE site_content SET value = 'S''habiller c''est s''exprimer, pas impressionner.' WHERE section = 'brand_story' AND key = 'quote';
UPDATE site_content SET value = 'L''esprit du Sud' WHERE section = 'brand_story' AND key = 'quote_author';
UPDATE site_content SET value = 'Matières Nobles' WHERE section = 'brand_story' AND key = 'pillar1_title';
UPDATE site_content SET value = 'Lin pur, coton biologique et fibres naturelles sélectionnées pour leur tombé parfait.' WHERE section = 'brand_story' AND key = 'pillar1_desc';
UPDATE site_content SET value = 'Style du Sud-Ouest' WHERE section = 'brand_story' AND key = 'pillar2_title';
UPDATE site_content SET value = 'Lolett invite le sud dans ton dressing.' WHERE section = 'brand_story' AND key = 'pillar2_desc';
UPDATE site_content SET value = 'Coupe Parfaite' WHERE section = 'brand_story' AND key = 'pillar3_title';
UPDATE site_content SET value = 'Prototypage exclusif dans nos ateliers de Bordeaux. Une architecture du vêtement sans compromis.' WHERE section = 'brand_story' AND key = 'pillar3_desc';

-- Add body text key for the paragraph below the quote
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('brand_story', 'body_text', 'Chez Lolett, le vêtement ne contraint jamais. Il accompagne le mouvement, reflète la lumière du bassin et vieillit avec la grâce des matières naturelles. Nos racines s''ancrent profondément dans le sable chaud de la côte Atlantique.', 'textarea', 'Texte principal', 15),
('brand_story', 'cta_text', 'Découvrir la Maison', 'text', 'Bouton CTA', 90),
('brand_story', 'cta_href', '/notre-histoire', 'url', 'Lien CTA', 100)
ON CONFLICT DO NOTHING;

-- ── CONTACT — passage au "je" (voix Lola) ───────────────────
UPDATE site_content SET value = 'Écris-moi' WHERE section = 'contact' AND key = 'page_title';
UPDATE site_content SET value = 'Une question, une idée ? Je te réponds sous 24-48h.' WHERE section = 'contact' AND key = 'page_subtitle';

-- Remove phone (set empty)
UPDATE site_content SET value = '' WHERE section = 'contact' AND key = 'phone';

-- FAQ in "je/tu" voice
UPDATE site_content SET value = 'Quels sont les délais de livraison ?' WHERE section = 'contact' AND key = 'faq1_q';
UPDATE site_content SET value = 'Compte 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est offerte dès 100€ d''achat.' WHERE section = 'contact' AND key = 'faq1_a';
UPDATE site_content SET value = 'Comment faire un retour ?' WHERE section = 'contact' AND key = 'faq2_q';
UPDATE site_content SET value = 'Tu as 14 jours après réception pour me retourner tes articles dans leur état d''origine. Envoie-moi un email et je t''envoie une étiquette retour.' WHERE section = 'contact' AND key = 'faq2_a';
UPDATE site_content SET value = 'Comment choisir ma taille ?' WHERE section = 'contact' AND key = 'faq3_q';
UPDATE site_content SET value = 'Un guide des tailles détaillé est dispo sur chaque fiche produit. En cas de doute, écris-moi !' WHERE section = 'contact' AND key = 'faq3_a';
UPDATE site_content SET value = 'Où sont fabriquées les pièces ?' WHERE section = 'contact' AND key = 'faq4_q';
UPDATE site_content SET value = 'Je travaille avec des ateliers familiaux au Portugal et en Italie, sélectionnés pour leur savoir-faire.' WHERE section = 'contact' AND key = 'faq4_a';

-- Add form section labels
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('contact', 'form_title', 'Envoie-moi un message', 'text', 'Titre formulaire', 140),
('contact', 'form_subtitle', 'Je te réponds sous 24-48h.', 'text', 'Sous-titre formulaire', 150)
ON CONFLICT DO NOTHING;
