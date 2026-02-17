'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductStockInputProps {
  productId: string;
  initialStock: number;
}

export function ProductStockInput({ productId, initialStock }: ProductStockInputProps) {
  const router = useRouter();
  const [stock, setStock] = useState(String(initialStock));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = stock !== String(initialStock);

  async function handleSave() {
    const newStock = parseInt(stock, 10);
    if (isNaN(newStock) || newStock < 0) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Input
        type="number"
        min="0"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className={cn(
          'w-16 h-7 text-center text-xs px-1',
          parseInt(stock, 10) === 0
            ? 'border-red-400 text-red-600'
            : parseInt(stock, 10) < 3
              ? 'border-orange-400 text-orange-600'
              : ''
        )}
      />
      {isDirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <Check className="size-3.5" />
        </Button>
      )}
      {saved && !isDirty && (
        <Check className="size-3.5 text-green-500" />
      )}
    </div>
  );
}
