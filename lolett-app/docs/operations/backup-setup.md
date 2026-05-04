# Automated Supabase Backup — Operations Guide

A Vercel Cron hits `/api/cron/backup` every day at 03:00 UTC. The endpoint
dumps the tables listed in `app/api/cron/backup/route.ts` to a JSON blob in
Vercel Blob storage at `backups/lolett-YYYY-MM-DD.json`.

Supabase Free tier has no built-in automated backups, so this gives us a
recoverable snapshot that survives the Supabase project itself being deleted
(the blob lives on Vercel's infra).

## One-time setup

1. **Vercel Blob store** — dashboard → Storage → Create Blob store
   (name: `lolett-backups`). `BLOB_READ_WRITE_TOKEN` is auto-provisioned and
   injected into every deploy.
2. **Cron secret** — generate once and add to Vercel (production + preview):
   ```bash
   openssl rand -hex 32
   vercel env add CRON_SECRET production
   vercel env add CRON_SECRET preview
   ```
   Vercel automatically injects `Authorization: Bearer $CRON_SECRET` when
   calling cron endpoints registered in `vercel.json`.
3. **Deploy** — once the env vars are saved, trigger a new deploy so Vercel
   reads `vercel.json` and schedules the cron.

## Env-var reference

| Variable | Source | Required |
|---|---|---|
| `CRON_SECRET` | set manually | yes |
| `BLOB_READ_WRITE_TOKEN` | auto by Vercel Blob | yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | yes (already set) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | yes (already set) |

## Manual trigger (smoke test)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://lolett.vercel.app/api/cron/backup
```

Expected response:
```json
{
  "ok": true,
  "url": "https://<store>.public.blob.vercel-storage.com/backups/lolett-2026-04-24.json",
  "rows": { "products": 12, "product_variants": 48, ... }
}
```

## Restore procedure

1. Download the JSON blob for the desired date.
2. For each table in the snapshot, truncate + insert rows via SQL editor or
   `psql`. The JSON preserves UUIDs and timestamps as-is; a plain
   `INSERT ... ON CONFLICT DO UPDATE` is enough.
3. Rerun any Supabase migrations that may have changed schema since the
   snapshot (compare `supabase/migrations/` contents at the restore target).

## Monitoring

Cron runs appear in the Vercel dashboard → Logs → Crons. Failures are
visible there and, once Sentry is set up, also surface as server-side
exceptions in Sentry (the route runs on Node runtime).

## Retention

Vercel Blob Free tier keeps files indefinitely (subject to 1 GB total quota).
Each daily snapshot is overwritten on the same date thanks to
`allowOverwrite: true`, so at most one file per calendar day exists. Manually
prune old blobs from the dashboard if storage approaches the quota.
