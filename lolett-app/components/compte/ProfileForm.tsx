'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { getProfile, updateProfile } from '@/lib/adapters/supabase-user';

export function ProfileForm() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => {
      if (p) {
        setFirstName(p.firstName || '');
        setLastName(p.lastName || '');
        setPhone(p.phone || '');
      } else {
        // fallback from auth metadata
        setFirstName(user.user_metadata?.first_name || '');
        setLastName(user.user_metadata?.last_name || '');
      }
      setLoading(false);
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    await updateProfile(user.id, { firstName, lastName, phone });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const initials = (firstName?.[0] || user?.email?.[0] || '?').toUpperCase();

  if (loading) {
    return (
      <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-8 animate-pulse">
        <div className="h-6 bg-[#f3efe8] rounded w-40 mb-8" />
        <div className="space-y-4">
          <div className="h-10 bg-[#f3efe8] rounded" />
          <div className="h-10 bg-[#f3efe8] rounded" />
          <div className="h-10 bg-[#f3efe8] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FEFAF3] rounded-xl border border-[#c4b49c]/15 shadow-sm p-6 sm:p-8">
      <h1 className="font-playfair text-xl text-[#1a1510] mb-6">Mon profil</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B0B94] text-xl font-bold text-white font-playfair">
          {initials}
        </div>
        <div>
          <p className="font-body text-sm font-medium text-[#1a1510]">{firstName} {lastName}</p>
          <p className="text-xs text-[#8a7d6b] font-body">{user?.email}</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center font-body">
          Profil mis a jour avec succes.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Prenom</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-[#c4b49c]/30 text-[#1a1510] font-body text-sm focus:outline-none focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Nom</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-[#c4b49c]/30 text-[#1a1510] font-body text-sm focus:outline-none focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Email</label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 rounded-lg bg-[#f3efe8] border border-[#c4b49c]/20 text-[#8a7d6b] font-body text-sm cursor-not-allowed"
          />
          <p className="text-xs text-[#8a7d6b] mt-1 font-body">L&apos;email ne peut pas etre modifie.</p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Telephone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white border border-[#c4b49c]/30 text-[#1a1510] placeholder-[#8a7d6b] font-body text-sm focus:outline-none focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] transition-colors"
            placeholder="06 12 34 56 78"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-lg bg-[#1B0B94] hover:bg-[#b3933d] text-white font-semibold font-body text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
