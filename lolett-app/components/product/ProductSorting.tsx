'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SortOption = 'newest' | 'bestsellers' | 'price-asc' | 'price-desc' | 'name-asc';

interface ProductSortingProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function ProductSorting({ value, onChange }: ProductSortingProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[150px] rounded-full text-base sm:w-[190px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent className="text-base">
        <SelectItem value="newest" className="text-base">Nouveautés</SelectItem>
        <SelectItem value="bestsellers" className="text-base">Meilleures ventes</SelectItem>
        <SelectItem value="price-asc" className="text-base">Prix croissant</SelectItem>
        <SelectItem value="price-desc" className="text-base">Prix décroissant</SelectItem>
        <SelectItem value="name-asc" className="text-base">Nom (A-Z)</SelectItem>
      </SelectContent>
    </Select>
  );
}
