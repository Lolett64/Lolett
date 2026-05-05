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
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold mb-2">
          Politique de cookies
        </h1>
        <p className="text-sm mb-12 opacity-70">Dernière mise à jour : 6 mai 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-3">1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lorsque vous visitez un site internet.
              Les cookies permettent de mémoriser des informations utiles sur vos préférences, d'assurer le bon fonctionnement du site,
              et de mesurer son audience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Cookies utilisés sur lolettshop.com</h2>

            <h3 className="font-semibold mt-4 mb-2">Cookies techniques (toujours actifs)</h3>
            <p className="mb-3">
              Ces cookies sont strictement nécessaires au fonctionnement du site. Ils ne nécessitent pas votre consentement.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>cookie_consent</strong> — Lolett, 12 mois — mémorise vos préférences de cookies (acceptation ou refus des analytiques).
              </li>
              <li>
                <strong>sb-* (session Supabase)</strong> — Lolett, durée de session (ou 30 jours si « rester connecté ») — gestion de votre compte client et de votre panier.
              </li>
              <li>
                <strong>__stripe_mid, __stripe_sid</strong> — Stripe Inc., durée de session à 1 an — sécurité du paiement et prévention de la fraude lors des transactions.
              </li>
            </ul>

            <h3 className="font-semibold mt-6 mb-2">Cookies analytiques (sur consentement)</h3>
            <p className="mb-3">
              Ces cookies nous aident à comprendre comment vous utilisez le site afin d'en améliorer l'expérience.
              Ils ne sont déposés qu'avec votre consentement explicite via le bandeau de cookies.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>_ga, _ga_*</strong> — Google LLC (Google Analytics 4), 24 mois — mesure d'audience anonyme : pages visitées, durée, parcours.
                Aucune donnée personnelle identifiante n'est collectée.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Comment gérer vos cookies ?</h2>
            <p className="mb-3">
              À votre première visite, un bandeau vous propose d'accepter ou de refuser les cookies analytiques.
              Vous pouvez modifier votre choix à tout moment :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                En supprimant le cookie <code className="bg-white/40 px-1 rounded">cookie_consent</code> dans les paramètres de votre navigateur — le bandeau réapparaîtra à votre prochaine visite.
              </li>
              <li>
                En configurant votre navigateur pour bloquer ou supprimer tous les cookies (consultez l'aide de votre navigateur — Chrome, Safari, Firefox, Edge).
              </li>
            </ul>
            <p className="mt-3">
              Note : refuser tous les cookies peut limiter certaines fonctionnalités du site (par exemple le panier persistant entre sessions).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Contact</h2>
            <p>
              Pour toute question sur cette politique, écrivez-nous à{' '}
              <a href="mailto:bonjour@lolettshop.com" className="underline hover:text-[#B89547] transition-colors">
                bonjour@lolettshop.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
