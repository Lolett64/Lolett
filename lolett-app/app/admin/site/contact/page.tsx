'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'contact', label: 'Contenu', sectionKey: 'contact' },
];

export default function AdminContactPage() {
  return (
    <SitePageEditor
      pageTitle="Contact"
      pageSubtitle="Modifie la page de contact et la FAQ"
      previewUrl="/contact"
      tabs={tabs}
    />
  );
}
