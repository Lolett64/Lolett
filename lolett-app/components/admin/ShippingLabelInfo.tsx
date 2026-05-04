'use client';

import { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import type { PickupPoint } from '@/types';

interface OrderItem {
  product_name: string;
  size: string;
  color: string | null;
  quantity: number;
}

interface ShippingLabelInfoProps {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  pickupPoint: PickupPoint | null;
  shippingMethod: 'home' | 'mondial_relay' | null;
  weightEstimateGrams: number;
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard non supporté ou refusé — silently fail */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label || 'Copier'}
      className="ml-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-[#1a1510]/50 hover:bg-[#FDF5E6] hover:text-[#1B0B94] transition-colors print:hidden"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? 'Copié' : 'Copier'}
    </button>
  );
}

export function ShippingLabelInfo({
  orderNumber,
  customer,
  items,
  pickupPoint,
  shippingMethod,
  weightEstimateGrams,
}: ShippingLabelInfoProps) {
  const isMR = shippingMethod === 'mondial_relay';
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  // Format "tout copier" : un bloc texte plat utilisable au copier-coller
  const allInOneText = [
    `=== Expédition ${orderNumber} ===`,
    '',
    'DESTINATAIRE',
    `${customer.firstName} ${customer.lastName}`,
    customer.email,
    customer.phone || '(pas de téléphone)',
    '',
    isMR && pickupPoint
      ? [
          'POINT RELAIS',
          `ID: ${pickupPoint.id}`,
          pickupPoint.name || '',
          pickupPoint.address || '',
          `${pickupPoint.postalCode || ''} ${pickupPoint.city || ''}`,
        ].join('\n')
      : [
          'LIVRAISON DOMICILE',
          customer.address,
          `${customer.postalCode} ${customer.city}`,
          customer.country || 'France',
        ].join('\n'),
    '',
    'COLIS',
    `Référence: ${orderNumber}`,
    `${totalQty} article${totalQty > 1 ? 's' : ''}`,
    `Poids estimé: ${weightEstimateGrams}g (à confirmer)`,
    'Contenu: Vêtements',
  ].join('\n');

  return (
    <div className="font-[family-name:var(--font-montserrat)] text-[#1a1510]">
      {/* Toolbar — non imprimée */}
      <div className="flex flex-wrap items-center gap-2 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white hover:bg-[#130970] transition-colors"
        >
          <Printer className="size-4" />
          Imprimer
        </button>
        <CopyAllButton value={allInOneText} />
      </div>

      {/* Carte principale — imprimable */}
      <div className="rounded-xl border border-gray-200/70 bg-white p-6 sm:p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="mb-6 border-b border-gray-200/70 pb-4 print:mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89547]">Fiche d&rsquo;expédition</p>
          <h2 className="font-[family-name:var(--font-newsreader)] text-2xl font-light tracking-tight text-[#1a1510] mt-1">
            {orderNumber}
          </h2>
          <p className="text-xs text-[#1a1510]/60 mt-1">
            {isMR ? 'Mondial Relay — Point relais' : 'Livraison à domicile'}
          </p>
        </div>

        {/* DESTINATAIRE */}
        <Section title="Destinataire">
          <Row label="Prénom + Nom" value={`${customer.firstName} ${customer.lastName}`} />
          <Row label="Email" value={customer.email} />
          <Row
            label="Téléphone"
            value={customer.phone || '—'}
            warning={!customer.phone ? 'Manquant — requis pour Mondial Relay HOM' : undefined}
          />
        </Section>

        {/* Avertissement si Mondial Relay mais pas de point relais en DB */}
        {isMR && !pickupPoint && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 print:border-red-400">
            <p className="text-sm font-medium text-red-700">⚠ Point relais manquant</p>
            <p className="text-xs text-red-600/80 mt-0.5">
              Cette commande est en Mondial Relay mais aucun point relais n&rsquo;est enregistré.
              Vérifie en base avant d&rsquo;expédier.
            </p>
          </div>
        )}

        {/* DESTINATION */}
        {isMR && pickupPoint ? (
          <Section title="Point relais destinataire">
            <Row label="ID Point Relais" value={pickupPoint.id || '—'} highlight />
            <Row label="Nom" value={pickupPoint.name || '—'} />
            <Row label="Adresse" value={pickupPoint.address || '—'} />
            <Row
              label="CP / Ville"
              value={`${pickupPoint.postalCode || ''} ${pickupPoint.city || ''}`.trim() || '—'}
            />
          </Section>
        ) : (
          <Section title="Adresse de livraison">
            <Row label="Adresse" value={customer.address} />
            <Row label="CP / Ville" value={`${customer.postalCode} ${customer.city}`} />
            <Row label="Pays" value={customer.country || 'France'} />
          </Section>
        )}

        {/* COLIS */}
        <Section title="Colis">
          <Row label="Référence" value={orderNumber} highlight />
          <div className="py-1.5">
            <p className="text-[11px] uppercase tracking-wide text-[#1a1510]/40 mb-1">
              Articles ({totalQty})
            </p>
            <ul className="ml-4 list-disc text-sm text-[#1a1510]/80 space-y-0.5">
              {items.map((item, idx) => (
                <li key={idx}>
                  {item.product_name} ({item.size}
                  {item.color ? ` · ${item.color}` : ''}) × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
          <Row
            label="Poids estimé"
            value={`${weightEstimateGrams} g`}
            warning="À confirmer avant de générer l&rsquo;étiquette"
          />
          <Row label="Contenu" value="Vêtements" />
        </Section>

        {/* PROCHAINES ÉTAPES — non imprimé pour économiser de l'encre */}
        <div className="mt-6 rounded-lg bg-[#FDF5E6] p-4 print:hidden">
          <p className="text-[11px] uppercase tracking-wide text-[#B89547] font-semibold mb-2">
            Prochaines étapes
          </p>
          <ol className="list-decimal ml-5 text-sm text-[#1a1510]/80 space-y-1">
            <li>
              Va sur{' '}
              <a
                href="https://connect.mondialrelay.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#1B0B94] hover:text-[#130970]"
              >
                connect.mondialrelay.com
              </a>{' '}
              et crée une nouvelle expédition.
            </li>
            <li>Recopie les informations ci-dessus dans le formulaire Mondial Relay.</li>
            <li>Télécharge l&rsquo;étiquette PDF et imprime-la.</li>
            <li>
              Reviens sur la fiche commande, mets le statut à <strong>&laquo; Expédié &raquo;</strong> et
              colle le numéro de suivi Mondial Relay.
            </li>
            <li>Colle l&rsquo;étiquette sur le colis et dépose-le.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 last:mb-0 print:mb-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89547] font-semibold mb-2">
        {title}
      </p>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  warning,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  warning?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0 print:border-gray-300">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-[#1a1510]/40">{label}</p>
        <p
          className={
            highlight
              ? 'text-base font-mono font-semibold text-[#1B0B94] break-all'
              : 'text-sm text-[#1a1510] break-words'
          }
        >
          {value}
        </p>
        {warning && (
          <p className="text-[11px] text-[#B89547] mt-0.5 print:hidden">⚠ {warning}</p>
        )}
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function CopyAllButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* silently fail */
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-[#1B0B94] bg-white px-4 py-2 text-sm font-medium text-[#1B0B94] hover:bg-[#FDF5E6] transition-colors"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? 'Copié dans le presse-papier' : 'Tout copier'}
    </button>
  );
}
