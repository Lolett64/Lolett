# Refactorisation — Fichiers > 250 lignes

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Découper tous les fichiers > 250 lignes en modules ≤ 250 lignes, sans changer le comportement.

**Architecture:** Extraction de sous-composants, hooks custom, et fichiers de types/constantes. Chaque fichier garde son API publique intacte via des re-exports.

**Tech Stack:** React 19, Next.js 15, TypeScript, Tailwind 4

---

## Phase 1 : Les 4 plus gros fichiers

### Task 1 : ProductForm.tsx (697 → ~5 fichiers)

**Files:**
- Modify: `components/admin/ProductForm.tsx`
- Create: `components/admin/product-form/ProductFormInfoSection.tsx`
- Create: `components/admin/product-form/ProductFormColorsSection.tsx`
- Create: `components/admin/product-form/ProductFormImageSection.tsx`
- Create: `components/admin/product-form/ProductFormActions.tsx`
- Create: `components/admin/product-form/types.ts`

**Step 1:** Créer `types.ts` — extraire `ProductFormData`, `ProductColor`, `ProductVariantStock`, les constantes `AVAILABLE_SIZES`, `CATEGORIES_BY_GENDER`, et les styles partagés (`card`, `fieldLabel`, `inputBase`, etc.)

**Step 2:** Créer `ProductFormInfoSection.tsx` — section info générale (nom, slug, description, prix, genre, catégorie). Props : `formData`, `onChange`, `styles`. ~80 lignes.

**Step 3:** Créer `ProductFormColorsSection.tsx` — section tailles + couleurs + grille stocks variants. Props : `formData`, `onToggleSize`, `onAddColor`, `onRemoveColor`, `onUpdateVariantStock`, `styles`. ~120 lignes.

**Step 4:** Créer `ProductFormImageSection.tsx` — upload images + preview grid. Props : `images`, `onUpload`, `onRemove`, `styles`. ~80 lignes.

**Step 5:** Créer `ProductFormActions.tsx` — boutons submit/cancel + gestion erreurs. ~40 lignes.

**Step 6:** Refactorer `ProductForm.tsx` — garder le state + handlers, importer les sous-composants. Résultat ≤ 200 lignes.

**Step 7:** Vérifier que la page admin produits fonctionne (créer + éditer un produit).

**Step 8:** Commit `refactor(admin): split ProductForm into sub-components`

---

### Task 2 : supabase.ts (530 → ~6 fichiers)

**Files:**
- Modify: `lib/adapters/supabase.ts`
- Create: `lib/adapters/supabase-types.ts`
- Create: `lib/adapters/supabase-mappers.ts`
- Create: `lib/adapters/supabase-product.ts`
- Create: `lib/adapters/supabase-look.ts`
- Create: `lib/adapters/supabase-category.ts`
- Create: `lib/adapters/supabase-order.ts`

**Step 1:** Créer `supabase-types.ts` — extraire `DbProduct`, `DbLook`, `DbCategory`, `DbOrder`, `DbProductVariant`. ~30 lignes.

**Step 2:** Créer `supabase-mappers.ts` — extraire `mapProduct`, `mapLook`, `mapCategory`, `mapOrder`, `mapVariant`. Importe les types DB. ~100 lignes.

**Step 3:** Créer `supabase-product.ts` — `SupabaseProductRepository` + `loadProductVariants`. Exporte le singleton `productRepository`. ~130 lignes.

**Step 4:** Créer `supabase-look.ts` — `SupabaseLookRepository` + singleton. ~70 lignes.

**Step 5:** Créer `supabase-category.ts` — `SupabaseCategoryRepository` + singleton. ~40 lignes.

**Step 6:** Créer `supabase-order.ts` — `SupabaseOrderRepository` + `generateOrderNumber` + singleton. ~110 lignes.

**Step 7:** Remplacer `supabase.ts` par un barrel file qui re-exporte les 4 singletons depuis les sous-modules. ~10 lignes.

**Step 8:** Vérifier que la homepage, shop, et admin chargent correctement.

**Step 9:** Commit `refactor(adapters): split supabase adapter into domain modules`

---

