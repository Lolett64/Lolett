import { Mail, Phone, MapPin } from 'lucide-react';

export function ContactInfo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lolett-gray-900 mb-6 text-xl font-semibold">
          Nos coordonnées
        </h2>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-lolett-blue/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
              <Mail className="text-lolett-blue h-5 w-5" />
            </div>
            <div>
              <p className="text-lolett-gray-900 font-medium">Email</p>
              <a
                href="mailto:hello@lolett.com"
                className="text-lolett-gray-600 hover:text-lolett-blue transition-colors"
              >
                hello@lolett.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-lolett-blue/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
              <Phone className="text-lolett-blue h-5 w-5" />
            </div>
            <div>
              <p className="text-lolett-gray-900 font-medium">Téléphone</p>
              <a
                href="tel:+33600000000"
                className="text-lolett-gray-600 hover:text-lolett-blue transition-colors"
              >
                +33 6 00 00 00 00
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-lolett-blue/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
              <MapPin className="text-lolett-blue h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lolett-gray-900 font-medium">Adresse</p>
              <p className="text-lolett-gray-600">
                Quelque part dans le Sud, là où le soleil brille
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-lolett-gray-100 rounded-2xl p-6">
        <h3 className="text-lolett-gray-900 mb-2 font-medium">Délais de réponse</h3>
        <p className="text-lolett-gray-600 text-sm">
          On répond généralement sous 24-48h. Promis, on fait au plus vite.
        </p>
      </div>
    </div>
  );
}
