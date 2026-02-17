# Document A — PRD (Product Requirements Document)

## LOLETT — Boutique e-commerce mode

---

## Objectif du document

Définir le périmètre fonctionnel, les exigences et les contraintes du MVP LOLETT pour aligner toutes les parties (dev, design, contenu, client).

## Contenu

Spécifications complètes de chaque page, fonctionnalités, micro-copies, paiement, livraison et limites du MVP.

## Hypothèses

- Le site est une vitrine e-commerce avec paiement réel (pas de marketplace tiers).
- Le catalogue est géré par la fondatrice (back-office ou CMS headless à définir).
- La livraison est limitée à la France métropolitaine au lancement.
- Le stock est géré manuellement au départ.

## Points validés

- Stack technique : Next.js (déjà en place dans `lolett-app/`)
- Paiement : Stripe Checkout (CB + Apple Pay) + PayPal
- Responsive : Desktop, Tablette, Mobile

---

## 1. Vision produit

Boutique en ligne moderne, intuitive et vivante, avec une personnalité proche, humaine et stylée. LOLETT sélectionne des pièces mode Homme/Femme et propose des **looks complets** ("prêt à sortir") pour simplifier l'achat.

### Avantages concurrentiels

| Avantage | Description |
|---|---|
| Storytelling clair et sincère | Ton décalé, direct, complice |
| Relation de proximité | La fondatrice est visible, le site parle comme une amie |
| Expérience d'achat | Navigation par look complet, micro-copies engageantes |

## 2. Objectifs business

- Mettre en avant collections et looks complets (H/F)
- Navigation fluide avec possibilité de composer un look complet à partir d'un produit
- Expérience d'achat simple et différenciante
- Gestion autonome des produits, stocks et commandes
- Bases techniques évolutives et optimisées SEO

## 3. Cible

Acheteurs mode Homme/Femme recherchant des looks complets et des pièces sélectionnées. Profil : 20-40 ans, sensibles au style, à l'authenticité et à la simplicité d'achat.

## 4. Périmètre MVP — Sitemap

```
LOLETT
├── Accueil
├── Nouveautés ("fraîchement débarquées")
├── Marketplace
│   ├── Sélection Homme
│   │   ├── Hauts
│   │   ├── Bas
│   │   ├── Chaussures
│   │   └── Accessoires
│   └── Sélection Femme
│       ├── Hauts
│       ├── Bas
│       ├── Chaussures
│       └── Accessoires
├── Favoris
├── Panier ("ta sélection")
├── Checkout
├── Confirmation commande
└── Contact ("on papote")
```

## 5. Exigences par page

### 5.1 Accueil

| Bloc | Description | Obligatoire MVP |
|---|---|---|
| Hero | Phrase d'accroche + CTA vers collections | Oui |
| Collections H/F | Visuels + liens vers Sélection Homme / Femme | Oui |
| Présentation fondatrice | Photo + texte court storytelling | Oui |
| Réseaux sociaux | Liens Instagram / TikTok / Facebook | Oui |
| Avis clients | Témoignages (statiques ou dynamiques) | Oui |
| Nouveautés | Preview des derniers produits | Oui |
| Newsletter | Champ email + CTA | Oui |

**Micro-copies obligatoires :**
- Hero : *"Entre. Tu verras, ça vaut le coup d'oeil et parfois plus."*
- Footer/disclaimer : *"LOLETT décline toute responsabilité en cas de coup de coeur."*

### 5.2 Nouveautés ("fraîchement débarquées")

| Élément | Description |
|---|---|
| Grille produits | Derniers produits ajoutés, triés par date |
| Carte produit | Photo, nom, prix, badge "Nouveau" |
| CTA | Lien vers fiche produit |

### 5.3 Marketplace — Sélection Homme / Femme

| Élément | Description |
|---|---|
| Catégories | Hauts, Bas, Chaussures, Accessoires |
| Carte produit | Photo(s), nom, prix, stock (disponible/épuisé) |
| Tri | Par nouveauté, prix croissant/décroissant |
| Responsive | Grille adaptative (1 col mobile, 2-3 col desktop) |

**Micro-copies accessoires :**
- *"Ce n'est jamais 'en trop'."*
- *"Parce que sans, ce n'est pas pareil."*
- *"Ceux qu'on ajoute sans hésiter."*
- *"Les détails qui font tout."*

### 5.4 Fiche produit

