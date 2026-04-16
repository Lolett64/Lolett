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
        <p style={{ color: '#9999a8', textAlign: 'center', padding: 24 }}>Chargement...</p>
      ) : promos.length === 0 ? (
        <p style={{ color: '#9999a8', textAlign: 'center', padding: 24 }}>Aucun code promo</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e5ea', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Code</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Réduction</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Min.</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Utilisations</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Statut</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: '#4a4a56' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => {
              const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
              const isExhausted = p.usage_limit && p.used_count >= p.usage_limit;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f5' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{p.code}</span>
                    {p.description && <span style={{ display: 'block', fontSize: 12, color: '#9999a8' }}>{p.description}</span>}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {p.type === 'percentage' ? `${p.value}%` : `${p.value} €`}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {p.min_order > 0 ? `${p.min_order} €` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {p.used_count}{p.usage_limit ? ` / ${p.usage_limit}` : ''}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {isExpired ? (
                      <span style={{ color: '#999', fontSize: 12, fontWeight: 500 }}>Expiré</span>
                    ) : isExhausted ? (
                      <span style={{ color: '#e74c3c', fontSize: 12, fontWeight: 500 }}>Épuisé</span>
                    ) : p.active ? (
                      <span style={{ color: '#27ae60', fontSize: 12, fontWeight: 500 }}>Actif</span>
                    ) : (
                      <span style={{ color: '#999', fontSize: 12, fontWeight: 500 }}>Inactif</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => onToggleActive(p.id, p.active)}
                        style={{ fontSize: 12, color: '#1B0B94', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {p.active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        style={{ fontSize: 12, color: '#e74c3c', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
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
