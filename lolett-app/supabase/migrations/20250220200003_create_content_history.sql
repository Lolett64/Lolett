CREATE TABLE IF NOT EXISTS content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL CHECK (table_name IN ('site_content', 'email_settings')),
  record_id UUID NOT NULL,
  previous_value JSONB NOT NULL,
  changed_by TEXT NOT NULL DEFAULT 'admin',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_history_record ON content_history(table_name, record_id);
CREATE INDEX idx_content_history_date ON content_history(changed_at DESC);
