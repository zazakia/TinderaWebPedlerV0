-- supabase/migrations/20250830120000_add_transaction_tables.sql

-- This migration adds specific tables for various transaction types
-- to support a full inventory and payment lifecycle.

BEGIN;

-- =====================================================
-- PAYMENT AND CREDIT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  transaction_id UUID REFERENCES transactions(id),
  amount_collected DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT now(),
  reference_number TEXT,
  notes TEXT,
  collected_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- INVENTORY TRANSFER TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS inventory_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_number TEXT NOT NULL UNIQUE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  transfer_date TIMESTAMPTZ DEFAULT now(),
  expected_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_by UUID,
  shipped_by UUID,
  received_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_transfer_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_unit_id UUID NOT NULL REFERENCES product_units(id),
  quantity_requested DECIMAL(12, 4) NOT NULL,
  quantity_shipped DECIMAL(12, 4),
  quantity_received DECIMAL(12, 4),
  notes TEXT
);

-- =====================================================
-- AUTHENTICATION & SYSTEM USER TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS system_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID UNIQUE, -- Links to supabase.auth.users.id
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')) DEFAULT 'cashier',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES system_users(id),
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);

-- Add created_by and updated_by to existing tables if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES system_users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES system_users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES system_users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES system_users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES system_users(id);

-- =====================================================
-- INDEXES FOR NEW TABLES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_payment_collections_customer_id ON payment_collections(customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_inventory_transfer_items_transfer_id ON inventory_transfer_items(transfer_id);
CREATE INDEX IF NOT EXISTS idx_system_users_auth_id ON system_users(auth_user_id);

COMMIT;
