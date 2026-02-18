# Recommandations UX/UI — Pages PLP (Hommes, Femmes, Nouveautés)

**Date:** 18 février 2026  
**Contexte:** Amélioration UX des pages de listing produits (mobile-first)  
**Objectifs:** Augmenter conversion, panier moyen, réduire rebond, améliorer la découverte produit

---

## 📋 Questions de clarification — RÉPONSES

> **Note:** Les réponses ont été analysées à partir du codebase existant. Voir le document `REPONSES_CLARIFICATION_UX.md` pour les détails complets.

### 1. **Positionnement & Audience** ✅
- **Positionnement prix:** Milieu de gamme à premium accessible (35€ - 129€, moyenne ~75€)
- **Cible principale:** 20-40 ans, sensibles au style et à l'authenticité, recherchent des looks complets
- **Segments secondaires:** Non définis dans le MVP

### 2. **Volumétrie produits** ✅
- **Produits par catégorie/genre:** ~6 produits dans les données mockées (MVP avec catalogue limité)
- **Variantes (couleurs):** 2 couleurs en moyenne par produit
- **Fréquence d'ajout:** Non spécifiée (recommandation: 5-10 nouveaux produits/mois)

### 3. **KPIs & Métriques actuelles** ⚠️
- **Taux de conversion cible:** > 2% (objectif MVP)
- **Panier moyen:** À mesurer post-lancement
- **Taux de rebond:** Non mesuré actuellement
- **Recommandation:** Mettre en place analytics avant implémentation pour baseline

### 4. **Stack technique** ✅
- **Framework:** Next.js 16.1.6 (App Router)
- **State management:** Zustand 5.0.10
- **SSR/ISR:** Capacité confirmée (recommandation: ISR 5-10 min pour filtres)
- **Performance:** Score Lighthouse > 90 cible

### 5. **Merchandising** ✅
- **Produits mis en avant:** Badge "Nouveau" (`isNew`), badges stock
- **Tri par défaut:** "newest" (nouveautés)
- **Badges spéciaux:** Tags produits disponibles (`tags: string[]`)

### 6. **Gestion des variantes** ✅
- **Structure:** Un seul produit avec `colors: ProductColor[]` (pas de variantes séparées)
- **Stock:** Global par produit (pas de stock couleur+taille)
- **Images:** Array `images: string[]` (pas de mapping explicite couleur → image)
- **Impact:** R1 (regroupement variantes) facile à implémenter

### 7. **Filtres prioritaires** ⚠️
- **Actuellement:** Aucun filtre utilisateur final (seulement admin)
- **Recommandation:** Implémenter prix, couleur, taille (prévus V2 dans PRD)
- **Tags disponibles:** Utilisables pour filtres "Matière" (lin, coton) et "Style"

### 8. **Tailles & équivalences** ⚠️
- **Familles actuelles:** Seulement tailles alpha (`'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL'`)
- **Équivalences:** Non prévues actuellement
- **Impact:** R5 nécessite évolution du type `Size` pour supporter tailles numériques
- **Recommandation:** Créer guide des tailles (page dédiée)

### 9. **Page Nouveautés** ✅
- **Critère:** Flag `isNew: boolean` + date `createdAt`
- **Durée de vie:** Non définie (recommandation: 30-60 jours)
- **Différenciation:** Badge "Nouveau" présent, page dédiée existe

### 10. **Accessibilité & Performance** ✅
- **Accessibilité:** WCAG 2.1 AA (score Lighthouse > 90)
- **Performance:** Mobile-first, LCP < 2.5s, FID < 100ms
- **Navigateurs:** Modernes (IE11 exclu - React 19)

---

## A) Recommandations par page

### 🎯 Page "Hommes" (`/shop/homme`)

