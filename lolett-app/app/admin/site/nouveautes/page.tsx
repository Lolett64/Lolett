'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'nouveautes', label: 'Hero', sectionKey: 'nouveautes' },
];

export default function AdminNouveautesPage() {
  return (
    <SitePageEditor
      pageTitle="Nouveautés"
      pageSubtitle="Modifie le contenu de la page nouveautés"
      previewUrl="/nouveautes"
      tabs={tabs}
    />
  );
}
