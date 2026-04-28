-- Sécurité Tier 3 / Sprint 1 — §1.5
-- Active la RLS sur email_settings (était `rowsecurity=false` → exposition publique
-- via PostgREST). Tous les accès code passent par createAdminClient() (service_role
-- qui bypass RLS), donc activer la RLS ne casse aucun endpoint existant.
-- La policy explicite bloque anon + authenticated même si une route oubliait
-- d'utiliser le admin client.

ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon_authenticated" ON public.email_settings;
CREATE POLICY "deny_anon_authenticated" ON public.email_settings
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
