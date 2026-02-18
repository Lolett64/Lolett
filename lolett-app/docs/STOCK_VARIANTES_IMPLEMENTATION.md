# Implémentation — Gestion du stock par variante (couleur + taille)

**Date:** 18 février 2026  
**Statut:** ✅ Backend terminé, Frontend en cours

---

## ✅ Ce qui a été fait

### 1. Migration SQL (`003_product_variants.sql`)
- ✅ Création de la table `product_variants`
- ✅ Migration des données existantes (répartition du stock global)
- ✅ Index et RLS configurés
- ✅ Fonction `get_product_total_stock()` créée

### 2. Types TypeScript
- ✅ Interface `ProductVariant` ajoutée
- ✅ `Product.variants` ajouté (optionnel pour rétrocompatibilité)
- ✅ `CartItem.color` ajouté (optionnel)
- ✅ `OrderItem.color` ajouté (optionnel)

### 3. Formulaire Admin (`ProductForm.tsx`)
- ✅ Interface pour saisir le stock par variante (couleur + taille)
- ✅ Génération automatique des variantes lors de l'ajout/modification couleurs/tailles
- ✅ Calcul automatique du stock total
- ✅ Chargement des variantes existantes en mode édition

### 4. Adapters/Repositories (`lib/adapters/supabase.ts`)
- ✅ Fonction `loadProductVariants()` pour charger les variantes
- ✅ `mapProduct()` mis à jour pour inclure les variantes
- ✅ Toutes les méthodes (`findMany`, `findById`, `findBySlug`, etc.) chargent les variantes

### 5. Routes API
- ✅ `POST /api/admin/products` : Création avec variantes
- ✅ `PUT /api/admin/products/[id]` : Mise à jour avec variantes (remplacement complet)
- ✅ `GET /api/admin/products/[id]` : Chargement avec variantes

### 6. Page d'édition Admin
- ✅ Chargement des variantes depuis l'API
- ✅ Passage des variantes au formulaire

---

## ✅ Frontend terminé

### 1. Panier (`features/cart/store.ts`)
- ✅ `addItem()` accepte maintenant `color` en paramètre
- ✅ `removeItem()` et `updateQuantity()` utilisent `color`
- ✅ Logique de déduplication adaptée pour inclure la couleur

### 2. Composants Produit
- ✅ `ProductCard.tsx` : Passe la première couleur disponible au panier
- ✅ `ProductDetails.tsx` : 
  - Utilise les variantes pour calculer le stock disponible
  - Vérifie le stock pour chaque combinaison couleur+taille
  - Désactive les tailles/couleurs épuisées
  - Affiche le stock réel par variante

### 3. Composants de sélection
- ✅ `ColorSelector.tsx` : Désactive les couleurs épuisées (opacité + grayscale)
- ✅ `SizeSelector.tsx` : Désactive les tailles épuisées (line-through)

### 4. Autres composants
- ✅ `ProductLooks.tsx` : Utilise `getFirstAvailableColor()`
- ✅ `LooksSection.tsx` / `LooksSectionV2.tsx` / `LooksSectionV3.tsx` : Utilise `getFirstAvailableColor()`
- ✅ `LookCard.tsx` : Utilise `getFirstAvailableColor()`
- ✅ `HeroProductPanel.tsx` : Utilise `getFirstAvailableColor()`

### 5. Fonction utilitaire
- ✅ `lib/product-utils.ts` : Fonction `getFirstAvailableColor()` créée

### 6. Pages de listing
- ✅ `ProductCard.tsx` utilise `product.variants` pour calculer le stock total
- ✅ Badges "Stock faible" / "Épuisé" adaptés selon les variantes disponibles

### 7. Checkout (à faire lors de l'implémentation du checkout)
- [ ] Inclure la couleur dans les `OrderItem`
- [ ] Vérifier le stock avant validation de commande
- [ ] Décrémenter le stock par variante lors de la création de commande

---

## 📝 Notes techniques

### Structure des variantes
```typescript
interface ProductVariant {
  id: string;
  productId: string;
  colorName: string;  // ex: "Blanc Écume"
  colorHex: string;   // ex: "#F5F5F5"
  size: Size;         // ex: "M"
  stock: number;      // Stock pour cette combinaison
}
```

### Migration des données
La migration SQL répartit équitablement le stock global existant entre toutes les combinaisons couleur+taille. Pour les produits sans couleurs définies, une variante "Par défaut" est créée.

### Rétrocompatibilité
- Le champ `stock` global est conservé (calculé automatiquement)
- Les variantes sont optionnelles (`variants?`)
- Le panier peut fonctionner sans couleur (optionnel)

---

## 🚀 Prochaines étapes

1. **Mettre à jour le panier** pour inclure la couleur
2. **Adapter ProductDetails** pour la sélection couleur + vérification stock
3. **Tester le flux complet** : création produit → ajout panier → checkout
4. **Mettre à jour les recommandations UX** pour refléter la gestion par variante

---

**Fichiers modifiés:**
- `supabase/migrations/003_product_variants.sql`
- `types/index.ts`
- `components/admin/ProductForm.tsx`
- `lib/adapters/supabase.ts`
- `app/api/admin/products/route.ts`
- `app/api/admin/products/[id]/route.ts`
- `app/admin/products/[id]/edit/page.tsx`
