-- =============================================================
-- SEED: site_content — all hardcoded front-end strings
-- =============================================================

-- ── HERO ──────────────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('hero', 'badge_text',        'Collection Été 2026',                                          'text',     'Badge texte',              10),
('hero', 'title_line1',       'L''Élégance',                                                  'text',     'Titre ligne 1',            20),
('hero', 'title_line2',       'Du Sud-Ouest',                                                  'text',     'Titre ligne 2 (doré)',     30),
('hero', 'subtitle',          'Vêtements pensés au Sud, portés partout. Une mode qui respire la lumière et célèbre la vie.', 'textarea', 'Sous-titre',     40),
('hero', 'video_src',         '/videos/hero-beach.mp4',                                        'video',    'Vidéo de fond',            50),
('hero', 'cta1_text',         'Shop Femme',                                                    'text',     'Bouton CTA 1',             60),
('hero', 'cta1_href',         '/shop/femme',                                                   'url',      'Lien CTA 1',               70),
('hero', 'cta2_text',         'Shop Homme',                                                    'text',     'Bouton CTA 2',             80),
('hero', 'cta2_href',         '/shop/homme',                                                   'url',      'Lien CTA 2',               90),
('hero', 'side_text',         'Depuis le Sud de la France',                                    'text',     'Texte latéral',            100),
('hero', 'scroll_label',      'Découvrir',                                                     'text',     'Label scroll',             110);

