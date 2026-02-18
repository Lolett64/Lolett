import { Truck } from 'lucide-react';
import { SHIPPING } from '@/lib/constants';

export function AnnouncementBar() {
  return (
    <div className="bg-lolett-gold relative z-50 py-2.5 text-center text-white">
      <div className="container flex items-center justify-center gap-4 text-xs font-medium tracking-wide sm:gap-8 sm:text-sm">
        <p className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
          <span>Livraison offerte dès {SHIPPING.FREE_THRESHOLD}€</span>
        </p>
        <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
        <p className="hidden sm:block">Expédition 24/48h</p>
        <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
        <p className="hidden sm:block">Retours gratuits 30j</p>
      </div>
    </div>
  );
}
