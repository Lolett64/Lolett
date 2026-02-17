'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Image,
  Tag,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produits', icon: ShoppingBag, exact: false },
  { href: '/admin/orders', label: 'Commandes', icon: Package, exact: false },
  { href: '/admin/looks', label: 'Looks', icon: Image, exact: false },
  { href: '/admin/categories', label: 'Catégories', icon: Tag, exact: false },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-lolett-blue text-white'
          : 'text-lolett-gray-600 hover:bg-lolett-gray-200 hover:text-lolett-gray-900'
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden"
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
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white shadow-sm transition-transform duration-200 lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-lolett-gray-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between border-b border-lolett-gray-200 px-4 py-4">
          <span className="text-lg font-bold tracking-widest text-lolett-blue">LOLETT</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 hover:bg-lolett-gray-100 lg:hidden"
            aria-label="Fermer menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-lolett-gray-200 p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-lolett-gray-500 hover:text-lolett-gray-900"
          >
            Voir la boutique
          </Link>
        </div>
      </aside>
    </>
  );
}
