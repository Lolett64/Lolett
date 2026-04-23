import { revalidatePath } from 'next/cache';

// Mapping section CMS → paths publics à invalider
const SECTION_TO_PATHS: Record<string, string[]> = {
  hero: ['/'],
  brand_story: ['/'],
  looks: ['/'],
  new_arrivals: ['/'],
  newsletter: ['/'],
  collections: ['/', '/shop'],
  trust_bar: ['/', '/shop', '/shop/homme', '/shop/femme', '/panier', '/contact', '/notre-histoire'],
  footer: ['/', '/shop', '/shop/homme', '/shop/femme', '/panier', '/contact', '/notre-histoire', '/cgv', '/confidentialite'],
  shop: ['/shop'],
  shop_homme: ['/shop/homme'],
  shop_femme: ['/shop/femme'],
  contact: ['/contact'],
  notre_histoire: ['/notre-histoire'],
  looks_page: ['/looks'],
  nouveautes: ['/nouveautes'],
};

// Revalidate all public paths impacted by the edited CMS sections
export function revalidateSectionPaths(sections: Iterable<string>): string[] {
  const paths = new Set<string>();
  for (const section of sections) {
    for (const path of SECTION_TO_PATHS[section] ?? ['/']) {
      paths.add(path);
    }
  }
  for (const path of paths) {
    revalidatePath(path);
  }
  return [...paths];
}
