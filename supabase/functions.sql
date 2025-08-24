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
