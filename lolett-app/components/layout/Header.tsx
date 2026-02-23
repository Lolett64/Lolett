'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { SHIPPING } from '@/lib/constants';
import {
  DesktopNav,
  MobileMenu,
  SocialDropdown,
  CartBadge,
  FavoritesBadge,
  AccountBadge,
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
      className="group/header fixed top-0 right-0 left-0 z-50 transition-all duration-500"
      data-scrolled={isScrolled}
      style={{
        background: isScrolled
          ? 'rgba(254,252,248,0.92)'
          : 'rgba(26,21,16,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isScrolled
          ? '0 1px 0 rgba(27,11,148,0.2)'
          : 'none',
      }}
    >
      <div className="container">
        <div
          className={cn(
            'flex items-center justify-between gap-4 transition-all duration-500',
            isScrolled ? 'py-2.5' : 'py-3.5 sm:py-4'
          )}
        >
          {/* Left — Logo */}
          <Link href="/" className="relative z-10 flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center — Navigation */}
          <DesktopNav
            pathname={pathname}
            openDropdown={openDropdown}
            onDropdownOpen={setOpenDropdown}
            onDropdownClose={() => setOpenDropdown(null)}
            isScrolled={isScrolled}
          />

          {/* Right — Info badges + icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Shipping info — desktop only */}
            <div
              className={cn(
                'mr-2 hidden items-center gap-3 rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide transition-all duration-500 xl:flex',
                isScrolled
                  ? 'text-[#5a4d3e]'
                  : 'border-white/15 bg-white/10 text-white'
              )}
              style={isScrolled ? {
                borderColor: 'rgba(27,11,148,0.3)',
                background: 'rgba(244,183,64,0.08)',
              } : undefined}
            >
              <Truck className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
              <span>Livraison offerte dès {SHIPPING.FREE_THRESHOLD}€</span>
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: isScrolled ? 'rgba(27,11,148,0.5)' : 'rgba(255,255,255,0.4)' }}
              />
              <span>24/48h</span>
              <span
                className="h-1 w-1 rounded-full"
                style={{ background: isScrolled ? 'rgba(27,11,148,0.5)' : 'rgba(255,255,255,0.4)' }}
              />
              <span>Retours 30j</span>
            </div>

            <SocialDropdown
              isOpen={socialHover}
              onOpen={() => setSocialHover(true)}
              onClose={() => setSocialHover(false)}
            />
            <AccountBadge />
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
