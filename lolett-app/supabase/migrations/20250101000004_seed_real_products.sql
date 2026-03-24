-- LOLETT — Seed des vrais produits (photos cliente)
-- Remplace les produits placeholder par le catalogue réel
-- À exécuter après 001_initial_schema.sql et 003_product_variants.sql

-- ============================================
-- 0. NETTOYAGE
-- ============================================
DELETE FROM look_products;
DELETE FROM looks;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;

-- ============================================
-- 1. CATEGORIES
-- ============================================

INSERT INTO categories (gender, slug, label, seo_title, seo_description) VALUES
  -- Homme
  ('homme', 'hauts',        'Hauts',                 'Hauts Homme — LOLETT',                    'T-shirts, sweats et chemises homme LOLETT. Des hauts pensés pour les journées ensoleillées et les soirées en terrasse.'),
  ('homme', 'bas',          'Bas',                   'Bas Homme — LOLETT',                      'Jeans et pantalons homme LOLETT. Coupes décontractées et matières de qualité pour un style au quotidien.'),
  ('homme', 'vestes',       'Vestes',                'Vestes Homme — LOLETT',                   'Vestes et blousons homme LOLETT. Des pièces légères et élégantes pour les soirées fraîches.'),
  ('homme', 'accessoires',  'Accessoires',           'Accessoires Homme — LOLETT',              'Sacoches et accessoires homme LOLETT. Les détails qui font la différence.'),
  -- Femme
  ('femme', 'hauts',        'Hauts',                 'Hauts Femme — LOLETT',                    'Tops, blouses et chemisiers femme LOLETT. Des hauts élégants et légers inspirés du soleil du Sud.'),
  ('femme', 'bas',          'Bas',                   'Bas Femme — LOLETT',                      'Jeans, pantalons et shorts femme LOLETT. Des bas fluides et féminins pour chaque occasion.'),
  ('femme', 'robes',        'Robes & Combinaisons',  'Robes & Combinaisons Femme — LOLETT',     'Robes et combinaisons femme LOLETT. Des pièces féminines et légères pour toutes les occasions.'),
  ('femme', 'bijoux',       'Bijoux',                'Bijoux Femme — LOLETT',                   'Bagues, boucles d''oreilles, bracelets et colliers LOLETT. Des bijoux dorés et raffinés pour sublimer chaque tenue.'),
  ('femme', 'chaussures',   'Chaussures',            'Chaussures Femme — LOLETT',               'Mules, espadrilles et mocassins femme LOLETT. Des chaussures confortables et stylées pour l''été.'),
  ('femme', 'sacs',         'Sacs',                  'Sacs Femme — LOLETT',                     'Mini sacs et sacs bandoulière femme LOLETT. Les compagnons indispensables de votre style.')
ON CONFLICT (gender, slug) DO UPDATE SET label = EXCLUDED.label, seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description;

-- ============================================
-- 2. PRODUITS — FEMME — HAUTS
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Isa Marron — Top crop ajusté marron
('isa-marron', 'Isa Marron', 'femme', 'hauts', 39.00,
  ARRAY['/images/products/isa-marron/1.jpg','/images/products/isa-marron/2.jpg','/images/products/isa-marron/3.jpg','/images/products/isa-marron/4.jpg','/images/products/isa-marron/5.jpg'],
  'Top crop ajusté à manches courtes, coupe seconde peau. Son coloris chocolat chaud apporte une touche d''élégance à toutes vos tenues.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Marron","hex":"#6B4226"}]'::jsonb,
  15, true, ARRAY['top','crop','essentiel']),

