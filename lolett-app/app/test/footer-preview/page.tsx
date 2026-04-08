'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { TikTokIcon, InstagramIcon, FacebookIcon } from '@/components/icons';

const BLUE = '#1B0B94';

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
    { name: 'CGV', href: '/cgv' },
    { name: 'Mentions légales', href: '/mentions-legales' },
    { name: 'Confidentialité', href: '/confidentialite' },
  ],
};

function LogoBlue() {
  return (
    <span className="font-[family-name:var(--font-montserrat)] font-black tracking-[-0.02em] text-3xl inline-flex items-center" style={{ color: BLUE }}>
      LOLET<span className="inline-block transform rotate-[15deg] origin-bottom-left">T</span>
    </span>
  );
}

function FooterPreview({ bg, textColor, mutedColor, borderColor, socialBg, label }: {
  bg: string; textColor: string; mutedColor: string; borderColor: string; socialBg: string; label: string;
}) {
  return (
    <div>
      <div style={{ background: '#FDF5E6', padding: '24px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '28px', fontWeight: 400, color: '#1A1510' }}>
          {label}
        </h2>
        <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '13px', color: '#9B8E82', marginTop: '4px' }}>
          Fond : {bg}
        </p>
      </div>
      <footer style={{ background: bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '32px' }}>
            {/* Brand */}
            <div>
              <LogoBlue />
              <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: mutedColor, marginTop: '16px', lineHeight: 1.7, maxWidth: '45ch' }}>
                Mode du Sud-Ouest. Née ici, portée partout. Pour ceux qui aiment la vie sous le soleil.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {[InstagramIcon, TikTokIcon, FacebookIcon].map((Icon, i) => (
                  <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: socialBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textColor }}>
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: socialBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} style={{ color: textColor }} />
                </div>
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Boutique', links: footerLinks.shop },
              { title: 'Aide', links: footerLinks.help },
              { title: 'Légal', links: footerLinks.legal },
            ].map((section) => (
              <div key={section.title}>
                <h4 style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: textColor, marginBottom: '16px' }}>
                  {section.title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {section.links.map((link) => (
                    <li key={link.name} style={{ marginBottom: '12px' }}>
                      <Link href={link.href} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '14px', color: mutedColor, textDecoration: 'none' }}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '13px', color: mutedColor }}>
              © 2026 LOLETT. Tous droits réservés.
            </p>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '13px', color: mutedColor }}>
              Fait avec passion par <span style={{ fontWeight: 600 }}>Propul&apos;SEO</span>
            </p>
            <p style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: '13px', color: mutedColor }}>
              Fait avec amour depuis le Sud
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function FooterPreviewPage() {
  return (
    <main style={{ background: '#FDF5E6', minHeight: '100vh' }}>
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-newsreader), serif', fontSize: '40px', fontWeight: 400, color: '#1A1510' }}>
          Previews Footer
        </h1>
      </div>

      {/* A — Sable chaud (continuité page) */}
      <FooterPreview
        label="A — Sable Chaud (continuité de la page)"
        bg="#F5EDE0"
        textColor="#1A1510"
        mutedColor="rgba(26,21,16,0.55)"
        borderColor="rgba(184,149,71,0.2)"
        socialBg="rgba(27,11,148,0.08)"
      />

      <div style={{ height: 60 }} />

      {/* B — Bleu nuit doux */}
      <FooterPreview
        label="B — Bleu Nuit Doux"
        bg="#1B0B94"
        textColor="#F5EDE0"
        mutedColor="rgba(253,245,230,0.55)"
        borderColor="rgba(253,245,230,0.12)"
        socialBg="rgba(255,255,255,0.1)"
      />

      <div style={{ height: 60 }} />

      {/* C — Brun élégant */}
      <FooterPreview
        label="C — Brun Élégant"
        bg="#1A1510"
        textColor="#F5EDE0"
        mutedColor="rgba(253,245,230,0.5)"
        borderColor="rgba(184,149,71,0.15)"
        socialBg="rgba(255,255,255,0.08)"
      />
    </main>
  );
}
