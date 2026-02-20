import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveHistory } from '@/lib/cms/history';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { value } = await request.json();

    if (value === undefined) {
      return NextResponse.json({ error: 'value est requis' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch current record
    const { data: current, error: fetchError } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
    }

    // Save history
    await saveHistory('site_content', id, current as Record<string, unknown>);

    // Update
    const { data: updated, error: updateError } = await supabase
      .from('site_content')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
