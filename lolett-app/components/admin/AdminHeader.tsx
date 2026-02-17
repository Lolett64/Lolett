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
    <header className="flex h-14 items-center justify-between border-b border-lolett-gray-200 bg-white px-6">
      <h1 className="text-sm font-semibold text-lolett-gray-600 lg:text-base">
        Administration
      </h1>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="gap-2 text-lolett-gray-500 hover:text-lolett-gray-900"
      >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </Button>
    </header>
  );
}
