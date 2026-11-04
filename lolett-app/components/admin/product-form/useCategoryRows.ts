'use client';

import { useEffect, useState } from 'react';
import type { CategoryRow } from '@/lib/category-options';

/** Charge les catégories créées dans l'admin (page Catégories). */
export function useCategoryRows() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/categories')
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data: { categories?: CategoryRow[] }) => {
        if (!cancelled) setRows(data.categories ?? []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { rows, loading };
}
