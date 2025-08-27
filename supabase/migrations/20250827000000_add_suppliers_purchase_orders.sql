-- ============================================
-- Add Suppliers and Purchase Orders Tables
-- As per PRD specification
-- ============================================

-- 1. SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on auth requirements)
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT USING (true);
CREATE POLICY "suppliers_insert" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "suppliers_update" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "suppliers_delete" ON suppliers FOR DELETE USING (true);

-- 2. PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft', 'pending', 'approved', 'received', 'cancelled')) DEFAULT 'draft',
  total DECIMAL(10, 2) DEFAULT 0,
  created_by UUID REFERENCES user_profiles(id),
  notes TEXT,
  expected_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_at ON purchase_orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on auth requirements)
CREATE POLICY "purchase_orders_select" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "purchase_orders_insert" ON purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "purchase_orders_update" ON purchase_orders FOR UPDATE USING (true);
CREATE POLICY "purchase_orders_delete" ON purchase_orders FOR DELETE USING (true);

-- 3. PURCHASE ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product_id ON purchase_order_items(product_id);

-- Enable Row Level Security
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on auth requirements)
CREATE POLICY "purchase_order_items_select" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "purchase_order_items_insert" ON purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "purchase_order_items_update" ON purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "purchase_order_items_delete" ON purchase_order_items FOR DELETE USING (true);

-- 4. Update function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at 
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at 
  BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Add supplier_id to products table
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);