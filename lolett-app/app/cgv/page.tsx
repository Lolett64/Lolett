import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — LOLETT',
  description: 'Conditions générales de vente du site LOLETT.',
  alternates: { canonical: `${BASE_URL}/cgv` },
};

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-[#1B0B94]">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold mb-12">
          Conditions Générales de Vente
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des ventes réalisées sur le site
              <strong> lolett.fr</strong>, édité par <strong>[À COMPLÉTER — Raison sociale]</strong>.
              Toute commande implique l'acceptation sans réserve des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Produits</h2>
            <p>
              Les produits proposés à la vente sont ceux figurant sur le site au moment de la consultation.
              Les photographies sont les plus fidèles possibles mais ne constituent pas un engagement contractuel.
              LOLETT se réserve le droit de modifier son offre à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Prix</h2>
            <p>
              Les prix sont indiqués en euros toutes taxes comprises (TTC). Ils ne comprennent pas les frais de
              livraison, qui sont précisés lors de la validation de la commande. LOLETT se réserve le droit de modifier
              ses prix à tout moment, les produits étant facturés au prix en vigueur au moment de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Commande</h2>
            <p>
              La commande est validée après confirmation du paiement. Un email de confirmation est envoyé à l'adresse
              renseignée. LOLETT se réserve le droit d'annuler toute commande en cas de problème de paiement, d'adresse
              erronée ou de suspicion de fraude.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Paiement</h2>
            <p>
              Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard) via la plateforme sécurisée Stripe.
              Le paiement est débité au moment de la confirmation de commande. Les données bancaires ne sont jamais
              stockées sur nos serveurs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Livraison</h2>
            <p>
              Les commandes sont livrées en France métropolitaine uniquement.<br />
              Délai de livraison : <strong>24 à 48 heures ouvrées</strong> après expédition.<br />
              Frais de livraison : <strong>5,90 €</strong>.<br />
              <strong>Livraison offerte</strong> à partir de <strong>100 €</strong> d'achat.<br />
              En cas de retard significatif, le client sera informé par email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Droit de rétractation</h2>
            <p>
              Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai de
              <strong> 14 jours</strong> à compter de la réception de votre commande pour exercer votre droit de
              rétractation, sans avoir à justifier de motif. Pour ce faire, contactez-nous via notre{' '}
              <a href="/contact" className="underline hover:text-[#B89547] transition-colors">page de contact</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Retours et remboursements</h2>
            <p>
              Les articles doivent être retournés dans leur état d'origine, non portés, non lavés, avec leurs étiquettes.
              Les frais de retour sont à la charge du client. Le remboursement est effectué dans un délai de
              <strong> 14 jours</strong> suivant la réception du retour, par le même moyen de paiement que celui utilisé
              lors de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Garanties légales</h2>
            <p>
              Tous les produits bénéficient de la garantie légale de conformité (articles L217-4 et suivants du Code de
              la consommation) et de la garantie des vices cachés (articles 1641 et suivants du Code civil).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Responsabilité</h2>
            <p>
              LOLETT ne saurait être tenue responsable des dommages résultant d'une mauvaise utilisation des produits
              achetés. La responsabilité de LOLETT est limitée au montant de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Données personnelles</h2>
            <p>
              Les informations collectées lors de la commande sont nécessaires au traitement de celle-ci.
              Elles sont traitées conformément au RGPD. Pour plus de détails, consultez nos{' '}
              <a href="/mentions-legales" className="underline hover:text-[#B89547] transition-colors">Mentions Légales</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. Litiges et médiation</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée
              avant toute action judiciaire. À défaut, les tribunaux compétents seront ceux de [À COMPLÉTER — Ville].
            </p>
            <p className="mt-2">
              Médiateur de la consommation : [À COMPLÉTER — Nom et site web du médiateur]
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

          <section>
            <h2 className="text-lg font-bold mb-3">13. Mise à jour</h2>
            <p>
              Les présentes CGV peuvent être modifiées à tout moment. La version applicable est celle en vigueur au
              moment de la commande.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
