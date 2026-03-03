import { Dispatch, SetStateAction } from 'react';
import { Plus, X } from 'lucide-react';
import {
  ProductFormData,
  ProductColor,
  AVAILABLE_SIZES,
  card,
  fieldLabel,
  inputBase,
  btnOutline,
  sectionTitle,
} from './types';

interface ProductFormColorsSectionProps {
  form: ProductFormData;
  setForm: Dispatch<SetStateAction<ProductFormData>>;
  newColor: ProductColor;
  setNewColor: Dispatch<SetStateAction<ProductColor>>;
  onToggleSize: (size: string) => void;
  onAddColor: () => void;
  onRemoveColor: (idx: number) => void;
  onUpdateVariantStock: (colorName: string, size: string, stock: number) => void;
}

export function ProductFormColorsSection({
  form,
  setForm,
  newColor,
  setNewColor,
  onToggleSize,
  onAddColor,
  onRemoveColor,
  onUpdateVariantStock,
}: ProductFormColorsSectionProps) {
  return (
    <div className={card}>
      <h3 className={sectionTitle}>Tailles et couleurs</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Tailles */}
        <div>
          <span className={fieldLabel}>Tailles disponibles</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {AVAILABLE_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onToggleSize(size)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid',
                  borderColor: form.sizes.includes(size) ? '#1B0B94' : '#d1d1dc',
                  background: form.sizes.includes(size) ? '#1B0B94' : 'white',
                  color: form.sizes.includes(size) ? 'white' : '#4a4a56',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Couleurs */}
        <div>
          <span className={fieldLabel}>Couleurs</span>
          {form.colors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {form.colors.map((color, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '9999px',
                    border: '1px solid #e8e8ef',
                    background: '#f7f7fb',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: color.hex, border: '1px solid #d1d1dc', display: 'inline-block' }} />
                  {color.name}
                  <button type="button" onClick={() => onRemoveColor(idx)} style={{ color: '#9999a8', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="color"
              value={newColor.hex}
              onChange={(e) => setNewColor((c) => ({ ...c, hex: e.target.value }))}
              style={{ width: 36, height: 36, borderRadius: '0.375rem', border: '1px solid #d1d1dc', padding: 2, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={newColor.name}
              onChange={(e) => setNewColor((c) => ({ ...c, name: e.target.value }))}
              placeholder="Nom de la couleur (ex: Blanc)"
              className={inputBase}
              style={{ flex: 1 }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddColor(); } }}
            />
            <button type="button" onClick={onAddColor} className={btnOutline} style={{ padding: '0.5rem' }}>
              <Plus style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Stock par variante */}
        {form.variants.length > 0 && (
          <div>
            <span className={fieldLabel}>Stock par variante</span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginTop: '0.5rem',
              padding: '1rem',
              background: '#f7f7fb',
              borderRadius: '0.5rem',
              border: '1px solid #e8e8ef',
            }}>
              {form.variants.map((variant, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: variant.colorHex,
                      border: '1px solid #d1d1dc',
                      display: 'inline-block',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.75rem', color: '#4a4a56', fontWeight: 500 }}>
                      {variant.colorName} - {variant.size}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) => onUpdateVariantStock(
                      variant.colorName,
                      variant.size,
                      parseInt(e.target.value, 10) || 0
                    )}
                    className={inputBase}
                    style={{ fontSize: '0.875rem', padding: '0.375rem 0.5rem' }}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b6b7a', marginTop: '0.5rem' }}>
              Stock total: <strong>{form.stock}</strong> unités
            </p>
          </div>
        )}

        {/* Tags */}
        <div>
          <label htmlFor="tags" className={fieldLabel}>Tags (séparés par des virgules)</label>
          <input
            id="tags"
            type="text"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="été, coton, casual..."
            className={inputBase}
          />
        </div>

        {/* Nouveau */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_new}
            onClick={() => setForm((f) => ({ ...f, is_new: !f.is_new }))}
            style={{
              position: 'relative',
              width: 36,
              height: 20,
              borderRadius: 9999,
              background: form.is_new ? '#1B0B94' : '#d1d1dc',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: form.is_new ? 18 : 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.15s ease',
              }}
            />
          </button>
          <span style={{ fontSize: '0.875rem', color: '#4a4a56', cursor: 'pointer' }} onClick={() => setForm((f) => ({ ...f, is_new: !f.is_new }))}>
            Marquer comme nouveau
          </span>
        </div>
      </div>
    </div>
  );
}
