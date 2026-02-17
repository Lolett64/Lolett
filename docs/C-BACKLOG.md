# Document C — Backlog LOLETT (MVP)

---

## Objectif du document

Lister l'ensemble des user stories du MVP avec leurs critères d'acceptation, organisées par epic, prêtes à être priorisées et développées.

## Contenu

User stories au format "En tant que… je veux… afin de…", critères d'acceptation vérifiables, priorité (P0 = bloquant, P1 = important, P2 = souhaitable).

## Hypothèses

- Le code existant (`lolett-app/`) couvre déjà la structure des pages, les composants UI, les stores Zustand (panier, favoris) et les données mock.
- Le backlog se concentre sur ce qui reste à **compléter ou connecter** pour un MVP fonctionnel avec paiement réel.
- Les "Comptes clients" sont mentionnés dans l'offre commerciale mais classés V2 dans le PRD. Ils sont inclus ici en **EPIC K (V1.1)** pour visibilité.

## Points à valider

- Voir section "Questions ouvertes" en fin de document.

---

## Note sur le périmètre

L'offre commerciale inclut des fonctionnalités au-delà du MVP strict du cahier des charges :

| Fonctionnalité | Cahier des charges | Offre commerciale | Ce backlog |
|---|---|---|---|
| E-commerce complet (catalogue, panier, paiement) | Oui | Oui | **MVP (P0)** |
| Looks "prêt à sortir" | Oui | Oui | **MVP (P0)** |
| SEO | Oui | Oui | **MVP (P1)** |
| Interface de gestion (admin) | Implicite | Oui | **MVP (P0)** |
| Comptes clients | Non | Oui | **V1.1 (P2)** |
| Statistiques & dashboard | Non | Oui | **V1.1 (P2)** |
| Programme fidélité / Filtres / Click & Collect | Non (V2) | Non | **V2** |

---

## EPIC A — Navigation & Layout

### A1 — Header responsive

**En tant que** visiteur, **je veux** un header avec navigation principale, **afin de** accéder à toutes les sections du site.

| # | Critère d'acceptation |
|---|---|
| 1 | Le header affiche : logo LOLETT (lien vers accueil), Nouveautés, Homme, Femme, Contact |
| 2 | Icônes à droite : Favoris (coeur + compteur), Panier (sac + compteur) |
| 3 | Liens réseaux sociaux (Instagram, TikTok, Facebook) accessibles |
| 4 | Mobile : burger menu avec navigation slide-in |
| 5 | Le header est sticky au scroll avec effet de fond |
| 6 | Navigation au clavier complète (Tab, Enter, Escape pour fermer le menu mobile) |
| 7 | Liens actifs visuellement distingués |

**Priorité : P0** | **Statut : Existant — à vérifier/compléter**

---

### A2 — Footer

**En tant que** visiteur, **je veux** un footer avec liens utiles, **afin de** trouver les informations légales et les contacts.

| # | Critère d'acceptation |
|---|---|
| 1 | Sections : Navigation, Contact, Réseaux sociaux, Mentions légales |
| 2 | Liens vers : CGV, Politique de confidentialité, Politique de retours |
| 3 | Lien email de contact et/ou lien vers `/contact` |
| 4 | Icônes réseaux sociaux avec liens externes (`target="_blank"`, `rel="noopener"`) |
| 5 | Copyright : "LOLETT {année}" dynamique |
| 6 | Responsive : stack vertical sur mobile |

**Priorité : P0** | **Statut : Existant — à compléter (liens légaux manquants)**

---

## EPIC B — Page d'accueil

### B1 — Sections accueil

**En tant que** visiteur, **je veux** une page d'accueil attractive, **afin de** découvrir l'univers LOLETT et naviguer vers les collections.

