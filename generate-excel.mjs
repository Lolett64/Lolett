import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
wb.creator = 'LOLETT';
wb.created = new Date();

// ─────────────────────────────────────────────
// PALETTE & STYLES
// ─────────────────────────────────────────────
const COLORS = {
  gold:       'C9A96E',
  goldLight:  'F5EFE0',
  dark:       '1A1A1A',
  white:      'FFFFFF',
  grey:       'F7F7F5',
  greyText:   '888888',
  green:      'D4EDDA',
  greenText:  '155724',
  blue:       'CCE5FF',
  blueText:   '004085',
  rose:       'F8D7DA',
  roseText:   '721C24',
  orange:     'FFF3CD',
  orangeText: '856404',
  purple:     'E8DAEF',
  purpleText: '4A235A',
  teal:       'D1ECF1',
  tealText:   '0C5460',
};

const FONT_TITLE = { name: 'Calibri', size: 18, bold: true, color: { argb: COLORS.dark } };
const FONT_SUBTITLE = { name: 'Calibri', size: 11, italic: true, color: { argb: COLORS.greyText } };
const FONT_HEADER = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.white } };
const FONT_BODY = { name: 'Calibri', size: 10, color: { argb: COLORS.dark } };
const FONT_EXAMPLE = { name: 'Calibri', size: 10, italic: true, color: { argb: COLORS.greyText } };
const FONT_INSTRUCTION = { name: 'Calibri', size: 9, italic: true, color: { argb: '666666' } };
const FONT_SECTION = { name: 'Calibri', size: 12, bold: true, color: { argb: COLORS.dark } };

const BORDER_THIN = {
  top: { style: 'thin', color: { argb: 'DDDDDD' } },
  bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
  left: { style: 'thin', color: { argb: 'DDDDDD' } },
  right: { style: 'thin', color: { argb: 'DDDDDD' } },
};

const ALIGN_CENTER = { vertical: 'middle', horizontal: 'center', wrapText: true };
const ALIGN_LEFT = { vertical: 'middle', horizontal: 'left', wrapText: true };

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function createSheet(name, tabColor) {
  const ws = wb.addWorksheet(name, {
    properties: { tabColor: { argb: tabColor } },
    views: [{ state: 'frozen', ySplit: 4 }],
  });
  return ws;
}

function addTitle(ws, title, subtitle, pageRef, cols) {
  // Row 1: Page reference tag
  ws.mergeCells(1, 1, 1, cols);
  const pageCell = ws.getCell(1, 1);
  pageCell.value = `📍 ${pageRef}`;
  pageCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: COLORS.white } };
  pageCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } };
  pageCell.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(1).height = 22;

  // Row 2: Title
  ws.mergeCells(2, 1, 2, cols);
  const titleCell = ws.getCell(2, 1);
  titleCell.value = title;
  titleCell.font = FONT_TITLE;
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(2).height = 32;

  // Row 3: Subtitle / instructions
  ws.mergeCells(3, 1, 3, cols);
  const subCell = ws.getCell(3, 1);
  subCell.value = subtitle;
  subCell.font = FONT_SUBTITLE;
  subCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  ws.getRow(3).height = 28;
}

function addHeaders(ws, row, headers, color) {
  const r = ws.getRow(row);
  r.height = 28;
  headers.forEach((h, i) => {
    const cell = r.getCell(i + 1);
    cell.value = h;
    cell.font = FONT_HEADER;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    cell.alignment = ALIGN_CENTER;
    cell.border = BORDER_THIN;
  });
}

function addDataRow(ws, rowNum, data, isExample = false) {
  const r = ws.getRow(rowNum);
  r.height = 22;
  data.forEach((val, i) => {
    const cell = r.getCell(i + 1);
    cell.value = val;
    cell.font = isExample ? FONT_EXAMPLE : FONT_BODY;
    cell.alignment = ALIGN_LEFT;
    cell.border = BORDER_THIN;
    if (isExample) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.grey } };
    }
  });
}

function addSectionRow(ws, rowNum, label, cols) {
  ws.mergeCells(rowNum, 1, rowNum, cols);
  const cell = ws.getCell(rowNum, 1);
  cell.value = `▸ ${label}`;
  cell.font = FONT_SECTION;
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.goldLight } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  cell.border = BORDER_THIN;
  ws.getRow(rowNum).height = 26;
}

