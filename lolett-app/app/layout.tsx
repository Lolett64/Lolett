import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, Montserrat, Newsreader } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { AuthProvider } from '@/lib/auth/context';
import { CartSync } from '@/features/cart/CartSync';
import { getSiteContent } from '@/lib/cms/content';
import { CookieConsent } from '@/components/cookies/CookieConsent';
import { GoogleTagManager } from '@/components/cookies/GoogleTagManager';

export const revalidate = 60;

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LOLETT | Mode du Sud-Ouest',
    template: '%s | LOLETT',
  },
  description:
    'LOLETT - Mode du Sud-Ouest pour homme et femme. Née ici, portée partout. Découvrez nos collections solaires.',
  keywords: ['mode', 'vêtements', 'sud-ouest', 'sud', 'été', 'français'],
  authors: [{ name: 'LOLETT' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'LOLETT',
    title: 'LOLETT | Mode du Sud-Ouest',
    description: 'Mode du Sud-Ouest pour homme et femme. Née ici, portée partout.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOLETT | Mode du Sud-Ouest',
    description: 'Mode du Sud-Ouest pour homme et femme. Née ici, portée partout.',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const footerContent = await getSiteContent('footer');

  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable} ${montserrat.variable} ${newsreader.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://utgwrfqnaoggckfruzzo.supabase.co" />
      </head>
      <body className="font-body antialiased">
        <GoogleTagManager />
        <AuthProvider>
          <CartSync />
          <SiteChrome footerContent={footerContent}>{children}</SiteChrome>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
