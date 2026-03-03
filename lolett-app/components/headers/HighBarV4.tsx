'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ShoppingBag, Heart, Mail, ChevronDown, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useCartStore } from '@/features/cart';
import { useFavoritesStore } from '@/features/favorites';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { SHIPPING } from '@/lib/constants';
import { MobileMenu } from '@/components/layout/header-parts';
import { navigation } from '@/components/layout/header-parts/navigation';

interface HighBarV4Props {
    hexColor?: string;
}

export function HighBarV4({ hexColor = '#FDF5E6' }: HighBarV4Props) {
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const cartCount = useCartStore((state) => state.getItemCount());
    const favCount = useFavoritesStore((state) => state.getCount());
    const scrollY = useScrollPosition();
    const isScrolled = scrollY > 20;

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const initials = user?.user_metadata?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'L';

    return (
        <header className="sticky top-0 z-[100]">
            <div
                className="transition-shadow duration-300"
                style={{
                    boxShadow: isScrolled ? '0 4px 30px rgba(27,11,148,0.08)' : 'none',
                }}
            >
                {/* Top Bar — Réassurance */}
                <div className="w-full bg-[#1B0B94] text-white text-[11px] font-medium tracking-wide">
                    <div className="w-full flex items-center justify-center px-6 md:px-8 py-2">
                        <div className="flex items-center gap-2">
                            <span>Livraison offerte dès {SHIPPING.FREE_THRESHOLD}€</span>
                            <span className="w-1 h-1 rounded-full bg-[#B89547]"></span>
                            <span>24/48h</span>
                            <span className="w-1 h-1 rounded-full bg-[#B89547]"></span>
                            <span>Retours 14j</span>
                        </div>
                    </div>
                </div>

                {/* Header principal */}
                <div
                    className="w-full flex items-center justify-between px-6 md:px-8 py-2 md:py-3"
                    style={{ backgroundColor: hexColor }}
                >
                    {/* Left : Logo Dynamic "T-Tilt" */}
                    <Link href="/" className="flex shrink-0 group">
                        <div className="flex items-center justify-center text-[#1B0B94] transition-all duration-500">
                            <span className="font-[family-name:var(--font-montserrat)] text-lg md:text-xl font-black tracking-[-0.02em] flex items-center">
                                LOLET
                                <span className="inline-block transform rotate-[15deg] origin-bottom-left transition-transform group-hover:rotate-[0deg] duration-500">
                                    T
                                </span>
                            </span>
                        </div>
                    </Link>

                    {/* Center : Navigation */}
                    <nav className="hidden lg:flex items-center gap-8 xl:gap-14 text-[11px] font-bold text-[#1B0B94] uppercase tracking-[0.15em] xl:tracking-[0.2em]">
                        {navigation.map((item) => (
                            <div
                                key={item.name}
                                className="relative"
                                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <Link
                                    href={item.href}
                                    className={`hover:text-[#B89547] transition-colors flex items-center h-full outline-none focus:outline-none ${item.children ? 'gap-1.5' : ''} ${pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')) ? 'text-[#B89547]' : ''}`}
                                >
                                    {item.name}
                                    {item.children && <ChevronDown size={12} strokeWidth={2.5} className={`mt-[-1px] transition-transform ${openDropdown === item.name ? 'rotate-180' : ''}`} />}
                                </Link>

                                {item.children && openDropdown === item.name && (
                                    <div className="absolute top-full left-0 pt-2 z-50">
                                        <div className="min-w-[160px] rounded-lg border py-2 shadow-lg" style={{ borderColor: 'rgba(27,11,148,0.15)', backgroundColor: hexColor }}>
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className="block px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1B0B94] hover:text-[#B89547] transition-colors"
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

                    {/* Right : Icônes */}
                    <div className="flex items-center gap-5 xl:gap-8 shrink-0">
                        <div className="flex items-center gap-4 text-[#1B0B94]">
                            <Link href="/contact" className="hover:text-[#B89547] transition-colors hidden sm:block" aria-label="Contact">
                                <Mail size={16} strokeWidth={1.5} />
                            </Link>

                            {!loading && (
                                user ? (
                                    <Link href="/compte" className="hover:scale-105 transition-transform flex items-center justify-center" aria-label="Mon compte">
                                        <div className="w-[24px] h-[24px] rounded-full bg-[#1B0B94] flex items-center justify-center text-[#F3EFEA] text-[10px] font-bold">
                                            {initials}
                                        </div>
                                    </Link>
                                ) : (
                                    <Link href="/connexion" className="hover:scale-105 transition-transform flex items-center justify-center hidden sm:flex" aria-label="Se connecter">
                                        <div className="w-[24px] h-[24px] rounded-full bg-[#1B0B94]/20 flex items-center justify-center text-[#1B0B94]">
                                            <User size={13} />
                                        </div>
                                    </Link>
                                )
                            )}

                            <Link href="/favoris" className="relative hover:text-[#B89547] transition-colors flex items-center justify-center" aria-label="Favoris">
                                <Heart size={16} strokeWidth={1.5} />
                                {favCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] bg-[#1B0B94] rounded-full text-[#F3EFEA] text-[8px] flex items-center justify-center font-bold border border-[#F3EFEA]">
                                        {favCount > 9 ? '9+' : favCount}
                                    </span>
                                )}
                            </Link>

                            <Link href="/panier" className="relative hover:text-[#B89547] transition-colors flex items-center justify-center" aria-label="Panier">
                                <ShoppingBag size={16} strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-[14px] h-[14px] bg-[#1B0B94] rounded-full text-[#F3EFEA] text-[8px] flex items-center justify-center font-bold border border-[#F3EFEA]">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>

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
