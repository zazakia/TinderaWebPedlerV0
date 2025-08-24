import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionItem = Database['public']['Tables']['transaction_items']['Row']

export interface TransactionWithItems extends Transaction {
  transaction_items?: TransactionItem[]
  customer?: Database['public']['Tables']['customers']['Row'] | null
}

export interface CartItem {
  product_id: string
  product_name: string
  quantity: number
  unit_name: string
  unit_price: number
  subtotal: number
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all transactions
  const fetchTransactions = async (limit = 50) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(*),
          transaction_items(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setTransactions(data || [])
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  // Create a new transaction
  const createTransaction = async (
    cartItems: CartItem[],
    paymentMethod: string,
    customerId?: string,
    isCredit: boolean = false,
    serviceFee: number = 0,
    deliveryFee: number = 0,
    discount: number = 0,
    tax: number = 0,
    notes?: string
  ) => {
    try {
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
      const total = subtotal + serviceFee + deliveryFee + tax - discount

      // Generate receipt number
      const { data: receiptNumber, error: receiptError } = await supabase
        .rpc('generate_receipt_number')

      if (receiptError) throw receiptError

      // Create transaction
      const transactionData: TransactionInsert = {
        customer_id: customerId,
        receipt_number: receiptNumber,
        items: cartItems, // Store as JSON for quick reference
        subtotal,
        tax,
        discount,
        service_fee: serviceFee,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        is_credit: isCredit,
        notes,
        status: 'completed'
      }

      const { data: newTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create transaction items for better reporting
      if (newTransaction) {
        const transactionItems = cartItems.map(item => ({
          transaction_id: newTransaction.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.unit_price,
          unit_type: 'retail' as const // You can determine this based on the unit selected
        }))

        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(transactionItems)

        if (itemsError) throw itemsError

        // Update product stock
        for (const item of cartItems) {
          await supabase.rpc('update_product_stock', {
            p_product_id: item.product_id,
            p_quantity_sold: item.quantity
          })
        }
      }

      await fetchTransactions() // Refresh the transactions list
      return { success: true, data: newTransaction }
    } catch (err) {
      console.error('Error creating transaction:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create transaction' }
    }
  }

  // Get transaction by ID
  const getTransaction = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(*),
          transaction_items(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching transaction:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch transaction' }
    }
  }

  // Get today's transactions
  const getTodayTransactions = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(*),
          transaction_items(*)
        `)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching today transactions:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch today transactions' }
    }
  }

  // Get sales summary
  const getSalesSummary = async (startDate?: Date, endDate?: Date) => {
    try {
      const { data, error } = await supabase
        .rpc('get_sales_summary', {
          p_start_date: startDate?.toISOString(),
          p_end_date: endDate?.toISOString()
        })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching sales summary:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch sales summary' }
    }
  }

  // Void/Cancel transaction
  const voidTransaction = async (id: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'voided',
          notes: reason ? `VOIDED: ${reason}` : 'VOIDED'
        })
        .eq('id', id)

      if (error) throw error

      // TODO: Restore product stock
      // This should be done via a database trigger or function

      await fetchTransactions() // Refresh the transactions list
      return { success: true }
    } catch (err) {
      console.error('Error voiding transaction:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to void transaction' }
    }
  }

  // Get transactions by date range
  const getTransactionsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(*),
          transaction_items(*)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching transactions by date range:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch transactions by date range' }
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchTransactions()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    getTransaction,
    getTodayTransactions,
    getSalesSummary,
    voidTransaction,
    getTransactionsByDateRange
  }
}
