'use client';

import { SitePageEditor } from '@/components/admin/site/SitePageEditor';
import type { TabConfig, FieldConfig } from '@/components/admin/site/SitePageEditor';
import { MaterialsManager } from '@/components/admin/MaterialsManager';

const fields: FieldConfig[] = [
  { name: 'hero_title', label: 'Hero — titre' },
  { name: 'lola_intro', label: 'Lola — phrase d’accroche', type: 'textarea' },
  { name: 'lola_text1', label: 'Lola — paragraphe 1', type: 'textarea' },
  { name: 'lola_text2', label: 'Lola — paragraphe 2', type: 'textarea' },
  { name: 'lola_text3', label: 'Lola — paragraphe 3', type: 'textarea' },
  { name: 'lola_closing', label: 'Lola — conclusion', type: 'textarea' },
  { name: 'lola_merci', label: 'Lola — remerciement' },
  { name: 'founder_image', label: 'Photo fondatrice', type: 'image' },
  { name: 'origine_label', label: 'Origine — sur-titre' },
  { name: 'origine_title', label: 'Origine — titre' },
  { name: 'origine_text1', label: 'Origine — paragraphe 1', type: 'textarea' },
  { name: 'origine_quote', label: 'Origine — citation', type: 'textarea' },
  { name: 'origine_text2', label: 'Origine — paragraphe 2', type: 'textarea' },
  { name: 'vision_title', label: 'Vision — titre', type: 'textarea' },
];

const tabs: TabConfig[] = [
  { key: 'notre_histoire', label: 'Contenu', sectionKey: 'notre_histoire', fields },
];

export default function AdminNotreHistoirePage() {
  return (
    <SitePageEditor
      pageTitle="Notre histoire"
      pageSubtitle="Modifie la page à propos de LOLETT"
      previewUrl="/notre-histoire"
      tabs={tabs}
      extraTabLabel="Matières"
      extraTab={<MaterialsManager />}
    />
  );
}
