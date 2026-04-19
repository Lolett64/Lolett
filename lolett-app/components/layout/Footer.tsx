'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { TikTokIcon, InstagramIcon, FacebookIcon } from '@/components/icons';

const footerLinks = {
  shop: [
    { name: 'Homme', href: '/shop/homme' },
    { name: 'Femme', href: '/shop/femme' },
    { name: 'Nouveautés', href: '/nouveautes' },
  ],
  brand: [
    { name: 'Notre histoire', href: '/notre-histoire' },
    { name: 'Contact', href: '/contact' },
  ],
  legal: [
    { name: 'CGV', href: '/cgv' },
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'Confidentialité', href: '/confidentialite' },
  ],
};

interface FooterProps {
  content?: Record<string, string>;
}

export function Footer({ content }: FooterProps) {
  return (
    <footer className="bg-lolett-gray-900 text-white">
      <div className="container pt-12 pb-4 sm:pt-16 sm:pb-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 min-w-0 sm:col-span-2 lg:col-span-2">
            <Logo variant="white" size="lg" />
            <p className="text-lolett-gray-400 mt-4 max-w-[45ch] leading-relaxed">
              {content?.tagline || 'Mode du Sud-Ouest. Née ici, portée partout. Pour ceux qui aiment la vie sous le soleil.'}
            </p>
            <div className="mt-6 flex gap-3">
              {/* Instagram - gradient rose/violet/orange */}
              <a
                href={content?.instagram_url || "https://instagram.com/lolett"}
                target="_blank"
                rel="noopener noreferrer"
                className="group touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737]"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5 text-white group-hover:text-white" />
              </a>
              {/* TikTok - noir/blanc */}
              <a
                href={content?.tiktok_url || "https://tiktok.com/@lolett"}
                target="_blank"
                rel="noopener noreferrer"
                className="group touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300 hover:bg-black"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5 text-white" />
              </a>
              {/* Facebook - bleu officiel */}
              <a
                href={content?.facebook_url || "https://facebook.com/lolett"}
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300 hover:bg-[#1877F2]"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5 text-white" />
              </a>
              {/* Email - bleu LOLETT */}
              <a
                href={`mailto:${content?.email || 'hello@lolett.com'}`}
                className="hover:bg-lolett-gold touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="font-display mb-4 text-sm font-semibold tracking-wider uppercase">
              Boutique
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-lolett-gray-400 inline-block py-1 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* La marque */}
          <div>
            <h4 className="font-display mb-4 text-sm font-semibold tracking-wider uppercase">
              La marque
            </h4>
            <ul className="space-y-3">
              {footerLinks.brand.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-lolett-gray-400 inline-block py-1 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-display mb-4 text-sm font-semibold tracking-wider uppercase">
              Légal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-lolett-gray-400 inline-block py-1 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event('lolett-open-cookie-settings'))}
                  className="text-lolett-gray-400 inline-block py-1 transition-colors hover:text-white"
                >
                  Gérer les cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-lolett-gray-500 mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm sm:mt-12 sm:flex-row sm:pt-8">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} LOLETT. Tous droits réservés.
          </p>
          <a
            href="https://propulseo-site.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-lolett-yellow transition-colors"
          >
            Fait avec passion par <span className="font-medium">Propul&apos;SEO</span>
          </a>
          <p>{content?.made_with || 'Fait avec amour depuis le Sud'}</p>
        </div>
      </div>
    </footer>
  );
}
