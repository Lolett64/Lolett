import { Suspense } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  gender: string;
  slug: string;
  label: string;
  seo_title: string;
  seo_description: string;
}

async function getCategories(): Promise<Category[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .order('gender')
    .order('label');
  return (data ?? []) as Category[];
}

async function CategoriesContent() {
  const categories = await getCategories();

  const homme = categories.filter((c) => c.gender === 'homme');
  const femme = categories.filter((c) => c.gender === 'femme');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-lolett-gray-900">Catégories</h2>
        <p className="text-sm text-lolett-gray-500 mt-1">
          {categories.length} catégorie(s) · lecture seule pour le MVP
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[
          { label: 'Homme', items: homme },
          { label: 'Femme', items: femme },
        ].map(({ label, items }) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {label}
                <Badge variant="outline" className="text-xs font-normal">
                  {items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-0">
              {items.length === 0 ? (
                <p className="text-sm text-lolett-gray-400 py-2">Aucune catégorie</p>
              ) : (
                items.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className={`flex flex-col gap-1 py-3 ${idx > 0 ? 'border-t border-lolett-gray-100' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lolett-gray-900 text-sm">{cat.label}</span>
                      <Badge variant="outline" className="text-xs font-mono">{cat.slug}</Badge>
                    </div>
                    {cat.seo_title && (
                      <p className="text-xs text-lolett-gray-500">SEO : {cat.seo_title}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-lolett-gray-400">
        Les catégories sont gérées directement en base de données. Une interface d&apos;édition sera ajoutée dans une prochaine version.
      </p>
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="h-48 rounded-xl bg-lolett-gray-200 animate-pulse" />}>
      <CategoriesContent />
    </Suspense>
  );
}
