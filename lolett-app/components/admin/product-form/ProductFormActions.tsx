import { btnPrimary, btnOutline } from './types';

interface ProductFormActionsProps {
  saving: boolean;
  uploading: boolean;
  mode: 'create' | 'edit';
  error: string;
  onCancel: () => void;
}

export function ProductFormActions({ saving, uploading, mode, error, onCancel }: ProductFormActionsProps) {
  return (
    <>
      {/* ── Erreur ───────────────────────────────────── */}
      {error && (
        <div style={{ borderRadius: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', fontSize: '0.875rem', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button type="submit" disabled={saving || uploading} className={btnPrimary}>
          {saving ? 'Enregistrement...' : mode === 'create' ? 'Créer le produit' : 'Mettre à jour'}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className={btnOutline}>
          Annuler
        </button>
      </div>
    </>
  );
}
