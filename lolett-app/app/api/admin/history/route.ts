import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveHistory } from '@/lib/cms/history';

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const recordId = searchParams.get('record_id');

    if (!table || !recordId) {
      return NextResponse.json({ error: 'table et record_id sont requis' }, { status: 400 });
    }

    if (table !== 'site_content' && table !== 'email_settings') {
      return NextResponse.json({ error: 'table invalide' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('content_history')
      .select('*')
      .eq('table_name', table)
      .eq('record_id', recordId)
      .order('changed_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: data });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { historyId } = await request.json();

    if (!historyId) {
      return NextResponse.json({ error: 'historyId est requis' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the history entry
    const { data: historyEntry, error: histError } = await supabase
      .from('content_history')
      .select('*')
      .eq('id', historyId)
      .single();

    if (histError || !historyEntry) {
      return NextResponse.json({ error: 'Entrée historique introuvable' }, { status: 404 });
    }

    const { table_name, record_id, previous_value } = historyEntry;

    // Fetch current record to save as history before restoring
    const { data: currentRecord } = await supabase
      .from(table_name)
      .select('*')
      .eq('id', record_id)
      .single();

    if (currentRecord) {
      await saveHistory(table_name, record_id, currentRecord as Record<string, unknown>, 'admin-restore');
    }

    // Restore previous value
    const restoreData = { ...previous_value } as Record<string, unknown>;
    delete restoreData.id;
    delete restoreData.created_at;
    restoreData.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from(table_name)
      .update(restoreData)
      .eq('id', record_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, restored: updated });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
