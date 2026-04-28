'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import type { useCheckout } from '../hooks/useCheckout';
import type { UserAddress } from '@/types';
import { SHIPPING_COUNTRIES, getShippingCountry } from '@/lib/constants';
import { ShippingMethodSelect } from './ShippingMethodSelect';
import { useCartStore } from '@/features/cart';

const MondialRelayWidget = dynamic(
  () => import('./MondialRelayWidget').then((m) => ({ default: m.MondialRelayWidget })),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-stone-500">Chargement du sélecteur de point relais…</p>
    ),
  },
);

type CheckoutHook = ReturnType<typeof useCheckout>;

interface CheckoutFormProps {
  formData: CheckoutHook['formData'];
  isFormValid: CheckoutHook['isFormValid'];
  formErrors: CheckoutHook['formErrors'];
  savedAddresses: CheckoutHook['savedAddresses'];
  selectedAddressId: CheckoutHook['selectedAddressId'];
  loadingAddresses: CheckoutHook['loadingAddresses'];
  handleChange: CheckoutHook['handleChange'];
  setAddressFields: CheckoutHook['setAddressFields'];
  goToPayment: CheckoutHook['goToPayment'];
  selectAddress: CheckoutHook['selectAddress'];
  subtotal: number;
}

/* ─── FloatingInput ─────────────────────────────────────────────────── */

