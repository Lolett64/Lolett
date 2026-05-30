'use client';

import { useEffect, useState } from 'react';
import { MapPin, Clock, Info, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/features/cart';
import type { ClickCollectPickupPoint } from '@/types';

interface DbPickupPointRow {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  hours: string | null;
  instructions: string | null;
}

type Status = 'loading' | 'ready' | 'empty' | 'error';

export function ClickCollectPicker() {
  const country = useCartStore((s) => s.shippingCountry);
  const pickupPoint = useCartStore((s) => s.pickupPoint);
  const setPickupPoint = useCartStore((s) => s.setPickupPoint);

  const [points, setPoints] = useState<DbPickupPointRow[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  // Reset le point sélectionné si le pays change (C&C est FR-only ; un point
  // sélectionné en FR ne doit pas survivre à une bascule vers un autre pays).
  useEffect(() => {
    setPickupPoint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      // La RLS publique filtre is_active=true : on ne récupère que les points
      // visibles. On filtre aussi country='FR' (C&C est FR-only) pour ne pas
      // exposer un point créé par erreur avec un autre pays. Tri par sort_order
      // croissant (ordre défini par Lola en admin).
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pickup_points')
        .select('id, name, address, postal_code, city, country, hours, instructions')
        .eq('country', 'FR')
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        setStatus('error');
        return;
      }
      const rows = (data ?? []) as DbPickupPointRow[];
      setPoints(rows);
      setStatus(rows.length === 0 ? 'empty' : 'ready');
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (row: DbPickupPointRow) => {
    const point: ClickCollectPickupPoint = {
      provider: 'click_collect',
      id: row.id,
      name: row.name,
      address: row.address,
      postalCode: row.postal_code,
      city: row.city,
      country: row.country,
      hours: row.hours,
      instructions: row.instructions,
    };
    setPickupPoint(point);
  };

  return (
    <div
      aria-live="polite"
      style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {status === 'loading' && (
        <p style={{ fontSize: 13, color: '#9B8E82', fontFamily: "'DM Sans', sans-serif" }}>
          Chargement des points de retrait…
        </p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#B85555', fontFamily: "'DM Sans', sans-serif" }}>
          Impossible de charger les points de retrait. Merci de réessayer ou de choisir une autre méthode.
        </p>
      )}
      {status === 'empty' && (
        <p style={{ fontSize: 13, color: '#9B8E82', fontFamily: "'DM Sans', sans-serif" }}>
          Aucun point de retrait disponible pour le moment.
        </p>
      )}
      {status === 'ready' &&
        points.map((row) => {
          const selected = pickupPoint?.provider === 'click_collect' && pickupPoint.id === row.id;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => handleSelect(row)}
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
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  marginTop: 2,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: `2px solid ${selected ? '#C4956A' : '#D4CBC0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {selected && <Check size={12} style={{ color: '#C4956A' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#2C2420' }}>{row.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7A6E62', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={12} />
                  {row.address}, {row.postal_code} {row.city}
                </p>
                {row.hours && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9B8E82', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {row.hours}
                  </p>
                )}
                {row.instructions && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9B8E82', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Info size={12} />
                    {row.instructions}
                  </p>
                )}
              </div>
            </button>
          );
        })}
    </div>
  );
}
