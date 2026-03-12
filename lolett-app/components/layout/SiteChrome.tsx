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
    <div className="w-full">
      {!isTestPage && <HighBarV4 hexColor="#FDF5E6" />}
      <main className="min-h-screen">{children}</main>
      {!isTestPage && (
        <div className="py-8 text-center" style={{ backgroundColor: '#FDF5E6' }}>
          <p className="font-[family-name:var(--font-newsreader)] italic text-lg md:text-xl text-[#1B0B94]/50 tracking-wide">
            LOLETT décline toute responsabilité en cas de coup de cœur.
          </p>
        </div>
      )}
      {!isTestPage && <Footer content={footerContent} />}
    </div>
  );
}
