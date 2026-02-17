'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import {
  DesktopNav,
  MobileMenu,
  SocialDropdown,
  CartBadge,
  FavoritesBadge,
} from './header-parts';

export function Header() {
  const pathname = usePathname();
  const scrollY = useScrollPosition();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [socialHover, setSocialHover] = useState(false);

  const isScrolled = scrollY > 20;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/95 py-3 shadow-sm backdrop-blur-md' : 'bg-transparent py-4 sm:py-5'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="relative z-10 flex-shrink-0">
            <Logo size="md" />
          </Link>

          <DesktopNav
            pathname={pathname}
            openDropdown={openDropdown}
            onDropdownOpen={setOpenDropdown}
            onDropdownClose={() => setOpenDropdown(null)}
          />

          <div className="flex items-center gap-1 sm:gap-2">
            <SocialDropdown
              isOpen={socialHover}
              onOpen={() => setSocialHover(true)}
              onClose={() => setSocialHover(false)}
            />
            <FavoritesBadge />
            <CartBadge />
            <MobileMenu
              pathname={pathname}
              isOpen={mobileMenuOpen}
              onOpenChange={setMobileMenuOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
