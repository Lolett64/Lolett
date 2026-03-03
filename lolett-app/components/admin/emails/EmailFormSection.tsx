'use client';

import { Save, Send, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { EmailSettings, FormData } from './types';
import { VARIABLES_BY_TEMPLATE } from './types';

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

interface EmailFormSectionProps {
  selected: EmailSettings;
  formData: FormData;
  saving: boolean;
  isDirty: boolean | '' | null;
  onUpdateField: (key: keyof FormData, value: string) => void;
  onUpdateExtraParam: (key: string, value: string | number) => void;
  onSave: () => void;
  onOpenTestModal: () => void;
  onOpenHistory: () => void;
}

export function EmailFormSection({
  selected,
  formData,
  saving,
  isDirty,
  onUpdateField,
  onUpdateExtraParam,
  onSave,
  onOpenTestModal,
  onOpenHistory,
}: EmailFormSectionProps) {
  const variables = VARIABLES_BY_TEMPLATE[selected.template_key] ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 space-y-4">
        <Field label="Nom exp\u00e9diteur" value={formData.from_name} onChange={(v) => onUpdateField('from_name', v)} />
        <Field label="Email exp\u00e9diteur" value={formData.from_email} onChange={(v) => onUpdateField('from_email', v)} />
        <Field
          label="Sujet"
          value={formData.subject_template}
          onChange={(v) => onUpdateField('subject_template', v)}
          hint="Variables : {orderNumber}, {firstName}"
        />
        <Field label="Salutation" value={formData.greeting} onChange={(v) => onUpdateField('greeting', v)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texte principal</label>
          <textarea
            value={formData.body_text}
            onChange={(e) => onUpdateField('body_text', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1B0B94] focus:ring-1 focus:ring-[#1B0B94] outline-none transition-colors"
          />
        </div>
        <Field label="Texte du bouton" value={formData.cta_text} onChange={(v) => onUpdateField('cta_text', v)} />
        <Field label="URL du bouton" value={formData.cta_url} onChange={(v) => onUpdateField('cta_url', v)} />
        <Field label="Signature" value={formData.signoff} onChange={(v) => onUpdateField('signoff', v)} />

        {selected.template_key === 'welcome_newsletter' && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Param&egrave;tres bonus</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">R&eacute;duction (%)</label>
              <Input
                type="number"
                value={(formData.extra_params?.discount_percent as number) ?? ''}
                onChange={(e) => onUpdateExtraParam('discount_percent', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dur&eacute;e promo (jours)</label>
              <Input
                type="number"
                value={(formData.extra_params?.promo_duration_days as number) ?? ''}
                onChange={(e) => onUpdateExtraParam('promo_duration_days', Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {variables.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
          <p className="text-xs font-medium text-blue-700 mb-1">Variables disponibles</p>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v) => (
              <code key={v} className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800">
                {v}
              </code>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-2 rounded-lg bg-[#1B0B94] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#130970] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Enregistrer
        </button>
        <button
          onClick={onOpenTestModal}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Send className="size-4" />
          Envoyer un test
        </button>
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          title="Historique"
        >
          <Clock className="size-4" />
        </button>
      </div>
    </div>
  );
}
