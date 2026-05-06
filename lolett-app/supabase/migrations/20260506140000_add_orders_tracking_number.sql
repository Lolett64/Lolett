-- =============================================================
-- Fix : ajout de la colonne orders.tracking_number
-- =============================================================
-- Pourquoi : l'API admin PATCH /api/admin/orders/[id] et le composant
-- OrderStatusUpdate.tsx tentent d'écrire dans `tracking_number`, mais
-- cette colonne n'avait jamais été créée — la migration
-- 20260423150000_orders_workflow_fields.sql l'a oubliée alors qu'elle
-- ajoutait tout le reste du workflow (shipped_at, admin_notes, etc.).
--
-- Symptôme constaté en prod : "Could not find the 'tracking_number'
-- column of 'orders' in the schema cache" lors du passage en statut
-- shipped avec saisie d'un numéro Mondial Relay.
--
-- Cette colonne est utilisée par lib/email/templates/order-shipped-v3.ts
-- pour générer le lien "Suivre mon colis" dans l'email d'expédition.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number text;

COMMENT ON COLUMN orders.tracking_number IS
  'Numéro de suivi transporteur (Mondial Relay, Colissimo, etc.). Saisi par Lola via l''admin lors du passage en shipped. Utilisé pour générer le lien de suivi dans l''email "commande expédiée".';
