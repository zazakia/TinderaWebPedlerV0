import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export interface SalesDataPoint {
  date: string
  revenue: number
  transactions: number
  items_sold: number
}

export interface ProductSalesData {
  product_id: string
  product_name: string
  quantity_sold: number
  revenue: number
}

export interface CategorySalesData {
  category_name: string
  revenue: number
  percentage: number
}

export interface CustomerSalesData {
  customer_id: string
  customer_name: string
  total_spent: number
  transaction_count: number
}

export interface InventoryData {
  product_id: string
  product_name: string
  current_stock: number
  low_stock_threshold: number
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface SupplierPerformanceData {
  supplier_id: string
  supplier_name: string
  total_purchases: number
  total_spent: number
  on_time_deliveries: number
  total_deliveries: number
}

export interface LocationSalesData {
  location_id: string
  location_name: string
  revenue: number
  transactions: number
  percentage: number
}

export interface ConsolidatedReportData {
  total_revenue: number
  total_transactions: number
  avg_transaction_value: number
  top_location: string | null
  top_product: string | null
  top_category: string | null
}

export function useAnalytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([])
  const [productSalesData, setProductSalesData] = useState<ProductSalesData[]>([])
  const [categorySalesData, setCategorySalesData] = useState<CategorySalesData[]>([])
  const [customerSalesData, setCustomerSalesData] = useState<CustomerSalesData[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([])
  const [supplierPerformanceData, setSupplierPerformanceData] = useState<SupplierPerformanceData[]>([])
  const [locationSalesData, setLocationSalesData] = useState<LocationSalesData[]>([])
  const [consolidatedReportData, setConsolidatedReportData] = useState<ConsolidatedReportData | null>(null)
  
  const supabase = createClient()

  // Fetch sales data for a given period
  const fetchSalesData = async (startDate: string, endDate: string, locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for daily sales data
      let query = supabase
        .from('transactions')
        .select(`
          DATE(created_at) as date,
          SUM(total) as revenue,
          COUNT(*) as transactions,
          SUM((SELECT SUM(quantity) FROM transaction_items WHERE transaction_id = transactions.id)) as items_sold
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .group('DATE(created_at)')
        .order('date', { ascending: true })
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match SalesDataPoint interface
      const salesData: SalesDataPoint[] = data.map((item: any) => ({
        date: item.date,
        revenue: Math.floor(item.revenue || 0),
        transactions: parseInt(item.transactions || 0),
        items_sold: parseInt(item.items_sold || 0)
      }))
      
      setSalesData(salesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching sales data:', err)
      setError('Failed to fetch sales data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch product sales data
  const fetchProductSalesData = async (limit: number = 10, locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for product sales data
      let query = supabase
        .from('transaction_items')
        .select(`
          product_id,
          products (name),
          SUM(quantity) as quantity_sold,
          SUM(quantity * price) as revenue
        `)
        .group('product_id', 'products (name)')
        .order('revenue', { ascending: false })
        .limit(limit)
      
      // Add location filter if provided by joining with transactions
      if (locationId) {
        query = query
          .eq('transactions.location_id', locationId)
          .join('transactions', { 'transaction_items.transaction_id': 'transactions.id' })
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match ProductSalesData interface
      const productSalesData: ProductSalesData[] = data.map((item: any) => ({
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown Product',
        quantity_sold: parseInt(item.quantity_sold || 0),
        revenue: Math.floor(item.revenue || 0)
      }))
      
      setProductSalesData(productSalesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching product sales data:', err)
      setError('Failed to fetch product sales data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch category sales data
  const fetchCategorySalesData = async (locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for category sales data
      let query = supabase
        .from('transaction_items')
        .select(`
          products (category_id),
          categories (name),
          SUM(quantity * price) as revenue
        `)
        .group('products (category_id)', 'categories (name)')
        .order('revenue', { ascending: false })
      
      // Add location filter if provided by joining with transactions
      if (locationId) {
        query = query
          .eq('transactions.location_id', locationId)
          .join('transactions', { 'transaction_items.transaction_id': 'transactions.id' })
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Calculate total revenue for percentage calculation
      const totalRevenue = data.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0)
      
      // Transform data to match CategorySalesData interface
      const categorySalesData: CategorySalesData[] = data.map((item: any) => {
        const revenue = Math.floor(item.revenue || 0)
        return {
          category_name: item.categories?.name || 'Unknown Category',
          revenue,
          percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0
        }
      })
      
      setCategorySalesData(categorySalesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching category sales data:', err)
      setError('Failed to fetch category sales data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch customer sales data
  const fetchCustomerSalesData = async (limit: number = 10, locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for customer sales data
      let query = supabase
        .from('transactions')
        .select(`
          customer_id,
          customers (name),
          SUM(total) as total_spent,
          COUNT(*) as transaction_count
        `)
        .group('customer_id', 'customers (name)')
        .order('total_spent', { ascending: false })
        .limit(limit)
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match CustomerSalesData interface
      const customerSalesData: CustomerSalesData[] = data.map((item: any) => ({
        customer_id: item.customer_id,
        customer_name: item.customers?.name || 'Unknown Customer',
        total_spent: Math.floor(item.total_spent || 0),
        transaction_count: parseInt(item.transaction_count || 0)
      }))
      
      setCustomerSalesData(customerSalesData)
      setError(null)
    } catch (err) {
      console.error('Error fetching customer sales data:', err)
      setError('Failed to fetch customer sales data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch inventory data
  const fetchInventoryData = async (locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for inventory data
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          stock,
          low_stock_level
        `)
        .order('name')
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match InventoryData interface
      const inventoryData: InventoryData[] = data.map((item: any) => {
        let stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
        
        if (item.stock === 0) {
          stock_status = 'out_of_stock'
        } else if (item.stock <= item.low_stock_level) {
          stock_status = 'low_stock'
        }
        
        return {
          product_id: item.id,
          product_name: item.name,
          current_stock: item.stock,
          low_stock_threshold: item.low_stock_level,
          stock_status
        }
      })
      
      setInventoryData(inventoryData)
      setError(null)
    } catch (err) {
      console.error('Error fetching inventory data:', err)
      setError('Failed to fetch inventory data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch supplier performance data
  const fetchSupplierPerformanceData = async (locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for supplier performance data
      let query = supabase
        .from('purchase_orders')
        .select(`
          supplier_id,
          suppliers (name),
          COUNT(*) as total_purchases,
          SUM(total) as total_spent
        `)
        .group('supplier_id', 'suppliers (name)')
        .order('total_spent', { ascending: false })
      
      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match SupplierPerformanceData interface
      const supplierPerformanceData: SupplierPerformanceData[] = data.map((item: any) => ({
        supplier_id: item.supplier_id,
        supplier_name: item.suppliers?.name || 'Unknown Supplier',
        total_purchases: parseInt(item.total_purchases || 0),
        total_spent: Math.floor(item.total_spent || 0),
        on_time_deliveries: 0, // This would require additional tracking
        total_deliveries: parseInt(item.total_purchases || 0)
      }))
      
      setSupplierPerformanceData(supplierPerformanceData)
      setError(null)
    } catch (err) {
      console.error('Error fetching supplier performance data:', err)
      setError('Failed to fetch supplier performance data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch sales data by location
  const fetchLocationSalesData = async (startDate?: string, endDate?: string, locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for location sales data
      let query = supabase
        .from('transactions')
        .select(`
          location_id,
          locations (name),
          SUM(total) as revenue,
          COUNT(*) as transactions
        `)
        .group('location_id', 'locations (name)')
        .order('revenue', { ascending: false })
      
      // Add date filters if provided
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }
      
      const { data, error } = await query

      if (error) throw error
      
      // Transform data to match LocationSalesData interface
      const locationSalesData: LocationSalesData[] = data.map((item: any) => ({
        location_id: item.location_id,
        location_name: item.locations?.name || 'Unknown Location',
        revenue: Math.floor(item.revenue || 0),
        transactions: parseInt(item.transactions || 0),
        percentage: 0 // Will calculate this below
      }))
      
      // Calculate percentages
      const totalRevenue = locationSalesData.reduce((sum, loc) => sum + loc.revenue, 0)
      const dataWithPercentages = locationSalesData.map(loc => ({
        ...loc,
        percentage: totalRevenue > 0 ? Math.round((loc.revenue / totalRevenue) * 100) : 0
      }))
      
      setLocationSalesData(dataWithPercentages)
      setError(null)
    } catch (err) {
      console.error('Error fetching location sales data:', err)
      setError('Failed to fetch location sales data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch consolidated report data
  const fetchConsolidatedReportData = async (startDate?: string, endDate?: string, locationId?: string) => {
    try {
      setLoading(true)
      
      // Build query for consolidated report data
      let query = supabase
        .from('transactions')
        .select(`
          SUM(total) as total_revenue,
          COUNT(*) as total_transactions,
          AVG(total) as avg_transaction_value
        `)
      
      // Add date filters if provided
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }
      
      // Add location filter if provided
      if (locationId) {
        query = query.eq('location_id', locationId)
      }
      
      const { data, error } = await query.single()

      if (error) throw error
      
      // Get top location
      let topLocation = null
      if (!locationId) {
        const { data: locationData, error: locationError } = await supabase
          .from('transactions')
          .select(`
            location_id,
            locations (name),
            SUM(total) as revenue
          `)
          .group('location_id', 'locations (name)')
          .order('revenue', { ascending: false })
          .limit(1)
          .single()
        
        if (!locationError && locationData) {
          topLocation = locationData.locations?.name || 'Unknown Location'
        }
      } else {
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('name')
          .eq('id', locationId)
          .single()
        
        if (!locationError && locationData) {
          topLocation = locationData.name
        }
      }
      
      // Get top product
      const { data: productData, error: productError } = await supabase
        .from('transaction_items')
        .select(`
          product_id,
          products (name),
          SUM(quantity * price) as revenue
        `)
        .group('product_id', 'products (name)')
        .order('revenue', { ascending: false })
        .limit(1)
        .single()
      
      const topProduct = !productError && productData ? productData.products?.name || 'Unknown Product' : null
      
      // Get top category
      const { data: categoryData, error: categoryError } = await supabase
        .from('transaction_items')
        .select(`
          products (category_id),
          categories (name),
          SUM(quantity * price) as revenue
        `)
        .group('products (category_id)', 'categories (name)')
        .order('revenue', { ascending: false })
        .limit(1)
        .single()
      
      const topCategory = !categoryError && categoryData ? categoryData.categories?.name || 'Unknown Category' : null
      
      const consolidatedData: ConsolidatedReportData = {
        total_revenue: Math.floor(data.total_revenue || 0),
        total_transactions: parseInt(data.total_transactions || 0),
        avg_transaction_value: parseFloat(data.avg_transaction_value || 0),
        top_location: topLocation,
        top_product: topProduct,
        top_category: topCategory
      }
      
      setConsolidatedReportData(consolidatedData)
      setError(null)
    } catch (err) {
      console.error('Error fetching consolidated report data:', err)
      setError('Failed to fetch consolidated report data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch all analytics data
  const fetchAllAnalytics = async (startDate?: string, endDate?: string, locationId?: string) => {
    try {
      setLoading(true)
      
      // Set default date range if not provided
      const end = endDate || new Date().toISOString().split('T')[0]
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Fetch all data in parallel
      await Promise.all([
        fetchSalesData(start, end, locationId),
        fetchProductSalesData(10, locationId),
        fetchCategorySalesData(locationId),
        fetchCustomerSalesData(10, locationId),
        fetchInventoryData(locationId),
        fetchSupplierPerformanceData(locationId),
        fetchLocationSalesData(start, end, locationId),
        fetchConsolidatedReportData(start, end, locationId)
      ])
      
      setError(null)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    salesData,
    productSalesData,
    categorySalesData,
    customerSalesData,
    inventoryData,
    supplierPerformanceData,
    locationSalesData,
    consolidatedReportData,
    fetchSalesData,
    fetchProductSalesData,
    fetchCategorySalesData,
    fetchCustomerSalesData,
    fetchInventoryData,
    fetchSupplierPerformanceData,
    fetchLocationSalesData,
    fetchConsolidatedReportData,
    fetchAllAnalytics
  }
}