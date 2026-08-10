-- Genre unisexe : autoriser la valeur 'both' sur les produits.
--
-- Contexte : depuis avril 2026 le formulaire admin propose « Unisexe (Homme & Femme) »
-- (valeur 'both'), et toute l'appli sait la traiter (types/index.ts, validation Zod des
-- routes API, lib/adapters/supabase-product.ts qui remonte les produits 'both' dans les
-- deux boutiques). Seule la contrainte CHECK d'origine (20250101000001_initial_schema.sql)
-- n'a jamais été mise à jour : elle refuse encore tout ce qui n'est pas homme/femme.
-- D'où l'erreur « products_gender_check » à la création d'un produit unisexe.

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_gender_check;

ALTER TABLE products
  ADD CONSTRAINT products_gender_check
  CHECK (gender IN ('homme', 'femme', 'both'));
