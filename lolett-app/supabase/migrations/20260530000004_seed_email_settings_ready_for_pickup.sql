-- =============================================================
-- Click & Collect — PR1 (4/4) : seed email_settings "order_ready_for_pickup"
-- =============================================================
-- Nouveau template transactionnel envoyé quand une commande C&C passe à
-- ready_for_pickup. ON CONFLICT (template_key) DO NOTHING → idempotent, ne
-- réécrit pas une éventuelle personnalisation déjà faite par Lola dans l'admin.
--
-- Conventions (alignées sur 20250220200005_seed_email_settings.sql) :
--   - placeholders en {{var}} (double accolade), PAS {var} comme le spec §4.4
--     → moteur interpolate() (cf. lib/email/order-refunded.ts). Le sender PR4/5
--       NE DOIT PAS utiliser le .replace('{orderNumber}', ...) des anciens senders.
--   - from_email = bonjour@lolettshop.com (valeur spec §4.4, pas le défaut historique)
--   - signoff avec U+2665 (♥, BLACK HEART), identique à tous les seeds existants
--     et au DEFAULT de la colonne signoff (le spec §4.4 écrit ♡ U+2661 → corrigé)
--   - pas de CTA (cta_text / cta_url vides) : le template met l'accent sur le code + le point
-- À exécuter dans le SQL Editor du dashboard Supabase.

INSERT INTO email_settings (
  template_key, label, from_name, from_email,
  subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params
) VALUES (
  'order_ready_for_pickup',
  'Commande prête au retrait',
  'LOLETT',
  'bonjour@lolettshop.com',
  'Votre commande {{orderNumber}} est prête au retrait — code {{pickupCode}}',
  'Bonne nouvelle, {{firstName}} ✨',
  'Votre commande vous attend au point de retrait choisi. Présentez le code ci-dessous au point de vente.',
  '',
  '',
  'Avec amour, LOLETT ♥',
  '{}'::jsonb
) ON CONFLICT (template_key) DO NOTHING;
