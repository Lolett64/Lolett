# Refonte Admin LOLETT — Design Spec

## Contexte

L'admin actuel souffre de 3 problèmes majeurs identifiés par l'utilisatrice (Lola, fondatrice non-technique, seule utilisatrice) :
1. **Navigation difficile** — tout le contenu CMS est dans une seule page avec des accordéons, il faut scroller pour trouver un champ
2. **Labels pas clairs** — les noms de champs sont techniques, Lola ne sait pas quel champ affecte quelle partie du site
3. **Pas de preview** — les modifications se font à l'aveugle

## Décisions validées

| Choix | Décision |
|-------|----------|
| Navigation CMS | Par page du site (Accueil, Boutique, Contact, Footer...) |
| Preview | Bouton "Aperçu" ouvrant un nouvel onglet |
| Aide contextuelle | Screenshots miniatures montrant où chaque champ apparaît |
| Périmètre | Refonte complète des 9 pages admin |
| Utilisatrice | Lola seule, non-technique |

## Architecture

### Nouvelle sidebar

La sidebar garde le gradient violet `#1B0B94` → `#130866` existant. Les groupes changent :

```
📊 Tableau de bord

── Mon site ──
🏠 Accueil          → /admin/site/accueil
🛍 Boutique         → /admin/site/boutique
📖 Notre histoire   → /admin/site/notre-histoire
✉️ Contact          → /admin/site/contact
👇 Footer           → /admin/site/footer

── Catalogue ──
👕 Produits         → /admin/products        (existant, amélioré)
✨ Looks            → /admin/looks           (existant, amélioré)
📁 Catégories       → /admin/categories      (existant, amélioré)

── Gestion ──
📦 Commandes [3]    → /admin/orders          (existant, amélioré)
🏷 Promos           → /admin/promos          (existant, amélioré)
📧 Emails           → /admin/emails          (existant)

── Bas de sidebar ──
[Avatar L] Lola — Fondatrice
```

Le badge `[3]` sur Commandes affiche le nombre de commandes en statut `pending` ou `paid`.

### Pages "Mon site" — Éditeur CMS par page

Chaque page sous `/admin/site/[page]` affiche :

**Header fixe :**
- Titre de la page ("Page d'accueil")
- Sous-titre ("Modifie le contenu de la homepage")
- Bouton "👁 Aperçu" → ouvre `/{page-slug}` dans un nouvel onglet
- Bouton "Sauvegarder" (or `#C4956A`)

**Onglets par section :**
Chaque page du site est découpée en onglets correspondant à ses sections CMS :

| Page admin | Onglets |
|------------|---------|
| Accueil | Hero, Nouveautés, Notre marque, Looks, Newsletter, Sections ⚙ |
| Boutique | Hero Shop, Trust Bar, Filtres |
| Notre histoire | Intro, Fondatrice, Matières, Vidéo |
| Contact | Message Lola, Formulaire, FAQ |
| Footer | Liens, Réseaux sociaux, Copyright |

L'onglet "Sections ⚙" (accueil uniquement) reprend le SectionsManager existant (activer/désactiver/réordonner les sections de la homepage).

**Champs avec screenshots :**
Chaque champ de formulaire est accompagné d'une screenshot miniature (90px de large) montrant visuellement où ce champ apparaît sur le site. La screenshot est une image statique stockée dans `/public/admin/screenshots/`.

Structure d'un champ :
```
[Label du champ]
[Input/Textarea]          [Screenshot miniature 90px]
                          avec highlight sur la zone
```

Pour les champs simples (URLs, liens), pas de screenshot — juste le label + input.

### Mapping contenu → pages

Le contenu CMS existant (`site_content` table, clés par section) est redistribué :

| Clé CMS existante | Page admin | Onglet |
|---|---|---|
| `hero` | Accueil | Hero |
| `shop` | Boutique | Hero Shop |
| `collections` | Boutique | Filtres |
| `brand_story` | Accueil | Notre marque |
| `looks` | Accueil | Looks |
| `testimonials` | Accueil | (supprimé ou dans Sections) |
| `newsletter` | Accueil | Newsletter |
| `trust_bar` | Boutique | Trust Bar |
| `notre_histoire` | Notre histoire | Intro/Fondatrice |
| `contact` | Contact | Message Lola/Formulaire/FAQ |
| `footer` | Footer | Liens/Réseaux/Copyright |

### Améliorations par page existante

#### Dashboard (`/admin`)
- Garder les 5 KPIs existants
- Ajouter un **raccourci rapide** : "Dernières commandes" cliquable
- Ajouter lien vers "Modifier la homepage" en haut