| # | Critère d'acceptation |
|---|---|
| 1 | **Hero** : phrase d'accroche *"Entre. Tu verras, ça vaut le coup d'oeil et parfois plus."* + CTA vers collections |
| 2 | **Collections H/F** : 2 blocs visuels (Sélection Homme / Sélection Femme) avec lien vers `/shop/homme` et `/shop/femme` |
| 3 | **Présentation fondatrice** : photo + texte court storytelling |
| 4 | **Réseaux sociaux** : feed ou liens Instagram / TikTok / Facebook |
| 5 | **Avis clients** : minimum 3 témoignages affichés (données statiques MVP) |
| 6 | **Nouveautés** : preview des 4-6 derniers produits (`isNew: true`) avec lien vers `/nouveautes` |
| 7 | **Newsletter** : champ email + bouton d'inscription |
| 8 | **Disclaimer** : *"LOLETT décline toute responsabilité en cas de coup de coeur."* visible |
| 9 | Toutes les sections sont responsive (1 colonne mobile, multi-colonnes desktop) |
| 10 | Lazy loading des images sous le fold |

**Priorité : P0** | **Statut : Existant — micro-copies et contenus réels à intégrer**

---

### B2 — Micro-copies accueil

**En tant que** visiteur, **je veux** retrouver le ton LOLETT sur la page d'accueil, **afin de** ressentir la personnalité de la marque.

| # | Critère d'acceptation |
|---|---|
| 1 | Hero : texte exact *"Entre. Tu verras, ça vaut le coup d'oeil et parfois plus."* |
| 2 | Disclaimer affiché : *"LOLETT décline toute responsabilité en cas de coup de coeur."* |
| 3 | Les micro-copies sont codées en dur (pas de CMS) |

**Priorité : P0** | **Statut : À vérifier dans le code existant**

---

## EPIC C — Catalogue

### C1 — Page Nouveautés

**En tant que** visiteur, **je veux** voir les derniers produits ajoutés, **afin de** découvrir les nouvelles pièces.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/nouveautes` |
| 2 | Affiche tous les produits avec `isNew: true`, triés par date décroissante |
| 3 | Carte produit : photo, nom, prix, badge "Nouveau" |
| 4 | Clic sur carte → fiche produit (`/produit/[slug]`) |
| 5 | Grille responsive : 1 col mobile, 2 col tablette, 3-4 col desktop |
| 6 | État vide : message si aucune nouveauté |
| 7 | Meta title : "Nouveautés — LOLETT" / Meta description pertinente |

**Priorité : P0** | **Statut : Existant — données mock, à connecter aux données réelles**

---

### C2 — Listing Sélection Homme

**En tant que** visiteur homme, **je veux** parcourir les produits par catégorie, **afin de** trouver les pièces qui m'intéressent.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/shop/homme` (landing) + `/shop/homme/[category]` |
| 2 | Catégories : Hauts, Bas, Chaussures, Accessoires |
| 3 | Navigation par catégorie (onglets ou liens) |
| 4 | Carte produit : photo, nom, prix, indicateur stock (épuisé grisé) |
| 5 | Tri : par nouveauté (défaut), prix croissant, prix décroissant |
| 6 | Grille responsive |
| 7 | Bouton favori (coeur) sur chaque carte |
| 8 | Meta title/description dynamiques par catégorie |

**Priorité : P0** | **Statut : Existant — tri et stock à vérifier**

---

### C3 — Listing Sélection Femme

Identique à C2, pour `gender: 'femme'`.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/shop/femme` (landing) + `/shop/femme/[category]` |
| 2-8 | Mêmes critères que C2 appliqués au genre femme |

**Priorité : P0** | **Statut : Existant**

---

### C4 — Fiche produit

**En tant que** visiteur, **je veux** voir tous les détails d'un produit, **afin de** décider si je l'achète.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/produit/[slug]` |
| 2 | **Galerie** : plusieurs photos, navigation, zoom ou lightbox |
| 3 | Nom, description, prix TTC affiché |
| 4 | **Sélecteur taille** : liste des tailles disponibles, taille requise avant ajout panier |
| 5 | **Sélecteur couleur** : pastilles colorées si variantes |
| 6 | **Stock** : "En stock" / "Dernières pièces !" (< 3) / "Épuisé" (0) |
| 7 | **Bouton Ajouter au panier** : désactivé si épuisé ou aucune taille sélectionnée |
| 8 | **Bouton Favori** : toggle coeur |
| 9 | **Micro-copy fixe** : *"Validé par LOLETT. Tu peux y aller tranquille."* |
| 10 | **Micro-copy contextuelle** : une phrase aléatoire parmi le pool (voir CLAUDE.md §8) |
| 11 | **Micro-copy accessoires** : si catégorie accessoire, utiliser le pool dédié |
| 12 | **Bloc "Prêt à sortir"** : voir EPIC D |
| 13 | Breadcrumb : Accueil > Sélection [Genre] > [Catégorie] > [Produit] |
| 14 | SEO : `<title>` = "[Nom produit] — LOLETT", meta description = description produit |
| 15 | SSR/SSG pour le SEO |

