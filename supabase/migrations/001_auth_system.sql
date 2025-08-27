-- Authentication and User Management Schema Migration
-- This extends the existing database with user management capabilities

-- Create user_profiles table for storing user information
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'inventory')),
    location_id UUID REFERENCES locations(id),
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table for multi-location support
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    manager_id UUID,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_permissions table for granular permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    permission_name TEXT NOT NULL,
    resource TEXT,
    granted_by UUID REFERENCES user_profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, permission_name, resource)
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info TEXT,
    ip_address INET,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table for audit trails
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permission_templates table for role-based permission templates
CREATE TABLE IF NOT EXISTS permission_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL UNIQUE,
    permissions JSONB DEFAULT '[]',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for location manager
ALTER TABLE locations 
ADD CONSTRAINT IF NOT EXISTS fk_locations_manager 
FOREIGN KEY (manager_id) REFERENCES user_profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permission_templates_updated_at ON permission_templates;
CREATE TRIGGER update_permission_templates_updated_at
    BEFORE UPDATE ON permission_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role = 'admin'
        )
    );

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role = 'admin'
        )
    );

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own logs" ON activity_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role = 'admin'
        )
    );

-- RLS Policies for permission_templates
CREATE POLICY "Everyone can view permission templates" ON permission_templates
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage permission templates" ON permission_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id::text = auth.uid()::text 
            AND up.role = 'admin'
        )
    );

-- Insert default admin user (for initial setup)
-- Note: This user will need to be properly linked with Supabase auth
INSERT INTO user_profiles (id, email, full_name, role, is_active) 
VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin@demo.com',
    'System Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default location
INSERT INTO locations (id, name, address, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111'::uuid,
    'Main Store',
    '123 Main Street, City, Country',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default permission templates
INSERT INTO permission_templates (role, permissions, description) VALUES
('admin', '["*"]', 'Full system access'),
('manager', '["pos", "inventory", "products", "reports", "customers", "transactions", "analytics"]', 'Store manager with broad access'),
('cashier', '["pos", "products", "customers"]', 'Cashier with transaction access'),
('inventory', '["inventory", "products", "suppliers"]', 'Inventory manager')
ON CONFLICT (role) DO UPDATE SET 
    permissions = EXCLUDED.permissions,
    description = EXCLUDED.description;

-- Create view for user profiles with location info
CREATE OR REPLACE VIEW user_profiles_with_location AS
SELECT 
    up.*,
    l.name as location_name,
    l.address as location_address
FROM user_profiles up
LEFT JOIN locations l ON up.location_id = l.id;

-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name, role) 
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'cashier')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create user profile on signup
-- Note: This would typically be set up in Supabase auth hooks