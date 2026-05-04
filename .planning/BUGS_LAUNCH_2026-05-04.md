# Bugs détectés en prod après merge — 2026-05-04

URL : https://lolettshop.com (deploiement `dpl_8NRzMgrRzJmALkbi1FMWqgcpi28T`)
Tester : Lyes (compte client perso)

---

## 🟡 BUG 1 — Favoris : 2 sources de vérité non synchronisées

**Symptôme** : `/favoris` (public) affiche "1 pièce (Isa Marron)" alors que `/compte/favoris` affiche "Aucun favori" (même utilisateur connecté).

**Cause** :
- `/favoris` lit `useFavoritesStore` (Zustand → localStorage)
- `/compte/favoris` lit la table Supabase `favorites` via `getFavorites(user.id)`
- Tous les boutons ❤️ (`ProductCard.tsx:63`, `ProductActions.tsx:55`) écrivent UNIQUEMENT dans le store Zustand. Personne n'écrit dans Supabase.

**Impact** : cosmétique, pas de perte de donnée, pas de risque sécurité. Lola/clients verront un page "Aucun favori" malgré des ❤️ actifs.

**Fix proposé** :
- **Quick fix (5 min)** : retirer la tab "Mes favoris" du menu sidebar `/compte`. L'utilisateur n'a accès qu'à `/favoris` qui marche.
- **Vrai fix (post-launch)** : brancher les boutons ❤️ sur Supabase quand user authentifié, avec sync localStorage → Supabase au login.

**Fichiers concernés** :
- `lolett-app/components/compte/SidebarMenu.tsx` (ou équivalent — masquer entrée "Mes favoris")
- `lolett-app/features/favorites/store.ts` (refacto post-launch)
- `lolett-app/components/compte/FavoritesList.tsx` (à supprimer si quick fix)

---

## 🔴 BUG 2 — Checkout étape Paiement : bouton "Payer" ne redirige pas vers Stripe

**Symptôme** : sur `/checkout` après livraison validée, étape 2 "Paiement" affiche bien le résumé commande (3 articles, 209€), mais cliquer sur "Payer 209,00 €" ne fait rien. Pas de redirection Stripe Checkout.

**Cause à investiguer** :
1. Erreur JS console au clic ?
2. Appel API `/api/checkout/stripe` qui plante (env var `STRIPE_SECRET_KEY` manquante en prod ? URL webhook ?)
3. Bug de hydration / état React qui bloque le submit
4. Problème Mondial Relay si livraison MR sélectionnée (sélection point relais perdue ?)

**Impact** : 🚨 **CRITIQUE — bloque TOUT achat en prod**. Aucune commande n'est possible tant que ce bug n'est pas fixé.

**À récupérer pour debug** :
- Console browser DevTools : erreurs JS au clic
- Network tab : requête vers `/api/checkout/stripe` ? Réponse ?
- Vercel logs production : `vercel inspect <deployment-url> --logs` ou dashboard

**Fichiers concernés** (probablement) :
- `lolett-app/app/api/checkout/stripe/route.ts`
- `lolett-app/app/checkout/CheckoutContent.tsx` (ou équivalent étape paiement)
- Variables d'env Vercel prod : `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `NEXT_PUBLIC_BASE_URL`

---

---

## 🔴 BUG 3 — Formulaire contact : message "envoyé" mais aucun email reçu

**Symptôme** : sur `/contact`, après soumission du formulaire, l'UI affiche bien "Merci ! Ton message a bien été envoyé." MAIS aucun email n'arrive dans `contact.lolett@gmail.com`.

