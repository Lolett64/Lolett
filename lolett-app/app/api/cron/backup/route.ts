import { NextResponse } from 'next/server';
import { putBackup } from '@/lib/backup/storage';
import { createAdminClient } from '@/lib/supabase/admin';

const BACKUP_TABLES = [
  'products',
  'product_variants',
  'categories',
  'orders',
  'order_items',
  'looks',
  'materials',
  'promos',
  'site_content',
  'email_settings',
  'newsletter_subscribers',
] as const;

const PAGE_SIZE = 1000;

async function fetchAll(supabase: ReturnType<typeof createAdminClient>, table: string) {
  const all: unknown[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Failed to read ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

export async function GET(req: Request) {
  // Sans secret configuré, la comparaison ci-dessous se ferait contre la chaîne
  // "Bearer undefined" : on refuse explicitement plutôt que d'exposer la route.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'misconfigured' }, { status: 503 });
  }

  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const snapshot: Record<string, unknown[]> = {};
  try {
    for (const table of BACKUP_TABLES) {
      snapshot[table] = await fetchAll(supabase, table);
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'unknown error' },
      { status: 500 },
    );
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `db/lolett-${timestamp}.json`;

  // Le fichier contient des données personnelles (commandes, abonnés). Il vit
  // désormais sur un volume privé du VPS, jamais exposé par HTTP — contrairement
  // au stockage Vercel dont toutes les URL étaient publiques.
  const { path } = await putBackup(filename, JSON.stringify(snapshot, null, 2));

  return NextResponse.json({
    ok: true,
    path,
    rows: Object.fromEntries(
      Object.entries(snapshot).map(([t, rows]) => [t, rows.length]),
    ),
  });
}
