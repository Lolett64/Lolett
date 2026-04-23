'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { createAddress, updateAddress } from '@/lib/adapters/supabase-user';
import type { UserAddress } from '@/types';

interface AddressFormProps {
  address?: UserAddress | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSaved, onCancel }: AddressFormProps) {
  const { user } = useAuth();
  const [label, setLabel] = useState(address?.label || '');
  const [firstName, setFirstName] = useState(address?.firstName || '');
  const [lastName, setLastName] = useState(address?.lastName || '');
  const [addressLine, setAddressLine] = useState(address?.address || '');
  const [city, setCity] = useState(address?.city || '');
  const [postalCode, setPostalCode] = useState(address?.postalCode || '');
  const [country, setCountry] = useState(address?.country || 'France');
  const [isDefault, setIsDefault] = useState(address?.isDefault || false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const data = { label, firstName, lastName, address: addressLine, city, postalCode, country, isDefault };

    if (address) {
      await updateAddress(address.id, user.id, data);
    } else {
      await createAddress(user.id, data);
    }

    setSaving(false);
    onSaved();
  };

  const inputCls = "w-full px-4 py-3 rounded-lg bg-white border border-[#c4b49c]/30 text-[#1a1510] placeholder-[#8a7d6b] font-body text-sm focus:outline-none focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] transition-colors";

  return (
    <div>
      <button onClick={onCancel} className="inline-flex items-center gap-1 text-sm text-[#1B0B94] hover:text-[#B89547] font-body mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-6 sm:p-8">
        <h1 className="font-playfair text-xl text-[#1a1510] mb-6">
          {address ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Nom de l&apos;adresse</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} required className={inputCls} placeholder="Maison, Bureau..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Prénom</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Nom</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Adresse</label>
            <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required className={inputCls} placeholder="12 rue de la Paix" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Code postal</label>
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className={inputCls} placeholder="75001" />
            </div>
            <div>
              <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Ville</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} placeholder="Paris" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Pays</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} required className={inputCls} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-[#c4b49c]/30 text-[#1B0B94] focus:ring-[#1B0B94]"
            />
            <span className="text-sm text-[#5a4d3e] font-body">Adresse par defaut</span>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-[#1B0B94] hover:bg-[#B89547] text-white font-semibold font-body text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg border border-[#c4b49c]/30 text-[#5a4d3e] hover:bg-[#f3efe8] font-body text-sm transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
