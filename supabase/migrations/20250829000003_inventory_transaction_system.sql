-- =====================================================
-- INVENTORY TRANSACTION SYSTEM MIGRATION
-- Comprehensive transaction types for inventory management
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TRANSACTION TYPES REFERENCE TABLE
-- =====================================================

DROP TABLE IF EXISTS transaction_types CASCADE;
CREATE TABLE transaction_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  affects_inventory TEXT CHECK (affects_inventory IN ('increase', 'decrease', 'none')) DEFAULT 'none',
  requires_approval BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default transaction types
INSERT INTO transaction_types (code, name, description, affects_inventory, requires_approval) VALUES
('SALE', 'Sales Transaction', 'Regular sales from POS', 'decrease', false),
('RECEIVE', 'Receiving Voucher', 'Inventory received from suppliers', 'increase', false),
('SALE_RETURN', 'Sales Return', 'Customer returns merchandise', 'increase', false),
('SUPPLIER_RETURN', 'Supplier Return', 'Return merchandise to supplier', 'decrease', true),
('ADJ_IN', 'Inventory Adjustment In', 'Increase inventory (found items, corrections)', 'increase', true),
('ADJ_OUT', 'Inventory Adjustment Out', 'Decrease inventory (damaged, lost, corrections)', 'decrease', true),
('TRANSFER_OUT', 'Transfer Out', 'Transfer inventory to another location', 'decrease', false),
('TRANSFER_IN', 'Transfer In', 'Receive inventory from another location', 'increase', false);

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================

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
  payment_terms INTEGER DEFAULT 30, -- days
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default supplier
INSERT INTO suppliers (supplier_code, name, contact_person) VALUES
('SUP001', 'Default Supplier', 'Supplier Contact');

-- =====================================================
-- LOCATIONS/BRANCHES TABLE
-- =====================================================

DROP TABLE IF EXISTS locations CASCADE;
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  is_main_location BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default main location
INSERT INTO locations (location_code, name, is_main_location) VALUES
('MAIN', 'Main Store', true);

-- =====================================================
-- RECEIVING VOUCHERS
-- =====================================================

DROP TABLE IF EXISTS receiving_vouchers CASCADE;
CREATE TABLE receiving_vouchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Document details
  reference_number TEXT, -- Supplier's delivery receipt number
  purchase_order_number TEXT,
  delivery_date TIMESTAMPTZ DEFAULT now(),
  received_date TIMESTAMPTZ DEFAULT now(),

  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Status and approval
  status TEXT CHECK (status IN ('draft', 'pending', 'received', 'cancelled')) DEFAULT 'received',
  received_by UUID, -- user id
  approved_by UUID, -- user id
  approved_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Receiving voucher items
DROP TABLE IF EXISTS receiving_voucher_items CASCADE;
CREATE TABLE receiving_voucher_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receiving_voucher_id UUID REFERENCES receiving_vouchers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id) ON DELETE SET NULL,

  -- Product info (for reference)
  product_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,

  -- Quantities and pricing
  quantity_ordered DECIMAL(12, 4) DEFAULT 0,
  quantity_received DECIMAL(12, 4) NOT NULL,
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  line_total DECIMAL(12, 2) DEFAULT 0,

  -- Additional details
  expiry_date DATE,
  batch_number TEXT,
  notes TEXT,
  line_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SALES RETURNS
-- =====================================================

DROP TABLE IF EXISTS sales_returns CASCADE;
CREATE TABLE sales_returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number TEXT NOT NULL UNIQUE,
  original_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Return details
  return_date TIMESTAMPTZ DEFAULT now(),
  return_reason TEXT,
  return_type TEXT CHECK (return_type IN ('full', 'partial', 'exchange')) DEFAULT 'partial',

  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_refund DECIMAL(12, 2) DEFAULT 0,

  -- Processing
  refund_method TEXT DEFAULT 'cash',
  status TEXT CHECK (status IN ('draft', 'processed', 'cancelled')) DEFAULT 'processed',
  processed_by UUID, -- user id
  approved_by UUID, -- user id
  approved_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sales return items
