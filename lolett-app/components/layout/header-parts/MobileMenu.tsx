'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/brand/Logo';
import { TikTokIcon, InstagramIcon } from '@/components/icons';
import { useCartStore } from '@/features/cart';
import { useFavoritesStore } from '@/features/favorites';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { navigation } from './navigation';

interface MobileMenuProps {
  pathname: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ pathname, isOpen, onOpenChange }: MobileMenuProps) {
  const cartCount = useCartStore((state) => state.getItemCount());
  const favCount = useFavoritesStore((state) => state.getCount());

  const closeMenu = () => onOpenChange(false);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild className="lg:hidden">
        <button
          className="text-lolett-gray-600 hover:text-lolett-gold touch-target flex items-center justify-center p-2.5 transition-colors"
          aria-label="Menu"
          aria-expanded={isOpen}
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0 sm:w-[350px]">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="border-lolett-gray-200 border-b p-6">
            <Logo size="md" />
          </div>
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={cn(
                      'hover:text-lolett-gold block py-3 text-lg font-medium transition-colors',
                      pathname === item.href ? 'text-lolett-gold' : 'text-lolett-gray-900'
                    )}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="mb-2 ml-4 flex flex-col gap-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeMenu}
                          aria-current={pathname === child.href ? 'page' : undefined}
                          className={cn(
                            'hover:text-lolett-gold block py-2 text-base transition-colors',
                            pathname === child.href ? 'text-lolett-gold' : 'text-lolett-gray-600'
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
          <div className="border-lolett-gray-200 bg-lolett-gray-100 border-t p-6">
            {/* Social links mobile */}
            <div className="mb-4 flex justify-center gap-3">
              <a
                href="https://instagram.com/lolett"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://tiktok.com/@lolett"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5 text-white" />
              </a>
            </div>
            <div className="flex gap-4">
              <Link
                href="/favoris"
                onClick={closeMenu}
                className="text-lolett-gray-700 hover:text-lolett-gold flex flex-1 items-center justify-center gap-2 rounded-lg bg-white py-3 transition-colors"
              >
                <Heart className="h-5 w-5" />
                <span>Favoris</span>
                {favCount > 0 && (
                  <span className="bg-lolett-gold rounded-full px-1.5 py-0.5 text-xs text-white">
                    {favCount}
                  </span>
                )}
              </Link>
              <Link
                href="/panier"
                onClick={closeMenu}
                className="bg-lolett-gold hover:bg-lolett-gold-light flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-white transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Panier</span>
                {cartCount > 0 && (
                  <span className="text-lolett-gold rounded-full bg-white px-1.5 py-0.5 text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
