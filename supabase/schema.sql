-- =====================================================
-- TindahanKO POS Database Schema v2.0
-- Comprehensive inventory management with multi-unit support
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Categories table
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_code TEXT DEFAULT '#9333ea',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Units of measure table
DROP TABLE IF EXISTS units CASCADE;
CREATE TABLE units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL,
  unit_type TEXT CHECK (unit_type IN ('weight', 'volume', 'count', 'length')) DEFAULT 'count',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products table with enhanced multi-unit support
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Base unit configuration
  base_unit_id UUID REFERENCES units(id) NOT NULL,
  base_cost DECIMAL(12, 4) DEFAULT 0,
  base_price_retail DECIMAL(12, 4) NOT NULL,
  base_price_wholesale DECIMAL(12, 4),

  -- Inventory tracking
  current_stock DECIMAL(12, 4) DEFAULT 0,
  minimum_stock DECIMAL(12, 4) DEFAULT 0,
  maximum_stock DECIMAL(12, 4),
  reorder_point DECIMAL(12, 4) DEFAULT 0,

  -- Additional properties
  image_url TEXT,
  color_code TEXT DEFAULT '#3b82f6',
  is_active BOOLEAN DEFAULT true,
  is_trackable BOOLEAN DEFAULT true,
  allow_negative_stock BOOLEAN DEFAULT false,

  -- Multi-location support
  location TEXT DEFAULT 'main',
  shelf_location TEXT,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Product units (multi-unit support - up to 6 additional units)
DROP TABLE IF EXISTS product_units CASCADE;
CREATE TABLE product_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  conversion_factor DECIMAL(12, 4) NOT NULL DEFAULT 1,
  price_retail DECIMAL(12, 4),
  price_wholesale DECIMAL(12, 4),
  cost DECIMAL(12, 4),
  is_base_unit BOOLEAN DEFAULT false,
  unit_type TEXT CHECK (unit_type IN ('retail', 'wholesale', 'both')) DEFAULT 'retail',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(product_id, unit_id)
);

-- Customers table with enhanced features
DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,

  -- Business information
  business_name TEXT,
  tax_id TEXT,
  customer_type TEXT CHECK (customer_type IN ('retail', 'wholesale', 'dealer')) DEFAULT 'retail',

  -- Credit management
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  current_balance DECIMAL(12, 2) DEFAULT 0,
  payment_terms INTEGER DEFAULT 0, -- days

  -- Preferences
  preferred_payment_method TEXT,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_transaction_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Suppliers table
DROP TABLE IF EXISTS suppliers CASCADE;
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_code TEXT UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  tax_id TEXT,
  payment_terms INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TRANSACTION TABLES
-- =====================================================

-- Transaction types lookup
DROP TABLE IF EXISTS transaction_types CASCADE;
CREATE TABLE transaction_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  affects_inventory TEXT CHECK (affects_inventory IN ('increase', 'decrease', 'none')) DEFAULT 'none',
  requires_customer BOOLEAN DEFAULT false,
  requires_supplier BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Main transactions table
DROP TABLE IF EXISTS transactions CASCADE;
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_type_id UUID REFERENCES transaction_types(id) NOT NULL,

  -- References
  customer_id UUID REFERENCES customers(id),
  supplier_id UUID REFERENCES suppliers(id),

  -- Transaction details
  transaction_date TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  reference_number TEXT,

  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  service_fee DECIMAL(12, 2) DEFAULT 0,
  delivery_fee DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Payment information
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')) DEFAULT 'pending',
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  amount_due DECIMAL(12, 2) DEFAULT 0,

  -- Status and notes
  status TEXT CHECK (status IN ('draft', 'pending', 'completed', 'cancelled', 'voided')) DEFAULT 'completed',
  notes TEXT,
  internal_notes TEXT,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  approved_by UUID,
  voided_by UUID,
  voided_at TIMESTAMPTZ,
  void_reason TEXT
);

-- Transaction items/details
DROP TABLE IF EXISTS transaction_items CASCADE;
CREATE TABLE transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_unit_id UUID REFERENCES product_units(id),

  -- Product information (for non-inventory items)
  item_name TEXT,
  item_description TEXT,

  -- Quantity and pricing
  quantity DECIMAL(12, 4) NOT NULL,
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  unit_price DECIMAL(12, 4) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  line_total DECIMAL(12, 2) NOT NULL,

  -- Additional details
  notes TEXT,
  line_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INVENTORY TRACKING TABLES
-- =====================================================

