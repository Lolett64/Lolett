# Document E — Plan de recette (QA) & Checklist par page

---

## Objectif du document

Définir tous les scénarios de test du MVP LOLETT : smoke tests bloquants, cas nominaux, cas limites (edge cases), et une checklist par page à valider avant mise en production.

## Contenu

Tests fonctionnels, tests paiement (Stripe + PayPal), tests SEO, cas limites, checklist page par page.

## Hypothèses

- Les tests sont exécutés manuellement (pas de suite automatisée en MVP).
- Les tests paiement sont réalisés en mode test (cartes Stripe test, sandbox PayPal).
- Le plan de recette est utilisé avant chaque mise en production.

## Points à valider

- Voir section "Questions ouvertes" en fin de document.

---

## 1. Smoke tests (bloquants)

> Si un smoke test échoue, **pas de mise en production**. Ce sont les fondamentaux.

### 1.1 Responsive

| # | Test | Mobile (375px) | Tablette (768px) | Desktop (1440px) |
|---|---|---|---|---|
| S1 | Accueil : toutes les sections visibles, pas de débordement horizontal | [ ] | [ ] | [ ] |
| S2 | Listing (Homme/Femme) : grille adaptative, cartes lisibles | [ ] | [ ] | [ ] |
| S3 | Fiche produit : galerie, sélecteurs, CTA visibles | [ ] | [ ] | [ ] |
| S4 | Panier : items lisibles, totaux visibles, CTA accessible | [ ] | [ ] | [ ] |
| S5 | Checkout : formulaire utilisable, boutons paiement visibles | [ ] | [ ] | [ ] |
| S6 | Header : navigation fonctionnelle (burger mobile, liens desktop) | [ ] | [ ] | [ ] |
| S7 | Footer : liens accessibles, pas de texte coupé | [ ] | [ ] | [ ] |

### 1.2 Panier

| # | Test | Résultat attendu | OK ? |
|---|---|---|---|
| S8 | Ajouter un produit avec taille sélectionnée | Item apparaît dans le panier, compteur header +1 | [ ] |
| S9 | Ajouter le même produit même taille | Quantité incrémentée (pas de doublon) | [ ] |
| S10 | Modifier la quantité (+/-) | Total recalculé | [ ] |
| S11 | Supprimer un item | Item disparaît, total recalculé | [ ] |
| S12 | Panier vide | Message d'état vide + CTA boutique | [ ] |

### 1.3 Stock

| # | Test | Résultat attendu | OK ? |
|---|---|---|---|
| S13 | Produit stock = 0 | Affiche "Épuisé", bouton "Ajouter" désactivé | [ ] |
| S14 | Produit stock < 3 | Affiche "Dernières pièces !" | [ ] |
| S15 | Produit stock >= 3 | Affiche "En stock" | [ ] |

### 1.4 Nouveautés

| # | Test | Résultat attendu | OK ? |
|---|---|---|---|
| S16 | Accéder à `/nouveautes` | Page charge, produits `isNew` affichés | [ ] |
| S17 | Aucun produit `isNew` | Message d'état vide | [ ] |

### 1.5 Favoris

| # | Test | Résultat attendu | OK ? |
|---|---|---|---|
| S18 | Cliquer coeur sur carte produit | Coeur rempli, compteur header +1 | [ ] |
| S19 | Re-cliquer coeur | Coeur vidé, compteur -1 | [ ] |
| S20 | Recharger la page | Favoris persistés (localStorage) | [ ] |
| S21 | Page `/favoris` avec items | Grille de produits favoris | [ ] |
| S22 | Page `/favoris` vide | Micro-copy + CTA boutique | [ ] |

---

## 2. Tests paiement

### 2.1 Stripe Checkout

