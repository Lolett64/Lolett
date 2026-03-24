/**
 * Seed script — real products from wetransfer photos
 *
 * Usage (from the lolett-app directory):
 *   npx tsx --env-file=.env.local scripts/seed-products.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run: npx tsx --env-file=.env.local scripts/seed-products.ts'
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Categories ──────────────────────────────────────────────────────────────

const categories = [
  { gender: 'homme', slug: 'hauts', label: 'Hauts', seo_title: 'Hauts Homme — LOLETT', seo_description: 'T-shirts, sweats et chemises homme LOLETT.' },
  { gender: 'homme', slug: 'bas', label: 'Bas', seo_title: 'Bas Homme — LOLETT', seo_description: 'Jeans et pantalons homme LOLETT.' },
  { gender: 'homme', slug: 'vestes', label: 'Vestes', seo_title: 'Vestes Homme — LOLETT', seo_description: 'Vestes et blousons homme LOLETT.' },
  { gender: 'homme', slug: 'accessoires', label: 'Accessoires', seo_title: 'Accessoires Homme — LOLETT', seo_description: 'Sacoches et accessoires homme LOLETT.' },
  { gender: 'femme', slug: 'hauts', label: 'Hauts', seo_title: 'Hauts Femme — LOLETT', seo_description: 'Tops, blouses et chemisiers femme LOLETT.' },
  { gender: 'femme', slug: 'bas', label: 'Bas', seo_title: 'Bas Femme — LOLETT', seo_description: 'Jeans, pantalons et shorts femme LOLETT.' },
  { gender: 'femme', slug: 'robes', label: 'Robes & Combinaisons', seo_title: 'Robes & Combinaisons Femme — LOLETT', seo_description: 'Robes et combinaisons femme LOLETT.' },
  { gender: 'femme', slug: 'bijoux', label: 'Bijoux', seo_title: 'Bijoux Femme — LOLETT', seo_description: 'Bagues, boucles d\'oreilles, bracelets et colliers LOLETT.' },
  { gender: 'femme', slug: 'chaussures', label: 'Chaussures', seo_title: 'Chaussures Femme — LOLETT', seo_description: 'Mules, espadrilles et mocassins femme LOLETT.' },
  { gender: 'femme', slug: 'sacs', label: 'Sacs', seo_title: 'Sacs Femme — LOLETT', seo_description: 'Mini sacs et sacs bandoulière femme LOLETT.' },
];

// ── Products ────────────────────────────────────────────────────────────────

type ProductSeed = {
  slug: string;
  name: string;
  gender: string;
  category_slug: string;
  price: number;
  images: string[];
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  is_new: boolean;
  tags: string[];
};

const products: ProductSeed[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // FEMME — HAUTS
  // ══════════════════════════════════════════════════════════════════════════
  {
    slug: 'isa-marron', name: 'Top Isa Marron', gender: 'femme', category_slug: 'hauts', price: 39,
    images: ['/images/products/isa-marron/1.jpg','/images/products/isa-marron/2.jpg','/images/products/isa-marron/3.jpg','/images/products/isa-marron/4.jpg','/images/products/isa-marron/5.jpg'],
    description: 'Top crop ajusté à manches courtes, coupe seconde peau. Son coloris chocolat chaud apporte une touche d\'élégance à toutes vos tenues.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Marron', hex: '#6B4226' }], stock: 15, is_new: true, tags: ['top','crop','essentiel'],
  },
  {
    slug: 'isa-noir', name: 'Top Isa Noir', gender: 'femme', category_slug: 'hauts', price: 39,
    images: ['/images/products/isa-noir/1.jpg','/images/products/isa-noir/2.jpg','/images/products/isa-noir/3.jpg','/images/products/isa-noir/4.jpg'],
    description: 'Top crop ajusté à manches courtes, coupe seconde peau. Le noir indémodable, aussi chic en journée qu\'en soirée.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 15, is_new: true, tags: ['top','crop','essentiel'],
  },
  {
    slug: 'lola-noir', name: 'Top Lola Noir', gender: 'femme', category_slug: 'hauts', price: 35,
    images: ['/images/products/lola-noir/1.jpg','/images/products/lola-noir/2.jpg'],
    description: 'Top sans manches à coupe fluide. Son décolleté rond et son tombé léger en font la pièce idéale des journées chaudes.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 20, is_new: false, tags: ['top','basique','été'],
  },
  {
    slug: 'lola-beige', name: 'Top Lola Beige', gender: 'femme', category_slug: 'hauts', price: 35,
    images: ['/images/products/lola-beige/1.jpg','/images/products/lola-beige/2.jpg'],
    description: 'Top sans manches à coupe fluide. Sa teinte beige douce se marie avec tout et illumine le teint.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Beige', hex: '#D4B896' }], stock: 20, is_new: false, tags: ['top','basique','été'],
  },
  {
    slug: 'stria', name: 'Top Stria Écru', gender: 'femme', category_slug: 'hauts', price: 45,
    images: ['/images/products/stria/1.jpeg','/images/products/stria/2.jpeg'],
    description: 'Top péplum sans manches avec boutons dorés sur le devant. Sa basque évasée structure la silhouette avec féminité.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Écru', hex: '#F5F0E1' }], stock: 12, is_new: true, tags: ['top','péplum','élégant'],
  },
  {
    slug: 'me-chemise', name: 'Chemise Me Brodée', gender: 'femme', category_slug: 'hauts', price: 69,
    images: ['/images/products/me-chemise/1.jpg','/images/products/me-chemise/2.jpg'],
    description: 'Chemise blanche ornée de broderies florales en relief. Une pièce délicate qui sublime chaque tenue avec poésie.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc', hex: '#FFFFFF' }], stock: 10, is_new: true, tags: ['chemise','broderie','romantique'],
  },
  {
    slug: 'lumen', name: 'Chemise Lumen Oversize', gender: 'femme', category_slug: 'hauts', price: 59,
    images: ['/images/products/lumen/1.jpg','/images/products/lumen/2.jpg','/images/products/lumen/3.jpg'],
    description: 'Chemise blanche oversize à la coupe ample et décontractée. Le basique chic par excellence, à porter seul ou en superposition.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc', hex: '#FFFFFF' }], stock: 14, is_new: false, tags: ['chemise','oversize','essentiel'],
  },
  {
    slug: 'aura', name: 'Blouse Aura Brodée', gender: 'femme', category_slug: 'hauts', price: 75,
    images: ['/images/products/aura/1.jpg','/images/products/aura/2.jpg','/images/products/aura/3.jpg'],
    description: 'Blouse blanche avec plastron bleu orné de broderies florales blanches. Un mélange de tradition et de modernité qui capte tous les regards.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc/Bleu', hex: '#4A7CB5' }], stock: 8, is_new: true, tags: ['blouse','broderie','statement'],
  },
  {
    slug: 'floria-jaune', name: 'Blouse Floria Jaune', gender: 'femme', category_slug: 'hauts', price: 65,
    images: ['/images/products/floria-jaune/1.jpg','/images/products/floria-jaune/2.jpg','/images/products/floria-jaune/3.jpg'],
    description: 'Blouse ample en tissu froissé jaune soleil avec broderies florales sur les manches. Couleur vitaminée, style bohème assumé.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Jaune', hex: '#F4D03F' }], stock: 10, is_new: true, tags: ['blouse','broderie','bohème'],
  },
  {
    slug: 'floria-blanche', name: 'Blouse Floria Blanche', gender: 'femme', category_slug: 'hauts', price: 65,
    images: ['/images/products/floria-blanche/1.jpg','/images/products/floria-blanche/2.jpg'],
    description: 'Blouse blanche avec manches bouffantes brodées de motifs floraux bleu marine. Romantique et raffinée, parfaite du bureau à l\'apéro.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc/Marine', hex: '#1B2A4A' }], stock: 10, is_new: false, tags: ['blouse','broderie','romantique'],
  },
  {
    slug: 'solea-bleu', name: 'Chemise Solea Bleue', gender: 'femme', category_slug: 'hauts', price: 59,
    images: ['/images/products/solea-bleu/1.jpg'],
    description: 'Chemise à rayures bleues et blanches, coupe décontractée. L\'esprit bord de mer dans une pièce intemporelle et facile à porter.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Bleu Rayé', hex: '#5B8FB9' }], stock: 12, is_new: false, tags: ['chemise','rayures','casual'],
  },
  {
    slug: 'solea-jaune', name: 'Chemise Solea Jaune', gender: 'femme', category_slug: 'hauts', price: 59,
    images: ['/images/products/solea-jaune/1.jpg','/images/products/solea-jaune/2.jpg'],
    description: 'Chemise à rayures jaunes et blanches, coupe décontractée. Un souffle de soleil sur votre garde-robe.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Jaune Rayé', hex: '#F7DC6F' }], stock: 12, is_new: false, tags: ['chemise','rayures','casual'],
  },
  {
    slug: 'didi', name: 'Gilet Didi Crochet', gender: 'femme', category_slug: 'hauts', price: 55,
    images: ['/images/products/didi/1.jpg','/images/products/didi/2.jpg','/images/products/didi/3.jpg','/images/products/didi/4.jpg'],
    description: 'Gilet en crochet façon granny squares aux couleurs vives. Pièce artisanale et bohème, chaque carré raconte une histoire.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Multicolore', hex: '#E74C3C' }], stock: 8, is_new: true, tags: ['gilet','crochet','bohème','artisanal'],
  },
  {
    slug: 'solene', name: 'Débardeur Solène Brodé', gender: 'femme', category_slug: 'hauts', price: 49,
    images: ['/images/products/solene/1.jpg','/images/products/solene/2.jpg','/images/products/solene/3.jpg','/images/products/solene/4.jpg'],
    description: 'Débardeur bleu marine parsemé de petites fleurs brodées à la main. Se porte seul ou superposé sur une chemise blanche pour un look preppy.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Marine', hex: '#1B2A4A' }], stock: 10, is_new: true, tags: ['débardeur','broderie','preppy'],
  },
  {
    slug: 'haut-sonia', name: 'Top Sonia Écru', gender: 'femme', category_slug: 'hauts', price: 49,
    images: ['/images/products/haut-sonia/1.jpg','/images/products/haut-sonia/2.jpg'],
    description: 'Haut péplum col V en coton écru, manches courtes et basque évasée. Structuré et féminin, il se coordonne avec le Short Sonia pour un ensemble raffiné.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Écru', hex: '#F5F0E1' }], stock: 12, is_new: true, tags: ['haut','péplum','ensemble'],
  },
  {
    slug: 'jade', name: 'Top Jade Blanc', gender: 'femme', category_slug: 'hauts', price: 35,
    images: ['/images/products/jade/1.jpg','/images/products/jade/2.jpg'],
    description: 'Top crop blanc à manches courtes, coupe ajustée et tissu stretch confortable. Le basique lumineux qui va avec tout.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc', hex: '#FFFFFF' }], stock: 18, is_new: false, tags: ['top','crop','basique'],
  },
  {
    slug: 'amor-rose', name: 'T-shirt Amor Rose', gender: 'femme', category_slug: 'hauts', price: 39,
    images: ['/images/products/amor-rose/1.jpg'],
    description: 'T-shirt rose avec imprimé "More Amor Por Favor" sur fond rayé multicolore. Un message d\'amour porté avec style et bonne humeur.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Rose', hex: '#F4A7BB' }], stock: 18, is_new: true, tags: ['tshirt','imprimé','message'],
  },
  {
    slug: 'amor-blanc', name: 'T-shirt Amor Blanc', gender: 'femme', category_slug: 'hauts', price: 39,
    images: ['/images/products/amor-blanc/1.jpg'],
    description: 'T-shirt blanc cassé avec imprimé "More Amor Por Favor" sur fond rayé. La version douce et lumineuse de notre bestseller.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc Cassé', hex: '#FAF9F6' }], stock: 18, is_new: true, tags: ['tshirt','imprimé','message'],
  },
  {
    slug: 'emoticoeurs-noir-femme', name: 'Hoodie Emoticoeurs Noir', gender: 'femme', category_slug: 'hauts', price: 75,
    images: ['/images/products/emoticoeurs-noir-femme/1.jpg','/images/products/emoticoeurs-noir-femme/2.jpg'],
    description: 'Hoodie noir avec trois coeurs expressifs imprimés sur le devant. Streetwear et fun, il affiche votre humeur du jour.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 15, is_new: true, tags: ['hoodie','coeurs','streetwear'],
  },
  {
    slug: 'emoticoeurs-blanc-femme', name: 'Hoodie Emoticoeurs Blanc', gender: 'femme', category_slug: 'hauts', price: 75,
    images: ['/images/products/emoticoeurs-blanc-femme/1.jpg','/images/products/emoticoeurs-blanc-femme/2.jpg'],
    description: 'Hoodie blanc avec trois coeurs expressifs imprimés sur le devant. Version lumineuse du bestseller, même énergie, autre vibe.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc', hex: '#F5F5F5' }], stock: 15, is_new: true, tags: ['hoodie','coeurs','streetwear'],
  },
  {
    slug: 'leo', name: 'Veste Léo Léopard', gender: 'femme', category_slug: 'hauts', price: 89,
    images: ['/images/products/leo/1.jpg','/images/products/leo/2.jpg','/images/products/leo/3.jpg'],
    description: 'Veste en denim imprimé léopard avec boutons dorés. Pièce forte et audacieuse à jeter sur les épaules pour un look wild chic.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Léopard', hex: '#8B6914' }], stock: 6, is_new: true, tags: ['veste','léopard','statement'],
  },

  // ── FEMME — BAS ───────────────────────────────────────────────────────────
  {
    slug: 'joy', name: 'Jean Joy Wide-Leg', gender: 'femme', category_slug: 'bas', price: 79,
    images: ['/images/products/joy/1.jpg','/images/products/joy/2.jpg','/images/products/joy/3.jpg','/images/products/joy/4.jpg'],
    description: 'Jean wide-leg taille haute en denim bleu clair délavé. Sa coupe large et fluide allonge la silhouette pour un style effortless.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Bleu Clair', hex: '#A8C8E8' }], stock: 12, is_new: true, tags: ['jean','wide-leg','denim'],
  },
  {
    slug: 'ayma', name: 'Pantalon Ayma Blanc', gender: 'femme', category_slug: 'bas', price: 85,
    images: ['/images/products/ayma/1.jpg','/images/products/ayma/2.jpg','/images/products/ayma/3.jpg'],
    description: 'Pantalon blanc coupe droite orné de rivets dorés le long des coutures. Alliance parfaite entre simplicité et détails précieux.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Blanc', hex: '#FAF9F6' }], stock: 10, is_new: true, tags: ['pantalon','blanc','rivets'],
  },
  {
    slug: 'pia', name: 'Pantalon Pia Fluide', gender: 'femme', category_slug: 'bas', price: 65,
    images: ['/images/products/pia/1.jpg','/images/products/pia/2.jpg','/images/products/pia/3.jpg'],
    description: 'Pantalon fluide bleu ciel avec taille élastiquée et cordon. Léger comme une brise, parfait pour les journées d\'été.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Bleu Ciel', hex: '#87CEEB' }], stock: 14, is_new: false, tags: ['pantalon','fluide','été'],
  },
  {
    slug: 'bas-sonia', name: 'Short Sonia Écru', gender: 'femme', category_slug: 'bas', price: 45,
    images: ['/images/products/bas-sonia/1.jpg','/images/products/bas-sonia/2.jpg'],
    description: 'Short taille haute en coton écru avec plis marqués. Se coordonne avec le Haut Sonia pour un ensemble chic et estival.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Écru', hex: '#F5F0E1' }], stock: 12, is_new: true, tags: ['short','ensemble','été'],
  },
  {
    slug: 'you', name: 'Pantalon You Beige', gender: 'femme', category_slug: 'bas', price: 69,
    images: ['/images/products/you/1.jpg','/images/products/you/2.jpg','/images/products/you/3.jpg','/images/products/you/4.jpg'],
    description: 'Pantalon beige coupe droite large, tissu épais et confortable. Un essentiel passe-partout du quotidien.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Beige', hex: '#C8B88A' }], stock: 14, is_new: false, tags: ['pantalon','beige','essentiel'],
  },
  {
    slug: 'malou', name: 'Jean Malou Wide-Leg', gender: 'femme', category_slug: 'bas', price: 75,
    images: ['/images/products/malou/1.jpg','/images/products/malou/2.jpg','/images/products/malou/3.jpg'],
    description: 'Jean wide-leg en denim bleu clair, taille haute et coupe évasée. Le jean incontournable de la saison, confortable et tendance.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Bleu Clair', hex: '#A8C8E8' }], stock: 12, is_new: false, tags: ['jean','wide-leg','denim'],
  },

  // ── FEMME — ROBES & COMBINAISONS ──────────────────────────────────────────
  {
    slug: 'zoe', name: 'Robe Zoe à Pois', gender: 'femme', category_slug: 'robes', price: 89,
    images: ['/images/products/zoe/1.jpg','/images/products/zoe/2.jpg','/images/products/zoe/3.jpg'],
    description: 'Robe longue à bretelles fines en tissu fluide chocolat à pois blancs. Allure rétro et féminine, parfaite pour les soirées d\'été.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Chocolat à Pois', hex: '#3C1F0E' }], stock: 8, is_new: true, tags: ['robe','pois','été','rétro'],
  },
  {
    slug: 'alba', name: 'Combishort Alba Coeurs', gender: 'femme', category_slug: 'robes', price: 79,
    images: ['/images/products/alba/1.jpg','/images/products/alba/2.jpg','/images/products/alba/3.jpg'],
    description: 'Combishort en jean bleu avec motifs coeurs brodés. Pièce fun et pétillante, elle apporte une dose de bonne humeur à votre look.',
    sizes: ['XS','S','M','L'], colors: [{ name: 'Bleu Jean', hex: '#6B8FAF' }], stock: 10, is_new: true, tags: ['combishort','jean','coeurs'],
  },

  // ── FEMME — BIJOUX ────────────────────────────────────────────────────────
  {
    slug: 'flowers-bague', name: 'Bague Flowers', gender: 'femme', category_slug: 'bijoux', price: 29,
    images: ['/images/products/flowers-bague/1.jpg'],
    description: 'Bague fleur en métal doré avec perle nacrée centrale. Pièce statement de la collection Flowers, elle habille la main avec grâce.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 20, is_new: true, tags: ['bague','fleur','doré','perle'],
  },
  {
    slug: 'flowers-boucles-oreilles', name: 'Boucles d\'Oreilles Flowers', gender: 'femme', category_slug: 'bijoux', price: 32,
    images: ['/images/products/flowers-boucles-oreilles/1.jpg'],
    description: 'Boucles d\'oreilles fleur en métal doré avec perle nacrée. Le bijou de la collection Flowers qui encadre le visage d\'élégance.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 20, is_new: true, tags: ['boucles','fleur','doré','perle'],
  },
  {
    slug: 'flowers-bracelet', name: 'Bracelet Flowers', gender: 'femme', category_slug: 'bijoux', price: 35,
    images: ['/images/products/flowers-bracelet/1.jpg'],
    description: 'Bracelet manchette doré avec large fleur et perle nacrée. Pièce maîtresse de la collection Flowers, il attire tous les regards.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 15, is_new: true, tags: ['bracelet','fleur','doré','perle'],
  },
  {
    slug: 'flowers-collier', name: 'Collier Flowers', gender: 'femme', category_slug: 'bijoux', price: 39,
    images: ['/images/products/flowers-collier/1.jpg'],
    description: 'Collier ras de cou doré avec pendentif fleur et perle nacrée. Il complète la collection Flowers pour un total look bijoux assorti.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 15, is_new: true, tags: ['collier','fleur','doré','perle'],
  },
  {
    slug: 'mao-argent', name: 'Créoles Mao Argent', gender: 'femme', category_slug: 'bijoux', price: 25,
    images: ['/images/products/mao-argent/1.jpg'],
    description: 'Créoles texturées effet froissé en métal argenté avec goutte pendante dorée. Un duo de métaux audacieux et moderne.',
    sizes: ['TU'], colors: [{ name: 'Argent', hex: '#C0C0C0' }], stock: 18, is_new: false, tags: ['créoles','argent','texturé'],
  },
  {
    slug: 'mao-or', name: 'Créoles Mao Or', gender: 'femme', category_slug: 'bijoux', price: 25,
    images: ['/images/products/mao-or/1.jpg'],
    description: 'Créoles texturées effet froissé en métal doré. Un bijou sculptural qui apporte du caractère à chaque tenue.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 18, is_new: false, tags: ['créoles','or','texturé'],
  },
  {
    slug: 'marie', name: 'Bague Marie', gender: 'femme', category_slug: 'bijoux', price: 27,
    images: ['/images/products/marie/1.jpg'],
    description: 'Bague imposante composée de sphères dorées empilées. Bijou sculptural et contemporain, elle fait de votre main une oeuvre d\'art.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 15, is_new: true, tags: ['bague','doré','sculptural'],
  },
  {
    slug: 'aida', name: 'Bague Aida', gender: 'femme', category_slug: 'bijoux', price: 25,
    images: ['/images/products/aida/1.jpg'],
    description: 'Bague sculptural en métal doré, forme fluide et organique rappelant une vague. Minimaliste et élégante au quotidien.',
    sizes: ['TU'], colors: [{ name: 'Or', hex: '#D4AF37' }], stock: 18, is_new: false, tags: ['bague','doré','minimaliste'],
  },

  // ── FEMME — CHAUSSURES ────────────────────────────────────────────────────
  {
    slug: 'keur', name: 'Mules Keur Coeurs', gender: 'femme', category_slug: 'chaussures', price: 55,
    images: ['/images/products/keur/1.jpg','/images/products/keur/2.jpg','/images/products/keur/3.jpg'],
    description: 'Mules à semelle bois avec bride en cuir beige ornée de petits coeurs rouges brodés. Un pas après l\'autre, avec amour.',
    sizes: ['36','37','38','39','40'], colors: [{ name: 'Beige Coeurs', hex: '#D4B896' }], stock: 10, is_new: true, tags: ['mules','coeurs','cuir','été'],
  },
  {
    slug: 'amore', name: 'Espadrilles Amore', gender: 'femme', category_slug: 'chaussures', price: 49,
    images: ['/images/products/amore/1.jpg','/images/products/amore/2.jpg'],
    description: 'Espadrilles crème avec inscription "AMORE" sur la semelle en jute. Légères et romantiques, elles sentent bon le Sud.',
    sizes: ['36','37','38','39','40'], colors: [{ name: 'Crème', hex: '#FFFDD0' }], stock: 12, is_new: true, tags: ['espadrilles','jute','été'],
  },
  {
    slug: 'rivera', name: 'Mocassins Rivera', gender: 'femme', category_slug: 'chaussures', price: 59,
    images: ['/images/products/rivera/1.jpg'],
    description: 'Mocassins en daim beige avec franges et perles colorées. Esprit folk et artisanal pour des pas pleins de personnalité.',
    sizes: ['36','37','38','39','40'], colors: [{ name: 'Beige Daim', hex: '#C2A87D' }], stock: 8, is_new: false, tags: ['mocassins','daim','franges','folk'],
  },

  // ── FEMME — SACS ──────────────────────────────────────────────────────────
  {
    slug: 'solis-leopard', name: 'Mini Sac Solis Léopard', gender: 'femme', category_slug: 'sacs', price: 39,
    images: ['/images/products/solis-leopard/1.jpg'],
    description: 'Mini sac bandoulière en toile imprimé léopard bleu. Compact et tendance, il libère les mains sans sacrifier le style.',
    sizes: ['TU'], colors: [{ name: 'Léopard Bleu', hex: '#4A6FA5' }], stock: 15, is_new: true, tags: ['sac','bandoulière','léopard'],
  },
  {
    slug: 'solis-bleu', name: 'Mini Sac Solis Bleu', gender: 'femme', category_slug: 'sacs', price: 39,
    images: ['/images/products/solis-bleu/1.jpg'],
    description: 'Mini sac bandoulière en toile bleu ciel. L\'essentiel au bout de la bandoulière, léger et pratique au quotidien.',
    sizes: ['TU'], colors: [{ name: 'Bleu Ciel', hex: '#87CEEB' }], stock: 15, is_new: false, tags: ['sac','bandoulière','bleu'],
  },

  // ── HOMME — HAUTS ─────────────────────────────────────────────────────────
  {
    slug: 'emoticoeurs-noir-homme', name: 'Hoodie Emoticoeurs Noir', gender: 'homme', category_slug: 'hauts', price: 75,
    images: ['/images/products/emoticoeurs-noir-homme/1.jpg','/images/products/emoticoeurs-noir-homme/2.jpg','/images/products/emoticoeurs-noir-homme/3.jpg'],
    description: 'Hoodie noir avec trois coeurs expressifs imprimés sur le devant. Streetwear et fun, il affiche votre humeur du jour.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 15, is_new: true, tags: ['hoodie','coeurs','streetwear'],
  },
  {
    slug: 'emoticoeurs-blanc-homme', name: 'Hoodie Emoticoeurs Blanc', gender: 'homme', category_slug: 'hauts', price: 75,
    images: ['/images/products/emoticoeurs-blanc-homme/1.jpg','/images/products/emoticoeurs-blanc-homme/2.jpg','/images/products/emoticoeurs-blanc-homme/3.jpg'],
    description: 'Hoodie blanc avec trois coeurs expressifs imprimés sur le devant. Version lumineuse du bestseller, même énergie, autre vibe.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Blanc', hex: '#F5F5F5' }], stock: 15, is_new: true, tags: ['hoodie','coeurs','streetwear'],
  },
  {
    slug: 'mission-rose', name: 'T-shirt Last Mission Rose', gender: 'homme', category_slug: 'hauts', price: 35,
    images: ['/images/products/mission-rose/1.jpg','/images/products/mission-rose/2.jpg'],
    description: 'T-shirt rose poudré avec imprimé "Last Mission" ton sur ton dans le dos. Minimaliste et doux, le basique qu\'on enfile les yeux fermés.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Rose Poudré', hex: '#F0B8B8' }], stock: 20, is_new: false, tags: ['tshirt','basique','logo'],
  },
  {
    slug: 'mission-beige', name: 'T-shirt Last Mission Beige', gender: 'homme', category_slug: 'hauts', price: 35,
    images: ['/images/products/mission-beige/1.jpg','/images/products/mission-beige/2.jpg'],
    description: 'T-shirt beige avec imprimé "Last Mission" ton sur ton dans le dos. La base parfaite de tout look décontracté et soigné.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Beige', hex: '#D4C4A8' }], stock: 20, is_new: false, tags: ['tshirt','basique','logo'],
  },
  {
    slug: 'essentiel', name: 'T-shirt Need', gender: 'homme', category_slug: 'hauts', price: 39,
    images: ['/images/products/essentiel/1.jpg','/images/products/essentiel/2.jpg','/images/products/essentiel/3.jpg'],
    description: 'T-shirt blanc avec "NEED" en rose sur la poitrine et liste de besoins dans le dos : Need You, Need Love, Need Sun… Simple, direct, efficace.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Blanc', hex: '#FFFFFF' }], stock: 18, is_new: true, tags: ['tshirt','imprimé','message'],
  },
  {
    slug: 'saison', name: 'Sweat Seconde Saison', gender: 'homme', category_slug: 'hauts', price: 69,
    images: ['/images/products/saison/1.jpg','/images/products/saison/2.jpg'],
    description: 'Sweatshirt beige avec coeur rouge "Seconde Saison" brodé sur la poitrine. Confort douillet et détail coup de coeur.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Beige', hex: '#D4C4A8' }], stock: 12, is_new: true, tags: ['sweat','coeur','broderie'],
  },
  {
    slug: 'printemps', name: 'T-shirt Fleurs de Printemps', gender: 'homme', category_slug: 'hauts', price: 39,
    images: ['/images/products/printemps/1.jpg','/images/products/printemps/2.jpg','/images/products/printemps/3.jpg'],
    description: 'T-shirt noir avec imprimé "Que le soleil ne se couche jamais — Fleurs de Printemps" et motif floral doré. L\'art de mixer streetwear et poésie.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 15, is_new: true, tags: ['tshirt','imprimé','floral'],
  },
  {
    slug: 'riva', name: 'Chemise Riva Rayée', gender: 'homme', category_slug: 'hauts', price: 65,
    images: ['/images/products/riva/1.jpg','/images/products/riva/2.jpg','/images/products/riva/3.jpg'],
    description: 'Chemise manches courtes en maille texturée à rayures. Col cubain et coupe décontractée, l\'esprit vacances au quotidien.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Écru/Gris', hex: '#B8B0A0' }], stock: 10, is_new: true, tags: ['chemise','rayures','cubain','été'],
  },

  // ── HOMME — BAS ───────────────────────────────────────────────────────────
  {
    slug: 'karl', name: 'Jean Karl', gender: 'homme', category_slug: 'bas', price: 79,
    images: ['/images/products/karl/1.jpg','/images/products/karl/2.jpg','/images/products/karl/3.jpg','/images/products/karl/4.jpg'],
    description: 'Jean coupe droite en denim bleu clair délavé. Le classique revisité avec une coupe moderne et un confort optimal.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Bleu Clair', hex: '#A8C8E8' }], stock: 14, is_new: false, tags: ['jean','denim','classique'],
  },
  {
    slug: 'fefe', name: 'Jean Fefe', gender: 'homme', category_slug: 'bas', price: 79,
    images: ['/images/products/fefe/1.jpg','/images/products/fefe/2.jpg'],
    description: 'Jean coupe droite en denim bleu medium. Polyvalent et indémodable, il se porte du matin au soir sans effort.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Bleu Medium', hex: '#5B8DB8' }], stock: 14, is_new: false, tags: ['jean','denim','classique'],
  },
  {
    slug: 'alto', name: 'Jean Alto Losange', gender: 'homme', category_slug: 'bas', price: 89,
    images: ['/images/products/alto/1.jpg','/images/products/alto/2.jpg','/images/products/alto/3.jpg'],
    description: 'Jean coupe large en denim bleu avec motif losange all-over. Pièce audacieuse et originale pour ceux qui osent la différence.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Bleu Motif', hex: '#5B8DB8' }], stock: 8, is_new: true, tags: ['jean','motif','statement'],
  },
  {
    slug: 'mat', name: 'Pantalon Mat Noir', gender: 'homme', category_slug: 'bas', price: 69,
    images: ['/images/products/mat/1.jpg','/images/products/mat/2.jpg'],
    description: 'Pantalon noir coupe slim en tissu léger. L\'incontournable du vestiaire masculin, chic et confortable en toute circonstance.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 16, is_new: false, tags: ['pantalon','noir','slim','essentiel'],
  },

  // ── HOMME — VESTES ────────────────────────────────────────────────────────
  {
    slug: 'origin', name: 'Blouson Origin', gender: 'homme', category_slug: 'vestes', price: 95,
    images: ['/images/products/origin/1.jpg','/images/products/origin/2.jpg','/images/products/origin/3.jpg'],
    description: 'Blouson léger en coton beige avec col contrasté gris. Fermeture zippée et poche poitrine. La veste mi-saison élégante et fonctionnelle.',
    sizes: ['S','M','L','XL'], colors: [{ name: 'Beige', hex: '#D4C4A8' }], stock: 8, is_new: true, tags: ['blouson','veste','mi-saison'],
  },

  // ── HOMME — ACCESSOIRES ───────────────────────────────────────────────────
  {
    slug: 'kev', name: 'Sacoche Kev', gender: 'homme', category_slug: 'accessoires', price: 45,
    images: ['/images/products/kev/1.jpg'],
    description: 'Sacoche bandoulière noire compacte au design épuré. L\'accessoire urbain indispensable pour garder l\'essentiel à portée de main.',
    sizes: ['TU'], colors: [{ name: 'Noir', hex: '#1A1A1A' }], stock: 20, is_new: true, tags: ['sacoche','bandoulière','urbain'],
  },
];

// ── Looks ───────────────────────────────────────────────────────────────────

const looks = [
  {
    title: 'Ensemble Sonia',
    gender: 'femme',
    cover_image: '/images/products/haut-sonia/1.jpg',
    vibe: 'Brunch entre amies',
    short_pitch: 'Haut péplum et short assorti écru. L\'ensemble coordonné chic et décontracté.',
    productSlugs: ['haut-sonia', 'bas-sonia', 'keur'],
  },
  {
    title: 'Collection Flowers',
    gender: 'femme',
    cover_image: '/images/products/flowers-collier/1.jpg',
    vibe: 'Soirée dorée',
    short_pitch: 'Collier, bracelet, bague et boucles d\'oreilles fleur dorée. Le set bijoux complet pour briller.',
    productSlugs: ['flowers-collier', 'flowers-bracelet', 'flowers-bague', 'flowers-boucles-oreilles'],
  },
  {
    title: 'Street Emoticoeurs',
    gender: 'homme',
    cover_image: '/images/products/emoticoeurs-noir-homme/1.jpg',
    vibe: 'Week-end en ville',
    short_pitch: 'Hoodie Emoticoeurs et jean Alto. Le duo streetwear qui a du coeur.',
    productSlugs: ['emoticoeurs-noir-homme', 'alto', 'kev'],
  },
];

// ── Seed function ───────────────────────────────────────────────────────────

async function seed() {
  console.log('🧹 Cleaning existing data…');

  // Delete in order to respect FK constraints
  await admin.from('look_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('looks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await admin.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('📂 Seeding categories…');
  const { error: catError } = await admin
    .from('categories')
    .upsert(categories, { onConflict: 'gender,slug' });
  if (catError) { console.error('Category seed failed:', catError.message); process.exit(1); }
  console.log(`  ✓ ${categories.length} categories`);

  console.log('📦 Seeding products…');
  // Insert in batches to avoid payload limits
  const batchSize = 10;
  let inserted = 0;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const { error } = await admin.from('products').insert(batch);
    if (error) {
      console.error(`Product batch ${i / batchSize + 1} failed:`, error.message);
      console.error('First product in failed batch:', batch[0]?.slug);
      process.exit(1);
    }
    inserted += batch.length;
  }
  console.log(`  ✓ ${inserted} products`);

  console.log('👗 Seeding looks…');
  for (const look of looks) {
    const { productSlugs, ...lookData } = look;

    const { data: lookRow, error: lookError } = await admin
      .from('looks')
      .insert(lookData)
      .select('id')
      .single();
    if (lookError || !lookRow) {
      console.error(`Look "${look.title}" failed:`, lookError?.message);
      continue;
    }

    // Link products to look
    for (let pos = 0; pos < productSlugs.length; pos++) {
      const { data: prod } = await admin
        .from('products')
        .select('id')
        .eq('slug', productSlugs[pos])
        .single();
      if (prod) {
        await admin.from('look_products').insert({
          look_id: lookRow.id,
          product_id: prod.id,
          position: pos,
        });
      }
    }
    console.log(`  ✓ Look "${look.title}" with ${productSlugs.length} products`);
  }

  console.log(`\n🎉 Seed complete! ${products.length} products ready.`);
}

seed();
