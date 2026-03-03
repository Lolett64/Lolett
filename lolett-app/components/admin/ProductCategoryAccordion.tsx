'use client';

import { useState, Children, isValidElement, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface GroupMeta {
  category: string;
  label: string;
  count: number;
  tableHtml: null;
}

export function ProductCategoryAccordion({
  groups,
  children,
}: {
  groups: GroupMeta[];
  children: ReactNode;
}) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(groups.map((g) => g.category))
  );

  const toggle = (cat: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const childArray = Children.toArray(children).filter(isValidElement);

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = openCategories.has(group.category);
        const content = childArray.find(
          (child) =>
            isValidElement(child) &&
            (child.props as Record<string, unknown>)['data-category'] === group.category
        );

        return (
          <div
            key={group.category}
            className="rounded-xl border border-gray-200/50 bg-white shadow-none overflow-hidden"
          >
            <button
              onClick={() => toggle(group.category)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#FDF5E6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="font-[family-name:var(--font-montserrat)] text-base font-semibold text-[#1a1510]">{group.label}</h3>
                <span className="inline-flex items-center rounded-full bg-[#B89547]/10 px-2.5 py-0.5 text-xs font-medium text-[#B89547]">
                  {group.count}
                </span>
              </div>
              <ChevronDown
                className={`size-5 text-[#1a1510]/30 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-gray-200/50">{content}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