function addInstructionRow(ws, rowNum, text, cols) {
  ws.mergeCells(rowNum, 1, rowNum, cols);
  const cell = ws.getCell(rowNum, 1);
  cell.value = `💡 ${text}`;
  cell.font = FONT_INSTRUCTION;
  cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  ws.getRow(rowNum).height = 20;
}

function addDropdown(ws, col, startRow, endRow, options) {
  for (let r = startRow; r <= endRow; r++) {
    ws.getCell(r, col).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`"${options.join(',')}"`],
      showErrorMessage: true,
      errorTitle: 'Valeur invalide',
      error: `Choisir parmi : ${options.join(', ')}`,
    };
  }
}

// ─────────────────────────────────────────────
// 1. CATALOGUE PRODUITS
// ─────────────────────────────────────────────
{
  const ws = createSheet('📦 Catalogue Produits', COLORS.gold);
  const cols = 10;
  ws.columns = [
    { width: 5 },   // #
    { width: 30 },  // Nom
    { width: 28 },  // Slug
    { width: 12 },  // Genre
    { width: 18 },  // Catégorie
    { width: 10 },  // Prix
    { width: 55 },  // Description
    { width: 24 },  // Tailles
    { width: 22 },  // Tags
    { width: 12 },  // Nouveau
  ];

  addTitle(ws,
    'CATALOGUE PRODUITS',
    'Remplissez une ligne par produit. Les exemples en gris sont là pour vous guider — remplacez-les par vos vrais produits.',
    'PAGE : /shop/homme & /shop/femme & /produit/[slug]',
    cols
  );

  addHeaders(ws, 4, ['#', 'Nom du produit', 'Slug (URL)', 'Genre', 'Catégorie', 'Prix (€)', 'Description', 'Tailles disponibles', 'Tags (mots-clés)', 'Nouveau ?'], COLORS.dark);

  addInstructionRow(ws, 5, 'EXEMPLES — Supprimez ces lignes et remplacez par vos produits', cols);

  const examples = [
    [1, 'Chemise Lin Méditerranée', 'chemise-lin-mediterranee', 'Homme', 'Chemises', 89, 'Chemise en lin léger, coupe droite, parfaite pour les journées ensoleillées. Col italien, boutons nacre.', 'S, M, L, XL', 'lin, été, essentiel', 'Oui'],
    [2, 'Robe Midi Provençale', 'robe-midi-provencale', 'Femme', 'Robes', 115, 'Robe midi fluide en coton, imprimé floral subtil, manches courtes évasées.', 'XS, S, M, L', 'coton, été, floral', 'Oui'],
    [3, 'Polo Piqué Riviera', 'polo-pique-riviera', 'Homme', 'Polos', 75, 'Polo en maille piquée, col souple, boutons discrets, esprit côte d\'Azur.', 'S, M, L, XL', 'coton, classique', 'Non'],
  ];

  examples.forEach((row, i) => addDataRow(ws, 6 + i, row, true));

  addInstructionRow(ws, 9, 'VOS PRODUITS — Commencez ici ↓', cols);

  // Empty rows for client
  for (let r = 10; r <= 60; r++) {
    const row = ws.getRow(r);
    row.height = 22;
    row.getCell(1).value = r - 9;
    row.getCell(1).font = FONT_BODY;
    row.getCell(1).alignment = ALIGN_CENTER;
    for (let c = 1; c <= cols; c++) {
      row.getCell(c).border = BORDER_THIN;
    }
  }

  // Dropdowns
  addDropdown(ws, 4, 10, 60, ['Homme', 'Femme']);
  addDropdown(ws, 10, 10, 60, ['Oui', 'Non']);
}

