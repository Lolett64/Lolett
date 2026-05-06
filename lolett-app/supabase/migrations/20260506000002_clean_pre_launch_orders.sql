-- =============================================================
-- CLEAN PRE-LAUNCH : remise à zéro des données test
-- =============================================================
-- Contexte : ~13 commandes test ont été passées pendant le dev (827.50 € de
-- faux CA, 30 unités décrémentées sur 9 produits). Aucune vraie commande
-- n'existe encore (site pas lancé). Cette migration restaure les stocks
-- puis supprime les données polluées avant le launch.
--
-- Ne touche PAS à :
--   - products, product_variants (stock restauré via RPC, pas DELETE)
--   - promo_codes, gift_cards (contenu Lola légitime, géré manuellement)
--   - auth.users, profiles (compte Lyes conservé)
--   - categories, looks
--
-- Comportement FK constatés (vérifiés via pg_constraint avant exécution) :
--   - order_items.order_id  → ON DELETE CASCADE  (supprimées automatiquement)
--   - gift_card_redemptions.order_id → ON DELETE SET NULL (lignes conservées
--     avec order_id=NULL → on les nettoie explicitement après le DELETE)
-- (Les colonnes dispute_* sont sur orders directement, pas dans une table
--  séparée. Aucune table refunds/disputes n'existe — voir migration
--  20260430120000 qui n'ajoute que des colonnes + stripe_webhook_events.)

DO $$
DECLARE
  v_total_orders integer;
  v_with_stock integer;
  v_remaining_orders integer;
  v_remaining_items integer;
  v_remaining_redemptions integer;
BEGIN
  SELECT COUNT(*) INTO v_total_orders FROM orders;
  SELECT COUNT(*) INTO v_with_stock FROM orders WHERE stock_decremented_at IS NOT NULL;

  RAISE NOTICE 'Pre-launch clean: % orders found, % with stock decremented', v_total_orders, v_with_stock;

  -- 1. Restaurer les stocks (idempotent : appelle restore_stock_for_order
  --    sur chaque order ; la RPC se contente de ses items et reset le flag)
  PERFORM restore_stock_for_order(id)
  FROM orders
  WHERE stock_decremented_at IS NOT NULL;

  -- 2. Supprimer les commandes (cascade vers order_items ; redemptions
  --    passées en SET NULL → nettoyage explicite étape 3)
  DELETE FROM orders;

  -- 3. Nettoyer les gift_card_redemptions orphelines (order_id=NULL après
  --    le DELETE FROM orders ci-dessus). En pratique, base vide de cartes
  --    cadeaux → no-op, mais on garde l'instruction par hygiène.
  DELETE FROM gift_card_redemptions WHERE order_id IS NULL;

  -- 4. Supprimer les events Stripe orphelins (toutes les notifications
  --    référencent des commandes qui n'existent plus)
  DELETE FROM stripe_webhook_events;

  -- 5. Newsletter : supprimer toutes les inscriptions test (audit confirme
  --    9 emails dont 100% test/Lyes/ancien email Lola)
  DELETE FROM newsletter_subscribers
  WHERE email ILIKE '%lyes%'
     OR email ILIKE '%test%'
     OR email ILIKE '%@example.com'
     OR email ILIKE '%@noemail.test'
     OR email = 'contact.lolett@gmail.com';

  -- 6. Vérifications post-clean
  SELECT COUNT(*) INTO v_remaining_orders FROM orders;
  SELECT COUNT(*) INTO v_remaining_items FROM order_items;
  SELECT COUNT(*) INTO v_remaining_redemptions FROM gift_card_redemptions;

  IF v_remaining_orders <> 0 THEN
    RAISE EXCEPTION 'orders not empty after clean: % rows', v_remaining_orders;
  END IF;
  IF v_remaining_items <> 0 THEN
    RAISE EXCEPTION 'order_items not cascaded: % rows', v_remaining_items;
  END IF;
  IF v_remaining_redemptions <> 0 THEN
    RAISE EXCEPTION 'gift_card_redemptions not cleaned: % rows', v_remaining_redemptions;
  END IF;

  RAISE NOTICE 'Pre-launch clean OK: orders=%, items=%, redemptions=%',
    v_remaining_orders, v_remaining_items, v_remaining_redemptions;
END $$;
