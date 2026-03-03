import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Link
          href="/admin/products"
          className="font-[family-name:var(--font-montserrat)] flex items-center gap-1.5 text-sm text-[#1a1510]/40 hover:text-[#B89547] transition-colors"
        >
          <ChevronLeft className="size-4" />
          Produits
        </Link>
        <div>
          <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">Nouveau produit</h2>
          <p className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 mt-1.5 tracking-wide">Renseigner les informations du produit</p>
        </div>
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
