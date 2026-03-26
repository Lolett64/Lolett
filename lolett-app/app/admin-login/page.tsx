'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: '#0C0A1E' }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute -top-[30%] left-1/2 h-[70%] w-full -translate-x-1/2"
        style={{ background: 'radial-gradient(ellipse at center, rgba(27,11,148,0.12) 0%, transparent 60%)' }}
      />

      {/* Gold line top */}
      <div
        className="absolute top-0 left-1/2 h-12 w-px -translate-x-1/2"
        style={{ background: 'linear-gradient(to bottom, #B89547, transparent)' }}
      />

      {/* Gold line bottom */}
      <div
        className="absolute bottom-0 left-1/2 h-12 w-px -translate-x-1/2"
        style={{ background: 'linear-gradient(to top, rgba(184,149,71,0.3), transparent)' }}
      />

      {/* Logo */}
      <h1
        className="relative z-10 mb-1.5 font-playfair text-sm tracking-[0.4em] uppercase"
        style={{ color: '#B89547' }}
      >
        Lolett
      </h1>
      <p
        className="relative z-10 mb-9 text-[8px] tracking-[0.3em] uppercase"
        style={{ color: 'rgba(184,149,71,0.25)' }}
      >
        Administration
      </p>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[320px] rounded-[10px] border px-7 py-8"
        style={{
          background: 'rgba(255,255,255,0.025)',
          borderColor: 'rgba(184,149,71,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <h2
          className="mb-7 text-center font-playfair text-[22px] italic"
          style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}
        >
          Se connecter
        </h2>

        {error && (
          <div
            className="mb-5 rounded-md border px-4 py-2.5 text-center text-xs"
            style={{
              background: 'rgba(239,68,68,0.08)',
              borderColor: 'rgba(239,68,68,0.15)',
              color: '#f87171',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoFocus
              className="w-full border-b bg-transparent py-3 text-center text-[11px] tracking-[0.08em] outline-none transition-colors focus:border-[rgba(184,149,71,0.3)]"
              style={{
                borderColor: 'rgba(184,149,71,0.1)',
                color: 'rgba(255,255,255,0.75)',
              }}
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
              minLength={8}
              className="w-full border-b bg-transparent py-3 text-center text-[11px] tracking-[0.08em] outline-none transition-colors focus:border-[rgba(184,149,71,0.3)]"
              style={{
                borderColor: 'rgba(184,149,71,0.1)',
                color: 'rgba(255,255,255,0.75)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all hover:shadow-[0_4px_20px_rgba(184,149,71,0.25)] hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: '#B89547', color: '#0C0A1E' }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connexion...
              </span>
            ) : (
              <>
                <LogIn size={13} />
                Entrer
              </>
            )}
          </button>
        </form>

        {/* SSL badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          <Lock size={10} style={{ color: 'rgba(184,149,71,0.2)' }} />
          <span
            className="text-[8px] uppercase tracking-[0.1em]"
            style={{ color: 'rgba(255,255,255,0.08)' }}
          >
            SSL sécurisé
          </span>
        </div>
      </div>
    </div>
  );
}
