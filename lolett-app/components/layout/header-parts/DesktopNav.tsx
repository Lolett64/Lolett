'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigation } from './navigation';

interface DesktopNavProps {
  pathname: string;
  openDropdown: string | null;
  onDropdownOpen: (name: string) => void;
  onDropdownClose: () => void;
  isScrolled?: boolean;
}

export function DesktopNav({
  pathname,
  openDropdown,
  onDropdownOpen,
  onDropdownClose,
  isScrolled = false,
}: DesktopNavProps) {
  return (
    <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
      {navigation.map((item) => (
        <div
          key={item.name}
          className="relative"
          onMouseEnter={() => item.children && onDropdownOpen(item.name)}
          onMouseLeave={onDropdownClose}
        >
          <Link
            href={item.href}
            aria-current={pathname === item.href ? 'page' : undefined}
            aria-expanded={item.children ? openDropdown === item.name : undefined}
            aria-haspopup={item.children ? 'true' : undefined}
            className={cn(
              'flex items-center gap-1 py-2 text-lg font-bold transition-colors',
              isScrolled
                ? pathname === item.href
                  ? 'text-[#1a1510]'
                  : 'text-[#5a4d3e] hover:text-[#1a1510]'
                : pathname === item.href
                  ? 'text-white'
                  : 'text-white/80 hover:text-white'
            )}
          >
            <span>{item.name}</span>
            {item.children && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform',
                  openDropdown === item.name && 'rotate-180'
                )}
              />
            )}
          </Link>

          {item.children && openDropdown === item.name && (
            <div className="animate-fade-in absolute top-full left-0 pt-2">
              <div className="min-w-[160px] rounded-lg border py-2 shadow-lg" style={{ borderColor: 'rgba(27,11,148,0.2)', background: '#FDF5E6' }}>
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    aria-current={pathname === child.href ? 'page' : undefined}
                    className="block px-4 py-2.5 text-sm transition-colors hover:bg-[#f7f0e4]"
                    style={{ color: '#5a4d3e' }}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
