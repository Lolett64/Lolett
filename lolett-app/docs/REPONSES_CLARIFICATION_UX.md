# Réponses aux questions de clarification — Recommandations UX PLP

**Date:** 18 février 2026  
**Basé sur:** Analyse du codebase existant

---

## 📋 Réponses aux 10 questions

### **1. Positionnement & Audience**

**Réponse basée sur le PRD (A-PRD.md) :**

- **Positionnement prix:** Milieu de gamme à premium accessible
  - Fourchette observée dans les données: 35€ - 129€
  - Prix moyen estimé: ~75€
  - Positionnement: "Mode accessible" avec sélection qualitative

- **Cible principale:** 
  - Âge: 20-40 ans
  - Profil: Sensibles au style, à l'authenticité et à la simplicité d'achat
  - Comportement: Recherchent des looks complets ("prêt à sortir")
  - CSP: Non spécifiée explicitement, mais prix suggèrent classe moyenne à supérieure

- **Segments secondaires:** Non définis dans le MVP, mais le concept de "looks complets" suggère une cible qui valorise la simplicité et le conseil

**Recommandation:** Conserver ce positionnement dans les recommandations UX (ton décalé, direct, complice)

---

### **2. Volumétrie produits**

**Réponse basée sur l'analyse des données (data/products.ts) :**

- **Produits par catégorie/genre:**
  - Homme: ~6 produits dans les données mockées
  - Femme: ~6 produits dans les données mockées
  - **Note:** MVP avec catalogue limité, mais structure prévue pour évoluer

- **Variantes (couleurs) par produit:**
  - Observé: 2 couleurs en moyenne par produit
  - Structure: `colors: ProductColor[]` (array JSONB en BDD)
  - Exemples: "Blanc Écume" + "Bleu Ciel", "Sable" + "Marine"

- **Fréquence d'ajout:**
  - Non spécifiée dans le code
  - Page "Nouveautés" existe avec flag `isNew`
  - **Recommandation:** Prévoir une fréquence de 5-10 nouveaux produits/mois pour le MVP

**Impact sur les recommandations:** 
- Le regroupement des variantes (R1) est d'autant plus important avec un catalogue limité
- Les filtres doivent être simples et efficaces pour un petit catalogue

---

### **3. KPIs & Métriques actuelles**

**Réponse basée sur le PRD (A-PRD.md) :**

