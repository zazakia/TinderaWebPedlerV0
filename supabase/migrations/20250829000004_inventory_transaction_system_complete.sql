-- =====================================================
-- INVENTORY TRANSACTION SYSTEM - COMPLETE DATABASE SCHEMA
-- Migration: 20250829000004_inventory_transaction_system_complete.sql
-- Purpose: Implement complete inventory transaction framework
-- =====================================================

-- =====================================================
-- 1. RECEIVING VOUCHERS SYSTEM
-- =====================================================

-- Main receiving voucher header table
CREATE TABLE IF NOT EXISTS receiving_vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(100),
    receiving_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number VARCHAR(100), -- PO number, delivery receipt, etc.
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
    total_amount DECIMAL(15,2) DEFAULT 0,
    received_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receiving voucher line items
CREATE TABLE IF NOT EXISTS receiving_voucher_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receiving_voucher_id UUID NOT NULL REFERENCES receiving_vouchers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
    quantity_received DECIMAL(10,3) NOT NULL CHECK (quantity_received > 0),
    cost_price DECIMAL(15,2) NOT NULL CHECK (cost_price >= 0),
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity_received * cost_price) STORED,
    expiry_date DATE,
    batch_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SALES RETURNS SYSTEM
-- =====================================================

-- Customer sales return header table
CREATE TABLE IF NOT EXISTS sales_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number VARCHAR(50) UNIQUE NOT NULL,
    original_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_reason VARCHAR(20) NOT NULL DEFAULT 'defective'
        CHECK (return_reason IN ('defective', 'wrong_item', 'customer_request', 'expired', 'damaged', 'other')),
    return_reason_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'cancelled')),
    total_refund_amount DECIMAL(15,2) DEFAULT 0,
    refund_method VARCHAR(20) DEFAULT 'cash'
        CHECK (refund_method IN ('cash', 'credit', 'exchange', 'store_credit')),
    processed_by VARCHAR(100),
    approved_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales return line items
CREATE TABLE IF NOT EXISTS sales_return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_return_id UUID NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
    quantity_returned DECIMAL(10,3) NOT NULL CHECK (quantity_returned > 0),
    original_unit_price DECIMAL(15,2) NOT NULL CHECK (original_unit_price >= 0),
    refund_unit_price DECIMAL(15,2) NOT NULL CHECK (refund_unit_price >= 0),
    total_refund DECIMAL(15,2) GENERATED ALWAYS AS (quantity_returned * refund_unit_price) STORED,
    condition_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SUPPLIER RETURNS SYSTEM
-- =====================================================

-- Return to supplier header table
CREATE TABLE IF NOT EXISTS supplier_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_contact VARCHAR(100),
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_reason VARCHAR(20) NOT NULL DEFAULT 'defective'
        CHECK (return_reason IN ('defective', 'wrong_delivery', 'expired', 'damaged', 'overstock', 'other')),
    return_reason_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'returned', 'credit_received', 'cancelled')),
    total_return_amount DECIMAL(15,2) DEFAULT 0,
    credit_memo_number VARCHAR(100),
    processed_by VARCHAR(100),
    approved_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplier return line items
CREATE TABLE IF NOT EXISTS supplier_return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_return_id UUID NOT NULL REFERENCES supplier_returns(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
    quantity_returned DECIMAL(10,3) NOT NULL CHECK (quantity_returned > 0),
    cost_price DECIMAL(15,2) NOT NULL CHECK (cost_price >= 0),
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (quantity_returned * cost_price) STORED,
    batch_number VARCHAR(100),
    condition_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. INVENTORY TRANSFERS SYSTEM (Multi-location)
-- =====================================================

-- Locations/Branches/Warehouses
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_code VARCHAR(20) UNIQUE NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    location_type VARCHAR(20) DEFAULT 'branch' CHECK (location_type IN ('branch', 'warehouse', 'storage')),
    address TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default main location
INSERT INTO locations (location_code, location_name, location_type)
VALUES ('MAIN', 'Main Store', 'branch')
ON CONFLICT (location_code) DO NOTHING;

-- Inventory transfer header table
CREATE TABLE IF NOT EXISTS inventory_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    to_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_transit', 'received', 'cancelled')),
    transfer_type VARCHAR(20) DEFAULT 'branch_transfer'
        CHECK (transfer_type IN ('branch_transfer', 'warehouse_transfer', 'adjustment_transfer')),
    requested_by VARCHAR(100),
    approved_by VARCHAR(100),
    shipped_by VARCHAR(100),
    received_by VARCHAR(100),
    shipping_date DATE,
    received_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);

