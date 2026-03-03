'use client';

import { ChevronDown, Clock, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ContentImageUpload } from '@/components/admin/ContentImageUpload';
import { ContentVideoUpload } from '@/components/admin/ContentVideoUpload';
import { HistoryDrawer } from '@/components/admin/HistoryDrawer';
import { useContentEditor, SECTION_LABELS } from '@/components/admin/contenu/useContentEditor';

export default function AdminContenuPage() {
  const {
    sections,
    loading,
    openSection,
    saving,
    saved,
    historyOpen,
    historyRecordId,
    sectionKeys,
    handleFieldChange,
    getDisplayValue,
    isSectionDirty,
    handleSave,
    openHistory,
    toggleSection,
    closeHistory,
    fetchContent,
  } = useContentEditor();

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
              onClick={() => toggleSection(sectionKey)}
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
                      <ContentVideoUpload
                        label={item.label}
                        value={getDisplayValue(item)}
                        onChange={(url) => handleFieldChange(item.id, url)}
                      />
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
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1B0B94] px-4 py-2 text-sm font-medium text-white hover:bg-[#130970] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        onClose={closeHistory}
        tableName="site_content"
        recordId={historyRecordId}
        onRestore={() => { fetchContent(); }}
      />
    </div>
  );
}
