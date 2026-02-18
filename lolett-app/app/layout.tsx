import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/layout/SiteChrome';

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

export const metadata: Metadata = {
  title: {
    default: 'LOLETT | Mode Méditerranéenne',
    template: '%s | LOLETT',
  },
  description:
    'LOLETT - Mode méditerranéenne pour homme et femme. Pensée au Sud, portée partout. Découvrez nos collections solaires.',
  keywords: ['mode', 'vêtements', 'méditerranée', 'sud', 'été', 'français'],
  authors: [{ name: 'LOLETT' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'LOLETT',
    title: 'LOLETT | Mode Méditerranéenne',
    description: 'Mode méditerranéenne pour homme et femme. Pensée au Sud, portée partout.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LOLETT | Mode Méditerranéenne',
    description: 'Mode méditerranéenne pour homme et femme. Pensée au Sud, portée partout.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
