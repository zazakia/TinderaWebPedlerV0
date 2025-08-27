-- Add location_id to customers table for multi-location support
-- ============================================

-- Add location_id column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_location_id ON customers(location_id);

-- Update existing customers to have a default location (first location in the table)
-- This is a one-time operation to ensure data consistency
DO $$
DECLARE
    default_location UUID;
BEGIN
    SELECT id INTO default_location FROM locations LIMIT 1;
    IF default_location IS NOT NULL THEN
        UPDATE customers 
        SET location_id = default_location 
        WHERE location_id IS NULL;
    END IF;
END $$;