/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import {
  SHIPPING_COUNTRIES,
  SHIPPING_RATES,
  SHIPPING_FREE_THRESHOLD,
  SHIPPING_DELAYS,
  SHIPPING_METHODS,
} from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolettshop.com';

export const metadata: Metadata = {
  title: 'Livraison & Retours — LOLETT',
  description: 'Modes de livraison, tarifs, délais et politique de retours pour LOLETT.',
  alternates: { canonical: `${BASE_URL}/livraison` },
};

function formatThreshold(value: number | null): string {
  return value === null ? '—' : `${value} €`;
}

export default function LivraisonPage() {
  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-[#1B0B94]">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold mb-4">
          Livraison &amp; Retours
        </h1>
        <p className="text-sm text-[#1B0B94]/70 mb-12 leading-relaxed">
          Nous expédions vos commandes dans toute l'Europe occidentale (France, Belgique, Luxembourg, Pays-Bas,
          Espagne et Portugal) avec deux modes au choix : livraison à domicile ou retrait en Point Relais
          Mondial Relay.
        </p>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Tarifs &amp; délais</h2>
          <div className="overflow-x-auto rounded-lg border border-[#1B0B94]/10 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#FBEED1]/50 text-[#1B0B94]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Pays</th>
                  <th className="text-right px-4 py-3 font-semibold">{SHIPPING_METHODS.home.label}</th>
                  <th className="text-right px-4 py-3 font-semibold">{SHIPPING_METHODS.mondial_relay.label}</th>
                  <th className="text-right px-4 py-3 font-semibold">Livraison offerte dès</th>
                  <th className="text-right px-4 py-3 font-semibold">Délai</th>
                </tr>
              </thead>
              <tbody>
                {SHIPPING_COUNTRIES.map((c) => (
                  <tr key={c.code} className="border-t border-[#1B0B94]/10">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-right">{SHIPPING_RATES[c.zone].home != null ? `${SHIPPING_RATES[c.zone].home!.toFixed(2)} €` : '—'}</td>
                    <td className="px-4 py-3 text-right">{SHIPPING_RATES[c.zone].mondial_relay != null ? `${SHIPPING_RATES[c.zone].mondial_relay!.toFixed(2)} €` : '—'}</td>
                    <td className="px-4 py-3 text-right">{formatThreshold(SHIPPING_FREE_THRESHOLD[c.zone])}</td>
                    <td className="px-4 py-3 text-right text-[#1B0B94]/70">{SHIPPING_DELAYS[c.zone]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#1B0B94]/60 mt-3">
            Délais indicatifs après expédition, hors week-ends et jours fériés.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Comment fonctionne un Point Relais ?</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
            <li>
              Au moment du paiement, sélectionnez "Point Relais Mondial Relay" puis choisissez le commerçant qui
              vous arrange (proche du domicile, du bureau, des horaires larges).
            </li>
            <li>
              Dès que votre colis est disponible, vous recevez un <strong>SMS</strong> et un email avec un code de
              retrait.
            </li>
            <li>
              Vous avez <strong>14 jours</strong> pour récupérer votre colis dans le Point Relais sur
              présentation d'une pièce d'identité.
            </li>
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Suivi de commande</h2>
          <p className="text-sm leading-relaxed">
            Une fois votre colis expédié, vous recevez un email contenant votre numéro de suivi et un lien direct
            vers la page du transporteur (Mondial Relay ou La Poste / Colissimo). Vous pouvez suivre l'acheminement
            en temps réel.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Retours &amp; remboursements</h2>
          <p className="text-sm leading-relaxed mb-3">
            Conformément à la directive européenne 2011/83/UE et à l'article L221-18 du Code de la consommation,
            vous disposez d'un délai de <strong>14 jours</strong> à compter de la réception de votre commande
            pour exercer votre droit de rétractation, sans avoir à justifier de motif.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
            <li>Les articles doivent être retournés <strong>non portés</strong>, <strong>non lavés</strong>, dans leur état d'origine avec leurs étiquettes.</li>
            <li>Les <strong>frais de retour</strong> sont à la charge du client (sauf en cas de défaut produit avéré).</li>
            <li>Le remboursement est effectué dans un délai maximum de 14 jours suivant la réception du retour, par le même moyen de paiement que celui utilisé lors de la commande.</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            Pour initier un retour, contactez-nous via notre{' '}
            <a href="/contact" className="underline hover:text-[#B89547] transition-colors">page de contact</a>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4">Que se passe-t-il si je rate la livraison ?</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
            <li>
              <strong>Livraison à domicile</strong> : si vous êtes absent, le facteur dépose un avis de passage et
              le colis est mis à disposition au bureau de poste pendant 15 jours.
            </li>
            <li>
              <strong>Point Relais</strong> : votre colis reste disponible 14 jours dans le commerce sélectionné.
              Au-delà, il est retourné à l'expéditeur.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Une question ?</h2>
          <p className="text-sm leading-relaxed">
            N'hésitez pas à nous contacter via notre{' '}
            <a href="/contact" className="underline hover:text-[#B89547] transition-colors">page de contact</a>{' '}
            — nous répondons sous 24 à 48 heures ouvrées.
          </p>
        </section>
      </div>
    </main>
  );
}
