'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig } from '@/components/admin/site/SitePageEditor';

const tabs: TabConfig[] = [
  { key: 'notre_histoire', label: 'Contenu', sectionKey: 'notre_histoire' },
  { key: 'testimonials', label: 'Témoignages', sectionKey: 'testimonials' },
];

export default function AdminNotreHistoirePage() {
  return (
    <SitePageEditor
      pageTitle="Notre histoire"
      pageSubtitle="Modifie la page à propos de LOLETT"
      previewUrl="/notre-histoire"
      tabs={tabs}
    />
  );
}
