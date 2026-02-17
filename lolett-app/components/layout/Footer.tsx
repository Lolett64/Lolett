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
  help: [
    { name: 'Contact', href: '/contact' },
    { name: 'Livraison', href: '/contact' },
    { name: 'Retours', href: '/contact' },
  ],
  legal: [
    { name: 'CGV', href: '/contact' },
    { name: 'Mentions légales', href: '/contact' },
    { name: 'Confidentialité', href: '/contact' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-lolett-gray-900 text-white">
      <div className="container pt-12 pb-4 sm:pt-16 sm:pb-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 min-w-0 sm:col-span-2 lg:col-span-2">
            <Logo variant="white" size="lg" />
            <p className="text-lolett-gray-400 mt-4 max-w-[45ch] leading-relaxed">
              Mode méditerranéenne. Pensée au Sud, portée partout. Pour ceux qui aiment la vie sous
              le soleil.
            </p>
            <div className="mt-6 flex gap-3">
              {/* Instagram - gradient rose/violet/orange */}
              <a
                href="https://instagram.com/lolett"
                target="_blank"
                rel="noopener noreferrer"
                className="group touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E1306C] hover:to-[#F77737]"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5 text-white group-hover:text-white" />
              </a>
              {/* TikTok - noir/blanc */}
              <a
                href="https://tiktok.com/@lolett"
                target="_blank"
                rel="noopener noreferrer"
                className="group touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300 hover:bg-black"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5 text-white" />
              </a>
              {/* Facebook - bleu officiel */}
              <a
                href="https://facebook.com/lolett"
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300 hover:bg-[#1877F2]"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5 text-white" />
              </a>
              {/* Email - bleu LOLETT */}
              <a
                href="mailto:hello@lolett.com"
                className="hover:bg-lolett-blue touch-target flex items-center justify-center rounded-full bg-white/10 p-2.5 transition-all duration-300"
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

          {/* Aide */}
          <div>
            <h4 className="font-display mb-4 text-sm font-semibold tracking-wider uppercase">
              Aide
            </h4>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
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
          <p>Fait avec amour depuis le Sud</p>
        </div>
      </div>
    </footer>
  );
}
