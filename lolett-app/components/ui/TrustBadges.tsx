import { Lock, Truck, RotateCcw } from 'lucide-react';

interface TrustBadgesProps {
  className?: string;
  variant?: 'default' | 'compact';
}

const badges = [
  { icon: Lock, label: 'Paiement sécurisé', sublabel: 'SSL 256-bit' },
  { icon: Truck, label: 'Livraison 24-48h', sublabel: 'Offerte dès 100€' },
  { icon: RotateCcw, label: 'Retours 30j', sublabel: 'Gratuits & simples' },
];

export function TrustBadges({ className = '', variant = 'default' }: TrustBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-6 ${className}`}>
        {badges.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-xs text-[#8a7d6b]">
            <b.icon className="h-3.5 w-3.5 text-[#c4a44e]" />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex flex-col items-center gap-2 rounded-xl border border-[#c4b49c]/15 bg-white p-4 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c4a44e]/10">
            <b.icon className="h-5 w-5 text-[#c4a44e]" />
          </div>
          <span className="text-sm font-medium text-[#1a1510]">{b.label}</span>
          <span className="text-xs text-[#8a7d6b]">{b.sublabel}</span>
        </div>
      ))}
    </div>
  );
}
