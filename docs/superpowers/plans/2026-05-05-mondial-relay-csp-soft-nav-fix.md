# Mondial Relay CSP Soft-Nav Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fixer le widget Mondial Relay qui retourne 0 résultat / autocomplete vide au premier accès `/panier` → `/checkout` (sans hard refresh).

**Architecture:** Remplacer `<Link href="/checkout">` (soft-nav Next.js) par `<a href="/checkout">` (hard nav HTML natif) sur les 3 points d'entrée vers `/checkout`. Cela force le navigateur à recharger le document HTML, à appliquer la CSP de `/checkout` (avec `'unsafe-eval'` requis par le plugin jQuery MR), et donc à laisser le widget fonctionner. Aucun changement à `next.config.ts` ou au composant `MondialRelayWidget`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript. Pas de tests automatisés sur ces composants (pas de framework de tests E2E configuré pour ce projet) — validation manuelle en navigation privée + code review feature-dev:code-reviewer.

**Spec source:** [`docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md`](../specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md)

---

## File Structure

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `lolett-app/components/cart/CartSummary.tsx` | Modify | Bouton "Passer commande" sur `/panier` (page panier complète) |
| `lolett-app/features/cart/components/OrderSummary.tsx` | Modify | Bouton "Passer commande" dans le résumé de commande (panier mobile + checkout sidebar) |
| `lolett-app/components/layout/header-parts/CartBadge.tsx` | Modify | Bouton "Commander" dans le mini-panier de l'en-tête (popup) |

Aucun fichier créé. Aucune route, type ou hook ajouté.

---

### Task 1 : Reproduction du bug (baseline)

**Files:** Aucun fichier modifié — étape de validation préalable.

- [ ] **Step 1 : Reproduire le bug en navigation privée**

Ouvrir Chrome en navigation privée (Cmd+Shift+N). Aller sur `https://lolettshop.com`. Ajouter un produit au panier. Aller sur `/panier`. Cliquer "Passer commande". Sur `/checkout`, cocher "Point Relais Mondial Relay". Taper "paris" dans le champ Ville.

**Résultat attendu (baseline buggée)** :
- Pas d'autocomplete des villes
- Console DevTools (Cmd+Option+J) montre :
  ```
  Uncaught EvalError: Evaluating a string as JavaScript violates
  the following Content Security Policy directive because 'unsafe-eval'
  is not an allowed source of script: script-src 'self' 'unsafe-inline' [...]
  ```
- La CSP affichée dans l'erreur **ne contient PAS** `'unsafe-eval'` (preuve qu'on hérite la CSP de `/panier`)

Si ce comportement n'est PAS reproduit, **arrêter** et investiguer — la cause racine pourrait avoir changé depuis la rédaction du spec.

- [ ] **Step 2 : Vérifier les 2 CSP côté serveur**

```bash
curl -sI https://lolettshop.com/panier | grep -i 'content-security-policy' | grep -o "'unsafe-eval'" || echo "PAS de unsafe-eval sur /panier (correct)"
curl -sI https://lolettshop.com/checkout | grep -i 'content-security-policy' | grep -o "'unsafe-eval'" || echo "PAS de unsafe-eval sur /checkout (PROBLEME)"
```

**Résultat attendu** :
```
PAS de unsafe-eval sur /panier (correct)
'unsafe-eval'
```

(la 2ème commande doit afficher `'unsafe-eval'`, prouvant que la CSP serveur est correcte ; le bug est bien dans la soft-nav)

---

### Task 2 : Fix CartSummary.tsx (bouton principal /panier)

**Files:**
- Modify: `lolett-app/components/cart/CartSummary.tsx:434-442`

- [ ] **Step 1 : Lire l'état actuel du fichier autour de la ligne 434**

Vérifier que le contenu actuel correspond bien à :
```tsx
      <Link href="/checkout" style={{ textDecoration: 'none', display: 'block', marginTop: 24 }}>
        <button style={{
          width: '100%', padding: '14px 0', background: '#B89547', color: '#FDF5E6', border: 'none',
          borderRadius: 999, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13,
          fontWeight: 600, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
        }}>
          Passer commande
        </button>
      </Link>
```

Si le code a divergé (wrapping différent, props ajoutées), adapter la modification du Step 2 en conservant **toutes** les props non-`href` du `<Link>`.

- [ ] **Step 2 : Remplacer `<Link>` par `<a>` natif**

Utiliser Edit pour transformer EXACTEMENT :

