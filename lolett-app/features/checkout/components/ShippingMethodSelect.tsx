'use client';

import { Truck, MapPin } from 'lucide-react';
import {
  SHIPPING_METHODS,
  SHIPPING_DELAYS,
  computeShippingCost,
  getShippingZone,
} from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/features/cart';
import type { ShippingMethod } from '@/types';

interface ShippingMethodSelectProps {
  subtotal: number;
}

export function ShippingMethodSelect({ subtotal }: ShippingMethodSelectProps) {
  const country = useCartStore((s) => s.shippingCountry);
  const method = useCartStore((s) => s.shippingMethod);
  const setMethod = useCartStore((s) => s.setShippingMethod);
  const zone = getShippingZone(country);
  const delay = zone ? SHIPPING_DELAYS[zone] : '';

  const options: Array<{ id: ShippingMethod; label: string; description: string; icon: React.ReactNode }> = [
    {
      id: 'home',
      label: SHIPPING_METHODS.home.label,
      description: 'À votre adresse, par Colissimo',
      icon: <Truck size={18} />,
    },
    {
      id: 'mondial_relay',
      label: SHIPPING_METHODS.mondial_relay.label,
      description: 'Retrait dans un point relais proche de chez vous',
      icon: <MapPin size={18} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
      {options.map((opt) => {
        const cost = computeShippingCost(subtotal, country, opt.id);
        const isFree = cost === 0 && subtotal > 0;
        const selected = method === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMethod(opt.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 18px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: selected ? '#C4956A' : '#E8E0D6',
              borderLeft: selected ? '3px solid #C4956A' : '1px solid #E8E0D6',
              backgroundColor: selected ? '#FFFBF7' : '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: "'DM Sans', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${selected ? '#C4956A' : '#D4CBC0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C4956A' }} />}
            </div>
            <div style={{ color: '#C4956A', flexShrink: 0 }}>{opt.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{opt.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9B8E82' }}>
                {opt.description}{delay ? ` · ${delay}` : ''}
              </p>
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: isFree ? '#7B9E6B' : '#2C2420', flexShrink: 0 }}>
              {isFree ? 'Offerte' : formatPrice(cost)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
