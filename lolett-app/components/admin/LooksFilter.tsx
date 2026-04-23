'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Search } from 'lucide-react';
import { LookDeleteButton } from '@/components/admin/LookDeleteButton';

interface Look {
  id: string;
  title: string;
  gender: string;
  cover_image: string;
  vibe: string;
  short_pitch: string;
  created_at: string;
}

export function LooksFilter({ looks }: { looks: Look[] }) {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');

  const filtered = looks.filter((look) => {
    const matchSearch = !search || look.title.toLowerCase().includes(search.toLowerCase());
    const matchGender = !gender || look.gender.toLowerCase() === gender.toLowerCase();
    return matchSearch && matchGender;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510]">Looks</h2>
          <p className="text-sm text-[#B89547] mt-1">{looks.length} look(s)</p>
        </div>
        <Link href="/admin/looks/new">
          <Button className="gap-2 bg-[#1B0B94] text-white hover:bg-[#130970]">
            <Plus className="size-4" />
            Nouveau look
          </Button>
        </Link>
      </div>

      {/* Search + Gender filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#1a1510]/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-[#1a1510] placeholder:text-[#1a1510]/30 outline-none focus:border-[#B89547] focus:ring-2 focus:ring-[#B89547]/20 transition-colors"
          />
        </div>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1a1510] outline-none focus:border-[#B89547] focus:ring-2 focus:ring-[#B89547]/20 transition-colors"
        >
          <option value="">Tous</option>
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#B89547]/30 bg-[#B89547]/5 p-12 text-center">
          <p className="text-[#1a1510]/40">
            {looks.length === 0 ? 'Aucun look pour le moment' : 'Aucun look ne correspond aux filtres'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((look) => (
            <div
              key={look.id}
              className="rounded-xl border border-gray-200/50 bg-white overflow-hidden hover:shadow-md hover:border-[#B89547]/30 transition-all duration-300"
            >
              {look.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={look.cover_image}
                  alt={look.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-[#FDF5E6] flex items-center justify-center">
                  <span className="text-xs text-[#1a1510]/30">Pas d&apos;image</span>
                </div>
              )}
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-montserrat)] font-medium text-[#1a1510] truncate">{look.title}</p>
                    {look.vibe && (
                      <p className="text-xs text-[#1a1510]/50 truncate">{look.vibe}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize text-xs bg-[#B89547]/10 text-[#B89547] border-[#B89547]/20">
                    {look.gender}
                  </Badge>
                </div>
                {look.short_pitch && (
                  <p className="text-xs text-[#1a1510]/60 line-clamp-2">{look.short_pitch}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Link href={`/admin/looks/${look.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1 border-gray-200 text-[#1a1510] hover:border-[#B89547] hover:text-[#B89547] transition-colors">
                      <Pencil className="size-3.5" />
                      Modifier
                    </Button>
                  </Link>
                  <LookDeleteButton lookId={look.id} lookTitle={look.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
