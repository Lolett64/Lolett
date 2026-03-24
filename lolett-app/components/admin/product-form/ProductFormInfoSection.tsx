import { Dispatch, SetStateAction } from 'react';
import {
  ProductFormData,
  CATEGORIES_BY_GENDER,
  card,
  fieldLabel,
  inputBase,
  selectBase,
  sectionTitle,
} from './types';

interface ProductFormInfoSectionProps {
  form: ProductFormData;
  setForm: Dispatch<SetStateAction<ProductFormData>>;
  onNameChange: (name: string) => void;
}

export function ProductFormInfoSection({ form, setForm, onNameChange }: ProductFormInfoSectionProps) {
  const categories = CATEGORIES_BY_GENDER[form.gender] ?? [];

  return (
    <div className={card}>
      <h3 className={sectionTitle}>Informations générales</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Nom */}
        <div>
          <label htmlFor="name" className={fieldLabel}>Nom *</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nom du produit"
            required
            className={inputBase}
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className={fieldLabel}>Slug</label>
          <input
            id="slug"
            type="text"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="slug-du-produit"
            className={inputBase}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={fieldLabel}>Description *</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description du produit..."
            rows={4}
            required
            className={inputBase}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* Prix + Soldes + Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="price" className={fieldLabel}>Prix original (€) *</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
              required
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor="stock" className={fieldLabel}>Stock total (auto)</label>
            <input
              id="stock"
              type="number"
              min="0"
              value={form.stock}
              readOnly
              className={inputBase}
              style={{ background: '#f7f7fb', cursor: 'not-allowed' }}
              title="Le stock total est calculé automatiquement à partir des variantes"
            />
          </div>
        </div>

        {/* Prix soldé */}
        {form.price && parseFloat(form.price) > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16 }}>
            <label className={fieldLabel} style={{ color: '#dc2626', marginBottom: 8, display: 'block' }}>
              Prix soldé
              {form.compare_at_price && parseFloat(form.compare_at_price) > 0 && (
                <span style={{ fontWeight: 400, marginLeft: 8 }}>
                  (le client verra <strong>{form.compare_at_price} €</strong> barré → <strong style={{ color: '#dc2626' }}>{form.price} €</strong>)
                </span>
              )}
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Réduction (%)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[10, 20, 30, 40, 50].map(pct => {
                    const originalPrice = form.compare_at_price && parseFloat(form.compare_at_price) > 0
                      ? parseFloat(form.compare_at_price)
                      : parseFloat(form.price);
                    const isActive = form.compare_at_price && parseFloat(form.compare_at_price) > 0
                      && Math.round((1 - parseFloat(form.price) / parseFloat(form.compare_at_price)) * 100) === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const original = parseFloat(form.price);
                          if (form.compare_at_price && parseFloat(form.compare_at_price) > 0) {
                            // Already on sale: recalculate from original (compare_at_price)
                            const base = parseFloat(form.compare_at_price);
                            const newPrice = Math.round(base * (1 - pct / 100) * 100) / 100;
                            setForm(f => ({ ...f, price: String(newPrice) }));
                          } else {
                            // Not on sale: set compare_at_price to current price, reduce price
                            const newPrice = Math.round(original * (1 - pct / 100) * 100) / 100;
                            setForm(f => ({ ...f, compare_at_price: String(original), price: String(newPrice) }));
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: isActive ? '2px solid #dc2626' : '1px solid #d1d5db',
                          background: isActive ? '#fef2f2' : 'white',
                          color: isActive ? '#dc2626' : '#374151',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        -{pct}%
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ width: 140 }}>
                <label style={{ fontSize: 12, color: '#6b7280', marginBottom: 4, display: 'block' }}>Prix soldé (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compare_at_price && parseFloat(form.compare_at_price) > 0 ? form.price : ''}
                  onChange={(e) => {
                    const salePrice = e.target.value;
                    if (!salePrice || parseFloat(salePrice) <= 0) {
                      // Remove sale
                      if (form.compare_at_price && parseFloat(form.compare_at_price) > 0) {
                        setForm(f => ({ ...f, price: f.compare_at_price, compare_at_price: '' }));
                      }
                    } else {
                      const original = form.compare_at_price && parseFloat(form.compare_at_price) > 0
                        ? form.compare_at_price
                        : form.price;
                      setForm(f => ({
                        ...f,
                        compare_at_price: original,
                        price: salePrice,
                      }));
                    }
                  }}
                  placeholder="Laisser vide = pas de solde"
                  className={inputBase}
                  style={{ borderColor: '#fecaca' }}
                />
              </div>
              {form.compare_at_price && parseFloat(form.compare_at_price) > 0 && (
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, price: f.compare_at_price, compare_at_price: '' }))}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: 'white',
                    fontSize: 13,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Retirer solde
                </button>
              )}
            </div>
          </div>
        )}

        {/* Genre + Catégorie */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className={fieldLabel}>Genre *</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value, category_slug: '' }))}
              required
              className={selectBase}
            >
              <option value="">Choisir...</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Catégorie *</label>
            <select
              value={form.category_slug}
              onChange={(e) => setForm((f) => ({ ...f, category_slug: e.target.value }))}
              disabled={!form.gender}
              className={selectBase}
            >
              <option value="">Choisir...</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
