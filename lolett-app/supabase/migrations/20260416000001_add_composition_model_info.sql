-- Add composition and model_info fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS composition TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS model_info TEXT;
