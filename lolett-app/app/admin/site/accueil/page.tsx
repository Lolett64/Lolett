'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import { SectionsManager } from '@/components/admin/contenu/SectionsManager';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'hero', label: 'Hero', sectionKey: 'hero' },
  { key: 'brand_story', label: 'Notre marque', sectionKey: 'brand_story' },
  { key: 'looks', label: 'Looks', sectionKey: 'looks' },
  { key: 'newsletter', label: 'Newsletter', sectionKey: 'newsletter' },
];

export default function AdminAccueilPage() {
  return (
    <SitePageEditor
      pageTitle="Page d'accueil"
      pageSubtitle="Modifie le contenu de la homepage"
      previewUrl="/"
      tabs={tabs}
      extraTab={<SectionsManager />}
      extraTabLabel="Sections ⚙"
    />
  );
}
