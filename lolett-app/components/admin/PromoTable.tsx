'use client';

import { card } from './PromoForm';

export type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
};

interface PromoTableProps {
  promos: PromoCode[];
  loading: boolean;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

export function PromoTable({ promos, loading, onToggleActive, onDelete }: PromoTableProps) {
  return (
    <div className={card}>
      {loading ? (
        <p className="text-[#1a1510]/40 text-center p-6">Chargement...</p>
      ) : promos.length === 0 ? (
        <p className="text-[#1a1510]/40 text-center p-6">Aucun code promo</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-3 py-2 font-semibold text-[#1a1510]">Code</th>
              <th className="px-3 py-2 font-semibold text-[#1a1510]">Réduction</th>
              <th className="px-3 py-2 font-semibold text-[#1a1510]">Min.</th>
              <th className="px-3 py-2 font-semibold text-[#1a1510]">Utilisations</th>
              <th className="px-3 py-2 font-semibold text-[#1a1510]">Statut</th>
              <th className="px-3 py-2 font-semibold text-[#1a1510]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => {
              const isExpired = !!(p.expires_at && new Date(p.expires_at) < new Date());
              const isExhausted = !!(p.usage_limit && p.used_count >= p.usage_limit);
              const isLocked = isExpired || isExhausted;
              return (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-3 py-2.5">
                    <span className={`font-mono font-bold tracking-wider ${isLocked ? 'text-[#1a1510]/40 line-through' : ''}`}>{p.code}</span>
                    {p.description && <span className="block text-xs text-[#1a1510]/40">{p.description}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {p.type === 'percentage' ? `${p.value}%` : `${p.value} €`}
                  </td>
                  <td className="px-3 py-2.5">
                    {p.min_order > 0 ? `${p.min_order} €` : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    {p.used_count}{p.usage_limit ? ` / ${p.usage_limit}` : ''}
                  </td>
                  <td className="px-3 py-2.5">
                    {isExpired ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">Expiré</span>
                    ) : isExhausted ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">Épuisé</span>
                    ) : p.active ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">Actif</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">Inactif</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onToggleActive(p.id, p.active)}
                        disabled={isLocked}
                        title={isLocked ? (isExpired ? 'Code expiré — toggle indisponible' : 'Code épuisé — toggle indisponible') : undefined}
                        className="text-xs text-[#1B0B94] underline bg-transparent border-none cursor-pointer hover:text-[#130970] transition-colors disabled:text-[#1a1510]/30 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {p.active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="text-xs text-red-500 underline bg-transparent border-none cursor-pointer hover:text-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
