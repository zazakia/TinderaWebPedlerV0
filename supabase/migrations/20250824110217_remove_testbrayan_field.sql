-- Remove TESTBrayan field from products table
ALTER TABLE products 
DROP COLUMN IF EXISTS "TESTBrayan";

-- Migration complete: TESTBrayan field removed
