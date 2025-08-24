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
-- Function to update product stock after a sale
CREATE OR REPLACE FUNCTION update_product_stock(
  p_product_id UUID,
  p_quantity_sold INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_quantity_sold,
      updated_at = now()
  WHERE id = p_product_id
    AND stock >= p_quantity_sold;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get product with category name
CREATE OR REPLACE FUNCTION get_products_with_categories()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  sku TEXT,
  category_id UUID,
  category_name TEXT,
  price_retail DECIMAL,
  price_wholesale DECIMAL,
  cost DECIMAL,
  stock INTEGER,
  unit TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.sku,
    p.category_id,
    c.name as category_name,
    p.price_retail,
    p.price_wholesale,
    p.cost,
    p.stock,
    p.unit,
    p.image_url,
    p.created_at,
    p.updated_at
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales summary
CREATE OR REPLACE FUNCTION get_sales_summary(
  p_start_date TIMESTAMPTZ DEFAULT now() - interval '30 days',
  p_end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  total_sales DECIMAL,
  total_transactions BIGINT,
  average_transaction_value DECIMAL,
  top_product_id UUID,
  top_product_name TEXT,
  top_product_sales INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH transaction_summary AS (
    SELECT 
      COALESCE(SUM(total), 0) as total_sales,
      COUNT(*) as total_transactions,
      CASE 
        WHEN COUNT(*) > 0 THEN SUM(total) / COUNT(*)
        ELSE 0
      END as avg_transaction
    FROM transactions
    WHERE created_at BETWEEN p_start_date AND p_end_date
      AND status = 'completed'
  ),
  top_product AS (
    SELECT 
      ti.product_id,
      p.name,
      SUM(ti.quantity)::INTEGER as total_quantity
    FROM transaction_items ti
    JOIN transactions t ON ti.transaction_id = t.id
    JOIN products p ON ti.product_id = p.id
    WHERE t.created_at BETWEEN p_start_date AND p_end_date
      AND t.status = 'completed'
    GROUP BY ti.product_id, p.name
    ORDER BY total_quantity DESC
    LIMIT 1
  )
  SELECT 
    ts.total_sales,
    ts.total_transactions,
    ts.avg_transaction,
    tp.product_id,
    tp.name,
    tp.total_quantity
  FROM transaction_summary ts
  CROSS JOIN top_product tp;
END;
$$ LANGUAGE plpgsql;

-- Function to check low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  stock INTEGER,
  category_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock,
    c.name as category_name
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.stock <= threshold
  ORDER BY p.stock ASC, p.name;
END;
$$ LANGUAGE plpgsql;