-- Stock movements/adjustments
DROP TABLE IF EXISTS stock_movements CASCADE;
CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id),
  transaction_id UUID REFERENCES transactions(id),

  -- Movement details
  movement_type TEXT CHECK (movement_type IN (
    'sale', 'purchase', 'adjustment_in', 'adjustment_out',
    'transfer_in', 'transfer_out', 'return_in', 'return_out',
    'opening_balance', 'receiving', 'damage', 'expiry'
  )) NOT NULL,

  -- Quantities
  quantity_before DECIMAL(12, 4) DEFAULT 0,
  quantity_change DECIMAL(12, 4) NOT NULL,
  quantity_after DECIMAL(12, 4) DEFAULT 0,

  -- Additional information
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  reference_number TEXT,
  notes TEXT,
  reason TEXT,

  -- Location tracking
  location_from TEXT,
  location_to TEXT,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Inventory adjustments
DROP TABLE IF EXISTS inventory_adjustments CASCADE;
CREATE TABLE inventory_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adjustment_number TEXT NOT NULL UNIQUE,
  adjustment_date TIMESTAMPTZ DEFAULT now(),
  adjustment_type TEXT CHECK (adjustment_type IN ('increase', 'decrease', 'recount')) NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  total_value DECIMAL(12, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'approved', 'cancelled')) DEFAULT 'draft',

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ
);

-- Inventory adjustment items
DROP TABLE IF EXISTS inventory_adjustment_items CASCADE;
CREATE TABLE inventory_adjustment_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adjustment_id UUID REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id),

  quantity_before DECIMAL(12, 4) DEFAULT 0,
  quantity_after DECIMAL(12, 4) DEFAULT 0,
  quantity_change DECIMAL(12, 4) NOT NULL,
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  line_value DECIMAL(12, 2) DEFAULT 0,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- Receipt templates and settings
DROP TABLE IF EXISTS receipt_settings CASCADE;
CREATE TABLE receipt_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT DEFAULT 'TindahanKO Store',
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  tax_id TEXT,
  receipt_header TEXT,
  receipt_footer TEXT DEFAULT 'Thank you for your business!',
  show_logo BOOLEAN DEFAULT false,
  logo_url TEXT,
  receipt_width INTEGER DEFAULT 80, -- mm
  font_size INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- System settings
DROP TABLE IF EXISTS system_settings CASCADE;
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log
DROP TABLE IF EXISTS audit_logs CASCADE;
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- Product units indexes
CREATE INDEX idx_product_units_product_id ON product_units(product_id);
CREATE INDEX idx_product_units_base ON product_units(product_id, is_base_unit) WHERE is_base_unit = true;

-- Customers indexes
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_active ON customers(is_active) WHERE is_active = true;

-- Transactions indexes
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_customer ON transactions(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_transactions_supplier ON transactions(supplier_id) WHERE supplier_id IS NOT NULL;
CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type_id);

-- Transaction items indexes
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id) WHERE product_id IS NOT NULL;

-- Stock movements indexes
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_transaction ON stock_movements(transaction_id) WHERE transaction_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (modify based on your auth requirements)
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        AND tablename IN ('categories', 'units', 'products', 'product_units', 'customers', 'suppliers',
                         'transaction_types', 'transactions', 'transaction_items', 'stock_movements',
                         'inventory_adjustments', 'inventory_adjustment_items', 'receipt_settings',
                         'system_settings', 'audit_logs')
    LOOP
        EXECUTE format('CREATE POLICY "Enable all access for authenticated users" ON %I FOR ALL USING (true)', table_name);
    END LOOP;
END $$;

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        AND tablename IN ('categories', 'products', 'customers', 'suppliers', 'transactions', 'receipt_settings', 'system_settings')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', table_name, table_name);
    END LOOP;
END $$;

-- Function to generate sequential numbers
CREATE OR REPLACE FUNCTION generate_sequential_number(prefix text, table_name text, column_name text)
RETURNS text AS $$
DECLARE
    next_number integer;
    result text;
BEGIN
    -- Get the next number in sequence
    EXECUTE format('SELECT COALESCE(MAX(CAST(SUBSTRING(%I FROM LENGTH(%L) + 1) AS INTEGER)), 0) + 1 FROM %I WHERE %I LIKE %L',
                   column_name, prefix, table_name, column_name, prefix || '%')
    INTO next_number;

    -- Format with leading zeros
    result := prefix || LPAD(next_number::text, 6, '0');

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock after transaction
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    movement_type text;
    quantity_change decimal(12,4);
    current_stock decimal(12,4);