- **Taux de conversion cible:** > 2% (objectif MVP)
- **Panier moyen:** À mesurer post-lancement (non défini actuellement)
- **Taux de rebond:** Non mesuré actuellement (pas d'analytics visible dans le code)
- **Temps moyen sur PLP:** Non mesuré

**Métriques de succès définies:**
- Taux de conversion > 2%
- Score Lighthouse > 90 (perf, a11y, SEO)
- Taux d'ajout "look complet" (à tracker)

**Recommandation:** 
- Mettre en place Google Analytics ou équivalent avant l'implémentation des améliorations UX
- Définir des KPIs de baseline avant les tests A/B

---

### **4. Stack technique**

**Réponse basée sur package.json et next.config.ts :**

- **Framework:** Next.js 16.1.6 (App Router)
- **State management:** Zustand 5.0.10 (panier, favoris)
- **Base de données:** Supabase (PostgreSQL)
- **SSR/ISR:** Capacité confirmée (Next.js App Router)
- **Performance:**
  - Score Lighthouse cible: > 90
  - Contraintes: Mobile-first, responsive

**Stack complète:**
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Radix UI (composants accessibles)
- Supabase pour BDD + Auth + Storage

**Recommandation:** 
- Utiliser SSR pour le contenu initial des PLP
- ISR avec revalidation 5-10 min pour les filtres
- Client-side pour les interactions filtres/tri (Zustand ou URL params)

---

### **5. Merchandising**

**Réponse basée sur l'analyse du code :**

- **Produits mis en avant:**
  - Badge "Nouveau" (`isNew: true`)
  - Badge "Stock faible" (si `stock <= STOCK.LOW_THRESHOLD`)
  - Badge "Victime de son succès" (si `stock === 0`)
  - Pas de système de "best-sellers" actuellement

- **Logique de tri par défaut:**
  - Actuellement: "newest" (nouveautés)
  - Options disponibles: `newest`, `price-asc`, `price-desc`
  - **Recommandation:** Ajouter "bestsellers" et "rating" (si applicable)

- **Badges spéciaux:**
  - Exclusivité: Non prévu
  - Promo: Non prévu dans le MVP
  - Tags produits: `tags: string[]` (ex: ['lin', 'été', 'essentiel'])

**Recommandation:** 
- Enrichir le tri avec "Meilleures ventes" (à tracker via analytics)
- Utiliser les tags pour des filtres avancés (matière, style)

---

### **6. Gestion des variantes**

**Réponse basée sur le schéma BDD et types :**

- **Structure actuelle:**
  - **Un seul produit** avec attributs `colors: ProductColor[]`
  - Chaque produit a: `sizes: Size[]`, `colors: ProductColor[]`, `stock: number`
  - **Pas de variantes séparées** en BDD (pas de table `product_variants`)

- **Stock par variante:**
  - Actuellement: Stock global par produit (`stock: number`)
  - **Limitation:** Pas de gestion stock par couleur/taille combinée
  - **Recommandation:** Pour MVP, garder stock global; prévoir évolution V2

- **Images par couleur:**
  - Structure: `images: string[]` (array d'URLs)
  - Pas de mapping explicite couleur → image
  - **Recommandation:** Si images varient par couleur, prévoir mapping ou convention de nommage

**Impact sur R1 (Regroupement variantes):**
- ✅ Facile à implémenter: les couleurs sont déjà dans le même produit
- ⚠️ Attention: Si images différentes par couleur, prévoir logique de mapping
- ⚠️ Stock global peut créer confusion si certaines tailles/couleurs épuisées

---

### **7. Filtres prioritaires**

**Réponse basée sur le code et le PRD :**

- **Filtres actuellement disponibles:**
  - ❌ Aucun filtre utilisateur final (seulement admin)
  - ✅ Tri: nouveautés, prix croissant/décroissant
  - ✅ Navigation par catégories (Hauts, Bas, Chaussures, Accessoires)

- **Filtres mentionnés dans le PRD comme "V2":**
  - Filtres (prix, couleur, taille) → **À implémenter maintenant selon recommandations**

- **Filtres spécifiques mode méditerranéenne:**
  - Tags produits: `tags: string[]` (ex: 'lin', 'été', 'essentiel', 'casual')
  - **Recommandation:** Utiliser tags pour filtres "Matière" (lin, coton) et "Style" (casual, classique)

**Priorisation recommandée:**
1. **Essentiels:** Prix, Couleur, Taille (R3)
2. **Secondaires:** Marque (si multi-marque), Tags/Matière
3. **Avancés:** Note moyenne (si système d'avis), Longueur manche (si applicable)

---

### **8. Tailles & équivalences**

**Réponse basée sur types/index.ts :**

- **Familles de tailles actuellement:**
  ```typescript
  type Size = 'TU' | 'XS' | 'S' | 'M' | 'L' | 'XL';
  ```
  - **Limitation:** Seulement tailles alpha, pas de tailles numériques
  - **TU:** Taille unique (pour accessoires)

- **Équivalences internationales:**
  - ❌ Non prévues actuellement
  - **Recommandation:** Ajouter mapping FR/EU/US/UK pour V2

- **Guides de tailles:**
  - ❌ Non présents dans le code
  - **Recommandation:** Créer page "Guide des tailles" avec tableaux par catégorie

**Impact sur R5 (Filtre taille groupé):**
- ⚠️ **Problème:** Structure actuelle ne supporte que tailles alpha
- **Solution immédiate:** Grouper par type (Alpha, Taille Unique)
- **Évolution nécessaire:** Étendre le type `Size` pour supporter tailles numériques (34, 36, 38, etc.)

**Recommandation d'implémentation:**
```typescript
// Évolution proposée
type SizeFamily = 'alpha' | 'numeric' | 'waist' | 'length' | 'unique';

interface Size {
  value: string; // 'S', 'M', '38', '40', etc.
  family: SizeFamily;
  eu?: string; // Équivalence EU si applicable
  us?: string; // Équivalence US si applicable
}
```

---

### **9. Page Nouveautés**

**Réponse basée sur le code :**

- **Critère de "nouveauté":**
  - Flag `isNew: boolean` dans le produit
  - Date `createdAt` disponible
  - **Recommandation:** Utiliser les deux (flag + date récente < 30-60 jours)

- **Durée de vie:**
  - Non définie dans le code
  - **Recommandation:** 30-60 jours après `createdAt` ou jusqu'à changement manuel du flag

- **Différenciation visuelle:**
  - Badge "Nouveau" déjà présent sur ProductCard
  - Page dédiée `/nouveautes` existe
  - **Recommandation:** Renforcer avec regroupements "Cette semaine", "Ce mois"

**Structure actuelle:**
- Page: `/nouveautes`
- Composant: `NouveautesContent`
- Requête: `productRepository.findMany({ isNew: true })`
- Tri: Par défaut "newest" (mais logique actuelle trie seulement par prix)

**Recommandation:** 
- Ajouter tri par `createdAt` DESC pour vraies nouveautés récentes
- Afficher date de dernière mise à jour dans le hero

---

### **10. Accessibilité & Performance**

**Réponse basée sur le PRD et la stack :**

- **Niveau d'accessibilité:**
  - Score Lighthouse cible: > 90 (a11y)
  - Composants Radix UI utilisés (accessibles par défaut)
  - **Recommandation:** WCAG 2.1 AA minimum (confirmé par score Lighthouse)

- **Contraintes de chargement:**
  - Mobile-first (confirmé dans PRD)
  - Performance Lighthouse > 90
  - **Recommandation:** Optimiser pour 3G/4G (LCP < 2.5s, FID < 100ms)

- **Support navigateurs:**
  - Non spécifié explicitement
  - Next.js 16 + React 19 suggèrent navigateurs modernes
  - **Recommandation:** 
    - Chrome/Edge/Firefox/Safari dernières 2 versions
    - IE11 exclu (React 19 ne le supporte pas)

**Performance actuelle:**
- Images: Next.js Image avec optimization
- Lazy loading: À vérifier/implémenter pour images produits
- Code splitting: Next.js le fait automatiquement

**Recommandations prioritaires:**
- ✅ Lazy load images produits hors viewport
- ✅ Précharger 2e image au hover (desktop)
- ✅ Debounce filtres (300ms)
- ✅ Virtualisation si >100 produits (non applicable MVP)

---

## 📊 Synthèse des réponses

### **Points confirmés pour les recommandations:**

1. ✅ **Regroupement variantes (R1):** Facile (structure déjà en place)
2. ✅ **Filtres (R3):** Nécessaire (absents actuellement, prévus V2)
3. ✅ **Tri enrichi (R4):** Simple à ajouter (structure existe)
4. ⚠️ **Filtre taille (R5):** Nécessite évolution du type `Size`
5. ✅ **3+ images (R2):** Faisable (array `images` existe)
6. ✅ **Page Nouveautés (R7):** Amélioration de l'existant

### **Points nécessitant clarification client:**

1. **Volumétrie réelle:** Combien de produits en production ?
2. **Fréquence nouveautés:** Combien de nouveaux produits/mois ?
3. **Images par couleur:** Les images varient-elles selon la couleur ?
4. **Stock par variante:** Faut-il gérer stock couleur+taille ou global suffit ?
5. **Équivalences tailles:** Faut-il prévoir FR/EU/US/UK dès maintenant ?

### **Recommandations d'évolution technique:**

1. **Étendre le type `Size`** pour supporter tailles numériques
2. **Ajouter mapping couleur → images** si images différentes
3. **Tracker analytics** avant implémentation pour baseline KPIs
4. **Créer guide des tailles** (page dédiée)

---

## 🎯 Priorisation ajustée selon réponses

### **Phase 1 (Impact Fort, Faisable immédiatement) — 2-3 semaines**
1. ✅ R4: Tri enrichi (S) — Structure existe
2. ✅ R1: Regroupement variantes (M) — Données déjà structurées
3. ✅ R3: Système de filtres MVP (M) — Prix/Couleur/Taille alpha
4. ✅ C4: Chips filtres actifs (S)

### **Phase 2 (Impact Moyen-Fort, Nécessite ajustements) — 2-3 semaines**
5. ✅ R2: 3+ visuels par produit (M)
6. ⚠️ R5: Filtre taille groupé (M) — Nécessite évolution type Size
7. ✅ R8: Load more vs infinite scroll (M)
8. ✅ C5: États vides améliorés (S)

### **Phase 3 (Impact Moyen, Évolutions) — 1-2 semaines**
9. ✅ R7: Différenciation page Nouveautés (M)
10. ✅ R6: Différenciation catégories (S)
11. ⚠️ Évolution type Size pour tailles numériques
12. ⚠️ Mapping couleur → images si nécessaire

---

**Document créé le:** 18 février 2026  
**Version:** 1.0  
**Basé sur:** Analyse du codebase LOLETT
