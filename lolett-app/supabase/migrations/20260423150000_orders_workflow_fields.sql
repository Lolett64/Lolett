-- =============================================================
-- Workflow commandes admin : champs manquants
-- =============================================================
-- Ajoute les colonnes nécessaires pour :
--   - timestamps cycle de vie (shipped, delivered, cancelled, refunded)
--   - notes internes admin
--   - remboursement (montant + raison)
--   - annulation (raison)

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipped_at    timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at  timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at  timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at   timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notes   text,
  ADD COLUMN IF NOT EXISTS refund_amount numeric,
  ADD COLUMN IF NOT EXISTS refund_reason text,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

COMMENT ON COLUMN orders.shipped_at    IS 'Date de passage au statut shipped (auto-posé par l''API admin PATCH)';
COMMENT ON COLUMN orders.delivered_at  IS 'Date de passage au statut delivered (auto-posé par l''API admin PATCH)';
COMMENT ON COLUMN orders.cancelled_at  IS 'Date d''annulation (auto-posé par l''API admin PATCH)';
COMMENT ON COLUMN orders.refunded_at   IS 'Date de remboursement (auto-posé par l''API admin PATCH)';
COMMENT ON COLUMN orders.admin_notes   IS 'Notes internes Lola (non visibles du client)';
COMMENT ON COLUMN orders.refund_amount IS 'Montant remboursé en euros (si partiel ou complet)';
COMMENT ON COLUMN orders.refund_reason IS 'Raison communiquée au client pour le remboursement';
COMMENT ON COLUMN orders.cancel_reason IS 'Raison communiquée au client pour l''annulation';