// ─────────────────────────────────────────────
// 2. COULEURS & VARIANTES
// ─────────────────────────────────────────────
{
  const ws = createSheet('🎨 Couleurs & Variantes', COLORS.purple);
  const cols = 6;
  ws.columns = [
    { width: 5 },   // #
    { width: 30 },  // Produit
    { width: 20 },  // Couleur nom
    { width: 15 },  // Hex
    { width: 10 },  // Taille
    { width: 10 },  // Stock
  ];

  addTitle(ws,
    'COULEURS & VARIANTES — STOCK DÉTAILLÉ',
    'Une ligne par combinaison produit + couleur + taille. C\'est ce tableau qui détermine votre stock réel.',
    'PAGE : /produit/[slug] — Sélecteur couleur/taille',
    cols
  );

  addHeaders(ws, 4, ['#', 'Nom du produit', 'Couleur (nom)', 'Code couleur (hex)', 'Taille', 'Stock'], COLORS.purpleText);

  addInstructionRow(ws, 5, 'EXEMPLE — Pour 1 produit en 2 couleurs × 4 tailles = 8 lignes', cols);

  const examples = [
    [1, 'Chemise Lin Méditerranée', 'Blanc Cassé', '#F5F0E8', 'S', 5],
    [2, 'Chemise Lin Méditerranée', 'Blanc Cassé', '#F5F0E8', 'M', 8],
    [3, 'Chemise Lin Méditerranée', 'Blanc Cassé', '#F5F0E8', 'L', 6],
    [4, 'Chemise Lin Méditerranée', 'Blanc Cassé', '#F5F0E8', 'XL', 3],
    [5, 'Chemise Lin Méditerranée', 'Bleu Ciel', '#87CEEB', 'S', 4],
    [6, 'Chemise Lin Méditerranée', 'Bleu Ciel', '#87CEEB', 'M', 7],
    [7, 'Chemise Lin Méditerranée', 'Bleu Ciel', '#87CEEB', 'L', 5],
    [8, 'Chemise Lin Méditerranée', 'Bleu Ciel', '#87CEEB', 'XL', 2],
  ];

  examples.forEach((row, i) => addDataRow(ws, 6 + i, row, true));

  addInstructionRow(ws, 14, 'VOS VARIANTES — Commencez ici ↓', cols);

  for (let r = 15; r <= 200; r++) {
    const row = ws.getRow(r);
    row.height = 20;
    row.getCell(1).value = r - 14;
    row.getCell(1).font = FONT_BODY;
    row.getCell(1).alignment = ALIGN_CENTER;
    for (let c = 1; c <= cols; c++) {
      row.getCell(c).border = BORDER_THIN;
    }
  }

  addDropdown(ws, 5, 15, 200, ['TU', 'XS', 'S', 'M', 'L', 'XL']);
}

