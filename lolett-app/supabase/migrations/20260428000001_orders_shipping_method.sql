-- Mondial Relay + livraison Europe (FR/BE/LU/NL/ES/PT) + facture PDF.
-- Étend `orders` pour stocker la méthode de livraison choisie (Domicile vs
-- Mondial Relay), le transporteur, le pays, le point relais sélectionné,
-- et les infos de facturation (URL PDF + numéro séquentiel).
-- Le téléphone client reste dans la colonne `customer` (JSONB).
-- Crée également un compteur annuel pour la numérotation des factures.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_method TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS shipping_country TEXT,
  ADD COLUMN IF NOT EXISTS pickup_point JSONB,
  ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT;

COMMENT ON COLUMN orders.shipping_method IS 'home | mondial_relay';
COMMENT ON COLUMN orders.shipping_carrier IS 'colissimo | mondial_relay';
COMMENT ON COLUMN orders.shipping_country IS 'ISO 3166-1 alpha-2 (FR, BE, LU, NL, ES, PT)';
COMMENT ON COLUMN orders.pickup_point IS 'Données du point relais sélectionné: { id, name, address, postalCode, city, country, lat, lng }. NULL si livraison domicile.';
COMMENT ON COLUMN orders.invoice_number IS 'Numéro séquentiel de facture, format LOL-YYYY-NNNNN (ex: LOL-2026-00042).';

-- Compteur séquentiel des factures par année.
-- Une ligne par année, mise à jour atomique via UPDATE ... RETURNING.
CREATE TABLE IF NOT EXISTS invoice_counter (
  year INT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fonction utilitaire: incrémente atomiquement et retourne le prochain numéro.
CREATE OR REPLACE FUNCTION next_invoice_number(p_year INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_next INT;
BEGIN
  INSERT INTO invoice_counter (year, last_number)
    VALUES (p_year, 1)
    ON CONFLICT (year) DO UPDATE
      SET last_number = invoice_counter.last_number + 1,
          updated_at = NOW()
    RETURNING last_number INTO v_next;
  RETURN v_next;
END;
$$;
