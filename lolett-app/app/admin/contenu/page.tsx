'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Clock, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ContentImageUpload } from '@/components/admin/ContentImageUpload';
import { HistoryDrawer } from '@/components/admin/HistoryDrawer';

interface ContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'video';
  label: string;
  sort_order: number;
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero / Accueil',
  collections: 'Collections',
  brand_story: 'Histoire de marque',
  newsletter: 'Newsletter',
  trust_bar: 'Barre de confiance',
  contact: 'Contact',
  footer: 'Pied de page',
  notre_histoire: 'Notre Histoire',
};

export default function AdminContenuPage() {
  const [sections, setSections] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  // History drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecordId, setHistoryRecordId] = useState('');

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      setSections(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleFieldChange = (itemId: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [itemId]: value }));
  };

  const getDisplayValue = (item: ContentItem) => {
    return editedValues[item.id] !== undefined ? editedValues[item.id] : item.value;
  };

  const isSectionDirty = (sectionKey: string) => {
    const items = sections[sectionKey] ?? [];
    return items.some(item => editedValues[item.id] !== undefined && editedValues[item.id] !== item.value);
  };

  const handleSave = async (sectionKey: string) => {
    const items = sections[sectionKey] ?? [];
    const changed = items
      .filter(item => editedValues[item.id] !== undefined && editedValues[item.id] !== item.value)
      .map(item => ({ id: item.id, value: editedValues[item.id] }));

    if (changed.length === 0) return;

    setSaving(sectionKey);
    try {
      await fetch('/api/admin/content/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: changed }),
      });

      // Update local state
      setSections(prev => {
        const updated = { ...prev };
        updated[sectionKey] = updated[sectionKey].map(item => {
          if (editedValues[item.id] !== undefined) {
            return { ...item, value: editedValues[item.id] };
          }
          return item;
        });
        return updated;
      });

      // Clear edited values for this section
      const sectionItemIds = items.map(i => i.id);
      setEditedValues(prev => {
        const next = { ...prev };
        sectionItemIds.forEach(id => delete next[id]);
        return next;
      });

      setSaved(sectionKey);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  };

  const openHistory = (sectionKey: string) => {
    const items = sections[sectionKey];
    if (items?.[0]) {
      setHistoryRecordId(items[0].id);
      setHistoryOpen(true);
    }
  };

  const sectionKeys = Object.keys(sections);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-gray-900">Contenu du site</h1>
        <p className="mt-1 text-sm text-gray-500">
          Modifiez les textes, images et medias de votre site
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white border border-gray-200" />
          ))}
        </div>
      )}

      {/* Sections accordion */}
      {!loading && sectionKeys.map(sectionKey => {
        const items = sections[sectionKey];
        const isOpen = openSection === sectionKey;
        const dirty = isSectionDirty(sectionKey);
        const label = SECTION_LABELS[sectionKey] || sectionKey;

        return (
          <div key={sectionKey} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Section header */}
            <button
              onClick={() => setOpenSection(isOpen ? null : sectionKey)}
              className="flex w-full items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-gray-900">{label}</h2>
                {dirty && (
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                    Modifie
                  </span>
                )}
                {saved === sectionKey && (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 animate-pulse">
                    Sauvegarde
                  </span>
                )}
              </div>
              <ChevronDown
                className={`size-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Section content */}
            {isOpen && (
              <div className="border-t border-gray-200 p-6 space-y-5">
                {items.map(item => (
                  <div key={item.id}>
                    {item.type === 'text' && (
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                        <Input
                          value={getDisplayValue(item)}
                          onChange={(e) => handleFieldChange(item.id, e.target.value)}
                        />
                      </div>
                    )}

                    {item.type === 'textarea' && (
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                        <textarea
                          rows={4}
                          value={getDisplayValue(item)}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange(item.id, e.target.value)}
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    )}

                    {item.type === 'image' && (
                      <ContentImageUpload
                        label={item.label}
                        value={getDisplayValue(item)}
                        onChange={(url) => handleFieldChange(item.id, url)}
                      />
                    )}

                    {item.type === 'video' && (
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">{item.label}</label>
                        <Input
                          value={getDisplayValue(item)}
                          onChange={(e) => handleFieldChange(item.id, e.target.value)}
                        />
                        <p className="text-xs text-gray-400">Chemin video</p>
                      </div>
                    )}

                    {item.type === 'url' && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <LinkIcon className="size-3.5" />
                          {item.label}
                        </label>
                        <Input
                          value={getDisplayValue(item)}
                          onChange={(e) => handleFieldChange(item.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleSave(sectionKey)}
                    disabled={!dirty || saving === sectionKey}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2418a6] px-4 py-2 text-sm font-medium text-white hover:bg-[#1c1285] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving === sectionKey ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Enregistrer
                  </button>

                  <button
                    onClick={() => openHistory(sectionKey)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Clock className="size-4" />
                    Historique
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* History Drawer */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        tableName="site_content"
        recordId={historyRecordId}
        onRestore={() => { fetchContent(); }}
      />
    </div>
  );
}