**Priorité : P0** | **Statut : Existant — micro-copies, stock bas, SEO à compléter**

---

## EPIC D — Looks ("Prêt à sortir")

### D1 — Association produit ↔ looks (données)

**En tant qu'** admin, **je veux** associer des produits à des looks, **afin de** proposer des tenues complètes aux visiteurs.

| # | Critère d'acceptation |
|---|---|
| 1 | Un `Look` contient un tableau `productIds` (type existant dans `types/index.ts`) |
| 2 | Un produit peut appartenir à 0, 1 ou plusieurs looks |
| 3 | `LookRepository.findLooksForProduct(productId)` retourne les looks associés |
| 4 | Les données mock contiennent au moins 3 looks (2 femme, 1 homme) avec 3-5 produits chacun |

**Priorité : P0** | **Statut : Existant dans data/looks.ts — à vérifier la cohérence des IDs**

---

### D2 — Bloc "Prêt à sortir" sur fiche produit

**En tant que** visiteur, **je veux** voir un look complet quand je consulte un produit, **afin de** m'inspirer et compléter ma tenue.

| # | Critère d'acceptation |
|---|---|
| 1 | Le bloc apparaît sur la fiche produit **uniquement** si le produit a des looks associés |
| 2 | Titre du bloc : "Prêt à sortir" |
| 3 | Affiche les **autres** pièces du look (pas le produit en cours) : photo, nom, prix |
| 4 | Indicateur stock par pièce (disponible / épuisé) |
| 5 | CTA individuel "Ajouter" par pièce (avec sélection taille requise) |
| 6 | CTA global "Ajouter le look complet" (ajoute toutes les pièces disponibles) |
| 7 | Si plusieurs looks associés : afficher le premier ou permettre de switcher |
| 8 | Pièces épuisées : affichées mais grisées, bouton désactivé |
| 9 | Si aucun look : le bloc n'est pas affiché (pas de bloc vide) |

**Priorité : P0** | **Statut : Composant existant (ProductLooks.tsx) — CTA global + gestion stock à compléter**

---

## EPIC E — Favoris

### E1 — Ajouter / retirer un favori

**En tant que** visiteur, **je veux** ajouter un produit en favori d'un clic, **afin de** le retrouver plus tard.

| # | Critère d'acceptation |
|---|---|
| 1 | Bouton coeur sur chaque carte produit (listing) et fiche produit |
| 2 | Toggle : clic ajoute, re-clic retire |
| 3 | Feedback visuel immédiat (coeur rempli = favori) |
| 4 | Persistance localStorage (store Zustand `features/favorites/store.ts`) |
| 5 | Compteur de favoris mis à jour dans le header |

**Priorité : P0** | **Statut : Existant — vérifier persistance et compteur header**

---

### E2 — Page Favoris

**En tant que** visiteur, **je veux** consulter mes favoris sur une page dédiée, **afin de** revoir mes coups de coeur.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/favoris` |
| 2 | Grille de produits favoris (même carte que le listing) |
| 3 | Bouton retirer favori depuis la page |
| 4 | **État vide** : *"Reviens, on a gardé tes coups de coeur."* + CTA "Découvrir la boutique" |
| 5 | Responsive : même grille que les listings |

**Priorité : P0** | **Statut : Existant — micro-copy état vide à vérifier**

---

## EPIC F — Panier

### F1 — Gestion du panier

**En tant que** visiteur, **je veux** gérer mon panier, **afin de** préparer ma commande.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/panier` |
| 2 | Liste des items : photo, nom, taille, couleur, prix unitaire |
| 3 | Sélecteur quantité (+/-) par item, min 1 |
| 4 | Bouton supprimer par item |
| 5 | Sous-total recalculé à chaque modification |
| 6 | Persistance localStorage (store Zustand existant) |
| 7 | **Micro-copy** : *"T'es à deux clics d'être le plus stylé de ta terrasse."* |
| 8 | **État vide** : message + CTA vers boutique |
| 9 | Compteur panier dans le header synchronisé |

