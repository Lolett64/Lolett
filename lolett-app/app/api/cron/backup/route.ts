import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
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
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
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
  const filename = `backups/lolett-${timestamp}.json`;

  // addRandomSuffix: true rend l'URL non-énumérable (PII RGPD).
  // L'URL reste accessible publiquement par Vercel Blob (limite v2 SDK)
  // mais sans la connaître on ne peut pas la deviner.
  const { url } = await put(filename, JSON.stringify(snapshot, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: true,
    cacheControlMaxAge: 0,
  });

  return NextResponse.json({
    ok: true,
    url,
    rows: Object.fromEntries(
      Object.entries(snapshot).map(([t, rows]) => [t, rows.length]),
    ),
  });
}
