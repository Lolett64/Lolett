# PLAN D'ACTION — LOLETT MVP

---

## Vue d'ensemble

**8 documents de cadrage terminés.** Ce plan consolide tout en un chemin d'exécution clair.

```
Semaine 0    Décisions bloquantes + setup
Semaine 1    BDD + Admin + Données réelles
Semaine 2    Paiement (Stripe + PayPal)
Semaine 3    Polish front + Emails + Looks
Semaine 4    SEO + Légal + Recette + Déploiement
```

---

## PHASE 0 — Décisions bloquantes (avant de coder)

> Rien n'avance tant que ces points ne sont pas tranchés.

| # | Question | Options | Recommandation | Impact |
|---|---|---|---|---|
| 1 | **Base de données** | Supabase / Vercel Postgres / autre | **Supabase** (gratuit, Auth V2, Storage images) | Tout le back-end |
| 2 | **Service email** | Resend / SendGrid / Stripe Receipts | **Resend** (API moderne, templates React) | Confirmation commande + contact |
| 3 | **Nom de domaine** | lolett.fr / lolett.com / autre | À confirmer | SSL, Apple Pay, SEO, emails |
| 4 | **Catégories définitives** | Celles du code (chemises, pantalons, robes, tops) ou celles du cahier des charges (hauts, bas, chaussures, accessoires) | **Cahier des charges** | Navigation, données, SEO |
| 5 | **Admin** | Interface custom Next.js / Supabase Studio en attendant | **Supabase Studio** en MVP, custom en V1.1 | Effort dev semaine 1 |
| 6 | **Comptes clients** | MVP ou V1.1 | **V1.1** (pas bloquant pour vendre) | Planification |
| 7 | **Pages légales** | Client fournit / template / avocat | Fournir un template à compléter | Mise en prod |

### Ce dont j'ai besoin de toi pour commencer :

1. Tes réponses aux 7 questions ci-dessus
2. Les **contenus prioritaires** (voir Pack contenus doc F) :
   - Logo SVG
   - Au moins 3-5 produits réels (photos + infos) pour tester
   - Liens réseaux sociaux
   - Email de contact

---

## PHASE 1 — Setup & Données (Semaine 1)

### 1.1 Setup technique

| Tâche | Détail | Dépend de |
|---|---|---|
| Créer le projet Supabase | Région eu-west, projet "lolett" | Décision #1 |
| Schéma BDD | Tables : products, looks, look_products, categories, orders, order_items, customers | — |
| Variables d'environnement | `.env.local` avec clés Supabase, Stripe (test), PayPal (sandbox) | — |
| Installer packages | `stripe`, `@paypal/react-paypal-js`, `resend`, `@supabase/supabase-js` | — |
| Adapter Supabase | `lib/adapters/supabase.ts` implémentant les interfaces existantes | Schéma BDD |
| Switcher l'adapter | `lib/adapters/index.ts` → exporte Supabase au lieu de mock | Adapter |

### 1.2 Données

| Tâche | Détail | Dépend de |
|---|---|---|
| Corriger les catégories | Aligner sur hauts/bas/chaussures/accessoires, fixer l'encodage | Décision #4 |
| Migrer les produits mock → Supabase | Importer les données existantes de `data/` | Adapter Supabase |
| Importer les produits réels | CSV client → Supabase | Contenus client |
| Créer les looks | Associer produits entre eux | Produits importés |

### 1.3 Admin (si Supabase Studio)

| Tâche | Détail | Dépend de |
|---|---|---|
| Configurer les vues Supabase Studio | Vues produits, commandes, stocks | Schéma BDD |
| Documenter le workflow admin | Guide pour ajouter un produit, modifier un stock, voir les commandes | — |

**Livrable fin semaine 1 :** BDD fonctionnelle, produits réels importés, site connecté aux vraies données.

---

## PHASE 2 — Paiement réel (Semaine 2)

### 2.1 Stripe

