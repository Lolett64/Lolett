-- Contacts pré-lancement Lola : 110 emails clients existants
-- avec code promo unique single-use à recevoir par email à l'ouverture.
CREATE TABLE IF NOT EXISTS pre_launch_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  promo_code TEXT UNIQUE NOT NULL REFERENCES promo_codes(code) ON UPDATE CASCADE,
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pre_launch_contacts_status ON pre_launch_contacts(email_status);
CREATE INDEX IF NOT EXISTS idx_pre_launch_contacts_email_lower ON pre_launch_contacts(LOWER(email));

ALTER TABLE pre_launch_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages pre_launch_contacts" ON pre_launch_contacts
  FOR ALL USING (auth.role() = 'service_role');

CREATE TRIGGER tr_pre_launch_contacts_updated_at
  BEFORE UPDATE ON pre_launch_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
