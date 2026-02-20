import { createAdminClient } from '@/lib/supabase/admin';

export interface SiteContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'video';
  label: string;
  sort_order: number;
}

// Fetch all content for a section, returns a key-value map
export async function getSiteContent(section: string): Promise<Record<string, string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
    .eq('section', section)
    .order('sort_order');

  if (error || !data) return {};
  return Object.fromEntries(data.map(row => [row.key, row.value]));
}

// Fetch all content items for a section (full objects, for admin)
export async function getSiteContentItems(section: string): Promise<SiteContentItem[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_content')
    .select('*')
    .eq('section', section)
    .order('sort_order');

  return (data as SiteContentItem[]) || [];
}

// Get all distinct sections
export async function getAllSections(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('site_content')
    .select('section')
    .order('section');

  if (!data) return [];
  return [...new Set(data.map(row => row.section))];
}
