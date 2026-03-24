import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Mentions Légales — LOLETT',
  description: 'Mentions légales du site LOLETT.',
  alternates: { canonical: `${BASE_URL}/mentions-legales` },
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-[#1B0B94]">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold mb-12">
          Mentions Légales
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong>lolett.fr</strong> est édité par :<br />
              <strong>LOLETT</strong><br />
              Forme juridique : Micro-entreprise — Entrepreneur individuel<br />
              Siège social : 30 avenue Honoré Baradat, 64000 Pau, France<br />
              SIRET : 999 609 332 00013<br />
              RCS : Pau<br />
              TVA : Non applicable — Article 293 B du CGI (franchise en base de TVA)<br />
              Dirigeante : Lola Senfft Von Pilsach
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Directrice de la publication</h2>
            <p>Lola Senfft Von Pilsach</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Contact</h2>
            <p>
              Email :{' '}
              <a href="mailto:contact.lolett@gmail.com" className="underline hover:text-[#B89547] transition-colors">
                contact.lolett@gmail.com
              </a><br />
              <a href="/contact" className="underline hover:text-[#B89547] transition-colors">Formulaire de contact</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Hébergeur</h2>
            <p>
              Vercel Inc.<br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
              <a href="https://vercel.com" className="underline hover:text-[#B89547] transition-colors" target="_blank" rel="noopener noreferrer">vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site LOLETT (textes, images, logos, vidéos, graphismes) est protégé par le droit
              d&apos;auteur et le droit des marques. Toute reproduction, représentation ou diffusion, totale ou partielle, sans
              autorisation écrite préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et
              Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos
              données personnelles. Pour exercer ces droits, contactez-nous à{' '}
              <a href="mailto:contact.lolett@gmail.com" className="underline hover:text-[#B89547] transition-colors">
                contact.lolett@gmail.com
              </a>{' '}
              ou via notre{' '}
              <a href="/contact" className="underline hover:text-[#B89547] transition-colors">page de contact</a>.
            </p>
            <p className="mt-2">
              Pour plus de détails, consultez notre{' '}
              <a href="/confidentialite" className="underline hover:text-[#B89547] transition-colors">
                Politique de Confidentialité
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Cookies</h2>
            <p>
              Le site utilise des cookies nécessaires au bon fonctionnement (session, panier) et des cookies analytiques
              (avec consentement). Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre
              navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Médiation</h2>
            <p>
              Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige non résolu,
              vous pouvez recourir gratuitement au service de médiation :<br />
              MEDICYS — Centre de médiation et règlement amiable des huissiers de justice<br />
              <a href="https://www.medicys.fr" className="underline hover:text-[#B89547] transition-colors" target="_blank" rel="noopener noreferrer">www.medicys.fr</a>
            </p>
            <p className="mt-2">
              Plateforme de règlement en ligne des litiges :{' '}
              <a
                href="https://ec.europa.eu/consumers/odr"
                className="underline hover:text-[#B89547] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                ec.europa.eu/consumers/odr
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
