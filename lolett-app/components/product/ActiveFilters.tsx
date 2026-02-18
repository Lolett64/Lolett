'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onRemove(filter.key)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
            'bg-lolett-gold/10 text-lolett-gold hover:bg-lolett-gold/20',
            'sm:text-sm sm:px-4'
          )}
          aria-label={`Retirer le filtre ${filter.label}`}
        >
          <span>{filter.label}: {filter.value}</span>
          <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-lolett-gray-500 hover:text-lolett-gray-700 underline sm:text-sm"
        >
          Tout effacer
        </button>
      )}
    </div>
  );
}