| Élément | Description | Obligatoire MVP |
|---|---|---|
| Galerie photos | Plusieurs photos, zoom ou lightbox | Oui |
| Nom + description | Texte produit | Oui |
| Prix | Prix TTC | Oui |
| Sélecteur taille | Liste des tailles disponibles | Oui |
| Sélecteur couleur | Pastilles couleur si variantes | Oui |
| Stock | Indication disponible / épuisé / dernières pièces | Oui |
| Bouton Ajouter au panier | CTA principal | Oui |
| Bouton Favoris | Coeur toggle | Oui |
| **Bloc "Prêt à sortir"** | **Look complet associé (autres pièces du look)** | **Oui** |

**Micro-copy :** *"Validé par LOLETT. Tu peux y aller tranquille."*

**Micro-copies contextuelles (rotation aléatoire ou ciblée) :**
- *"Tu n'étais pas venue pour ça. On sait."*
- *"Oui, celui-là aussi est bien."*
- *"Il ne sera pas là éternellement."*
- *"On n'a pas inventé le tissu, mais on sait quoi en faire."*

### 5.5 Bloc "Prêt à sortir" (Look complet)

C'est la **fonctionnalité différenciante** de LOLETT.

| Élément | Description |
|---|---|
| Affichage | Apparaît sur la fiche produit si un look est associé |
| Contenu | Visuels des autres pièces du look + prix unitaires |
| CTA par pièce | "Ajouter" individuel pour chaque pièce |
| CTA global | "Ajouter le look complet au panier" |
| Données | Relation produit ↔ look gérée côté back-office/data |

### 5.6 Favoris

| Élément | Description |
|---|---|
| Toggle coeur | Disponible sur carte produit + fiche produit |
| Persistance | LocalStorage (MVP) — compte utilisateur en V2 |
| Page dédiée | `/favoris` — grille des produits sauvegardés |
| État vide | Message + CTA vers la boutique |

**Micro-copy :** *"Reviens, on a gardé tes coups de coeur."*

### 5.7 Panier ("ta sélection")

| Élément | Description |
|---|---|
| Liste items | Photo, nom, taille, couleur, quantité modifiable, prix |
| Suppression | Bouton retirer par item |
| Sous-total | Calcul automatique |
| Frais de livraison | Affichés (montant fixe ou seuil franco de port) |
| Total | Sous-total + livraison |
| CTA paiement | Vers Checkout (Stripe ou PayPal) |
| État vide | Message + CTA vers la boutique |

**Micro-copy :** *"T'es à deux clics d'être le plus stylé de ta terrasse."*

### 5.8 Checkout

| Élément | Description |
|---|---|
| Informations client | Nom, prénom, email, téléphone |
| Adresse de livraison | Formulaire France uniquement |
| Récap commande | Items + total |
| Moyens de paiement | Stripe Checkout (CB + Apple Pay) + PayPal |
| Validation | Redirection vers gateway puis retour confirmation |

### 5.9 Confirmation commande

| Élément | Description |
|---|---|
| Message | Texte LOLETT personnalisé |
| Récap | N° commande, items, total, adresse |
| Email automatique | Confirmation envoyée au client |

**Micro-copy :**
- *"Excellente décision. Vraiment."*
- *"Tu vas recevoir des compliments. Beaucoup."*
- *"LOLETT te remercie."*

### 5.10 Contact ("on papote")

| Élément | Description |
|---|---|
| Formulaire | Nom, email, sujet, message |
| Confirmation | Message de succès après envoi |
| Email | Notification envoyée à l'admin LOLETT |

## 6. Ton & micro-copies — Référentiel complet

### Micro-copies fixes (intégrées dans le code)

| Page / Contexte | Micro-copy |
|---|---|
| Accueil — Hero | "Entre. Tu verras, ça vaut le coup d'oeil et parfois plus." |
| Accueil — Disclaimer | "LOLETT décline toute responsabilité en cas de coup de coeur." |
| Fiche produit — Badge | "Validé par LOLETT. Tu peux y aller tranquille." |
| Favoris — Titre / vide | "Reviens, on a gardé tes coups de coeur." |
| Panier — Titre | "T'es à deux clics d'être le plus stylé de ta terrasse." |
| Confirmation — L1 | "Excellente décision. Vraiment." |
| Confirmation — L2 | "Tu vas recevoir des compliments. Beaucoup." |
| Confirmation — L3 | "LOLETT te remercie." |