BEGIN
    -- Determine movement type based on transaction type
    SELECT tt.affects_inventory INTO movement_type
    FROM transaction_types tt
    WHERE tt.id = (SELECT t.transaction_type_id FROM transactions t WHERE t.id = NEW.transaction_id);

    IF movement_type = 'decrease' THEN
        quantity_change := -NEW.quantity;
    ELSIF movement_type = 'increase' THEN
        quantity_change := NEW.quantity;
    ELSE
        RETURN NEW; -- No stock impact
    END IF;

    -- Update product stock
    UPDATE products
    SET current_stock = current_stock + quantity_change,
        updated_at = now()
    WHERE id = NEW.product_id;

    -- Get updated stock for stock movement record
    SELECT current_stock INTO current_stock FROM products WHERE id = NEW.product_id;

    -- Create stock movement record
    INSERT INTO stock_movements (
        product_id, product_unit_id, transaction_id, movement_type,
        quantity_before, quantity_change, quantity_after, unit_cost, notes
    ) VALUES (
        NEW.product_id, NEW.product_unit_id, NEW.transaction_id,
        CASE WHEN movement_type = 'decrease' THEN 'sale' ELSE 'purchase' END,
        current_stock - quantity_change, quantity_change, current_stock,
        NEW.unit_cost, 'Auto-generated from transaction'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock updates
CREATE TRIGGER trigger_update_stock
    AFTER INSERT ON transaction_items
    FOR EACH ROW
    WHEN (NEW.product_id IS NOT NULL)
    EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default units
INSERT INTO units (name, abbreviation, unit_type, is_system) VALUES
('Piece', 'pcs', 'count', true),
('Kilogram', 'kg', 'weight', true),
('Gram', 'g', 'weight', true),
('Liter', 'L', 'volume', true),
('Milliliter', 'mL', 'volume', true),
('Box', 'box', 'count', true),
('Pack', 'pack', 'count', true),
('Dozen', 'doz', 'count', true),
('Case', 'case', 'count', true),
('Carton', 'ctn', 'count', true),
('Sack', 'sack', 'count', true),
('Bag', 'bag', 'count', true),
('Bundle', 'bundle', 'count', true),
('Roll', 'roll', 'count', true),
('Meter', 'm', 'length', true)
ON CONFLICT (name) DO NOTHING;

-- Insert transaction types
INSERT INTO transaction_types (code, name, description, affects_inventory, requires_customer, requires_supplier) VALUES
('SALE', 'Sales Transaction', 'Customer sales transaction', 'decrease', true, false),
('PURCHASE', 'Purchase Order', 'Supplier purchase transaction', 'increase', false, true),
('RETURN_IN', 'Sales Return', 'Customer return (stock increase)', 'increase', true, false),
('RETURN_OUT', 'Purchase Return', 'Return to supplier (stock decrease)', 'decrease', false, true),
('ADJ_IN', 'Stock Adjustment In', 'Inventory increase adjustment', 'increase', false, false),
('ADJ_OUT', 'Stock Adjustment Out', 'Inventory decrease adjustment', 'decrease', false, false),
('TRANSFER_IN', 'Transfer In', 'Stock transfer in from another location', 'increase', false, false),
('TRANSFER_OUT', 'Transfer Out', 'Stock transfer out to another location', 'decrease', false, false),
('RECEIVING', 'Receiving Voucher', 'Goods receiving voucher', 'increase', false, true),
('OPENING', 'Opening Balance', 'Opening inventory balance', 'increase', false, false)
ON CONFLICT (code) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description, color_code, display_order) VALUES
('General', 'General products', '#6b7280', 0),
('Food & Beverages', 'Food and drink items', '#10b981', 1),
('Personal Care', 'Personal hygiene and care products', '#3b82f6', 2),
('Household', 'Household items and cleaning supplies', '#f59e0b', 3),
('Electronics', 'Electronic devices and accessories', '#8b5cf6', 4),
('Clothing', 'Clothing and accessories', '#ec4899', 5),
('Health & Medicine', 'Health and medical supplies', '#ef4444', 6),
('Office Supplies', 'Office and school supplies', '#06b6d4', 7)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products with multi-unit support
DO $$
DECLARE
    cat_general UUID;
    cat_food UUID;
    cat_personal UUID;
    unit_pcs UUID;
    unit_kg UUID;
    unit_box UUID;
    unit_pack UUID;
    product_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_general FROM categories WHERE name = 'General';
    SELECT id INTO cat_food FROM categories WHERE name = 'Food & Beverages';
    SELECT id INTO cat_personal FROM categories WHERE name = 'Personal Care';

    -- Get unit IDs
    SELECT id INTO unit_pcs FROM units WHERE name = 'Piece';
    SELECT id INTO unit_kg FROM units WHERE name = 'Kilogram';
    SELECT id INTO unit_box FROM units WHERE name = 'Box';
    SELECT id INTO unit_pack FROM units WHERE name = 'Pack';

    -- Insert sample products

    -- Product 1: Instant Coffee
    INSERT INTO products (name, description, sku, category_id, base_unit_id, base_cost, base_price_retail, base_price_wholesale, current_stock, minimum_stock)
    VALUES ('3-in-1 Instant Coffee', 'Premium instant coffee mix', 'COFFEE001', cat_food, unit_pcs, 2.50, 3.00, 2.80, 100, 20)
    RETURNING id INTO product_id;

    -- Add units for coffee
    INSERT INTO product_units (product_id, unit_id, unit_name, conversion_factor, price_retail, price_wholesale, cost, is_base_unit, unit_type, display_order) VALUES
    (product_id, unit_pcs, 'Piece', 1, 3.00, 2.80, 2.50, true, 'both', 1),
    (product_id, unit_box, 'Box', 24, 70.00, 65.00, 60.00, false, 'wholesale', 2),
    (product_id, unit_pack, 'Pack', 12, 35.00, 32.00, 30.00, false, 'both', 3);

    -- Product 2: Rice
    INSERT INTO products (name, description, sku, category_id, base_unit_id, base_cost, base_price_retail, base_price_wholesale, current_stock, minimum_stock)
    VALUES ('Premium Rice', 'High quality jasmine rice', 'RICE001', cat_food, unit_kg, 45.00, 55.00, 50.00, 500, 50)
    RETURNING id INTO product_id;

    -- Add units for rice
    INSERT INTO product_units (product_id, unit_id, unit_name, conversion_factor, price_retail, price_wholesale, cost, is_base_unit, unit_type, display_order) VALUES
    (product_id, unit_kg, 'Kilogram', 1, 55.00, 50.00, 45.00, true, 'both', 1);

    -- Product 3: Soap
    INSERT INTO products (name, description, sku, category_id, base_unit_id, base_cost, base_price_retail, base_price_wholesale, current_stock, minimum_stock)
    VALUES ('Bath Soap', 'Antibacterial bath soap', 'SOAP001', cat_personal, unit_pcs, 12.00, 15.00, 13.50, 75, 15)
    RETURNING id INTO product_id;

    -- Add units for soap
    INSERT INTO product_units (product_id, unit_id, unit_name, conversion_factor, price_retail, price_wholesale, cost, is_base_unit, unit_type, display_order) VALUES
    (product_id, unit_pcs, 'Piece', 1, 15.00, 13.50, 12.00, true, 'both', 1),
    (product_id, unit_box, 'Box', 48, 650.00, 600.00, 576.00, false, 'wholesale', 2);

