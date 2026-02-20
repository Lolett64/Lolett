'use client';

import { useEffect, useState } from 'react';
import { Award, Gift } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { getProfile, getLoyaltyRewards } from '@/lib/adapters/supabase-user';
import type { LoyaltyReward } from '@/types';

export function LoyaltyPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getProfile(user.id),
      getLoyaltyRewards(),
    ]).then(([profile, r]) => {
      setPoints(profile?.loyaltyPoints ?? 0);
      setRewards(r);
      setLoading(false);
    });
  }, [user]);

  const nextReward = rewards.find((r) => r.pointsCost > points);
  const progressPercent = nextReward ? Math.min(100, (points / nextReward.pointsCost) * 100) : 100;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#c4b49c]/15 p-8 animate-pulse">
        <div className="h-6 bg-[#f3efe8] rounded w-48 mb-6" />
        <div className="h-20 bg-[#f3efe8] rounded mb-4" />
        <div className="h-4 bg-[#f3efe8] rounded w-64" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-playfair text-xl text-[#1a1510] mb-6">Programme fidelite</h1>

      {/* Points card */}
      <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="h-6 w-6 text-[#c4a44e]" />
          <span className="text-sm text-[#5a4d3e] font-body">Mes points</span>
        </div>
        <p className="font-playfair text-5xl text-[#c4a44e] mb-2">{points}</p>
        <p className="text-sm text-[#8a7d6b] font-body">
          {nextReward
            ? `Plus que ${nextReward.pointsCost - points} points pour debloquer "${nextReward.name}"`
            : 'Toutes les recompenses sont debloquees !'
          }
        </p>

        {nextReward && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-[#f3efe8] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#c4a44e] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#8a7d6b] font-body">{points} pts</span>
              <span className="text-xs text-[#8a7d6b] font-body">{nextReward.pointsCost} pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="bg-white rounded-xl border border-[#c4b49c]/15 shadow-sm p-6 sm:p-8">
        <h2 className="font-playfair text-lg text-[#1a1510] mb-4">Recompenses disponibles</h2>
        {rewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-10 w-10 text-[#c4b49c]/40 mx-auto mb-3" />
            <p className="text-sm text-[#8a7d6b] font-body">Aucune recompense disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map((r) => {
              const canRedeem = points >= r.pointsCost;
              return (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border border-[#c4b49c]/10 hover:border-[#c4a44e]/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#1a1510] font-body">{r.name}</p>
                    {r.description && <p className="text-xs text-[#8a7d6b] font-body mt-0.5">{r.description}</p>}
                    <p className="text-xs text-[#c4a44e] font-body mt-1">{r.pointsCost} points</p>
                  </div>
                  <button
                    disabled={!canRedeem}
                    className="px-4 py-2 rounded-lg bg-[#c4a44e] hover:bg-[#b3933d] text-white text-xs font-semibold font-body transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Echanger
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
