import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="flex items-center gap-1 text-sm text-lolett-gray-500 hover:text-lolett-gray-900"
        >
          <ChevronLeft className="size-4" />
          Produits
        </Link>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-lolett-gray-900">Nouveau produit</h2>
        <p className="text-sm text-lolett-gray-500 mt-1">Renseigner les informations du produit</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
