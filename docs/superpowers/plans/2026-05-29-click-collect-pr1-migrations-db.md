# Click & Collect — PR1 : Migrations base de données — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poser les fondations base de données du Click & Collect (table `pickup_points`, extensions `orders`, RPC de comptage, template email) via 4 migrations SQL appliquées manuellement dans le dashboard Supabase.

**Architecture:** 4 fichiers SQL versionnés dans `lolett-app/supabase/migrations/` (source de vérité Git), appliqués un par un en collant le SQL dans le SQL editor du dashboard distant. Aucun code applicatif n'est touché : les colonnes/contraintes/RPC restent inertes tant que PR2+ ne les consomment pas.

**Idempotence par tâche** (chaque migration est rejouable sans casse, avec le mécanisme adapté à son contenu) :
- **Task 1** (`pickup_points`) : `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS` + `DROP TRIGGER IF EXISTS` avant `CREATE TRIGGER` + `DROP POLICY IF EXISTS` avant chaque `CREATE POLICY`. `CREATE TRIGGER` et `CREATE POLICY` ne supportant pas `IF NOT EXISTS`, le `DROP ... IF EXISTS` préalable (convention du repo, cf. `20260428000002_rls_email_settings.sql`, `20260423170000_backfill_variants_and_sync_trigger.sql`) est ce qui rend la tâche réellement rejouable.
- **Task 2** (extensions `orders`) : `DROP CONSTRAINT IF EXISTS` avant `ADD CONSTRAINT` + `ADD COLUMN IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`.
- **Task 3** (RPC) : `CREATE OR REPLACE FUNCTION` + `REVOKE`/`GRANT` (idempotents par nature).
- **Task 4** (seed email) : `INSERT ... ON CONFLICT (template_key) DO NOTHING`.

**Tech Stack:** Supabase Postgres, migrations SQL appliquées via SQL editor du dashboard (projet qczdwrudgmozyxkdidmr)

---

## Notes de cadrage (corrections vs spec §4)

Le spec §4 contient des erreurs corrigées ici (la réalité du codebase fait foi) :

1. **`moddatetime` n'existe pas.** Le projet utilise une fonction maison `update_updated_at()` (définie dans `20250101000001_initial_schema.sql` L108, signature sans argument). Le trigger de `pickup_points` utilise `EXECUTE FUNCTION update_updated_at()` (sans argument), pas `moddatetime(updated_at)`.
2. **Le CHECK `orders_status_check` autorise déjà 11 statuts** après `20260430120000_refunds_disputes_support.sql` (`pending, paid, confirmed, shipped, delivered, cancelled, refunded, partially_refunded, disputed, expired, payment_review`). PR1 ajoute uniquement `ready_for_pickup` + `picked_up` → 13 statuts.
3. **La colonne `orders.pickup_point` (JSONB) existe déjà** (`20260428000001_orders_shipping_method.sql`). On ne la recrée pas ; on ajoute seulement `ready_for_pickup_at`, `picked_up_at`, `pickup_code` + son index unique partiel.
4. **Index `idx_orders_pickup_point_id` : btree d'expression, PAS GIN.** Le spec §4.2 (point 5) propose un index GIN sur `(pickup_point -> 'id')`. Or la RPC compare `pickup_point->>'id' = point_id` (égalité **texte**). Un GIN sur l'opérateur `->` (jsonb) n'accélère pas une égalité `->>` (text). On utilise donc `CREATE INDEX ... ON orders ((pickup_point->>'id'))` (btree d'expression), seul index réellement utile au planner pour cette égalité.
5. **Seed email en `{{var}}` (double accolade), pas `{var}`.** Les seeds existants (`20250220200005_seed_email_settings.sql`) utilisent la convention `{{orderNumber}}`, `{{firstName}}`. Le spec §4.4 écrit `{orderNumber}` / `{pickupCode}` (simple accolade) — on harmonise vers `{{...}}` pour s'aligner sur le **moteur moderne `interpolate()`** (cf. `lib/email/order-refunded.ts`, `order-cancelled.ts`), seul moteur qui gère correctement `{{var}}`.
   > **Attention PR4/5 :** le sender `order_ready_for_pickup` à venir DOIT utiliser le helper `interpolate()` (pattern `order-refunded` / `order-cancelled`) et NE PAS copier le pattern `subject_template.replace('{orderNumber}', ...)` des anciens senders (`order-confirmation.ts` L65, `order-shipped.ts` L59, `order-delivered.ts` L35). Ces anciens senders attendent une accolade simple `{var}` : un subject stocké en `{{orderNumber}}` y produirait `{LOL-123}` (accolades résiduelles) et `{{pickupCode}}` ne serait JAMAIS substitué. Le moteur `interpolate()` est requis pour ce template.
   - `from_email` = `bonjour@lolettshop.com` (valeur du spec §4.4, pas le défaut historique `onboarding@resend.dev`).
   - `signoff` = `Avec amour, LOLETT ♥` avec le glyphe **U+2665 (BLACK HEART SUIT, ♥)**, identique à tous les seeds existants (`20250220200005`, `20260303000001`) et au DEFAULT de la colonne `signoff` (`20250220200002` L12). Le spec §4.4 écrit `♡` (U+2661, WHITE HEART SUIT) — on corrige vers `♥` pour rester réellement cohérent avec l'existant.
