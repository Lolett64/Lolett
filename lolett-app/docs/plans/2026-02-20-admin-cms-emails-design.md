# Admin CMS + Gestion Emails — Design Document

**Date** : 2026-02-20
**Statut** : Validé

## Objectif

Rendre l'admin 100% autonome pour la cliente. Elle doit pouvoir modifier tout le contenu visible du site (images, textes, bannières) et les emails transactionnels sans développeur.

## Scope

### 1. CMS Contenu du Site

#### Table `site_content` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `section` | text | Ex: "hero", "collections", "footer", "contact" |
| `key` | text | Ex: "title", "subtitle", "image_url" |
| `value` | text | Le contenu (texte ou URL image) |
| `type` | text | "text", "textarea", "image", "url", "video" |
| `label` | text | Label affiché dans l'admin (FR) |
| `sort_order` | int | Ordre d'affichage |
| `updated_at` | timestamp | Dernière modification |

#### Sections éditables

- **Hero** : badge ("Collection Été 2026"), titre, sous-titre, vidéo/image, texte boutons
- **Collections** : images Homme/Femme, titres
- **Brand Story** : citation, piliers (qualité, style, simplicité)
- **Newsletter** : titre, description, réduction, texte bouton
- **Trust Bar** : 3 messages (livraison, retours, paiement)
- **Contact** : email, téléphone, adresse, FAQ (questions/réponses)
- **Footer** : tagline, liens sociaux (Instagram, TikTok, Facebook)
- **Notre Histoire** : tous les textes + images des sections

#### Page Admin `/admin/contenu`

- UI en accordéon par section
- Champs texte = input ou textarea
- Champs image = upload drag & drop avec preview
- Bouton "Enregistrer" par section
- Badge "Modifié" si non sauvegardé

#### Côté front

Helper `getSiteContent(section)` qui fetch Supabase avec cache ISR (revalidation 60s). Les composants remplacent les valeurs hardcodées.

### 2. Gestion Emails

#### Table `email_settings` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `template_key` | text | "order_confirmation", "welcome_newsletter" |
| `label` | text | "Confirmation de commande", "Email de bienvenue" |
| `from_name` | text | "LOLETT" |
| `from_email` | text | "hello@lolett.com" |
| `subject_template` | text | "Confirmation de commande {orderNumber}" |
| `greeting` | text | "Merci, {firstName}." |
| `body_text` | text | "Nous préparons vos pièces avec soin." |
| `cta_text` | text | "Suivre ma commande" |
| `cta_url` | text | URL du bouton |
| `signoff` | text | "Avec amour, LOLETT ♥" |
| `extra_params` | jsonb | Paramètres spécifiques (% réduction, durée promo...) |
| `updated_at` | timestamp | |

#### Page Admin `/admin/emails`

- Liste des templates avec carte par email
- Formulaire d'édition avec tous les champs
- **Preview live** : panneau à droite, rendu HTML en temps réel
- Variables dynamiques affichées en bleu ({firstName}, {orderNumber}...)
- Bouton "Envoyer un test"

#### Côté back

Les fonctions d'envoi fetchent les settings depuis la table au lieu des valeurs hardcodées.

### 3. Versioning (Historique)

#### Table `content_history` (Supabase)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | PK |
| `table_name` | text | "site_content" ou "email_settings" |
| `record_id` | uuid | FK vers l'enregistrement modifié |
| `previous_value` | jsonb | Snapshot de l'ancien état |
| `changed_by` | text | Email de l'admin |
| `changed_at` | timestamp | Date du changement |

#### Fonctionnement

- Chaque sauvegarde crée une entrée historique avec l'ancien état
- Bouton "Historique" par section/template → drawer avec timeline
- Chaque entrée : date, qui a modifié, bouton "Restaurer"
- Restaurer = remet l'ancienne valeur + crée nouvelle entrée historique

#### UI

- Icône horloge à côté du bouton "Enregistrer"
- Drawer latéral avec timeline des modifications
- Diff visuel pour textes (rouge/vert)
- Images : miniatures avant/après côte à côte

## UX Admin — Inspiré du front

- Palette admin : bleu #2418a6 (actions), fond #f7f7fb
- Typo : Playfair Display (titres), DM Sans (corps)
- Cards blanches, borders subtiles, shadow-sm → shadow-md au hover
- Animations snappy (300ms), pas d'effets lourds
- Accordéons fluides pour les sections CMS
- Preview emails dans un cadre qui simule un client email

## Architecture technique

- `lib/cms/content.ts` — helper `getSiteContent(section)` avec cache
- `lib/cms/emails.ts` — helper `getEmailSettings(templateKey)`
- `lib/cms/history.ts` — helper `saveHistory()` et `getHistory()`
- `app/api/admin/content/route.ts` — CRUD contenu
- `app/api/admin/emails/route.ts` — CRUD email settings
- `app/api/admin/emails/preview/route.ts` — génération preview HTML
- `app/api/admin/emails/test/route.ts` — envoi email test
- `supabase/migrations/` — nouvelles migrations pour les 3 tables
- Seed data avec les valeurs actuelles hardcodées
