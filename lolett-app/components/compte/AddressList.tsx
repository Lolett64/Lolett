'use client';

import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Pencil, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getAddresses, deleteAddress } from '@/lib/adapters/supabase-user';
import { AddressForm } from './AddressForm';
import type { UserAddress } from '@/types';

export function AddressList() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState<UserAddress | null>(null);

  const load = () => {
    if (!user) return;
    getAddresses(user.id).then((a) => {
      setAddresses(a);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    await deleteAddress(id);
    load();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditAddress(null);
    load();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-[#f3efe8] rounded w-48 mb-6" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#c4b49c]/15 p-6 animate-pulse">
            <div className="h-4 bg-[#f3efe8] rounded w-40 mb-3" />
            <div className="h-3 bg-[#f3efe8] rounded w-56" />
          </div>
        ))}
      </div>
    );
  }

  if (showForm || editAddress) {
    return (
      <AddressForm
        address={editAddress}
        onSaved={handleSaved}
        onCancel={() => { setShowForm(false); setEditAddress(null); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-playfair text-xl text-[#1a1510]">Mes adresses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c4a44e] hover:bg-[#b3933d] text-white text-sm font-body font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-12 text-center">
          <MapPin className="h-12 w-12 text-[#c4b49c]/40 mx-auto mb-4" />
          <h3 className="font-playfair text-lg text-[#1a1510] mb-2">Aucune adresse</h3>
          <p className="text-sm text-[#8a7d6b] font-body">Ajoutez votre premiere adresse de livraison.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#1a1510] font-body">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#c4a44e] bg-[#c4a44e]/10 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3" />
                        Par defaut
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#5a4d3e] font-body">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p className="text-sm text-[#8a7d6b] font-body">
                    {addr.address}, {addr.postalCode} {addr.city}, {addr.country}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditAddress(addr)}
                    className="p-2 text-[#8a7d6b] hover:text-[#c4a44e] transition-colors"
                    aria-label="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-[#8a7d6b] hover:text-red-500 transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
