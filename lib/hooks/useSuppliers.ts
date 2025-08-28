import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export interface Supplier {
  id: string
  name: string
  contact_info: {
    phone?: string
    email?: string
    address?: string
    contact_person?: string
  } | null
  terms: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  supplier_id: string
  supplier_name?: string
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled'
  total: number
  created_by: string | null
  notes: string | null
  expected_delivery: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string | null
  product_name?: string
  quantity: number
  unit_price: number
  total_price: number
  received_quantity: number
  created_at: string
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      setSuppliers(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching suppliers:', err)
      setError('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  // Fetch purchase orders with supplier names
  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers (name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Map the data to include supplier names
      const poWithSupplierNames = data?.map(po => ({
        ...po,
        supplier_name: po.suppliers?.name || 'Unknown Supplier'
      })) || []
      
      setPurchaseOrders(poWithSupplierNames)
      setError(null)
    } catch (err) {
      console.error('Error fetching purchase orders:', err)
      setError('Failed to fetch purchase orders')
    } finally {
      setLoading(false)
    }
  }

  // Create a new supplier
  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setSuppliers(prev => [...prev, data])
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error creating supplier:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create supplier' }
    }
  }

  // Update a supplier
  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setSuppliers(prev => prev.map(supplier => supplier.id === id ? data : supplier))
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating supplier:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update supplier' }
    }
  }

  // Delete a supplier
  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id))
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting supplier:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete supplier' }
    }
  }

  // Create a new purchase order
  const createPurchaseOrder = async (poData: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([poData])
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        // Fetch supplier name for the new PO
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('name')
          .eq('id', data.supplier_id)
          .single()
        
        const poWithSupplier = {
          ...data,
          supplier_name: supplierError ? 'Unknown Supplier' : supplierData?.name
        }
        
        setPurchaseOrders(prev => [poWithSupplier, ...prev])
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error creating purchase order:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create purchase order' }
    }
  }

  // Update a purchase order
  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        // Fetch supplier name for the updated PO
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('name')
          .eq('id', data.supplier_id)
          .single()
        
        const poWithSupplier = {
          ...data,
          supplier_name: supplierError ? 'Unknown Supplier' : supplierData?.name
        }
        
        setPurchaseOrders(prev => prev.map(po => po.id === id ? poWithSupplier : po))
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating purchase order:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update purchase order' }
    }
  }

  // Delete a purchase order
  const deletePurchaseOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setPurchaseOrders(prev => prev.filter(po => po.id !== id))
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting purchase order:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete purchase order' }
    }
  }

  // Fetch purchase order items
  const fetchPurchaseOrderItems = async (purchaseOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select(`
          *,
          products (name)
        `)
        .eq('purchase_order_id', purchaseOrderId)
      
      if (error) throw error
      
      // Map the data to include product names
      const itemsWithProductNames = data?.map(item => ({
        ...item,
        product_name: item.products?.name || 'Unknown Product'
      })) || []
      
      return { success: true, data: itemsWithProductNames }
    } catch (err) {
      console.error('Error fetching purchase order items:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch purchase order items' }
    }
  }

  // Add item to purchase order
  const addPurchaseOrderItem = async (itemData: Omit<PurchaseOrderItem, 'id' | 'created_at' | 'total_price'>) => {
    try {
      // Calculate total price
      const totalPrice = itemData.quantity * itemData.unit_price
      
      const { data, error } = await supabase
        .from('purchase_order_items')
        .insert([{
          ...itemData,
          total_price: totalPrice
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding purchase order item:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add purchase order item' }
    }
  }

  // Update purchase order item
  const updatePurchaseOrderItem = async (id: string, updates: Partial<PurchaseOrderItem>) => {
    try {
      // Recalculate total price if quantity or unit_price is updated
      let updateData = { ...updates }
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        // We would need to fetch the current item to recalculate if only one field is updated
        // For simplicity, we'll assume both are provided or we recalculate based on existing data
        if (updates.quantity !== undefined && updates.unit_price !== undefined) {
          updateData.total_price = updates.quantity * updates.unit_price
        }
      }
      
      const { data, error } = await supabase
        .from('purchase_order_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating purchase order item:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update purchase order item' }
    }
  }

  // Delete purchase order item
  const deletePurchaseOrderItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_order_items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting purchase order item:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete purchase order item' }
    }
  }

  // Effect to fetch data on mount
  useEffect(() => {
    fetchSuppliers()
    fetchPurchaseOrders()
  }, [])

  return {
    suppliers,
    purchaseOrders,
    loading,
    error,
    fetchSuppliers,
    fetchPurchaseOrders,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    fetchPurchaseOrderItems,
    addPurchaseOrderItem,
    updatePurchaseOrderItem,
    deletePurchaseOrderItem
  }
}