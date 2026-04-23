# LOLETT — Brand Book
**Version 1.0 — Avril 2026**

---

## 1. IDENTITÉ DE MARQUE

### Nom & orthographe
- Toujours en **MAJUSCULES** : **LOLETT**
- Jamais en minuscules, jamais en italique seul
- Dans un titre mixte : `LOLETT | Mode du Sud-Ouest`

### Territoire de marque
LOLETT est une marque de mode ancrée dans le **Sud-Ouest de la France**.  
Elle propose des vêtements, bijoux et accessoires à l'esprit **solaire, méditerranéen et artisanal**.

### Positionnement
> *"Née ici, portée partout."*

Mode du Sud-Ouest pour **homme et femme**. LOLETT incarne la liberté du bord de mer, la chaleur du soleil, et une élégance décontractée — ni trop chic, ni trop casual.

### Valeurs clés
1. **Ancrage local** — inspirée du Sud-Ouest, de la Méditerranée et de l'Atlantique
2. **Solaire** — collections lumineuses, énergiques, portées à l'extérieur
3. **Artisanal** — finitions soignées, noms poétiques, produits pensés avec soin
4. **Accessible** — livraison offerte dès 100 €, esprit démocratique

---

## 2. COULEURS

### Palette principale

| Nom | Hex | Usage |
|-----|-----|-------|
| **Lolett Blue** (Primary) | `#1B0B94` | CTA, titres, accents, sélection texte |
| **Lolett Cream** (Background) | `#FDF5E6` | Fond principal |
| **Lolett Warm** | `#F9F7F2` | Fonds secondaires, cards |
| **White** | `#FFFFFF` | Texte sur fond bleu |

### Palette grise (nuances)

| Nom | Hex | Usage |
|-----|-----|-------|
| Gray 100 | `#F9F7F2` | Fond léger |
| Gray 200 | `#F2EFE8` | Séparateurs |
| Gray 300 | `#E4DFD3` | Bordures |
| Gray 400 | `#9999a8` | Texte désactivé, scrollbar |
| Gray 500 | `#6b6b7a` | Texte secondaire / muted |
| Gray 600 | `#4a4a56` | Texte tertiaire |
| Gray 900 | `#1a1a24` | Texte corps alternatif |

### Palette bleue (variations)

| Nom | Hex | Usage |
|-----|-----|-------|
| Blue Light | `#3228c4` | Hover, dégradé |
| Blue Dark | `#130970` | Pressed, ombre bleue |
| Accent Light | `#6a5fd4` | Gradient text (fin) |

