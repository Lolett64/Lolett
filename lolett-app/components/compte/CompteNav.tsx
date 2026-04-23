'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, MapPin, Heart, Star, Award, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/compte/profil', label: 'Mon profil', icon: User },
  { href: '/compte/commandes', label: 'Mes commandes', icon: Package },
  { href: '/compte/adresses', label: 'Mes adresses', icon: MapPin },
  { href: '/compte/favoris', label: 'Mes favoris', icon: Heart },
  { href: '/compte/fidelite', label: 'Programme fidélité', icon: Award },
  { href: '/compte/avis', label: 'Mes avis', icon: Star },
];

export function CompteNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#c4b49c]/10">
        <h2 className="font-playfair text-lg text-[#1a1510]">Mon espace</h2>
      </div>
      <div className="flex flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/compte' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors border-l-2',
                active
                  ? 'border-l-[#1B0B94] text-[#1B0B94] bg-[#1B0B94]/5'
                  : 'border-l-transparent text-[#5a4d3e] hover:bg-[#f3efe8]'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="border-t border-[#c4b49c]/10 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-[#5a4d3e] hover:bg-[#f3efe8] transition-colors font-body"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
