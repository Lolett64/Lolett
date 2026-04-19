'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'footer', label: 'Contenu', sectionKey: 'footer' },
];

export default function AdminFooterPage() {
  return (
    <SitePageEditor
      pageTitle="Footer"
      pageSubtitle="Modifie le pied de page du site"
      previewUrl="/"
      tabs={tabs}
    />
  );
}
