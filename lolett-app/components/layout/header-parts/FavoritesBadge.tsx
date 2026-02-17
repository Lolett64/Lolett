'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/features/favorites';

export function FavoritesBadge() {
  const favCount = useFavoritesStore((state) => state.getCount());

  return (
    <Link
      href="/favoris"
      className="text-lolett-gray-600 hover:text-lolett-blue touch-target relative flex items-center justify-center p-2.5 transition-colors"
      aria-label={`Favoris${favCount > 0 ? ` (${favCount})` : ''}`}
    >
      <Heart className="h-5 w-5" />
      {favCount > 0 && (
        <span className="bg-lolett-blue absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
          {favCount > 9 ? '9+' : favCount}
        </span>
      )}
    </Link>
  );
}
