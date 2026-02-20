'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getUserReviews, deleteReview } from '@/lib/adapters/supabase-user';
import type { UserReview } from '@/types';

export function ReviewList() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    getUserReviews(user.id).then((r) => {
      setReviews(r);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet avis ?')) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div>
        <div className="h-8 bg-[#f3efe8] rounded w-40 mb-6" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#c4b49c]/15 p-6 animate-pulse mb-4">
            <div className="h-4 bg-[#f3efe8] rounded w-40 mb-3" />
            <div className="h-3 bg-[#f3efe8] rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-playfair text-xl text-[#1a1510] mb-6">Mes avis</h1>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-12 text-center">
          <Star className="h-12 w-12 text-[#c4b49c]/40 mx-auto mb-4" />
          <h3 className="font-playfair text-lg text-[#1a1510] mb-2">Aucun avis</h3>
          <p className="text-sm text-[#8a7d6b] font-body">Vous n&apos;avez pas encore laisse d&apos;avis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.productImage && (
                      <img
                        src={review.productImage}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#1a1510] font-body">{review.productName || 'Produit'}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-[#c4a44e] fill-[#c4a44e]' : 'text-[#c4b49c]/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-[#5a4d3e] font-body mt-2">{review.comment}</p>
                  )}
                  <p className="text-xs text-[#8a7d6b] font-body mt-2">
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 text-[#8a7d6b] hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Supprimer l'avis"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