### Règles d'utilisation des couleurs
- **Fond principal** : toujours `#FDF5E6` (cream) — jamais blanc pur
- **Texte principal** : `#1B0B94` sur cream, `#FFFFFF` sur bleu
- **Boutons primaires** : bleu `#1B0B94` + texte blanc
- **Boutons secondaires** : fond transparent / cream + texte bleu
- **Pas de noir pur** (#000) dans l'UI — utiliser `#1a1a24` au maximum
- **Sélection de texte** : fond `#1B0B94`, texte blanc

### Dégradés

```css
/* Gradient texte signature */
background: linear-gradient(135deg, #1B0B94 0%, #3228c4 50%, #6a5fd4 100%);

/* Ombre luxury */
box-shadow: 0 25px 50px -12px rgb(36 24 166 / 0.15);

/* Glow bleu */
box-shadow: 0 0 60px rgb(27 11 148 / 0.3);
```

---

## 3. TYPOGRAPHIE

### Familles de polices

| Rôle | Police | Caractère |
|------|--------|-----------|
| **Display / Titres** | Playfair Display | Serif élégant, éditorial |
| **Corps / UI** | DM Sans | Sans-serif moderne, lisible |
| **Complémentaire** | Montserrat | Uppercase labels, subtitles |
| **Éditoriale** | Newsreader | Longs textes, longform |

### Hiérarchie typographique

```
H1  — Playfair Display, Semibold, tracking-tight
H2  — Playfair Display, Semibold, tracking-tight
H3  — Playfair Display, Semibold, tracking-tight
Body — DM Sans, Regular, tracking normal
Label / Caps — Montserrat ou DM Sans, Uppercase, letter-spacing 0.2em
```

### Règles typographiques
- **Titres** : toujours `white-space: normal` — jamais de rupture verticale involontaire
- **Letter-spacing max** : `0.05em` (tracking-wider) dans le corps — `0.2em` uniquement pour les labels uppercase
- **Pas de** `text-wrap: pretty` — utiliser `text-wrap: balance` ou rien
- **Pas de** `<span className="block">` à l'intérieur des titres
- **Prose** : max-width `65ch` pour le confort de lecture
- Feature settings recommandés sur les textes éditoriaux : `kern`, `liga`, `calt`

---

## 4. ESPACEMENTS & LAYOUT

### Conteneurs

| Classe | Largeur max | Usage |
|--------|-------------|-------|
| `.container` | Tailwind défaut | Pages standard |
| `.container-wide` | 1600px | Sections éditoriales / hero |
| `.container-full` | 100% | Images plein écran |
| `.prose-block` | 65ch | Blocs de texte long |

### Bordures & Rayons

| Niveau | Valeur approx. | Usage |
|--------|----------------|-------|
| sm | `0.25rem` | Petits éléments (badges) |
| md | `0.375rem` | Inputs |
| lg | `0.5rem` | Cards, boutons |
| xl–4xl | jusqu'à `1rem` | Modales, drawers |

---

## 5. OMBRES

Toutes les ombres sont **très subtiles** — esprit luxury discret.

```css
--shadow-sm:      0 1px 3px 0 rgb(0 0 0 / 0.02)
--shadow-md:      0 4px 12px -1px rgb(0 0 0 / 0.04)
--shadow-lg:      0 12px 24px -4px rgb(0 0 0 / 0.05)
--shadow-xl:      0 25px 50px -12px rgb(0 0 0 / 0.06)
--shadow-product: 0 10px 40px rgb(0 0 0 / 0.05)
--shadow-luxury:  0 30px 60px -12px rgb(36 24 166 / 0.12)
--shadow-glow:    0 0 70px rgb(27 11 148 / 0.25)
```

**Règle** : préférer `shadow-luxury` (teinte bleue) aux ombres noires sur les éléments mis en avant.

---

## 6. ICONOGRAPHIE & IMAGES

### Style photo
- **Lumière naturelle**, tons chauds, extérieurs méditerranéens
- Palette : sable, eau bleue, pierre, végétation
- Modèles : vrais, naturels, diversifiés
- Pas de studio froid — toujours un contexte de vie

### Nommage produits — ADN poétique
Les produits ont des noms propres évocateurs :

**Bijoux** : Amor, Flowers, Mao, Solea, Aida, Lumen, Alto, Stria, Emoticoeurs, Keur  
**Vêtements** : Mission, Karl, Joy, Floria, Pia, Ayma, Zoe, Isa, Didi, Fefe, Me, Lola  
**Inspiration** : prénoms, mots latins/espagnols, termes évoquant soleil/lumière/mer

### Logo
- Fichier : `Logo Lolett.jpeg`
- Usage sur fond cream ou fond bleu uniquement
- Pas de rotation, déformation, ou changement de couleur

---

## 7. VOIX & TON

### Personnalité de marque
**Solaire · Authentique · Poétique · Sud**

### Formulations types

| Contexte | Bon exemple | À éviter |
|----------|-------------|----------|
| Slogan | *"Née ici, portée partout."* | "La meilleure marque du Sud" |
| Description produit | *"Un bermuda en lin à l'esprit Mistral"* | "Bermuda homme bleu taille M" |
| CTA | *"Découvrir la collection"* | "Acheter maintenant" |
| Email | *"Bonjour [Prénom],"* | "Cher(e) client(e)," |
| Livraison | *"Livraison offerte dès 100 €"* | "Free shipping above 100€" |

### Langue
- **Français exclusivement** dans toute communication cliente
- Mots-clés : soleil, été, Sud, lumière, artisanal, ancré, collection, découvrir
- Éviter : luxe ostentatoire, anglicismes marketing, ton corporatif

---

## 8. EFFETS UI & ANIMATIONS

LOLETT utilise des animations **cinématiques et douces**, jamais abruptes.

### Principes
- Durée standard : `0.8s` avec `cubic-bezier(0.33, 1, 0.68, 1)` (ease out smooth)
- Durée courte : `0.6s` pour les micro-interactions
- Durée longue : `1.2s` pour les révélations hero
- **Pas** d'animations agressives ou clignotantes

### Effets signature
```css
/* Révélation au scroll */
.scroll-reveal { opacity: 0; transform: translateY(40px); }
.scroll-reveal.is-visible { opacity: 1; transform: translateY(0); }

/* Underline animé sur les liens */
.link-underline::after { width: 0; transition: width 0.4s ease; }
.link-underline:hover::after { width: 100%; }

/* Texture grain (overlay luxe) */
.noise::before { opacity: 0.045; mix-blend-mode: soft-light; }

/* Effet verre */
.glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); }
```

### Curseur personnalisé (desktop)
- Point bleu `#1B0B94` de 8px
- Anneau bleu de 40px (→ 60px au hover)

---

## 9. E-COMMERCE

### Règles transactionnelles
- Livraison : **5,90 €** / offerte dès **100 €**
- Alerte stock faible : seuil à **3 articles**
- Format prix : style français — `29,90 €` (virgule, espace avant €)

### États produits
- **Nouveau** : badge à afficher sur les produits récents
- **Stock faible** : message d'urgence subtil (pas agressif)
- **Rupture** : taille grisée, non cliquable

---

## 10. CHECKLIST INTÉGRATION

Avant de livrer un nouvel écran ou composant :

- [ ] Fond cream (`#FDF5E6`) et non blanc pur
- [ ] Police display Playfair sur les titres
- [ ] Aucun texte en noir pur (`#000`)
- [ ] Ombres subtiles (opacité < 0.06 pour ombres noires)
- [ ] Animations ≤ 1.2s avec cubic-bezier smooth
- [ ] Texte horizontal — vérifier `white-space: normal` sur les titres
- [ ] `min-width: 0` sur tous les enfants flex/grid
- [ ] Letter-spacing ≤ `0.05em` dans le corps
- [ ] Copie en français
- [ ] Prix au format `XX,XX €`

---

*Brand Book LOLETT — usage interne. Mis à jour : Avril 2026.*
