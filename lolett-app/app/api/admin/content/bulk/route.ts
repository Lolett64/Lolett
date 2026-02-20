import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveHistory } from '@/lib/cms/history';

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items est requis (tableau non vide)' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    for (const item of items) {
      const { id, value } = item;
      if (!id || value === undefined) continue;

      // Fetch current
      const { data: current } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', id)
        .single();

      if (current) {
        await saveHistory('site_content', id, current as Record<string, unknown>);
        await supabase
          .from('site_content')
          .update({ value, updated_at: now })
          .eq('id', id);
      }
    }

    return NextResponse.json({ success: true, updated: items.length });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