| Tâche | Fichier à créer | Dépend de |
|---|---|---|
| Instance Stripe serveur | `lib/stripe.ts` | Clés Stripe test |
| Route création session | `app/api/checkout/stripe/session/route.ts` | lib/stripe.ts |
| Webhook Stripe | `app/api/webhooks/stripe/route.ts` | Route session |
| Vérification stock avant paiement | Dans la route session | Adapter Supabase |
| Idempotence | Clé = event.id, vérif statut commande | Webhook |

### 2.2 PayPal

| Tâche | Fichier à créer | Dépend de |
|---|---|---|
| Helpers PayPal (auth, API) | `lib/paypal.ts` | Clés PayPal sandbox |
| Route create order | `app/api/checkout/paypal/order/route.ts` | lib/paypal.ts |
| Route capture | `app/api/checkout/paypal/capture/route.ts` | Route order |
| Bouton PayPal checkout | Modifier `features/checkout/` | SDK PayPal |
| Idempotence | Clé = paypal_order_id + capture_id | Route capture |

### 2.3 Commandes & Emails

| Tâche | Fichier à créer | Dépend de |
|---|---|---|
| Mise à jour types Order | `types/index.ts` (statuts, paymentProvider, etc.) | — |
| Route statut commande | `app/api/checkout/status/route.ts` | — |
| Service email | `lib/email.ts` | Décision #2 |
| Template email confirmation | `lib/email-templates/order-confirmation.tsx` | Service email |
| Connecter page confirmation | `app/checkout/success/page.tsx` → API | Routes API |
| Vider le panier après paiement | Dans la page success | — |

### 2.4 Tests paiement

| Test | Carte/Méthode |
|---|---|
| CB réussie | `4242 4242 4242 4242` |
| 3DS réussi | `4000 0027 6000 3184` |
| Carte refusée | `4000 0000 0000 0002` |
| Annulation | Clic retour |
| Idempotence webhook | `stripe events resend` via CLI |
| PayPal sandbox | Compte test PayPal |

**Livrable fin semaine 2 :** Paiement fonctionnel en mode test (Stripe + PayPal), commandes en BDD, emails envoyés.

---

## PHASE 3 — Polish front-end (Semaine 3)

### 3.1 Micro-copies & ton LOLETT

| Tâche | Page | Détail |
|---|---|---|
| Helper micro-copies | `lib/microcopy.ts` | Pool de phrases + rotation aléatoire |
| Intégrer micro-copies fixes | Accueil, PDP, Favoris, Panier, Confirmation | Textes exacts du cahier des charges |
| Intégrer micro-copies contextuelles | PDP, Accessoires | Rotation aléatoire |
| Fallback états vides | Favoris, Panier, Nouveautés, 404 | Textes ton LOLETT |

### 3.2 Bloc "Prêt à sortir"

| Tâche | Détail |
|---|---|
| Vérifier `ProductLooks.tsx` | Affiche les pièces du look hors produit en cours |
| CTA individuel par pièce | Ajouter au panier avec sélection taille |
| CTA global "Ajouter le look complet" | Ajoute toutes les pièces disponibles |
| Gestion stock dans le look | Pièces épuisées grisées, CTA désactivé |
| Multi-looks | Si produit dans 2+ looks, navigation entre looks |

### 3.3 Panier — Seuil livraison

| Tâche | Détail |
|---|---|
| Afficher seuil restant | "Plus que X,XX EUR pour la livraison offerte !" |
| Calcul exact | Seuil = 100 - sous-total, arrondi 2 décimales |
| Masquer si >= 100 EUR | Afficher "Livraison offerte" |

### 3.4 Formulaire contact

| Tâche | Fichier |
|---|---|
| Route API envoi | `app/api/contact/route.ts` |
| Template email notification | `lib/email-templates/contact-notification.tsx` |
| Validation serveur | Sanitization, rate limiting |
| Message succès ton LOLETT | Composant existant à compléter |

### 3.5 Contenus réels

| Tâche | Dépend de |
|---|---|
| Bio fondatrice + photo | Contenu client (ou fallback) |
| Photos produits réels | Contenu client |
| Avis clients | Contenu client (ou fallback) |
| Liens réseaux sociaux réels | URLs client |

