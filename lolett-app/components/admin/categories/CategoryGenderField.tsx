'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GENDERS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
];

interface CategoryGenderFieldProps {
  editing: boolean;
  gender: string;
  genders: string[];
  onGenderChange: (gender: string) => void;
  onToggleGender: (gender: string) => void;
}

/**
 * Création : cases Homme / Femme (cocher les deux crée la catégorie des deux côtés).
 * Modification : le genre est figé (ses produits sont rangés de ce côté-là).
 */
export function CategoryGenderField({
  editing,
  gender,
  genders,
  onGenderChange,
  onToggleGender,
}: CategoryGenderFieldProps) {
  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-[#1a1510]">Genre *</Label>
        <Select value={gender} onValueChange={onGenderChange} required disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            {GENDERS.map((g) => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-[#1a1510]/50">
          Pour l&apos;autre genre, créez une nouvelle catégorie.
        </p>
      </div>
    );
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-[#1a1510]">Genre *</legend>
      <div className="flex h-9 items-center gap-5">
        {GENDERS.map((g) => (
          <label key={g.value} className="flex cursor-pointer items-center gap-2 text-sm text-[#1a1510]">
            <input
              type="checkbox"
              checked={genders.includes(g.value)}
              onChange={() => onToggleGender(g.value)}
              className="size-4 accent-[#1B0B94]"
            />
            {g.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