6. **Convention RLS `service_role` : pattern maison `auth.role() = 'service_role'`.** Tout le repo (`20250101000001` L157, `20260506000003`, `20260429000002`, etc.) exprime l'accès service_role via `FOR ALL USING (auth.role() = 'service_role')`, pas via `TO service_role`. On aligne la policy de `pickup_points` sur cette convention maison pour ne pas dérouter un futur audit RLS. (service_role bypasse la RLS de toute façon ; les deux formes fonctionnent, mais on suit la convention du repo.)
7. **4 migrations, pas 3.** Le spec §11 mentionne « 3 migrations ». On isole la RPC `count_orders_with_pickup_point` dans son propre fichier (`...000003`) pour la clarté et le diff atomique, ce qui décale le seed email à `...000004` (le spec le nommait `...000003`). **Décalage volontaire à confirmer avec Lyes** (voir Vérification finale) : le spec §11 annonçait 3 fichiers, on en produit 4. La couverture du contenu §4 reste complète ; il s'agit d'un écart de comptage/nommage, pas d'un manque.

**Application :** manuelle via le SQL editor du dashboard Supabase (projet `qczdwrudgmozyxkdidmr`). Pas de `supabase db push`, pas de script npm. Les fichiers `.sql` vivent dans `lolett-app/supabase/migrations/` uniquement comme source de vérité Git.

**Ordre d'application (chronologique des timestamps) :**
1. `20260530000001_pickup_points.sql`
2. `20260530000002_orders_click_collect.sql`
3. `20260530000003_count_orders_with_pickup_point.sql`
4. `20260530000004_seed_email_settings_ready_for_pickup.sql`

Aucune dépendance dure entre elles (la RPC lit `orders`, table préexistante), mais on respecte l'ordre des timestamps.

---

### Task 1: Migration `pickup_points` (table + RLS + trigger)

**Files:**
- Create: `lolett-app/supabase/migrations/20260530000001_pickup_points.sql`

- [ ] **Step 1 — Écrire le fichier de migration.** Créer `lolett-app/supabase/migrations/20260530000001_pickup_points.sql` avec exactement ce contenu :

