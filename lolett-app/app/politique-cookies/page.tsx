/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';

export const metadata: Metadata = {
  title: 'Politique de cookies — LOLETT',
  description: 'Politique de gestion des cookies sur lolettshop.com — informations sur les cookies utilisés, leurs finalités, et comment les gérer.',
  alternates: { canonical: `${BASE_URL}/politique-cookies` },
};

export default function PolitiqueCookiesPage() {
  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-[#1B0B94]">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold mb-3">
          Politique de cookies
        </h1>
        <p className="text-sm mb-12 opacity-70">Dernière mise à jour : 6 mai 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3">1. Préambule</h2>
            <p>
              La présente politique a pour objet d'informer les utilisateurs du site <strong>lolettshop.com</strong> sur
              l'utilisation des cookies et autres traceurs déposés et lus lors de la navigation.
              Elle s'inscrit dans le respect du Règlement Général sur la Protection des Données (RGPD), de la
              loi Informatique et Libertés modifiée, ainsi que des recommandations de la Commission Nationale
              de l'Informatique et des Libertés (CNIL).
            </p>
            <p className="mt-2">
              En poursuivant votre navigation sur ce site, vous reconnaissez avoir pris connaissance de la présente
              politique et acceptez son application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone)
              lors de la consultation d'un site internet. Il permet au site de mémoriser des informations relatives
              à votre navigation, telles que vos préférences de langue, le contenu de votre panier, ou encore vos
              choix de consentement.
            </p>
            <p className="mt-2">
              Les cookies peuvent être déposés par le site visité (cookies « propriétaires ») ou par des sociétés
              tierces (cookies « tiers ») telles que Google Analytics ou Stripe, qui fournissent des services
              intégrés au site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Finalités des cookies utilisés</h2>
            <p className="mb-3">
              Les cookies utilisés sur lolettshop.com poursuivent les finalités suivantes :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Fonctionnement du site</strong> — assurer la navigation, le panier d'achat, l'authentification
                et la sécurité des paiements.
              </li>
              <li>
                <strong>Mesure d'audience</strong> — comprendre comment les visiteurs utilisent le site afin d'en
                améliorer l'expérience et le contenu.
              </li>
              <li>
                <strong>Mémorisation des préférences</strong> — conserver vos choix relatifs aux cookies pour ne pas
                vous solliciter à chaque visite.
              </li>
            </ul>
            <p className="mt-3">
              <strong>Aucun cookie publicitaire ni de profilage marketing</strong> n'est utilisé sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Cookies déposés sur lolettshop.com</h2>

            <h3 className="font-semibold mt-5 mb-2 text-base">4.1 Cookies strictement nécessaires</h3>
            <p className="mb-3">
              Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. Ils ne
              nécessitent pas votre consentement préalable, conformément à l'article 82 de la loi Informatique
              et Libertés.
            </p>
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <table className="w-full text-xs md:text-sm border border-[#1B0B94]/20 my-2">
                <thead className="bg-[#1B0B94]/5">
                  <tr>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Cookie</th>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Émetteur</th>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Finalité</th>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-[#1B0B94]/10 font-mono text-xs">cookie_consent</td>
                    <td className="p-3 border-b border-[#1B0B94]/10">LOLETT</td>
                    <td className="p-3 border-b border-[#1B0B94]/10">Mémorise vos préférences de cookies (acceptation ou refus des cookies analytiques).</td>
                    <td className="p-3 border-b border-[#1B0B94]/10 whitespace-nowrap">12 mois</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-[#1B0B94]/10 font-mono text-xs">sb-*</td>
                    <td className="p-3 border-b border-[#1B0B94]/10">Supabase Inc.</td>
                    <td className="p-3 border-b border-[#1B0B94]/10">Gestion de votre compte client, du panier et de la session d'authentification.</td>
                    <td className="p-3 border-b border-[#1B0B94]/10 whitespace-nowrap">Session ou 30 jours</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">__stripe_mid<br />__stripe_sid</td>
                    <td className="p-3">Stripe Inc.</td>
                    <td className="p-3">Sécurisation des paiements et prévention de la fraude.</td>
                    <td className="p-3 whitespace-nowrap">1 an / Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold mt-6 mb-2 text-base">4.2 Cookies de mesure d'audience (sur consentement)</h3>
            <p className="mb-3">
              Ces cookies nécessitent votre consentement explicite. Ils ne sont déposés qu'après acceptation de
              votre part via le bandeau de consentement affiché lors de votre première visite.
            </p>
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <table className="w-full text-xs md:text-sm border border-[#1B0B94]/20 my-2">
                <thead className="bg-[#1B0B94]/5">
                  <tr>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Cookie</th>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Émetteur</th>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Finalité</th>
                    <th className="text-left p-3 border-b border-[#1B0B94]/20 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-mono text-xs">_ga<br />_ga_*</td>
                    <td className="p-3">Google LLC<br />(Google Analytics 4)</td>
                    <td className="p-3">Mesure d'audience anonyme : nombre de visiteurs, pages consultées, durée de visite, parcours. Aucune donnée personnelle directement identifiante n'est collectée.</td>
                    <td className="p-3 whitespace-nowrap">24 mois</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs opacity-80">
              Les données collectées par Google Analytics peuvent être transférées vers les États-Unis. Google s'engage
              au respect du cadre <em>Data Privacy Framework</em> (DPF), garantissant un niveau de protection adéquat
              au sens du RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Vos choix concernant les cookies</h2>
            <p className="mb-3">
              Lors de votre première visite sur lolettshop.com, un bandeau vous propose d'accepter ou de refuser
              les cookies de mesure d'audience. Votre choix est conservé pendant 12 mois.
            </p>
            <p className="mb-3"><strong>Vous pouvez à tout moment :</strong></p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Modifier vos choix</strong> en supprimant le cookie <code className="bg-white/40 px-1.5 py-0.5 rounded text-xs">cookie_consent</code>
                {' '}depuis les paramètres de votre navigateur — le bandeau réapparaîtra à votre prochaine visite.
              </li>
              <li>
                <strong>Bloquer ou supprimer tous les cookies</strong> via les paramètres de votre navigateur.
                Consultez la rubrique « Aide » de votre navigateur pour la procédure exacte :
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B89547] transition-colors mx-1">Chrome</a>·
                <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B89547] transition-colors mx-1">Safari</a>·
                <a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox-ordinateur" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B89547] transition-colors mx-1">Firefox</a>·
                <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B89547] transition-colors mx-1">Edge</a>
              </li>
              <li>
                <strong>Vous opposer au suivi Google Analytics</strong> en installant le module
                <a href="https://tools.google.com/dlpage/gaoptout?hl=fr" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B89547] transition-colors mx-1">
                  Opt-out Google Analytics
                </a>.
              </li>
            </ul>
            <p className="mt-3 text-xs opacity-80">
              <strong>Note :</strong> le refus des cookies strictement nécessaires peut empêcher le bon fonctionnement
              de certaines parties du site (panier persistant, espace client, paiement).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Durée de conservation</h2>
            <p>
              Conformément aux recommandations de la CNIL, la durée de vie des cookies déposés sur votre terminal
              n'excède pas <strong>13 mois</strong> à compter de leur premier dépôt. Au-delà, votre consentement
              vous sera à nouveau demandé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Vos droits</h2>
            <p className="mb-3">
              Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants sur
              vos données personnelles :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>droit d'accès à vos données ;</li>
              <li>droit de rectification des données inexactes ;</li>
              <li>droit à l'effacement (« droit à l'oubli ») ;</li>
              <li>droit à la limitation et à l'opposition du traitement ;</li>
              <li>droit à la portabilité de vos données ;</li>
              <li>droit de retirer votre consentement à tout moment.</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits ou pour toute question relative à la présente politique, contactez-nous à{' '}
              <a href="mailto:bonjour@lolettshop.com" className="underline hover:text-[#B89547] transition-colors">
                bonjour@lolettshop.com
              </a>.
            </p>
            <p className="mt-2">
              Vous disposez également du droit d'introduire une réclamation auprès de la
              <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#B89547] transition-colors mx-1">
                CNIL
              </a>
              si vous estimez que le traitement de vos données ne respecte pas la réglementation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Modifications</h2>
            <p>
              La présente politique peut être amenée à évoluer en fonction des évolutions législatives,
              réglementaires ou techniques. Toute modification fera l'objet d'une mise à jour de la date
              indiquée en haut de cette page. Nous vous invitons à consulter régulièrement cette page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Pour aller plus loin</h2>
            <p>
              Pour plus d'informations sur la protection de vos données personnelles, consultez également
              notre{' '}
              <a href="/confidentialite" className="underline hover:text-[#B89547] transition-colors">
                Politique de Confidentialité
              </a>
              {' '}et nos{' '}
              <a href="/mentions-legales" className="underline hover:text-[#B89547] transition-colors">
                Mentions légales
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
