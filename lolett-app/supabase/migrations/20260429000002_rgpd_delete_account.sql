-- RGPD Article 17 — droit à l'effacement
-- Cette migration crée :
--   1. La table `account_deletions` pour traçabilité légale (email hashé, pas en clair)
--   2. La RPC `delete_user_account_atomic` qui exécute la cascade dans une seule transaction

-- =========================================================================
-- 1. Table de traçabilité (RGPD : on garde la PREUVE de la suppression)
-- =========================================================================

CREATE TABLE IF NOT EXISTS account_deletions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_hash TEXT NOT NULL,  -- SHA-256 de l'email, jamais en clair
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT  -- 'user_request' | 'admin_action' | 'data_retention'
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_email_hash ON account_deletions(email_hash);
CREATE INDEX IF NOT EXISTS idx_account_deletions_deleted_at ON account_deletions(deleted_at);

ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON account_deletions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =========================================================================
-- 2. RPC atomique : exécute toute la cascade dans une seule transaction
-- =========================================================================
-- Si UNE étape échoue, TOUT est rollback (intégrité garantie).
-- L'appelant (route API) gère ensuite la suppression auth.users via admin client.

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
  -- Vérifier que le user existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RETURN json_build_object('success', false, 'reason', 'user_not_found');
  END IF;

  -- Payload d'anonymisation pour orders.customer
  v_anonymized_customer := json_build_object(
    'deleted', true,
    'deletedAt', NOW()
  );

  -- ÉTAPE 1 — DELETE des données purement personnelles (éphémères ou perso)
  DELETE FROM cart_items WHERE user_id = p_user_id;
  DELETE FROM favorites WHERE user_id = p_user_id;
  DELETE FROM addresses WHERE user_id = p_user_id;

  -- ÉTAPE 2 — Anonymiser les reviews (garder le commentaire pour les autres clients)
  UPDATE reviews SET user_id = NULL WHERE user_id = p_user_id;

  -- ÉTAPE 3 — Anonymiser les orders (obligation comptable 10 ans Code commerce L123-22)
  UPDATE orders
  SET customer = v_anonymized_customer, user_id = NULL
  WHERE user_id = p_user_id;

  -- ÉTAPE 4 — Anonymiser les gift cards où le user est purchaser
  -- (la carte reste fonctionnelle pour le destinataire)
  UPDATE gift_cards
  SET purchaser_email = 'deleted@deleted.local', purchaser_name = NULL
  WHERE LOWER(purchaser_email) = LOWER(p_email);

  -- ÉTAPE 5 — Désinscription newsletter / pré-launch (basé sur email)
  DELETE FROM newsletter_subscribers WHERE LOWER(email) = LOWER(p_email);
  DELETE FROM pre_launch_contacts WHERE LOWER(email) = LOWER(p_email);

  -- ÉTAPE 6 — Supprimer le profil
  DELETE FROM profiles WHERE id = p_user_id;

  -- ÉTAPE 7 — Logger la suppression pour traçabilité légale
  INSERT INTO account_deletions (user_id, email_hash, reason)
  VALUES (p_user_id, p_email_hash, 'user_request');

  RETURN json_build_object('success', true, 'user_id', p_user_id);
END;
$$;

-- Restreindre l'exécution au service_role uniquement
REVOKE ALL ON FUNCTION delete_user_account_atomic(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_user_account_atomic(UUID, TEXT, TEXT) TO service_role;