function FloatingInput({
  id, name, label, value, onChange, type = 'text', required = false, disabled = false,
  error,
}: {
  id: string; name: string; label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; disabled?: boolean;
  error?: string;
}) {
  const filled = value && value.length > 0;
  return (
    <div className="ckv-float-group">
      <input
        id={id} name={name} type={type} value={value} onChange={onChange}
        required={required} disabled={disabled}
        className="ckv-float-input" placeholder=" "
        aria-invalid={!!error}
      />
      <label htmlFor={id} className={`ckv-float-label ${filled ? 'ckv-float-label--filled' : ''}`}>
        {label}
      </label>
      {error && filled && (
        <p style={{ fontSize: 11, color: '#B85555', margin: '4px 0 0', fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function CountrySelect({
  value, onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="ckv-float-group">
      <select
        id="country"
        name="country"
        value={value}
        onChange={onChange}
        className="ckv-float-input"
        style={{ appearance: 'auto' }}
      >
        {SHIPPING_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      <label htmlFor="country" className="ckv-float-label ckv-float-label--filled">
        Pays
      </label>
    </div>
  );
}

/* ─── AddressAutocomplete ───────────────────────────────────────────── */

interface AddressSuggestion {
  label: string;
  name: string;
  postcode: string;
  city: string;
}

function AddressAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (fields: { address: string; postalCode: string; city: string }) => void;
}) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filled = value && value.length > 0;

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber`,
      );
      const data = await res.json();
      const results: AddressSuggestion[] = data.features.map((f: { properties: { label: string; name: string; postcode: string; city: string } }) => ({
        label: f.properties.label,
        name: f.properties.name,
        postcode: f.properties.postcode,
        city: f.properties.city,
      }));
      setSuggestions(results);
      setOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(e.target.value), 300);
  };

  const handlePick = (s: AddressSuggestion) => {
    onSelect({ address: s.name, postalCode: s.postcode, city: s.city });
    setSuggestions([]);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div className="ckv-float-group">
        <input
          id="address" name="address" type="text" value={value}
          onChange={handleInput}
          required
          className="ckv-float-input" placeholder=" "
          autoComplete="off"
        />
        <label htmlFor="address" className={`ckv-float-label ${filled ? 'ckv-float-label--filled' : ''}`}>
          Adresse
        </label>
        {loading && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <div style={{ width: 14, height: 14, border: '2px solid #C4956A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute', zIndex: 50, top: '100%', left: 0, right: 0,
          background: '#fff', border: '1px solid #E8E0D6',
          borderRadius: 8, marginTop: 4, padding: 0, listStyle: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handlePick(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', cursor: 'pointer',
                fontSize: 13, color: '#2C2420',
                borderBottom: i < suggestions.length - 1 ? '1px solid #F5F0EA' : 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FDF5E6')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              <MapPin size={13} style={{ color: '#C4956A', flexShrink: 0 }} />
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── CheckoutForm ──────────────────────────────────────────────────── */

export function CheckoutForm({
  formData, isFormValid, formErrors, savedAddresses, selectedAddressId,
  loadingAddresses, handleChange, setAddressFields, goToPayment, selectAddress,
  subtotal,
}: CheckoutFormProps) {
  const isFrance = formData.country === 'FR';
  const shippingMethod = useCartStore((s) => s.shippingMethod);

  return (
    <div>
      <h2 className="ckv-heading-italic" style={{ marginBottom: 32 }}>
        Ou livrer votre commande ?
      </h2>

      {/* Saved addresses */}
      {loadingAddresses ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 72, borderRadius: 8, backgroundColor: '#F5F0EA', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : savedAddresses.length > 0 ? (
        <div style={{ marginBottom: 32 }}>
          <p className="ckv-section-label">Adresses enregistrees</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {savedAddresses.map((addr) => (
              <SavedAddressCard
                key={addr.id} address={addr}
                isSelected={selectedAddressId === addr.id}
                onSelect={() => selectAddress(addr)}
              />
            ))}
          </div>
          <button
            onClick={() => selectAddress({ id: '', userId: '', label: '', firstName: formData.firstName, lastName: formData.lastName, address: '', city: '', postalCode: '', country: 'France', isDefault: false })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#C4956A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
          >
            <MapPin size={14} />
            Nouvelle adresse
          </button>
        </div>
      ) : null}

      <form onSubmit={(e) => { e.preventDefault(); goToPayment(); }}>
        {/* Contact info */}
        <p className="ckv-section-label">Informations de contact</p>
        <div className="ckv-grid-2">
          <FloatingInput id="firstName" name="firstName" label="Prénom" value={formData.firstName} onChange={handleChange} required />
          <FloatingInput id="lastName" name="lastName" label="Nom" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="ckv-grid-2">
          <FloatingInput id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
          <FloatingInput
            id="phone" name="phone" label="Téléphone" type="tel"
            value={formData.phone} onChange={handleChange} required
            error={formErrors.phone}
          />
        </div>

        <div className="ckv-flourish">&#10022;</div>

        {/* Country first — détermine modes de livraison + format CP/tél */}
        <p className="ckv-section-label">Pays de livraison</p>
        <CountrySelect value={formData.country} onChange={handleChange} />

        {/* Address */}
        <p className="ckv-section-label" style={{ marginTop: 24 }}>Adresse de livraison</p>
        {isFrance ? (
          <AddressAutocomplete
            value={formData.address}
            onChange={handleChange}
            onSelect={setAddressFields}
          />
        ) : (
          <FloatingInput id="address" name="address" label="Adresse" value={formData.address} onChange={handleChange} required />
        )}
        <div className="ckv-grid-2">
          <FloatingInput
            id="postalCode" name="postalCode" label="Code postal"
            value={formData.postalCode} onChange={handleChange} required
            error={formErrors.postalCode}
          />
          <FloatingInput id="city" name="city" label="Ville" value={formData.city} onChange={handleChange} required />
        </div>

        <div className="ckv-flourish">&#10022;</div>

        {/* Mode de livraison */}
        <p className="ckv-section-label">Mode de livraison</p>
        <ShippingMethodSelect subtotal={subtotal} />

        {shippingMethod === 'mondial_relay' && (
          <MondialRelayWidget
            postalCode={formData.postalCode}
            country={formData.country}
          />
        )}

        {formErrors.pickupPoint && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#B85555', fontFamily: "'DM Sans', sans-serif" }}>
            {formErrors.pickupPoint}
          </p>
        )}

        <div style={{ paddingTop: 24 }}>
          <button type="submit" disabled={!isFormValid} className="ckv-btn-primary">
            Continuer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── SavedAddressCard ──────────────────────────────────────────────── */

function SavedAddressCard({ address, isSelected, onSelect }: { address: UserAddress; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left' as const, padding: '16px 20px', borderRadius: 8,
        border: '1px solid', borderColor: '#E8E0D6',
        borderLeft: isSelected ? '3px solid #C4956A' : '1px solid #E8E0D6',
        backgroundColor: isSelected ? '#FFFBF7' : '#fff',
        cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ marginTop: 2, width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? '#C4956A' : '#D4CBC0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C4956A' }} />}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#2C2420', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {address.label}
            {address.isDefault && (
              <span style={{ fontSize: 10, fontWeight: 500, color: '#C4956A', backgroundColor: 'rgba(196,149,106,0.1)', padding: '2px 8px', borderRadius: 20 }}>Par defaut</span>
            )}
          </p>
          <p style={{ fontSize: 12, color: '#9B8E82', margin: '2px 0 0' }}>{address.firstName} {address.lastName}</p>
          <p style={{ fontSize: 12, color: '#9B8E82', margin: '1px 0 0' }}>{address.address}, {address.postalCode} {address.city}</p>
        </div>
      </div>
    </button>
  );
}