```tsx
      <Link href="/checkout" style={{ textDecoration: 'none', display: 'block', marginTop: 24 }}>
        <button style={{
          width: '100%', padding: '14px 0', background: '#B89547', color: '#FDF5E6', border: 'none',
          borderRadius: 999, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13,
          fontWeight: 600, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
        }}>
          Passer commande
        </button>
      </Link>
```

en :

```tsx
      {/* <a> natif (hard nav) au lieu de <Link> Next.js (soft-nav) :
          force un rechargement complet du document /checkout pour que la
          CSP avec 'unsafe-eval' soit appliquée — sinon le widget Mondial
          Relay (qui utilise eval() pour parser sa réponse JSONP) est bloqué.
          Voir docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md */}
      <a href="/checkout" style={{ textDecoration: 'none', display: 'block', marginTop: 24 }}>
        <button style={{
          width: '100%', padding: '14px 0', background: '#B89547', color: '#FDF5E6', border: 'none',
          borderRadius: 999, fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13,
          fontWeight: 600, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
        }}>
          Passer commande
        </button>
      </a>
```

- [ ] **Step 3 : Vérifier que `Link` est encore utilisé ailleurs dans le fichier (sinon supprimer l'import)**

```bash
grep -c "<Link " lolett-app/components/cart/CartSummary.tsx
```

Si le résultat est `>= 1` → laisser l'import `import Link from 'next/link'` en place (le `<Link href="/shop">` ligne 443 en a besoin).
Si le résultat est `0` → retirer la ligne `import Link from 'next/link';` en haut du fichier.

**Attendu pour ce fichier** : `>= 1` (le lien "/shop" reste un `<Link>`, soft-nav OK pour cette page).

- [ ] **Step 4 : Lancer le typecheck**

```bash
cd lolett-app && npx tsc --noEmit 2>&1 | head -20
```

**Attendu** : aucune erreur sur `CartSummary.tsx`. Si erreur → relire le diff, vérifier qu'on n'a pas cassé la structure JSX.

- [ ] **Step 5 : Commit**

```bash
git add lolett-app/components/cart/CartSummary.tsx
git commit -m "$(cat <<'EOF'
fix(checkout): hard nav vers /checkout depuis CartSummary

Remplace <Link href="/checkout"> par <a href="/checkout"> natif pour forcer
un rechargement du document : sans ça, la CSP de /panier (sans 'unsafe-eval')
reste active après soft-nav et bloque le widget Mondial Relay.

Refs spec docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3 : Fix OrderSummary.tsx (bouton checkout sidebar / panier mobile)

**Files:**
- Modify: `lolett-app/features/cart/components/OrderSummary.tsx:116-125`

**Note préalable** : ce fichier wrappe le `<Link>` dans un `<Button asChild>` shadcn. Le pattern `asChild` clone les props du Button sur son enfant. Pour conserver le styling, on transforme le pattern en `<Button>` simple avec `onClick`, ou plus propre : on garde le Button et on remplace juste le `<Link>` interne par un `<a>` (asChild fonctionne avec n'importe quel élément qui accepte `ref` + `href`).

- [ ] **Step 1 : Lire l'état actuel du fichier autour de la ligne 116**

Vérifier que le contenu actuel correspond bien à :
```tsx
          <Button
            asChild
            size="lg"
            className="bg-lolett-gold hover:bg-lolett-gold-light mt-6 w-full rounded-full"
          >
            <Link href="/checkout">
              <span>Passer commande</span>
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>
```

- [ ] **Step 2 : Remplacer `<Link>` par `<a>` à l'intérieur du `<Button asChild>`**

Utiliser Edit pour transformer EXACTEMENT :

```tsx
          <Button
            asChild
            size="lg"
            className="bg-lolett-gold hover:bg-lolett-gold-light mt-6 w-full rounded-full"
          >
            <Link href="/checkout">
              <span>Passer commande</span>
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </Link>
          </Button>
```

en :

```tsx
          {/* <a> natif (hard nav) au lieu de <Link> Next.js (soft-nav) :
              force un rechargement du document /checkout pour appliquer la CSP
              avec 'unsafe-eval' — requis par le widget Mondial Relay (eval JSONP).
              Voir docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md */}
          <Button
            asChild
            size="lg"
            className="bg-lolett-gold hover:bg-lolett-gold-light mt-6 w-full rounded-full"
          >
            <a href="/checkout">
              <span>Passer commande</span>
              <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </a>
          </Button>
```

- [ ] **Step 3 : Vérifier les autres usages de `<Link>` dans le fichier**

```bash
grep -n "<Link " lolett-app/features/cart/components/OrderSummary.tsx
```

Le fichier a un autre `<Link href="/shop">` (ligne ~128) — laisser l'import `Link` en place.

- [ ] **Step 4 : Typecheck**

```bash
cd lolett-app && npx tsc --noEmit 2>&1 | head -20
```

**Attendu** : aucune erreur. `<Button asChild>` accepte `<a>` natif comme enfant (testé : c'est le pattern le plus courant pour les liens stylés en shadcn).

- [ ] **Step 5 : Commit**

```bash
git add lolett-app/features/cart/components/OrderSummary.tsx
git commit -m "$(cat <<'EOF'
fix(checkout): hard nav vers /checkout depuis OrderSummary

Remplace <Link href="/checkout"> par <a href="/checkout"> dans le Button
asChild shadcn. Pattern asChild reste OK avec un <a> natif (clone de props).

Refs spec docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4 : Fix CartBadge.tsx (bouton "Commander" mini-panier en-tête)

**Files:**
- Modify: `lolett-app/components/layout/header-parts/CartBadge.tsx:139-144`

- [ ] **Step 1 : Lire l'état actuel autour de la ligne 139**

Vérifier que le contenu actuel correspond bien à :
```tsx
                  <Link
                    href="/checkout"
                    className="rounded-full bg-[#1B0B94] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#130970]"
                  >
                    Commander
                  </Link>
```

- [ ] **Step 2 : Remplacer `<Link>` par `<a>` natif**

Utiliser Edit pour transformer EXACTEMENT :

```tsx
                  <Link
                    href="/checkout"
                    className="rounded-full bg-[#1B0B94] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#130970]"
                  >
                    Commander
                  </Link>
```

en :

```tsx
                  {/* <a> natif (hard nav) au lieu de <Link> Next.js (soft-nav) :
                      force un rechargement du document /checkout pour la CSP avec
                      'unsafe-eval' (widget Mondial Relay). Voir
                      docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md */}
                  <a
                    href="/checkout"
                    className="rounded-full bg-[#1B0B94] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#130970]"
                  >
                    Commander
                  </a>
```

- [ ] **Step 3 : Vérifier autres usages de `<Link>`**

```bash
grep -n "<Link " lolett-app/components/layout/header-parts/CartBadge.tsx
```

Le fichier a un autre `<Link href="/panier">` (ligne 133) — laisser l'import `Link` en place.

- [ ] **Step 4 : Typecheck global**

```bash
cd lolett-app && npx tsc --noEmit 2>&1 | tail -5
```

**Attendu** : aucune erreur. Si tsc rapporte des erreurs sur d'autres fichiers du projet (non liées à nos 3 modifs), les noter mais ne pas chercher à les corriger ici.

- [ ] **Step 5 : Commit**

```bash
git add lolett-app/components/layout/header-parts/CartBadge.tsx
git commit -m "$(cat <<'EOF'
fix(checkout): hard nav vers /checkout depuis CartBadge mini-panier

3ᵉ et dernier point d'entrée vers /checkout converti en <a> natif.

Refs spec docs/superpowers/specs/2026-05-05-mondial-relay-csp-soft-nav-fix-design.md

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5 : Vérification finale (audit des Link vers /checkout)

**Files:** Aucun fichier modifié — étape de validation.

- [ ] **Step 1 : S'assurer qu'il ne reste AUCUN `<Link href="/checkout">` dans le code app**

```bash
grep -rn 'Link[[:space:]].*href=["'\'']*/checkout' lolett-app --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".next" | grep -v __tests__
```

**Attendu** : aucune sortie. Si une ligne sort, soit on a raté un point d'entrée, soit c'est un faux positif (commentaire, string littérale). Inspecter et :
- Si c'est un vrai `<Link>` actif : retourner à la Task correspondante et le convertir.
- Si c'est un faux positif (commentaire, etc.) : noter et passer.

- [ ] **Step 2 : Confirmer que les nouveaux `<a href="/checkout">` sont bien là**

```bash
grep -rn 'a[[:space:]]*href=["'\'']*/checkout' lolett-app --include="*.tsx" | grep -v node_modules | grep -v ".next"
```

**Attendu** : 3 lignes correspondant aux 3 fichiers modifiés (CartSummary, OrderSummary, CartBadge).

- [ ] **Step 3 : Build de validation**

```bash
cd lolett-app && npx next build 2>&1 | tail -30
```

**Attendu** : build réussit sans erreur. Warnings éventuels (Sentry, ESLint) acceptables s'ils existaient déjà avant.

Si le build échoue, relire le diff des 3 fichiers et chercher l'erreur dans la sortie. Ne **pas** committer un build cassé.

---

### Task 6 : Validation manuelle prod-like (dev server)

**Files:** Aucun.

- [ ] **Step 1 : Lancer le dev server**

```bash
cd lolett-app && npm run dev
```

Attendre le message `Ready in ...ms`.

- [ ] **Step 2 : Reproduire le parcours en navigation privée locale**

Ouvrir un onglet de navigation privée Chrome sur `http://localhost:3000`. **Ouvrir DevTools avant de naviguer** (F12 ou Cmd+Option+I, onglet Console).

