import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const trustItems = [
  {
    icon: Truck,
    label: 'Livraison offerte dès 100€',
  },
  {
    icon: RotateCcw,
    label: 'Retours gratuits 30j',
  },
  {
    icon: ShieldCheck,
    label: 'Paiement 100% sécurisé',
  },
] as const;

export function TrustBarSection() {
  return (
    <section className="border-lolett-gray-200 bg-white border-y">
      <div className="container">
        <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 py-5 sm:py-6"
            >
              <item.icon className="text-lolett-blue h-5 w-5 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-lolett-gray-700 text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
