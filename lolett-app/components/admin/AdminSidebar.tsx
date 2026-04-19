'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Image,
  Tag,
  Mail,
  X,
  Menu,
  Home,
  BookOpen,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact: boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  badge,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors border-l-2',
        isActive
          ? 'border-[#B89547] text-[#B89547]'
          : 'border-transparent text-white/70 hover:text-white'
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
      {badge != null && badge > 0 && (
        <span className="bg-[#C4956A] text-white text-[9px] px-1.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar({ pendingOrders = 0 }: { pendingOrders?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navGroups: NavGroup[] = [
    {
      label: '',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      label: 'Mon site',
      items: [
        { href: '/admin/site/accueil', label: 'Accueil', icon: Home, exact: false },
        { href: '/admin/site/boutique', label: 'Boutique', icon: ShoppingBag, exact: false },
        { href: '/admin/site/notre-histoire', label: 'Notre histoire', icon: BookOpen, exact: false },
        { href: '/admin/site/contact', label: 'Contact', icon: Mail, exact: false },
        { href: '/admin/site/footer', label: 'Footer', icon: ArrowDown, exact: false },
      ],
    },
    {
      label: 'Catalogue',
      items: [
        { href: '/admin/products', label: 'Produits', icon: ShoppingBag, exact: false },
        { href: '/admin/looks', label: 'Looks', icon: Image, exact: false },
        { href: '/admin/categories', label: 'Catégories', icon: Tag, exact: false },
      ],
    },
    {
      label: 'Gestion',
      items: [
        { href: '/admin/orders', label: 'Commandes', icon: Package, exact: false, badge: pendingOrders },
        { href: '/admin/promos', label: 'Codes Promo', icon: Tag, exact: false },
        { href: '/admin/emails', label: 'Emails', icon: Mail, exact: false },
      ],
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-[#1B0B94] p-2 text-white shadow-md lg:hidden"
        aria-label="Ouvrir menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-gradient-to-b from-[#1B0B94] to-[#130866] shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <span className="font-[Montserrat] text-lg font-bold uppercase tracking-[0.3em] text-[#B89547]">
              LOLETT
            </span>
            <div className="mt-2 h-px w-full bg-[#B89547]/40" />
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-white/60 hover:text-white lg:hidden"
            aria-label="Fermer menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2 pt-2">
          {navGroups.map((group) => (
            <div key={group.label || 'top'}>
              {group.label && (
                <p className="mt-5 mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B89547]/80">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  {...item}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C4956A] text-xs font-bold text-white">L</div>
            <div>
              <p className="text-xs font-medium text-white">Lola</p>
              <p className="text-[9px] text-white/35">Fondatrice</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