-- ── COLLECTIONS ───────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('collections', 'homme_label',  'Pour Lui',                                                             'text',  'Label collection homme',    10),
('collections', 'homme_title',  'L''Essentiel Homme',                                                   'text',  'Titre collection homme',    20),
('collections', 'homme_image',  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=85', 'image', 'Image collection homme', 30),
('collections', 'homme_href',   '/shop/homme',                                                          'url',   'Lien collection homme',     40),
('collections', 'femme_label',  'Pour Elle',                                                            'text',  'Label collection femme',    50),
('collections', 'femme_title',  'Élégance Solaire',                                                     'text',  'Titre collection femme',    60),
('collections', 'femme_image',  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85', 'image', 'Image collection femme', 70),
('collections', 'femme_href',   '/shop/femme',                                                          'url',   'Lien collection femme',     80);

-- ── BRAND STORY ───────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('brand_story', 'quote',           'La mode n''est pas une question d''image, mais une question de lumière.', 'textarea', 'Citation principale',       10),
('brand_story', 'quote_author',    'L''esprit du Sud',                                                        'text',     'Auteur de la citation',     20),
('brand_story', 'pillar1_title',   'Qualité durable',                                                         'text',     'Pilier 1 — titre',          30),
('brand_story', 'pillar1_desc',    'Matières nobles sélectionnées pour durer.',                                'text',     'Pilier 1 — description',    40),
('brand_story', 'pillar2_title',   'Style du Sud-Ouest',                                                      'text',     'Pilier 2 — titre',          50),
('brand_story', 'pillar2_desc',    'L''élégance du Sud-Ouest au quotidien.',                                     'text',     'Pilier 2 — description',    60),
('brand_story', 'pillar3_title',   'Simplicité élégante',                                                     'text',     'Pilier 3 — titre',          70),
('brand_story', 'pillar3_desc',    'Prêt à porter, prêt à sortir.',                                           'text',     'Pilier 3 — description',    80);

-- ── NEWSLETTER ────────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('newsletter', 'discount_badge',  '-10% sur ta 1ère commande',                                  'text',     'Badge réduction',       10),
('newsletter', 'title',           'Reste connecté',                                              'text',     'Titre',                 20),
('newsletter', 'description',     'Nouveautés, exclusivités et inspirations du Sud-Ouest.',       'textarea', 'Description',           30),
('newsletter', 'button_text',     'S''inscrire',                                                  'text',     'Texte du bouton',       40),
('newsletter', 'disclaimer',      'Pas de spam, promis. Désinscription en un clic.',              'text',     'Disclaimer',            50);

-- ── TRUST BAR ─────────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('trust_bar', 'message1', 'Livraison offerte dès 100€',  'text', 'Message 1 (livraison)',  10),
('trust_bar', 'message2', 'Retours gratuits 30j',        'text', 'Message 2 (retours)',    20),
('trust_bar', 'message3', 'Paiement 100% sécurisé',     'text', 'Message 3 (paiement)',   30);

-- ── CONTACT ───────────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('contact', 'page_title',     'Parlons ensemble.',                                              'text',     'Titre de la page',          10),
('contact', 'page_subtitle',  'Une question, une suggestion ? On te répond sous 24-48h.',       'text',     'Sous-titre',                20),
('contact', 'email',          'hello@lolett.com',                                               'text',     'Email de contact',          30),
('contact', 'phone',          '+33 6 00 00 00 00',                                              'text',     'Téléphone',                 40),
('contact', 'address',        'Sud de la France',                                               'text',     'Adresse',                   50),
('contact', 'faq1_q',         'Quels sont les délais de livraison ?',                            'text',     'FAQ 1 — question',          60),
('contact', 'faq1_a',         'La livraison standard en France métropolitaine est de 3 à 5 jours ouvrés. Gratuite dès 100€ d''achat.', 'textarea', 'FAQ 1 — réponse', 70),
('contact', 'faq2_q',         'Comment faire un retour ou un échange ?',                         'text',     'FAQ 2 — question',          80),
('contact', 'faq2_a',         'Tu as 14 jours pour retourner un article. Contacte-nous par email et on t''envoie une étiquette retour.', 'textarea', 'FAQ 2 — réponse', 90),
('contact', 'faq3_q',         'Les tailles correspondent-elles ?',                               'text',     'FAQ 3 — question',          100),
('contact', 'faq3_a',         'Nos coupes sont pensées pour tomber juste. Un guide des tailles est disponible sur chaque fiche produit.', 'textarea', 'FAQ 3 — réponse', 110),
('contact', 'faq4_q',         'Où sont fabriqués vos vêtements ?',                               'text',     'FAQ 4 — question',          120),
('contact', 'faq4_a',         'Nous travaillons avec des ateliers en Europe (Portugal, Italie) sélectionnés pour leur savoir-faire.', 'textarea', 'FAQ 4 — réponse', 130);

-- ── FOOTER ────────────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
('footer', 'tagline',          'Mode du Sud-Ouest. Née ici, portée partout. Pour ceux qui aiment la vie sous le soleil.', 'textarea', 'Tagline',               10),
('footer', 'instagram_url',    'https://instagram.com/lolett',     'url',  'Instagram URL',         20),
('footer', 'tiktok_url',       'https://tiktok.com/@lolett',       'url',  'TikTok URL',            30),
('footer', 'facebook_url',     'https://facebook.com/lolett',      'url',  'Facebook URL',          40),
('footer', 'email',            'hello@lolett.com',                 'text', 'Email',                 50),
('footer', 'credit_text',      'Fait avec passion par Propul''SEO', 'text', 'Crédit / agence',       60),
('footer', 'credit_url',       'https://propulseo-site.com',       'url',  'Lien crédit',           70),
('footer', 'bottom_text',      'Fait avec amour depuis le Sud',    'text', 'Texte bas de page',     80);

-- ── NOTRE HISTOIRE ────────────────────────────────────────────
INSERT INTO site_content (section, key, value, type, label, sort_order) VALUES
-- Hero
('notre_histoire', 'hero_subtitle',     'Notre Histoire',                                                         'text',     'Hero — sur-titre',           10),
('notre_histoire', 'hero_title',        'LOLETT',                                                                  'text',     'Hero — titre',               20),
('notre_histoire', 'hero_tagline',      'Pensée au Sud. Portée partout.',                                          'text',     'Hero — tagline',             30),
('notre_histoire', 'hero_image',        'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1600&q=80', 'image',    'Hero — image de fond',       40),
-- Origine
('notre_histoire', 'origine_label',     'L''Origine',                                                              'text',     'Origine — sur-titre',        50),
('notre_histoire', 'origine_title',     'Née dans le Sud-Ouest',                                                   'text',     'Origine — titre',            60),
('notre_histoire', 'origine_text1',     'C''est parti d''une idée simple — on mérite tous d''être bien habillés sans y passer trois heures. Des coupes qui tombent bien, des matières qu''on a envie de toucher, et des prix qui ne font pas grimacer.', 'textarea', 'Origine — paragraphe 1', 70),
('notre_histoire', 'origine_quote',     'Je sélectionne chaque pièce comme si c''était pour moi.',                 'textarea', 'Origine — citation',         80),
('notre_histoire', 'origine_text2',     'Ici, pas de tendances éphémères ni de collections à rallonge. Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant — ouais, je suis bien là.', 'textarea', 'Origine — paragraphe 2', 90),
('notre_histoire', 'origine_image',     '/images/chemise-lin-mediterranee.png',                                    'image',    'Origine — image',            100),
-- Vision
('notre_histoire', 'vision_label',      'Notre Vision',                                                            'text',     'Vision — sur-titre',         110),
('notre_histoire', 'vision_title',      'La plupart des sites te vendent des pièces. Nous, on te propose des looks complets.', 'textarea', 'Vision — titre',  120),
('notre_histoire', 'vision_text',       'Une chemise en lin qui va avec ce chino, cette ceinture et ces chaussures. Tu ajoutes tout d''un clic, et tu es prêt.', 'textarea', 'Vision — description', 130),
('notre_histoire', 'vision_aside',      'C''est comme avoir une amie styliste qui te dit « fais-moi confiance, prends ça ». Sauf que c''est un site, et tu peux le faire en pyjama.', 'textarea', 'Vision — aparté', 140),
('notre_histoire', 'vision_image',      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80', 'image',   'Vision — image de fond',     150),
-- Sud-Ouest
('notre_histoire', 'med_label',         'L''Esprit',                                                               'text',     'Sud-Ouest — sur-titre',      160),
('notre_histoire', 'med_title',         'Sud-Ouest',                                                               'text',     'Sud-Ouest — titre',          170),
('notre_histoire', 'med_text',          'Le soleil, les matières naturelles, l''art de vivre simplement bien. C''est ça, notre ADN.', 'textarea', 'Sud-Ouest — description',    180),
('notre_histoire', 'med_image1',        '/images/robe-midi-provencale.png',                                        'image',    'Galerie — image 1',          190),
('notre_histoire', 'med_image2',        '/images/polo-pique-riviera.png',                                          'image',    'Galerie — image 2',          200),
('notre_histoire', 'med_image3',        'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&q=80',    'image',    'Galerie — image 3',          210),
('notre_histoire', 'med_image4',        '/images/top-lin-cote-azur.png',                                           'image',    'Galerie — image 4',          220),
('notre_histoire', 'med_image5',        '/images/chino-sable.png',                                                 'image',    'Galerie — image 5',          230);