Parcours :
1. Page d'accueil → Shop → ajouter un produit
2. Cliquer le panier → aller sur `/panier`
3. Cliquer "Passer commande" → on arrive sur `/checkout`
4. **Observer** : flash visuel léger ? (attendu, ~200-400ms — c'est le hard reload qui fait son travail)
5. Sur `/checkout`, choisir Point Relais Mondial Relay
6. Taper "paris" dans le champ Ville
7. **Observer** :
   - ✅ Liste autocomplete s'affiche immédiatement (Paris 1er, 2ème, etc.)
   - ✅ Console : aucune erreur `EvalError: 'unsafe-eval'`
   - ✅ Console : peut afficher `MondialRelay widget jQuery 2.2.4` (normal, log du widget)
8. Cliquer un arrondissement → la carte Leaflet doit charger avec les points relais

**Si l'un de ces points échoue** :
- L'autocomplete ne marche pas → vérifier que la console montre encore l'erreur `unsafe-eval` (si oui, le hard reload n'a pas eu lieu — vérifier que l'éditeur a bien sauvegardé)
- L'autocomplete marche mais la carte casse → autre bug, hors scope de ce plan
- Pas de flash visuel du tout → le hard reload n'est peut-être pas effectif (mais si autocomplete marche, c'est OK : moderne Chrome optimise parfois)

