-- ============================================
-- POS Mobile App Enhanced Schema Migration
-- Version: 1.0
-- Date: 2025-08-24
-- Description: Adds multi-unit support, customer management, 
--              and enhanced product features as per PRD
-- ============================================

-- 1. PRODUCT GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENHANCE PRODUCTS TABLE
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_group_id UUID REFERENCES product_groups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS product_code TEXT,
ADD COLUMN IF NOT EXISTS base_unit TEXT DEFAULT 'piece',
ADD COLUMN IF NOT EXISTS low_stock_level INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_addons BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS selling_methods TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_online_store BOOLEAN DEFAULT false;

-- Create index for product_code
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_product_group_id ON products(product_group_id);

-- 3. PRODUCT UNITS TABLE (Multi-unit support)
-- ============================================
CREATE TABLE IF NOT EXISTS product_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  conversion_factor DECIMAL(10, 4) NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  unit_type TEXT CHECK (unit_type IN ('retail', 'wholesale')) NOT NULL DEFAULT 'retail',
  is_base_unit BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, unit_name)
);

CREATE INDEX idx_product_units_product_id ON product_units(product_id);

-- 4. CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  total_purchases DECIMAL(10, 2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_name ON customers(name);

-- 5. ENHANCE TRANSACTIONS TABLE
-- ============================================
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS receipt_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_credit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS credit_paid_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS credit_paid_date TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);

-- 6. CREDIT PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_credit_payments_customer_id ON credit_payments(customer_id);
CREATE INDEX idx_credit_payments_transaction_id ON credit_payments(transaction_id);

-- 7. PRODUCT VARIANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku_suffix TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, name, value)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- 8. PRODUCT ADDONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  max_quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_addons_product_id ON product_addons(product_id);

-- 9. INVENTORY ADJUSTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  adjustment_type TEXT CHECK (adjustment_type IN ('add', 'remove', 'damage', 'return', 'correction')) NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  adjusted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_adjustments_product_id ON inventory_adjustments(product_id);
CREATE INDEX idx_inventory_adjustments_created_at ON inventory_adjustments(created_at DESC);

-- 10. BUSINESS SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'My Store',
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  currency_symbol TEXT DEFAULT '₱',
  receipt_footer TEXT,
  low_stock_threshold INTEGER DEFAULT 10,
  enable_tax BOOLEAN DEFAULT false,
  enable_credit_sales BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default business settings
INSERT INTO business_settings (business_name, business_address, currency_symbol)
VALUES ('Jr & Mai Agrivet', 'Philippines', '₱')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on auth requirements)
-- Product Groups
CREATE POLICY "product_groups_select" ON product_groups FOR SELECT USING (true);
CREATE POLICY "product_groups_insert" ON product_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "product_groups_update" ON product_groups FOR UPDATE USING (true);
CREATE POLICY "product_groups_delete" ON product_groups FOR DELETE USING (true);

-- Product Units
CREATE POLICY "product_units_select" ON product_units FOR SELECT USING (true);
CREATE POLICY "product_units_insert" ON product_units FOR INSERT WITH CHECK (true);
CREATE POLICY "product_units_update" ON product_units FOR UPDATE USING (true);
CREATE POLICY "product_units_delete" ON product_units FOR DELETE USING (true);

-- Customers
CREATE POLICY "customers_select" ON customers FOR SELECT USING (true);
CREATE POLICY "customers_insert" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_update" ON customers FOR UPDATE USING (true);
CREATE POLICY "customers_delete" ON customers FOR DELETE USING (true);

-- Credit Payments
CREATE POLICY "credit_payments_select" ON credit_payments FOR SELECT USING (true);
CREATE POLICY "credit_payments_insert" ON credit_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "credit_payments_update" ON credit_payments FOR UPDATE USING (true);
CREATE POLICY "credit_payments_delete" ON credit_payments FOR DELETE USING (true);

-- Product Variants
CREATE POLICY "product_variants_select" ON product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants_insert" ON product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "product_variants_update" ON product_variants FOR UPDATE USING (true);
CREATE POLICY "product_variants_delete" ON product_variants FOR DELETE USING (true);

-- Product Addons
CREATE POLICY "product_addons_select" ON product_addons FOR SELECT USING (true);
CREATE POLICY "product_addons_insert" ON product_addons FOR INSERT WITH CHECK (true);
CREATE POLICY "product_addons_update" ON product_addons FOR UPDATE USING (true);
CREATE POLICY "product_addons_delete" ON product_addons FOR DELETE USING (true);

-- Inventory Adjustments
CREATE POLICY "inventory_adjustments_select" ON inventory_adjustments FOR SELECT USING (true);
CREATE POLICY "inventory_adjustments_insert" ON inventory_adjustments FOR INSERT WITH CHECK (true);
CREATE POLICY "inventory_adjustments_update" ON inventory_adjustments FOR UPDATE USING (true);
CREATE POLICY "inventory_adjustments_delete" ON inventory_adjustments FOR DELETE USING (true);

