import type { Metadata } from 'next';
import { CompteNav } from '@/components/compte/CompteNav';

export const metadata: Metadata = {
  title: 'Mon Espace',
  description: 'Gérez votre compte LOLETT : commandes, adresses, favoris et programme fidélité.',
  robots: { index: false, follow: false },
};

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-28 pb-16" style={{ backgroundColor: '#FDF5E6' }}>
      <div className="container">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <CompteNav />
          </aside>
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
