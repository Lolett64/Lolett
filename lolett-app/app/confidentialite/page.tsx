import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lolett.fr';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — LOLETT',
  description: 'Politique de confidentialité et protection des données personnelles du site LOLETT.',
  alternates: { canonical: `${BASE_URL}/confidentialite` },
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-[#FDF5E6] py-16 px-6 md:px-8">
      <div className="max-w-[800px] mx-auto text-[#1B0B94]">
        <h1 className="font-[family-name:var(--font-newsreader)] text-3xl md:text-4xl font-bold mb-12">
          Politique de Confidentialité
        </h1>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles est <strong>LOLETT</strong>,
              dont le siège social est situé au 30 avenue Honoré Baradat, 64000 Pau, France.
              Contact : <a href="mailto:contact.lolett@gmail.com" className="underline hover:text-[#B89547] transition-colors">contact.lolett@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Compte client</strong> : nom, prénom, email, mot de passe (chiffré)</li>
              <li><strong>Commande</strong> : adresse de livraison, adresse de facturation, téléphone</li>
              <li><strong>Paiement</strong> : les données bancaires sont traitées par Stripe et ne sont jamais stockées sur nos serveurs</li>
              <li><strong>Navigation</strong> : cookies techniques (session, panier), cookies analytiques (avec consentement)</li>
              <li><strong>Contact</strong> : nom, email, message via le formulaire de contact</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. Finalités du traitement</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Traitement et suivi des commandes</li>
              <li>Gestion du compte client et du programme de fidélité</li>
              <li>Envoi d'emails transactionnels (confirmation de commande, expédition)</li>
              <li>Envoi de newsletters et offres commerciales (avec consentement)</li>
              <li>Amélioration du site et de l'expérience utilisateur</li>
              <li>Réponse aux demandes de contact</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Base légale</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Exécution du contrat</strong> : traitement des commandes, livraison</li>
              <li><strong>Consentement</strong> : newsletters, cookies analytiques</li>
              <li><strong>Intérêt légitime</strong> : amélioration du service, prévention de la fraude</li>
              <li><strong>Obligation légale</strong> : conservation des factures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Compte client</strong> : pendant la durée de la relation commerciale, puis 3 ans après le dernier achat</li>
              <li><strong>Données de commande</strong> : 5 ans (obligation comptable)</li>
              <li><strong>Cookies</strong> : 13 mois maximum</li>
              <li><strong>Demandes de contact</strong> : 3 ans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Partage des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Stripe</strong> — traitement des paiements</li>
              <li><strong>Vercel</strong> — hébergement du site</li>
              <li><strong>Supabase</strong> — base de données et authentification</li>
              <li><strong>Brevo</strong> — envoi d'emails transactionnels et marketing</li>
              <li><strong>Transporteurs</strong> — livraison des commandes</li>
            </ul>
            <p className="mt-2">
              Aucune donnée n'est vendue à des tiers. Les sous-traitants sont soumis à des obligations de confidentialité conformes au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Cookies</h2>
            <p><strong>Cookies essentiels</strong> (toujours actifs) :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Session utilisateur et authentification</li>
              <li>Panier d'achat</li>
              <li>Préférences de cookies</li>
            </ul>
            <p className="mt-3"><strong>Cookies analytiques</strong> (avec consentement) :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Statistiques de fréquentation et comportement de navigation</li>
            </ul>
            <p className="mt-3">
              Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Accès</strong> — obtenir une copie de vos données</li>
              <li><strong>Rectification</strong> — corriger des données inexactes</li>
              <li><strong>Suppression</strong> — demander l'effacement de vos données</li>
              <li><strong>Portabilité</strong> — recevoir vos données dans un format structuré</li>
              <li><strong>Opposition</strong> — vous opposer au traitement de vos données</li>
              <li><strong>Limitation</strong> — restreindre le traitement</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, rendez-vous sur notre{' '}
              <a href="/contact" className="underline hover:text-[#B89547] transition-colors">page de contact</a>.
              Nous répondons dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
              chiffrement SSL, authentification sécurisée, accès restreint aux données, hébergement conforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Réclamation</h2>
            <p>
              Si vous estimez que le traitement de vos données n'est pas conforme, vous pouvez adresser une réclamation
              à la CNIL :{' '}
              <a
                href="https://www.cnil.fr"
                className="underline hover:text-[#B89547] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.cnil.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Mise à jour</h2>
            <p>
              Cette politique peut être modifiée à tout moment. La version en vigueur est celle publiée sur cette page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
