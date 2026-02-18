-- LOLETT MVP — Seed des données initiales
-- À exécuter dans le SQL Editor du dashboard Supabase (après 001_initial_schema.sql)
-- Ordre : categories → products → looks → look_products

-- ============================================
-- 1. CATEGORIES
-- ============================================

INSERT INTO categories (gender, slug, label, seo_title, seo_description) VALUES
  ('homme', 'chemises',    'Chemises & Polos',  'Chemises et Polos Homme | LOLETT',    'Chemises en lin, polos piqué — élégance décontractée à la française.'),
  ('homme', 'pantalons',   'Pantalons',         'Pantalons Homme | LOLETT',            'Chinos, bermudas — les essentiels de votre garde-robe estivale.'),
  ('homme', 'accessoires', 'Accessoires',       'Accessoires Homme | LOLETT',          'Casquettes, ceintures — les détails qui font la différence.'),
  ('femme', 'robes',       'Robes & Jupes',     'Robes et Jupes Femme | LOLETT',       'Robes midi, jupes longues — féminité et légèreté méditerranéenne.'),
  ('femme', 'tops',        'Tops & Blouses',    'Tops et Blouses Femme | LOLETT',      'Tops en lin, blouses romantiques — l''essentiel de l''été.'),
  ('femme', 'accessoires', 'Accessoires',       'Accessoires Femme | LOLETT',          'Paniers, foulards — les compagnons indispensables de votre style.')
ON CONFLICT (gender, slug) DO NOTHING;

-- ============================================
-- 2. PRODUCTS
-- ============================================

-- HOMME

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'chemise-lin-mediterranee',
  'Chemise Lin Méditerranée',
  'homme',
  'chemises',
  89.00,
  ARRAY[
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80'
  ],
  'Chemise en lin léger, parfaite pour les soirées d''été. Coupe décontractée, finitions soignées. Le lin s''adoucit à chaque lavage.',
  ARRAY['S', 'M', 'L', 'XL'],
  '[{"name":"Blanc Écume","hex":"#F5F5F5"},{"name":"Bleu Ciel","hex":"#87CEEB"}]'::jsonb,
  15, true, ARRAY['lin','été','essentiel'],
  '2024-06-01T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'pantalon-chino-sable',
  'Chino Sable',
  'homme',
  'pantalons',
  95.00,
  ARRAY[
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'
  ],
  'Chino coupe slim en coton stretch. Confortable du matin au soir. La pièce indispensable de votre garde-robe estivale.',
  ARRAY['S', 'M', 'L', 'XL'],
  '[{"name":"Sable","hex":"#C2B280"},{"name":"Marine","hex":"#1B3A57"}]'::jsonb,
  12, true, ARRAY['coton','casual','essentiel'],
  '2024-06-02T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'polo-pique-riviera',
  'Polo Piqué Riviera',
  'homme',
  'chemises',
  65.00,
  ARRAY[
    'https://images.unsplash.com/photo-1625910513413-5fc45e80b8c7?w=800&q=80',
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80'
  ],
  'Polo en coton piqué premium. Col souple, coupe ajustée. L''élégance décontractée à la française.',
  ARRAY['S', 'M', 'L', 'XL'],
  '[{"name":"Blanc","hex":"#FFFFFF"},{"name":"Bleu LOLETT","hex":"#2418A6"}]'::jsonb,
  20, false, ARRAY['coton','classique','polo'],
  '2024-05-15T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'bermuda-lin-mistral',
  'Bermuda Lin Mistral',
  'homme',
  'pantalons',
  75.00,
  ARRAY[
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800&q=80'
  ],
  'Bermuda en lin mélangé, taille élastiquée au dos. Parfait pour la plage comme pour l''apéro.',
  ARRAY['S', 'M', 'L', 'XL'],
  '[{"name":"Beige","hex":"#D4C4A8"},{"name":"Olive","hex":"#808000"}]'::jsonb,
  8, false, ARRAY['lin','été','décontracté'],
  '2024-05-20T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'casquette-coton-sunset',
  'Casquette Sunset',
  'homme',
  'accessoires',
  35.00,
  ARRAY[
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
    'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80'
  ],
  'Casquette en coton canvas avec logo LOLETT brodé. Protection solaire et style assuré.',
  ARRAY['TU'],
  '[{"name":"Beige","hex":"#D4C4A8"},{"name":"Marine","hex":"#1B3A57"}]'::jsonb,
  25, true, ARRAY['accessoire','été','casquette'],
  '2024-06-10T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'ceinture-cuir-tresse',
  'Ceinture Cuir Tressé',
  'homme',
  'accessoires',
  55.00,
  ARRAY[
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80'
  ],
  'Ceinture en cuir tressé, boucle en laiton vieilli. L''accessoire qui fait la différence.',
  ARRAY['TU'],
  '[{"name":"Cognac","hex":"#834A27"},{"name":"Noir","hex":"#1A1A1A"}]'::jsonb,
  18, false, ARRAY['cuir','accessoire','ceinture'],
  '2024-05-01T00:00:00Z'
);

