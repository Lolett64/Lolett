# Migration de lolettshop.com de Vercel vers le VPS Propulseo (Coolify)

Date : 2026-08-20
Décision commerciale : l'hébergement a été vendu à la cliente. Le site quitte le
compte Vercel de Lola pour le VPS Propulseo, piloté par Coolify.

## Contexte

| | Avant | Après |
|---|---|---|
| Hébergement | Vercel, compte `lolett64s-projects` | VPS OVH `146.59.228.186`, Coolify 4.1.1 |
| Base de données | Supabase `qczdwrudgmozyxkdidmr` | inchangée |
| Médias | Supabase Storage | inchangés (décision du 2026-08-20) |
| Paiements | Stripe | inchangé, même domaine donc même webhook |
| Emails | Brevo (SMTP + API) | inchangés |
| Limiteur de requêtes | Upstash Redis | inchangé |

Serveur cible : 6 cœurs, 11 Go de RAM (6,3 Go libres), 96 Go de disque
(50 Go libres), 37 conteneurs déjà actifs, proxy `coolify-proxy` (Traefik).

## Ce qui casse en quittant Vercel

1. **`@vercel/blob`** — utilisé par les deux tâches de sauvegarde. Inutilisable
   hors Vercel. À remplacer.
2. **Les déclencheurs horaires** définis dans `vercel.json` — non lus ailleurs.
   À recréer en tâches planifiées Coolify.
3. **La redirection `www` → apex**, également dans `vercel.json`.
4. **Aucun `Dockerfile` ni `output: 'standalone'`** — le projet n'a jamais été
   construit pour tourner hors de Vercel.

## Trous constatés à l'audit (préexistants, à corriger au passage)

- **Les sauvegardes n'ont jamais tourné** : `CRON_SECRET` absent des variables
  (la route répond 401) et aucun espace Vercel Blob n'existe sur le compte.
  La boutique tourne sans sauvegarde depuis le lancement.
- **Sentry non branché en production** : aucune variable `SENTRY_*` renseignée.
- Quatre variables attendues par le code et absentes : `NEWSLETTER_FROM_EMAIL`,
  `NEWSLETTER_WELCOME_CODE`, `RESEND_AUDIENCE_ID`, `NEXT_PUBLIC_GTM_ID`.

## Décisions

- **Sauvegardes → volume persistant du VPS**, pas Supabase Storage. Garder les
  sauvegardes d'une base Supabase dans ce même Supabase les mettrait dans le
  même panier ; le VPS offre une vraie séparation et 50 Go libres.
- **Construction par `Dockerfile`** avec `output: 'standalone'`, plus fiable que
  la détection automatique pour Next 15 + pnpm + sharp.
- **Redirection `www` → apex déplacée dans `next.config.ts`** : la clause
  `has: [{ type: 'host' }]` est une fonction de Next.js, pas de Vercel, donc
  elle fonctionne en auto-hébergé.
- **Rodage sur `lolett.propulseo-site.com`** avant bascule du DNS.
- **4 Go de swap ajoutés au VPS** : sans filet, une construction Next (2 à 4 Go)
  lancée pendant qu'une autre application se redéploie peut faire tuer un
  processus au hasard, y compris chez un autre client.

## Ordre de bascule

1. Swap sur le VPS.
2. Branche `feat/hebergement-vps` : `Dockerfile`, `standalone`, redirection,
   sauvegardes réécrites, tests mis à jour.
3. Application Coolify dans le projet « Clients Hebergement », source GitHub
   `Lolett64/Lolett`, 27 variables reprises de Vercel.
4. Déploiement sur `lolett.propulseo-site.com` et vérification à froid.
5. Tâches planifiées Coolify + variables manquantes (`CRON_SECRET`, Sentry).
6. **Lyes** abaisse le TTL à 5 minutes, puis bascule `A` et `www` vers
   `146.59.228.186`. Vercel reste en place quelques jours en secours.

## Prudence pendant le rodage

Le site de rodage tape la **base de production**. Aucune commande de test ne
doit être menée jusqu'au paiement, et rien ne doit être écrit en base. La
vérification porte sur l'affichage, la navigation et l'administration en
lecture seule.

## Retour arrière

Tant que le DNS n'a pas basculé : aucun risque, Vercel sert toujours le site.
Après bascule : remettre les deux enregistrements sur les IP Vercel
(`76.76.21.21` pour l'apex, `216.150.16.65` pour `www`). Avec un TTL à
5 minutes, le retour est effectif en quelques minutes.
