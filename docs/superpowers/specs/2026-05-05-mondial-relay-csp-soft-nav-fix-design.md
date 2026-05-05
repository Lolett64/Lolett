# Fix : Mondial Relay widget — CSP héritée lors d'une soft-nav vers /checkout

**Date** : 2026-05-05
**Status** : Spec validée par Lyes, prêt pour implémentation
**Auteur** : Lyes + Claude Opus 4.7
**Branch cible** : `main` (fix urgent pré-launch)

---

## Contexte

Le widget Mondial Relay sur `/checkout` ne fonctionne pas au premier accès depuis le panier (autocomplete ville vide, recherche 0 résultat). Un hard refresh (F5) résout le problème.

Un commit précédent (`874f1d2`) avait appliqué 4 fixes JavaScript en cascade (race condition, TOCTOU, memory leak, IDs uniques) en pensant que c'était un problème de timing. Le bug persiste après ces fixes parce que la cause racine n'est pas du JavaScript : c'est un problème de **Content Security Policy** (CSP).

## Cause racine (confirmée par observation prod)

### Configuration CSP actuelle

[`lolett-app/next.config.ts`](../../../lolett-app/next.config.ts) définit deux jeux de headers de sécurité :

- **CSP par défaut** (toutes les pages sauf `/checkout`) : `script-src` **sans** `'unsafe-eval'`
- **CSP `/checkout`** : `script-src` **avec** `'unsafe-eval'` (requis par le plugin jQuery Mondial Relay qui parse sa réponse JSONP via `eval()`)

Vérification via `curl -I` :
```
GET /panier   → CSP sans 'unsafe-eval' ❌
GET /checkout → CSP avec 'unsafe-eval' ✅
```

### Mécanique du bug

1. Utilisateur arrive sur `lolettshop.com` (ou `/panier`) → navigateur reçoit le document HTML avec **CSP stricte** (sans `'unsafe-eval'`).
2. Utilisateur clique "Passer commande" → composant `<Link href="/checkout">` de Next.js déclenche une **soft-nav** (App Router).
3. Next.js fetche le payload RSC (`/checkout?_rsc=xxx`), met à jour le DOM React **sans recharger le document HTML**.
4. La CSP active dans le navigateur **reste celle du document initial** (`/panier`). La CSP est posée à la création du `Document`, pas remplaçable via fetch RSC.
5. Widget MR s'instancie et tente `eval()` pour parser la réponse JSONP → bloqué par la CSP active → 0 résultat, autocomplete vide.

### Preuve reproductible (navigation privée)

Console DevTools sur `/checkout` après soft-nav depuis `/panier` :
```
Uncaught EvalError: Evaluating a string as JavaScript violates the following
Content Security Policy directive because 'unsafe-eval' is not an allowed source
of script: script-src 'self' 'unsafe-inline' https://ajax.googleapis.com
https://unpkg.com https://widget.mondialrelay.com https://www.googletagmanager.com
https://js.stripe.com
```

La CSP affichée dans l'erreur est la CSP **stricte** (sans `'unsafe-eval'`) — héritée de la page précédente. Hard refresh résout parce qu'il recharge le document `/checkout` qui applique la CSP avec `'unsafe-eval'`.

## Solution retenue

**Forcer un hard reload sur `/checkout`** depuis tous les points d'entrée — remplacer `<Link href="/checkout">` par `<a href="/checkout">` natif HTML.

### Pourquoi cette approche

- ✅ Garde la CSP stricte partout ailleurs (sécurité préservée)
- ✅ Fix ciblé sur 3 fichiers (~10 lignes)
- ✅ Aucun risque de régression sur le reste du site
- ✅ Réversible en 30 secondes
- ✅ Pas de dépendance à un refactor MR (peut attendre v1.1)

### Trade-offs

