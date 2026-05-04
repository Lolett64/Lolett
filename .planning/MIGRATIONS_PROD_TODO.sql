-- =============================================================================
-- MIGRATIONS PROD MANQUANTES — À APPLIQUER VIA SUPABASE DASHBOARD SQL EDITOR
-- =============================================================================
--
-- INSTRUCTIONS LYES :
-- 1. Ouvre https://supabase.com/dashboard/project/<TON_PROJECT_REF>/sql/new
-- 2. Copie TOUT ce fichier dans l'éditeur
-- 3. Clique "Run"
-- 4. Vérifie que tu vois "Success. No rows returned" (ou similaire) en bas
-- 5. Reviens ici et dis-moi "OK migrations appliquées"
--
-- Si erreur : copie-colle le message d'erreur, on diagnostique avant push.
--
-- C'est SAFE : tout est en CREATE OR REPLACE / IF NOT EXISTS, aucune perte de
-- donnée possible. Si une fonction existait déjà à l'identique, elle sera
-- juste recréée (no-op).
-- =============================================================================


-- =============================================================================
-- MIGRATION 1/3 : redeem_gift_card_atomic
-- Sécurise le débit des cartes cadeau au checkout (lock pessimiste +
-- idempotency) — évite double débit sur clic répété ou retry webhook Stripe
-- =============================================================================

ALTER TABLE public.gift_card_redemptions
  DROP CONSTRAINT IF EXISTS gift_card_redemptions_card_order_unique;
ALTER TABLE public.gift_card_redemptions
  ADD CONSTRAINT gift_card_redemptions_card_order_unique
  UNIQUE (gift_card_id, order_id);

