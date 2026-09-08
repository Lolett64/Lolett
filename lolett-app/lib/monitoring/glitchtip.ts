import { scrubEvent } from './privacy';

// Public ingestion address, not an admin credential. Empty override disables reporting.
export const GLITCHTIP_DSN = process.env.NEXT_PUBLIC_GLITCHTIP_DSN ??
  'https://0f348324db844cdeb04219067578a0f0@errors.propulseo-site.com/7';

export const glitchtipOptions = {
  dsn: GLITCHTIP_DSN,
  enabled: process.env.NODE_ENV === 'production' && Boolean(GLITCHTIP_DSN),
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
  sendDefaultPii: false,
  autoSessionTracking: false,
  integrations: <T extends { name: string }>(defaults: T[]): T[] => defaults.filter((item) => item.name !== 'BrowserSession'),
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  maxBreadcrumbs: 0,
  beforeSend: scrubEvent,
} as const;
