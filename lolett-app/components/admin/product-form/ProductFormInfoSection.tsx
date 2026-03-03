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

        {/* Prix + Stock */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="price" className={fieldLabel}>Prix (€) *</label>
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
            <label htmlFor="stock" className={fieldLabel}>Stock total (calculé automatiquement)</label>
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
