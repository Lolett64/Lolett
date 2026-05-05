-- Corrige les from_email seedés sur des senders non vérifiés Brevo.
-- 'onboarding@resend.dev' (sender de test Resend, refusé par Brevo+Gmail SMTP)
-- 'contact@lolett.fr' (boîte qui n'existe pas)
-- → bascule sur 'contact.lolett@gmail.com', sender Verified dans Brevo.
-- Quand le domaine lolettshop.com sera authentifié, basculer sur noreply@lolettshop.com.

UPDATE email_settings
SET from_email = 'contact.lolett@gmail.com',
    updated_at = NOW()
WHERE from_email IN ('onboarding@resend.dev', 'contact@lolett.fr');

-- Corrige aussi le DEFAULT du schema pour éviter de re-créer des lignes cassées.
ALTER TABLE email_settings
  ALTER COLUMN from_email SET DEFAULT 'contact.lolett@gmail.com';
