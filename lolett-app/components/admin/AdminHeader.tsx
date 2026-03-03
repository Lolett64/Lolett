'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin-login');
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between bg-[#FDF5E6] px-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h1 className="font-[Newsreader] text-base italic text-[#B89547] lg:text-lg">
        Administration
      </h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2 text-[#B89547]/70 hover:text-[#B89547] hover:bg-transparent"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </Button>
    </header>
  );
}
