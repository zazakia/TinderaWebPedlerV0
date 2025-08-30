"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

// Types
interface InventoryLocation {
  id: string
  product_id: string
  location_id: string
  unit_id: string
  current_stock: number
  reserved_stock: number
  available_stock: number
  reorder_level: number
  last_restock_date?: string
  last_sale_date?: string
}

interface ReceivingVoucher {
  id: string
  voucher_number: string
  supplier_name: string
  supplier_contact?: string
  receiving_date: string
  reference_number?: string
  status: 'pending' | 'received' | 'cancelled'
  total_amount: number
  received_by?: string
  notes?: string
  items?: ReceivingVoucherItem[]
}

interface ReceivingVoucherItem {
  id: string
  receiving_voucher_id: string
  product_id: string
  unit_id: string
  quantity_received: number
  cost_price: number
  total_cost: number
  expiry_date?: string
  batch_number?: string
  notes?: string
}

interface SalesReturn {
  id: string
  return_number: string
  original_transaction_id?: string
  customer_id?: string
  customer_name?: string
  return_date: string
  return_reason: string
  return_reason_notes?: string
  status: 'pending' | 'processed' | 'cancelled'
  total_refund_amount: number
  refund_method: string
  processed_by?: string
  approved_by?: string
  notes?: string
  items?: SalesReturnItem[]
}

interface SalesReturnItem {
  id: string
  sales_return_id: string
  product_id: string
  unit_id: string
  quantity_returned: number
  original_unit_price: number
  refund_unit_price: number
  total_refund: number
  condition_notes?: string
}

interface InventoryTransaction {
  id: string
  product_id: string
  location_id: string
  unit_id: string
  transaction_type: string
  reference_type: string
  reference_id: string
  quantity_change: number
  quantity_before: number
  quantity_after: number
  unit_cost: number
  notes?: string
  created_by?: string
  created_at: string
}

