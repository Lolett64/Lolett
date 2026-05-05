-- Switch sender from contact.lolett@gmail.com → bonjour@lolettshop.com
-- Le domaine lolettshop.com est désormais authentifié dans Brevo (DKIM + SPF posés).
-- Avant : Brevo signait au nom de gmail.com → ajout de "via brevosend.com" dans Gmail.
-- Après : signature DKIM alignée sur le domaine d'envoi → branding propre + meilleur deliverability.
-- Fait suite à la migration 20260505120000_fix_email_settings_sender.sql.

UPDATE email_settings
SET from_email = 'bonjour@lolettshop.com',
    updated_at = now()
WHERE from_email = 'contact.lolett@gmail.com';

ALTER TABLE email_settings
  ALTER COLUMN from_email SET DEFAULT 'bonjour@lolettshop.com';
