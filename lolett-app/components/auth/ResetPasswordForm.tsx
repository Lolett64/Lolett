'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/connexion?reset=success');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#FDF5E6' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-playfair text-4xl tracking-widest text-[#1a1510]">LOLETT</h1>
          <p className="text-[#1B0B94] text-sm tracking-wider mt-2 font-body">MODE DU SUD-OUEST</p>
        </div>

        <div className="bg-[#FEFAF3] rounded-2xl p-8 shadow-sm border border-[#c4b49c]/20">
          <h2 className="font-playfair text-2xl text-[#1a1510] text-center mb-8">Nouveau mot de passe</h2>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#c4b49c]/30 text-[#1a1510] placeholder-[#8a7d6b] font-body text-sm focus:outline-none focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] transition-colors"
                placeholder="8 caracteres minimum"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-[#5a4d3e] mb-1.5 font-body">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white border border-[#c4b49c]/30 text-[#1a1510] placeholder-[#8a7d6b] font-body text-sm focus:outline-none focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#1B0B94] hover:bg-[#B89547] text-white font-semibold font-body text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Mise a jour...
                </span>
              ) : 'Mettre a jour le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
