'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCallback, useTransition } from 'react';
import {
  ORDER_STATUS_VALUES,
  ORDER_STATUS_LABELS,
  SHIPPING_METHODS,
} from '@/lib/constants';
import { SHIPPING_METHOD_VALUES } from '@/lib/types/domain';

export function OrderFilters() {
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
        router.push(`/admin/orders?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        defaultValue={searchParams.get('status') ?? 'all'}
        onValueChange={(v) => updateFilter('status', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {ORDER_STATUS_VALUES.map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get('shipping_method') ?? 'all'}
        onValueChange={(v) => updateFilter('shipping_method', v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Mode de livraison" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les modes</SelectItem>
          {SHIPPING_METHOD_VALUES.map((m) => (
            <SelectItem key={m} value={m}>
              {SHIPPING_METHODS[m].label}
            </SelectItem>
          ))}
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
          <SelectItem value="total">Montant</SelectItem>
          <SelectItem value="status">Statut</SelectItem>
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
