-- Sécurité Tier 3 / Sprint 1 — §1.6
-- Race condition : avant ce fix, app/api/checkout/stripe/route.ts et le webhook
-- Stripe faisaient INSERT redemption → SELECT balance → UPDATE balance en 3
-- requêtes séparées. Deux requêtes parallèles avec la même carte (clic double
-- sur « Payer », ou retry webhook) pouvaient toutes deux SELECT la même balance,
-- puis UPDATE → carte débitée 2× ou commande gratuite frauduleusement.
--
-- Le RPC ci-dessous fait SELECT FOR UPDATE (lock pessimiste) + idempotency
-- check + decrement + insert dans la même transaction. La 2e requête
-- concurrente attend le lock et lit l'état à jour.
--
-- Idempotency : si une redemption existe déjà pour (gift_card_id, order_id),
-- on retourne success avec la balance actuelle (no-op). Permet les retries
-- du webhook Stripe sans double débit.
--
-- Sécurité : SECURITY INVOKER + GRANT EXECUTE service_role uniquement →
-- impossible d'appeler ce RPC en tant qu'anon/authenticated.

-- Contrainte UNIQUE pour matérialiser l'idempotency au niveau DB (best effort).
-- Vérification préalable (cf. session 2026-04-28) : aucun doublon existant.
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

  -- Lock pessimiste : la 2e transaction concurrente attend ici jusqu'au COMMIT
  -- de la 1ère, puis lit la balance à jour.
  SELECT balance, status, expires_at
    INTO v_balance, v_status, v_expires_at
    FROM gift_cards
    WHERE id = p_card_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'reason', 'not_found');
  END IF;

  -- Idempotency : si une redemption existe déjà pour ce couple (card, order),
  -- ne rien faire et signaler que l'opération est déjà appliquée.
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