**Priorité : P0** | **Statut : Existant — à vérifier les edge cases**

---

### F2 — Calcul livraison et totaux

**En tant que** visiteur, **je veux** voir le total avec livraison, **afin de** connaître le montant exact avant de payer.

| # | Critère d'acceptation |
|---|---|
| 1 | Sous-total affiché |
| 2 | Livraison : 5,90 EUR si sous-total < 100 EUR |
| 3 | Livraison : "Offerte" si sous-total >= 100 EUR |
| 4 | **Seuil affiché** : "Plus que X,XX EUR pour la livraison offerte !" (si < 100 EUR) |
| 5 | Total = sous-total + livraison |
| 6 | Les constantes sont dans `lib/constants.ts` (SHIPPING.COST, SHIPPING.FREE_THRESHOLD) |
| 7 | CTA "Passer commande" vers `/checkout` |

**Priorité : P0** | **Statut : Partiellement existant — seuil restant à implémenter**

---

## EPIC G — Paiements

### G1 — Stripe Checkout (CB + Apple Pay)

**En tant que** visiteur, **je veux** payer par carte bancaire, **afin de** finaliser ma commande.

| # | Critère d'acceptation |
|---|---|
| 1 | Route API : `POST /api/checkout/stripe` (Server Route) |
| 2 | Le serveur crée une Stripe Checkout Session avec les line_items recalculés à partir des IDs produit (jamais de prix du client) |
| 3 | Modes de paiement : `card`, `apple_pay` |
| 4 | Devise : EUR |
| 5 | `success_url` → `/checkout/success?session_id={CHECKOUT_SESSION_ID}` |
| 6 | `cancel_url` → `/panier` |
| 7 | Métadonnées session : `orderId`, `customerEmail` |
| 8 | SCA / 3D Secure géré automatiquement par Stripe Checkout |
| 9 | Les clés secrètes sont en variables d'environnement serveur (`STRIPE_SECRET_KEY`) |
| 10 | Mode test fonctionnel avec cartes test Stripe |

**Priorité : P0** | **Statut : À développer**

---

### G2 — Webhook Stripe

**En tant que** système, **je veux** recevoir la confirmation de paiement Stripe, **afin de** valider la commande.

| # | Critère d'acceptation |
|---|---|
| 1 | Route API : `POST /api/webhooks/stripe` |
| 2 | Vérification de la signature webhook (`stripe.webhooks.constructEvent`) |
| 3 | Événement traité : `checkout.session.completed` |
| 4 | Actions : créer/confirmer la commande (statut `pending` → `confirmed`) |
| 5 | Actions : décrémenter le stock des produits commandés |
| 6 | Actions : envoyer email de confirmation au client |
| 7 | **Idempotence** : si le webhook est reçu 2 fois, la commande n'est pas dupliquée |
| 8 | Retourne `200` à Stripe après traitement |
| 9 | Log des erreurs webhook pour debugging |

**Priorité : P0** | **Statut : À développer**

---

### G3 — PayPal Checkout

**En tant que** visiteur, **je veux** payer par PayPal, **afin d'** utiliser mon moyen de paiement préféré.

| # | Critère d'acceptation |
|---|---|
| 1 | Bouton PayPal affiché dans le checkout, **séparé** du flux Stripe |
| 2 | Utilise le SDK PayPal (bouton standard) |
| 3 | Route API : `POST /api/checkout/paypal/create-order` (crée la commande PayPal) |
| 4 | Route API : `POST /api/checkout/paypal/capture-order` (capture le paiement) |
| 5 | Le montant est recalculé côté serveur |
| 6 | Devise : EUR |
| 7 | Clé publique PayPal dans `NEXT_PUBLIC_PAYPAL_CLIENT_ID` |
| 8 | Clé secrète dans `PAYPAL_CLIENT_SECRET` (serveur uniquement) |

