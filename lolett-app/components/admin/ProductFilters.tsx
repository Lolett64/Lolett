'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useCallback, useTransition } from 'react';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`/admin/products?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-lolett-gray-400" />
        <Input
          placeholder="Rechercher un produit..."
          defaultValue={searchParams.get('search') ?? ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        defaultValue={searchParams.get('gender') ?? 'all'}
        onValueChange={(v) => updateFilter('gender', v)}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous genres</SelectItem>
          <SelectItem value="homme">Homme</SelectItem>
          <SelectItem value="femme">Femme</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('sort') ?? 'created_at'}
        onValueChange={(v) => updateFilter('sort', v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Date</SelectItem>
          <SelectItem value="price">Prix</SelectItem>
          <SelectItem value="stock">Stock</SelectItem>
          <SelectItem value="name">Nom</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('order') ?? 'desc'}
        onValueChange={(v) => updateFilter('order', v)}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Ordre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Décroissant</SelectItem>
          <SelectItem value="asc">Croissant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