### Micro-copies contextuelles (rotation)

| Contexte | Phrases |
|---|---|
| Fiche produit (général) | "Tu n'étais pas venue pour ça. On sait." / "Oui, celui-là aussi est bien." / "Il ne sera pas là éternellement." / "On n'a pas inventé le tissu, mais on sait quoi en faire." |
| Accessoires | "Ce n'est jamais 'en trop'." / "Parce que sans, ce n'est pas pareil." / "Ceux qu'on ajoute sans hésiter." / "Les détails qui font tout." |

## 7. Paiement — Exigences MVP

| Critère | Spécification |
|---|---|
| Stripe Checkout | CB (Visa, Mastercard, CB), Apple Pay |
| PayPal | Bouton PayPal Standard ou Express |
| Devise | EUR uniquement |
| Sécurité | SCA / 3D Secure via Stripe |
| Webhooks | Confirmation paiement, mise à jour statut commande |
| Environnement | Mode test obligatoire avant mise en prod |

## 8. Livraison — Exigences MVP

| Critère | Spécification |
|---|---|
| Zone | France métropolitaine uniquement |
| Mode | Livraison standard à domicile |
| Frais | Montant fixe ou seuil de gratuité (à définir) |
| Suivi | Numéro de suivi envoyé par email (si transporteur le permet) |

## 9. Contraintes techniques

| Contrainte | Détail |
|---|---|
| Responsive | Mobile-first, Desktop, Tablette |
| Performance | Score Lighthouse > 90 (perf, a11y, SEO) |
| SEO | Balises meta, sitemap, robots.txt, SSR/SSG |
| Stack | Next.js (App Router), TypeScript, Tailwind CSS |
| Hébergement | Vercel (déjà configuré) |
| État local | Zustand (panier, favoris) — déjà en place |

## 10. Hors périmètre — V2+

| Fonctionnalité | Priorité |
|---|---|
| Filtres (prix, couleur, taille) | V2 |
| Programme de fidélité | V2 |
| Click & Collect | V2 |
| Comptes utilisateurs / login | V2 |
| Avis clients dynamiques (post-achat) | V2 |
| Multi-langue | V3 |
| International (hors France) | V3 |

## 11. Métriques de succès

| Métrique | Cible |
|---|---|
| Taux de conversion | > 2% |
| Panier moyen | À mesurer post-lancement |
| Taux d'ajout "look complet" | Tracker via analytics |
| Score Lighthouse | > 90 sur les 4 catégories |
| Temps de chargement | < 2s (First Contentful Paint) |

---

## Questions ouvertes (à valider avec le client)

> Ces points manquent dans le cahier des charges. Ils doivent être tranchés avant le développement.

### Paiement & commandes
1. **Frais de livraison** : quel montant fixe ? Y a-t-il un seuil de gratuité (ex: gratuit au-dessus de 80 EUR) ?
2. **Transporteur** : quel prestataire (Colissimo, Mondial Relay, Chronopost) ? Avec ou sans suivi ?
3. **Politique de retours** : acceptés ? Sous quel délai ? Qui paie le retour ? (obligatoire légalement)
4. **Email transactionnel** : quel service (Resend, SendGrid, Mailgun) ? Ou envoi via Stripe Receipt ?
5. **TVA** : les prix affichés sont TTC ? Quel taux (20%) ?

### Contenu & marque
6. **Texte présentation fondatrice** : à fournir par le client
7. **Photos produits** : qui les fournit ? Format attendu ? (ratio, résolution minimum)
8. **Données looks** : comment sont définis les looks ? Qui associe les produits entre eux ?
9. **Logo** : format SVG disponible ?
10. **Mentions légales / CGV / Politique de confidentialité** : à rédiger ou fournir

### Technique
11. **Nom de domaine** : lolett.fr ? lolett.com ? Déjà acheté ?
12. **Back-office** : comment la fondatrice gère-t-elle les produits ? (Supabase ? CMS headless ? Admin custom ?)
13. **Analytics** : Google Analytics 4 ? Autre solution ?
14. **Cookies** : bandeau RGPD nécessaire (si analytics)
15. **Email de contact** : quelle adresse reçoit les messages du formulaire ?

---

*Document A — PRD v1.0 — Généré le 17/02/2026*
*En attente de validation avant passage au Document B (claude.md)*