**Priorité : P0** | **Statut : À développer**

---

### G4 — Validation PayPal (webhook / capture)

**En tant que** système, **je veux** valider le paiement PayPal, **afin de** confirmer la commande.

| # | Critère d'acceptation |
|---|---|
| 1 | Après capture réussie côté serveur : commande confirmée |
| 2 | Actions identiques à G2 : statut `confirmed`, décrémentation stock, email |
| 3 | Webhook PayPal (IPN) configuré en backup pour les cas asynchrones |
| 4 | **Idempotence** : même garantie que Stripe |
| 5 | Gestion du cas "paiement en attente" PayPal (statut `pending`) |

**Priorité : P0** | **Statut : À développer**

---

## EPIC H — Commandes

### H1 — Modèle commande et statuts

**En tant que** système, **je veux** un modèle de commande avec statuts, **afin de** suivre le cycle de vie des commandes.

| # | Critère d'acceptation |
|---|---|
| 1 | Statuts : `pending` → `confirmed` → `shipped` → `delivered` |
| 2 | Statuts d'annulation : `cancelled`, `refunded` |
| 3 | Chaque commande contient : id, items (produit, taille, quantité, prix), client (nom, email, adresse), total, livraison, statut, dates |
| 4 | `OrderRepository.create()` crée une commande en `pending` |
| 5 | Transition de statut uniquement via webhook (pas côté client) |
| 6 | Types existants dans `types/index.ts` — ajouter `cancelled` et `refunded` aux statuts |

**Priorité : P0** | **Statut : Types existants — repository mock existant, à connecter à une BDD**

---

### H2 — Email de confirmation commande

**En tant que** client, **je veux** recevoir un email de confirmation, **afin d'** avoir la preuve de ma commande.

| # | Critère d'acceptation |
|---|---|
| 1 | Email envoyé automatiquement après paiement confirmé (webhook) |
| 2 | Contenu : n° commande, récapitulatif items, total, adresse de livraison |
| 3 | Ton LOLETT dans l'email (même micro-copies que la page confirmation) |
| 4 | Expéditeur : adresse email LOLETT (à définir) |
| 5 | Service d'envoi : Resend ou Stripe Receipts (à décider) |
| 6 | Fallback : si l'envoi échoue, la commande reste confirmée (l'email est best-effort) |

**Priorité : P0** | **Statut : À développer — service d'envoi à choisir**

---

## EPIC I — SEO & Légal

### I1 — Meta titres et descriptions

**En tant que** moteur de recherche, **je veux** des balises meta pertinentes, **afin d'** indexer correctement le site.

| # | Critère d'acceptation |
|---|---|
| 1 | Chaque page a un `<title>` unique et une `<meta description>` unique |
| 2 | Format title pages catégories : "[Catégorie] [Genre] — LOLETT" |
| 3 | Format title fiches produit : "[Nom produit] — LOLETT" |
| 4 | Descriptions de 150-160 caractères, intégrant les mots-clés cibles |
| 5 | Mots-clés cibles : "look complet femme", "tenue homme", "accessoires tendance", "mode accessible" |
| 6 | `sitemap.xml` généré dynamiquement (existant : `app/sitemap.ts`) |
| 7 | `robots.txt` configuré (existant : `app/robots.ts`) |
| 8 | Open Graph et Twitter Cards sur les pages produits |

**Priorité : P1** | **Statut : Partiellement existant — OG/Twitter Cards à ajouter**

---

### I2 — Pages légales

**En tant que** visiteur, **je veux** accéder aux informations légales, **afin de** connaître mes droits.

| # | Critère d'acceptation |
|---|---|
| 1 | Pages : `/mentions-legales`, `/cgv`, `/politique-confidentialite`, `/politique-retours` |
| 2 | Contenu fourni par le client (ou template à compléter) |
| 3 | Liens dans le footer |
| 4 | Pages simples, responsive, avec breadcrumb |
| 5 | `noindex` optionnel sur ces pages (à décider) |

