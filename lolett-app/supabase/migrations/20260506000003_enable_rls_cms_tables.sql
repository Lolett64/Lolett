-- =============================================================
-- Sécurité : activer RLS sur site_content + content_history
-- =============================================================
-- Pourquoi : Supabase advisor a flag ces deux tables comme
-- "publicly accessible" (rls_disabled_in_public). Sans RLS, n'importe qui
-- avec l'anon key peut INSERT/UPDATE/DELETE les textes CMS du site et lire
-- l'historique d'audit interne.
--
-- Pattern :
--   - site_content : lecture publique (les pages publiques affichent ces
--     textes via createAdminClient mais aussi parfois via le client anon),
--     écriture service_role only (admin CMS uniquement).
--   - content_history : aucun accès anon/authenticated (audit interne),
--     service_role only.
--
-- Code applicatif : lib/cms/content.ts utilise createAdminClient()
-- (service_role) pour toutes les lectures → pas d'impact fonctionnel.
-- L'API admin /api/admin/content/* utilise aussi createAdminClient.

-- ── site_content ──────────────────────────────────────────────
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site content" ON site_content;
CREATE POLICY "Public read site content" ON site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manage site content" ON site_content;
CREATE POLICY "Service role manage site content" ON site_content
  FOR ALL USING (auth.role() = 'service_role');

-- ── content_history ───────────────────────────────────────────
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only content history" ON content_history;
CREATE POLICY "Service role only content history" ON content_history
  FOR ALL USING (auth.role() = 'service_role');
