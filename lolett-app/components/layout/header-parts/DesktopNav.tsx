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
}

export function DesktopNav({
  pathname,
  openDropdown,
  onDropdownOpen,
  onDropdownClose,
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
              'hover:text-lolett-blue flex items-center gap-1 py-2 text-sm font-medium transition-colors',
              pathname === item.href ? 'text-lolett-blue' : 'text-lolett-gray-600'
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
              <div className="border-lolett-gray-200 min-w-[160px] rounded-lg border bg-white py-2 shadow-lg">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    aria-current={pathname === child.href ? 'page' : undefined}
                    className="text-lolett-gray-600 hover:bg-lolett-gray-100 hover:text-lolett-blue block px-4 py-2.5 text-sm transition-colors"
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
