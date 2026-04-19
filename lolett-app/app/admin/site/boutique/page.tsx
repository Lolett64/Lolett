'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'shop', label: 'Hero Shop', sectionKey: 'shop' },
  { key: 'trust_bar', label: 'Barre de confiance', sectionKey: 'trust_bar' },
  { key: 'collections', label: 'Collections', sectionKey: 'collections' },
];

export default function AdminBoutiquePage() {
  return (
    <SitePageEditor
      pageTitle="Boutique"
      pageSubtitle="Modifie le contenu de la page boutique"
      previewUrl="/shop"
      tabs={tabs}
    />
  );
}