- ⚠️ Léger flash visuel (~200-400 ms) au passage panier → checkout. Acceptable sur une page de transaction (les utilisateurs s'attendent à un changement de contexte).
- ⚠️ Perte du prefetch Next.js sur cette transition. Impact négligeable : `/checkout` est rapide à charger.

### Alternatives écartées

| Option | Pourquoi écartée |
|--------|------------------|
| Étendre `'unsafe-eval'` à tout le site | Affaiblit la sécurité globale ; choix explicite documenté dans `next.config.ts:14-18` de NE PAS faire ça |
| Réécrire le widget MR en React + API serveur | 1-2 jours de travail, pas le moment pré-launch ; reste planifié pour v1.1 (cf. commentaire `next.config.ts:18`) |
| Utiliser `router.refresh()` ou `router.push()` avec `scroll: false` | Ne force pas un hard reload du document, donc ne change pas la CSP active |
| Configurer un meta CSP dans le HTML de `/checkout` | Les meta CSP ne peuvent pas **étendre** la CSP serveur, seulement la restreindre. Sans effet ici. |

## Architecture de l'implémentation

### Fichiers concernés (3 points d'entrée vers `/checkout`)

| # | Fichier | Ligne | Composant |
|---|---------|-------|-----------|
| 1 | `lolett-app/components/cart/CartSummary.tsx` | ~434 | Bouton "Passer commande" depuis la page `/panier` |
| 2 | `lolett-app/features/cart/components/OrderSummary.tsx` | ~121 | Bouton "Passer commande" dans le résumé de commande (panier mobile/responsive) |
| 3 | `lolett-app/components/layout/header-parts/CartBadge.tsx` | ~140 | Bouton "Voir le panier" / "Passer commande" depuis le mini-panier de l'en-tête |

### Pattern de modification

Pour chacun des 3 fichiers, transformation identique :

```tsx
// AVANT — soft-nav Next.js, hérite la CSP
import Link from 'next/link';
// ...
<Link href="/checkout" style={{ ... }}>
  Passer commande
</Link>

// APRÈS — hard nav HTML natif, recharge le document avec la bonne CSP
// (pas d'import Link nécessaire si plus utilisé dans le fichier)
<a href="/checkout" style={{ ... }}>
  Passer commande
</a>
```

### Impératifs lors de l'édition

1. **Préserver tous les `style`, `className`, `onClick`, `aria-*`** présents sur le `<Link>` original.
2. **Ne pas supprimer l'import `Link`** s'il est encore utilisé ailleurs dans le même fichier (vérifier autres usages avant suppression).
3. **Ne pas toucher** aux autres `<Link>` du fichier — uniquement ceux qui pointent vers `/checkout`.
4. **Pas de modification de la CSP** dans `next.config.ts` — la config actuelle est correcte.
5. **Pas de modification du composant `MondialRelayWidget`** — son code est fonctionnel, le bug n'est pas dedans.

## Tests / Validation

### Test manuel reproductible (avant fix)

1. Navigation privée
2. `lolettshop.com` → ajouter un produit → `/panier` → clic "Passer commande"
3. Sélectionner Mondial Relay, taper "paris" dans Ville
4. **Résultat attendu actuel** : pas d'autocomplete, console montre `EvalError: 'unsafe-eval' is not an allowed source`

### Test manuel post-fix

1. Navigation privée
2. Reproduire le parcours ci-dessus
3. **Résultat attendu** :
   - Aucune erreur CSP dans la console
   - Autocomplete des villes fonctionne dès la première frappe
   - Recherche par CP retourne des points relais
   - Pas besoin de refresh

### Test de régression à vérifier

- ✅ Cliquer "Passer commande" depuis `/panier` → arrive bien sur `/checkout`
- ✅ Le panier (state Zustand) est bien préservé après le hard reload (le store `useCartStore` persiste dans `localStorage`, donc OK)
- ✅ L'utilisateur connecté reste connecté (cookie de session, pas de problème)
- ✅ Le mini-panier dans l'en-tête fonctionne toujours
- ✅ Aucun autre `<Link>` du site n'est cassé (les changements sont localisés)

### Vérification CSP en prod après deploy

```bash
curl -sI https://lolettshop.com/checkout | grep -i content-security-policy
# Doit contenir 'unsafe-eval'

curl -sI https://lolettshop.com/panier | grep -i content-security-policy
# Ne doit PAS contenir 'unsafe-eval'
```

## Suivi post-fix

### Erreurs annexes observées dans la console (à traiter séparément)

Pendant le debug, deux erreurs annexes ont été repérées (non bloquantes pour le widget MR) :

1. **`Brand%20story%20background.jpeg` 404** — image manquante dans le storytelling. À investiguer.
2. **`Minified React error #418`** — hydration mismatch (HTML serveur ≠ HTML client). Probablement lié au composant `OurStory` ou similaire. À investiguer.

Ces deux issues seront documentées dans le suivi post-launch (UX audit P2) — elles ne bloquent pas le launch.

### Refactor MR v1.1 (post-launch)

Le widget jQuery Mondial Relay reste fragile (dépendance `eval`, plugin obsolète, pas de typage). À remplacer par un composant React + route API serveur appelant directement l'API officielle Mondial Relay. Permettra de supprimer `'unsafe-eval'` partout et de durcir la CSP `/checkout`.

## Critères de succès

- [ ] Le widget MR fonctionne dès le premier accès `/panier` → `/checkout` (sans refresh)
- [ ] Aucune erreur `EvalError: 'unsafe-eval'` dans la console
- [ ] Aucune régression sur les flows existants (panier, header, mobile)
- [ ] Code review feature-dev:code-reviewer passé sans issue VRAI critical/high
- [ ] Déployé en prod et testé en navigation privée
