'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/compte';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  async function handleGoogle() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{ backgroundColor: '#FDF5E6' }}
    >
      {/* Texture grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Gold line top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12"
        style={{ background: 'linear-gradient(to bottom, #B89547, transparent)' }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[440px] rounded-2xl border px-11 py-12"
        style={{
          background: 'rgba(255,255,255,0.45)',
          borderColor: 'rgba(27,11,148,0.05)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 40px rgba(27,11,148,0.04)',
        }}
      >
        {/* Logo */}
        <h1
          className="text-center font-playfair text-[32px] tracking-[0.35em] font-medium"
          style={{ color: '#1B0B94' }}
        >
          Lolett
        </h1>
        <p
          className="text-center text-[11px] tracking-[0.25em] uppercase mt-1.5 mb-8"
          style={{ color: '#1B0B94', opacity: 0.45 }}
        >
          Mode du Sud-Ouest
        </p>

        {/* Separator */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,71,0.25), transparent)' }} />
          <div className="w-[5px] h-[5px] rotate-45" style={{ background: 'rgba(184,149,71,0.4)' }} />
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(184,149,71,0.25), transparent)' }} />
        </div>

        {/* Title */}
        <h2
          className="text-center font-playfair text-[30px] italic mb-2"
          style={{ color: '#1B0B94', fontWeight: 400 }}
        >
          Se connecter
        </h2>
        <p className="text-center text-xs mb-8 font-light tracking-wide" style={{ color: '#5a4d3e' }}>
          Retrouvez votre espace personnel
        </p>

        {/* Errors */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 font-body">
            {error}
          </div>
        )}

        {searchParams.get('error') === 'auth' && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600 font-body">
            Une erreur est survenue lors de la connexion.
          </div>
        )}

        {searchParams.get('reset') === 'success' && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-center text-sm text-green-700 font-body">
            Mot de passe mis à jour avec succès. Connectez-vous.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block pl-0.5 text-[10px] font-medium uppercase tracking-[0.14em]"
              style={{ color: '#5a4d3e' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full rounded-lg border bg-white/65 px-4 py-3 text-center text-[13px] tracking-wide outline-none transition-all focus:bg-white/90 focus:shadow-[0_2px_12px_rgba(27,11,148,0.05)]"
              style={{
                borderColor: 'rgba(27,11,148,0.08)',
                color: '#1a1510',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block pl-0.5 text-[10px] font-medium uppercase tracking-[0.14em]"
              style={{ color: '#5a4d3e' }}
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border bg-white/65 px-4 py-3 text-center text-[13px] tracking-wide outline-none transition-all focus:bg-white/90 focus:shadow-[0_2px_12px_rgba(27,11,148,0.05)]"
              style={{
                borderColor: 'rgba(27,11,148,0.08)',
                color: '#1a1510',
              }}
            />
          </div>

          <div className="pr-0.5 text-right">
            <Link
              href="/mot-de-passe-oublie"
              className="text-[10px] transition-opacity hover:opacity-100"
              style={{ color: '#1B0B94', opacity: 0.6 }}
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: '#1B0B94' }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </span>
            ) : (
              'Entrer'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3.5">
          <div className="h-px flex-1" style={{ background: 'rgba(27,11,148,0.06)' }} />
          <span className="text-[10px] tracking-wider" style={{ color: '#8a7d6b' }}>
            ou
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(27,11,148,0.06)' }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border bg-white/45 py-3 text-[11px] tracking-wide transition-all hover:border-[rgba(27,11,148,0.15)] hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            borderColor: 'rgba(27,11,148,0.08)',
            color: '#1a1510',
          }}
        >
          <svg className="h-[15px] w-[15px]" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Connexion avec Google
        </button>

        {/* Register */}
        <p className="mt-6 text-center text-xs font-light" style={{ color: '#5a4d3e' }}>
          Nouveau ?{' '}
          <Link
            href="/inscription"
            className="font-medium transition-colors hover:text-[#B89547]"
            style={{ color: '#1B0B94' }}
          >
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Bottom deco */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="h-px w-6" style={{ background: 'rgba(184,149,71,0.15)' }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: 'rgba(184,149,71,0.3)' }} />
        <div className="h-px w-6" style={{ background: 'rgba(184,149,71,0.15)' }} />
      </div>
    </div>
  );
}
