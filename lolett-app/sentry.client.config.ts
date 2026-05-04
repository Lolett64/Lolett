import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    // RGPD : masque tous les textes saisis (emails, adresses, noms) dans les replays.
    // Les images/médias sont bloqués (peuvent contenir des infos persos).
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
  enabled: process.env.NODE_ENV === 'production',
});
