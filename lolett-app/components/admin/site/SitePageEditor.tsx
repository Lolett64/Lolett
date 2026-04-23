'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Check } from 'lucide-react';
import { PreviewButton } from './PreviewButton';
import { FieldWithScreenshot } from './FieldWithScreenshot';
import type { SiteContentItem } from '@/lib/cms/content';

export interface TabConfig {
  key: string;
  label: string;
  sectionKey: string;  // CMS section to load for this tab
  fields?: FieldConfig[]; // If provided, only show these fields (by key). If omitted, show all fields from the section.
}

export interface FieldConfig {
  name: string;
  label?: string;       // Override the DB label
  type?: 'text' | 'textarea' | 'url' | 'image' | 'video';
  screenshotSrc?: string;
  placeholder?: string;
}

interface SitePageEditorProps {
  pageTitle: string;
  pageSubtitle: string;
  previewUrl: string;
  tabs: TabConfig[];
  extraTab?: React.ReactNode;
  extraTabLabel?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function SitePageEditor({
  pageTitle,
  pageSubtitle,
  previewUrl,
  tabs,
  extraTab,
  extraTabLabel,
}: SitePageEditorProps) {
  // Content keyed by "sectionKey::fieldKey" to avoid collisions across sections
  const [content, setContent] = useState<Record<string, string>>({});
  const [allItems, setAllItems] = useState<SiteContentItem[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? '');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Collect all unique section keys from tabs
  const sectionKeys = [...new Set(tabs.map((t) => t.sectionKey))];

  // Load content on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/content`);
        if (!res.ok) return;
        const grouped: Record<string, SiteContentItem[]> = await res.json();
        const collected: SiteContentItem[] = [];
        const kv: Record<string, string> = {};
        for (const sk of sectionKeys) {
          const sectionItems = grouped[sk] ?? [];
          collected.push(...sectionItems);
          for (const item of sectionItems) {
            kv[`${item.section}::${item.key}`] = item.value;
          }
        }
        setAllItems(collected);
        setContent(kv);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldChange = useCallback((compositeKey: string, value: string) => {
    setContent((prev) => ({ ...prev, [compositeKey]: value }));
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const updates: { id: string; value: string }[] = [];
      for (const item of allItems) {
        const ck = `${item.section}::${item.key}`;
        const newValue = content[ck];
        if (newValue !== undefined && newValue !== item.value) {
          updates.push({ id: item.id, value: newValue });
        }
      }

      if (updates.length === 0) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        return;
      }

      const res = await fetch('/api/admin/content/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates }),
      });

      if (!res.ok) {
        setSaveStatus('error');
        return;
      }

      setAllItems((prev) =>
        prev.map((item) => {
          const ck = `${item.section}::${item.key}`;
          const newVal = content[ck];
          return newVal !== undefined ? { ...item, value: newVal } : item;
        })
      );
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch {
      setSaveStatus('error');
    }
  }, [content, allItems]);

  // Determine all tab keys including the extra tab
  const allTabs = [
    ...tabs.map((t) => ({ key: t.key, label: t.label })),
    ...(extraTab && extraTabLabel
      ? [{ key: '__extra__', label: extraTabLabel }]
      : []),
  ];

  const activeTabConfig = tabs.find((t) => t.key === activeTab);
  const isExtraTab = activeTab === '__extra__';

  // Get fields for the active tab: either explicit fields or all from the section
  const activeFields = activeTabConfig
    ? activeTabConfig.fields && activeTabConfig.fields.length > 0
      ? activeTabConfig.fields.map((f) => {
          const item = allItems.find((i) => i.section === activeTabConfig.sectionKey && i.key === f.name);
          return {
            compositeKey: `${activeTabConfig.sectionKey}::${f.name}`,
            label: f.label || item?.label || f.name,
            type: f.type || item?.type || 'text',
            screenshotSrc: f.screenshotSrc,
            placeholder: f.placeholder,
          };
        })
      : allItems
          .filter((i) => i.section === activeTabConfig.sectionKey)
          .map((item) => ({
            compositeKey: `${item.section}::${item.key}`,
            label: item.label,
            type: item.type,
            screenshotSrc: undefined as string | undefined,
            placeholder: undefined as string | undefined,
          }))
    : [];

  // Relative time helper
  function timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "a l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `il y a ${hours}h`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[#1B0B94]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#2c2420]">{pageTitle}</h1>
          <p className="text-sm text-[#8b7e74] mt-0.5">{pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <PreviewButton url={previewUrl} />
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="bg-[#C4956A] hover:bg-[#b3845c] disabled:opacity-60 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sauvegarde...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="size-4" />
                Sauvegardé
              </>
            ) : (
              'Sauvegarder'
            )}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      {allTabs.length > 1 && (
        <div className="flex border-b border-[#e8e0d6]">
          {allTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#1B0B94] border-b-2 border-[#1B0B94]'
                  : 'text-[#8b7e74] hover:text-[#2c2420]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="bg-white rounded-xl border border-[#e8e0d6] p-6">
        {isExtraTab && extraTab ? (
          extraTab
        ) : activeFields.length > 0 ? (
          <div className="space-y-5">
            {activeFields.map((field) => (
              <FieldWithScreenshot
                key={field.compositeKey}
                name={field.compositeKey}
                label={field.label}
                type={field.type}
                value={content[field.compositeKey] ?? ''}
                onChange={(val) => handleFieldChange(field.compositeKey, val)}
                screenshotSrc={field.screenshotSrc}
                placeholder={field.placeholder}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8b7e74] text-center py-8">Aucun champ dans cette section.</p>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between text-xs text-[#8b7e74] px-1">
        <span>
          {lastSaved
            ? `Dernière modification ${timeAgo(lastSaved)}`
            : 'Aucune modification'}
        </span>
        <span className="flex items-center gap-1.5">
          {saveStatus === 'saved' && (
            <>
              <span className="inline-block size-2 rounded-full bg-green-500" />
              Sauvegardé
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <span className="inline-block size-2 rounded-full bg-red-500" />
              Erreur de sauvegarde
            </>
          )}
        </span>
      </div>
    </div>
  );
}
