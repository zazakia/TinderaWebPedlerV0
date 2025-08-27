import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
type ProductUnit = Database['public']['Tables']['product_units']['Row']
type ProductGroup = Database['public']['Tables']['product_groups']['Row']

export interface ProductWithDetails extends Product {
  units?: ProductUnit[]
  product_group?: ProductGroup | null
}

export function useProducts() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all products with their units and groups
  const fetchProducts = async (locationId?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch products with their product groups
      let query = supabase
        .from('products')
        .select(`
          *,
          product_group:product_groups(*)
        `)
        .eq('is_active', true)
        .order('name')
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }
      
      const { data: productsData, error: productsError } = await query

      if (productsError) throw productsError

      // Fetch product units for all products
      const { data: unitsData, error: unitsError } = await supabase
        .from('product_units')
        .select('*')
        .order('display_order')

      if (unitsError) throw unitsError

      // Combine products with their units
      const productsWithUnits = productsData?.map(product => ({
        ...product,
        units: unitsData?.filter(unit => unit.product_id === product.id) || []
      })) || []

      setProducts(productsWithUnits)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Create a new product
  const createProduct = async (product: ProductInsert, units?: Omit<ProductUnit, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]) => {
    try {
      // Generate SKU if not provided
      if (!product.sku) {
        product.sku = `PRD${Date.now()}`
      }

      // Insert product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (productError) throw productError

      // Insert units if provided
      if (units && units.length > 0 && newProduct) {
        const unitsToInsert = units.map(unit => ({
          ...unit,
          product_id: newProduct.id
        }))

        const { error: unitsError } = await supabase
          .from('product_units')
          .insert(unitsToInsert)

        if (unitsError) throw unitsError
      }

      await fetchProducts() // Refresh the products list
      return { success: true, data: newProduct }
    } catch (err) {
      console.error('Error creating product:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create product' }
    }
  }

  // Update a product
  const updateProduct = async (id: string, updates: ProductUpdate) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await fetchProducts() // Refresh the products list
      return { success: true }
    } catch (err) {
      console.error('Error updating product:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update product' }
    }
  }

  // Delete a product (soft delete by setting is_active to false)
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      await fetchProducts() // Refresh the products list
      return { success: true }
    } catch (err) {
      console.error('Error deleting product:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete product' }
    }
  }

  // Update product stock
  const updateStock = async (productId: string, quantity: number, adjustmentType: 'add' | 'remove' | 'set' = 'set') => {
    try {
      if (adjustmentType === 'set') {
        const { error } = await supabase
          .from('products')
          .update({ stock: quantity })
          .eq('id', productId)

        if (error) throw error
      } else {
        // Get current stock
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single()

        if (fetchError) throw fetchError

        const newStock = adjustmentType === 'add' 
          ? (product.stock + quantity)
          : Math.max(0, product.stock - quantity)

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', productId)

        if (updateError) throw updateError

        // Record the adjustment
        const { error: adjustmentError } = await supabase
          .from('inventory_adjustments')
          .insert({
            product_id: productId,
            adjustment_type: adjustmentType,
            quantity: quantity,
            reason: `Manual ${adjustmentType}`
          })

        if (adjustmentError) throw adjustmentError
      }

      await fetchProducts() // Refresh the products list
      return { success: true }
    } catch (err) {
      console.error('Error updating stock:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update stock' }
    }
  }

  // Get low stock products
  const getLowStockProducts = async (threshold?: number) => {
    try {
      const { data, error } = await supabase
        .rpc('get_low_stock_products', { threshold: threshold || 10 })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching low stock products:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch low stock products' }
    }
  }

  // Update product units
  const updateProductUnits = async (productId: string, units: Omit<ProductUnit, 'id' | 'product_id' | 'created_at' | 'updated_at'>[]) => {
    try {
      // Delete existing units
      const { error: deleteError } = await supabase
        .from('product_units')
        .delete()
        .eq('product_id', productId)

      if (deleteError) throw deleteError

      // Insert new units
      if (units.length > 0) {
        const unitsToInsert = units.map(unit => ({
          ...unit,
          product_id: productId
        }))

        const { error: insertError } = await supabase
          .from('product_units')
          .insert(unitsToInsert)

        if (insertError) throw insertError
      }

      await fetchProducts() // Refresh the products list
      return { success: true }
    } catch (err) {
      console.error('Error updating product units:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update product units' }
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProducts()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_units' },
        () => {
          fetchProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getLowStockProducts,
    updateProductUnits
  }
}