- [ ] **Step 3 : Test régression — vérifier les autres `<Link>` du site marchent toujours**

Toujours en privée locale :
- Cliquer divers liens du header (Accueil, Nouveautés, Shop, Mon Histoire, Contact) → soft-nav, pas de flash, instantané
- Sur `/panier`, cliquer "Continuer mes achats" → navigation vers `/shop` en soft-nav (Link préservé)
- Mini-panier en-tête → cliquer "Voir mon panier" → soft-nav vers `/panier` (Link préservé)

**Attendu** : tous les `<Link>` non-checkout fonctionnent normalement. Aucune régression.

- [ ] **Step 4 : Test régression — état du panier préservé après hard reload**

Toujours en privée locale :
1. Aller sur `/panier`, ajouter un code promo (ex. TEST2 si valide), confirmer le total mis à jour
2. Cliquer "Passer commande"
3. Sur `/checkout`, vérifier que le code promo est toujours appliqué dans le résumé de commande à droite

**Attendu** : le store Zustand `useCartStore` persiste dans `localStorage`, donc l'état survit au hard reload. Si le panier est vide ou le code promo perdu après navigation → régression critique, à investiguer (très improbable car localStorage est exactement fait pour ça).

- [ ] **Step 5 : Tuer le dev server**

Cmd+C dans le terminal qui fait tourner `npm run dev`.

---

### Task 7 : Code review obligatoire pré-push

**Files:** Aucun. C'est l'étape feedback de Lyes (cf. memory `feedback_code_review_before_push.md`).

- [ ] **Step 1 : Lancer un agent code-reviewer sur les 3 commits**

Dispatcher l'agent `feature-dev:code-reviewer` avec ce briefing :

> Review les 3 derniers commits sur `main` qui remplacent `<Link href="/checkout">` par `<a href="/checkout">` dans `lolett-app/components/cart/CartSummary.tsx`, `lolett-app/features/cart/components/OrderSummary.tsx`, et `lolett-app/components/layout/header-parts/CartBadge.tsx`.
>
> **Contexte** : fix CSP urgent pré-launch e-commerce. Le widget jQuery Mondial Relay sur `/checkout` est bloqué parce qu'il fait `eval()` et la CSP active (héritée de `/panier` lors d'une soft-nav Next.js) ne contient pas `'unsafe-eval'`. Solution : forcer un hard reload pour appliquer la CSP de `/checkout`.
>
> Cherche surtout :
> 1. Régression d'accessibilité (a11y) : un `<a>` natif a-t-il les mêmes attributs accessibles que `<Link>` Next.js dans ce contexte ?
> 2. Préservation du state : risque de perdre données panier ou session pendant le hard reload ?
> 3. Pattern `<Button asChild>` shadcn dans OrderSummary : est-ce que `<a>` à la place de `<Link>` casse le forwarding de ref ?
> 4. Tout autre `<Link href="/checkout">` que j'aurais raté (search dans le repo)
>
> Rapporte uniquement les issues critical/high/medium avec confidence élevée. 600 mots max.

