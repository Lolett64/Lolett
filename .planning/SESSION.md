# Session State — 2026-04-28 16:30

## Branch
preview (commit `6df2fd8` pushé)

## Completed This Session
- **Mondial Relay + livraison Europe (6 pays UE)** : intégration complète checkout/Stripe/webhook/emails/admin
- **Page /livraison** + mise à jour CGV (multi-pays, retours UE, RGPD transporteur) + lien footer
- **Facture PDF auto** via `@react-pdf/renderer` avec numérotation séquentielle LOL-YYYY-NNNNN, mention art. 293 B CGI, upload Supabase Storage
- **Validations** tél/CP par pays, autocomplete data.gouv.fr conditionnel FR-only
- **Recalcul serveur** des frais de port (sécurité — jamais confiance au client)
- Build Next.js OK, type-check propre, push effectué

## Next Task — 3 actions manuelles AVANT tout test en preview

### 1. Appliquer la migration Supabase (CRITIQUE — sinon INSERT plante en 500)
SQL Editor Supabase → coller le contenu de `lolett-app/supabase/migrations/20260428000001_orders_shipping_method.sql` :
```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS shipping_country TEXT,
  ADD COLUMN IF NOT EXISTS pickup_point JSONB,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

CREATE TABLE IF NOT EXISTS invoice_counter (
  year INT PRIMARY KEY, last_number INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION next_invoice_number(p_year INT) RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE v_next INT;
BEGIN
  INSERT INTO invoice_counter (year, last_number) VALUES (p_year, 1)
    ON CONFLICT (year) DO UPDATE
      SET last_number = invoice_counter.last_number + 1, updated_at = NOW()
    RETURNING last_number INTO v_next;
  RETURN v_next;
END;
$$;
```

### 2. Créer bucket Supabase Storage `invoices` (privé)
Dashboard Supabase → Storage → New bucket → nom `invoices` → Private → Save.

### 3. Ajouter variable Vercel Preview
Vercel → Settings → Environment Variables → Preview :
- `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` = `BDTEST13` (test) — à remplacer par l'Enseigne réelle de la cliente avant prod

## Test plan preview (après 1+2+3)
1. Déclencher un nouveau deploy preview (ou attendre auto-rebuild GitHub)
2. Tester scénarios :
   - **FR Domicile** : panier 60€ → port 5,90€ → email confirmation + facture PDF
   - **FR Mondial Relay** : panier 50€ → widget MR → choisir point Paris → port 4,90€ → email avec point relais + lien Maps
   - **ES Domicile** : pays ES → port 9,90€ → autocomplete FR désactivé → CP 28013 validé
   - **BE Mondial Relay** : pays BE + MR → widget liste points Bruxelles → port 6,90€
   - **Validation bloquante** : MR sans pickup → bouton désactivé ; tél vide → erreur ; CP `123` en FR → erreur
   - **Régression** : code promo `BIENVENUE10` toujours fonctionnel

## Blockers
- Migration BDD non appliquée (MCP Supabase en read-only — manuel)
- Bucket invoices non créé (manuel)
- `NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID` non set en Vercel
- Tarifs MR à valider avec la cliente (ceux du code sont des estimations publiques, pas son contrat)

## Key Context
- **Compte MR Pro de la cliente** : déjà actif (Enseigne + clé privée à fournir pour valeur prod)
- **SIRET trouvé dans les CGV** : `99960933200013` (utilisé dans `lib/legal.ts`)
- **TVA** : franchise base art. 293 B CGI (mention sur facture)
- **Étiquettes d'expédition** : V1 = manuel via dashboard MR Pro (la cliente recopie depuis l'admin), V2 envisagée via API SOAP
- **Le widget MR utilise jQuery 3.6** (chargé par `<Script>` Next.js) + plugin officiel + CSS officiel
- **Tarifs proposés** : FR 4,90/5,90 — BENELUX 6,90/7,90 — IBERIA 7,90/9,90 (gratuit FR≥100€, BENELUX≥150€, IBERIA jamais)
