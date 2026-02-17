# Document F — Pack contenus à fournir par le client

---

## Objectif du document

Lister tous les contenus que le client doit fournir pour compléter le site, avec les formats attendus, et proposer des textes fallback en ton LOLETT en attendant les contenus définitifs.

## Contenu

Checklist contenus (brand, catalogue, contact, légal), gabarits de pages avec fallback, formats et spécifications techniques.

## Hypothèses

- Les textes fallback respectent le ton LOLETT et peuvent être utilisés en développement.
- Le client remplacera les fallback par ses contenus définitifs avant la mise en production.
- Les photos produit sont fournies par le client.

## Points à valider

- Voir section "Questions ouvertes" en fin de document.

---

## 1. Checklist contenus à récupérer

### 1.1 Brand & identité

| # | Contenu | Format attendu | Statut |
|---|---|---|---|
| 1 | Bio fondatrice (150-300 mots) | Texte | [ ] À fournir |
| 2 | Photo fondatrice | JPG/PNG, min 800x800px | [ ] À fournir |
| 3 | Photos ambiance (3-5 photos lifestyle) | JPG/PNG, min 1200x800px | [ ] À fournir |
| 4 | Logo LOLETT | SVG + PNG (fond transparent) | [ ] À fournir |
| 5 | Favicon | PNG 512x512 ou SVG | [ ] À fournir |
| 6 | Lien Instagram | URL | [ ] À fournir |
| 7 | Lien TikTok | URL | [ ] À fournir |
| 8 | Lien Facebook | URL | [ ] À fournir |
| 9 | Palette couleurs (si existante) | Codes hex | [ ] À fournir |
| 10 | Typographie (si existante) | Nom de la police | [ ] À fournir |

### 1.2 Catalogue produits

| # | Contenu | Format attendu | Statut |
|---|---|---|---|
| 11 | Liste produits | CSV ou tableur (voir gabarit §3) | [ ] À fournir |
| 12 | Photos produit (3-5 par produit) | JPG/PNG, min 800x1000px, fond neutre | [ ] À fournir |
| 13 | Descriptions courtes (1-2 phrases) | Texte, ton LOLETT | [ ] À fournir |
| 14 | Descriptions longues (si applicable) | Texte | [ ] Optionnel |
| 15 | Looks (associations de produits) | Voir gabarit §3.2 | [ ] À fournir |

### 1.3 Avis clients

| # | Contenu | Format attendu | Statut |
|---|---|---|---|
| 16 | Avis (min 3, idéalement 6) | Texte + prénom ou initiales + note /5 | [ ] À fournir |
| 17 | Consentement des clients cités | Accord écrit | [ ] À vérifier |

### 1.4 Contact

| # | Contenu | Format attendu | Statut |
|---|---|---|---|
| 18 | Email de contact | Adresse email | [ ] À fournir |
| 19 | Téléphone (optionnel) | Numéro | [ ] Optionnel |
| 20 | Adresse physique (si applicable) | Texte | [ ] Optionnel |
| 21 | Horaires de réponse (optionnel) | Texte | [ ] Optionnel |

### 1.5 Légal (obligatoire avant mise en production)

| # | Contenu | Format attendu | Statut |
|---|---|---|---|
| 22 | Mentions légales | Texte (raison sociale, SIRET, adresse, hébergeur) | [ ] À fournir |
| 23 | CGV (Conditions Générales de Vente) | Texte | [ ] À fournir |
| 24 | Politique de confidentialité (RGPD) | Texte | [ ] À fournir |
| 25 | Politique de retours / échanges | Texte (délai, conditions, qui paie) | [ ] À fournir |

---

## 2. Textes fallback (ton LOLETT)

> À utiliser en développement. Le client les remplace avant la mise en production.

### 2.1 Accueil — Bio fondatrice (fallback)

```
LOLETT, c'est parti d'une idée simple : on mérite tous d'être bien habillés sans y passer trois heures.

Je sélectionne chaque pièce comme si c'était pour moi (spoiler : parfois c'est le cas). Des coupes qui tombent bien, des matières qu'on a envie de toucher, et des prix qui ne font pas grimacer.

Ici, pas de tendances éphémères ni de collections à rallonge. Juste des pièces qui fonctionnent ensemble, pour que tu sortes de chez toi en te disant "ouais, je suis bien là".

Bienvenue chez LOLETT. Installe-toi, regarde, et si tu craques… on t'avait prévenu.
```

### 2.2 Accueil — Section Collections (fallback)

**Bloc Homme :**
```
Sélection Homme
Des pièces pensées pour ceux qui veulent être stylés sans y réfléchir trop longtemps.
```

**Bloc Femme :**
```
Sélection Femme
Des looks qu'on enfile et qu'on ne regrette pas. Jamais.
```

### 2.3 Accueil — Newsletter (fallback)

```
Titre : "Reste dans la boucle"
Sous-titre : "Les nouveautés, les looks, les bons plans. Pas de spam, promis."
Bouton : "Je m'inscris"
Placeholder : "ton@email.com"
```

### 2.4 Page Nouveautés — Titre (fallback)

```
Fraîchement débarquées
Les dernières pièces à rejoindre la sélection LOLETT.
```

### 2.5 Page Nouveautés — État vide (fallback)

```
On prépare la suite. Reviens vite, ça ne va pas tarder.
```

### 2.6 Page Favoris — État vide (fallback)

