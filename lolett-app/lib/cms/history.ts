import { createAdminClient } from '@/lib/supabase/admin';

export interface HistoryEntry {
  id: string;
  table_name: string;
  record_id: string;
  previous_value: Record<string, unknown>;
  changed_by: string;
  changed_at: string;
}

export async function saveHistory(
  tableName: 'site_content' | 'email_settings',
  recordId: string,
  previousValue: Record<string, unknown>,
  changedBy: string = 'admin'
) {
  const supabase = createAdminClient();
  await supabase.from('content_history').insert({
    table_name: tableName,
    record_id: recordId,
    previous_value: previousValue,
    changed_by: changedBy,
  });
}

export async function getHistory(
  tableName: 'site_content' | 'email_settings',
  recordId: string
): Promise<HistoryEntry[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('content_history')
    .select('*')
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('changed_at', { ascending: false })
    .limit(50);

  return (data as HistoryEntry[]) || [];
}
