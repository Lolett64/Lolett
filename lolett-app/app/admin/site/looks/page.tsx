'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'looks_page', label: 'Hero', sectionKey: 'looks_page' },
];

export default function AdminLooksPage() {
  return (
    <SitePageEditor
      pageTitle="Looks"
      pageSubtitle="Modifie le contenu de la page looks"
      previewUrl="/looks"
      tabs={tabs}
    />
  );
}