**Priorité : P1** | **Statut : À développer — contenu à fournir par le client**

---

## EPIC J — Admin (Interface de gestion)

> Inclus dans l'offre commerciale. MVP = gestion autonome minimale.

### J1 — CRUD Produits

**En tant qu'** admin, **je veux** ajouter, modifier et supprimer des produits, **afin de** gérer mon catalogue en autonomie.

| # | Critère d'acceptation |
|---|---|
| 1 | Interface protégée (accès admin uniquement) |
| 2 | Formulaire création produit : nom, slug, description, prix, genre, catégorie, tailles, couleurs, images |
| 3 | Upload d'images produit |
| 4 | Modification de tous les champs d'un produit existant |
| 5 | Suppression d'un produit (soft delete ou confirmation) |
| 6 | Preview avant publication |
| 7 | Gestion des looks : associer/dissocier des produits à un look |

**Priorité : P0** | **Statut : À développer — nécessite une BDD (Supabase recommandé)**

---

### J2 — Gestion stocks et commandes

**En tant qu'** admin, **je veux** voir les stocks et les commandes, **afin de** gérer mes expéditions.

| # | Critère d'acceptation |
|---|---|
| 1 | Liste des commandes avec statut, filtrable par date/statut |
| 2 | Détail commande : items, client, adresse, total, paiement |
| 3 | Action : passer une commande de `confirmed` à `shipped` (avec n° suivi optionnel) |
| 4 | Vue stock : liste produits avec stock actuel, alerte stock bas (< 3) |
| 5 | Modification rapide du stock d'un produit |

**Priorité : P0** | **Statut : À développer**

---

## EPIC K — Comptes clients (V1.1)

> Mentionné dans l'offre commerciale. Non requis pour le MVP strict mais prévu dans le livrable.

### K1 — Inscription / Connexion

**En tant que** visiteur, **je veux** créer un compte, **afin de** suivre mes commandes.

| # | Critère d'acceptation |
|---|---|
| 1 | Inscription : email + mot de passe (ou OAuth Google) |
| 2 | Connexion / Déconnexion |
| 3 | Page profil : nom, email, adresse par défaut |
| 4 | Récupération mot de passe par email |
| 5 | Pas obligatoire pour acheter (checkout invité maintenu) |

**Priorité : P2** | **Statut : V1.1 — À planifier après le MVP**

---

### K2 — Historique commandes

**En tant que** client connecté, **je veux** voir mes commandes passées, **afin de** suivre mes achats.

| # | Critère d'acceptation |
|---|---|
| 1 | Page "Mes commandes" accessible depuis le profil |
| 2 | Liste : n° commande, date, statut, total |
| 3 | Détail : items, adresse de livraison, n° suivi si disponible |

**Priorité : P2** | **Statut : V1.1**

---

## EPIC L — Contact

### L1 — Formulaire de contact

