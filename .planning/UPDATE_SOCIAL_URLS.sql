-- =============================================================================
-- MAJ URLs réseaux sociaux Lolett (DB site_content)
-- =============================================================================
-- À appliquer via Supabase Dashboard → SQL Editor
-- URL : https://supabase.com/dashboard/project/qczdwrudgmozyxkdidmr/sql/new
-- =============================================================================

UPDATE site_content SET value = 'https://www.instagram.com/lolett.eshop', updated_at = NOW() WHERE key = 'instagram_url';
UPDATE site_content SET value = 'https://www.tiktok.com/@lolett.eshop',   updated_at = NOW() WHERE key = 'tiktok_url';
UPDATE site_content SET value = 'https://www.facebook.com/share/1Lgs5JMnHZ/?mibextid=wwXIfr', updated_at = NOW() WHERE key = 'facebook_url';

-- Vérification :
SELECT key, value FROM site_content WHERE key IN ('instagram_url','tiktok_url','facebook_url') ORDER BY key;
-- Doit retourner 3 lignes avec les nouvelles URLs.
