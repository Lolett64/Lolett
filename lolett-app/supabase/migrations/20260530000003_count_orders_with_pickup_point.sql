-- =============================================================
-- Click & Collect — PR1 (3/4) : RPC count_orders_with_pickup_point
-- =============================================================
-- Compte les commandes historiques référençant un point de retrait donné
-- (snapshot orders.pickup_point->>'id' = point_id). Utilisée par l'UI admin
-- pour avertir Lola avant de masquer/éditer un point :
--   « ⚠ Référencé par N commandes historiques. Le masquer ne supprime pas ces données. »
--
-- SECURITY DEFINER : orders a une policy SELECT par-utilisateur
-- (20250220100001_orders_user_rls.sql : 'Users read own orders', authenticated
-- ne voit que SES propres commandes). SECURITY DEFINER est nécessaire pour
-- compter sur TOUTES les commandes indépendamment de l'appelant. La fonction
-- est réservée à service_role via REVOKE public/anon/authenticated + GRANT.
-- Bénéficie de l'index btree d'expression idx_orders_pickup_point_id (migration 000002).
-- À exécuter dans le SQL Editor du dashboard Supabase.

CREATE OR REPLACE FUNCTION public.count_orders_with_pickup_point(point_id text)
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM orders WHERE pickup_point->>'id' = point_id;
$$;

REVOKE ALL ON FUNCTION public.count_orders_with_pickup_point(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.count_orders_with_pickup_point(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_orders_with_pickup_point(text) TO service_role;

COMMENT ON FUNCTION public.count_orders_with_pickup_point(text) IS
  'Compte les commandes dont le snapshot pickup_point->>''id'' = point_id. SECURITY DEFINER (orders a une policy SELECT par-utilisateur ; on doit compter sur TOUTES les commandes), réservée service_role. Affichée dans l''admin avant masquage/édition d''un point de retrait.';
