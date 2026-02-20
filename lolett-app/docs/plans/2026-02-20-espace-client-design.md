# Espace Client Premium — Design

## Authentification
- Supabase Auth : email + mot de passe + Google OAuth
- Confirmation email, reset password
- Pages auth (login/register) : fond sombre premium

## Dashboard Compte (fond clair)
- **Mon profil** : nom, email, téléphone, photo
- **Mes adresses** : CRUD, une par défaut
- **Mes commandes** : historique + statut temps réel
- **Mes favoris** : synchronisés serveur
- **Mon panier** : persistant serveur, synchro multi-device
- **Mes avis** : liste, modifier/supprimer

## Programme Fidélité
- 1€ = 1 point
- Paliers : 100pts=-5€, 250pts=livraison offerte, 500pts=-15€, 1000pts=ventes privées
- Widget barre de progression dans le dashboard

## Avis Produits
- Publication directe (acheteurs vérifiés uniquement)
- Note 1-5 étoiles + commentaire
- Signalement par les utilisateurs
- Modération admin des avis signalés

## Recommandations Personnalisées
- Basées sur historique achats + favoris
- Section "Pour vous" (page d'accueil, si connecté)
- "Vous aimerez aussi" amélioré (page produit)

## Tables Supabase (migrations CLI)
- `profiles` (user_id, first_name, last_name, phone, avatar_url, loyalty_points)
- `addresses` (id, user_id, label, address, city, postal_code, country, is_default)
- `reviews` (id, user_id, product_id, rating, comment, flagged, created_at)
- `favorites` (user_id, product_id)
- `loyalty_rewards` (id, name, points_cost, reward_type, value)
- Modifier `orders` : ajouter `user_id`
- Nouvelle table `cart_items` (user_id, product_id, variant, quantity)

## Middleware
- `middleware.ts` : protège `/compte/*` → redirige `/connexion`
- Merge panier localStorage → serveur au login

## Design
- Auth : sombre premium (palette or #c4a44e)
- Dashboard : fond clair, or en accent
