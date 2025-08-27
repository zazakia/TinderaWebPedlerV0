import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all customers with optional location filter
  const fetchCustomers = async (locationId?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }

      const { data, error } = await query

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  // Create a new customer with location support
  const createCustomer = async (customer: CustomerInsert) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()

      if (error) throw error

      await fetchCustomers() // Refresh the customers list
      return { success: true, data }
    } catch (err) {
      console.error('Error creating customer:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create customer' }
    }
  }

  // Update a customer
  const updateCustomer = async (id: string, updates: CustomerUpdate) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await fetchCustomers() // Refresh the customers list
      return { success: true }
    } catch (err) {
      console.error('Error updating customer:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update customer' }
    }
  }

  // Delete a customer (soft delete)
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      await fetchCustomers() // Refresh the customers list
      return { success: true }
    } catch (err) {
      console.error('Error deleting customer:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete customer' }
    }
  }

  // Get customers with outstanding balance with optional location filter
  const getCustomersWithBalance = async (locationId?: string) => {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .gt('current_balance', 0)
        .eq('is_active', true)
        .order('current_balance', { ascending: false })

      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching customers with balance:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch customers with balance' }
    }
  }

  // Record credit payment
  const recordCreditPayment = async (customerId: string, amount: number, paymentMethod: string, transactionId?: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('credit_payments')
        .insert({
          customer_id: customerId,
          transaction_id: transactionId,
          amount,
          payment_method: paymentMethod,
          notes
        })

      if (error) throw error

      await fetchCustomers() // Refresh to get updated balance
      return { success: true }
    } catch (err) {
      console.error('Error recording credit payment:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to record credit payment' }
    }
  }

  // Get customer transaction history
  const getCustomerTransactions = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching customer transactions:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch customer transactions' }
    }
  }

  // Get customer credit payments
  const getCustomerCreditPayments = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('credit_payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      console.error('Error fetching customer credit payments:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch customer credit payments' }
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          fetchCustomers()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'credit_payments' },
        () => {
          fetchCustomers() // Refresh when credit payments are made
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomersWithBalance,
    recordCreditPayment,
    getCustomerTransactions,
    getCustomerCreditPayments
  }
}
