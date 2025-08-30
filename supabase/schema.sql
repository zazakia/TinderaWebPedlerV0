-- =====================================================
-- TindahanKO POS - Consolidated Database Schema
-- Version: 2.1
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE BUSINESS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  credit_limit NUMERIC(10, 2) DEFAULT 0,
  current_balance NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  category_id UUID REFERENCES categories(id),
  price_retail NUMERIC(10, 2) NOT NULL,
  price_wholesale NUMERIC(10, 2),
  cost NUMERIC(10, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  base_unit TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    unit_name VARCHAR(50) NOT NULL,
    conversion_factor DECIMAL(10,4) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    is_base_unit BOOLEAN DEFAULT false,
    unit_type VARCHAR(20) CHECK (unit_type IN ('retail', 'wholesale')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, unit_name)
);

-- =====================================================
-- TRANSACTION & PAYMENT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  tax NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  items JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  unit_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_collected DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY & LOCATION TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    stock_on_hand DECIMAL(10,3) DEFAULT 0,
    UNIQUE(product_id, location_id)
);

CREATE TABLE IF NOT EXISTS inventory_transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    transaction_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    quantity_change DECIMAL(10,3) NOT NULL,
    quantity_before DECIMAL(10,3),
    quantity_after DECIMAL(10,3),
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_stock_from_transaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO inventory_transaction_log (product_id, location_id, transaction_type, reference_id, quantity_change, quantity_before, quantity_after, created_by)
    VALUES (NEW.product_id, (SELECT id FROM locations WHERE name = 'Main Store'), 'sale', NEW.transaction_id, -NEW.quantity, (SELECT stock + NEW.quantity FROM products WHERE id = NEW.product_id), (SELECT stock FROM products WHERE id = NEW.product_id), 'system');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_transaction_item_insert ON transaction_items;
CREATE TRIGGER after_transaction_item_insert
AFTER INSERT ON transaction_items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_from_transaction();

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO locations (name) VALUES ('Main Store') ON CONFLICT DO NOTHING;

INSERT INTO categories (name) VALUES ('Uncategorized'), ('Food'), ('Drinks'), ('Electronics') ON CONFLICT DO NOTHING;

-- Add more seed data as needed
