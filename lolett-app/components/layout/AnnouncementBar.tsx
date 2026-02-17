import { Truck } from 'lucide-react';
import { SHIPPING } from '@/lib/constants';

export function AnnouncementBar() {
  return (
    <div className="bg-lolett-gray-900 relative z-50 py-2 text-center">
      <p className="flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-white/90 sm:text-sm">
        <Truck className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
        <span>
          Livraison offerte dès {SHIPPING.FREE_THRESHOLD} € d&apos;achat
        </span>
      </p>
    </div>
  );
}
