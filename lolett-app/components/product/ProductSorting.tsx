'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function ProductSorting() {
  const [sort, setSort] = useState('newest');

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Button variant="outline" disabled className="rounded-full px-3 text-xs sm:px-4 sm:text-sm">
        <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Filtrer</span>
        <span className="text-lolett-gray-400 ml-2 hidden text-xs sm:inline">(Bientôt)</span>
      </Button>

      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-[140px] rounded-full text-sm sm:w-[180px]">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Nouveautés</SelectItem>
          <SelectItem value="price-asc">Prix croissant</SelectItem>
          <SelectItem value="price-desc">Prix décroissant</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