**En tant que** visiteur, **je veux** envoyer un message à LOLETT, **afin de** poser une question.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/contact` |
| 2 | Champs : nom, email, sujet, message |
| 3 | Validation côté client (champs requis, format email) |
| 4 | Validation côté serveur |
| 5 | Message de succès après envoi (ton LOLETT) |
| 6 | Email de notification envoyé à l'admin LOLETT |
| 7 | Protection anti-spam (honeypot ou rate limiting) |

**Priorité : P0** | **Statut : Existant — envoi email réel à connecter**

---

## EPIC M — Page confirmation commande

### M1 — Page de confirmation

**En tant que** client, **je veux** voir une confirmation après paiement, **afin de** savoir que ma commande est validée.

| # | Critère d'acceptation |
|---|---|
| 1 | Route : `/checkout/success?session_id=...` |
| 2 | Récupère les détails de la session Stripe (ou PayPal) côté serveur |
| 3 | Affiche : n° commande, récapitulatif items, total, adresse |
| 4 | **Micro-copies** : "Excellente décision. Vraiment." / "Tu vas recevoir des compliments. Beaucoup." / "LOLETT te remercie." |
| 5 | CTA : "Continuer à explorer" → accueil |
| 6 | Empêcher le rechargement de la page de créer une commande en double |
| 7 | Vider le panier après affichage de la confirmation |

**Priorité : P0** | **Statut : Existant — à connecter au paiement réel**

---

## Résumé des priorités

### P0 — MVP bloquant (must-have pour le lancement)

| ID | Story | Statut |
|---|---|---|
| A1 | Header responsive | Existant, à vérifier |
| A2 | Footer | Existant, liens légaux à ajouter |
| B1 | Sections accueil | Existant, contenus réels à intégrer |
| B2 | Micro-copies accueil | À vérifier |
| C1 | Page Nouveautés | Existant, données réelles à connecter |
| C2 | Listing Homme | Existant |
| C3 | Listing Femme | Existant |
| C4 | Fiche produit | Existant, micro-copies + stock à compléter |
| D1 | Données looks | Existant, cohérence à vérifier |
| D2 | Bloc "Prêt à sortir" | Existant, CTA global + stock à compléter |
| E1 | Toggle favori | Existant |
| E2 | Page favoris | Existant |
| F1 | Gestion panier | Existant |
| F2 | Calcul livraison | Partiellement, seuil à implémenter |
| **G1** | **Stripe Checkout** | **À développer** |
| **G2** | **Webhook Stripe** | **À développer** |
| **G3** | **PayPal Checkout** | **À développer** |
| **G4** | **Validation PayPal** | **À développer** |
| **H1** | **Modèle commande** | **Types existants, BDD à connecter** |
| **H2** | **Email confirmation** | **À développer** |
| **J1** | **CRUD Produits (admin)** | **À développer** |
| **J2** | **Stocks/commandes (admin)** | **À développer** |
| L1 | Formulaire contact | Existant, email à connecter |
| M1 | Page confirmation | Existant, paiement réel à connecter |

### P1 — Important

| ID | Story | Statut |
|---|---|---|
| I1 | Meta SEO | Partiellement existant |
| I2 | Pages légales | À développer (contenu client) |

### P2 — V1.1

| ID | Story | Statut |
|---|---|---|
| K1 | Inscription / Connexion | À planifier |
| K2 | Historique commandes | À planifier |

---

## Ordre de développement recommandé

```
Phase 1 — Fondations données (semaine 1)
├── H1  Modèle commande + BDD (Supabase)
├── J1  CRUD produits admin
└── J2  Gestion stocks/commandes admin

Phase 2 — Paiement (semaine 2)
├── G1  Stripe Checkout
├── G2  Webhook Stripe
├── G3  PayPal Checkout
├── G4  Validation PayPal
└── H2  Email confirmation

Phase 3 — Polish front (semaine 3)
├── F2  Seuil livraison gratuite
├── D2  CTA global look complet
├── B1  Contenus réels accueil
├── C4  Micro-copies + stock produit
└── M1  Confirmation connectée au paiement

Phase 4 — SEO & légal (semaine 4)
├── I1  Meta SEO
├── I2  Pages légales
├── A2  Footer liens légaux
└──     Tests cross-browser, Lighthouse, recette
```

---

## Questions ouvertes

| # | Question | Impact |
|---|---|---|
| 1 | **BDD** : Supabase confirmé pour stocker produits, commandes, looks ? | Bloque J1, J2, H1 |
| 2 | **Service email** : Resend, SendGrid, ou Stripe Receipts ? | Bloque H2, L1 |
| 3 | **Admin** : interface custom ou solution existante (Supabase Studio, admin panel) ? | Bloque J1, J2 |
| 4 | **Pages légales** : le client fournit le contenu ou il faut des templates ? | Bloque I2 |
| 5 | **Comptes clients** : à inclure dans le MVP ou reporter en V1.1 ? L'offre les mentionne. | Impacte K1, K2 |
| 6 | **Dashboard stats** (ventes, best-sellers, panier moyen) : mentionné dans l'offre, à inclure quand ? | Planification |
| 7 | **Formation visio 1h** : à planifier après la livraison — documenter le guide admin | Livraison |

---

*Document C — Backlog v1.0 — Généré le 17/02/2026*
*En attente de validation avant passage au Document D (Spécification paiements)*
