import { Suspense } from 'react';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { ProductFilters } from '@/components/admin/ProductFilters';
import { ProductCategoryAccordion } from '@/components/admin/ProductCategoryAccordion';
import { CategoryTable } from '@/components/admin/CategoryTable';
import { ProductsSkeleton } from '@/components/admin/ProductsSkeleton';
import type { Product } from '@/components/admin/ProductRow';

interface SearchParams {
  gender?: string; category?: string; search?: string; sort?: string; order?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  hauts: 'Hauts',
  bas: 'Bas',
  robes: 'Robes',
  vestes: 'Vestes & Manteaux',
  chaussures: 'Chaussures',
  accessoires: 'Accessoires',
  sacs: 'Sacs',
  bijoux: 'Bijoux',
  mailles: 'Mailles',
  chemises: 'Chemises',
  pantalons: 'Pantalons',
  pulls: 'Pulls',
  t_shirts: 'T-shirts',
};

const GENDER_CONFIG = {
  femme: { label: 'Femme', emoji: '👗' },
  homme: { label: 'Homme', emoji: '👔' },
} as const;

async function getProducts(params: SearchParams): Promise<Product[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from('products')
    .select('id, name, slug, gender, category_slug, price, compare_at_price, stock, is_new, images, created_at');
  if (params.gender) query = query.eq('gender', params.gender);
  if (params.category) query = query.eq('category_slug', params.category);
  if (params.search) query = query.ilike('name', `%${params.search}%`);
  const validSortFields = ['created_at', 'price', 'stock', 'name'];
  const sortField = validSortFields.includes(params.sort ?? '') ? params.sort! : 'created_at';
  query = query.order(sortField, { ascending: params.order === 'asc' });
  const { data } = await query;
  return (data ?? []) as Product[];
}

interface GenderGroup {
  gender: string; label: string; emoji: string;
  categories: { category: string; label: string; products: Product[] }[];
  totalCount: number;
}

function groupByGenderThenCategory(products: Product[]): GenderGroup[] {
  const genderMap = new Map<string, Product[]>();

  for (const p of products) {
    const g = p.gender || 'autre';
    if (!genderMap.has(g)) genderMap.set(g, []);
    genderMap.get(g)!.push(p);
  }
  const genderOrder = ['femme', 'homme'];
  const sortedGenders = Array.from(genderMap.keys()).sort((a, b) => {
    const ai = genderOrder.indexOf(a);
    const bi = genderOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return sortedGenders.map((gender) => {
    const prods = genderMap.get(gender)!;
    const catMap = new Map<string, Product[]>();
    for (const p of prods) {
      const cat = p.category_slug || 'autres';
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(p);
    }

    const config = GENDER_CONFIG[gender as keyof typeof GENDER_CONFIG];

    return {
      gender,
      label: config?.label ?? gender.charAt(0).toUpperCase() + gender.slice(1),
      emoji: config?.emoji ?? '📦',
      totalCount: prods.length,
      categories: Array.from(catMap.entries()).map(([cat, catProds]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
        products: catProds,
      })),
    };
  });
}

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const products = await getProducts(searchParams);
  const genderGroups = groupByGenderThenCategory(products);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 3).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-newsreader)] text-3xl font-light text-[#1a1510] tracking-tight">
            Produits
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-[family-name:var(--font-montserrat)] text-sm text-[#B89547]/70 tracking-wide">
              {products.length} produit{products.length > 1 ? 's' : ''}
            </span>
            <span className="w-px h-3.5 bg-[#1a1510]/10" />
            <span className="font-[family-name:var(--font-montserrat)] text-sm text-[#1a1510]/40">
              Stock total : {totalStock}
            </span>
            {lowStockCount > 0 && (
              <>
                <span className="w-px h-3.5 bg-[#1a1510]/10" />
                <span className="font-[family-name:var(--font-montserrat)] text-sm text-orange-500">
                  {lowStockCount} en stock bas
                </span>
              </>
            )}
          </div>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-[#1B0B94] text-white hover:bg-[#130970] rounded-lg font-[family-name:var(--font-montserrat)]">
            <Plus className="size-4" />
            Nouveau produit
          </Button>
        </Link>
      </div>

      <ProductFilters />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#B89547]/30 p-16 text-center">
          <Package className="size-10 text-[#B89547]/30 mx-auto mb-3" />
          <p className="font-[family-name:var(--font-montserrat)] text-[#B89547]/60">
            Aucun produit trouve
          </p>
          <p className="font-[family-name:var(--font-montserrat)] text-xs text-[#1a1510]/30 mt-1">
            Modifiez vos filtres ou ajoutez un nouveau produit
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {genderGroups.map((genderGroup) => (
            <section key={genderGroup.gender}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl">{genderGroup.emoji}</span>
                <h3 className="font-[family-name:var(--font-newsreader)] text-2xl font-light text-[#1a1510] tracking-tight">
                  {genderGroup.label}
                </h3>
                <span className="font-[family-name:var(--font-montserrat)] text-[10px] uppercase tracking-[0.12em] text-[#B89547]/70 bg-[#B89547]/10 rounded-full px-2.5 py-0.5">
                  {genderGroup.totalCount} produit{genderGroup.totalCount > 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#B89547]/20 to-transparent" />
              </div>

              <ProductCategoryAccordion
                groups={genderGroup.categories.map((c) => ({
                  category: c.category,
                  label: c.label,
                  count: c.products.length,
                  tableHtml: null,
                }))}
              >
                {genderGroup.categories.map((cat) => (
                  <div key={cat.category} data-category={cat.category}>
                    <CategoryTable products={cat.products} />
                  </div>
                ))}
              </ProductCategoryAccordion>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent searchParams={params} />
    </Suspense>
  );
}
