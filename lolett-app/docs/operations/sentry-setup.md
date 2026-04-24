# Sentry Setup — Operations Guide

Sentry capture client + server + edge errors. SDK is wired via `@sentry/nextjs`
and the three `sentry.*.config.ts` files at the root of `lolett-app/`. Until
the DSN is set, the SDK is a no-op because every config is gated on
`process.env.NODE_ENV === 'production'`.

## One-time setup

1. Sign up at <https://sentry.io>.
2. Create an organization slug `lolett` and a Next.js project `lolett-app`.
3. Copy the project DSN. Set both env vars — same value on each:
   - `NEXT_PUBLIC_SENTRY_DSN` (Vercel: production + preview)
   - `SENTRY_DSN` (Vercel: production + preview)
4. Create an auth token with scopes `project:releases` + `org:read`.
   Set it on Vercel as `SENTRY_AUTH_TOKEN` (production only — it uploads
   source maps during build).
5. Set organizational metadata on Vercel env vars:
   - `SENTRY_ORG=lolett`
   - `SENTRY_PROJECT=lolett-app`
6. Redeploy.

## Verifying the wiring

After the next production deploy, hit:

```
https://lolett.vercel.app/api/_sentry-test
```

The endpoint throws a deliberate error. Within ~1 minute the event should
appear in the Sentry issues feed. The endpoint 403s in non-production so it
can't be abused on previews.

## Env-var reference

| Variable | Scope | Required |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | client | yes |
| `SENTRY_DSN` | server + edge | yes |
| `SENTRY_ORG` | build | yes (for source-map upload) |
| `SENTRY_PROJECT` | build | yes (for source-map upload) |
| `SENTRY_AUTH_TOKEN` | build | yes (for source-map upload) |

If the DSN is unset, Sentry.init runs with an `undefined` dsn; the SDK
silently drops events. Combined with `enabled: NODE_ENV === 'production'`,
this means dev, preview, and tests never attempt to send.