| # | Test | Données test | Résultat attendu | OK ? |
|---|---|---|---|---|
| P1 | Paiement CB réussi | Carte `4242 4242 4242 4242`, exp future, CVC 123 | Redirect → `/checkout/success`, commande `confirmed`, email reçu | [ ] |
| P2 | Paiement 3D Secure réussi | Carte `4000 0027 6000 3184` | Popup 3DS → validation → confirmation | [ ] |
| P3 | Paiement 3D Secure échoué | Carte `4000 0084 0000 1629` | 3DS échoue → retour checkout, message d'erreur | [ ] |
| P4 | Carte refusée | Carte `4000 0000 0000 0002` | Message "Paiement refusé" → possibilité de réessayer | [ ] |
| P5 | Annulation par l'utilisateur | Cliquer "Retour" sur la page Stripe | Retour vers `/panier`, panier intact | [ ] |
| P6 | Webhook rejoué (idempotence) | Envoyer le même événement 2 fois via Stripe CLI | Une seule commande créée, pas de doublon | [ ] |
| P7 | Webhook signature invalide | Envoyer un webhook avec mauvais secret | Retour 400, commande non créée | [ ] |
| P8 | Panier vidé après confirmation | Paiement réussi, retour sur le site | Panier vidé, page confirmation affichée | [ ] |

### 2.2 PayPal Checkout

| # | Test | Données test | Résultat attendu | OK ? |
|---|---|---|---|---|
| P9 | Paiement PayPal réussi | Compte sandbox PayPal | Confirmation + email | [ ] |
| P10 | Annulation PayPal | Cliquer "Annuler" dans le flow PayPal | Retour vers `/panier`, panier intact | [ ] |
| P11 | Capture échouée | Simuler échec capture (sandbox) | Message d'erreur, commande reste `pending` ou non créée | [ ] |
| P12 | Double capture (idempotence) | Relancer la capture 2 fois | Une seule commande confirmée | [ ] |

### 2.3 Livraison dans le checkout

