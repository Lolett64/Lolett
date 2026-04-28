'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { MapPin, Check } from 'lucide-react';
import { useCartStore } from '@/features/cart';
import type { PickupPoint, ShippingCountryCode } from '@/types';

// Mondial Relay diffuse un widget jQuery officiel. On l'instancie côté client
// après chargement de jQuery + plugin. Le widget rend une carte Leaflet et
// notifie via un callback quand l'utilisateur sélectionne un point.
//
// Doc: https://widget.mondialrelay.com/
//
// Brand "BDTEST13" est la valeur de test publique fournie par MR pour les
// environnements de dev. À remplacer par l'Enseigne réelle en prod via
// NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID.

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

const BRAND_ID = process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID || 'BDTEST13';

export function MondialRelayWidget({ postalCode, country }: MondialRelayWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const setPickupPoint = useCartStore((s) => s.setPickupPoint);
  const pickupPoint = useCartStore((s) => s.pickupPoint);

  useEffect(() => {
    // Réinitialise si pays/CP change pour forcer un nouveau choix.
    initializedRef.current = false;
    setPickupPoint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const tryInit = () => {
    if (initializedRef.current) return;
    if (typeof window === 'undefined') return;
    const $ = window.jQuery;
    if (!$ || !$.fn?.MR_ParcelShopPicker || !containerRef.current) return;

    initializedRef.current = true;
    $(`#${containerRef.current.id}`).MR_ParcelShopPicker({
      Target: '#mr-pickup-id',
      TargetDisplay: '#mr-pickup-display',
      TargetDisplayInfoPR: '#mr-pickup-info',
      Brand: BRAND_ID,
      Country: country,
      PostCode: postalCode || '',
      Weight: '1000',
      MaxResults: '7',
      DeliveryMode: '24R',
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
  };

  return (
    <div style={{ marginTop: 16 }}>
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="afterInteractive"
        onLoad={tryInit}
      />
      <Script
        src="https://widget.mondialrelay.com/parcelshop-picker/v4_0/js/jquery.plugin.mondialrelay.parcelshoppicker.min.js"
        strategy="afterInteractive"
        onLoad={tryInit}
      />
      <link
        rel="stylesheet"
        href="https://widget.mondialrelay.com/parcelshop-picker/v4_0/css/parcelshoppicker.min.css"
      />

      <div
        id="mr-widget-container"
        ref={containerRef}
        style={{
          minHeight: 420,
          border: '1px solid #E8E0D6',
          borderRadius: 8,
          padding: 8,
          background: '#FFFBF7',
        }}
      />
      <input id="mr-pickup-id" type="hidden" />
      <div id="mr-pickup-display" style={{ display: 'none' }} />
      <div id="mr-pickup-info" style={{ display: 'none' }} />

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
