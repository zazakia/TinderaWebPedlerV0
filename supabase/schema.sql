-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  price_retail DECIMAL(10, 2) NOT NULL,
  price_wholesale DECIMAL(10, 2),
  cost DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create transaction_items table for better normalization
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit_type TEXT CHECK (unit_type IN ('retail', 'wholesale')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product_id ON transaction_items(product_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your auth requirements)
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON categories FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON categories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON transactions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON transaction_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON transaction_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON transaction_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON transaction_items FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('Electronics'),
  ('Groceries'),
  ('Clothing'),
  ('Home & Garden'),
  ('Books'),
  ('Toys'),
  ('Sports'),
  ('Health & Beauty')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, sku, category_id, price_retail, price_wholesale, cost, stock, unit) 
SELECT 
  'Wireless Mouse',
  'Ergonomic wireless mouse with USB receiver',
  'ELEC001',
  id,
  29.99,
  24.99,
  15.00,
  50,
  'pcs'
FROM categories WHERE name = 'Electronics'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, sku, category_id, price_retail, price_wholesale, cost, stock, unit) 
SELECT 
  'USB-C Cable',
  'Fast charging USB-C cable, 2 meters',
  'ELEC002',
  id,
  12.99,
  9.99,
  5.00,
  100,
  'pcs'
FROM categories WHERE name = 'Electronics'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, sku, category_id, price_retail, price_wholesale, cost, stock, unit) 
SELECT 
  'Organic Rice',
  'Premium organic jasmine rice',
  'GROC001',
  id,
  8.99,
  7.49,
  4.00,
  200,
  'kg'
FROM categories WHERE name = 'Groceries'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, sku, category_id, price_retail, price_wholesale, cost, stock, unit) 
SELECT 
  'T-Shirt',
  'Cotton blend comfortable t-shirt',
  'CLTH001',
  id,
  19.99,
  14.99,
  8.00,
  75,
  'pcs'
FROM categories WHERE name = 'Clothing'
ON CONFLICT (sku) DO NOTHING;
