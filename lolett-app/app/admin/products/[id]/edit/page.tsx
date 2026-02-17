import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductForm } from '@/components/admin/ProductForm';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  gender: string;
  category_slug: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  is_new: boolean;
  tags: string[];
  images: string[];
}

async function getProduct(id: string): Promise<ProductRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  return data as ProductRow | null;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const initialData = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price),
    gender: product.gender,
    category_slug: product.category_slug,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    stock: String(product.stock),
    is_new: product.is_new,
    tags: (product.tags ?? []).join(', '),
    images: product.images ?? [],
  };

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
        <h2 className="text-2xl font-bold text-lolett-gray-900">Modifier le produit</h2>
        <p className="text-sm text-lolett-gray-500 mt-1">{product.name}</p>
      </div>
      <ProductForm mode="edit" productId={id} initialData={initialData} />
    </div>
  );
}
