'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getFavorites, removeFavorite } from '@/lib/adapters/supabase-user';
import { createClient } from '@/lib/supabase/client';

interface FavProduct {
  id: string;
  name: string;
  price: number;
  slug: string;
  gender: string;
  images: string[];
}

export function FavoritesList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<FavProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const ids = await getFavorites(user.id);
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name, price, slug, gender, images')
      .in('id', ids);

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await removeFavorite(user.id, productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-[#f3efe8] rounded w-40 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-[#c4b49c]/15 p-4 animate-pulse">
              <div className="aspect-[3/4] bg-[#f3efe8] rounded-lg mb-3" />
              <div className="h-4 bg-[#f3efe8] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#f3efe8] rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-playfair text-xl text-[#1a1510] mb-6">Mes favoris</h1>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-12 text-center">
          <Heart className="h-12 w-12 text-[#c4b49c]/40 mx-auto mb-4" />
          <h3 className="font-playfair text-lg text-[#1a1510] mb-2">Aucun favori</h3>
          <p className="text-sm text-[#8a7d6b] font-body mb-6">Sauvegardez vos articles preferes ici.</p>
          <Link
            href="/shop/femme"
            className="inline-block px-6 py-3 rounded-lg bg-[#c4a44e] hover:bg-[#b3933d] text-white font-semibold font-body text-sm transition-colors"
          >
            Decouvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm overflow-hidden group">
              <Link href={`/shop/${p.gender}/${p.slug}`}>
                <div className="aspect-[3/4] bg-[#f3efe8] overflow-hidden">
                  {p.images?.[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/shop/${p.gender}/${p.slug}`}>
                  <h3 className="text-sm font-medium text-[#1a1510] font-body hover:text-[#c4a44e] transition-colors">{p.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-[#1a1510] font-body">{p.price.toFixed(2)} &euro;</span>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="p-1.5 text-[#8a7d6b] hover:text-red-500 transition-colors"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
