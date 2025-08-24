-- Add TESTBrayan field to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS "TESTBrayan" TEXT DEFAULT 'Test Value from Brayan';

-- Add a comment to describe the field
COMMENT ON COLUMN products."TESTBrayan" IS 'Test field added by Brayan for demonstration';

-- Update existing products with a sample value
UPDATE products 
SET "TESTBrayan" = 'Brayan Test - Product ID: ' || id::text
WHERE "TESTBrayan" IS NULL OR "TESTBrayan" = 'Test Value from Brayan';