### Task 3 : admin/emails/page.tsx (484 → ~4 fichiers)

**Files:**
- Modify: `app/admin/emails/page.tsx`
- Create: `components/admin/emails/useEmailEditor.ts`
- Create: `components/admin/emails/EmailListView.tsx`
- Create: `components/admin/emails/EmailFormSection.tsx`
- Create: `components/admin/emails/EmailPreviewPanel.tsx`
- Create: `components/admin/emails/EmailTestModal.tsx`

**Step 1:** Créer `useEmailEditor.ts` — hook custom avec tout le state (emailList, selectedEmail, formData, preview, testModal) + handlers (fetch, save, preview, sendTest). ~150 lignes.

**Step 2:** Créer `EmailListView.tsx` — grille des templates email (vue liste). Props : `emails`, `onSelect`. ~60 lignes.

**Step 3:** Créer `EmailFormSection.tsx` — formulaire d'édition (nom, email, objet, greeting, body, extra params). Props : `formData`, `onChange`, `variables`. ~100 lignes.

**Step 4:** Créer `EmailPreviewPanel.tsx` — iframe preview + loading state. Props : `previewHtml`, `loading`. ~40 lignes.

**Step 5:** Créer `EmailTestModal.tsx` — modale envoi test. Props : `open`, `onClose`, `onSend`, `sending`. ~60 lignes.

**Step 6:** Refactorer `page.tsx` — importer hook + composants, orchestrer la vue. ≤ 100 lignes.

**Step 7:** Vérifier admin emails (liste, édition, preview, envoi test).

**Step 8:** Commit `refactor(admin): split emails page into components + hook`

---

### Task 4 : checkout/success/page.tsx (451 → ~4 fichiers)

**Files:**
- Modify: `app/checkout/success/page.tsx`
- Create: `components/checkout/success/useOrderLoader.ts`
- Create: `components/checkout/success/SuccessContent.tsx`
- Create: `components/checkout/success/SuccessStyles.tsx`
- Create: `components/checkout/success/SuccessSkeleton.tsx`

**Step 1:** Créer `useOrderLoader.ts` — hook pour fetch commande (résolution session_id → orderId, fetch order). ~60 lignes.

**Step 2:** Créer `SuccessSkeleton.tsx` — composant loading skeleton. ~70 lignes.

**Step 3:** Créer `SuccessStyles.tsx` — toutes les animations CSS-in-JS (keyframes confetti, fade, etc.). ~170 lignes.

**Step 4:** Créer `SuccessContent.tsx` — rendu principal de la commande (récap, animations). Props : `order`. ~150 lignes.

**Step 5:** Refactorer `page.tsx` — Suspense wrapper + import des sous-composants. ≤ 30 lignes.

**Step 6:** Vérifier page checkout/success avec un orderId valide.

**Step 7:** Commit `refactor(checkout): split success page into components`

---

## Phase 2 : Fichiers 350-400 lignes

### Task 5 : CheckoutContent.tsx (397 → ~3 fichiers)

**Files:**
- Modify: `features/checkout/components/CheckoutContent.tsx`
- Create: `features/checkout/components/CheckoutStyles.tsx`
- Create: `features/checkout/components/CheckoutLayout.tsx`

**Step 1:** Créer `CheckoutStyles.tsx` — extraire les 250 lignes de CSS inline. ~250 lignes.

**Step 2:** Créer `CheckoutLayout.tsx` — le layout principal (back link, steps, cards). ~100 lignes.

**Step 3:** Refactorer `CheckoutContent.tsx` — importer styles + layout. ≤ 50 lignes.

**Step 4:** Vérifier le flux checkout complet.

**Step 5:** Commit `refactor(checkout): extract styles and layout`

---

### Task 6 : LookForm.tsx (391 → ~3 fichiers)

**Files:**
- Modify: `components/admin/LookForm.tsx`
- Create: `components/admin/look-form/LookProductSelector.tsx`
- Create: `components/admin/look-form/LookCoverUpload.tsx`

**Step 1:** Créer `LookProductSelector.tsx` — recherche + sélection produits avec chips. Props : `selectedIds`, `onToggle`, `gender`. ~150 lignes.