```sql
-- =============================================================
-- Click & Collect — PR1 (1/4) : table pickup_points
-- =============================================================
-- Points de retrait Click & Collect, éditables par Lola via
-- /admin/pickup-points (service role). Lecture publique limitée
-- aux points actifs (is_active = true). Soft-delete via is_active
-- pour préserver les snapshots historiques dans orders.pickup_point.
-- À exécuter dans le SQL Editor du dashboard Supabase.
-- Migration idempotente : CREATE TABLE/INDEX IF NOT EXISTS, et
-- DROP TRIGGER/POLICY IF EXISTS avant chaque CREATE (ces deux-là
-- ne supportent pas IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS pickup_points (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  address       text NOT NULL,
  postal_code   text NOT NULL,
  city          text NOT NULL,
  country       text NOT NULL DEFAULT 'FR',
  hours         text,
  instructions  text,
  is_active     boolean NOT NULL DEFAULT false,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pickup_points_active_sort
  ON pickup_points (is_active, sort_order);

-- Trigger updated_at : fonction maison update_updated_at() (PAS moddatetime).
-- Définie dans 20250101000001_initial_schema.sql (signature sans argument).
-- DROP préalable car CREATE TRIGGER ne supporte pas IF NOT EXISTS → rejouabilité.
DROP TRIGGER IF EXISTS pickup_points_set_updated_at ON pickup_points;
CREATE TRIGGER pickup_points_set_updated_at
  BEFORE UPDATE ON pickup_points
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;

-- DROP préalable car CREATE POLICY ne supporte pas IF NOT EXISTS → rejouabilité
-- (convention du repo, cf. 20260428000002_rls_email_settings.sql).
DROP POLICY IF EXISTS "pickup_points_public_select_active" ON pickup_points;
CREATE POLICY "pickup_points_public_select_active"
  ON pickup_points FOR SELECT
  USING (is_active = true);

-- service_role : pattern maison auth.role() = 'service_role' (cf. 20250101000001 L157).
DROP POLICY IF EXISTS "pickup_points_service_role_all" ON pickup_points;
CREATE POLICY "pickup_points_service_role_all"
  ON pickup_points FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE pickup_points IS
  'Points de retrait Click & Collect. CRUD via /admin/pickup-points (service role). Lecture publique limitée à is_active=true.';
COMMENT ON COLUMN pickup_points.is_active IS
  'Soft-delete : false = masqué côté public, snapshots historiques dans orders.pickup_point préservés.';
COMMENT ON COLUMN pickup_points.sort_order IS
  'Ordre d''affichage croissant dans le sélecteur checkout. Init par pas de 10 à la création (max+10).';
```