| # | Test | Résultat attendu | OK ? |
|---|---|---|---|
| P13 | Sous-total < 100 EUR | Livraison : 5,90 EUR affichée | [ ] |
| P14 | Sous-total >= 100 EUR | Livraison : "Offerte" | [ ] |
| P15 | Sous-total 95 EUR | Message : "Plus que 5,00 EUR pour la livraison offerte !" | [ ] |
| P16 | Sous-total = 100 EUR exactement | Livraison offerte (pas de centimes d'écart) | [ ] |
| P17 | Adresse hors France | Formulaire bloque ou n'affiche que "France" | [ ] |

---

## 3. Tests SEO

| # | Test | Résultat attendu | OK ? |
|---|---|---|---|
| SEO1 | Accueil a un `<title>` unique | "LOLETT — [accroche]" | [ ] |
| SEO2 | Pages catégories ont des `<title>` dynamiques | "[Catégorie] [Genre] — LOLETT" | [ ] |
| SEO3 | Fiches produit ont des `<title>` dynamiques | "[Nom produit] — LOLETT" | [ ] |
| SEO4 | Chaque page a une `<meta description>` unique | 150-160 caractères | [ ] |
| SEO5 | URLs propres avec slugs | `/produit/veste-en-jean-homme` pas `/produit/123` | [ ] |
| SEO6 | `sitemap.xml` accessible | Contient toutes les pages publiques | [ ] |
| SEO7 | `robots.txt` accessible | Autorise le crawl, exclut `/checkout`, `/api` | [ ] |
| SEO8 | Pas de page en `noindex` non voulue | Vérifier dans le `<head>` | [ ] |
| SEO9 | Images avec `alt` descriptif | Toutes les images produit ont un alt | [ ] |
| SEO10 | Un seul `<h1>` par page | Vérifier avec DevTools | [ ] |
| SEO11 | Open Graph tags sur fiches produit | `og:title`, `og:description`, `og:image` | [ ] |

---

## 4. Cas limites (Edge cases)

### 4.1 Panier & Stock

| # | Cas limite | Résultat attendu | OK ? |
|---|---|---|---|
| E1 | Ajouter un produit, puis il passe en rupture avant le paiement | Au checkout, vérifier le stock côté serveur. Si rupture : message d'erreur, pas de paiement | [ ] |
| E2 | Ajouter 10 unités d'un produit avec stock = 5 | Limiter la quantité au stock disponible ou message "Stock insuffisant" | [ ] |
| E3 | Panier avec un seul produit, le supprimer | Retour à l'état vide, CTA paiement disparaît | [ ] |
| E4 | Ajouter le même produit dans 2 tailles différentes | 2 lignes distinctes dans le panier | [ ] |
| E5 | Produit supprimé du catalogue alors qu'il est dans le panier | Le panier gère gracieusement (afficher "Produit indisponible" ou retirer automatiquement) | [ ] |
| E6 | Prix d'un produit modifié entre l'ajout au panier et le paiement | Le checkout utilise le prix serveur actuel, pas le prix en cache | [ ] |

### 4.2 Paiement

| # | Cas limite | Résultat attendu | OK ? |
|---|---|---|---|
| E7 | L'utilisateur ferme l'onglet pendant le paiement Stripe | Le webhook gère la confirmation. Si paiement OK, commande confirmée. Si pas de paiement, commande expirée. | [ ] |
| E8 | L'utilisateur revient sur `/checkout/success` sans session_id | Redirect vers accueil ou message "Aucune commande trouvée" | [ ] |
| E9 | L'utilisateur recharge `/checkout/success` avec le même session_id | Pas de double commande, affiche la confirmation existante | [ ] |
| E10 | Webhook Stripe arrive avant le redirect client | La page confirmation attend/poll le statut commande | [ ] |
| E11 | Webhook Stripe arrive après le redirect client | La page confirmation affiche un état "en cours de confirmation" puis se met à jour | [ ] |
| E12 | Montant panier = 0 EUR (après promo future) | Ne pas autoriser le checkout avec un total à 0 | [ ] |

### 4.3 Formulaires

| # | Cas limite | Résultat attendu | OK ? |
|---|---|---|---|
| E13 | Champ email invalide dans checkout | Validation bloque, message d'erreur | [ ] |
| E14 | Code postal non français (ex: "10001") | Rejeté ou averti "Livraison France uniquement" | [ ] |
| E15 | Injection XSS dans le formulaire contact | Input sanitizé, script non exécuté | [ ] |
| E16 | Formulaire contact soumis 10 fois en 1 minute | Rate limiting ou protection anti-spam | [ ] |
| E17 | Champs avec caractères spéciaux (accents, tirets, apostrophes) | Acceptés normalement (O'Brien, Saint-Étienne, etc.) | [ ] |

### 4.4 Looks

| # | Cas limite | Résultat attendu | OK ? |
|---|---|---|---|
| E18 | Produit dans un look, mais une pièce du look est épuisée | Pièce affichée grisée, bouton "Ajouter" désactivé, CTA global n'ajoute que les pièces disponibles | [ ] |
| E19 | Toutes les pièces du look sont épuisées sauf le produit en cours | Bloc "Prêt à sortir" affiché mais toutes les pièces grisées, CTA global désactivé | [ ] |
| E20 | Produit appartient à 2 looks | Afficher le premier look ou permettre de naviguer entre les looks | [ ] |
| E21 | "Ajouter le look complet" alors que certaines pièces sont déjà dans le panier | Incrémenter la quantité des pièces déjà présentes, ajouter les nouvelles | [ ] |

### 4.5 Favoris

| # | Cas limite | Résultat attendu | OK ? |
|---|---|---|---|
| E22 | Ajouter 50 produits en favori | Pas de limite, page favoris scrollable | [ ] |
| E23 | Produit en favori supprimé du catalogue | Retirer de la liste favoris ou afficher "Produit indisponible" | [ ] |
| E24 | Vider le localStorage manuellement | Favoris et panier réinitialisés, pas de crash | [ ] |

### 4.6 Navigation

| # | Cas limite | Résultat attendu | OK ? |
|---|---|---|---|
| E25 | URL de produit inexistant (`/produit/xyz`) | Page 404 personnalisée avec ton LOLETT | [ ] |
| E26 | URL de catégorie inexistante (`/shop/homme/sacs`) | Page 404 ou redirect vers listing parent | [ ] |
| E27 | Navigation arrière après paiement | Ne pas re-soumettre le paiement, afficher la confirmation ou le panier vide | [ ] |
| E28 | JavaScript désactivé | Le site affiche le contenu (SSR), formulaires non fonctionnels mais contenu lisible | [ ] |

---

## 5. Checklist par page

### 5.1 Accueil (`/`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Hero : micro-copy *"Entre. Tu verras, ça vaut le coup d'oeil et parfois plus."* affichée | [ ] |
| 2 | Disclaimer *"LOLETT décline toute responsabilité en cas de coup de coeur."* visible | [ ] |
| 3 | Bloc Collections H/F : 2 visuels avec liens fonctionnels vers `/shop/homme` et `/shop/femme` | [ ] |
| 4 | Bloc Présentation fondatrice : photo + texte | [ ] |
| 5 | Bloc Réseaux sociaux : liens Instagram, TikTok, Facebook (ouvrent en nouvel onglet) | [ ] |
| 6 | Bloc Avis : minimum 3 témoignages affichés | [ ] |
| 7 | Bloc Nouveautés : 4-6 produits `isNew`, cliquables | [ ] |
| 8 | Newsletter : champ email + bouton fonctionnel | [ ] |
| 9 | `<title>` et `<meta description>` présents et uniques | [ ] |
| 10 | `<h1>` unique | [ ] |
| 11 | Lighthouse : Performance > 90, Accessibility > 90 | [ ] |
| 12 | Responsive mobile/tablette/desktop | [ ] |

---

### 5.2 Nouveautés (`/nouveautes`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Titre de page affiché ("Fraîchement débarquées" ou "Nouveautés") | [ ] |
| 2 | Grille de produits `isNew: true` affichée | [ ] |
| 3 | Badge "Nouveau" sur chaque carte | [ ] |
| 4 | Clic carte → fiche produit | [ ] |
| 5 | Bouton favori sur chaque carte | [ ] |
| 6 | État vide si aucun produit nouveau | [ ] |
| 7 | SEO : title "Nouveautés — LOLETT", meta description | [ ] |
| 8 | Responsive | [ ] |

---

### 5.3 Listing Homme (`/shop/homme`) et Femme (`/shop/femme`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Navigation par catégories (Hauts, Bas, Chaussures, Accessoires) | [ ] |
| 2 | Cartes produit : photo, nom, prix | [ ] |
| 3 | Indicateur stock sur cartes (épuisé grisé) | [ ] |
| 4 | Tri fonctionnel : nouveauté, prix croissant, prix décroissant | [ ] |
| 5 | Bouton favori sur chaque carte | [ ] |
| 6 | Clic carte → fiche produit | [ ] |
| 7 | Breadcrumb : Accueil > Sélection [Genre] | [ ] |
| 8 | SEO : title dynamique par catégorie | [ ] |
| 9 | Responsive : 1 col mobile, 2 col tablette, 3-4 col desktop | [ ] |

---

### 5.4 Fiche produit (`/produit/[slug]`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Galerie photos : navigation entre photos, zoom/lightbox | [ ] |
| 2 | Nom, description, prix TTC affichés | [ ] |
| 3 | Sélecteur taille : toutes les tailles du produit, sélection obligatoire | [ ] |
| 4 | Sélecteur couleur : pastilles si variantes | [ ] |
| 5 | Stock : "En stock" / "Dernières pièces !" / "Épuisé" selon le niveau | [ ] |
| 6 | Bouton "Ajouter au panier" : fonctionnel si taille choisie, désactivé si épuisé | [ ] |
| 7 | Bouton Favori : toggle coeur | [ ] |
| 8 | Micro-copy fixe : *"Validé par LOLETT. Tu peux y aller tranquille."* | [ ] |
| 9 | Micro-copy contextuelle : une phrase aléatoire du pool (change au rechargement) | [ ] |
| 10 | Micro-copy accessoires : pool dédié si catégorie = accessoire | [ ] |
| 11 | Bloc "Prêt à sortir" affiché si look associé | [ ] |
| 12 | Bloc "Prêt à sortir" : autres pièces avec photo, nom, prix | [ ] |
| 13 | Bloc "Prêt à sortir" : CTA individuel par pièce | [ ] |
| 14 | Bloc "Prêt à sortir" : CTA global "Ajouter le look complet" | [ ] |
| 15 | Pièces épuisées du look : grisées, CTA désactivé | [ ] |
| 16 | Breadcrumb : Accueil > Sélection [Genre] > [Catégorie] > [Produit] | [ ] |
| 17 | SEO : title "[Nom] — LOLETT", meta description, OG tags | [ ] |
| 18 | Responsive | [ ] |

---

### 5.5 Favoris (`/favoris`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Grille de produits favoris (mêmes cartes que listing) | [ ] |
| 2 | Bouton retirer favori fonctionnel | [ ] |
| 3 | Clic carte → fiche produit | [ ] |
| 4 | État vide : *"Reviens, on a gardé tes coups de coeur."* + CTA boutique | [ ] |
| 5 | Persistance après rechargement page | [ ] |
| 6 | Compteur header synchronisé | [ ] |
| 7 | Responsive | [ ] |

---

### 5.6 Panier (`/panier`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Micro-copy : *"T'es à deux clics d'être le plus stylé de ta terrasse."* | [ ] |
| 2 | Liste items : photo, nom, taille, couleur, prix unitaire | [ ] |
| 3 | Sélecteur quantité (+/-) fonctionnel, min 1 | [ ] |
| 4 | Bouton supprimer par item | [ ] |
| 5 | Sous-total correct | [ ] |
| 6 | Livraison : 5,90 EUR ou "Offerte" selon le seuil | [ ] |
| 7 | Message seuil : "Plus que X,XX EUR pour la livraison offerte !" | [ ] |
| 8 | Total = sous-total + livraison | [ ] |
| 9 | CTA "Passer commande" vers checkout | [ ] |
| 10 | État vide : message + CTA boutique | [ ] |
| 11 | Persistance après rechargement | [ ] |
| 12 | Compteur header synchronisé | [ ] |
| 13 | Responsive | [ ] |

---

### 5.7 Checkout (`/checkout`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Formulaire : nom, prénom, email, téléphone, adresse, ville, code postal | [ ] |
| 2 | Pays = France uniquement (pas de choix international) | [ ] |
| 3 | Validation côté client : champs requis, format email, code postal 5 chiffres | [ ] |
| 4 | Récap commande visible (items + total) | [ ] |
| 5 | Bouton Stripe (CB / Apple Pay) fonctionnel | [ ] |
| 6 | Bouton PayPal fonctionnel | [ ] |
| 7 | Redirect vers Stripe Checkout au clic | [ ] |
| 8 | Redirect vers PayPal au clic | [ ] |
| 9 | Accès checkout avec panier vide → redirect vers panier | [ ] |
| 10 | Responsive | [ ] |

---

### 5.8 Confirmation (`/checkout/success`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Micro-copy L1 : *"Excellente décision. Vraiment."* | [ ] |
| 2 | Micro-copy L2 : *"Tu vas recevoir des compliments. Beaucoup."* | [ ] |
| 3 | Micro-copy L3 : *"LOLETT te remercie."* | [ ] |
| 4 | N° de commande affiché | [ ] |
| 5 | Récap : items, total, adresse | [ ] |
| 6 | Panier vidé | [ ] |
| 7 | CTA "Continuer à explorer" → accueil | [ ] |
| 8 | Accès direct sans `session_id` → redirect ou message | [ ] |
| 9 | Rechargement → même confirmation (pas de doublon) | [ ] |
| 10 | Responsive | [ ] |

---

### 5.9 Contact (`/contact`)

| # | Vérification | OK ? |
|---|---|---|
| 1 | Formulaire : nom, email, sujet, message | [ ] |
| 2 | Validation client : champs requis, format email | [ ] |
| 3 | Envoi → message de succès (ton LOLETT) | [ ] |
| 4 | Email reçu côté admin LOLETT | [ ] |
| 5 | Protection anti-spam fonctionnelle | [ ] |
| 6 | Double soumission bloquée (bouton disabled après clic) | [ ] |
| 7 | Responsive | [ ] |

---

### 5.10 Pages légales

| # | Vérification | OK ? |
|---|---|---|
| 1 | `/mentions-legales` accessible et contenu affiché | [ ] |
| 2 | `/cgv` accessible et contenu affiché | [ ] |
| 3 | `/politique-confidentialite` accessible | [ ] |
| 4 | `/politique-retours` accessible | [ ] |
| 5 | Liens dans le footer fonctionnels | [ ] |
| 6 | Responsive | [ ] |

---

### 5.11 404

| # | Vérification | OK ? |
|---|---|---|
| 1 | Page 404 personnalisée avec ton LOLETT | [ ] |
| 2 | CTA retour vers accueil | [ ] |
| 3 | Responsive | [ ] |

---

## 6. Tests cross-browser

| Navigateur | Version | Desktop | Mobile | OK ? |
|---|---|---|---|---|
| Chrome | Dernière | [ ] | [ ] | [ ] |
| Safari | Dernière | [ ] | [ ] (iOS) | [ ] |
| Firefox | Dernière | [ ] | [ ] | [ ] |
| Edge | Dernière | [ ] | — | [ ] |

---

## 7. Tests performance (Lighthouse)

| Page | Performance | Accessibility | Best Practices | SEO | OK ? |
|---|---|---|---|---|---|
| Accueil | > 90 | > 90 | > 90 | > 90 | [ ] |
| Listing | > 90 | > 90 | > 90 | > 90 | [ ] |
| Fiche produit | > 90 | > 90 | > 90 | > 90 | [ ] |
| Panier | > 90 | > 90 | > 90 | > 90 | [ ] |
| Checkout | > 90 | > 90 | > 90 | > 90 | [ ] |

---

## 8. Checklist pré-production finale

| # | Vérification | OK ? |
|---|---|---|
| 1 | Variables d'environnement production configurées (Stripe live, PayPal live) | [ ] |
| 2 | Stripe en mode live (plus test) | [ ] |
| 3 | Webhook Stripe configuré sur l'URL de production | [ ] |
| 4 | PayPal en mode live (plus sandbox) | [ ] |
| 5 | Domaine configuré et SSL actif | [ ] |
| 6 | `robots.txt` autorise le crawl | [ ] |
| 7 | `sitemap.xml` soumis à Google Search Console | [ ] |
| 8 | Analytics configuré (GA4 ou autre) | [ ] |
| 9 | Bandeau cookies/RGPD si analytics | [ ] |
| 10 | Pages légales (CGV, mentions, confidentialité, retours) en ligne | [ ] |
| 11 | Email transactionnel fonctionnel (test d'envoi réel) | [ ] |
| 12 | Backup BDD configuré | [ ] |
| 13 | 0 erreur console JavaScript | [ ] |
| 14 | Tous les smoke tests passent | [ ] |
| 15 | Test de paiement réel (1 EUR) effectué et remboursé | [ ] |

---

## Questions ouvertes

| # | Question | Impact |
|---|---|---|
| 1 | Qui exécute la recette ? (développeur, client, les deux) | Organisation |
| 2 | Faut-il un environnement de staging séparé ? | Déploiement |
| 3 | Le test de paiement réel (1 EUR) est-il acceptable pour le client ? | Validation prod |
| 4 | Quels navigateurs mobiles cibler en priorité ? (Safari iOS est critique) | Tests cross-browser |

---

*Document E — Plan de recette v1.0 — Généré le 17/02/2026*
*En attente des documents restants avant validation*