DROP TABLE IF EXISTS sales_return_items CASCADE;
CREATE TABLE sales_return_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sales_return_id UUID REFERENCES sales_returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id) ON DELETE SET NULL,
  original_transaction_item_id UUID REFERENCES transaction_items(id) ON DELETE SET NULL,

  -- Product info
  product_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,

  -- Return details
  quantity_returned DECIMAL(12, 4) NOT NULL,
  unit_price DECIMAL(12, 4) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,

  return_condition TEXT CHECK (return_condition IN ('good', 'damaged', 'expired')) DEFAULT 'good',
  return_to_inventory BOOLEAN DEFAULT true,

  notes TEXT,
  line_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- SUPPLIER RETURNS
-- =====================================================

DROP TABLE IF EXISTS supplier_returns CASCADE;
CREATE TABLE supplier_returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_number TEXT NOT NULL UNIQUE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  original_receiving_id UUID REFERENCES receiving_vouchers(id) ON DELETE SET NULL,

  -- Return details
  return_date TIMESTAMPTZ DEFAULT now(),
  return_reason TEXT,
  expected_credit BOOLEAN DEFAULT true,

  -- Amounts
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Status and approval
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'shipped', 'credited')) DEFAULT 'pending',
  requested_by UUID, -- user id
  approved_by UUID, -- user id
  approved_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Supplier return items
DROP TABLE IF EXISTS supplier_return_items CASCADE;
CREATE TABLE supplier_return_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_return_id UUID REFERENCES supplier_returns(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id) ON DELETE SET NULL,

  -- Product info
  product_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,

  -- Return details
  quantity_returned DECIMAL(12, 4) NOT NULL,
  unit_cost DECIMAL(12, 4) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,

  return_reason TEXT,
  batch_number TEXT,
  expiry_date DATE,

  notes TEXT,
  line_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INVENTORY TRANSFERS
-- =====================================================

DROP TABLE IF EXISTS inventory_transfers CASCADE;
CREATE TABLE inventory_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number TEXT NOT NULL UNIQUE,
  from_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  to_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Transfer details
  transfer_date TIMESTAMPTZ DEFAULT now(),
  expected_date TIMESTAMPTZ,
  transfer_type TEXT CHECK (transfer_type IN ('regular', 'emergency', 'rebalancing')) DEFAULT 'regular',

  -- Status tracking
  status TEXT CHECK (status IN ('draft', 'pending', 'in_transit', 'received', 'cancelled')) DEFAULT 'draft',
  shipped_by UUID, -- user id
  shipped_at TIMESTAMPTZ,
  received_by UUID, -- user id
  received_at TIMESTAMPTZ,

  -- Amounts (for valuation)
  total_value DECIMAL(12, 2) DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory transfer items
DROP TABLE IF EXISTS inventory_transfer_items CASCADE;
CREATE TABLE inventory_transfer_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_transfer_id UUID REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id) ON DELETE SET NULL,

  -- Product info
  product_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,

  -- Transfer quantities
  quantity_requested DECIMAL(12, 4) NOT NULL,
  quantity_shipped DECIMAL(12, 4) DEFAULT 0,
  quantity_received DECIMAL(12, 4) DEFAULT 0,

  -- Valuation
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  line_value DECIMAL(12, 2) DEFAULT 0,

  notes TEXT,
  line_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ENHANCED INVENTORY ADJUSTMENTS TABLE
-- =====================================================

-- Drop and recreate with enhanced features
DROP TABLE IF EXISTS inventory_adjustments CASCADE;
CREATE TABLE inventory_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adjustment_number TEXT NOT NULL UNIQUE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Adjustment details
  adjustment_date TIMESTAMPTZ DEFAULT now(),
  adjustment_type TEXT CHECK (adjustment_type IN ('increase', 'decrease', 'correction')) NOT NULL,
  reason_code TEXT,
  reason_description TEXT,

  -- Reference information
  reference_number TEXT,
  counted_by UUID, -- user id for physical counts

  -- Status and approval
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'cancelled')) DEFAULT 'draft',
  requested_by UUID, -- user id
  approved_by UUID, -- user id
  approved_at TIMESTAMPTZ,

  -- Totals
  total_value_impact DECIMAL(12, 2) DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory adjustment items