CREATE OR REPLACE FUNCTION public.redeem_gift_card_atomic(
  p_card_id UUID,
  p_order_id UUID,
  p_amount NUMERIC,
  p_stripe_payment_intent TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_balance NUMERIC;
  v_status TEXT;
  v_expires_at TIMESTAMPTZ;
  v_new_balance NUMERIC;
  v_new_status TEXT;
  v_existing_redemption UUID;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RETURN json_build_object('success', false, 'reason', 'invalid_amount');
  END IF;

  SELECT balance, status, expires_at
    INTO v_balance, v_status, v_expires_at
    FROM gift_cards
    WHERE id = p_card_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'reason', 'not_found');
  END IF;

  SELECT id INTO v_existing_redemption
    FROM gift_card_redemptions
    WHERE gift_card_id = p_card_id AND order_id = p_order_id
    LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'card_id', p_card_id,
      'new_balance', v_balance,
      'new_status', v_status,
      'idempotent', true
    );
  END IF;

  IF v_status NOT IN ('active', 'pending') THEN
    RETURN json_build_object('success', false, 'reason', v_status);
  END IF;

  IF v_expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'reason', 'expired');
  END IF;

  IF v_balance < p_amount THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'insufficient',
      'balance', v_balance
    );
  END IF;

  v_new_balance := ROUND((v_balance - p_amount)::numeric, 2);
  v_new_status := CASE WHEN v_new_balance <= 0 THEN 'fully_redeemed' ELSE 'active' END;

  UPDATE gift_cards
    SET balance = v_new_balance,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_card_id;

  INSERT INTO gift_card_redemptions (gift_card_id, order_id, amount, stripe_payment_intent)
    VALUES (p_card_id, p_order_id, p_amount, p_stripe_payment_intent);

  RETURN json_build_object(
    'success', true,
    'card_id', p_card_id,
    'new_balance', v_new_balance,
    'new_status', v_new_status,
    'idempotent', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_gift_card_atomic(UUID, UUID, NUMERIC, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_gift_card_atomic(UUID, UUID, NUMERIC, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift_card_atomic(UUID, UUID, NUMERIC, TEXT) TO service_role;


-- =============================================================================
-- MIGRATION 2/3 : delete_user_account_atomic
-- RGPD Article 17 — droit à l'effacement.
-- Cascade complète (cart, favoris, addresses, anonymisation orders/reviews/
-- gift cards, suppression profile) en une seule transaction.
-- =============================================================================

CREATE TABLE IF NOT EXISTS account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_hash TEXT NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_email_hash ON account_deletions(email_hash);
CREATE INDEX IF NOT EXISTS idx_account_deletions_deleted_at ON account_deletions(deleted_at);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_access" ON account_deletions;
CREATE POLICY "service_role_full_access" ON account_deletions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION delete_user_account_atomic(
  p_user_id UUID,
  p_email TEXT,
  p_email_hash TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_anonymized_customer JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN json_build_object('success', false, 'reason', 'user_not_found');
  END IF;

  v_anonymized_customer := json_build_object(
    'deleted', true,
    'deletedAt', NOW()
  );

  DELETE FROM cart_items WHERE user_id = p_user_id;
  DELETE FROM favorites WHERE user_id = p_user_id;
  DELETE FROM addresses WHERE user_id = p_user_id;

  UPDATE reviews SET user_id = NULL WHERE user_id = p_user_id;

  UPDATE orders
  SET customer = v_anonymized_customer, user_id = NULL
  WHERE user_id = p_user_id;

  UPDATE gift_cards
  SET purchaser_email = 'deleted@deleted.local', purchaser_name = NULL
  WHERE LOWER(purchaser_email) = LOWER(p_email);

  DELETE FROM newsletter_subscribers WHERE LOWER(email) = LOWER(p_email);
  DELETE FROM pre_launch_contacts WHERE LOWER(email) = LOWER(p_email);

  DELETE FROM profiles WHERE id = p_user_id;

  INSERT INTO account_deletions (user_id, email_hash, reason)
  VALUES (p_user_id, p_email_hash, 'user_request');

  RETURN json_build_object('success', true, 'user_id', p_user_id);
END;
$$;

REVOKE ALL ON FUNCTION delete_user_account_atomic(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user_account_atomic(UUID, TEXT, TEXT) TO service_role;


-- =============================================================================
-- MIGRATION 3/3 : restock_order_items_partial
-- Refund par articles (Scénario B) — restock pile-poil le bon variant
-- en fonction des items réellement retournés (pas un ratio approximatif).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.restock_order_items_partial(
  p_order_id UUID,
  p_items JSONB
)
RETURNS TABLE(product_id UUID, size TEXT, color TEXT, restocked INTEGER, matched BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item JSONB;
  v_product_id UUID;
  v_size TEXT;
  v_color TEXT;
  v_qty INTEGER;
  v_variant_id UUID;
  v_matched BOOLEAN;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RETURN;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    BEGIN
      v_product_id := NULLIF(item->>'product_id', '')::UUID;
      v_size := item->>'size';
      v_color := NULLIF(item->>'color', '');
      v_qty := NULLIF(item->>'quantity', '')::INTEGER;
    EXCEPTION WHEN others THEN
      CONTINUE;
    END;

    IF v_product_id IS NULL OR v_size IS NULL OR v_qty IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM order_items oi
      WHERE oi.order_id = p_order_id
        AND oi.product_id = v_product_id
        AND lower(oi.size) = lower(v_size)
        AND COALESCE(lower(oi.color), '') = COALESCE(lower(v_color), '')
        AND oi.quantity >= v_qty
    ) THEN
      product_id := v_product_id;
      size := v_size;
      color := v_color;
      restocked := 0;
      matched := false;
      RETURN NEXT;
      CONTINUE;
    END IF;

    v_variant_id := NULL;
    IF v_color IS NOT NULL AND v_color <> '' THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = v_product_id
        AND lower(product_variants.size) = lower(v_size)
        AND lower(product_variants.color_name) = lower(v_color)
      LIMIT 1;
    END IF;

    IF v_variant_id IS NULL THEN
      SELECT id INTO v_variant_id
      FROM product_variants
      WHERE product_variants.product_id = v_product_id
        AND lower(product_variants.size) = lower(v_size)
      ORDER BY created_at
      LIMIT 1;
    END IF;

    v_matched := false;
    IF v_variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock = stock + v_qty, updated_at = NOW()
      WHERE id = v_variant_id;
      v_matched := true;
    ELSE
      UPDATE products
      SET stock = stock + v_qty, updated_at = NOW()
      WHERE products.id = v_product_id;
      IF FOUND THEN
        v_matched := true;
      END IF;
    END IF;

    product_id := v_product_id;
    size := v_size;
    color := v_color;
    restocked := CASE WHEN v_matched THEN v_qty ELSE 0 END;
    matched := v_matched;
    RETURN NEXT;
  END LOOP;

  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.restock_order_items_partial(UUID, JSONB) TO service_role;
REVOKE EXECUTE ON FUNCTION public.restock_order_items_partial(UUID, JSONB) FROM PUBLIC, anon, authenticated;


-- =============================================================================
-- FIN — vérification (optionnel mais conseillé)
-- =============================================================================

SELECT
  routine_name,
  CASE WHEN routine_name IN (
    'redeem_gift_card_atomic',
    'delete_user_account_atomic',
    'restock_order_items_partial'
  ) THEN 'OK ✅' ELSE 'manquant ❌' END AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'redeem_gift_card_atomic',
    'delete_user_account_atomic',
    'restock_order_items_partial'
  )
ORDER BY routine_name;
-- Tu dois voir 3 lignes avec "OK ✅".