- [ ] **Step 2 : Triage des findings**

Pour chaque issue rapportée par l'agent :
- Vérifier la véracité par lecture du code et grep — les agents font des faux positifs
- Marquer **VRAI** / **FAUX POSITIF** / **DIFFÉRÉ** (avec raison) dans un tableau
- Présenter le tableau à Lyes pour validation

- [ ] **Step 3 : Fixer les issues VRAI**

Si issues VRAI critical/high → fixer en priorité, commit séparé `fix(scope): code review hardening (N issues)`, retour Step 1 pour re-review.
Si seulement medium/low → fixer si rapide, sinon DIFFÉRÉ post-launch (avec ticket dans `docs/superpowers/specs/` ou note dans le ux audit P2).

- [ ] **Step 4 : Typecheck final**

```bash
cd lolett-app && npx tsc --noEmit
```

**Attendu** : zéro erreur introduite par les fixes.

---

### Task 8 : Push + déploiement Vercel

**Files:** Aucun.

- [ ] **Step 1 : Push sur main**

```bash
git status
git log --oneline -10
git push origin main
```

Vercel auto-deploy se déclenche.

- [ ] **Step 2 : Suivre le deploy Vercel**

```bash
# Récupérer le dernier deploy
vercel ls --scope=lolaaaa 2>/dev/null | head -5
# OU consulter dashboard Vercel directement
```

Attendre le statut **Ready** (typiquement 1-2 min). Si **Error**, lire les logs de build.

- [ ] **Step 3 : Test prod final**

Reproduire en navigation privée sur `https://lolettshop.com` le parcours complet de la Task 6, Step 2.

**Attendu** :
- Autocomplete ville Mondial Relay marche dès le premier accès
- Aucune erreur CSP en console
- Carte Leaflet charge

- [ ] **Step 4 : Si bug persiste en prod (ne devrait pas arriver, mais protocole) :**

Vérifier en priorité :
1. Le deploy est bien le dernier (commit hash du push correspond au commit hash dans Vercel)
2. CDN cache busted : forcer `Cmd+Shift+R` une fois pour invalider le cache local
3. CSP en prod toujours correcte : `curl -sI https://lolettshop.com/checkout | grep -i csp`
4. Si tout ça est OK et le bug est encore là : revert immédiat (`git revert HEAD~3..HEAD && git push`) et reprendre l'investigation. **Ne pas laisser un launch cassé en prod.**

- [ ] **Step 5 : Mise à jour SESSION.md**

Ajouter une ligne dans `.planning/SESSION.md` section "Completed CETTE session" :
> ✅ **Bug Mondial Relay autocomplete (résolu, vraie cause cette fois)** — CSP de /panier héritée par soft-nav Next.js sur /checkout → eval() bloqué → widget MR cassé. Fix : 3 `<Link href="/checkout">` → `<a href="/checkout">` dans CartSummary/OrderSummary/CartBadge pour forcer un hard reload.

---

## Self-Review

**Couverture du spec** :
- ✅ Cause racine documentée → Task 1 (reproduction) + commentaires de code
- ✅ 3 fichiers modifiés → Tasks 2, 3, 4
- ✅ Pas de modif `next.config.ts` ni `MondialRelayWidget` → respecté (aucune Task ne les touche)
- ✅ Test manuel reproductible → Task 6
- ✅ Test régression Link non-checkout → Task 6 Step 3
- ✅ State panier préservé → Task 6 Step 4
- ✅ Code review obligatoire → Task 7 (cf. memory feedback_code_review_before_push)
- ✅ Vérification CSP en prod → Task 8 Step 3 + Task 1 Step 2 (baseline)
- ✅ Erreurs annexes (404 image, React #418) → mentionnées dans le spec, hors scope ici (à traiter séparément, noté pour P2)

**Placeholder scan** : aucun "TBD/TODO/à compléter".

**Cohérence types/signatures** : aucun nouveau type, fonction ou hook introduit. Les `<a>` natifs prennent les mêmes props (`href`, `className`, `style`) que les `<Link>` qu'ils remplacent.

**Sanity check du fix** :
- Le `<a href>` natif déclenche bien un hard reload : confirmé par la spec HTML, c'est le comportement par défaut.
- `<Button asChild>` shadcn fonctionne avec `<a>` : c'est documenté et c'est même le cas d'usage le plus commun (boutons-liens).
- Le state Zustand `useCartStore` persiste dans `localStorage` (ouvrir le code du store pour confirmer si doute) → survit au hard reload.

Plan prêt pour exécution.
