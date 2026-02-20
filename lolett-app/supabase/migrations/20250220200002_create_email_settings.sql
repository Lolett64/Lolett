CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'LOLETT',
  from_email TEXT NOT NULL DEFAULT 'onboarding@resend.dev',
  subject_template TEXT NOT NULL,
  greeting TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT '',
  cta_url TEXT NOT NULL DEFAULT '',
  signoff TEXT NOT NULL DEFAULT 'Avec amour, LOLETT ♥',
  extra_params JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
