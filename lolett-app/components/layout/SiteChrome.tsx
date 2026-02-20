'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

interface SiteChromeProps {
  children: React.ReactNode;
  footerContent?: Record<string, string>;
}

export function SiteChrome({ children, footerContent }: SiteChromeProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer content={footerContent} />
    </>
  );
}
