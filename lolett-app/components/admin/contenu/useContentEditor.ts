'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ContentItem {
  id: string;
  section: string;
  key: string;
  value: string;
  type: 'text' | 'textarea' | 'image' | 'url' | 'video';
  label: string;
  sort_order: number;
}

// Ordre = parcours du site (landing -> pages -> global)
const SECTION_ORDER = [
  'hero',
  'shop',
  'collections',
  'brand_story',
  'looks',
  'testimonials',
  'newsletter',
  'trust_bar',
  'notre_histoire',
  'contact',
  'footer',
];

export const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero / Accueil',
  shop: 'Page Boutique',
  collections: 'Collections',
  brand_story: 'Histoire de marque',
  looks: 'Looks du moment',
  testimonials: 'Témoignages',
  newsletter: 'Newsletter',
  trust_bar: 'Barre de confiance',
  notre_histoire: 'Notre Histoire',
  contact: 'Contact',
  footer: 'Pied de page',
};

export function useContentEditor() {
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

  const sectionKeys = Object.keys(sections).sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a);
    const ib = SECTION_ORDER.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSection(prev => prev === sectionKey ? null : sectionKey);
  };

  const closeHistory = () => setHistoryOpen(false);

  return {
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
  };
}