-- FEMME

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'robe-midi-provencale',
  'Robe Midi Provençale',
  'femme',
  'robes',
  129.00,
  ARRAY[
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80'
  ],
  'Robe midi fluide en viscose imprimée. Bretelles ajustables, dos légèrement ouvert. Féminité et confort absolu.',
  ARRAY['XS', 'S', 'M', 'L'],
  '[{"name":"Terracotta","hex":"#E2725B"},{"name":"Bleu Lavande","hex":"#9683EC"}]'::jsonb,
  10, true, ARRAY['viscose','été','robe'],
  '2024-06-05T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'top-lin-côte-azur',
  'Top Lin Côte d''Azur',
  'femme',
  'tops',
  69.00,
  ARRAY[
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80'
  ],
  'Top en lin avec détails brodés. Coupe ample et légère. L''essentiel de l''été méditerranéen.',
  ARRAY['XS', 'S', 'M', 'L'],
  '[{"name":"Blanc","hex":"#FFFFFF"},{"name":"Bleu Ciel","hex":"#87CEEB"}]'::jsonb,
  14, true, ARRAY['lin','été','top'],
  '2024-06-08T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'jupe-longue-soleil',
  'Jupe Longue Soleil',
  'femme',
  'robes',
  89.00,
  ARRAY[
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800&q=80'
  ],
  'Jupe longue fluide avec taille élastiquée. Imprimé exclusif LOLETT. Mouvements et légèreté.',
  ARRAY['XS', 'S', 'M', 'L'],
  '[{"name":"Ocre","hex":"#CC7722"},{"name":"Crème","hex":"#FFFDD0"}]'::jsonb,
  7, false, ARRAY['viscose','été','jupe'],
  '2024-05-25T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'blouse-romantique-calanques',
  'Blouse Romantique Calanques',
  'femme',
  'tops',
  79.00,
  ARRAY[
    'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80',
    'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80'
  ],
  'Blouse en coton avec manches bouffantes et détails dentelle. Romantisme assumé.',
  ARRAY['XS', 'S', 'M', 'L'],
  '[{"name":"Blanc Cassé","hex":"#FAF9F6"},{"name":"Rose Poudré","hex":"#E8CCD7"}]'::jsonb,
  11, false, ARRAY['coton','romantique','blouse'],
  '2024-05-18T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'sac-paille-plage',
  'Panier Plage Tressé',
  'femme',
  'accessoires',
  59.00,
  ARRAY[
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
  ],
  'Panier en paille naturelle avec anses en cuir. De la plage au marché, le compagnon idéal.',
  ARRAY['TU'],
  '[{"name":"Naturel","hex":"#D4B896"}]'::jsonb,
  20, true, ARRAY['paille','été','sac'],
  '2024-06-12T00:00:00Z'
);

INSERT INTO products (slug, name, gender, category_slug, price, images, description, sizes, colors, stock, is_new, tags, created_at)
VALUES (
  'foulard-soie-mimosa',
  'Foulard Soie Mimosa',
  'femme',
  'accessoires',
  49.00,
  ARRAY[
    'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80'
  ],
  'Foulard en soie naturelle, imprimé mimosa exclusif. En tour de cou, dans les cheveux ou sur votre sac.',
  ARRAY['TU'],
  '[{"name":"Jaune Mimosa","hex":"#F4B740"},{"name":"Bleu Nuit","hex":"#191970"}]'::jsonb,
  30, false, ARRAY['soie','accessoire','foulard'],
  '2024-05-10T00:00:00Z'
);

-- ============================================
-- 3. LOOKS
-- ============================================

INSERT INTO looks (title, gender, cover_image, vibe, short_pitch, created_at)
VALUES (
  'Le Méditerranéen',
  'homme',
  'https://images.unsplash.com/photo-1726741692717-a4007a9deb22?w=800&q=80',
  'Soirée d''été en terrasse',
  'Lin, chino, ceinture cuir. Le trio gagnant pour une soirée parfaite sous les étoiles.',
  '2024-06-01T00:00:00Z'
);

INSERT INTO looks (title, gender, cover_image, vibe, short_pitch, created_at)
VALUES (
  'La Provençale',
  'femme',
  'https://images.unsplash.com/photo-1755695213516-2a5165c3abd8?w=800&q=80',
  'Marché du dimanche matin',
  'Robe fluide, panier tressé, foulard soie. L''art de vivre à la française.',
  '2024-06-02T00:00:00Z'
);

-- ============================================
-- 4. LOOK_PRODUCTS (via subqueries sur slug/title)
-- ============================================

-- Look "Le Méditerranéen" : chemise lin + chino sable + ceinture cuir
INSERT INTO look_products (look_id, product_id, position)
SELECT
  (SELECT id FROM looks WHERE title = 'Le Méditerranéen'),
  (SELECT id FROM products WHERE slug = 'chemise-lin-mediterranee'),
  0;

INSERT INTO look_products (look_id, product_id, position)
SELECT
  (SELECT id FROM looks WHERE title = 'Le Méditerranéen'),
  (SELECT id FROM products WHERE slug = 'pantalon-chino-sable'),
  1;

INSERT INTO look_products (look_id, product_id, position)
SELECT
  (SELECT id FROM looks WHERE title = 'Le Méditerranéen'),
  (SELECT id FROM products WHERE slug = 'ceinture-cuir-tresse'),
  2;

-- Look "La Provençale" : robe midi + panier plage + foulard soie
INSERT INTO look_products (look_id, product_id, position)
SELECT
  (SELECT id FROM looks WHERE title = 'La Provençale'),
  (SELECT id FROM products WHERE slug = 'robe-midi-provencale'),
  0;

INSERT INTO look_products (look_id, product_id, position)
SELECT
  (SELECT id FROM looks WHERE title = 'La Provençale'),
  (SELECT id FROM products WHERE slug = 'sac-paille-plage'),
  1;

INSERT INTO look_products (look_id, product_id, position)
SELECT
  (SELECT id FROM looks WHERE title = 'La Provençale'),
  (SELECT id FROM products WHERE slug = 'foulard-soie-mimosa'),
  2;