#### **R1: Regroupement des variantes de couleur dans une seule carte produit**
- **Problème résolu:** Duplication des produits par couleur crée de l'encombrement, confusion, et rend difficile l'estimation de l'assortiment réel.
- **Solution:** 
  - Afficher une seule carte produit par SKU parent
  - Intégrer des swatches de couleur (cercles colorés) sous l'image principale
  - Permettre le changement de couleur via swipe/tap sur les swatches (mise à jour de l'image principale)
  - Afficher le nombre de couleurs disponibles ("3 couleurs disponibles")
- **Effort:** M (2-3 jours)
- **Impact attendu:** Fort
- **KPI associé:** 
  - Réduction du nombre de clics pour explorer les variantes (-40%)
  - Augmentation du taux de clic vers PDP (+15%)
  - Réduction du taux de rebond (-10%)

#### **R2: Affichage de 3+ visuels par produit dans la liste**
- **Problème résolu:** 1-2 images poussent trop souvent à ouvrir la PDP juste pour "voir", augmentant le taux de rebond.
- **Solution:**
  - Mobile: Swipe horizontal sur la carte produit (indicateurs de pagination)
  - Desktop: Hover pour voir la 2e image, clic pour ouvrir un lightbox avec toutes les images
  - Précharger la 2e image au hover (lazy loading pour les suivantes)
  - Afficher un compteur "1/3" en overlay
- **Effort:** M (2-3 jours)
- **Impact attendu:** Moyen-Fort
- **KPI associé:**
  - Réduction du taux de rebond PDP (-20%)
  - Augmentation du temps passé sur PLP (+30%)
  - Augmentation du taux de conversion PLP → Panier (+10%)

#### **R3: Système de filtres multi-sélection avec récapitulatif**
- **Problème résolu:** Absence de filtres empêche la découverte ciblée, oblige à parcourir tous les produits.
- **Solution:**
  - Filtres essentiels: Prix (slider ou fourchettes), Couleur (swatches multi-sélection), Taille (groupées par famille), Marque, Note moyenne (si applicable)
  - Modal plein écran sur mobile avec bouton "Voir X résultats"
  - Sidebar sur desktop (collapsible)
  - Chips de récapitulatif au-dessus de la grille avec suppression en 1 clic
  - Compteur de résultats en temps réel
- **Effort:** L (5-7 jours)
- **Impact attendu:** Fort
- **KPI associé:**
  - Augmentation du temps passé sur PLP (+50%)
  - Réduction du taux de rebond (-25%)
  - Augmentation du taux de conversion (+20%)

#### **R4: Tri enrichi avec options essentielles**
- **Problème résolu:** Tri limité à 3 options bloque certaines décisions d'achat.
- **Solution:**
  - Ajouter: "Meilleures ventes", "Note moyenne", "Prix croissant", "Prix décroissant", "Nouveautés", "Pertinence" (recherche)
  - Conserver le tri actuel mais enrichir les options
  - Afficher le tri sélectionné de manière visible
- **Effort:** S (1 jour)
- **Impact attendu:** Moyen
- **KPI associé:**
  - Augmentation de l'engagement (+15%)
  - Amélioration du panier moyen (+5%)

#### **R5: Filtre Taille avec groupement par familles**
- **Problème résolu:** Mélange de tailles alpha/numériques non structuré crée des erreurs et de la défiance.
- **Solution:**
  - Grouper par familles: "Tailles Alpha" (XS, S, M, L, XL), "Tailles Numériques" (34-50), "Tour de taille" (si applicable), "Longueur/Entrejambe" (si applicable)
  - Afficher les équivalences (ex: "M = 38-40")
  - Badge "En stock" sur les tailles disponibles
  - Message "Taille indisponible ? Voir équivalences" avec tooltip
  - Microcopy rassurant: "En stock dans 4 tailles"
- **Effort:** M (3-4 jours)
- **Impact attendu:** Fort
- **KPI associé:**
  - Réduction des erreurs de taille (-30%)
  - Augmentation de la confiance (mesure via enquête)
  - Réduction des retours (-15%)

---

### 🎯 Page "Femmes" (`/shop/femme`)

*Les recommandations R1 à R5 s'appliquent également à la page Femmes avec les mêmes priorités et impacts.*

#### **R6: Différenciation visuelle des catégories**
- **Problème résolu:** Navigation entre catégories peu claire, manque de hiérarchie visuelle.
- **Solution:**
  - Améliorer les pills de catégories avec icônes (optionnel)
  - Ajouter un filtre rapide "Vêtements / Chaussures / Accessoires" au-dessus des catégories
  - Badge de compteur sur chaque catégorie ("Robes (12)")
- **Effort:** S (1 jour)
- **Impact attendu:** Moyen
- **KPI associé:**
  - Augmentation de la navigation inter-catégories (+25%)
  - Réduction du taux de rebond (-8%)

---

### 🎯 Page "Nouveautés" (`/nouveautes`)

#### **R7: Différenciation de la page catégorie**
- **Problème résolu:** La page Nouveautés ressemble trop à une catégorie classique, manque de fraîcheur et d'urgence.
- **Solution:**
  - Hero avec badge "Fresh arrivals" et date de dernière mise à jour
  - Tri par défaut: "Plus récentes" (date d'ajout)
  - Regroupements rapides: "Ajoutées cette semaine", "Ajoutées ce mois"
  - Filtres pré-appliqués optionnels: "Vêtements uniquement", "Accessoires uniquement"
  - Badge "Nouveau" plus visible (animation subtile au survol)
  - Compteur "X nouveautés cette semaine"
- **Effort:** M (2-3 jours)
- **Impact attendu:** Moyen-Fort
- **KPI associé:**
  - Augmentation du taux de visite répétée (+30%)
  - Augmentation du panier moyen (+10%)
  - Réduction du temps de découverte (-20%)

#### **R8: Remplacement de l'infinite scroll par "Load more"**
- **Problème résolu:** Infinite scroll pur complique le retour à un item, l'accès au footer, pose des problèmes d'accessibilité et peut nuire au SEO.
- **Solution:**
  - Pagination avec "Load more" (bouton visible)
  - Afficher "X-Y sur Z produits" pour repérage
  - Option "Voir tout" pour charger d'un coup (avec avertissement performance)
  - Scroll fluide vers le haut après chargement
  - Préserver l'URL avec paramètres de pagination pour partage
- **Effort:** M (2 jours)
- **Impact attendu:** Moyen
- **KPI associé:**
  - Amélioration de l'accessibilité (mesure via audit)
  - Réduction du taux de rebond (-12%)
  - Amélioration du SEO (indexation)

#### **R9: État vide amélioré pour 0 résultat**
- **Problème résolu:** Message générique "Aucun produit trouvé" ne guide pas l'utilisateur.
- **Solution:**
  - Message contextuel: "Aucune nouveauté pour le moment"
  - Suggestions: "Découvrir la collection Femme", "Découvrir la collection Homme"
  - CTA vers newsletter pour être alerté des nouveautés
  - Illustration ou image de marque
- **Effort:** S (0.5 jour)
- **Impact attendu:** Faible-Moyen
- **KPI associé:**
  - Réduction du taux de rebond sur état vide (-40%)
  - Augmentation des inscriptions newsletter (+15%)

---

## B) Wireframes textuels

### 📱 Mobile — Page Hommes/Femmes

```
┌─────────────────────────────────┐
│ [← Retour]  Shop / Homme       │ Header
├─────────────────────────────────┤
│                                 │
│    [Hero Image - 280px]        │ Hero banner
│    "Pour Lui"                   │
│    Collection Homme             │
│                                 │
├─────────────────────────────────┤
│ [🔍 Filtres] [Trier ▼]         │ Toolbar (sticky)
│ "42 produits"                   │
├─────────────────────────────────┤
│ [Tout] [Hauts] [Bas] [Chaussures]│ Catégories (scroll horizontal)
├─────────────────────────────────┤
│ [Noir] [Bleu] [Prix: 50-100€]   │ Chips filtres actifs
│ [×] [×]                         │
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐               │
│ │[IMG] │ │[IMG] │               │ Grille produits
│ │ 1/3  │ │ 1/2  │               │ (2 colonnes)
│ │      │ │      │               │
│ │Nom   │ │Nom   │               │
│ │89€   │ │95€   │               │
│ └──────┘ └──────┘               │
│ ┌──────┐ ┌──────┐               │
│ │[IMG] │ │[IMG] │               │
│ │      │ │      │               │
│ └──────┘ └──────┘               │
├─────────────────────────────────┤
│        [Charger plus]           │ Pagination
│     "12-24 sur 42 produits"     │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

### 💻 Desktop — Page Hommes/Femmes

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (navigation principale)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    [Hero Image - Full width, 400px]                            │
│    "Pour Lui" | Collection Homme                                │
│                                                                 │
├──────────────┬──────────────────────────────────────────────────┤
│              │ [Tout] [Hauts] [Bas] [Chaussures] [Accessoires]  │
│              ├──────────────────────────────────────────────────┤
│              │ "42 produits"              [Trier ▼]             │
│              ├──────────────────────────────────────────────────┤
│              │ [Noir] [Bleu] [Prix: 50-100€] [×] [×]           │
│              ├──────────────────────────────────────────────────┤
│ FILTRES      │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│ (Sidebar)    │ │IMG │ │IMG │ │IMG │ │IMG │                    │
│              │ │1/3 │ │1/2 │ │1/3 │ │1/2 │                    │
│ [Prix]       │ │    │ │    │ │    │ │    │                    │
│ 50€ ──── 200€│ │Nom │ │Nom │ │Nom │ │Nom │                    │
│              │ │89€ │ │95€ │ │89€ │ │95€ │                    │
│ [Couleur]    │ └────┘ └────┘ └────┘ └────┘                    │
│ ○ Noir       │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│ ○ Bleu       │ │IMG │ │IMG │ │IMG │ │IMG │                    │
│ ○ Blanc      │ │    │ │    │ │    │ │    │                    │
│              │ └────┘ └────┘ └────┘ └────┘                    │
│ [Taille]     │                                                    │
│ Alpha:       │                                                    │
│ ☑ S ☑ M ☑ L │                                                    │
│              │                                                    │
│ [Marque]     │                                                    │
│ ☑ LOLETT     │                                                    │
│              │                                                    │
│ [Réinitialiser]                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### 📱 Mobile — Page Nouveautés

```
┌─────────────────────────────────┐
│ [← Retour]  Nouveautés          │ Header
├─────────────────────────────────┤
│                                 │
│    [Hero Image]                 │ Hero
│    "Fresh arrivals"             │
│    Fraîchement débarquées       │
│    "Mis à jour il y a 2 jours"  │
├─────────────────────────────────┤
│ [Cette semaine] [Ce mois] [Tout]│ Regroupements rapides
├─────────────────────────────────┤
│ "18 nouveautés"  [Trier ▼]     │ Toolbar
├─────────────────────────────────┤
│ ┌──────┐ ┌──────┐               │
│ │[IMG] │ │[IMG] │               │ Grille
│ │✨NEW │ │✨NEW │               │ (badge visible)
│ │      │ │      │               │
│ └──────┘ └──────┘               │
├─────────────────────────────────┤
│        [Charger plus]           │
│     "12-24 sur 18 produits"     │
└─────────────────────────────────┘
```

---

## C) Spécifications composants

### **C1: Carte Produit enrichie**

#### Structure
```tsx
<ProductCard>
  <ImageContainer>
    <PrimaryImage />
    <SecondaryImage /> (hover/swipe)
    <TertiaryImage /> (swipe mobile)
    <ImageCounter> "1/3" </ImageCounter>
    <Badges>
      <NewBadge /> (si isNew)
      <LowStockBadge /> (si stock faible)
      <SoldOutBadge /> (si stock = 0)
    </Badges>
    <FavoriteButton /> (coeur)
  </ImageContainer>
  
  <ColorSwatches>
    <Swatch color="#000" active />
    <Swatch color="#1B3A57" />
    <Swatch color="#F5F5F5" />
    <MoreIndicator> "+2" </MoreIndicator>
  </ColorSwatches>
  
  <ProductInfo>
    <Name />
    <Price />
  </ProductInfo>
  
  <QuickActions> (desktop hover)
    <AddToCartButton />
    <SizeSelector /> (si plusieurs tailles)
  </QuickActions>
</ProductCard>
```

#### États
- **Par défaut:** Image principale, swatches visibles, nom/prix
- **Hover (desktop):** Image secondaire, actions rapides apparaissent
- **Swipe (mobile):** Navigation entre images avec indicateurs
- **Stock faible:** Badge "Plus que X", opacité réduite
- **Épuisé:** Opacité 75%, badge "Victime de son succès", bouton désactivé
- **Nouveau:** Badge "Nouveau" avec animation subtile

#### Interactions
- **Clic sur image/carte:** Navigation vers PDP
- **Clic sur swatch:** Changement d'image principale (si images différentes par couleur)
- **Swipe horizontal:** Navigation entre images (mobile)
- **Hover:** Affichage image secondaire + actions (desktop)
- **Clic sur favori:** Ajout/retrait des favoris (feedback visuel)

---

### **C2: Système de tri**

#### Structure
```tsx
<ProductSorting>
  <Select>
    <Option value="newest">Nouveautés</Option>
    <Option value="bestsellers">Meilleures ventes</Option>
    <Option value="rating">Note moyenne</Option>
    <Option value="price-asc">Prix croissant</Option>
    <Option value="price-desc">Prix décroissant</Option>
    <Option value="relevance">Pertinence</Option> (si recherche)
  </Select>
</ProductSorting>
```

#### Comportement
- Tri appliqué immédiatement (pas de bouton "Appliquer")
- URL mise à jour avec paramètre `?sort=price-asc`
- Compteur de résultats mis à jour
- Scroll vers le haut de la grille après tri

---

### **C3: Filtres mobile (modal plein écran)**

#### Structure
```tsx
<FilterModal>
  <Header>
    <Title>Filtres</Title>
    <CloseButton />
  </Header>
  
  <FilterSections>
    <PriceFilter>
      <RangeSlider min={0} max={500} />
      <PriceDisplay> "50€ - 200€" </PriceDisplay>
    </PriceFilter>
    
    <ColorFilter>
      <MultiSelect>
        <SwatchCheckbox color="#000" label="Noir" />
        <SwatchCheckbox color="#1B3A57" label="Bleu" />
        ...
      </MultiSelect>
    </ColorFilter>
    
    <SizeFilter>
      <SizeGroup title="Tailles Alpha">
        <Checkbox>S</Checkbox>
        <Checkbox>M</Checkbox>
        <Checkbox>L</Checkbox>
        <EquivalenceTooltip> "M = 38-40" </EquivalenceTooltip>
      </SizeGroup>
      <SizeGroup title="Tailles Numériques">
        <Checkbox>38</Checkbox>
        <Checkbox>40</Checkbox>
        ...
      </SizeGroup>
    </SizeFilter>
    
    <BrandFilter>
      <Checkbox>LOLETT</Checkbox>
    </BrandFilter>
  </FilterSections>
  
  <Footer>
    <ResetButton>Réinitialiser</ResetButton>
    <ApplyButton count={42}>Voir 42 résultats</ApplyButton>
  </Footer>
</FilterModal>
```

#### Comportement
- Ouverture depuis bouton "Filtres" dans la toolbar
- Compteur de résultats en temps réel dans le bouton "Voir X résultats"
- Fermeture après application des filtres
- Réinitialisation possible depuis le footer

---

### **C4: Chips de filtres actifs**

#### Structure
```tsx
<ActiveFilters>
  <FilterChip>
    <Label>Noir</Label>
    <RemoveButton>×</RemoveButton>
  </FilterChip>
  <FilterChip>
    <Label>Prix: 50-100€</Label>
    <RemoveButton>×</RemoveButton>
  </FilterChip>
  <ClearAllButton>Tout effacer</ClearAllButton>
</ActiveFilters>
```

#### Comportement
- Affichage au-dessus de la grille produits
- Suppression individuelle en 1 clic
- Bouton "Tout effacer" pour réinitialiser tous les filtres
- Scroll horizontal si beaucoup de chips (mobile)
- Masquage si aucun filtre actif

---

### **C5: État vide (0 résultat)**

#### Structure
```tsx
<EmptyState>
  <Illustration /> (ou image de marque)
  <Title>Aucun produit trouvé</Title>
  <Message>
    Aucun produit ne correspond à vos critères.
    Essayez de modifier vos filtres.
  </Message>
  <Actions>
    <Button onClick={clearFilters}>Réinitialiser les filtres</Button>
    <Button href="/shop/femme">Découvrir la collection Femme</Button>
    <Button href="/shop/homme">Découvrir la collection Homme</Button>
  </Actions>
  <NewsletterCTA>
    <Text>Être alerté des nouveautés</Text>
    <EmailInput />
    <SubscribeButton />
  </NewsletterCTA>
</EmptyState>
```

#### Variantes
- **Nouveautés:** "Aucune nouveauté pour le moment"
- **Filtres actifs:** "Aucun produit ne correspond à vos critères"
- **Recherche:** "Aucun résultat pour '[terme]'"

---

### **C6: État "Stock faible"**

#### Affichage
- Badge sur la carte produit: "Plus que X"
- Opacité légèrement réduite (90%)
- Badge de couleur warning (orange/ambre)
- Message dans la PDP: "Stock limité — Plus que X disponibles"

---

## D) 8 hypothèses d'A/B tests

### **Test 1: Regroupement variantes vs duplication**
- **Hypothèse:** Regrouper les variantes de couleur dans une seule carte avec swatches augmente le taux de clic vers PDP.
- **Variante A (contrôle):** Cartes séparées par couleur (état actuel)
- **Variante B:** Carte unique avec swatches de couleur
- **KPI principal:** Taux de clic vers PDP
- **KPI secondaires:** Temps passé sur PLP, taux de rebond
- **Segments:** Tous les utilisateurs
- **Durée:** 2 semaines
- **Risques:** Confusion si les images ne varient pas par couleur

---

### **Test 2: 3+ images vs 2 images**
- **Hypothèse:** Afficher 3+ images par produit réduit le taux de rebond et augmente la conversion.
- **Variante A (contrôle):** 2 images (état actuel)
- **Variante B:** 3+ images avec swipe/lightbox
- **KPI principal:** Taux de rebond PDP
- **KPI secondaires:** Temps passé sur PLP, taux de conversion PLP → Panier
- **Segments:** Mobile uniquement (où l'impact est le plus fort)
- **Durée:** 3 semaines
- **Risques:** Impact performance si images non optimisées

---

### **Test 3: Filtres sidebar vs modal mobile**
- **Hypothèse:** Modal plein écran pour filtres mobile améliore l'engagement vs sidebar.
- **Variante A:** Sidebar slide-in (comme desktop)
- **Variante B:** Modal plein écran avec bouton "Voir X résultats"
- **KPI principal:** Taux d'utilisation des filtres
- **KPI secondaires:** Nombre de filtres appliqués, taux de conversion
- **Segments:** Mobile uniquement
- **Durée:** 2 semaines
- **Risques:** Aucun (test UX pur)

---

### **Test 4: Chips filtres visibles vs masqués**
- **Hypothèse:** Afficher les chips de filtres actifs au-dessus de la grille améliore la compréhension et réduit les abandons.
- **Variante A (contrôle):** Chips masqués (état actuel si applicable)
- **Variante B:** Chips visibles avec suppression en 1 clic
- **KPI principal:** Taux d'abandon après filtrage
- **KPI secondaires:** Nombre de filtres appliqués, taux de conversion
- **Segments:** Tous les utilisateurs
- **Durée:** 2 semaines
- **Risques:** Aucun

---

### **Test 5: Tri "Meilleures ventes" par défaut vs "Nouveautés"**
- **Hypothèse:** Trier par "Meilleures ventes" par défaut augmente le panier moyen.
- **Variante A (contrôle):** Tri "Nouveautés" par défaut
- **Variante B:** Tri "Meilleures ventes" par défaut
- **KPI principal:** Panier moyen
- **KPI secondaires:** Taux de conversion, revenu par visiteur
- **Segments:** Nouveaux visiteurs uniquement
- **Durée:** 4 semaines
- **Risques:** Réduction de la découverte de nouveaux produits

---

### **Test 6: Filtre taille groupé vs plat**
- **Hypothèse:** Grouper les tailles par familles (Alpha, Numérique) réduit les erreurs de sélection.
- **Variante A (contrôle):** Liste plate de toutes les tailles
- **Variante B:** Tailles groupées par familles avec équivalences
- **KPI principal:** Taux d'erreur de taille (mesuré via retours)
- **KPI secondaires:** Taux de conversion, confiance (enquête)
- **Segments:** Tous les utilisateurs
- **Durée:** 4 semaines
- **Risques:** Aucun

---

### **Test 7: "Load more" vs Infinite scroll**
- **Hypothèse:** "Load more" améliore l'accessibilité et réduit le taux de rebond vs infinite scroll.
- **Variante A (contrôle):** Infinite scroll (si applicable)
- **Variante B:** Bouton "Load more" avec compteur
- **KPI principal:** Taux de rebond
- **KPI secondaires:** Accessibilité (audit), temps passé sur page
- **Segments:** Tous les utilisateurs
- **Durée:** 3 semaines
- **Risques:** Réduction de l'engagement si moins de scroll

---

### **Test 8: Badge "Nouveau" animé vs statique**
- **Hypothèse:** Animation subtile sur le badge "Nouveau" attire l'attention sans être intrusive.
- **Variante A (contrôle):** Badge statique
- **Variante B:** Badge avec animation pulse subtile (2s)
- **KPI principal:** Taux de clic sur produits "Nouveau"
- **KPI secondaires:** Taux de conversion produits nouveaux, temps passé
- **Segments:** Page Nouveautés uniquement
- **Durée:** 2 semaines
- **Risques:** Perception de "spam" si animation trop agressive

---

## E) Checklist accessibilité / performance / SEO

### **Accessibilité (WCAG 2.1 AA)**

#### Navigation & Structure
- [ ] Ordre de tabulation logique (filtres → tri → produits)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Skip links pour accéder au contenu principal
- [ ] Landmarks ARIA (nav, main, aside pour filtres)
- [ ] Titres hiérarchiques (h1 → h2 → h3)

#### Images & Médias
- [ ] Alt text descriptif pour toutes les images produits
- [ ] Alt text contextuel ("Chemise Lin Méditerranée - Vue de dos")
- [ ] Indicateurs de pagination images accessibles (aria-label)
- [ ] Contrôles de swipe accessibles au clavier

#### Formulaires & Interactions
- [ ] Labels associés aux filtres (for/id)
- [ ] Messages d'erreur accessibles (aria-live)
- [ ] États de chargement annoncés (aria-busy)
- [ ] Boutons avec texte descriptif (pas seulement icônes)
- [ ] Swatches de couleur avec label texte (pas seulement couleur)

#### Contraste & Lisibilité
- [ ] Contraste texte/fond ≥ 4.5:1 (normal), 3:1 (grand)
- [ ] Contraste badges/fond suffisant
- [ ] Taille de police minimale 16px (mobile)
- [ ] Espacement entre éléments cliquables ≥ 44x44px (mobile)

#### Clavier & Screen Readers
- [ ] Navigation complète au clavier (Tab, Enter, Espace)
- [ ] Fermeture modales avec Escape
- [ ] Annonces screen reader pour changements dynamiques (filtres)
- [ ] États des filtres annoncés ("3 filtres actifs")

---

### **Performance**

#### Images
- [ ] Images optimisées (WebP avec fallback)
- [ ] Lazy loading pour images hors viewport
- [ ] Sizes attribute correct pour responsive
- [ ] Préchargement de la 2e image au hover (desktop)
- [ ] Compression adaptée (qualité 80-85%)

#### JavaScript
- [ ] Code splitting par route
- [ ] Composants filtres/tri chargés en lazy
- [ ] Debounce sur les filtres (300ms)
- [ ] Mémoization des calculs de tri/filtrage
- [ ] Pas de re-renders inutiles (React.memo si nécessaire)

#### Réseau
- [ ] SSR/ISR pour contenu initial (Next.js)
- [ ] Cache API pour filtres (1-5 min selon volatilité)
- [ ] Compression gzip/brotli activée
- [ ] CDN pour images statiques
- [ ] Préconnexion aux domaines externes (si applicable)

#### Core Web Vitals
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] FID < 100ms (First Input Delay)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] FCP < 1.8s (First Contentful Paint)
- [ ] TTI < 3.8s (Time to Interactive)

---

### **SEO**

#### Structure & Métadonnées
- [ ] Title unique par page (max 60 caractères)
- [ ] Meta description unique (max 160 caractères)
- [ ] Open Graph tags (og:title, og:description, og:image)
- [ ] Schema.org Product/ItemList markup
- [ ] Canonical URL pour chaque variante de filtre

#### Contenu
- [ ] H1 unique et descriptif par page
- [ ] Breadcrumbs avec schema.org
- [ ] URLs propres avec paramètres de filtre (`?color=noir&size=m`)
- [ ] Sitemap incluant toutes les pages PLP
- [ ] Robots.txt permettant l'indexation des filtres

#### Technique
- [ ] URLs canoniques pour éviter le contenu dupliqué
- [ ] Pagination avec rel="next/prev" (si applicable)
- [ ] Structured data pour produits (prix, disponibilité, note)
- [ ] Performance mobile optimale (Mobile-First Indexing)
- [ ] HTTPS activé

#### Contenu dynamique
- [ ] Filtres crawlables (URLs avec paramètres)
- [ ] État vide avec contenu alternatif (pas de page vide)
- [ ] Pagination crawlable (pas seulement infinite scroll)
- [ ] Liens internes vers catégories/produits

---

## 🎯 Priorisation recommandée

### **Phase 1 (Impact Fort, Effort Faible-Moyen) — 2-3 semaines**
1. R4: Tri enrichi (S)
2. R1: Regroupement variantes (M)
3. R3: Système de filtres (L) — version MVP avec prix/couleur/taille
4. C4: Chips filtres actifs (S)

### **Phase 2 (Impact Moyen-Fort, Effort Moyen) — 2-3 semaines**
5. R2: 3+ visuels par produit (M)
6. R5: Filtre taille groupé (M)
7. R8: Load more vs infinite scroll (M)
8. C5: États vides améliorés (S)

### **Phase 3 (Impact Moyen, Effort Variable) — 1-2 semaines**
9. R7: Différenciation page Nouveautés (M)
10. R6: Différenciation catégories (S)
11. Optimisations performance/accessibilité
12. Tests A/B sur hypothèses prioritaires

---

## 📝 Notes d'implémentation

### **Regroupement variantes**
- ✅ **Structure confirmée:** Un seul produit avec `colors: ProductColor[]` (pas de variantes séparées)
- Utiliser directement le champ `colors[]` existant
- Prévoir un fallback si certaines couleurs n'ont pas d'images spécifiques
- **Question ouverte:** Les images varient-elles selon la couleur ? Si oui, prévoir mapping ou convention de nommage

### **Filtres**
- Utiliser URLSearchParams pour la gestion des filtres (partageable, crawlable)
- Prévoir une logique de déduplication si plusieurs filtres se chevauchent
- Cache côté serveur pour les résultats de filtrage (ISR 5-10 min recommandé)
- **État actuel:** Aucun filtre utilisateur final → implémentation complète nécessaire

### **Filtre Taille**
- ⚠️ **Contrainte actuelle:** Type `Size` ne supporte que tailles alpha (`'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL'`)
- **Évolution nécessaire pour R5:** Étendre le type pour supporter tailles numériques
- **Solution MVP:** Grouper par type (Alpha, Taille Unique) uniquement
- **Évolution V2:** Ajouter tailles numériques et équivalences internationales

### **Performance**
- Lazy load des images produits hors viewport (Next.js Image avec `loading="lazy"`)
- Virtualisation de la grille si >100 produits (non applicable MVP avec ~6 produits/catégorie)
- Debounce sur les filtres (300ms) pour éviter trop de requêtes
- Précharger 2e image au hover (desktop) avec `priority={false}`

### **Accessibilité**
- Composants Radix UI déjà utilisés (accessibles par défaut)
- Tester avec screen reader (NVDA/JAWS/VoiceOver)
- Tester navigation clavier complète
- Audit avec axe DevTools ou Lighthouse (score > 90 cible)

### **Analytics**
- ⚠️ **Important:** Mettre en place Google Analytics ou équivalent avant implémentation
- Définir KPIs de baseline (taux de conversion, rebond, temps sur page)
- Tracker les interactions filtres/tri pour optimisations futures

---

**Document créé le:** 18 février 2026  
**Version:** 1.0  
**Auteur:** Expert UX/UI E-commerce Mode
