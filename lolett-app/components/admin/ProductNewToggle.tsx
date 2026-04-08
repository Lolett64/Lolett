'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductNewToggleProps {
  productId: string;
  initialIsNew: boolean;
}

export function ProductNewToggle({ productId, initialIsNew }: ProductNewToggleProps) {
  const router = useRouter();
  const [isNew, setIsNew] = useState(initialIsNew);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const next = !isNew;
    setIsNew(next);
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_new: next }),
      });
      router.refresh();
    } catch {
      setIsNew(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isNew ? 'Retirer des nouveautés' : 'Ajouter aux nouveautés'}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 border',
        isNew
          ? 'bg-[#B89547]/10 text-[#B89547] border-[#B89547]/30 hover:bg-[#B89547]/20'
          : 'bg-transparent text-[#1a1510]/30 border-[#1a1510]/10 hover:border-[#B89547]/30 hover:text-[#B89547]/60',
        loading && 'opacity-50 cursor-wait'
      )}
    >
      <Sparkles className="size-3" />
      {isNew ? 'New' : '—'}
    </button>
  );
}