-- Inventory transfer line items
CREATE TABLE IF NOT EXISTS inventory_transfer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_transfer_id UUID NOT NULL REFERENCES inventory_transfers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
    quantity_requested DECIMAL(10,3) NOT NULL CHECK (quantity_requested > 0),
    quantity_shipped DECIMAL(10,3) DEFAULT 0 CHECK (quantity_shipped >= 0),
    quantity_received DECIMAL(10,3) DEFAULT 0 CHECK (quantity_received >= 0),
    unit_cost DECIMAL(15,2) DEFAULT 0 CHECK (unit_cost >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. ENHANCED INVENTORY TRACKING SYSTEM
-- =====================================================

-- Location-based inventory tracking
CREATE TABLE IF NOT EXISTS inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
    current_stock DECIMAL(10,3) DEFAULT 0 CHECK (current_stock >= 0),
    reserved_stock DECIMAL(10,3) DEFAULT 0 CHECK (reserved_stock >= 0),
    available_stock DECIMAL(10,3) GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    reorder_level DECIMAL(10,3) DEFAULT 0,
    max_stock_level DECIMAL(10,3) DEFAULT 0,
    last_restock_date DATE,
    last_sale_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, location_id, unit_id)
);

-- Enhanced inventory transaction log for complete audit trail
CREATE TABLE IF NOT EXISTS inventory_transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES product_units(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'sale', 'return', 'receiving', 'adjustment_in', 'adjustment_out',
        'transfer_out', 'transfer_in', 'supplier_return', 'opening_balance'
    )),
    reference_type VARCHAR(30) NOT NULL CHECK (reference_type IN (
        'transaction', 'sales_return', 'receiving_voucher', 'inventory_adjustment',
        'inventory_transfer', 'supplier_return', 'opening_stock'
    )),
    reference_id UUID NOT NULL,
    quantity_change DECIMAL(10,3) NOT NULL, -- Positive for increases, negative for decreases
    quantity_before DECIMAL(10,3) NOT NULL CHECK (quantity_before >= 0),
    quantity_after DECIMAL(10,3) NOT NULL CHECK (quantity_after >= 0),
    unit_cost DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PAYMENT COLLECTIONS & CREDIT MANAGEMENT
-- =====================================================

-- Credit payment collections
CREATE TABLE IF NOT EXISTS payment_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(20) DEFAULT 'cash'
        CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'gcash', 'paymaya', 'other')),
    payment_reference VARCHAR(100), -- Check number, reference number, etc.
    amount_collected DECIMAL(15,2) NOT NULL CHECK (amount_collected > 0),
    discount_amount DECIMAL(15,2) DEFAULT 0 CHECK (discount_amount >= 0),
    net_collection DECIMAL(15,2) GENERATED ALWAYS AS (amount_collected - discount_amount) STORED,
    collected_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment allocation to specific credit transactions
CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_collection_id UUID NOT NULL REFERENCES payment_collections(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    allocated_amount DECIMAL(15,2) NOT NULL CHECK (allocated_amount > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. SYSTEM USERS & AUDIT TRAIL
-- =====================================================

-- System users for authentication and authorization
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'cashier'
        CHECK (role IN ('admin', 'manager', 'cashier', 'inventory_clerk')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES system_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES system_users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. AUTO-NUMBERING SEQUENCES
-- =====================================================

-- Create sequences for auto-numbering
CREATE SEQUENCE IF NOT EXISTS receiving_voucher_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS sales_return_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS supplier_return_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS transfer_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS collection_seq START 1001;

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Receiving vouchers indexes
CREATE INDEX IF NOT EXISTS idx_receiving_vouchers_date ON receiving_vouchers(receiving_date);
CREATE INDEX IF NOT EXISTS idx_receiving_vouchers_supplier ON receiving_vouchers(supplier_name);
CREATE INDEX IF NOT EXISTS idx_receiving_vouchers_status ON receiving_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_receiving_voucher_items_product ON receiving_voucher_items(product_id);

-- Sales returns indexes
CREATE INDEX IF NOT EXISTS idx_sales_returns_date ON sales_returns(return_date);
CREATE INDEX IF NOT EXISTS idx_sales_returns_customer ON sales_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_original_transaction ON sales_returns(original_transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_return_items_product ON sales_return_items(product_id);

-- Supplier returns indexes
CREATE INDEX IF NOT EXISTS idx_supplier_returns_date ON supplier_returns(return_date);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_supplier ON supplier_returns(supplier_name);
CREATE INDEX IF NOT EXISTS idx_supplier_return_items_product ON supplier_return_items(product_id);

-- Inventory transfers indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_date ON inventory_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_from_location ON inventory_transfers(from_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_to_location ON inventory_transfers(to_location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transfer_items_product ON inventory_transfer_items(product_id);

-- Inventory tracking indexes
CREATE INDEX IF NOT EXISTS idx_inventory_locations_product ON inventory_locations(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_location ON inventory_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_low_stock ON inventory_locations(current_stock) WHERE current_stock <= reorder_level;

-- Transaction log indexes
CREATE INDEX IF NOT EXISTS idx_inventory_log_product ON inventory_transaction_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_location ON inventory_transaction_log(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_type ON inventory_transaction_log(transaction_type);
CREATE INDEX IF NOT EXISTS idx_inventory_log_reference ON inventory_transaction_log(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_date ON inventory_transaction_log(created_at);

-- Payment collections indexes
CREATE INDEX IF NOT EXISTS idx_payment_collections_customer ON payment_collections(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_collections_date ON payment_collections(collection_date);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_transaction ON payment_allocations(transaction_id);

-- User management indexes
CREATE INDEX IF NOT EXISTS idx_system_users_role ON system_users(role);
CREATE INDEX IF NOT EXISTS idx_system_users_active ON system_users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_at);

-- =====================================================
-- 10. TRIGGERS FOR AUTOMATIC INVENTORY UPDATES
-- =====================================================

-- Function to update inventory locations after receiving voucher
CREATE OR REPLACE FUNCTION update_inventory_on_receiving()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if receiving voucher is marked as received
    IF NEW.status = 'received' AND (OLD.status IS NULL OR OLD.status != 'received') THEN
        -- Update inventory for each item in the receiving voucher
        INSERT INTO inventory_locations (product_id, location_id, unit_id, current_stock)
        SELECT
            rvi.product_id,
            (SELECT id FROM locations WHERE location_code = 'MAIN'),
            rvi.unit_id,
            rvi.quantity_received
        FROM receiving_voucher_items rvi
        WHERE rvi.receiving_voucher_id = NEW.id
        ON CONFLICT (product_id, location_id, unit_id)
        DO UPDATE SET
            current_stock = inventory_locations.current_stock + EXCLUDED.current_stock,
            updated_at = NOW();

        -- Log inventory transactions
        INSERT INTO inventory_transaction_log (
            product_id, location_id, unit_id, transaction_type, reference_type, reference_id,
            quantity_change, quantity_before, quantity_after, unit_cost
        )
        SELECT
            rvi.product_id,
            (SELECT id FROM locations WHERE location_code = 'MAIN'),
            rvi.unit_id,
            'receiving',
            'receiving_voucher',
            NEW.id,
            rvi.quantity_received,
            COALESCE(il.current_stock, 0) - rvi.quantity_received,
            COALESCE(il.current_stock, 0),
            rvi.cost_price
        FROM receiving_voucher_items rvi
        LEFT JOIN inventory_locations il ON il.product_id = rvi.product_id
            AND il.location_id = (SELECT id FROM locations WHERE location_code = 'MAIN')
            AND il.unit_id = rvi.unit_id
        WHERE rvi.receiving_voucher_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for receiving voucher status changes
DROP TRIGGER IF EXISTS trigger_receiving_voucher_inventory ON receiving_vouchers;
CREATE TRIGGER trigger_receiving_voucher_inventory
    AFTER INSERT OR UPDATE ON receiving_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_receiving();

-- Function to update inventory on sales returns
CREATE OR REPLACE FUNCTION update_inventory_on_sales_return()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if return is processed
    IF NEW.status = 'processed' AND (OLD.status IS NULL OR OLD.status != 'processed') THEN
        -- Add returned items back to inventory
        INSERT INTO inventory_locations (product_id, location_id, unit_id, current_stock)
        SELECT
            sri.product_id,
            (SELECT id FROM locations WHERE location_code = 'MAIN'),
            sri.unit_id,
            sri.quantity_returned
        FROM sales_return_items sri
        WHERE sri.sales_return_id = NEW.id
        ON CONFLICT (product_id, location_id, unit_id)
        DO UPDATE SET
            current_stock = inventory_locations.current_stock + EXCLUDED.current_stock,
            updated_at = NOW();

        -- Log inventory transactions
        INSERT INTO inventory_transaction_log (
            product_id, location_id, unit_id, transaction_type, reference_type, reference_id,
            quantity_change, quantity_before, quantity_after
        )
        SELECT
            sri.product_id,
            (SELECT id FROM locations WHERE location_code = 'MAIN'),
            sri.unit_id,
            'return',
            'sales_return',
            NEW.id,
            sri.quantity_returned,
            COALESCE(il.current_stock, 0) - sri.quantity_returned,
            COALESCE(il.current_stock, 0)
        FROM sales_return_items sri
        LEFT JOIN inventory_locations il ON il.product_id = sri.product_id
            AND il.location_id = (SELECT id FROM locations WHERE location_code = 'MAIN')
            AND il.unit_id = sri.unit_id
        WHERE sri.sales_return_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sales return processing
DROP TRIGGER IF EXISTS trigger_sales_return_inventory ON sales_returns;
CREATE TRIGGER trigger_sales_return_inventory
    AFTER INSERT OR UPDATE ON sales_returns
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_sales_return();

-- =====================================================
-- 11. STORED PROCEDURES FOR COMMON OPERATIONS
-- =====================================================

-- Function to get current inventory across all locations
CREATE OR REPLACE FUNCTION get_product_inventory(p_product_id UUID, p_unit_id UUID DEFAULT NULL)
RETURNS TABLE (
    location_id UUID,
    location_name VARCHAR,
    unit_id UUID,
    unit_name VARCHAR,
    current_stock DECIMAL,
    available_stock DECIMAL,
    reserved_stock DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        il.location_id,
        l.location_name,
        il.unit_id,
        pu.unit_name,
        il.current_stock,
        il.available_stock,
        il.reserved_stock
    FROM inventory_locations il
    JOIN locations l ON l.id = il.location_id
    JOIN product_units pu ON pu.id = il.unit_id
    WHERE il.product_id = p_product_id
    AND (p_unit_id IS NULL OR il.unit_id = p_unit_id)
    ORDER BY l.location_name, pu.unit_name;
END;
$$ LANGUAGE plpgsql;

-- Function to check stock availability before sale
CREATE OR REPLACE FUNCTION check_stock_availability(
    p_product_id UUID,
    p_unit_id UUID,
    p_quantity_needed DECIMAL,
    p_location_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    available_qty DECIMAL;
BEGIN
    -- Default to main location if not specified
    IF p_location_id IS NULL THEN
        SELECT id INTO p_location_id FROM locations WHERE location_code = 'MAIN';
    END IF;

    -- Get available stock
    SELECT COALESCE(available_stock, 0) INTO available_qty
    FROM inventory_locations
    WHERE product_id = p_product_id
    AND unit_id = p_unit_id
    AND location_id = p_location_id;

    RETURN COALESCE(available_qty, 0) >= p_quantity_needed;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE receiving_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiving_voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transaction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all inventory data (for now)
-- In production, you would create more granular policies
CREATE POLICY "Allow authenticated users to read inventory data" ON receiving_vouchers
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read receiving items" ON receiving_voucher_items
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read sales returns" ON sales_returns
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read return items" ON sales_return_items
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read supplier returns" ON supplier_returns
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read supplier return items" ON supplier_return_items
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read transfers" ON inventory_transfers
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read transfer items" ON inventory_transfer_items
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read locations" ON locations
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read inventory locations" ON inventory_locations
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read transaction log" ON inventory_transaction_log
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read payment collections" ON payment_collections
    FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read payment allocations" ON payment_allocations
    FOR ALL TO authenticated USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE receiving_vouchers IS 'Main table for tracking goods received from suppliers';
COMMENT ON TABLE sales_returns IS 'Customer return transactions that add items back to inventory';
COMMENT ON TABLE supplier_returns IS 'Return of goods to suppliers that reduce inventory';
COMMENT ON TABLE inventory_transfers IS 'Inter-location inventory transfers';
COMMENT ON TABLE inventory_locations IS 'Location-based inventory tracking with current stock levels';
COMMENT ON TABLE inventory_transaction_log IS 'Complete audit trail of all inventory movements';
COMMENT ON TABLE payment_collections IS 'Credit payment collections from customers';

-- Insert sample data for testing (optional)
-- This can be removed in production
INSERT INTO system_users (username, email, full_name, password_hash, role) VALUES
('admin', 'admin@tindahanko.com', 'System Administrator', '$2b$10$example_hash', 'admin'),
('manager', 'manager@tindahanko.com', 'Store Manager', '$2b$10$example_hash', 'manager'),
('cashier', 'cashier@tindahanko.com', 'Cashier User', '$2b$10$example_hash', 'cashier')
ON CONFLICT (username) DO NOTHING;
