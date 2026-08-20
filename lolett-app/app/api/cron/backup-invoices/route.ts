import { NextResponse } from 'next/server';
import { listBackups, putBackup, readBackup } from '@/lib/backup/storage';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'invoices';
const PAGE_SIZE = 100;
const MAX_RUNTIME_MS = 4 * 60 * 1000;

export const maxDuration = 300;

function currentMonthPrefix(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `invoices-backup/${year}-${month}`;
}

type Manifest = {
  month: string;
  archivedFiles: Record<string, { uploadedAt: string; backupPath: string }>;
};

async function loadManifest(monthPrefix: string): Promise<Manifest> {
  const month = monthPrefix.split('/')[1];
  const manifests = await listBackups(`${monthPrefix}/_manifest-`);
  if (manifests.length === 0) {
    return { month, archivedFiles: {} };
  }
  const latest = manifests.sort(
    (a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime(),
  )[0];
  try {
    const raw = await readBackup(latest.path);
    const data = JSON.parse(raw.toString('utf8')) as Manifest;
    return data;
  } catch (err) {
    Sentry.captureMessage('backup-invoices: manifest load failed, restarting from empty', {
      level: 'warning',
      extra: { error: err instanceof Error ? err.message : 'unknown' },
    });
    return { month, archivedFiles: {} };
  }
}

async function saveManifest(monthPrefix: string, manifest: Manifest): Promise<void> {
  await putBackup(
    `${monthPrefix}/_manifest-${Date.now()}.json`,
    JSON.stringify(manifest),
  );
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    Sentry.captureMessage('backup-invoices: CRON_SECRET not configured', { level: 'error' });
    return NextResponse.json({ error: 'misconfigured' }, { status: 503 });
  }

  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const monthPrefix = currentMonthPrefix();
  const supabase = createAdminClient();

  let archived = 0;
  let skipped = 0;
  let failed = 0;
  let aborted = false;

  let manifest: Manifest;
  try {
    manifest = await loadManifest(monthPrefix);
  } catch (err) {
    Sentry.captureException(err, { tags: { cron: 'backup-invoices', step: 'load-manifest' } });
    return NextResponse.json(
      { ok: false, error: 'manifest load failed', archived: 0, skipped: 0, failed: 0 },
      { status: 500 },
    );
  }

  try {
    let offset = 0;
    while (true) {
      if (Date.now() - startedAt > MAX_RUNTIME_MS) {
        aborted = true;
        break;
      }

      const { data: files, error: listErr } = await supabase.storage
        .from(BUCKET)
        .list('', { limit: PAGE_SIZE, offset, sortBy: { column: 'name', order: 'asc' } });

      if (listErr) {
        throw new Error(`Failed to list ${BUCKET}: ${listErr.message}`);
      }
      if (!files || files.length === 0) break;

      for (const file of files) {
        if (Date.now() - startedAt > MAX_RUNTIME_MS) {
          aborted = true;
          break;
        }
        if (!file.name || file.name.endsWith('/') || file.name.startsWith('_')) continue;

        if (manifest.archivedFiles[file.name]) {
          skipped++;
          continue;
        }

        const { data: pdfBlob, error: dlErr } = await supabase.storage
          .from(BUCKET)
          .download(file.name);

        if (dlErr || !pdfBlob) {
          failed++;
          Sentry.captureMessage(`backup-invoices: download failed for ${file.name}`, {
            level: 'warning',
            extra: { error: dlErr?.message },
          });
          continue;
        }

        try {
          const { path } = await putBackup(`${monthPrefix}/${file.name}`, pdfBlob);
          manifest.archivedFiles[file.name] = {
            uploadedAt: new Date().toISOString(),
            backupPath: path,
          };
          archived++;
        } catch (uploadErr) {
          failed++;
          Sentry.captureException(uploadErr, {
            tags: { cron: 'backup-invoices', file: file.name },
          });
        }
      }

      if (aborted || files.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }
  } catch (err) {
    if (archived > 0) {
      try {
        await saveManifest(monthPrefix, manifest);
      } catch (saveErr) {
        Sentry.captureException(saveErr, {
          tags: { cron: 'backup-invoices', step: 'manifest-save-on-error' },
        });
      }
    }
    Sentry.captureException(err, { tags: { cron: 'backup-invoices' } });
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'unknown error',
        archived,
        skipped,
        failed,
      },
      { status: 500 },
    );
  }

  if (archived > 0) {
    try {
      await saveManifest(monthPrefix, manifest);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { cron: 'backup-invoices', step: 'manifest-save' },
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'manifest save failed after upload',
          archived,
          skipped,
          failed,
        },
        { status: 500 },
      );
    }
  }

  if (aborted) {
    Sentry.captureMessage(
      `backup-invoices: aborted at ${MAX_RUNTIME_MS}ms (archived=${archived}, skipped=${skipped}, failed=${failed})`,
      { level: 'warning', tags: { cron: 'backup-invoices' } },
    );
  }

  if (failed > 0) {
    Sentry.captureMessage(
      `backup-invoices: completed with ${failed} failures (archived=${archived}, skipped=${skipped})`,
      { level: 'warning', tags: { cron: 'backup-invoices' } },
    );
  }

  const status = aborted || failed > 0 ? 207 : 200;
  return NextResponse.json(
    {
      ok: !aborted && failed === 0,
      month: manifest.month,
      archived,
      skipped,
      failed,
      aborted,
      durationMs: Date.now() - startedAt,
    },
    { status },
  );
}
