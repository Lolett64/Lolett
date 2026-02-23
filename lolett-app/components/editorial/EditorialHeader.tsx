'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface EditorialHeaderProps {
  theme?: 'dark' | 'light';
}

export function EditorialHeader({ theme = 'dark' }: EditorialHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkBase = 'relative text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-500 after:content-[\'\'] after:absolute after:w-0 after:h-[1px] after:bottom-[-3px] after:left-0 after:transition-all after:duration-500 hover:after:w-full';

  // Scrolled is always dark text on white.
  // Not scrolled depends on theme: dark theme means white text (for dark bg), light theme means dark text (for light bg).
  const isLightText = !scrolled && theme === 'dark';

  const linkColor = scrolled
    ? `${linkBase} text-[#1B0B94]/50 hover:text-[#1B0B94] after:bg-[#c9a24a]`
    : (theme === 'dark'
      ? `${linkBase} text-white/60 hover:text-white after:bg-[#c9a24a]`
      : `${linkBase} text-[#1B0B94]/60 hover:text-[#1B0B94] after:bg-[#c9a24a]`);

  return (
    <header
      className={`fixed top-0 z-[100] w-full transition-all duration-700 ${scrolled
          ? 'py-3 bg-white/90 backdrop-blur-2xl border-b border-[#1B0B94]/8 shadow-[0_1px_20px_rgba(27,11,148,0.04)]'
          : (theme === 'dark' ? 'py-5 bg-gradient-to-b from-black/30 to-transparent' : 'py-5 bg-transparent')
        }`}
    >
      <div className="max-w-[1800px] mx-auto px-5 lg:px-14 flex justify-between items-center">
        <div className="flex gap-10 items-center">
          <nav className="hidden lg:flex gap-8">
            {[
              { label: 'Collection', href: '/shop' },
              { label: 'Univers', href: '/notre-histoire' },
              { label: 'Ateliers', href: '/notre-histoire' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className={linkColor}>
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            className={`lg:hidden transition-colors ${isLightText ? 'text-white' : 'text-[#1B0B94]'}`}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/images/Logo Lolett.jpeg"
            alt="Lorett - Accueil"
            width={160}
            height={60}
            className={`h-10 w-auto object-contain transition-all duration-700 ${!isLightText ? 'scale-90 brightness-100' : 'scale-110 brightness-[2] invert'
              }`}
            priority
          />
        </Link>

        <div className="flex gap-8 items-center">
          <nav className="hidden lg:flex gap-8">
            <Link href="/contact" className={linkColor}>Contact</Link>
          </nav>
          <Link
            href="/panier"
            className={`relative hover:scale-110 transition-all ${isLightText ? 'text-white' : 'text-[#1B0B94]'}`}
            aria-label="Panier"
          >
            <ShoppingBag size={18} strokeWidth={1.2} />
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-[#1B0B94]/8 px-6 py-8 flex flex-col gap-5 animate-[slideDown_0.3s_ease]">
          {[
            { label: 'Collection', href: '/shop' },
            { label: 'Univers', href: '/notre-histoire' },
            { label: 'Ateliers', href: '/notre-histoire' },
            { label: 'Contact', href: '/contact' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm uppercase tracking-[0.15em] font-light text-[#1B0B94]/60 hover:text-[#1B0B94] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
