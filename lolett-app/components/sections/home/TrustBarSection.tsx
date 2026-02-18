import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const trustItems = [
  { icon: Truck, label: 'Livraison offerte dès 100€' },
  { icon: RotateCcw, label: 'Retours gratuits 30j' },
  { icon: ShieldCheck, label: 'Paiement 100% sécurisé' },
] as const;

export function TrustBarSection() {
  return (
    <section style={{ background: '#1a1510' }}>
      <div className="container">
        <div
          className="grid grid-cols-1 sm:grid-cols-3"
          style={{ borderColor: 'rgba(196,180,156,0.15)' }}
        >
          {trustItems.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 py-5 sm:py-7"
              style={{
                borderLeft: i > 0 ? '1px solid rgba(196,180,156,0.15)' : 'none',
              }}
            >
              <item.icon
                className="h-5 w-5 flex-shrink-0"
                strokeWidth={1.5}
                style={{ color: '#c4a44e' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'rgba(254,252,248,0.8)' }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
