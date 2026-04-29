import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ajax.googleapis.com https://unpkg.com https://widget.mondialrelay.com https://www.googletagmanager.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://qczdwrudgmozyxkdidmr.supabase.co https://*.tile.openstreetmap.org https://www.googletagmanager.com",
  "connect-src 'self' https://qczdwrudgmozyxkdidmr.supabase.co https://*.ingest.sentry.io https://api-adresse.data.gouv.fr https://widget.mondialrelay.com https://api.stripe.com https://m.stripe.com https://m.stripe.network https://www.google-analytics.com",
  "frame-src 'self' https://js.stripe.com https://www.googletagmanager.com https://hooks.stripe.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'qczdwrudgmozyxkdidmr.supabase.co',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
