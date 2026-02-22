'use client';

import { usePathname } from 'next/navigation';
import { HighBarV4 } from '@/components/headers/HighBarV4';
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

  const isTestPage = pathname.startsWith('/test');

  return (
    <>
      {!isTestPage && <HighBarV4 hexColor="#FDF5E6" />}
      <main className="min-h-screen">{children}</main>
      {!isTestPage && <Footer content={footerContent} />}
    </>
  );
}
