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
  variants?: Array<{
    colorName: string;
    colorHex: string;
    size: string;
    stock: number;
  }>;
}

async function getProduct(id: string): Promise<ProductRow | null> {
  // Utiliser l'API pour charger le produit avec ses variantes
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/admin/products/${id}`, {
      cache: 'no-store',
      headers: {
        'Cookie': `admin-auth=${process.env.ADMIN_AUTH_COOKIE || ''}`,
      },
    });
    
    if (!response.ok) return null;
    
    const { product } = await response.json();
    return product as ProductRow;
  } catch {
    // Fallback: charger depuis Supabase directement
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (!data) return null;
    
    // Charger les variantes
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id);
    
    return {
      ...data,
      variants: variants?.map((v) => ({
        colorName: v.color_name,
        colorHex: v.color_hex,
        size: v.size,
        stock: v.stock,
      })) ?? [],
    } as ProductRow;
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  // Générer les variantes initiales pour le formulaire
  const generateInitialVariants = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants;
    }
    // Si pas de variantes, générer depuis couleurs/tailles
    const variants: Array<{ colorName: string; colorHex: string; size: string; stock: number }> = [];
    (product.colors ?? []).forEach((color) => {
      (product.sizes ?? []).forEach((size) => {
        variants.push({
          colorName: color.name,
          colorHex: color.hex,
          size,
          stock: 0,
        });
      });
    });
    return variants;
  };

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
    variants: generateInitialVariants(),
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
