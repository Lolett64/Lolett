import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const baseScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  'https://ajax.googleapis.com',
  'https://unpkg.com',
  'https://widget.mondialrelay.com',
  'https://www.googletagmanager.com',
  'https://js.stripe.com',
];

// 'unsafe-eval' requis uniquement par le plugin jQuery du widget Mondial Relay
// (jquery.plugin.mondialrelay.parcelshoppicker) qui utilise eval() pour parser
// la réponse JSONP de /SearchPR. Cantonné à /checkout pour limiter la surface
// d'attaque XSS au reste du site. À supprimer quand on remplacera ce widget
// par notre propre composant React + API serveur (v1.1).
const checkoutScriptSrc = [...baseScriptSrc, "'unsafe-eval'"].join(' ');
const defaultScriptSrc = baseScriptSrc.join(' ');

function buildCsp(scriptSrc: string): string {
  return [
    "default-src 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://widget.mondialrelay.com",
    "font-src 'self' https://fonts.gstatic.com data: https://widget.mondialrelay.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://qczdwrudgmozyxkdidmr.supabase.co https://*.tile.openstreetmap.org https://www.googletagmanager.com https://widget.mondialrelay.com",
    "media-src 'self' https://qczdwrudgmozyxkdidmr.supabase.co",
    "connect-src 'self' https://qczdwrudgmozyxkdidmr.supabase.co https://*.ingest.sentry.io https://api-adresse.data.gouv.fr https://widget.mondialrelay.com https://unpkg.com https://api.stripe.com https://m.stripe.com https://m.stripe.network https://www.google-analytics.com",
    "frame-src 'self' https://js.stripe.com https://www.googletagmanager.com https://hooks.stripe.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const sharedSecurityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const defaultSecurityHeaders = [
  { key: 'Content-Security-Policy', value: buildCsp(defaultScriptSrc) },
  ...sharedSecurityHeaders,
];

const checkoutSecurityHeaders = [
  { key: 'Content-Security-Policy', value: buildCsp(checkoutScriptSrc) },
  ...sharedSecurityHeaders,
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
    // CSP loose ('unsafe-eval') uniquement sur /checkout exact où le widget
    // jQuery Mondial Relay est rendu. /checkout/success et autres sous-routes
    // post-paiement gardent la CSP stricte. Regex négative pour exclure
    // /checkout du bloc strict (Next.js applique tous les blocs qui matchent
    // → on évite un double Content-Security-Policy header).
    return [
      {
        source: '/checkout',
        headers: checkoutSecurityHeaders,
      },
      {
        source: '/((?!checkout$).*)',
        headers: defaultSecurityHeaders,
      },
    ];
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