// Hook for inventory locations
export function useInventoryLocations() {
  const [inventoryLocations, setInventoryLocations] = useState<InventoryLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInventoryLocations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory_locations')
        .select(`
          *,
          location:locations(location_name),
          product:products(name),
          unit:product_units(unit_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInventoryLocations(data || [])
      setError(null)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching inventory locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateInventoryLocation = async (
    productId: string,
    locationId: string,
    unitId: string,
    updates: Partial<InventoryLocation>
  ) => {
    try {
      const { data, error } = await supabase
        .from('inventory_locations')
        .upsert({
          product_id: productId,
          location_id: locationId,
          unit_id: unitId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) throw error
      await fetchInventoryLocations() // Refresh data
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchInventoryLocations()
  }, [])

  return {
    inventoryLocations,
    loading,
    error,
    refetch: fetchInventoryLocations,
    updateInventoryLocation
  }
}

// Hook for receiving vouchers
export function useReceivingVouchers() {
  const [receivingVouchers, setReceivingVouchers] = useState<ReceivingVoucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReceivingVouchers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('receiving_vouchers')
        .select(`
          *,
          items:receiving_voucher_items(
            *,
            product:products(name),
            unit:product_units(unit_name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReceivingVouchers(data || [])
      setError(null)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching receiving vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const createReceivingVoucher = async (voucherData: Partial<ReceivingVoucher> & { items: Partial<ReceivingVoucherItem>[] }) => {
    try {
      // Generate voucher number
      const { data: sequence } = await supabase.rpc('nextval', { sequence_name: 'receiving_voucher_seq' })
      const voucherNumber = `RV-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`

      // Create voucher header
      const { data: voucher, error: voucherError } = await supabase
        .from('receiving_vouchers')
        .insert({
          voucher_number: voucherNumber,
          supplier_name: voucherData.supplier_name,
          supplier_contact: voucherData.supplier_contact,
          receiving_date: voucherData.receiving_date || new Date().toISOString().split('T')[0],
          reference_number: voucherData.reference_number,
          status: voucherData.status || 'pending',
          total_amount: voucherData.items.reduce((sum, item) => sum + (item.quantity_received || 0) * (item.cost_price || 0), 0),
          received_by: voucherData.received_by,
          notes: voucherData.notes
        })
        .select()
        .single()

      if (voucherError) throw voucherError

      // Create voucher items
      if (voucherData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('receiving_voucher_items')
          .insert(
            voucherData.items.map(item => ({
              receiving_voucher_id: voucher.id,
              product_id: item.product_id,
              unit_id: item.unit_id,
              quantity_received: item.quantity_received,
              cost_price: item.cost_price,
              expiry_date: item.expiry_date,
              batch_number: item.batch_number,
              notes: item.notes
            }))
          )

        if (itemsError) throw itemsError
      }

      await fetchReceivingVouchers() // Refresh data
      return voucher
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const updateReceivingVoucher = async (id: string, updates: Partial<ReceivingVoucher>) => {
    try {
      const { data, error } = await supabase
        .from('receiving_vouchers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      await fetchReceivingVouchers() // Refresh data
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchReceivingVouchers()
  }, [])

  return {
    receivingVouchers,
    loading,
    error,
    refetch: fetchReceivingVouchers,
    createReceivingVoucher,
    updateReceivingVoucher
  }
}

// Hook for sales returns
export function useSalesReturns() {
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSalesReturns = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sales_returns')
        .select(`
          *,
          items:sales_return_items(
            *,
            product:products(name),
            unit:product_units(unit_name)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSalesReturns(data || [])
      setError(null)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching sales returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSalesReturn = async (returnData: Partial<SalesReturn> & { items: Partial<SalesReturnItem>[] }) => {
    try {
      // Generate return number
      const { data: sequence } = await supabase.rpc('nextval', { sequence_name: 'sales_return_seq' })
      const returnNumber = `SR-${new Date().getFullYear()}-${String(sequence).padStart(4, '0')}`

      // Create return header
      const { data: salesReturn, error: returnError } = await supabase
        .from('sales_returns')
        .insert({
          return_number: returnNumber,
          original_transaction_id: returnData.original_transaction_id,
          customer_id: returnData.customer_id,
          customer_name: returnData.customer_name,
          return_date: returnData.return_date || new Date().toISOString().split('T')[0],
          return_reason: returnData.return_reason || 'defective',
          return_reason_notes: returnData.return_reason_notes,
          status: returnData.status || 'pending',
          total_refund_amount: returnData.items.reduce((sum, item) => sum + (item.quantity_returned || 0) * (item.refund_unit_price || 0), 0),
          refund_method: returnData.refund_method || 'cash',
          processed_by: returnData.processed_by,
          approved_by: returnData.approved_by,
          notes: returnData.notes
        })
        .select()
        .single()

      if (returnError) throw returnError

      // Create return items
      if (returnData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('sales_return_items')
          .insert(
            returnData.items.map(item => ({
              sales_return_id: salesReturn.id,
              product_id: item.product_id,
              unit_id: item.unit_id,
              quantity_returned: item.quantity_returned,
              original_unit_price: item.original_unit_price,
              refund_unit_price: item.refund_unit_price,
              condition_notes: item.condition_notes
            }))
          )

        if (itemsError) throw itemsError
      }

      await fetchSalesReturns() // Refresh data
      return salesReturn
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const updateSalesReturn = async (id: string, updates: Partial<SalesReturn>) => {
    try {
      const { data, error } = await supabase
        .from('sales_returns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      await fetchSalesReturns() // Refresh data
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchSalesReturns()
  }, [])

  return {
    salesReturns,
    loading,
    error,
    refetch: fetchSalesReturns,
    createSalesReturn,
    updateSalesReturn
  }
}

// Hook for inventory transaction log
export function useInventoryTransactionLog() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async (filters?: {
    product_id?: string
    location_id?: string
    transaction_type?: string
    date_from?: string
    date_to?: string
  }) => {
    try {
      setLoading(true)
      let query = supabase
        .from('inventory_transaction_log')
        .select(`
          *,
          product:products(name),
          location:locations(location_name),
          unit:product_units(unit_name)
        `)

      // Apply filters
      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id)
      }
      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id)
      }
      if (filters?.transaction_type) {
        query = query.eq('transaction_type', filters.transaction_type)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1000) // Limit for performance

      if (error) throw error
      setTransactions(data || [])
      setError(null)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching inventory transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const logInventoryTransaction = async (transaction: Partial<InventoryTransaction>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transaction_log')
        .insert({
          product_id: transaction.product_id,
          location_id: transaction.location_id,
          unit_id: transaction.unit_id,
          transaction_type: transaction.transaction_type,
          reference_type: transaction.reference_type,
          reference_id: transaction.reference_id,
          quantity_change: transaction.quantity_change,
          quantity_before: transaction.quantity_before,
          quantity_after: transaction.quantity_after,
          unit_cost: transaction.unit_cost || 0,
          notes: transaction.notes,
          created_by: transaction.created_by
        })
        .select()

      if (error) throw error
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    logInventoryTransaction,
    fetchTransactions
  }
}

// Hook for locations
export function useLocations() {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('location_name', { ascending: true })

      if (error) throw error
      setLocations(data || [])
      setError(null)
    } catch (error: any) {
      setError(error.message)
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const createLocation = async (locationData: {
    location_code: string
    location_name: string
    location_type?: string
    address?: string
    contact_person?: string
    contact_phone?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert(locationData)
        .select()

      if (error) throw error
      await fetchLocations() // Refresh data
      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation
  }
}

// Comprehensive inventory operations hook
export function useInventoryOperations() {
  const { updateInventoryLocation } = useInventoryLocations()
  const { logInventoryTransaction } = useInventoryTransactionLog()

  const processInventoryChange = async (
    productId: string,
    unitId: string,
    quantityChange: number,
    transactionType: string,
    referenceType: string,
    referenceId: string,
    unitCost: number = 0,
    locationId?: string,
    notes?: string,
    createdBy?: string
  ) => {
    try {
      // Default to main location if not specified
      if (!locationId) {
        const { data: mainLocation } = await supabase
          .from('locations')
          .select('id')
          .eq('location_code', 'MAIN')
          .single()
        locationId = mainLocation?.id
      }

      // Get current inventory
      const { data: currentInventory } = await supabase
        .from('inventory_locations')
        .select('current_stock')
        .eq('product_id', productId)
        .eq('location_id', locationId)
        .eq('unit_id', unitId)
        .single()

      const quantityBefore = currentInventory?.current_stock || 0
      const quantityAfter = Math.max(0, quantityBefore + quantityChange)

      // Update inventory location
      await updateInventoryLocation(productId, locationId, unitId, {
        current_stock: quantityAfter,
        last_restock_date: quantityChange > 0 ? new Date().toISOString().split('T')[0] : undefined,
        last_sale_date: quantityChange < 0 ? new Date().toISOString().split('T')[0] : undefined
      })

      // Log the transaction
      await logInventoryTransaction({
        product_id: productId,
        location_id: locationId,
        unit_id: unitId,
        transaction_type: transactionType,
        reference_type: referenceType,
        reference_id: referenceId,
        quantity_change: quantityChange,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        unit_cost: unitCost,
        notes: notes,
        created_by: createdBy
      })

      return { quantityBefore, quantityAfter }
    } catch (error: any) {
      console.error('Error processing inventory change:', error)
      throw error
    }
  }

  return {
    processInventoryChange
  }
}
