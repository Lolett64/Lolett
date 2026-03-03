import { createAdminClient } from '@/lib/supabase/admin';

export interface PageSection {
  id: string;
  page_slug: string;
  section_key: string;
  label: string;
  visible: boolean;
  sort_order: number;
  updated_at: string;
}

export async function getPageSections(pageSlug: string): Promise<PageSection[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_slug', pageSlug)
    .order('sort_order');

  if (error || !data) return [];
  return data as PageSection[];
}

export async function getVisibleSectionKeys(pageSlug: string): Promise<string[]> {
  const sections = await getPageSections(pageSlug);
  return sections.filter(s => s.visible).map(s => s.section_key);
}
