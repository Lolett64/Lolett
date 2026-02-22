'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';

export function AccountBadge() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || !user) {
    return (
      <Link
        href="/connexion"
        className="text-white group-data-[scrolled=true]/header:text-[#5a4d3e] group-data-[scrolled=true]/header:hover:text-[#1a1510] relative hidden sm:flex items-center justify-center p-2.5 transition-colors"
        aria-label="Se connecter"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push('/');
  };

  const initials = user.user_metadata?.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center p-2.5 transition-colors"
        aria-label="Mon compte"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c4a44e] text-xs font-bold text-white">
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[#c4b49c]/20 bg-white py-2 shadow-lg z-50">
          <div className="border-b border-[#c4b49c]/10 px-4 py-2">
            <p className="text-sm font-medium text-[#1a1510] truncate">{user.user_metadata?.first_name || 'Mon compte'}</p>
            <p className="text-xs text-[#8a7d6b] truncate">{user.email}</p>
          </div>
          <Link href="/compte" className="flex items-center gap-2 px-4 py-2 text-sm text-[#5a4d3e] hover:bg-[#f3efe8] transition-colors" onClick={() => setOpen(false)}>
            <User className="h-4 w-4" />
            Mon espace
          </Link>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#5a4d3e] hover:bg-[#f3efe8] transition-colors">
            <LogOut className="h-4 w-4" />
            Deconnexion
          </button>
        </div>
      )}
    </div>
  );
}