**Causes possibles** :
1. Endpoint API `/api/contact` accepte la requête (success UI) mais le SMTP Gmail échoue silencieusement → message perdu
2. Le mail part vers une mauvaise adresse (autre que `contact.lolett@gmail.com`)
3. Le mail arrive en spam Gmail (à vérifier dossier Spam)
4. Le formulaire soumet mais persiste seulement en DB (pas d'email côté serveur)

**Impact** : 🚨 **Bug grave** — les clients peuvent contacter Lola, mais Lola ne reçoit RIEN. Tickets support invisibles, aucune réponse possible.

**À récupérer pour debug** :
- Vercel logs prod pour `/api/contact`
- Vérifier si la table `contacts` (ou équivalent) en DB contient bien le message envoyé (= bug 1) ou pas (= bug 2)
- Vérifier dossier Spam Gmail
- Comparer avec la config SMTP qui marche pour les emails de commande

**Fichiers concernés** :
- `lolett-app/app/api/contact/route.ts`
- `lolett-app/lib/email/*` (config SMTP Gmail)
- `lolett-app/app/contact/page.tsx` ou `ContactForm.tsx`

---

---

## 🟡 BUG 4 — Panier : section "Vous aimerez aussi" affiche fake data

**Symptôme** : sur `/panier`, en bas, la section "Vous aimerez aussi" affiche 4 articles **non liés** au contenu du panier :
- Polo Lin Riviera (79€)
- Pantalon Coton Provence (110€)
- Veste Lin Cannes (165€)
- T-shirt Coton Bio (49€)

Ces articles ont des photos de mannequins **homme** type Sézane/Asphalte (mer, bord de plage, look estival masculin), incompatibles avec :
1. Le branding Lolett (femme, sud-ouest, photos marronnes/terre)
2. Le contenu du panier (chemise blanche femme à 79€)

**Causes possibles** :
1. Recommandations basées sur fake data hardcodée laissée pendant le dev
2. Algo de recommandation absent → fallback sur articles aléatoires de la DB qui contient encore des articles seedés en dev
3. Photos de produits Lolett réels mais avec mauvais visuels uploadés

**Impact** : 🟡 cosmétique mais embêtant pour l'image (Lola va voir ça et ne sera pas contente). Casse l'illusion d'une boutique soignée.

**Fix proposé** :
- **Quick fix** : retirer complètement la section "Vous aimerez aussi" du panier pour le launch (1 ligne de code à commenter)
- **Vrai fix** : implémenter une recommandation basée sur catégorie/tags/genre des produits du panier

**Fichiers concernés** :
- `lolett-app/app/panier/page.tsx` ou composant `CartRecommendations.tsx`
- Vérifier table `products` : ces 4 articles existent-ils en DB ? Si oui → seed à virer ; sinon → fake data hardcodée

---

---

## 🟡 BUG 5 — Admin sidebar : ne reste pas fixe au scroll

**Symptôme** : sur les pages `/admin/*`, quand on scrolle, la sidebar gauche (avec "Dashboard", "Commandes", etc.) **scrolle avec le contenu** au lieu de rester fixée à gauche.

**Impact** : ergonomie admin dégradée, surtout sur les pages longues (campagne ouverture avec 107 contacts, détails commande avec articles).

**Fix** : ajouter `position: sticky; top: 0` (ou `fixed`) à la sidebar du layout admin.

**Fichiers concernés** :
- `lolett-app/app/admin/layout.tsx` ou `lolett-app/components/admin/AdminSidebar.tsx`

---

## 🟡 BUG 6 — Admin commande détail : layout ne prend pas toute la largeur

**Symptôme** : sur `/admin/orders/[id]`, le contenu (Historique, Client, Livraison, Articles…) est contraint dans une colonne étroite alors qu'il y a beaucoup d'espace blanc à droite. Les cards sont compressées inutilement.

**Impact** : perte d'espace visuel, ergonomie sub-optimale sur grand écran.

**Fix** : retirer le `max-width` de la page détail commande, ou l'élargir à `max-w-7xl` au lieu de `max-w-3xl`.

**Fichiers concernés** :
- `lolett-app/app/admin/orders/[id]/page.tsx`

---

## ✅ INFO — Campagne ouverture : 107 contacts EN ATTENTE

Lola a importé sa liste mais **n'a PAS encore lancé** la campagne. Tous les contacts sont en statut `pending`. Donc on a tout le temps de :
1. Rendre le template email éditable depuis l'admin (sujet + corps + réseaux sociaux)
2. Lola personnalise + ajoute Instagram/TikTok/Facebook
3. Envoi groupé de 107 emails après validation

### URLs réseaux sociaux Lolett (fournies par Lyes 2026-05-04)
- **Instagram** : `https://www.instagram.com/lolett.eshop` (pseudo @lolett.eshop)
- **TikTok** : `https://www.tiktok.com/@lolett.eshop` (pseudo @lolett.eshop)
- **Facebook** : `https://www.facebook.com/share/1Lgs5JMnHZ/?mibextid=wwXIfr`

À mettre à jour dans :
- table `site_content` (lignes `instagram_url`, `tiktok_url`, `facebook_url`) → footer + header social dropdown + mobile menu
- template email lancement (à rendre éditable)
- éventuellement `SocialDropdown.tsx` et `MobileMenu.tsx` qui ont des fallbacks hardcodés à `instagram.com/lolett` (sans .eshop)

---

## Bugs suivants — à compléter au fil des tests Lyes

(Lyes continue de tester, bugs ajoutés ici au fur et à mesure)

---

## Plan de fix

Quand Lyes a fini de tester :
1. Triage par criticité (rouge / jaune / cosmétique)
2. Fix groupé en une session dédiée
3. Re-deploy prod
4. Re-validation rapide
5. Envoi message Lola

**Status launch** : ⏸️ on hold jusqu'au fix BUG 2 minimum (impossible d'envoyer Lola tant que checkout cassé).
