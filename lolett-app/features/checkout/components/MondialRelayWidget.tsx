'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { useCartStore } from '@/features/cart';
import type { PickupPoint, ShippingCountryCode } from '@/types';

// Mondial Relay diffuse un widget jQuery officiel. On charge jQuery puis
// le plugin séquentiellement (sinon le plugin tente de s'initialiser avant
// que jQuery ne soit prêt et ne fait rien). Une fois prêt, on l'instancie
// sur notre conteneur, et il rend une carte Leaflet + liste de points.
//
// Doc: https://widget.mondialrelay.com/

declare global {
  interface JQueryWidget {
    MR_ParcelShopPicker: (config: Record<string, unknown>) => void;
  }
  interface Window {
    jQuery?: ((selector: string | HTMLElement) => JQueryWidget) & {
      fn?: { MR_ParcelShopPicker?: unknown };
    };
    $?: Window['jQuery'];
  }
}

interface MondialRelayPoint {
  ID: string;
  Nom: string;
  Adresse1: string;
  Adresse2?: string;
  CP: string;
  Ville: string;
  Pays: string;
  Latitude: string;
  Longitude: string;
}

interface MondialRelayWidgetProps {
  postalCode: string;
  country: ShippingCountryCode;
}

// Mondial Relay impose strictement 8 caractères, padding espaces à droite.
// On padEnd pour résister aux trim accidentels de l'env var (Vercel/Next).
const BRAND_ID = (process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID || 'BDTEST').padEnd(8, ' ');
const JQUERY_SRC = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js';
const LEAFLET_JS = 'https://unpkg.com/leaflet/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet/dist/leaflet.css';
const PLUGIN_SRC = 'https://widget.mondialrelay.com/parcelshop-picker/jquery.plugin.mondialrelay.parcelshoppicker.min.js';

// Charge un script <script> séquentiellement et résout quand l'événement
// onload est tiré. Idempotent : si un script avec la même src existe déjà,
// on attend juste qu'il soit prêt (pas de double chargement).
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = () => {
      s.setAttribute('data-loaded', 'true');
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function loadStylesheet(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function MondialRelayWidget({ postalCode, country }: MondialRelayWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setPickupPoint = useCartStore((s) => s.setPickupPoint);
  const pickupPoint = useCartStore((s) => s.pickupPoint);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Réinitialise le point relais sélectionné si pays/CP change.
  useEffect(() => {
    setPickupPoint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        loadStylesheet(LEAFLET_CSS);
        await loadScript(JQUERY_SRC);
        await loadScript(LEAFLET_JS);
        await loadScript(PLUGIN_SRC);

        if (cancelled) return;
        const $ = window.jQuery;
        if (!$ || !$.fn?.MR_ParcelShopPicker || !containerRef.current) {
          throw new Error('jQuery ou plugin MR introuvable après chargement');
        }

        $(`#${containerRef.current.id}`).MR_ParcelShopPicker({
          Target: '#mr-pickup-id',
          Brand: BRAND_ID,
          Country: country,
          PostCode: postalCode || '',
          Weight: '1000',
          NbResults: '7',
          ColLivMod: '24R',
          Responsive: true,
          ShowResultsOnMap: true,
          OnParcelShopSelected: (data: MondialRelayPoint) => {
            const point: PickupPoint = {
              id: data.ID,
              name: data.Nom,
              address: [data.Adresse1, data.Adresse2].filter(Boolean).join(' '),
              postalCode: data.CP,
              city: data.Ville,
              country: data.Pays,
              lat: parseFloat(data.Latitude),
              lng: parseFloat(data.Longitude),
            };
            setPickupPoint(point);
          },
        });

        setStatus('ready');
      } catch (err) {
        console.error('[MondialRelayWidget] init failed:', err);
        if (!cancelled) setStatus('error');
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // Re-init si pays change pour rebrancher le widget sur le bon pays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  return (
    <div style={{ marginTop: 16 }}>
      <div
        id="mr-widget-container"
        ref={containerRef}
        style={{
          minHeight: 420,
          border: '1px solid #E8E0D6',
          borderRadius: 8,
          padding: 8,
          background: '#FFFBF7',
          display: 'flex',
          alignItems: status === 'ready' ? 'stretch' : 'center',
          justifyContent: status === 'ready' ? 'stretch' : 'center',
        }}
      >
        {status === 'loading' && (
          <p style={{ fontSize: 13, color: '#9B8E82', fontFamily: "'DM Sans', sans-serif" }}>
            Chargement de la carte des points relais…
          </p>
        )}
        {status === 'error' && (
          <p style={{ fontSize: 13, color: '#B85555', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 16 }}>
            Impossible de charger le widget Mondial Relay. Merci de réessayer ou de choisir la livraison à domicile.
          </p>
        )}
      </div>
      <input id="mr-pickup-id" type="hidden" />

      {pickupPoint && (
        <div
          style={{
            marginTop: 12,
            padding: '12px 16px',
            borderRadius: 8,
            background: '#F5F8F2',
            border: '1px solid #C8DCB5',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <Check size={18} style={{ color: '#7B9E6B', marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#2C2420' }}>
              Point Relais sélectionné
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#2C2420' }}>
              <strong>{pickupPoint.name}</strong>
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#7A6E62', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} />
              {pickupPoint.address}, {pickupPoint.postalCode} {pickupPoint.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