**Step 2:** Créer `LookCoverUpload.tsx` — upload + preview cover image. Props : `coverUrl`, `onUpload`. ~80 lignes.

**Step 3:** Refactorer `LookForm.tsx` — garder state + info fields, importer les sous-composants. ≤ 160 lignes.

**Step 4:** Vérifier admin looks (créer + éditer).

**Step 5:** Commit `refactor(admin): split LookForm into sub-components`

---

### Task 7 : NouveautesContentV2.tsx (374 → ~4 fichiers)

**Files:**
- Modify: `components/product/NouveautesContentV2.tsx`
- Create: `components/product/nouveautes/NouveautesHero.tsx`
- Create: `components/product/nouveautes/NouveautesLooks.tsx`
- Create: `components/product/nouveautes/useNouveautesFilters.ts`

**Step 1:** Créer `useNouveautesFilters.ts` — hook avec state gender, sort, filters + logique filtering/sorting. ~80 lignes.

**Step 2:** Créer `NouveautesHero.tsx` — section hero gradient. ~30 lignes.

**Step 3:** Créer `NouveautesLooks.tsx` — carousel looks horizontal. Props : `looks`. ~80 lignes.

**Step 4:** Refactorer `NouveautesContentV2.tsx` — importer hook + sous-composants. ≤ 180 lignes.

**Step 5:** Vérifier page /nouveautes.

**Step 6:** Commit `refactor(product): split NouveautesContent into sub-components`

---

### Task 8 : ProductLooks.tsx (337 → ~3 fichiers)

**Files:**
- Modify: `components/product/ProductLooks.tsx`
- Create: `components/product/looks/ProductLooksPieceCard.tsx`
- Create: `components/product/looks/useLookState.ts`

**Step 1:** Créer `useLookState.ts` — hook pour gestion state pieces (sizes, ajout panier, navigation carousel). ~80 lignes.

**Step 2:** Créer `ProductLooksPieceCard.tsx` — carte individuelle d'une pièce du look (sélecteur taille + bouton ajout). Props : `product`, `pieceState`, `onSizeChange`, `onAdd`. ~100 lignes.

**Step 3:** Refactorer `ProductLooks.tsx` — importer hook + PieceCard. ≤ 160 lignes.

**Step 4:** Vérifier section looks sur page produit.

**Step 5:** Commit `refactor(product): split ProductLooks into sub-components`

---

## Phase 3 : Fichiers 250-300 lignes

### Task 9 : supabase-user.ts (300 → ~4 fichiers)

**Files:**
- Modify: `lib/adapters/supabase-user.ts`
- Create: `lib/adapters/user/profile.ts`
- Create: `lib/adapters/user/addresses.ts`
- Create: `lib/adapters/user/social.ts` (reviews + favorites + loyalty)
- Create: `lib/adapters/user/orders.ts`

**Step 1-4:** Extraire chaque domaine dans son fichier. Re-exporter depuis `supabase-user.ts`.

**Step 5:** Commit `refactor(adapters): split supabase-user into domain modules`

---

### Task 10 : admin/contenu/page.tsx (293), admin/categories/page.tsx (290), admin/page.tsx (259)

Extraire hooks custom (`useContentEditor`, `useCategoryForm`, `useDashboardStats`) et sous-composants de rendu pour chaque page admin.

**Commit:** `refactor(admin): extract hooks from content, categories, dashboard pages`

---

### Task 11 : notre-histoire/content.tsx (288), ContactV2.tsx (279)

Extraire `useReveal` hook partagé + sections indépendantes (Hero, Origine, Vision, FAQ, Newsletter).

**Commit:** `refactor(pages): split notre-histoire and contact into sections`

---

### Task 12 : ProductCard.tsx (271), ProductFilters.tsx (267), shop/page.tsx (253)

Extraire `useTouchSwipe` hook, `ProductImageGallery`, et sections de la page shop.

**Commit:** `refactor(product): split ProductCard, Filters, shop page`

---

## Vérification finale

Après chaque phase :
1. `npm run build` — zéro erreur
2. Test manuel des pages concernées
3. Vérifier qu'aucun fichier ne dépasse 250 lignes : `find . -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20`
