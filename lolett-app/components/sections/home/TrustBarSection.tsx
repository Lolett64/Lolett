import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const defaultTrustItems = [
  { icon: Truck, key: 'trust_1', label: 'Livraison offerte dès 100€' },
  { icon: RotateCcw, key: 'trust_2', label: 'Retours gratuits 30j' },
  { icon: ShieldCheck, key: 'trust_3', label: 'Paiement 100% sécurisé' },
] as const;

interface TrustBarSectionProps {
  content?: Record<string, string>;
}

export function TrustBarSection({ content }: TrustBarSectionProps) {
  const trustItems = defaultTrustItems.map(item => ({
    ...item,
    label: content?.[item.key] || item.label,
  }));
  return (
    <section style={{ background: '#1a1510' }}>
      <div className="container">
        <div
          className="grid grid-cols-1 sm:grid-cols-3"
          style={{ borderColor: 'rgba(27,11,148,0.15)' }}
        >
          {trustItems.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 py-5 sm:py-7"
              style={{
                borderLeft: i > 0 ? '1px solid rgba(27,11,148,0.15)' : 'none',
              }}
            >
              <item.icon
                className="h-5 w-5 flex-shrink-0"
                strokeWidth={1.5}
                style={{ color: '#1B0B94' }}
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
