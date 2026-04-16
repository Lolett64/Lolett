export const AVAILABLE_SIZES = [
  'TU', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '29', '30', '31', '32', '33', '34', '35', '36', '37', '38',
  '39', '40', '41', '42', '43', '44',
  'S/M', 'M/L',
] as const;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariantStock {
  colorName: string;
  colorHex: string;
  size: string;
  stock: number;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  composition: string;
  model_info: string;
  price: string;
  compare_at_price: string;
  gender: string;
  category_slug: string;
  sizes: string[];
  colors: ProductColor[];
  stock: string;
  variants: ProductVariantStock[];
  is_new: boolean;
  tags: string;
  images: string[];
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData & { variants?: ProductVariantStock[] }>;
  productId?: string;
  mode: 'create' | 'edit';
}

export const CATEGORIES_BY_GENDER: Record<string, { slug: string; label: string }[]> = {
  homme: [
    { slug: 'hauts', label: 'Hauts' },
    { slug: 'bas', label: 'Bas' },
    { slug: 'vestes', label: 'Vestes' },
    { slug: 'accessoires', label: 'Accessoires' },
  ],
  femme: [
    { slug: 'hauts', label: 'Hauts' },
    { slug: 'bas', label: 'Bas' },
    { slug: 'robes', label: 'Robes & Combinaisons' },
    { slug: 'bijoux', label: 'Bijoux' },
    { slug: 'chaussures', label: 'Chaussures' },
    { slug: 'sacs', label: 'Sacs' },
  ],
  both: [
    { slug: 'hauts', label: 'Hauts' },
    { slug: 'bas', label: 'Bas' },
    { slug: 'accessoires', label: 'Accessoires' },
  ],
};

/* ── Shared styles ─────────────────────────────────────── */
export const card = 'w-full rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm';
export const fieldLabel = 'block text-sm font-medium text-[#4a4a56] mb-1.5';
export const inputBase =
  'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-[#9999a8] focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
export const selectBase =
  'block w-full rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-[#1B0B94] focus:ring-2 focus:ring-[#1B0B94]/20';
export const btnPrimary =
  'inline-flex items-center justify-center rounded-md bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#130970] disabled:opacity-50';
export const btnOutline =
  'inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[#4a4a56] shadow-sm hover:bg-[#f7f7fb] disabled:opacity-50';
export const sectionTitle = 'text-base font-semibold text-[#1a1a24] mb-4';
