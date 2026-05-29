-- =============================================================
-- Click & Collect — PR1 (1/4) : table pickup_points
-- =============================================================
-- Points de retrait Click & Collect, éditables par Lola via
-- /admin/pickup-points (service role). Lecture publique limitée
-- aux points actifs (is_active = true). Soft-delete via is_active
-- pour préserver les snapshots historiques dans orders.pickup_point.
-- À exécuter dans le SQL Editor du dashboard Supabase.
-- Migration idempotente : CREATE TABLE/INDEX IF NOT EXISTS, et
-- DROP TRIGGER/POLICY IF EXISTS avant chaque CREATE (ces deux-là
-- ne supportent pas IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS pickup_points (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  address       text NOT NULL,
  postal_code   text NOT NULL,
  city          text NOT NULL,
  country       text NOT NULL DEFAULT 'FR',
  hours         text,
  instructions  text,
  is_active     boolean NOT NULL DEFAULT false,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_points_active_sort
  ON pickup_points (is_active, sort_order);

-- Trigger updated_at : fonction maison update_updated_at() (PAS moddatetime).
-- Définie dans 20250101000001_initial_schema.sql (signature sans argument).
-- DROP préalable car CREATE TRIGGER ne supporte pas IF NOT EXISTS → rejouabilité.
DROP TRIGGER IF EXISTS pickup_points_set_updated_at ON pickup_points;
CREATE TRIGGER pickup_points_set_updated_at
  BEFORE UPDATE ON pickup_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;

-- DROP préalable car CREATE POLICY ne supporte pas IF NOT EXISTS → rejouabilité
-- (convention du repo, cf. 20260428000002_rls_email_settings.sql).
DROP POLICY IF EXISTS "pickup_points_public_select_active" ON pickup_points;
CREATE POLICY "pickup_points_public_select_active"
  ON pickup_points FOR SELECT
  USING (is_active = true);

-- service_role : pattern maison auth.role() = 'service_role' (cf. 20250101000001 L157).
DROP POLICY IF EXISTS "pickup_points_service_role_all" ON pickup_points;
CREATE POLICY "pickup_points_service_role_all"
  ON pickup_points FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE pickup_points IS
  'Points de retrait Click & Collect. CRUD via /admin/pickup-points (service role). Lecture publique limitée à is_active=true.';
COMMENT ON COLUMN pickup_points.is_active IS
  'Soft-delete : false = masqué côté public, snapshots historiques dans orders.pickup_point préservés.';
COMMENT ON COLUMN pickup_points.sort_order IS
  'Ordre d''affichage croissant dans le sélecteur checkout. Init par pas de 10 à la création (max+10).';
