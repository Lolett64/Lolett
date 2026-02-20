'use client';

import { MapPin } from 'lucide-react';
import type { useCheckout } from '../hooks/useCheckout';
import type { UserAddress } from '@/types';

type CheckoutHook = ReturnType<typeof useCheckout>;

interface CheckoutFormProps {
  formData: CheckoutHook['formData'];
  isFormValid: CheckoutHook['isFormValid'];
  savedAddresses: CheckoutHook['savedAddresses'];
  selectedAddressId: CheckoutHook['selectedAddressId'];
  loadingAddresses: CheckoutHook['loadingAddresses'];
  handleChange: CheckoutHook['handleChange'];
  goToPayment: CheckoutHook['goToPayment'];
  selectAddress: CheckoutHook['selectAddress'];
}

function FloatingInput({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const filled = value && value.length > 0;
  return (
    <div className="ckv-float-group">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="ckv-float-input"
        placeholder=" "
      />
      <label htmlFor={id} className={`ckv-float-label ${filled ? 'ckv-float-label--filled' : ''}`}>
        {label}
      </label>
    </div>
  );
}

export function CheckoutForm({
  formData,
  isFormValid,
  savedAddresses,
  selectedAddressId,
  loadingAddresses,
  handleChange,
  goToPayment,
  selectAddress,
}: CheckoutFormProps) {
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
                key={addr.id}
                address={addr}
                isSelected={selectedAddressId === addr.id}
                onSelect={() => selectAddress(addr)}
              />
            ))}
          </div>
          <button
            onClick={() => {
              selectAddress({
                id: '',
                userId: '',
                label: '',
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: '',
                city: '',
                postalCode: '',
                country: 'France',
                isDefault: false,
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#C4956A',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
            }}
          >
            <MapPin size={14} />
            Nouvelle adresse
          </button>
        </div>
      ) : null}

      {/* Address form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToPayment();
        }}
      >
        {/* Contact info */}
        <p className="ckv-section-label">Informations de contact</p>
        <div className="ckv-grid-2">
          <FloatingInput id="firstName" name="firstName" label="Prenom" value={formData.firstName} onChange={handleChange} required />
          <FloatingInput id="lastName" name="lastName" label="Nom" value={formData.lastName} onChange={handleChange} required />
        </div>
        <div className="ckv-grid-2">
          <FloatingInput id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
          <FloatingInput id="phone" name="phone" label="Telephone" type="tel" value={formData.phone} onChange={handleChange} required />
        </div>

        {/* Flourish divider */}
        <div className="ckv-flourish">&#10022;</div>

        {/* Address fields */}
        <p className="ckv-section-label">Adresse de livraison</p>
        <FloatingInput id="address" name="address" label="Adresse" value={formData.address} onChange={handleChange} required />
        <div className="ckv-grid-2">
          <FloatingInput id="postalCode" name="postalCode" label="Code postal" value={formData.postalCode} onChange={handleChange} required />
          <FloatingInput id="city" name="city" label="Ville" value={formData.city} onChange={handleChange} required />
        </div>
        <FloatingInput id="country" name="country" label="Pays" value={formData.country} onChange={handleChange} disabled />

        <div style={{ paddingTop: 24 }}>
          <button
            type="submit"
            disabled={!isFormValid}
            className="ckv-btn-primary"
          >
            Continuer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Saved Address Card ────────────────────────────────────────────── */

function SavedAddressCard({
  address,
  isSelected,
  onSelect,
}: {
  address: UserAddress;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left' as const,
        padding: '16px 20px',
        borderRadius: 8,
        border: '1px solid',
        borderColor: isSelected ? '#E8E0D6' : '#E8E0D6',
        borderLeft: isSelected ? '3px solid #C4956A' : '1px solid #E8E0D6',
        backgroundColor: isSelected ? '#FFFBF7' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            marginTop: 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `2px solid ${isSelected ? '#C4956A' : '#D4CBC0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isSelected && (
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#C4956A' }} />
          )}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#2C2420', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {address.label}
            {address.isDefault && (
              <span style={{
                fontSize: 10,
                fontWeight: 500,
                color: '#C4956A',
                backgroundColor: 'rgba(196,149,106,0.1)',
                padding: '2px 8px',
                borderRadius: 20,
              }}>
                Par defaut
              </span>
            )}
          </p>
          <p style={{ fontSize: 12, color: '#9B8E82', margin: '2px 0 0' }}>
            {address.firstName} {address.lastName}
          </p>
          <p style={{ fontSize: 12, color: '#9B8E82', margin: '1px 0 0' }}>
            {address.address}, {address.postalCode} {address.city}
          </p>
        </div>
      </div>
    </button>
  );
}
