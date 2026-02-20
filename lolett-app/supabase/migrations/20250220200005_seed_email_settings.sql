-- =============================================================
-- SEED: email_settings — transactional email templates
-- =============================================================

INSERT INTO email_settings (template_key, label, from_name, from_email, subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params) VALUES
(
  'order_confirmation',
  'Confirmation de commande',
  'LOLETT',
  'onboarding@resend.dev',
  'Confirmation de commande {{orderNumber}}',
  'Merci, {{firstName}}.',
  'Nous préparons vos pièces avec soin.',
  'Suivre ma commande',
  '',
  'Avec amour, LOLETT ♥',
  '{}'::jsonb
),
(
  'welcome_newsletter',
  'Bienvenue newsletter',
  'LOLETT',
  'onboarding@resend.dev',
  'Bienvenue chez LOLETT',
  '{{firstName}}, vous êtes des nôtres.',
  'Merci de rejoindre l''univers LOLETT. Pour vous souhaiter la bienvenue, voici un cadeau.',
  'Découvrir la collection',
  '',
  'Avec amour, LOLETT ♥',
  '{"discount_percent": 10, "promo_duration_days": 30}'::jsonb
);
