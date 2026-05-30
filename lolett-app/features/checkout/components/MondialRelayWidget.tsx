'use client';

import { useEffect, useId, useRef, useState } from 'react';
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
    // Méthodes jQuery utilisées au cleanup (chaînables).
    empty: () => JQueryWidget;
    removeData: () => JQueryWidget;
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
//
// TOCTOU : un script en cache navigateur peut firer son onload avant que
// le listener soit attaché. data-loaded est posé dans le onload natif, mais
// pour un script déjà ajouté on combine data-loaded + listener pour ne
// jamais rater le cas "déjà résolu entre querySelector et addEventListener".
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }
      // Listener + re-check : si data-loaded est posé entre les 2 lignes, on
      // résout quand même. addEventListener('load') ne fire pas pour un load
      // passé, d'où la double protection.
      const onLoad = () => resolve();
      const onError = () => reject(new Error(`Failed to load ${src}`));
      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', onError);
      if (existing.getAttribute('data-loaded') === 'true') {
        existing.removeEventListener('load', onLoad);
        existing.removeEventListener('error', onError);
        resolve();
      }
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

// Le plugin MR met quelques ms après son onload pour attacher
// MR_ParcelShopPicker à $.fn. On poll jusqu'à ce qu'il soit dispo, sinon
// l'instanciation marche en apparence (champs rendus) mais les recherches
// retournent 0 résultat — symptôme classique nécessitant un hard refresh.
// Timeout 8s pour couvrir les connexions lentes (3G, mobile bas débit).
// Le signal de cancellation arrête le polling immédiatement si le composant
// est démonté pendant l'attente — sinon le setTimeout continuerait pendant 8s.
function waitForPluginReady(
  signal: { cancelled: boolean },
  timeoutMs = 8000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (signal.cancelled) {
        reject(new Error('cancelled'));
        return;
      }
      const $ = window.jQuery;
      if ($ && $.fn?.MR_ParcelShopPicker) {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Plugin MR_ParcelShopPicker non disponible après timeout'));
        return;
      }
      setTimeout(check, 50);
    };
    check();
  });
}

export function MondialRelayWidget({ postalCode, country }: MondialRelayWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const setPickupPoint = useCartStore((s) => s.setPickupPoint);
  const pickupPoint = useCartStore((s) => s.pickupPoint);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // IDs uniques par instance : évite collision si 2 widgets coexistent
  // (Strict Mode double-mount, re-render rapide pendant changement de pays).
  // useId() est SSR-safe et stable entre rerenders.
  const reactId = useId().replace(/:/g, '');
  const containerId = `mr-widget-container-${reactId}`;
  const targetId = `mr-pickup-id-${reactId}`;

  // Réinitialise le point relais sélectionné si pays/CP change.
  useEffect(() => {
    setPickupPoint(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    isMountedRef.current = true;
    const cancelSignal = { cancelled: false };
    const containerNode = containerRef.current;

    async function init() {
      try {
        loadStylesheet(LEAFLET_CSS);
        await loadScript(JQUERY_SRC);
        await loadScript(LEAFLET_JS);
        await loadScript(PLUGIN_SRC);
        await waitForPluginReady(cancelSignal);

        if (cancelSignal.cancelled) return;
        const $ = window.jQuery;
        if (!$ || !$.fn?.MR_ParcelShopPicker || !containerRef.current) {
          throw new Error('jQuery ou plugin MR introuvable après chargement');
        }

        $(`#${containerRef.current.id}`).MR_ParcelShopPicker({
          Target: `#${targetId}`,
          Brand: BRAND_ID,
          Country: country,
          PostCode: postalCode || '',
          Weight: '1000',
          NbResults: '7',
          ColLivMod: '24R',
          Responsive: true,
          ShowResultsOnMap: true,
          OnParcelShopSelected: (data: MondialRelayPoint) => {
            // Garde-fou : si le widget a été démonté (bascule vers C&C / home)
            // entre le rendu de la liste MR et le clic utilisateur, on ignore
            // l'événement pour ne pas écraser un point C&C déjà sélectionné.
            if (!isMountedRef.current) return;
            const point: PickupPoint = {
              provider: 'mondial_relay',
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
        if (err instanceof Error && err.message === 'cancelled') return;
        console.error('[MondialRelayWidget] init failed:', err);
        if (!cancelSignal.cancelled) setStatus('error');
      }
    }

    init();
    return () => {
      isMountedRef.current = false;
      cancelSignal.cancelled = true;
      // Détruit proprement le widget jQuery + la carte Leaflet pour éviter
      // les fuites (carte fantôme, handlers orphelins) et les collisions d'ID
      // au re-mount. empty().removeData() retire le markup et les data jQuery
      // attachées au conteneur (le plugin MR injecte la carte dans ce nœud).
      const $ = window.jQuery;
      if ($ && containerNode) {
        try {
          $(`#${containerNode.id}`).empty().removeData();
        } catch {
          // jQuery indisponible / déjà nettoyé — no-op.
        }
      }
    };
    // Re-init si pays change pour rebrancher le widget sur le bon pays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  return (
    <div style={{ marginTop: 16 }}>
      <div
        id={containerId}
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
      <input id={targetId} type="hidden" />

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