-- Isa Noir — Top crop ajusté noir
('isa-noir', 'Isa Noir', 'femme', 'hauts', 39.00,
  ARRAY['/images/products/isa-noir/1.jpg','/images/products/isa-noir/2.jpg','/images/products/isa-noir/3.jpg','/images/products/isa-noir/4.jpg'],
  'Top crop ajusté à manches courtes, coupe seconde peau. Le noir indémodable, aussi chic en journée qu''en soirée.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  15, true, ARRAY['top','crop','essentiel']),

-- Lola Noir — Top sans manches noir
('lola-noir', 'Lola Noir', 'femme', 'hauts', 35.00,
  ARRAY['/images/products/lola-noir/1.jpg','/images/products/lola-noir/2.jpg'],
  'Top sans manches à coupe fluide. Son décolleté rond et son tombé léger en font la pièce idéale des journées chaudes.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  20, false, ARRAY['top','basique','été']),

-- Lola Beige — Top sans manches beige
('lola-beige', 'Lola Beige', 'femme', 'hauts', 35.00,
  ARRAY['/images/products/lola-beige/1.jpg','/images/products/lola-beige/2.jpg'],
  'Top sans manches à coupe fluide. Sa teinte beige douce se marie avec tout et illumine le teint.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Beige","hex":"#D4B896"}]'::jsonb,
  20, false, ARRAY['top','basique','été']),

-- Stria — Top péplum boutonné
('stria', 'Stria', 'femme', 'hauts', 45.00,
  ARRAY['/images/products/stria/1.jpeg','/images/products/stria/2.jpeg'],
  'Top péplum sans manches avec boutons dorés sur le devant. Sa basque évasée structure la silhouette avec féminité.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Écru","hex":"#F5F0E1"}]'::jsonb,
  12, true, ARRAY['top','péplum','élégant']),

-- Me — Chemise broderies florales
('me-chemise', 'Me', 'femme', 'hauts', 69.00,
  ARRAY['/images/products/me-chemise/1.jpg','/images/products/me-chemise/2.jpg'],
  'Chemise blanche ornée de broderies florales en relief. Une pièce délicate qui sublime chaque tenue avec poésie.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc","hex":"#FFFFFF"}]'::jsonb,
  10, true, ARRAY['chemise','broderie','romantique']),

-- Lumen — Chemise blanche oversize
('lumen', 'Lumen', 'femme', 'hauts', 59.00,
  ARRAY['/images/products/lumen/1.jpg','/images/products/lumen/2.jpg','/images/products/lumen/3.jpg'],
  'Chemise blanche oversize à la coupe ample et décontractée. Le basique chic par excellence, à porter seul ou en superposition.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc","hex":"#FFFFFF"}]'::jsonb,
  14, false, ARRAY['chemise','oversize','essentiel']),

-- Aura — Blouse blanche plastron bleu brodé
('aura', 'Aura', 'femme', 'hauts', 75.00,
  ARRAY['/images/products/aura/1.jpg','/images/products/aura/2.jpg','/images/products/aura/3.jpg'],
  'Blouse blanche avec plastron bleu orné de broderies florales blanches. Un mélange de tradition et de modernité qui capte tous les regards.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc/Bleu","hex":"#4A7CB5"}]'::jsonb,
  8, true, ARRAY['blouse','broderie','statement']),

-- Floria Jaune — Blouse jaune brodée
('floria-jaune', 'Floria Jaune', 'femme', 'hauts', 65.00,
  ARRAY['/images/products/floria-jaune/1.jpg','/images/products/floria-jaune/2.jpg','/images/products/floria-jaune/3.jpg'],
  'Blouse ample en tissu froissé jaune soleil avec broderies florales sur les manches. Couleur vitaminée, style bohème assumé.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Jaune","hex":"#F4D03F"}]'::jsonb,
  10, true, ARRAY['blouse','broderie','bohème']),

-- Floria Blanche — Blouse blanche broderies marine
('floria-blanche', 'Floria Blanche', 'femme', 'hauts', 65.00,
  ARRAY['/images/products/floria-blanche/1.jpg','/images/products/floria-blanche/2.jpg'],
  'Blouse blanche avec manches bouffantes brodées de motifs floraux bleu marine. Romantique et raffinée, parfaite du bureau à l''apéro.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc/Marine","hex":"#1B2A4A"}]'::jsonb,
  10, false, ARRAY['blouse','broderie','romantique']),

-- Solea Bleu — Chemise rayée bleue
('solea-bleu', 'Solea Bleu', 'femme', 'hauts', 59.00,
  ARRAY['/images/products/solea-bleu/1.jpg'],
  'Chemise à rayures bleues et blanches, coupe décontractée. L''esprit bord de mer dans une pièce intemporelle et facile à porter.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Bleu Rayé","hex":"#5B8FB9"}]'::jsonb,
  12, false, ARRAY['chemise','rayures','casual']),

-- Solea Jaune — Chemise rayée jaune
('solea-jaune', 'Solea Jaune', 'femme', 'hauts', 59.00,
  ARRAY['/images/products/solea-jaune/1.jpg','/images/products/solea-jaune/2.jpg'],
  'Chemise à rayures jaunes et blanches, coupe décontractée. Un souffle de soleil sur votre garde-robe.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Jaune Rayé","hex":"#F7DC6F"}]'::jsonb,
  12, false, ARRAY['chemise','rayures','casual']),

-- Didi — Gilet crochet multicolore
('didi', 'Didi', 'femme', 'hauts', 55.00,
  ARRAY['/images/products/didi/1.jpg','/images/products/didi/2.jpg','/images/products/didi/3.jpg','/images/products/didi/4.jpg'],
  'Gilet en crochet façon granny squares aux couleurs vives. Pièce artisanale et bohème, chaque carré raconte une histoire.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Multicolore","hex":"#E74C3C"}]'::jsonb,
  8, true, ARRAY['gilet','crochet','bohème','artisanal']),

-- Solène — Débardeur bleu marine brodé
('solene', 'Solène', 'femme', 'hauts', 49.00,
  ARRAY['/images/products/solene/1.jpg','/images/products/solene/2.jpg','/images/products/solene/3.jpg','/images/products/solene/4.jpg'],
  'Débardeur bleu marine parsemé de petites fleurs brodées à la main. Se porte seul ou superposé sur une chemise blanche pour un look preppy.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Marine","hex":"#1B2A4A"}]'::jsonb,
  10, true, ARRAY['débardeur','broderie','preppy']),

-- Haut Sonia — Haut péplum écru
('haut-sonia', 'Haut Sonia', 'femme', 'hauts', 49.00,
  ARRAY['/images/products/haut-sonia/1.jpg','/images/products/haut-sonia/2.jpg'],
  'Haut péplum col V en coton écru, manches courtes et basque évasée. Structuré et féminin, il se coordonne avec le Short Sonia pour un ensemble raffiné.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Écru","hex":"#F5F0E1"}]'::jsonb,
  12, true, ARRAY['haut','péplum','ensemble']),

-- Jade — Top crop blanc
('jade', 'Jade', 'femme', 'hauts', 35.00,
  ARRAY['/images/products/jade/1.jpg','/images/products/jade/2.jpg'],
  'Top crop blanc à manches courtes, coupe ajustée et tissu stretch confortable. Le basique lumineux qui va avec tout.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc","hex":"#FFFFFF"}]'::jsonb,
  18, false, ARRAY['top','crop','basique']),

-- Amor Rose — T-shirt rose "More Amor Por Favor"
('amor-rose', 'Amor Rose', 'femme', 'hauts', 39.00,
  ARRAY['/images/products/amor-rose/1.jpg'],
  'T-shirt rose avec imprimé "More Amor Por Favor" sur fond rayé multicolore. Un message d''amour porté avec style et bonne humeur.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Rose","hex":"#F4A7BB"}]'::jsonb,
  18, true, ARRAY['tshirt','imprimé','message']),

-- Amor Blanc — T-shirt blanc "More Amor Por Favor"
('amor-blanc', 'Amor Blanc', 'femme', 'hauts', 39.00,
  ARRAY['/images/products/amor-blanc/1.jpg'],
  'T-shirt blanc cassé avec imprimé "More Amor Por Favor" sur fond rayé. La version douce et lumineuse de notre bestseller.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc Cassé","hex":"#FAF9F6"}]'::jsonb,
  18, true, ARRAY['tshirt','imprimé','message']),

-- Léo — Veste léopard
('leo', 'Léo', 'femme', 'hauts', 89.00,
  ARRAY['/images/products/leo/1.jpg','/images/products/leo/2.jpg','/images/products/leo/3.jpg'],
  'Veste en denim imprimé léopard avec boutons dorés. Pièce forte et audacieuse à jeter sur les épaules pour un look wild chic.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Léopard","hex":"#8B6914"}]'::jsonb,
  6, true, ARRAY['veste','léopard','statement']);

-- ============================================
-- 3. PRODUITS — FEMME — BAS
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Joy — Jean wide-leg bleu clair
('joy', 'Joy', 'femme', 'bas', 79.00,
  ARRAY['/images/products/joy/1.jpg','/images/products/joy/2.jpg','/images/products/joy/3.jpg','/images/products/joy/4.jpg'],
  'Jean wide-leg taille haute en denim bleu clair délavé. Sa coupe large et fluide allonge la silhouette pour un style effortless.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Bleu Clair","hex":"#A8C8E8"}]'::jsonb,
  12, true, ARRAY['jean','wide-leg','denim']),

-- Ayma — Pantalon blanc rivets dorés
('ayma', 'Ayma', 'femme', 'bas', 85.00,
  ARRAY['/images/products/ayma/1.jpg','/images/products/ayma/2.jpg','/images/products/ayma/3.jpg'],
  'Pantalon blanc coupe droite orné de rivets dorés le long des coutures. Alliance parfaite entre simplicité et détails précieux.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Blanc","hex":"#FAF9F6"}]'::jsonb,
  10, true, ARRAY['pantalon','blanc','rivets']),

-- Pia — Pantalon fluide bleu clair
('pia', 'Pia', 'femme', 'bas', 65.00,
  ARRAY['/images/products/pia/1.jpg','/images/products/pia/2.jpg','/images/products/pia/3.jpg'],
  'Pantalon fluide bleu ciel avec taille élastiquée et cordon. Léger comme une brise, parfait pour les journées d''été.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Bleu Ciel","hex":"#87CEEB"}]'::jsonb,
  14, false, ARRAY['pantalon','fluide','été']),

-- Bas Sonia — Short écru
('bas-sonia', 'Short Sonia', 'femme', 'bas', 45.00,
  ARRAY['/images/products/bas-sonia/1.jpg','/images/products/bas-sonia/2.jpg'],
  'Short taille haute en coton écru avec plis marqués. Se coordonne avec le Haut Sonia pour un ensemble chic et estival.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Écru","hex":"#F5F0E1"}]'::jsonb,
  12, true, ARRAY['short','ensemble','été']),

-- You — Pantalon beige coupe droite
('you', 'You', 'femme', 'bas', 69.00,
  ARRAY['/images/products/you/1.jpg','/images/products/you/2.jpg','/images/products/you/3.jpg','/images/products/you/4.jpg'],
  'Pantalon beige coupe droite large, tissu épais et confortable. Un essentiel passe-partout du quotidien.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Beige","hex":"#C8B88A"}]'::jsonb,
  14, false, ARRAY['pantalon','beige','essentiel']),

-- Malou — Jean wide-leg bleu clair
('malou', 'Malou', 'femme', 'bas', 75.00,
  ARRAY['/images/products/malou/1.jpg','/images/products/malou/2.jpg','/images/products/malou/3.jpg'],
  'Jean wide-leg en denim bleu clair, taille haute et coupe évasée. Le jean incontournable de la saison, confortable et tendance.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Bleu Clair","hex":"#A8C8E8"}]'::jsonb,
  12, false, ARRAY['jean','wide-leg','denim']);

-- ============================================
-- 4. PRODUITS — FEMME — ROBES & COMBINAISONS
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Zoe — Robe longue à pois
('zoe', 'Zoe', 'femme', 'robes', 89.00,
  ARRAY['/images/products/zoe/1.jpg','/images/products/zoe/2.jpg','/images/products/zoe/3.jpg'],
  'Robe longue à bretelles fines en tissu fluide chocolat à pois blancs. Allure rétro et féminine, parfaite pour les soirées d''été.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Chocolat à Pois","hex":"#3C1F0E"}]'::jsonb,
  8, true, ARRAY['robe','pois','été','rétro']),

-- Alba — Combishort en jean à coeurs
('alba', 'Alba', 'femme', 'robes', 79.00,
  ARRAY['/images/products/alba/1.jpg','/images/products/alba/2.jpg','/images/products/alba/3.jpg'],
  'Combishort en jean bleu avec motifs coeurs brodés. Pièce fun et pétillante, elle apporte une dose de bonne humeur à votre look.',
  ARRAY['XS','S','M','L'],
  '[{"name":"Bleu Jean","hex":"#6B8FAF"}]'::jsonb,
  10, true, ARRAY['combishort','jean','coeurs']);

-- ============================================
-- 5. PRODUITS — FEMME — BIJOUX
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Flowers Bague
('flowers-bague', 'Flowers Bague', 'femme', 'bijoux', 29.00,
  ARRAY['/images/products/flowers-bague/1.jpg'],
  'Bague fleur en métal doré avec perle nacrée centrale. Pièce statement de la collection Flowers, elle habille la main avec grâce.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  20, true, ARRAY['bague','fleur','doré','perle']),

-- Flowers Boucles d'Oreilles
('flowers-boucles-oreilles', 'Flowers Boucles d''Oreilles', 'femme', 'bijoux', 32.00,
  ARRAY['/images/products/flowers-boucles-oreilles/1.jpg'],
  'Boucles d''oreilles fleur en métal doré avec perle nacrée. Le bijou de la collection Flowers qui encadre le visage d''élégance.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  20, true, ARRAY['boucles','fleur','doré','perle']),

-- Flowers Bracelet
('flowers-bracelet', 'Flowers Bracelet', 'femme', 'bijoux', 35.00,
  ARRAY['/images/products/flowers-bracelet/1.jpg'],
  'Bracelet manchette doré avec large fleur et perle nacrée. Pièce maîtresse de la collection Flowers, il attire tous les regards.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  15, true, ARRAY['bracelet','fleur','doré','perle']),

-- Flowers Collier
('flowers-collier', 'Flowers Collier', 'femme', 'bijoux', 39.00,
  ARRAY['/images/products/flowers-collier/1.jpg'],
  'Collier ras de cou doré avec pendentif fleur et perle nacrée. Il complète la collection Flowers pour un total look bijoux assorti.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  15, true, ARRAY['collier','fleur','doré','perle']),

-- Mao Argent — Créoles texturées argent
('mao-argent', 'Mao Argent', 'femme', 'bijoux', 25.00,
  ARRAY['/images/products/mao-argent/1.jpg'],
  'Créoles texturées effet froissé en métal argenté avec goutte pendante dorée. Un duo de métaux audacieux et moderne.',
  ARRAY['TU'],
  '[{"name":"Argent","hex":"#C0C0C0"}]'::jsonb,
  18, false, ARRAY['créoles','argent','texturé']),

-- Mao Or — Créoles texturées or
('mao-or', 'Mao Or', 'femme', 'bijoux', 25.00,
  ARRAY['/images/products/mao-or/1.jpg'],
  'Créoles texturées effet froissé en métal doré. Un bijou sculptural qui apporte du caractère à chaque tenue.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  18, false, ARRAY['créoles','or','texturé']),

-- Marie — Bague sphères dorées
('marie', 'Marie', 'femme', 'bijoux', 27.00,
  ARRAY['/images/products/marie/1.jpg'],
  'Bague imposante composée de sphères dorées empilées. Bijou sculptural et contemporain, elle fait de votre main une oeuvre d''art.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  15, true, ARRAY['bague','doré','sculptural']),

-- Aida — Bague vague dorée
('aida', 'Aida', 'femme', 'bijoux', 25.00,
  ARRAY['/images/products/aida/1.jpg'],
  'Bague sculptural en métal doré, forme fluide et organique rappelant une vague. Minimaliste et élégante au quotidien.',
  ARRAY['TU'],
  '[{"name":"Or","hex":"#D4AF37"}]'::jsonb,
  18, false, ARRAY['bague','doré','minimaliste']);

-- ============================================
-- 6. PRODUITS — FEMME — CHAUSSURES
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Keur — Mules à coeurs
('keur', 'Keur', 'femme', 'chaussures', 55.00,
  ARRAY['/images/products/keur/1.jpg','/images/products/keur/2.jpg','/images/products/keur/3.jpg'],
  'Mules à semelle bois avec bride en cuir beige ornée de petits coeurs rouges brodés. Un pas après l''autre, avec amour.',
  ARRAY['36','37','38','39','40'],
  '[{"name":"Beige Coeurs","hex":"#D4B896"}]'::jsonb,
  10, true, ARRAY['mules','coeurs','cuir','été']),

-- Amore — Espadrilles
('amore', 'Amore', 'femme', 'chaussures', 49.00,
  ARRAY['/images/products/amore/1.jpg','/images/products/amore/2.jpg'],
  'Espadrilles crème avec inscription "AMORE" sur la semelle en jute. Légères et romantiques, elles sentent bon le Sud.',
  ARRAY['36','37','38','39','40'],
  '[{"name":"Crème","hex":"#FFFDD0"}]'::jsonb,
  12, true, ARRAY['espadrilles','jute','été']),

-- Rivera — Mocassins à franges
('rivera', 'Rivera', 'femme', 'chaussures', 59.00,
  ARRAY['/images/products/rivera/1.jpg'],
  'Mocassins en daim beige avec franges et perles colorées. Esprit folk et artisanal pour des pas pleins de personnalité.',
  ARRAY['36','37','38','39','40'],
  '[{"name":"Beige Daim","hex":"#C2A87D"}]'::jsonb,
  8, false, ARRAY['mocassins','daim','franges','folk']);

-- ============================================
-- 7. PRODUITS — FEMME — SACS
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Solis Léopard — Mini sac bandoulière léopard
('solis-leopard', 'Solis Léopard', 'femme', 'sacs', 39.00,
  ARRAY['/images/products/solis-leopard/1.jpg'],
  'Mini sac bandoulière en toile imprimé léopard bleu. Compact et tendance, il libère les mains sans sacrifier le style.',
  ARRAY['TU'],
  '[{"name":"Léopard Bleu","hex":"#4A6FA5"}]'::jsonb,
  15, true, ARRAY['sac','bandoulière','léopard']),

-- Solis Bleu — Mini sac bandoulière bleu
('solis-bleu', 'Solis Bleu', 'femme', 'sacs', 39.00,
  ARRAY['/images/products/solis-bleu/1.jpg'],
  'Mini sac bandoulière en toile bleu ciel. L''essentiel au bout de la bandoulière, léger et pratique au quotidien.',
  ARRAY['TU'],
  '[{"name":"Bleu Ciel","hex":"#87CEEB"}]'::jsonb,
  15, false, ARRAY['sac','bandoulière','bleu']);

-- ============================================
-- 8. PRODUITS — HOMME — HAUTS
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Emoticoeurs Noir — Hoodie noir
('emoticoeurs-noir', 'Emoticoeurs Noir', 'homme', 'hauts', 75.00,
  ARRAY['/images/products/emoticoeurs-noir/1.jpg','/images/products/emoticoeurs-noir/2.jpg','/images/products/emoticoeurs-noir/3.jpg','/images/products/emoticoeurs-noir/4.jpg'],
  'Hoodie noir avec trois coeurs expressifs imprimés sur le devant. Streetwear et fun, il affiche votre humeur du jour.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  15, true, ARRAY['hoodie','coeurs','streetwear']),

-- Emoticoeurs Blanc — Hoodie blanc
('emoticoeurs-blanc', 'Emoticoeurs Blanc', 'homme', 'hauts', 75.00,
  ARRAY['/images/products/emoticoeurs-blanc/1.jpg','/images/products/emoticoeurs-blanc/2.jpg','/images/products/emoticoeurs-blanc/3.jpg','/images/products/emoticoeurs-blanc/4.jpg'],
  'Hoodie blanc avec trois coeurs expressifs imprimés sur le devant. Version lumineuse du bestseller, même énergie, autre vibe.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Blanc","hex":"#F5F5F5"}]'::jsonb,
  15, true, ARRAY['hoodie','coeurs','streetwear']),

-- Mission Rose — T-shirt rose uni logo
('mission-rose', 'Mission Rose', 'homme', 'hauts', 35.00,
  ARRAY['/images/products/mission-rose/1.jpg','/images/products/mission-rose/2.jpg'],
  'T-shirt rose poudré avec logo LOLETT ton sur ton sur la poitrine. Minimaliste et doux, le basique qu''on enfile les yeux fermés.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Rose Poudré","hex":"#F0B8B8"}]'::jsonb,
  20, false, ARRAY['tshirt','basique','logo']),

-- Mission Beige — T-shirt beige uni logo
('mission-beige', 'Mission Beige', 'homme', 'hauts', 35.00,
  ARRAY['/images/products/mission-beige/1.jpg','/images/products/mission-beige/2.jpg'],
  'T-shirt beige avec logo LOLETT discret sur la poitrine. La base parfaite de tout look décontracté et soigné.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Beige","hex":"#D4C4A8"}]'::jsonb,
  20, false, ARRAY['tshirt','basique','logo']),

-- Essentiel — T-shirt blanc "NEED"
('essentiel', 'Essentiel', 'homme', 'hauts', 39.00,
  ARRAY['/images/products/essentiel/1.jpg','/images/products/essentiel/2.jpg','/images/products/essentiel/3.jpg'],
  'T-shirt blanc avec inscription "NEED" en rose sur la poitrine. Simple, direct, efficace — le message est clair.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Blanc","hex":"#FFFFFF"}]'::jsonb,
  18, true, ARRAY['tshirt','imprimé','message']),

-- Saison — Sweat beige coeur rouge
('saison', 'Saison', 'homme', 'hauts', 69.00,
  ARRAY['/images/products/saison/1.jpg','/images/products/saison/2.jpg'],
  'Sweatshirt beige avec coeur rouge brodé et inscription sur la poitrine. Confort douillet et détail coup de coeur.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Beige","hex":"#D4C4A8"}]'::jsonb,
  12, true, ARRAY['sweat','coeur','broderie']),

-- Printemps — T-shirt noir "Fleurs de Printemps"
('printemps', 'Printemps', 'homme', 'hauts', 39.00,
  ARRAY['/images/products/printemps/1.jpg','/images/products/printemps/2.jpg','/images/products/printemps/3.jpg'],
  'T-shirt noir avec imprimé "Fleurs de Printemps" et motif floral doré sur la poitrine. L''art de mixer streetwear et poésie.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  15, true, ARRAY['tshirt','imprimé','floral']),

-- Riva — Chemise manches courtes rayée
('riva', 'Riva', 'homme', 'hauts', 65.00,
  ARRAY['/images/products/riva/1.jpg','/images/products/riva/2.jpg','/images/products/riva/3.jpg'],
  'Chemise manches courtes en maille texturée à rayures. Col cubain et coupe décontractée, l''esprit vacances au quotidien.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Écru/Gris","hex":"#B8B0A0"}]'::jsonb,
  10, true, ARRAY['chemise','rayures','cubain','été']);

-- ============================================
-- 9. PRODUITS — HOMME — BAS
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Karl — Jean bleu clair
('karl', 'Karl', 'homme', 'bas', 79.00,
  ARRAY['/images/products/karl/1.jpg','/images/products/karl/2.jpg','/images/products/karl/3.jpg','/images/products/karl/4.jpg'],
  'Jean coupe droite en denim bleu clair délavé. Le classique revisité avec une coupe moderne et un confort optimal.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Bleu Clair","hex":"#A8C8E8"}]'::jsonb,
  14, false, ARRAY['jean','denim','classique']),

-- Fefe — Jean bleu medium
('fefe', 'Fefe', 'homme', 'bas', 79.00,
  ARRAY['/images/products/fefe/1.jpg','/images/products/fefe/2.jpg'],
  'Jean coupe droite en denim bleu medium. Polyvalent et indémodable, il se porte du matin au soir sans effort.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Bleu Medium","hex":"#5B8DB8"}]'::jsonb,
  14, false, ARRAY['jean','denim','classique']),

-- Alto — Jean motif losange
('alto', 'Alto', 'homme', 'bas', 89.00,
  ARRAY['/images/products/alto/1.jpg','/images/products/alto/2.jpg','/images/products/alto/3.jpg'],
  'Jean coupe large en denim bleu avec motif losange all-over. Pièce audacieuse et originale pour ceux qui osent la différence.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Bleu Motif","hex":"#5B8DB8"}]'::jsonb,
  8, true, ARRAY['jean','motif','statement']),

-- Mat — Pantalon noir slim
('mat', 'Mat', 'homme', 'bas', 69.00,
  ARRAY['/images/products/mat/1.jpg','/images/products/mat/2.jpg'],
  'Pantalon noir coupe slim en tissu léger. L''incontournable du vestiaire masculin, chic et confortable en toute circonstance.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  16, false, ARRAY['pantalon','noir','slim','essentiel']);

-- ============================================
-- 10. PRODUITS — HOMME — VESTES
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Origin — Blouson beige
('origin', 'Origin', 'homme', 'vestes', 95.00,
  ARRAY['/images/products/origin/1.jpg','/images/products/origin/2.jpg','/images/products/origin/3.jpg'],
  'Blouson léger en coton beige avec col contrasté gris. Fermeture zippée et poche poitrine. La veste mi-saison élégante et fonctionnelle.',
  ARRAY['S','M','L','XL'],
  '[{"name":"Beige","hex":"#D4C4A8"}]'::jsonb,
  8, true, ARRAY['blouson','veste','mi-saison']);

-- ============================================
-- 11. PRODUITS — HOMME — ACCESSOIRES
-- ============================================

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags) VALUES

-- Kev — Sacoche bandoulière noire
('kev', 'Kev', 'homme', 'accessoires', 45.00,
  ARRAY['/images/products/kev/1.jpg'],
  'Sacoche bandoulière noire compacte au design épuré. L''accessoire urbain indispensable pour garder l''essentiel à portée de main.',
  ARRAY['TU'],
  '[{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  20, true, ARRAY['sacoche','bandoulière','urbain']);

-- ============================================
-- 12. LOOKS
-- ============================================

INSERT INTO looks (title, gender, cover_image, vibe, short_pitch) VALUES
  ('Ensemble Sonia', 'femme', '/images/products/haut-sonia/1.jpg', 'Brunch entre amies', 'Haut péplum et short assorti écru. L''ensemble coordonné chic et décontracté.'),
  ('Collection Flowers', 'femme', '/images/products/flowers-collier/1.jpg', 'Soirée dorée', 'Collier, bracelet, bague et boucles d''oreilles fleur dorée. Le set bijoux complet pour briller.'),
  ('Street Emoticoeurs', 'homme', '/images/products/emoticoeurs-noir/1.jpg', 'Week-end en ville', 'Hoodie Emoticoeurs et jean Alto. Le duo streetwear qui a du coeur.');

-- Look "Ensemble Sonia"
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Ensemble Sonia'), (SELECT id FROM products WHERE slug = 'haut-sonia'), 0;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Ensemble Sonia'), (SELECT id FROM products WHERE slug = 'bas-sonia'), 1;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Ensemble Sonia'), (SELECT id FROM products WHERE slug = 'keur'), 2;

-- Look "Collection Flowers"
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Collection Flowers'), (SELECT id FROM products WHERE slug = 'flowers-collier'), 0;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Collection Flowers'), (SELECT id FROM products WHERE slug = 'flowers-bracelet'), 1;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Collection Flowers'), (SELECT id FROM products WHERE slug = 'flowers-bague'), 2;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Collection Flowers'), (SELECT id FROM products WHERE slug = 'flowers-boucles-oreilles'), 3;

-- Look "Street Emoticoeurs"
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Street Emoticoeurs'), (SELECT id FROM products WHERE slug = 'emoticoeurs-noir'), 0;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Street Emoticoeurs'), (SELECT id FROM products WHERE slug = 'alto'), 1;
INSERT INTO look_products (look_id, product_id, position)
SELECT (SELECT id FROM looks WHERE title = 'Street Emoticoeurs'), (SELECT id FROM products WHERE slug = 'kev'), 2;
