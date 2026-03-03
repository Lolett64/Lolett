-- =============================================================
-- SEED: email_settings — add shipped & delivered email templates
-- =============================================================

INSERT INTO email_settings (template_key, label, from_name, from_email, subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params)
VALUES
  (
    'order_shipped',
    'Commande expédiée',
    'LOLETT',
    'contact@lolett.fr',
    'Votre commande {{orderNumber}} est en route',
    'Bonne nouvelle, {{firstName}} !',
    'Votre commande a été expédiée et arrivera sous 24 à 48h.',
    'Suivre ma livraison',
    'https://lolett.fr/compte',
    'Avec amour, LOLETT ♥',
    '{}'::jsonb
  ),
  (
    'order_delivered',
    'Commande livrée',
    'LOLETT',
    'contact@lolett.fr',
    'Votre commande {{orderNumber}} est arrivée',
    '{{firstName}}, votre commande est arrivée !',
    'On espère que vos nouvelles pièces vous plaisent autant qu''à nous.',
    'Donner mon avis',
    'https://lolett.fr/compte',
    'Avec amour, LOLETT ♥',
    '{}'::jsonb
  )
ON CONFLICT (template_key) DO NOTHING;