DROP TABLE IF EXISTS inventory_adjustment_items CASCADE;
CREATE TABLE inventory_adjustment_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_adjustment_id UUID REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id) ON DELETE SET NULL,

  -- Product info
  product_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,

  -- Adjustment details
  quantity_before DECIMAL(12, 4) DEFAULT 0,
  quantity_adjustment DECIMAL(12, 4) NOT NULL,
  quantity_after DECIMAL(12, 4) DEFAULT 0,

  -- Valuation
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  value_impact DECIMAL(12, 2) DEFAULT 0,

  -- Additional details
  reason_description TEXT,
  batch_number TEXT,
  expiry_date DATE,

  notes TEXT,
  line_number INTEGER,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INVENTORY MOVEMENTS LOG (AUDIT TRAIL)
-- =====================================================

DROP TABLE IF EXISTS inventory_movements CASCADE;
CREATE TABLE inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Product and location
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_unit_id UUID REFERENCES product_units(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Movement details
  movement_date TIMESTAMPTZ DEFAULT now(),
  movement_type TEXT NOT NULL, -- 'in' or 'out'
  transaction_type TEXT NOT NULL, -- 'sale', 'receive', 'return', 'adjustment', 'transfer'

  -- Reference to source transaction
  reference_table TEXT, -- 'transactions', 'receiving_vouchers', etc.
  reference_id UUID,
  reference_number TEXT,

  -- Quantities
  quantity_moved DECIMAL(12, 4) NOT NULL,
  quantity_before DECIMAL(12, 4) NOT NULL,
  quantity_after DECIMAL(12, 4) NOT NULL,

  -- Unit information
  unit_name TEXT NOT NULL,
  conversion_to_base DECIMAL(12, 4) DEFAULT 1,
  base_unit_quantity DECIMAL(12, 4) NOT NULL,

  -- Valuation
  unit_cost DECIMAL(12, 4) DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,

  -- User tracking
  created_by UUID, -- user id

  -- Additional info
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- STOCK LEVELS VIEW (REAL-TIME INVENTORY)
-- =====================================================

CREATE OR REPLACE VIEW current_stock_levels AS
SELECT
  p.id as product_id,
  p.name as product_name,
  p.sku,
  l.id as location_id,
  l.name as location_name,
  COALESCE(SUM(
    CASE
      WHEN im.movement_type = 'in' THEN im.base_unit_quantity
      WHEN im.movement_type = 'out' THEN -im.base_unit_quantity
      ELSE 0
    END
  ), 0) as current_stock_base_unit,
  p.base_unit,
  COUNT(im.id) as movement_count,
  MAX(im.movement_date) as last_movement_date
FROM products p
CROSS JOIN locations l
LEFT JOIN inventory_movements im ON p.id = im.product_id AND l.id = im.location_id
WHERE p.is_active = true AND l.is_active = true
GROUP BY p.id, p.name, p.sku, l.id, l.name, p.base_unit
ORDER BY p.name, l.name;

-- =====================================================
-- FUNCTIONS FOR INVENTORY MANAGEMENT
-- =====================================================

-- Function to update product stock after inventory movement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the products table stock based on movements for main location
  UPDATE products
  SET stock = (
    SELECT COALESCE(SUM(
      CASE
        WHEN im.movement_type = 'in' THEN im.base_unit_quantity
        WHEN im.movement_type = 'out' THEN -im.base_unit_quantity
        ELSE 0
      END
    ), 0)
    FROM inventory_movements im
    JOIN locations l ON im.location_id = l.id
    WHERE im.product_id = NEW.product_id
    AND l.is_main_location = true
  ),
  updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update product stock
DROP TRIGGER IF EXISTS trigger_update_product_stock ON inventory_movements;
CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT OR UPDATE OR DELETE ON inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Function to create inventory movement record
CREATE OR REPLACE FUNCTION create_inventory_movement(
  p_product_id UUID,
  p_product_unit_id UUID,
  p_location_id UUID,
  p_movement_type TEXT,
  p_transaction_type TEXT,
  p_reference_table TEXT,
  p_reference_id UUID,
  p_reference_number TEXT,
  p_quantity_moved DECIMAL,
  p_unit_name TEXT,
  p_conversion_to_base DECIMAL DEFAULT 1,
  p_unit_cost DECIMAL DEFAULT 0,
  p_created_by UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_current_stock DECIMAL;
  v_new_stock DECIMAL;
  v_base_quantity DECIMAL;
  v_movement_id UUID;
BEGIN
  -- Calculate base unit quantity
  v_base_quantity := p_quantity_moved * p_conversion_to_base;

  -- Get current stock in base units for this product and location
  SELECT COALESCE(current_stock_base_unit, 0)
  INTO v_current_stock
  FROM current_stock_levels
  WHERE product_id = p_product_id AND location_id = p_location_id;

  -- Calculate new stock level
  IF p_movement_type = 'in' THEN
    v_new_stock := v_current_stock + v_base_quantity;
  ELSE
    v_new_stock := v_current_stock - v_base_quantity;
  END IF;

  -- Create the movement record
  INSERT INTO inventory_movements (
    product_id,
    product_unit_id,
    location_id,
    movement_type,
    transaction_type,
    reference_table,
    reference_id,
    reference_number,
    quantity_moved,
    quantity_before,
    quantity_after,
    unit_name,
    conversion_to_base,
    base_unit_quantity,
    unit_cost,
    total_cost,
    created_by,
    notes
  ) VALUES (
    p_product_id,
    p_product_unit_id,
    p_location_id,
    p_movement_type,
    p_transaction_type,
    p_reference_table,
    p_reference_id,
    p_reference_number,
    p_quantity_moved,
    v_current_stock,
    v_new_stock,
    p_unit_name,
    p_conversion_to_base,
    v_base_quantity,
    p_unit_cost,
    p_quantity_moved * p_unit_cost,
    p_created_by,
    p_notes
  ) RETURNING id INTO v_movement_id;

  RETURN v_movement_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Inventory movements indexes
CREATE INDEX idx_inventory_movements_product_location ON inventory_movements(product_id, location_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date DESC);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_table, reference_id);

-- Transaction reference indexes
CREATE INDEX idx_receiving_vouchers_supplier ON receiving_vouchers(supplier_id);
CREATE INDEX idx_receiving_vouchers_date ON receiving_vouchers(received_date DESC);
CREATE INDEX idx_sales_returns_transaction ON sales_returns(original_transaction_id);
CREATE INDEX idx_sales_returns_customer ON sales_returns(customer_id);
CREATE INDEX idx_supplier_returns_supplier ON supplier_returns(supplier_id);
CREATE INDEX idx_inventory_transfers_locations ON inventory_transfers(from_location_id, to_location_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE transaction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiving_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiving_voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for all users (to be refined with proper auth)
CREATE POLICY "Enable all operations for all users" ON transaction_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON receiving_vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON receiving_voucher_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON sales_returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON sales_return_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON supplier_returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON supplier_return_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON inventory_transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON inventory_transfer_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON inventory_adjustment_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for all users" ON inventory_movements FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Add some sample suppliers
INSERT INTO suppliers (supplier_code, name, contact_person, phone) VALUES
('SUP002', 'ABC Trading Corp', 'John Smith', '09123456789'),
('SUP003', 'XYZ Distributors', 'Maria Garcia', '09234567890');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment about migration
COMMENT ON SCHEMA public IS 'Inventory Transaction System Migration completed successfully';
