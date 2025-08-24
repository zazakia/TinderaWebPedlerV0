# Supabase Database Setup Guide

## Overview
This POS mobile application is now integrated with Supabase for data persistence. Follow these steps to set up your database.

## Database Setup Instructions

### 1. Access Supabase Dashboard
Go to your Supabase project dashboard at: https://supabase.com/dashboard/project/cfsabfpjnigdcqwrqfxr

### 2. Run Database Schema
1. Navigate to the **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `/supabase/schema.sql`
4. Click **Run** to execute the SQL and create all tables with sample data

### 3. Run Database Functions
1. Still in the SQL Editor, create another new query
2. Copy and paste the contents of `/supabase/functions.sql`
3. Click **Run** to create the helper functions

### 4. Verify Setup
After running both SQL files, you should have:
- **Tables**: categories, products, transactions, transaction_items
- **Sample Data**: Categories and sample products
- **Functions**: update_product_stock, get_products_with_categories, get_sales_summary, get_low_stock_products

## Environment Variables
The following environment variables are already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://cfsabfpjnigdcqwrqfxr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema

### Categories Table
- `id`: UUID (Primary Key)
- `name`: Text (Unique)
- `created_at`: Timestamp

### Products Table
- `id`: UUID (Primary Key)
- `name`: Text
- `description`: Text (Optional)
- `sku`: Text (Unique)
- `category_id`: UUID (Foreign Key to categories)
- `price_retail`: Decimal
- `price_wholesale`: Decimal (Optional)
- `cost`: Decimal
- `stock`: Integer
- `unit`: Text (default: 'pcs')
- `image_url`: Text (Optional)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Transactions Table
- `id`: UUID (Primary Key)
- `items`: JSONB
- `subtotal`: Decimal
- `tax`: Decimal
- `discount`: Decimal
- `total`: Decimal
- `payment_method`: Text
- `status`: Text (default: 'completed')
- `created_at`: Timestamp

### Transaction Items Table
- `id`: UUID (Primary Key)
- `transaction_id`: UUID (Foreign Key to transactions)
- `product_id`: UUID (Foreign Key to products)
- `quantity`: Integer
- `price`: Decimal
- `unit_type`: Text ('retail' or 'wholesale')
- `created_at`: Timestamp

## Available Hooks

The application provides custom React hooks for database operations:

### useProducts()
- `products`: Array of products
- `loading`: Loading state
- `error`: Error message if any
- `addProduct()`: Add a new product
- `updateProduct()`: Update existing product
- `deleteProduct()`: Delete a product
- `updateStock()`: Update product stock
- `refetch()`: Refresh products list

### useCategories()
- `categories`: Array of categories
- `loading`: Loading state
- `error`: Error message if any
- `addCategory()`: Add a new category
- `updateCategory()`: Update category name
- `deleteCategory()`: Delete a category
- `refetch()`: Refresh categories list

### useTransactions()
- `transactions`: Array of transactions
- `loading`: Loading state
- `error`: Error message if any
- `createTransaction()`: Create a simple transaction
- `createTransactionWithItems()`: Create transaction with items and update stock
- `refetch()`: Refresh transactions list

## Usage Example

```typescript
import { useProducts, useCategories, useTransactions } from '@/lib/hooks/useSupabase'

function MyComponent() {
  const { products, loading, addProduct, updateStock } = useProducts()
  const { categories } = useCategories()
  const { createTransactionWithItems } = useTransactions()

  // Use the data and methods in your component
}
```

## Row Level Security (RLS)
Row Level Security is enabled on all tables with permissive policies for development. You should update these policies based on your authentication requirements before going to production.

## Next Steps
1. Run the application with `pnpm dev`
2. The app will automatically fetch data from Supabase
3. All CRUD operations will persist to the database
4. Transactions will automatically update product stock levels

## Troubleshooting
- If you see connection errors, verify your environment variables are correct
- Check the Supabase dashboard logs for any SQL errors
- Ensure RLS policies are properly configured
- Make sure all SQL scripts have been run successfully