-- Business Settings
CREATE POLICY "business_settings_select" ON business_settings FOR SELECT USING (true);
CREATE POLICY "business_settings_insert" ON business_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "business_settings_update" ON business_settings FOR UPDATE USING (true);
CREATE POLICY "business_settings_delete" ON business_settings FOR DELETE USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update triggers for new tables
CREATE TRIGGER update_product_groups_updated_at BEFORE UPDATE ON product_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_units_updated_at BEFORE UPDATE ON product_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate sequential receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  last_number INTEGER;
BEGIN
  -- Get the last receipt number
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 4) AS INTEGER)), 0) + 1
  INTO last_number
  FROM transactions
  WHERE receipt_number LIKE 'RCP%';
  
  -- Generate new receipt number with padding
  new_number := 'RCP' || LPAD(last_number::TEXT, 7, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer balance after credit transaction
CREATE OR REPLACE FUNCTION update_customer_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_credit = true AND NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET current_balance = current_balance + NEW.total,
        total_purchases = total_purchases + NEW.total,
        last_purchase_date = NEW.created_at
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customer balance update
CREATE TRIGGER update_customer_balance_on_transaction
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.is_credit = true)
EXECUTE FUNCTION update_customer_balance();

-- Function to process credit payment
CREATE OR REPLACE FUNCTION process_credit_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update customer balance
  UPDATE customers
  SET current_balance = current_balance - NEW.amount
  WHERE id = NEW.customer_id;
  
  -- Update transaction if linked
  IF NEW.transaction_id IS NOT NULL THEN
    UPDATE transactions
    SET credit_paid_amount = credit_paid_amount + NEW.amount,
        credit_paid_date = NEW.created_at
    WHERE id = NEW.transaction_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for credit payment processing
CREATE TRIGGER process_credit_payment_trigger
AFTER INSERT ON credit_payments
FOR EACH ROW
EXECUTE FUNCTION process_credit_payment();

-- ============================================
-- SAMPLE DATA MIGRATION
-- ============================================

-- Migrate existing categories to product groups
INSERT INTO product_groups (name, description)
SELECT DISTINCT name, 'Migrated from categories' 
FROM categories
ON CONFLICT DO NOTHING;

-- Add sample product groups from PRD
INSERT INTO product_groups (name, description, display_order) VALUES 
  ('Baby Powder', 'Baby care products', 1),
  ('Coffee and Creamer', 'Coffee products and creamers', 2),
  ('Powder Drink', 'Powdered drink mixes', 3),
  ('Soft Drinks', 'Carbonated and non-carbonated beverages', 4),
  ('Snacks', 'Chips, crackers, and other snacks', 5),
  ('Personal Care', 'Hygiene and personal care items', 6),
  ('Household Items', 'Cleaning and household supplies', 7),
  ('Agrivet Supplies', 'Agricultural and veterinary products', 8)
ON CONFLICT (name) DO NOTHING;

-- Update existing products to link with product groups
UPDATE products p
SET product_group_id = pg.id
FROM product_groups pg
WHERE pg.name = (SELECT name FROM categories c WHERE c.id = p.category_id);

-- Add sample multi-unit configurations for existing products
-- This is a placeholder - actual units will be added via the application
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT id, price_retail, unit FROM products LIMIT 5
  LOOP
    -- Add base unit
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, unit_type, is_base_unit)
    VALUES (product_record.id, product_record.unit, 1, product_record.price_retail, 'retail', true)
    ON CONFLICT DO NOTHING;
    
    -- Add box unit (example)
    INSERT INTO product_units (product_id, unit_name, conversion_factor, price, unit_type, is_base_unit)
    VALUES (product_record.id, 'box', 12, product_record.price_retail * 12 * 0.9, 'wholesale', false)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE product_groups IS 'Product categories/groups for organizing inventory';
COMMENT ON TABLE product_units IS 'Multi-unit pricing configuration for products';
COMMENT ON TABLE customers IS 'Customer information and credit management';
COMMENT ON TABLE credit_payments IS 'Track credit/utang payments from customers';
COMMENT ON TABLE product_variants IS 'Product variations like size, color, etc.';
COMMENT ON TABLE product_addons IS 'Additional items that can be sold with products';
COMMENT ON TABLE inventory_adjustments IS 'Track manual inventory adjustments';
COMMENT ON TABLE business_settings IS 'Store configuration and settings';

COMMENT ON COLUMN products.base_unit IS 'The base unit of measurement for the product';
COMMENT ON COLUMN products.low_stock_level IS 'Threshold for low stock alerts';
COMMENT ON COLUMN product_units.conversion_factor IS 'How many base units in this unit';
COMMENT ON COLUMN customers.current_balance IS 'Outstanding credit/utang balance';
COMMENT ON COLUMN transactions.is_credit IS 'Whether this is a credit/utang transaction';
