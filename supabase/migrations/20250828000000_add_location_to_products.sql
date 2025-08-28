-- Add location_id to products table for multi-location support
-- ============================================

-- Add location_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_location_id ON products(location_id);

-- Update existing products to have a default location (first location in the table)
-- This is a one-time operation to ensure data consistency
DO $$
DECLARE
    default_location UUID;
BEGIN
    SELECT id INTO default_location FROM locations LIMIT 1;
    IF default_location IS NOT NULL THEN
        UPDATE products 
        SET location_id = default_location 
        WHERE location_id IS NULL;
    END IF;
END $$;