END $$;

-- Insert default receipt settings
INSERT INTO receipt_settings (business_name, business_address, business_phone, receipt_header, receipt_footer)
VALUES ('TindahanKO Store', 'Sample Address, City, Province', '09171234567', 'Welcome to TindahanKO!', 'Thank you for shopping with us!')
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('currency_symbol', '₱', 'string', 'Currency symbol to display'),
('currency_code', 'PHP', 'string', 'Currency code'),
('tax_rate', '12', 'number', 'Default tax rate percentage'),
('receipt_auto_print', 'false', 'boolean', 'Auto-print receipts after transaction'),
('low_stock_alert', 'true', 'boolean', 'Enable low stock alerts'),
('negative_stock_allowed', 'false', 'boolean', 'Allow negative stock quantities'),
('decimal_places', '2', 'number', 'Number of decimal places for amounts'),
('stock_decimal_places', '4', 'number', 'Number of decimal places for stock quantities')
ON CONFLICT (setting_key) DO NOTHING;

-- Create a view for product stock with units
CREATE OR REPLACE VIEW v_product_stock AS
SELECT
    p.id,
    p.name,
    p.sku,
    p.current_stock,
    p.minimum_stock,
    p.base_unit_id,
    bu.name as base_unit_name,
    bu.abbreviation as base_unit_abbrev,
    c.name as category_name,
    c.color_code as category_color,
    p.base_price_retail,
    p.base_price_wholesale,
    p.is_active,
    CASE
        WHEN p.current_stock <= p.minimum_stock THEN 'low'
        WHEN p.current_stock = 0 THEN 'out'
        ELSE 'ok'
    END as stock_status
FROM products p
LEFT JOIN units bu ON p.base_unit_id = bu.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

-- Create a view for transaction summary
CREATE OR REPLACE VIEW v_transaction_summary AS
SELECT
    t.id,
    t.transaction_number,
    t.transaction_date,
    tt.name as transaction_type,
    tt.affects_inventory,
    c.name as customer_name,
    s.name as supplier_name,
    t.total_amount,
    t.payment_status,
    t.status,
    (SELECT COUNT(*) FROM transaction_items ti WHERE ti.transaction_id = t.id) as item_count
FROM transactions t
LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
LEFT JOIN customers c ON t.customer_id = c.id
LEFT JOIN suppliers s ON t.supplier_id = s.id
ORDER BY t.transaction_date DESC;

COMMIT;
