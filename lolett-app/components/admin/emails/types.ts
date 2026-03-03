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
  updated_at?: string;
}

export type FormData = Omit<EmailSettings, 'id' | 'template_key' | 'label' | 'updated_at'>;

export const VARIABLES_BY_TEMPLATE: Record<string, string[]> = {
  order_confirmation: ['{firstName}', '{orderNumber}', '{total}'],
  welcome_newsletter: ['{firstName}', '{promoCode}'],
};

export function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} a ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