// ─────────────────────────────────────────────
// 3. IMAGES PRODUITS
// ─────────────────────────────────────────────
{
  const ws = createSheet('📸 Images Produits', COLORS.teal);
  const cols = 7;
  ws.columns = [
    { width: 5 },
    { width: 30 },
    { width: 28 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
  ];

  addTitle(ws,
    'IMAGES PRODUITS',
    'Indiquez le nom de fichier de chaque photo. Envoyez les fichiers dans un dossier séparé. Format recommandé : JPG ou PNG, min 1200×1600px.',
    'PAGE : /produit/[slug] — Galerie photos',
    cols
  );

  addHeaders(ws, 4, ['#', 'Nom du produit', 'Photo principale', 'Photo 2 (dos)', 'Photo 3 (détail)', 'Photo 4 (portée)', 'Photo 5 (ambiance)'], COLORS.tealText);

  addInstructionRow(ws, 5, 'EXEMPLE — Nommez vos fichiers de façon claire (ex: chemise-lin-face.jpg)', cols);

  addDataRow(ws, 6, [1, 'Chemise Lin Méditerranée', 'chemise-lin-face.jpg', 'chemise-lin-dos.jpg', 'chemise-lin-detail-col.jpg', 'chemise-lin-portee.jpg', ''], true);
  addDataRow(ws, 7, [2, 'Robe Midi Provençale', 'robe-midi-face.jpg', 'robe-midi-dos.jpg', 'robe-midi-tissu.jpg', 'robe-midi-portee.jpg', 'robe-midi-ambiance.jpg'], true);

  addInstructionRow(ws, 8, 'VOS IMAGES — Commencez ici ↓', cols);

  for (let r = 9; r <= 60; r++) {
    const row = ws.getRow(r);
    row.height = 22;
    row.getCell(1).value = r - 8;
    row.getCell(1).font = FONT_BODY;
    row.getCell(1).alignment = ALIGN_CENTER;
    for (let c = 1; c <= cols; c++) {
      row.getCell(c).border = BORDER_THIN;
    }
  }
}

// ─────────────────────────────────────────────
// 4. CATÉGORIES
// ─────────────────────────────────────────────
{
  const ws = createSheet('🏷️ Catégories', COLORS.blue);
  const cols = 6;
  ws.columns = [
    { width: 5 },
    { width: 12 },
    { width: 22 },
    { width: 22 },
    { width: 32 },
    { width: 55 },
  ];

  addTitle(ws,
    'CATÉGORIES',
    'Les catégories organisent votre boutique. Vérifiez et complétez les titres SEO pour un bon référencement Google.',
    'PAGE : /shop/homme & /shop/femme — Menu et filtres',
    cols
  );

  addHeaders(ws, 4, ['#', 'Genre', 'Nom de la catégorie', 'Slug (URL)', 'Titre SEO (Google)', 'Description SEO (Google)'], COLORS.blueText);

  const cats = [
    [1, 'Homme', 'Chemises', 'chemises', 'Chemises Homme Lin & Coton — LOLETT', 'Découvrez nos chemises en lin et coton, esprit méditerranéen. Coupes décontractées pour l\'homme du Sud.'],
    [2, 'Homme', 'Polos', 'polos', 'Polos Homme — LOLETT', 'Polos élégants et décontractés, maille piquée et coton léger.'],
    [3, 'Homme', 'Pantalons & Bermudas', 'pantalons', 'Pantalons & Bermudas Homme — LOLETT', 'Chinos et bermudas légers, coupe décontractée, esprit vacances.'],
    [4, 'Homme', 'Accessoires', 'accessoires-homme', 'Accessoires Homme — LOLETT', 'Chapeaux, ceintures et accessoires pour compléter votre look estival.'],
    [5, 'Femme', 'Robes', 'robes', 'Robes Femme — LOLETT', 'Robes midi et longues, fluides et féminines, du matin au soir.'],
    [6, 'Femme', 'Tops & Blouses', 'tops-blouses', 'Tops & Blouses Femme — LOLETT', 'Tops et blouses légères, imprimés floraux et unis.'],
    [7, 'Femme', 'Jupes', 'jupes', 'Jupes Femme — LOLETT', 'Jupes fluides et élégantes, du midi au long.'],
    [8, 'Femme', 'Accessoires', 'accessoires-femme', 'Accessoires Femme — LOLETT', 'Bijoux, sacs et accessoires pour sublimer vos tenues.'],
  ];

  cats.forEach((row, i) => addDataRow(ws, 5 + i, row, true));

  addInstructionRow(ws, 13, 'Modifiez les catégories ci-dessus ou ajoutez-en ici ↓', cols);

  for (let r = 14; r <= 25; r++) {
    const row = ws.getRow(r);
    row.height = 22;
    for (let c = 1; c <= cols; c++) {
      row.getCell(c).border = BORDER_THIN;
    }
  }

  addDropdown(ws, 2, 5, 25, ['Homme', 'Femme']);
}

// ─────────────────────────────────────────────
// 5. LOOKS / TENUES
// ─────────────────────────────────────────────
{
  const ws = createSheet('👗 Looks & Tenues', COLORS.rose);
  const cols = 9;
  ws.columns = [
    { width: 5 },
    { width: 25 },
    { width: 12 },
    { width: 20 },
    { width: 45 },
    { width: 28 },
    { width: 28 },
    { width: 28 },
    { width: 30 },
  ];

  addTitle(ws,
    'LOOKS & TENUES COMPLÈTES',
    'Les "looks" sont des suggestions de tenues complètes affichées sur la page d\'accueil. Associez 2 à 4 produits par look.',
    'PAGE : / (accueil) — Section "Nos Looks"',
    cols
  );

  addHeaders(ws, 4, ['#', 'Titre du look', 'Genre', 'Ambiance', 'Pitch (1 phrase)', 'Produit 1', 'Produit 2', 'Produit 3', 'Photo de couverture'], COLORS.roseText);

  addDataRow(ws, 5, [1, 'Le Bord de Mer', 'Homme', 'Décontracté chic', 'L\'essentiel pour un apéro pieds dans le sable.', 'Chemise Lin Méditerranée', 'Bermuda Toile Calanque', 'Espadrilles Naturel', 'look-bord-de-mer.jpg'], true);
  addDataRow(ws, 6, [2, 'Escapade Provençale', 'Femme', 'Romantique', 'Du marché aux étoiles, une tenue qui suit votre journée.', 'Robe Midi Provençale', 'Chapeau Paille Soleil', 'Sandales Dorées', 'look-provencale.jpg'], true);

  addInstructionRow(ws, 7, 'VOS LOOKS — Commencez ici ↓', cols);

  for (let r = 8; r <= 20; r++) {
    const row = ws.getRow(r);
    row.height = 22;
    row.getCell(1).value = r - 7;
    row.getCell(1).font = FONT_BODY;
    row.getCell(1).alignment = ALIGN_CENTER;
    for (let c = 1; c <= cols; c++) {
      row.getCell(c).border = BORDER_THIN;
    }
  }

  addDropdown(ws, 3, 8, 20, ['Homme', 'Femme']);
}

// ─────────────────────────────────────────────
// 6. CONTENU DU SITE
// ─────────────────────────────────────────────
{
  const ws = createSheet('✏️ Contenu du Site', COLORS.orange);
  const cols = 4;
  ws.columns = [
    { width: 28 },
    { width: 35 },
    { width: 50 },
    { width: 45 },
  ];

  addTitle(ws,
    'CONTENU DU SITE — TEXTES & MÉDIAS',
    'Tous les textes et images modifiables du site. Remplissez la colonne "Votre contenu". La colonne "Instructions" vous guide.',
    'TOUTES LES PAGES DU SITE',
    cols
  );

  addHeaders(ws, 4, ['📍 Page / Section', 'Champ', 'Votre contenu', '💡 Instructions & exemples'], COLORS.orangeText);

  let row = 5;

  // HERO
  addSectionRow(ws, row++, 'PAGE D\'ACCUEIL — Hero (bannière principale)', cols);
  const heroFields = [
    ['Titre principal', '', 'Ex: "Penser au Sud, porté partout" — phrase d\'accroche forte'],
    ['Sous-titre', '', 'Phrase sous le titre, 1-2 lignes max'],
    ['Bouton principal — Texte', '', 'Ex: "Découvrir la collection"'],
    ['Bouton principal — Lien', '', 'Ex: /shop/femme'],
    ['Bouton secondaire — Texte', '', 'Ex: "Notre histoire" (ou laisser vide)'],
    ['Bouton secondaire — Lien', '', 'Ex: /notre-histoire'],
    ['Vidéo / image de fond', '', 'Nom du fichier vidéo (.mp4) ou image (.jpg)'],
  ];
  heroFields.forEach(f => {
    addDataRow(ws, row, ['Page d\'accueil — Hero', ...f]);
    row++;
  });

  // BANNIERE PROMO
  row++;
  addSectionRow(ws, row++, 'PAGE D\'ACCUEIL — Bannière promo (barre en haut)', cols);
  [
    ['Texte de la bannière', '', 'Ex: "Livraison offerte dès 100€ 🌿"'],
    ['Afficher ? (Oui/Non)', '', 'Activer ou désactiver la bannière'],
  ].forEach(f => {
    addDataRow(ws, row, ['Bannière promo', ...f]);
    row++;
  });

  // NEWSLETTER
  row++;
  addSectionRow(ws, row++, 'PAGE D\'ACCUEIL — Section Newsletter', cols);
  [
    ['Titre', '', 'Ex: "Restez connecté(e)"'],
    ['Description', '', 'Texte d\'accroche pour l\'inscription newsletter'],
    ['Texte du bouton', '', 'Ex: "S\'inscrire"'],
  ].forEach(f => {
    addDataRow(ws, row, ['Newsletter', ...f]);
    row++;
  });

  // NOTRE HISTOIRE
  row++;
  addSectionRow(ws, row++, 'PAGE : /notre-histoire', cols);
  [
    ['Titre de la page', '', 'Ex: "Notre Histoire"'],
    ['Texte principal', '', 'Racontez l\'histoire de LOLETT, votre inspiration, votre parcours... (pas de limite)'],
    ['Texte secondaire (optionnel)', '', 'Un deuxième paragraphe si besoin'],
    ['Image 1', '', 'Photo ambiance / portrait fondatrice'],
    ['Image 2', '', 'Photo atelier / inspiration / voyage'],
  ].forEach(f => {
    addDataRow(ws, row, ['Notre Histoire', ...f]);
    row++;
  });

  // CONTACT
  row++;
  addSectionRow(ws, row++, 'PAGE : /contact', cols);
  [
    ['Titre', '', 'Ex: "Parlons ensemble"'],
    ['Description', '', 'Texte d\'intro du formulaire de contact'],
    ['Email de réception', '', 'Adresse qui recevra les messages du formulaire'],
    ['Téléphone (affiché)', '', 'Numéro affiché sur la page (ou vide)'],
    ['Horaires de réponse', '', 'Ex: "Lundi — Vendredi, 9h — 18h"'],
  ].forEach(f => {
    addDataRow(ws, row, ['Contact', ...f]);
    row++;
  });

  // FOOTER
  row++;
  addSectionRow(ws, row++, 'FOOTER (bas de page — toutes les pages)', cols);
  [
    ['Slogan / phrase', '', 'Phrase signature en bas du site'],
    ['Instagram', '', 'URL complète de votre profil Instagram'],
    ['Facebook', '', 'URL Facebook (ou laisser vide)'],
    ['Pinterest', '', 'URL Pinterest (ou laisser vide)'],
    ['TikTok', '', 'URL TikTok (ou laisser vide)'],
  ].forEach(f => {
    addDataRow(ws, row, ['Footer', ...f]);
    row++;
  });

  // EMAILS TRANSACTIONNELS
  row++;
  addSectionRow(ws, row++, 'EMAILS AUTOMATIQUES (envoyés aux clients)', cols);
  [
    ['Email expéditeur (from)', '', 'Ex: bonjour@lolett.fr'],
    ['Nom expéditeur', '', 'Ex: LOLETT'],
    ['Objet — Confirmation commande', '', 'Ex: "Merci pour votre commande ! 🌿"'],
    ['Objet — Commande expédiée', '', 'Ex: "Votre colis est en route ! 📦"'],
    ['Objet — Commande livrée', '', 'Ex: "Votre commande a bien été livrée ✨"'],
    ['Message personnalisé (optionnel)', '', 'Petit mot ajouté dans chaque email de confirmation'],
  ].forEach(f => {
    addDataRow(ws, row, ['Emails', ...f]);
    row++;
  });
}

// ─────────────────────────────────────────────
// 7. INFORMATIONS LÉGALES & BOUTIQUE
// ─────────────────────────────────────────────
{
  const ws = createSheet('⚖️ Infos Légales & Boutique', COLORS.green);
  const cols = 4;
  ws.columns = [
    { width: 22 },
    { width: 38 },
    { width: 50 },
    { width: 42 },
  ];

  addTitle(ws,
    'INFORMATIONS LÉGALES & CONFIGURATION BOUTIQUE',
    'Informations obligatoires pour les mentions légales, CGV, et la configuration de la boutique.',
    'PAGES : /mentions-legales & /cgv & /confidentialite & checkout',
    cols
  );

  addHeaders(ws, 4, ['Catégorie', 'Champ', 'Votre réponse', '💡 Instructions'], COLORS.greenText);

  let row = 5;

  // IDENTITÉ
  addSectionRow(ws, row++, 'IDENTITÉ DE L\'ENTREPRISE — Mentions légales obligatoires', cols);
  [
    ['Raison sociale', '', 'Nom légal de votre entreprise'],
    ['Forme juridique', '', 'SAS, SARL, EI, Auto-entrepreneur...'],
    ['SIRET', '', '14 chiffres — trouvable sur societe.com ou infogreffe.fr'],
    ['Numéro TVA intracom.', '', 'Si assujetti à la TVA (sinon laisser vide)'],
    ['Capital social', '', 'Si SAS/SARL (sinon laisser vide)'],
    ['RCS', '', 'Ex: RCS Bordeaux 123 456 789'],
    ['Nom du/de la dirigeant(e)', '', 'Prénom + Nom du/de la gérant(e)'],
    ['Adresse du siège', '', 'Adresse complète'],
    ['Code postal', '', ''],
    ['Ville', '', ''],
    ['Pays', '', 'France'],
    ['Email professionnel', '', 'Ex: contact@lolett.fr'],
    ['Téléphone professionnel', '', 'Numéro de contact'],
  ].forEach(f => {
    addDataRow(ws, row, ['Identité', ...f]);
    row++;
  });

  // HÉBERGEUR
  row++;
  addSectionRow(ws, row++, 'HÉBERGEUR — Obligatoire dans les mentions légales', cols);
  [
    ['Nom', 'Vercel Inc.', 'Pré-rempli — ne pas modifier'],
    ['Adresse', '440 N Barranca Ave #4133, Covina, CA 91723, USA', 'Pré-rempli'],
    ['Site web', 'https://vercel.com', 'Pré-rempli'],
  ].forEach(f => {
    addDataRow(ws, row, ['Hébergeur', ...f]);
    row++;
  });

  // LIVRAISON
  row++;
  addSectionRow(ws, row++, 'LIVRAISON — Configuration & CGV', cols);
  [
    ['Frais de livraison standard (€)', '', 'Ex: 5.90'],
    ['Seuil livraison gratuite (€)', '', 'Ex: 100 (au-dessus = gratuit)'],
    ['Délai de livraison estimé', '', 'Ex: 3 à 5 jours ouvrés'],
    ['Transporteur(s)', '', 'Ex: Colissimo, Mondial Relay, Chronopost...'],
    ['Zones de livraison', '', 'Ex: France métropolitaine (+ DOM-TOM, Europe ?)'],
    ['Livraison express ? (Oui/Non)', '', 'Si oui, préciser le tarif et le délai'],
  ].forEach(f => {
    addDataRow(ws, row, ['Livraison', ...f]);
    row++;
  });

  // RETOURS
  row++;
  addSectionRow(ws, row++, 'RETOURS & ÉCHANGES — Politique de retour', cols);
  [
    ['Délai de rétractation (jours)', '', '14 jours = minimum légal. Vous pouvez offrir plus.'],
    ['Conditions de retour', '', 'Ex: Article non porté, étiquette attachée, dans son emballage'],
    ['Frais de retour à charge de', '', 'Client ou Boutique ?'],
    ['Mode de remboursement', '', 'Ex: Remboursement sous 14 jours sur le moyen de paiement initial'],
    ['Échanges possibles ?', '', 'Oui/Non — Si oui, préciser les conditions'],
    ['Adresse de retour', '', 'Adresse où les clients envoient les retours'],
    ['Procédure', '', 'Étapes pour retourner : email → étiquette → colis → remboursement'],
  ].forEach(f => {
    addDataRow(ws, row, ['Retours', ...f]);
    row++;
  });

  // PAIEMENT
  row++;
  addSectionRow(ws, row++, 'PAIEMENT', cols);
  [
    ['Moyens de paiement acceptés', '', 'Ex: CB (Visa, Mastercard, Amex), PayPal, Apple Pay'],
    ['Prestataire', 'Stripe', 'Pré-rempli — paiement sécurisé'],
    ['Paiement en plusieurs fois ?', '', 'Si oui, préciser (ex: 3x sans frais via Alma)'],
  ].forEach(f => {
    addDataRow(ws, row, ['Paiement', ...f]);
    row++;
  });

  // CGV
  row++;
  addSectionRow(ws, row++, 'TEXTES LÉGAUX — CGV, Confidentialité, Mentions', cols);
  [
    ['CGV', '', 'Copiez vos CGV complètes ici (ou joignez un fichier Word/PDF séparé)'],
    ['Politique de confidentialité', '', 'Texte RGPD sur la collecte de données (ou fichier séparé)'],
    ['Mentions légales complémentaires', '', 'Tout texte légal additionnel'],
    ['Cookies — Message bandeau', '', 'Ex: "Ce site utilise des cookies pour améliorer votre expérience"'],
  ].forEach(f => {
    addDataRow(ws, row, ['Légal', ...f]);
    row++;
  });

  // FIDÉLITÉ
  row++;
  addSectionRow(ws, row++, 'PROGRAMME FIDÉLITÉ', cols);
  [
    ['Activer le programme ? (Oui/Non)', '', 'Voulez-vous un programme de fidélité ?'],
    ['Points par euro dépensé', '', 'Ex: 1 point par euro'],
    ['Seuil de récompense', '', 'Ex: 200 points = -10€ sur la prochaine commande'],
    ['Description pour les clients', '', 'Texte explicatif affiché sur le site'],
  ].forEach(f => {
    addDataRow(ws, row, ['Fidélité', ...f]);
    row++;
  });
}

// ─────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────
const outputPath = '/Users/trikilyes/Desktop/Privé/Lorett/LOLETT_Kit_Lancement.xlsx';
await wb.xlsx.writeFile(outputPath);
console.log(`✅ Excel généré : ${outputPath}`);