**Livrable fin semaine 3 :** Front-end complet avec ton LOLETT, looks fonctionnels, panier avec seuil, contact opérationnel.

---

## PHASE 4 — SEO, Légal, Recette (Semaine 4)

### 4.1 SEO

| Tâche | Détail |
|---|---|
| Meta tags dynamiques | Title + description sur toutes les pages (templates doc G) |
| Open Graph + Twitter Cards | Fiches produit + accueil |
| Schema.org JSON-LD | Product (PDP), Organization (accueil), BreadcrumbList |
| Vérifier sitemap.xml | Toutes les pages indexables incluses |
| Mettre à jour robots.txt | Exclure /checkout, /panier, /favoris, /api |
| Alt text images | Toutes les images produit |
| Canonical URLs | Sur toutes les pages |

### 4.2 Pages légales

| Tâche | Dépend de |
|---|---|
| Créer `/mentions-legales` | Contenu client (SIRET, raison sociale) |
| Créer `/cgv` | Contenu client ou template |
| Créer `/politique-confidentialite` | Contenu client ou template |
| Créer `/politique-retours` | Contenu client (délai, conditions) |
| Liens footer | Ajouter dans `Footer.tsx` |

### 4.3 Page 404

| Tâche | Détail |
|---|---|
| Page 404 personnalisée | Ton LOLETT + CTA retour accueil |

### 4.4 Recette complète (Doc E)

| Bloc | Nombre de tests |
|---|---|
| Smoke tests (bloquants) | 22 |
| Tests paiement | 12 |
| Tests SEO | 11 |
| Cas limites | 28 |
| Checklist par page | 11 pages |
| Cross-browser | 4 navigateurs x 2 devices |
| Lighthouse | 5 pages |
| Checklist pré-prod | 15 vérifications |

### 4.5 Mise en production

| Étape | Détail |
|---|---|
| 1. Domaine | Configurer le domaine sur Vercel |
| 2. Stripe live | Basculer les clés test → production |
| 3. Webhook prod | Configurer l'URL webhook Stripe sur le domaine final |
| 4. PayPal live | Basculer sandbox → production |
| 5. Apple Pay | Upload fichier vérification domaine Stripe |
| 6. Email | Configurer le domaine d'envoi (SPF, DKIM) |
| 7. Test réel | Paiement de 1 EUR → vérifier → rembourser |
| 8. Google Search Console | Soumettre sitemap |
| 9. Analytics | Configurer GA4 + bandeau cookies |

**Livrable fin semaine 4 :** Site en production, paiement live, SEO configuré, recette passée.

---

## Résumé visuel

```
PHASE 0 (maintenant)          PHASE 1 (S1)              PHASE 2 (S2)              PHASE 3 (S3)              PHASE 4 (S4)
─────────────────────          ──────────────            ──────────────            ──────────────            ──────────────
 Décisions client               Supabase                  Stripe API                Micro-copies              SEO tags
 Logo + produits                 Schéma BDD                PayPal API                Looks CTA                 Schema.org
 Réponses 7 questions            Adapter                   Webhooks                  Seuil livraison           Pages légales
 Clés Stripe/PayPal             Import données             Emails                    Contact email             Recette
                                Catégories fix             Tests paiement            Contenus réels            Mise en prod
                                                                                                              ▼
                                                                                                          🚀 LIVE
```

---

## Ce que je peux faire tout de suite

Sans attendre tes réponses, je peux déjà avancer sur :

1. **Corriger les catégories** (`data/categories.ts`) — encodage + alignement cahier des charges
2. **Créer `lib/microcopy.ts`** — helper micro-copies LOLETT avec rotation
3. **Ajouter le seuil livraison** dans le panier
4. **Améliorer le bloc "Prêt à sortir"** — CTA global + gestion stock
5. **Créer la page 404** personnalisée
6. **Préparer la structure des routes API** (stubs)

---

## Prochaine étape

**Réponds aux 7 questions de la Phase 0**, et je lance la Phase 1 immédiatement. En parallèle, dis-moi si tu veux que j'attaque les 6 tâches listées ci-dessus.