- [ ] **Step 2 — Appliquer via dashboard.** Ouvrir le SQL editor du projet `qczdwrudgmozyxkdidmr` sur le dashboard Supabase (https://supabase.com/dashboard → projet qczdwrudgmozyxkdidmr → SQL Editor → New query). Coller l'intégralité du contenu de `20260530000001_pickup_points.sql`. Cliquer **Run**. Vérifier l'absence d'erreur (message « Success. No rows returned »).

- [ ] **Step 3 — Vérifier.** Exécuter dans le SQL editor cette requête de contrôle :

```sql
-- a) La table existe avec ses colonnes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'pickup_points'
ORDER BY ordinal_position;

-- b) Le trigger est branché sur update_updated_at
SELECT tgname, proname
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgrelid = 'pickup_points'::regclass AND NOT t.tgisinternal;

-- c) RLS activée + 2 policies présentes
SELECT relrowsecurity FROM pg_class WHERE relname = 'pickup_points';
SELECT polname FROM pg_policy WHERE polrelid = 'pickup_points'::regclass ORDER BY polname;

-- d) Insert + select de contrôle (rollback)
BEGIN;
INSERT INTO pickup_points (name, address, postal_code, city)
  VALUES ('Test Boutique', '1 rue du Test', '75001', 'Paris');
SELECT id, name, country, is_active, sort_order, created_at, updated_at
  FROM pickup_points WHERE name = 'Test Boutique';
ROLLBACK;
```

  Résultat attendu :
  - (a) 12 colonnes : `id` (uuid, NO, `gen_random_uuid()`), `name`/`address`/`postal_code`/`city` (text, NO), `country` (text, NO, `'FR'::text`), `hours`/`instructions` (text, YES), `is_active` (boolean, NO, `false`), `sort_order` (integer, NO, `0`), `created_at`/`updated_at` (timestamptz, NO, `now()`).
  - (b) une ligne : `tgname = pickup_points_set_updated_at`, `proname = update_updated_at`.
  - (c) `relrowsecurity = true` ; deux policies : `pickup_points_public_select_active`, `pickup_points_service_role_all`.
  - (d) une ligne insérée avec `country = 'FR'`, `is_active = false`, `sort_order = 0`, `created_at`/`updated_at` renseignés ; le `ROLLBACK` annule l'insert (la table reste vide).

- [ ] **Step 4 — Commit.**

```
git add lolett-app/supabase/migrations/20260530000001_pickup_points.sql
git commit -m "feat(db): table pickup_points pour Click & Collect"
```

---

### Task 2: Migration extensions `orders` (statuts, colonnes C&C, contraintes, index)

**Files:**
- Create: `lolett-app/supabase/migrations/20260530000002_orders_click_collect.sql`

- [ ] **Step 1 — Écrire le fichier de migration.** Créer `lolett-app/supabase/migrations/20260530000002_orders_click_collect.sql` avec exactement ce contenu :

```sql
-- =============================================================
-- Click & Collect — PR1 (2/4) : extensions orders
-- =============================================================
-- 1. Étend orders_status_check : ajoute ready_for_pickup + picked_up (→ 13 statuts)
-- 2. Timestamps workflow C&C : ready_for_pickup_at, picked_up_at
-- 3. Code de retrait pickup_code + index UNIQUE PARTIAL (retry atomique)
-- 4. CHECK constraints défensives sur shipping_method / shipping_carrier
-- 5. Index btree d'expression sur (pickup_point->>'id') pour la RPC de comptage
-- NB : orders.pickup_point (JSONB) existe déjà (20260428000001), pas recréée.
-- À exécuter dans le SQL Editor du dashboard Supabase.

-- ── 1. Étendre l'enum status (DROP + ADD, pattern 20260430120000) ──────────
-- État courant : 11 statuts. On ajoute ready_for_pickup + picked_up → 13.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'pending', 'paid', 'confirmed',
    'shipped', 'delivered',
    'ready_for_pickup', 'picked_up',
    'cancelled', 'refunded', 'partially_refunded', 'disputed',
    'expired', 'payment_review'
  )
);

-- ── 2. Timestamps workflow C&C (symétrie shipped_at / delivered_at) ────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS ready_for_pickup_at timestamptz,
  ADD COLUMN IF NOT EXISTS picked_up_at        timestamptz;

-- ── 3. Code de retrait + index UNIQUE PARTIAL ─────────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_code text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_pickup_code_unique
  ON orders (pickup_code) WHERE pickup_code IS NOT NULL;

-- ── 4. CHECK constraints défensives shipping_method / shipping_carrier ─────
-- PRÉ-VOL OBLIGATOIRE (voir Step 2) : ADD CONSTRAINT CHECK valide IMMÉDIATEMENT
-- toutes les lignes existantes (pas de NOT VALID). Confirmer avant d'appliquer
-- que shipping_method ⊆ {home, mondial_relay, NULL} et shipping_carrier ⊆
-- {colissimo, mondial_relay, NULL}, sinon le ADD échoue sur une donnée orpheline.
-- DROP IF EXISTS avant ADD pour idempotence.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_shipping_method_check
  CHECK (shipping_method IS NULL OR shipping_method IN ('home', 'mondial_relay', 'click_collect'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_carrier_check;
ALTER TABLE orders ADD CONSTRAINT orders_shipping_carrier_check
  CHECK (shipping_carrier IS NULL OR shipping_carrier IN ('colissimo', 'mondial_relay', 'click_collect'));

-- ── 5. Index btree d'expression sur (pickup_point->>'id') ─────────────────
-- Correction vs spec §4.2 (point 5) : la RPC compare pickup_point->>'id' = point_id
-- (égalité TEXTE). Un index GIN sur (pickup_point -> 'id') n'accélère PAS cette
-- égalité ->> ; on utilise un btree d'expression, seul index utile au planner.
CREATE INDEX IF NOT EXISTS idx_orders_pickup_point_id
  ON orders ((pickup_point->>'id'));

-- ── 6. Commentaires ───────────────────────────────────────────────────────
COMMENT ON COLUMN orders.shipping_method IS 'home | mondial_relay | click_collect';
COMMENT ON COLUMN orders.shipping_carrier IS 'colissimo | mondial_relay | click_collect';
COMMENT ON COLUMN orders.pickup_point IS
  'Snapshot JSONB du point sélectionné. Forme : { id, name, address, postalCode, city, country, hours, instructions, provider }. provider = "mondial_relay" | "click_collect".';
COMMENT ON COLUMN orders.ready_for_pickup_at IS 'Auto-posé par PATCH admin sur transition ready_for_pickup.';
COMMENT ON COLUMN orders.picked_up_at IS 'Auto-posé par PATCH admin sur transition picked_up.';
COMMENT ON COLUMN orders.pickup_code IS
  'Code court aléatoire LOL-XXXXX (5 chars, alphabet 32 chars excluant 0/O/1/I). Généré atomiquement à la transition ready_for_pickup.';
```

- [ ] **Step 2 — Pré-vol données prod (OBLIGATOIRE avant d'appliquer la migration).** Les deux `ADD CONSTRAINT CHECK` sur `shipping_method` / `shipping_carrier` valident **immédiatement** toutes les lignes existantes (pas de `NOT VALID`). Si une seule commande historique porte une valeur hors liste, la migration échoue. Exécuter d'abord, dans le SQL editor du projet `qczdwrudgmozyxkdidmr`, ces requêtes de contrôle :

```sql
SELECT DISTINCT shipping_method  FROM orders;
SELECT DISTINCT shipping_carrier FROM orders;
```

  Résultat attendu : `shipping_method` ∈ {`home`, `mondial_relay`, `NULL`} et `shipping_carrier` ∈ {`colissimo`, `mondial_relay`, `NULL`} (cohérent avec les types `ShippingMethod` / `ShippingCarrier` du code). Tant que c'est le cas, le `ADD CONSTRAINT` passera.

  > **Plan B si une valeur orpheline apparaît** (donnée altérée manuellement en prod) : ne PAS bloquer le reste de la migration. Remplacer, pour la(les) contrainte(s) concernée(s), le `ADD CONSTRAINT ... CHECK (...)` par la séquence `ADD CONSTRAINT ... CHECK (...) NOT VALID;` puis, après nettoyage de la donnée fautive, `ALTER TABLE orders VALIDATE CONSTRAINT <nom>;`. `NOT VALID` pose la contrainte sans valider l'existant (les nouvelles écritures sont contrôlées) ; le `VALIDATE` ultérieur revérifie une fois les données corrigées.

- [ ] **Step 3 — Appliquer via dashboard.** Une fois le pré-vol (Step 2) confirmé, dans le SQL editor du projet `qczdwrudgmozyxkdidmr`, ouvrir une nouvelle query, coller l'intégralité de `20260530000002_orders_click_collect.sql`, cliquer **Run**. Vérifier « Success. No rows returned ».

- [ ] **Step 4 — Vérifier.** Exécuter ces contrôles :

```sql
-- a) Le CHECK status liste bien les 13 valeurs (ready_for_pickup + picked_up présents)
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'orders'::regclass AND conname = 'orders_status_check';

-- b) Colonnes C&C ajoutées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
  AND column_name IN ('ready_for_pickup_at', 'picked_up_at', 'pickup_code')
ORDER BY column_name;

-- c) Index unique partiel + index d'expression présents
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders'
  AND indexname IN ('idx_orders_pickup_code_unique', 'idx_orders_pickup_point_id')
ORDER BY indexname;

-- d) CHECK constraints shipping
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
  AND conname IN ('orders_shipping_method_check', 'orders_shipping_carrier_check')
ORDER BY conname;

-- e) Un statut ready_for_pickup est accepté, un statut bidon est rejeté
BEGIN;
INSERT INTO orders (order_number, customer, total, shipping, status)
  VALUES ('TEST-CC-001', '{}'::jsonb, 0, 0, 'ready_for_pickup');
SELECT status FROM orders WHERE order_number = 'TEST-CC-001';
ROLLBACK;
```

  Résultat attendu :
  - (a) la définition du CHECK contient les 13 valeurs incluant `'ready_for_pickup'` et `'picked_up'`.
  - (b) trois lignes : `ready_for_pickup_at` (timestamp with time zone), `picked_up_at` (timestamp with time zone), `pickup_code` (text).
  - (c) deux lignes : `idx_orders_pickup_code_unique` (`CREATE UNIQUE INDEX ... WHERE (pickup_code IS NOT NULL)`), `idx_orders_pickup_point_id` (`CREATE INDEX ... ((pickup_point->>'id'::text))`, donc **btree** sans `USING gin`).
  - (d) `orders_shipping_method_check` et `orders_shipping_carrier_check` avec les valeurs attendues (`click_collect` inclus).
  - (e) l'insert avec `status = 'ready_for_pickup'` réussit (une ligne renvoyée), puis `ROLLBACK`. (Optionnel : tester qu'un `status = 'bidon'` lève bien une erreur de violation de contrainte.)

- [ ] **Step 5 — Commit.**

```
git add lolett-app/supabase/migrations/20260530000002_orders_click_collect.sql
git commit -m "feat(db): extensions orders pour Click & Collect (statuts, code retrait, contraintes)"
```

---

### Task 3: Migration RPC `count_orders_with_pickup_point`

**Files:**
- Create: `lolett-app/supabase/migrations/20260530000003_count_orders_with_pickup_point.sql`

- [ ] **Step 1 — Écrire le fichier de migration.** Créer `lolett-app/supabase/migrations/20260530000003_count_orders_with_pickup_point.sql` avec exactement ce contenu :

```sql
-- =============================================================
-- Click & Collect — PR1 (3/4) : RPC count_orders_with_pickup_point
-- =============================================================
-- Compte les commandes historiques référençant un point de retrait donné
-- (snapshot orders.pickup_point->>'id' = point_id). Utilisée par l'UI admin
-- pour avertir Lola avant de masquer/éditer un point :
--   « ⚠ Référencé par N commandes historiques. Le masquer ne supprime pas ces données. »
--
-- SECURITY DEFINER : orders a une policy SELECT par-utilisateur
-- (20250220100001_orders_user_rls.sql : 'Users read own orders', authenticated
-- ne voit que SES propres commandes). SECURITY DEFINER est nécessaire pour
-- compter sur TOUTES les commandes indépendamment de l'appelant. La fonction
-- est réservée à service_role via REVOKE public/anon/authenticated + GRANT.
-- Bénéficie de l'index btree d'expression idx_orders_pickup_point_id (migration 000002).
-- À exécuter dans le SQL Editor du dashboard Supabase.

CREATE OR REPLACE FUNCTION public.count_orders_with_pickup_point(point_id text)
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM orders WHERE pickup_point->>'id' = point_id;
$$;

REVOKE ALL ON FUNCTION public.count_orders_with_pickup_point(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.count_orders_with_pickup_point(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_orders_with_pickup_point(text) TO service_role;

COMMENT ON FUNCTION public.count_orders_with_pickup_point(text) IS
  'Compte les commandes dont le snapshot pickup_point->>''id'' = point_id. SECURITY DEFINER (orders a une policy SELECT par-utilisateur ; on doit compter sur TOUTES les commandes), réservée service_role. Affichée dans l''admin avant masquage/édition d''un point de retrait.';
```

> Note : `RETURNS int` / `COUNT(*)::int` est cohérent avec la signature attendue par l'UI admin. La fonction est `STABLE` (lecture seule, pas de mutation) et `SECURITY DEFINER` car `orders` porte une policy SELECT par-utilisateur (`authenticated` ne voit que ses propres commandes) : compter le total global exige de franchir cette RLS. Le `REVOKE`/`GRANT` garantit qu'aucun rôle anon/authenticated ne peut l'appeler. `SET search_path = public` verrouille la résolution de noms (sécurité fonctions DEFINER).

- [ ] **Step 2 — Appliquer via dashboard.** Dans le SQL editor du projet `qczdwrudgmozyxkdidmr`, nouvelle query, coller l'intégralité de `20260530000003_count_orders_with_pickup_point.sql`, **Run**. Vérifier « Success. No rows returned ».

- [ ] **Step 3 — Vérifier.** Exécuter ces contrôles :

```sql
-- a) La fonction existe avec les bons attributs (sécurité + volatilité)
SELECT p.proname,
       pg_get_function_identity_arguments(p.oid) AS args,
       p.prosecdef       AS security_definer,
       p.provolatile     AS volatility   -- 's' = STABLE
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'count_orders_with_pickup_point';

-- b) Les ACL réelles via pg_proc.proacl (source de vérité, contrairement à
--    information_schema.role_routine_grants qui ne matérialise pas PUBLIC) :
--    on attend UNIQUEMENT un grant service_role et l'absence du tag PUBLIC.
SELECT proname, proacl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'count_orders_with_pickup_point';

-- c) Appel de contrôle : un id inexistant retourne 0
SELECT count_orders_with_pickup_point('point-inexistant-xyz') AS n;
```

  Résultat attendu :
  - (a) une ligne : `proname = count_orders_with_pickup_point`, `args = point_id text`, `security_definer = t` (true), `volatility = s` (STABLE).
  - (b) le `proacl` contient un unique aclitem de la forme `service_role=X/...` (X = EXECUTE) et **aucun** aclitem `=X/...` (le tag d'un grant à PUBLIC commence par `=`). Absence de `anon=` / `authenticated=` également. C'est la preuve fiable que seul `service_role` a `EXECUTE`.
  - (c) `n = 0` (aucune commande ne référence ce point).

  > Optionnel (preuve runtime de l'isolation) : `SET ROLE anon; SELECT count_orders_with_pickup_point('x');` doit lever `permission denied for function count_orders_with_pickup_point`, puis `RESET ROLE;`.

- [ ] **Step 4 — Commit.**

```
git add lolett-app/supabase/migrations/20260530000003_count_orders_with_pickup_point.sql
git commit -m "feat(db): RPC count_orders_with_pickup_point (service_role)"
```

---

### Task 4: Migration seed `email_settings` — template « Prête au retrait »

**Files:**
- Create: `lolett-app/supabase/migrations/20260530000004_seed_email_settings_ready_for_pickup.sql`

- [ ] **Step 1 — Écrire le fichier de migration.** Créer `lolett-app/supabase/migrations/20260530000004_seed_email_settings_ready_for_pickup.sql` avec exactement ce contenu :

```sql
-- =============================================================
-- Click & Collect — PR1 (4/4) : seed email_settings "order_ready_for_pickup"
-- =============================================================
-- Nouveau template transactionnel envoyé quand une commande C&C passe à
-- ready_for_pickup. ON CONFLICT (template_key) DO NOTHING → idempotent, ne
-- réécrit pas une éventuelle personnalisation déjà faite par Lola dans l'admin.
--
-- Conventions (alignées sur 20250220200005_seed_email_settings.sql) :
--   - placeholders en {{var}} (double accolade), PAS {var} comme le spec §4.4
--     → moteur interpolate() (cf. lib/email/order-refunded.ts). Le sender PR4/5
--       NE DOIT PAS utiliser le .replace('{orderNumber}', ...) des anciens senders.
--   - from_email = bonjour@lolettshop.com (valeur spec §4.4, pas le défaut historique)
--   - signoff avec U+2665 (♥, BLACK HEART), identique à tous les seeds existants
--     et au DEFAULT de la colonne signoff (le spec §4.4 écrit ♡ U+2661 → corrigé)
--   - pas de CTA (cta_text / cta_url vides) : le template met l'accent sur le code + le point
-- À exécuter dans le SQL Editor du dashboard Supabase.

INSERT INTO email_settings (
  template_key, label, from_name, from_email,
  subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params
) VALUES (
  'order_ready_for_pickup',
  'Commande prête au retrait',
  'LOLETT',
  'bonjour@lolettshop.com',
  'Votre commande {{orderNumber}} est prête au retrait — code {{pickupCode}}',
  'Bonne nouvelle, {{firstName}} ✨',
  'Votre commande vous attend au point de retrait choisi. Présentez le code ci-dessous au point de vente.',
  '',
  '',
  'Avec amour, LOLETT ♥',
  '{}'::jsonb
) ON CONFLICT (template_key) DO NOTHING;
```

- [ ] **Step 2 — Appliquer via dashboard.** Dans le SQL editor du projet `qczdwrudgmozyxkdidmr`, nouvelle query, coller l'intégralité de `20260530000004_seed_email_settings_ready_for_pickup.sql`, **Run**. Vérifier « Success. Rows: 1 » (ou « Rows: 0 » si rejoué — DO NOTHING).

- [ ] **Step 3 — Vérifier.** Exécuter ce contrôle :

```sql
SELECT template_key, label, from_name, from_email,
       subject_template, greeting, body_text, cta_text, cta_url, signoff, extra_params
FROM email_settings
WHERE template_key = 'order_ready_for_pickup';
```

  Résultat attendu : une ligne avec
  - `template_key = order_ready_for_pickup`, `label = Commande prête au retrait`, `from_name = LOLETT`, `from_email = bonjour@lolettshop.com` ;
  - `subject_template = Votre commande {{orderNumber}} est prête au retrait — code {{pickupCode}}` (bien en `{{...}}`) ;
  - `greeting = Bonne nouvelle, {{firstName}} ✨` ;
  - `body_text` = la phrase « Votre commande vous attend… au point de vente. » ;
  - `cta_text = ''`, `cta_url = ''`, `signoff = Avec amour, LOLETT ♥` (glyphe ♥ U+2665, identique aux autres seeds), `extra_params = {}`.

- [ ] **Step 4 — Commit.**

```
git add lolett-app/supabase/migrations/20260530000004_seed_email_settings_ready_for_pickup.sql
git commit -m "chore(db): seed email_settings order_ready_for_pickup (Click & Collect)"
```

---

## Vérification finale PR1

- [ ] **Écart 3→4 migrations confirmé avec Lyes.** Le spec §11 annonce « 3 migrations » ; ce plan en produit 4 (RPC isolée en `...000003`, seed décalé en `...000004`). Justification : diff atomique / clarté. Aucune correction technique, mais valider l'écart documenté (note de cadrage #7) auprès du décideur avant de clore PR1.
- [ ] **4 fichiers présents** dans `lolett-app/supabase/migrations/` :
  - `20260530000001_pickup_points.sql`
  - `20260530000002_orders_click_collect.sql`
  - `20260530000003_count_orders_with_pickup_point.sql`
  - `20260530000004_seed_email_settings_ready_for_pickup.sql`
- [ ] **4 migrations appliquées sans erreur** dans le SQL editor du projet `qczdwrudgmozyxkdidmr` (chacune « Success »).
- [ ] **Requêtes de contrôle globales OK** (à exécuter une fois tout appliqué) :

```sql
-- Table pickup_points présente
SELECT to_regclass('public.pickup_points') IS NOT NULL AS pickup_points_ok;

-- CHECK status = 13 valeurs (ready_for_pickup + picked_up inclus)
SELECT pg_get_constraintdef(oid) LIKE '%ready_for_pickup%'
   AND pg_get_constraintdef(oid) LIKE '%picked_up%' AS status_check_ok
FROM pg_constraint WHERE conrelid='orders'::regclass AND conname='orders_status_check';

-- Colonnes C&C + index présents
SELECT
  (SELECT count(*) FROM information_schema.columns
    WHERE table_name='orders'
      AND column_name IN ('ready_for_pickup_at','picked_up_at','pickup_code')) = 3 AS cols_ok,
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_orders_pickup_code_unique')   AS uniq_idx_ok,
  EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_orders_pickup_point_id')      AS expr_idx_ok;

-- RPC opérationnelle (retourne 0 sur id inexistant)
SELECT count_orders_with_pickup_point('point-inexistant-xyz') = 0 AS rpc_ok;

-- Seed email présent
SELECT EXISTS (SELECT 1 FROM email_settings WHERE template_key='order_ready_for_pickup') AS seed_ok;
```

  Tout doit renvoyer `true` (`status_check_ok`, `cols_ok`, `uniq_idx_ok`, `expr_idx_ok`, `rpc_ok`, `seed_ok`) et `pickup_points_ok = true`.
- [ ] **4 commits** créés (3 `feat(db)` / `chore(db)` + le seed), un par migration, sans secret dans les diffs.

---

## Lien avec les autres PRs

PR1 ne pose que les fondations DB ; elle est inerte tant que le code ne les consomme pas (cf. spec §15 : ne jamais revert les migrations DB).

- **PR2 (types & constantes / mappers)** consomme directement les sorties de PR1 : les valeurs du CHECK `orders_status_check` alimentent `ORDER_STATUS_VALUES` (`ready_for_pickup`, `picked_up`) ; `SHIPPING_METHOD_VALUES` / `SHIPPING_CARRIER_VALUES` incluent `click_collect` (contraintes posées en Task 2) ; le mapper `mapPickupPoint` lit le snapshot `orders.pickup_point` enrichi du discriminant `provider`.
- **PR3+ (admin pickup-points)** lit/écrit la table `pickup_points` (Task 1) et appelle la RPC `count_orders_with_pickup_point` (Task 3) via `service_role`.
- **PR4/5 (workflow & emails)** posent `ready_for_pickup_at` / `picked_up_at` / `pickup_code` (Task 2) sur les transitions admin et envoient le template `order_ready_for_pickup` (Task 4). **Le sender de ce template DOIT utiliser le helper `interpolate()`** (pattern `lib/email/order-refunded.ts` / `order-cancelled.ts`) qui gère `{{var}}` ; ne PAS copier le `subject_template.replace('{orderNumber}', ...)` des anciens senders (`order-confirmation` / `order-shipped` / `order-delivered`), sous peine de placeholders non résolus (`{{pickupCode}}` jamais substitué).

Aucune migration de données legacy n'est requise (spec §16) : les anciennes commandes `home` / `mondial_relay` restent valides sous les nouvelles contraintes.
