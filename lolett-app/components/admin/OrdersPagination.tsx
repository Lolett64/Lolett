'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OrdersPaginationProps {
  page: number;
  totalPages: number;
}

export function OrdersPagination({ page, totalPages }: OrdersPaginationProps) {
  const searchParams = useSearchParams();

  function hrefFor(target: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(target));
    return `?${params.toString()}`;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav className="flex items-center justify-between gap-4 font-[family-name:var(--font-montserrat)] text-sm">
      {prevDisabled ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e8e0d6] bg-white/60 px-3 py-2 text-[#1a1510]/30 cursor-not-allowed">
          <ChevronLeft className="size-4" />
          Précédent
        </span>
      ) : (
        <Link
          href={hrefFor(page - 1)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-[#1a1510] hover:border-[#B89547] hover:text-[#B89547] transition-colors"
        >
          <ChevronLeft className="size-4" />
          Précédent
        </Link>
      )}

      <span className="text-[#1a1510]/60">
        Page <span className="font-medium text-[#1a1510]">{page}</span> sur <span className="font-medium text-[#1a1510]">{totalPages}</span>
      </span>

      {nextDisabled ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e8e0d6] bg-white/60 px-3 py-2 text-[#1a1510]/30 cursor-not-allowed">
          Suivant
          <ChevronRight className="size-4" />
        </span>
      ) : (
        <Link
          href={hrefFor(page + 1)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#e8e0d6] bg-white px-3 py-2 text-[#1a1510] hover:border-[#B89547] hover:text-[#B89547] transition-colors"
        >
          Suivant
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
