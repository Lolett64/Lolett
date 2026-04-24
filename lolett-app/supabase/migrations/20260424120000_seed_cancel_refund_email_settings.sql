-- =============================================================
-- SEED: email_settings — add order_cancelled & order_refunded templates
-- =============================================================

INSERT INTO email_settings (
  template_key, label, from_name, from_email,
  subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params
) VALUES
(
  'order_cancelled',
  'Commande annulée',
  'LOLETT',
  'contact@lolett.fr',
  'Votre commande {{orderNumber}} a été annulée',
  '{{firstName}}, on a annulé ta commande',
  'On est désolé·e pour ce contretemps. Si un paiement a été prélevé, le remboursement est en cours (sous 5 à 10 jours ouvrés selon ta banque). Pour toute question, réponds simplement à cet email.',
  'Voir mes commandes',
  'https://lolett.fr/compte/commandes',
  'À bientôt, LOLETT ♥',
  '{}'::jsonb
),
(
  'order_refunded',
  'Commande remboursée',
  'LOLETT',
  'contact@lolett.fr',
  'Remboursement confirmé pour votre commande {{orderNumber}}',
  'Bonne nouvelle, {{firstName}} !',
  'Ton remboursement a été validé. Il apparaîtra sur ton compte bancaire sous 5 à 10 jours ouvrés selon ta banque.',
  'Voir mes commandes',
  'https://lolett.fr/compte/commandes',
  'À bientôt, LOLETT ♥',
  '{}'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;
