'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'light' | 'dark';
}

export function NewsletterForm({ variant = 'light' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 800));
    setStatus('success');
    setEmail('');
  };

  const isDark = variant === 'dark';

  if (status === 'success') {
    return (
      <p className={`text-sm tracking-wide font-medium py-6 ${isDark ? 'text-[#c9a24a]' : 'text-[#c9a24a]'}`}>
        Bienvenue dans le cercle Lolett.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative group max-w-md mx-auto">
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.com"
        className={`w-full bg-transparent py-4 pl-0 pr-28 text-sm tracking-wider font-light outline-none transition-all ${
          isDark
            ? 'border-b border-white/15 text-white placeholder:text-white/25 focus:border-[#c9a24a]'
            : 'border-b border-[#1B0B94]/12 text-[#1B0B94] placeholder:text-[#1B0B94]/25 focus:border-[#c9a24a]'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-bold transition-colors disabled:opacity-50 ${
          isDark
            ? 'text-[#c9a24a] hover:text-white'
            : 'text-[#1B0B94] hover:text-[#c9a24a]'
        }`}
      >
        {status === 'loading' ? '...' : "S'inscrire"}
        <ArrowRight size={13} />
      </button>
    </form>
  );
}
