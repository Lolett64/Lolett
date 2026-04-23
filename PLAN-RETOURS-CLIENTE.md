# Plan d'action — Retours cliente LOLETT V2

## Source
Fichier : `retour lolett 2.docx` (6 captures annotées)

---

## Retour 1 — Section "L'Origine / Née dans le Sud-Ouest"
**Fichier :** `components/sections/home/BrandStorySection.tsx`
**Action :** Refonte complète
- Supprimer titre "Pensée au Sud" + les 3 paragraphes actuels
- Remplacer par : *"Je sélectionne chaque pièce comme si c'était pour moi"* + bio fondatrice personnelle
- Remplacer la photo Unsplash par photo fondatrice (placeholder en attendant)
- Photo à côté du texte de présentation

## Retour 2 — Section "Notre Vision" (looks complets)
**Fichier :** Nouveau composant `VisionSection.tsx` (section n'existe pas encore dans le code)
**Action :** Créer la section
- Garder UNIQUEMENT la phrase en or en gros : *"Nous, on te propose des looks complets."*
- Supprimer les 2 grandes phrases noires ("La plupart des sites te vendent des pièces...")
- Supprimer l'encart styliste ("C'est comme avoir une amie styliste...")

## Retour 3 — Bandeau LOLETT
**Fichier :** `MarqueeSection.tsx` ou nouveau composant
**Action :** Refonte/Création
- Bandeau pleine largeur
- Fond : `#2418a6` (couleur `lolett-blue` — la couleur du logo)
- Texte "LOLETT" en blanc (utiliser `<Logo variant="white" />`)
- Remplace le bandeau actuel avec image plage

## Retour 4 — Section 3 colonnes icônes (Matières Nobles / Style / Coupe Parfaite)
**Fichier :** Nouveau composant `FeaturesSection.tsx` (section n'existe pas encore)
**Action :** Créer avec 2 colonnes seulement
- **Matières Nobles** — Nouveau texte : *"Je privilégie des matières nobles et soigneusement choisies pour offrir à chacun un confort authentique et durable."*
- **Style du Sud-Ouest** — Garder tel quel
- **Coupe Parfaite** — SUPPRIMER (pas réalisé à Bordeaux)
- Bouton "Découvrir la Maison" en bas

## Retour 5 — Phrase signature en bas de page
**Fichier :** Nouveau composant `DisclaimerBanner.tsx` ou ajout dans Footer
**Action :** Créer
- Texte : *"LOLETT décline toute responsabilité en cas de coup de coeur."*
- Style italique, centré, en bas de page (avant le footer)
- Vient de la V1, la cliente veut la remettre

## Retour 6 — "Nos univers" → "Mon univers"
**Fichier :** Nouveau composant `UniversSection.tsx` ou section existante à trouver
**Action :** Renommer le titre
- Changer "Nos univers" → **"Mon univers"**
- Section galerie photos (homme/femme/destinations)

---

## Ordre proposé des sections (page d'accueil)

1. HeroSection
2. **VisionSection** ← nouveau (phrase or "looks complets")
3. **BandeauLolett** ← nouveau (bandeau bleu #2418a6)
4. NewArrivalsSection
5. CollectionsSection
6. LooksSection
7. **BrandStorySection** ← refaite (bio fondatrice)
8. **FeaturesSection** ← nouveau (2 colonnes icônes)
9. **UniversSection** ← nouveau ("Mon univers" galerie)
10. TestimonialsSection
11. SocialFeedSection
12. NewsletterSection
13. **DisclaimerBanner** ← nouveau (phrase signature)

---

## Notes techniques
- Palette : fond sable `#FDF5E6`, bleu `#2418a6` (lolett-blue), or `#B89547`
- Logo : `components/brand/Logo.tsx` — variant "white" pour texte blanc
- Aussi supprimer "Coupe parfaite" dans `data/categories.ts` ligne 20 (SEO description pantalons)
