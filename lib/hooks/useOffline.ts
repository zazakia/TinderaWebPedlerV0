import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// Define types for offline data
interface OfflineTransactionItem {
  product_id: string
  quantity: number
  price: number
  unit_type: 'retail' | 'wholesale'
}

interface OfflineTransaction {
  id: string
  items: OfflineTransactionItem[]
  subtotal: number
  tax: number
  discount: number
  service_fee: number
  delivery_fee: number
  total: number
  payment_method: string
  status: 'pending' | 'synced' | 'failed'
  timestamp: number
  customer_id?: string
  is_credit?: boolean
  notes?: string
  receipt_number?: string
}

interface OfflineProduct {
  id: string
  name: string
  description: string | null
  sku: string
  category_id: string | null
  price_retail: number
  price_wholesale: number | null
  cost: number
  stock: number
  unit: string
  image_url: string | null
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [offlineTransactions, setOfflineTransactions] = useState<OfflineTransaction[]>([])
  const [offlineProducts, setOfflineProducts] = useState<OfflineProduct[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)

  const supabase = createClient()

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load offline data from localStorage
  useEffect(() => {
    const loadOfflineData = () => {
      try {
        const transactions = localStorage.getItem('offline_transactions')
        const products = localStorage.getItem('offline_products')
        
        if (transactions) {
          setOfflineTransactions(JSON.parse(transactions))
        }
        
        if (products) {
          setOfflineProducts(JSON.parse(products))
        }
      } catch (error) {
        console.error('Error loading offline data:', error)
      }
    }

    loadOfflineData()
  }, [])

  // Save offline data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('offline_transactions', JSON.stringify(offlineTransactions))
    } catch (error) {
      console.error('Error saving offline transactions:', error)
    }
  }, [offlineTransactions])

  useEffect(() => {
    try {
      localStorage.setItem('offline_products', JSON.stringify(offlineProducts))
    } catch (error) {
      console.error('Error saving offline products:', error)
    }
  }, [offlineProducts])

  // Add offline transaction
  const addOfflineTransaction = (transaction: Omit<OfflineTransaction, 'id' | 'timestamp' | 'status'>) => {
    const newTransaction: OfflineTransaction = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...transaction,
      timestamp: Date.now(),
      status: 'pending'
    }

    setOfflineTransactions(prev => [...prev, newTransaction])
    return newTransaction
  }

  // Add offline product
  const addOfflineProduct = (product: Omit<OfflineProduct, 'id'>) => {
    const newProduct: OfflineProduct = {
      id: `offline-product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...product
    }

    setOfflineProducts(prev => [...prev, newProduct])
    return newProduct
  }

  // Update offline product
  const updateOfflineProduct = (id: string, updates: Partial<OfflineProduct>) => {
    setOfflineProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    )
  }

  // Remove offline product
  const removeOfflineProduct = (id: string) => {
    setOfflineProducts(prev => prev.filter(product => product.id !== id))
  }

  // Generate receipt number
  const generateReceiptNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `R${year}${month}${day}${random}`
  }

  // Sync a single transaction with the server
  const syncTransaction = async (transaction: OfflineTransaction) => {
    try {
      // Generate receipt number if not exists
      const receiptNumber = transaction.receipt_number || generateReceiptNumber()
      
      // Create the transaction in the database
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          receipt_number: receiptNumber,
          items: transaction.items,
          subtotal: transaction.subtotal,
          tax: transaction.tax,
          discount: transaction.discount,
          service_fee: transaction.service_fee,
          delivery_fee: transaction.delivery_fee,
          total: transaction.total,
          payment_method: transaction.payment_method,
          status: 'completed',
          customer_id: transaction.customer_id,
          is_credit: transaction.is_credit,
          notes: transaction.notes
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create transaction items
      if (transactionData && transaction.items.length > 0) {
        const transactionItems = transaction.items.map(item => ({
          transaction_id: transactionData.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          unit_type: item.unit_type
        }))

        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(transactionItems)

        if (itemsError) throw itemsError

        // Update product stock
        for (const item of transaction.items) {
          const { error: stockError } = await supabase
            .rpc('update_product_stock', {
              p_product_id: item.product_id,
              p_quantity_sold: item.quantity
            })

          if (stockError) {
            console.warn('Failed to update stock for product:', item.product_id, stockError)
            // Continue with other items even if one fails
          }
        }
      }

      return { success: true, transactionId: transactionData?.id }
    } catch (error) {
      console.error('Error syncing transaction:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Sync offline data with server
  const syncOfflineData = async () => {
    if (isSyncing || !isOnline) return

    setIsSyncing(true)
    setSyncStatus('syncing')
    setSyncError(null)
    
    try {
      // Sync pending transactions
      const pendingTransactions = offlineTransactions.filter(t => t.status === 'pending')
      let syncedCount = 0
      let failedCount = 0
      
      for (const transaction of pendingTransactions) {
        try {
          const result = await syncTransaction(transaction)
          
          if (result.success) {
            // Update transaction status to synced
            setOfflineTransactions(prev => 
              prev.map(t => 
                t.id === transaction.id ? { ...t, status: 'synced' } : t
              )
            )
            syncedCount++
          } else {
            // Update transaction status to failed
            setOfflineTransactions(prev => 
              prev.map(t => 
                t.id === transaction.id ? { ...t, status: 'failed' } : t
              )
            )
            failedCount++
          }
        } catch (error) {
          console.error('Error syncing transaction:', error)
          // Update transaction status to failed
          setOfflineTransactions(prev => 
            prev.map(t => 
              t.id === transaction.id ? { ...t, status: 'failed' } : t
            )
          )
          failedCount++
        }
      }
      
      // Sync offline products
      // In a real implementation, this would sync products with the server
      
      setSyncStatus('success')
      console.log(`Offline sync completed: ${syncedCount} synced, ${failedCount} failed`)
    } catch (error) {
      console.error('Error during offline sync:', error)
      setSyncStatus('error')
      setSyncError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsSyncing(false)
    }
  }

  // Clear synced transactions
  const clearSyncedTransactions = () => {
    setOfflineTransactions(prev => prev.filter(t => t.status !== 'synced'))
  }

  // Get sync statistics
  const getSyncStats = () => {
    const pending = offlineTransactions.filter(t => t.status === 'pending').length
    const synced = offlineTransactions.filter(t => t.status === 'synced').length
    const failed = offlineTransactions.filter(t => t.status === 'failed').length
    
    return { pending, synced, failed, total: offlineTransactions.length }
  }

  // Retry failed transactions
  const retryFailedTransactions = async () => {
    const failedTransactions = offlineTransactions.filter(t => t.status === 'failed')
    
    for (const transaction of failedTransactions) {
      try {
        setOfflineTransactions(prev => 
          prev.map(t => 
            t.id === transaction.id ? { ...t, status: 'pending' } : t
          )
        )
      } catch (error) {
        console.error('Error retrying transaction:', error)
      }
    }
  }

  return {
    isOnline,
    isSyncing,
    syncStatus,
    syncError,
    offlineTransactions,
    offlineProducts,
    addOfflineTransaction,
    addOfflineProduct,
    updateOfflineProduct,
    removeOfflineProduct,
    syncOfflineData,
    clearSyncedTransactions,
    getSyncStats,
    retryFailedTransactions
  }
}