import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

// Custom hook for managing products
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products')
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product: Database['public']['Tables']['products']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      setProducts((prev) => [...prev, data])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error adding product' }
    }
  }

  const updateProduct = async (id: string, updates: Database['public']['Tables']['products']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error updating product' }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProducts((prev) => prev.filter((p) => p.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error deleting product' }
    }
  }

  const updateStock = async (id: string, stockChange: number) => {
    try {
      const product = products.find((p) => p.id === id)
      if (!product) throw new Error('Product not found')

      const newStock = Math.max(0, product.stock + stockChange)
      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error updating stock' }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: fetchProducts,
  }
}

// Custom hook for managing categories
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching categories')
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name })
        .select()
        .single()

      if (error) throw error
      setCategories((prev) => [...prev, data])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error adding category' }
    }
  }

  const updateCategory = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error updating category' }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCategories((prev) => prev.filter((c) => c.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Error deleting category' }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}

// Custom hook for managing transactions
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchTransactions = async (limit = 50) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching transactions')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transaction: Database['public']['Tables']['transactions']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) throw error
      setTransactions((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error creating transaction' }
    }
  }

  const createTransactionWithItems = async (
    transaction: Database['public']['Tables']['transactions']['Insert'],
    items: Array<{
      product_id: string
      quantity: number
      price: number
      unit_type: 'retail' | 'wholesale'
    }>
  ) => {
    try {
      // Start a transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()

      if (transactionError) throw transactionError

      // Insert transaction items
      const transactionItems = items.map((item) => ({
        transaction_id: transactionData.id,
        ...item,
      }))

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          p_product_id: item.product_id,
          p_quantity_sold: item.quantity,
        })

        if (stockError) console.error('Error updating stock:', stockError)
      }

      setTransactions((prev) => [transactionData, ...prev])
      return { data: transactionData, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Error creating transaction' }
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    createTransactionWithItems,
    refetch: fetchTransactions,
  }
}

// Helper function to format products for the POS system
export function formatProductsForPOS(products: Product[]) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    price: Number(product.price_retail),
    image: product.image_url || '/placeholder.svg',
    category: product.category_id, // You'll need to join with categories table
    baseUnit: product.unit,
    cost: Number(product.cost),
    units: [
      { 
        name: product.unit, 
        conversionFactor: 1, 
        price: Number(product.price_retail), 
        isBase: true, 
        type: 'retail' as const 
      },
      ...(product.price_wholesale ? [{
        name: 'wholesale',
        conversionFactor: 1,
        price: Number(product.price_wholesale),
        isBase: false,
        type: 'wholesale' as const
      }] : [])
    ],
  }))
}
