'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronUp, ChevronDown, Save, Loader2, Eye, EyeOff, GripVertical } from 'lucide-react';

interface SectionItem {
  id: string;
  page_slug: string;
  section_key: string;
  label: string;
  visible: boolean;
  sort_order: number;
}

const PAGES = [
  { slug: 'home', label: 'Accueil', icon: '🏠' },
  { slug: 'shop', label: 'Boutique', icon: '🛍️' },
  { slug: 'notre-histoire', label: 'Notre Histoire', icon: '📖' },
  { slug: 'contact', label: 'Contact', icon: '✉️' },
];

export function SectionsManager() {
  const [activePage, setActivePage] = useState('home');
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [movedId, setMovedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchSections = useCallback(async (page: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sections?page=${page}`);
      const data = await res.json();
      setSections(data);
      setDirty(false);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections(activePage);
  }, [activePage, fetchSections]);

  const handlePageChange = (slug: string) => {
    setActivePage(slug);
    setSaved(false);
  };

  const toggleVisible = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
    setDirty(true);
  };

  const flashMoved = (id: string) => {
    setMovedId(id);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMovedId(null), 600);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
    flashMoved(sections[index].id);
    setDirty(true);
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
    flashMoved(sections[index].id);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: sections.map(s => ({
            id: s.id,
            visible: s.visible,
            sort_order: s.sort_order,
          })),
        }),
      });
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page selector */}
      <div className="flex gap-2">
        {PAGES.map(page => (
          <button
            key={page.slug}
            onClick={() => handlePageChange(page.slug)}
            className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              activePage === page.slug
                ? 'bg-[#1B0B94] text-white shadow-md shadow-[#1B0B94]/25'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <span className="mr-1.5">{page.icon}</span>
            {page.label}
          </button>
        ))}
      </div>

      {/* Sections list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute left-[27px] top-[36px] w-px bg-gray-200"
            style={{ height: `calc(100% - 72px)` }}
          />

          <div className="space-y-2">
            {sections.map((section, index) => {
              const isFirst = index === 0;
              const isLast = index === sections.length - 1;
              const isMoved = movedId === section.id;

              return (
                <div
                  key={section.id}
                  className={`
                    group relative flex items-center gap-3 rounded-xl border bg-white p-3 pr-4
                    transition-all duration-300 ease-out
                    ${section.visible
                      ? 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                      : 'border-dashed border-gray-200 bg-gray-50/50'
                    }
                    ${isMoved ? 'ring-2 ring-[#B89547]/40 scale-[1.01]' : ''}
                  `}
                >
                  {/* Position number */}
                  <div
                    className={`
                      relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg
                      text-xs font-bold transition-all duration-300
                      ${section.visible
                        ? 'bg-[#1B0B94] text-white'
                        : 'bg-gray-200 text-gray-400'
                      }
                      ${isMoved ? 'bg-[#B89547] text-white scale-110' : ''}
                    `}
                  >
                    {index + 1}
                  </div>

                  {/* Drag indicator */}
                  <GripVertical className="size-4 shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors" />

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate transition-colors duration-200 ${
                      section.visible ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {section.label}
                    </p>
                    <p className={`text-[11px] mt-0.5 truncate transition-colors ${
                      section.visible ? 'text-gray-400' : 'text-gray-300'
                    }`}>
                      {section.section_key}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Arrows */}
                    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={isFirst}
                        className={`
                          flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150
                          ${isFirst
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-white hover:text-[#1B0B94] hover:shadow-sm active:scale-90'
                          }
                        `}
                        title="Monter"
                      >
                        <ChevronUp className="size-4" strokeWidth={2.5} />
                      </button>
                      <div className="w-px h-4 bg-gray-200" />
                      <button
                        onClick={() => moveDown(index)}
                        disabled={isLast}
                        className={`
                          flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150
                          ${isLast
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-white hover:text-[#1B0B94] hover:shadow-sm active:scale-90'
                          }
                        `}
                        title="Descendre"
                      >
                        <ChevronDown className="size-4" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Visibility toggle */}
                    <button
                      onClick={() => toggleVisible(section.id)}
                      className={`
                        flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-200
                        ${section.visible
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200 hover:text-gray-500'
                        }
                      `}
                    >
                      {section.visible ? (
                        <>
                          <Eye className="size-3.5" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="size-3.5" />
                          <span>Masqué</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className={`
        flex items-center gap-3 rounded-xl border p-3 transition-all duration-300
        ${dirty
          ? 'border-[#B89547]/30 bg-[#B89547]/5'
          : saved
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-gray-200 bg-gray-50'
        }
      `}>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`
            inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200
            ${dirty
              ? 'bg-[#1B0B94] text-white hover:bg-[#130970] shadow-md shadow-[#1B0B94]/20'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Enregistrer les modifications
        </button>

        {dirty && !saving && (
          <p className="text-xs text-[#B89547] font-medium">
            Modifications non sauvegardées
          </p>
        )}

        {saved && (
          <p className="text-xs text-emerald-600 font-medium animate-pulse">
            Modifications enregistrées
          </p>
        )}
      </div>
    </div>
  );
}