#### Produits (`/admin/products`)
- Garder la structure actuelle (filtre + accordion par genre/catégorie)
- Ajouter **recherche par nom** dans le filtre (déjà présent mais améliorer l'UX)
- Ajouter bouton **"Dupliquer"** sur chaque produit (copie avec suffixe " (copie)")
- Harmoniser le style des boutons (tout en Tailwind, supprimer inline CSS)

#### Looks (`/admin/looks`)
- Ajouter **barre de recherche** en haut
- Ajouter **filtre par genre** (Homme/Femme/Tous)
- Garder le layout en cartes

#### Catégories (`/admin/categories`)
- Garder le formulaire inline existant
- Ajouter **auto-génération du slug** à partir du label
- Ajouter **compteur de produits** par catégorie

#### Commandes (`/admin/orders`)
- Ajouter **recherche par nom/email client**
- Ajouter **filtre par date** (aujourd'hui, 7j, 30j, tout)
- Badge compteur dans la sidebar

#### Promos (`/admin/promos`)
- **Harmoniser le style** : remplacer tout le CSS inline par Tailwind
- Ajouter **statistiques d'utilisation** (nombre de fois utilisé)
- Ajouter bouton **"Générer un code"** aléatoire

#### Emails (`/admin/emails`)
- Garder tel quel (déjà fonctionnel avec preview + test)

#### Matières (`/admin/materials`)
- Fusionner dans la page "Notre histoire" comme onglet "Matières"
- Supprimer la page standalone `/admin/materials`

## Fichiers à créer / modifier

### Nouveaux fichiers
- `app/admin/site/layout.tsx` — layout commun pour les pages "Mon site"
- `app/admin/site/accueil/page.tsx` — éditeur page d'accueil
- `app/admin/site/boutique/page.tsx` — éditeur page boutique
- `app/admin/site/notre-histoire/page.tsx` — éditeur page notre histoire
- `app/admin/site/contact/page.tsx` — éditeur page contact
- `app/admin/site/footer/page.tsx` — éditeur footer
- `components/admin/site/SitePageEditor.tsx` — composant éditeur réutilisable (header + onglets + champs)
- `components/admin/site/FieldWithScreenshot.tsx` — champ avec screenshot miniature
- `components/admin/site/PreviewButton.tsx` — bouton aperçu
- `public/admin/screenshots/*.png` — captures d'écran pour chaque section

### Fichiers à modifier
- `components/admin/AdminSidebar.tsx` — nouvelle structure de navigation
- `app/admin/products/page.tsx` — ajouter bouton dupliquer
- `app/admin/looks/page.tsx` — ajouter recherche + filtre genre
- `app/admin/categories/page.tsx` — auto-slug + compteur produits
- `app/admin/orders/page.tsx` — recherche client + filtre date
- `app/admin/promos/page.tsx` — harmoniser Tailwind + stats utilisation + générateur code

### Fichiers à supprimer
- `app/admin/contenu/page.tsx` — remplacé par les pages `/admin/site/*`
- `app/admin/materials/page.tsx` — fusionné dans Notre histoire

## Composants réutilisables

### `SitePageEditor`
Composant principal pour chaque page "Mon site". Props :
```ts
interface SitePageEditorProps {
  pageTitle: string;         // "Page d'accueil"
  pageSubtitle: string;      // "Modifie le contenu de la homepage"
  previewUrl: string;        // "/" pour accueil, "/contact" pour contact
  tabs: TabConfig[];         // sections de la page
  contentKeys: string[];     // clés CMS à charger
}
```

### `FieldWithScreenshot`
Champ avec screenshot miniature. Props :
```ts
interface FieldWithScreenshotProps {
  label: string;             // "Titre ligne 1"
  name: string;              // clé CMS
  value: string;
  onChange: (val: string) => void;
  type: 'text' | 'textarea' | 'image' | 'video' | 'url';
  screenshotSrc?: string;    // "/admin/screenshots/hero-title.png"
}
```

### Réutilisation existante
- `ContentImageUpload` — déjà fonctionnel, réutiliser tel quel
- `ContentVideoUpload` — déjà fonctionnel, réutiliser tel quel
- `SectionsManager` — déplacer dans l'onglet "Sections ⚙" de la page Accueil
- `HistoryDrawer` — garder pour le versioning

## Data flow

1. Chaque page `/admin/site/[page]` charge les clés CMS via `getSiteContent(sectionKey)`
2. Les champs sont éditables en local (state React)
3. "Sauvegarder" appelle `PUT /api/admin/content` avec les paires clé-valeur modifiées
4. "Aperçu" ouvre `window.open(previewUrl, '_blank')` — le site utilise `revalidate: 60` donc les changements sauvegardés apparaissent après refresh

## Vérification

1. Naviguer dans la sidebar → chaque page "Mon site" s'ouvre correctement
2. Modifier un champ → sauvegarder → vérifier en base que la valeur a changé
3. Cliquer "Aperçu" → nouvel onglet avec la page du site
4. Vérifier que les screenshots s'affichent à côté des champs
5. Tester la recherche/filtre sur Produits, Looks, Commandes
6. Tester le bouton dupliquer un produit
7. Vérifier le badge commandes dans la sidebar
8. `npx next build` sans erreur