```
Reviens, on a gardé tes coups de coeur.

Bon, pour l'instant il n'y en a pas. Mais ça va venir.

[Découvrir la boutique]
```

### 2.7 Page Panier — État vide (fallback)

```
Ton panier est vide.
C'est triste. On peut arranger ça.

[Voir la boutique]
```

### 2.8 Page Contact — Intro (fallback)

```
On papote ?
Une question, une remarque, ou juste envie de dire bonjour ? On est là.
```

### 2.9 Page Contact — Confirmation envoi (fallback)

```
Message envoyé !
On te répond vite. En attendant, tu peux toujours aller faire un tour dans la boutique.
```

### 2.10 Page 404 (fallback)

```
Oups. Cette page n'existe pas.
Mais ne t'inquiète pas, il y a plein d'autres choses à voir.

[Retour à l'accueil]
```

### 2.11 Produit épuisé (fallback)

```
Celui-là est parti trop vite. On comprend.
```

### 2.12 Stock bas (fallback)

```
Dernières pièces — fais vite.
```

### 2.13 Erreur paiement (fallback)

```
Hmm, quelque chose a coincé. Pas de panique, ton panier est toujours là. Réessaie ou contacte-nous.
```

---

## 3. Gabarits de données

### 3.1 Gabarit CSV Produits

```csv
nom,slug,genre,categorie,prix,tailles,couleurs_nom,couleurs_hex,stock,description_courte,description_longue,is_new,tags,image_1,image_2,image_3
"T-shirt essentiel","t-shirt-essentiel","homme","hauts",29.90,"S,M,L,XL","Blanc,Noir","#FFFFFF,#000000",25,"Le basique qui manquait à ton dressing.","Coton bio 180g, coupe regular. Lavable 30°C.",true,"basique,coton","tshirt-blanc-1.jpg","tshirt-blanc-2.jpg","tshirt-blanc-3.jpg"
```

**Colonnes :**

| Colonne | Type | Obligatoire | Description |
|---|---|---|---|
| nom | texte | Oui | Nom du produit |
| slug | texte | Oui | URL-friendly (minuscules, tirets) |
| genre | "homme" / "femme" | Oui | Genre cible |
| categorie | texte | Oui | Slug catégorie (hauts, bas, chaussures, accessoires) |
| prix | nombre | Oui | Prix TTC en EUR |
| tailles | texte | Oui | Séparées par virgules (TU, XS, S, M, L, XL) |
| couleurs_nom | texte | Oui | Noms séparés par virgules |
| couleurs_hex | texte | Oui | Codes hex séparés par virgules |
| stock | nombre | Oui | Quantité en stock |
| description_courte | texte | Oui | 1-2 phrases, ton LOLETT |
| description_longue | texte | Non | Détails matière, entretien, etc. |
| is_new | true/false | Oui | Apparaît dans Nouveautés |
| tags | texte | Non | Mots-clés séparés par virgules |
| image_1 à image_5 | fichier | Oui (min 1) | Noms des fichiers photos |

### 3.2 Gabarit Looks

```csv
nom_look,genre,vibe,pitch,produit_1_slug,produit_2_slug,produit_3_slug,produit_4_slug,image_cover
"Le Décontracté","homme","casual","Pour ceux qui font stylé sans effort.","t-shirt-essentiel","chino-beige","baskets-blanches","","look-decontracte.jpg"
```

### 3.3 Gabarit Avis

```csv
prenom,note,commentaire
"Sophie",5,"J'ai commandé le look complet et franchement, je ne regrette pas. La qualité est top."
"Marc",4,"Livraison rapide, le t-shirt taille parfaitement. Je recommande."
"Léa",5,"Enfin un site qui propose des looks entiers ! Plus besoin de réfléchir."
```

---

## 4. Spécifications photos

| Type | Dimensions min | Format | Poids max | Notes |
|---|---|---|---|---|
| Photo produit | 800x1000 px | JPG ou PNG | 2 Mo | Fond neutre, éclairage homogène |
| Photo ambiance | 1200x800 px | JPG | 3 Mo | Lifestyle, mise en situation |
| Photo fondatrice | 800x800 px | JPG ou PNG | 2 Mo | Portrait, souriant, naturel |
| Logo | Vectoriel | SVG + PNG | — | Fond transparent |
| Cover look | 1200x800 px | JPG | 3 Mo | Mise en scène du look complet |

**Naming convention :** `[slug-produit]-[numero].jpg` (ex: `t-shirt-essentiel-1.jpg`)

---

## Questions ouvertes

| # | Question | Impact |
|---|---|---|
| 1 | Le client a-t-il déjà des photos produit ou faut-il organiser un shooting ? | Bloque le catalogue |
| 2 | Les avis sont-ils de vrais clients ou des témoignages reconstitués ? (conformité légale) | Contenu accueil |
| 3 | Le client a-t-il un SIRET / raison sociale pour les mentions légales ? | Bloque I2 |
| 4 | Qui rédige les CGV ? Le client, un avocat, ou un template standard ? | Bloque I2 |
| 5 | Le texte fondatrice est-il à rédiger par le client ou peut-on proposer une version ? | Contenu accueil |
| 6 | Les catégories du cahier des charges (hauts, bas, chaussures, accessoires) sont-elles définitives ou le client veut-il les adapter ? | Architecture données |

---

*Document F — Pack contenus v1.0 — Généré le 17/02/2026*
