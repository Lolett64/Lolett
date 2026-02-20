import { createAdminClient } from '@/lib/supabase/admin';

export interface EmailSettings {
  id: string;
  template_key: string;
  label: string;
  from_name: string;
  from_email: string;
  subject_template: string;
  greeting: string;
  body_text: string;
  cta_text: string;
  cta_url: string;
  signoff: string;
  extra_params: Record<string, unknown>;
}

export async function getEmailSettings(templateKey: string): Promise<EmailSettings | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('email_settings')
    .select('*')
    .eq('template_key', templateKey)
    .single();

  return (data as EmailSettings) || null;
}

export async function getAllEmailSettings(): Promise<EmailSettings[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('email_settings')
    .select('*')
    .order('template_key');

  return (data as EmailSettings[]) || [];
}
