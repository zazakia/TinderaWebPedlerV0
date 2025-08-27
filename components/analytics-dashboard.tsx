"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Package, Users, CreditCard, Calendar, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { useProducts } from '@/lib/hooks/useProducts'
import { useCustomers } from '@/lib/hooks/useCustomers'

interface SalesSummary {
  total_sales: number
  total_transactions: number
  average_transaction_value: number
  top_product_id: string | null
  top_product_name: string | null
  top_product_sales: number | null
}

export default function AnalyticsDashboard({ onBack }: { onBack: () => void }) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('week')
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { transactions, getSalesSummary, loading: transactionsLoading } = useTransactions()
  const { products, loading: productsLoading } = useProducts()
  const { customers, loading: customersLoading } = useCustomers()

  useEffect(() => {
    const fetchSalesSummary = async () => {
      setLoading(true)
      try {
        // Calculate date range based on selected time range
        const endDate = new Date()
        let startDate = new Date()
        
        switch (timeRange) {
          case 'today':
            startDate = new Date()
            startDate.setHours(0, 0, 0, 0)
            break
          case 'week':
            startDate.setDate(endDate.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(endDate.getMonth() - 1)
            break
          case 'year':
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
        }
        
        const result = await getSalesSummary(startDate, endDate)
        if (result.success) {
          setSalesSummary(result.data)
        }
      } catch (error) {
        console.error('Error fetching sales summary:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSalesSummary()
  }, [timeRange, getSalesSummary])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate key metrics
  const totalProducts = products.length
  const activeCustomers = customers.filter(c => c.is_active).length
  const lowStockProducts = products.filter(p => p.stock <= p.low_stock_level).length
  const totalCreditBalance = customers.reduce((sum, customer) => sum + customer.current_balance, 0)

  // Calculate top selling products based on transaction data
  const getTopSellingProducts = () => {
    // Create a map to count product sales
    const productSales: Record<string, { product: any, quantity: number, revenue: number }> = {}
    
    // Process transactions to calculate product sales
    transactions.forEach(transaction => {
      if (Array.isArray(transaction.items)) {
        transaction.items.forEach((item: any) => {
          const productId = item.product_id || item.productId
          const quantity = item.quantity || 0
          const price = item.price || 0
          
          if (productId) {
            if (!productSales[productId]) {
              const product = products.find(p => p.id === productId)
              if (product) {
                productSales[productId] = {
                  product,
                  quantity: 0,
                  revenue: 0
                }
              }
            }
            
            if (productSales[productId]) {
              productSales[productId].quantity += quantity
              productSales[productId].revenue += quantity * price
            }
          }
        })
      }
    })
    
    // Convert to array and sort by revenue
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((item, index) => ({
        ...item.product,
        sales_quantity: item.quantity,
        sales_revenue: item.revenue
      }))
  }

  const topSellingProducts = getTopSellingProducts()

  // Calculate customer metrics
  const getCustomerMetrics = () => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.is_active).length
    const customersWithCredit = customers.filter(c => c.current_balance > 0).length
    
    // Calculate average customer spending
    const totalCustomerSpending = customers.reduce((sum, customer) => sum + customer.total_purchases, 0)
    const avgCustomerSpending = totalCustomers > 0 ? totalCustomerSpending / totalCustomers : 0
    
    return {
      totalCustomers,
      activeCustomers,
      customersWithCredit,
      avgCustomerSpending
    }
  }

  const customerMetrics = getCustomerMetrics()

  // Calculate inventory metrics
  const getInventoryMetrics = () => {
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => p.stock <= p.low_stock_level).length
    const outOfStockProducts = products.filter(p => p.stock === 0).length
    
    // Calculate total inventory value
    const totalInventoryValue = products.reduce((sum, product) => sum + (product.stock * product.cost), 0)
    
    // Calculate stock turnover rate (simplified)
    const totalSold = products.reduce((sum, product) => sum + (product.units?.reduce((unitSum, unit) => unitSum + unit.stock_sold, 0) || 0), 0)
    const avgStock = products.reduce((sum, product) => sum + product.stock, 0) / (totalProducts || 1)
    const turnoverRate = avgStock > 0 ? totalSold / avgStock : 0
    
    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      turnoverRate
    }
  }

  const inventoryMetrics = getInventoryMetrics()

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
        <Button variant="ghost" size="sm" className="p-2">
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="p-4">
        <div className="flex gap-2 bg-white rounded-lg p-1">
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              className={`flex-1 text-xs capitalize ${timeRange === range ? 'bg-pink-500 text-white' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Sales</span>
          </div>
          <p className="text-lg font-semibold">
            {loading ? 'Loading...' : salesSummary ? formatCurrency(salesSummary.total_sales) : '₱0.00'}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Transactions</span>
          </div>
          <p className="text-lg font-semibold">
            {loading ? 'Loading...' : salesSummary ? salesSummary.total_transactions : 0}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500">Products</span>
          </div>
          <p className="text-lg font-semibold">{totalProducts}</p>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">Customers</span>
          </div>
          <p className="text-lg font-semibold">{activeCustomers}</p>
        </div>
      </div>

      {/* Sales Chart Placeholder */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Sales Overview</h2>
            <Button variant="ghost" size="sm" className="p-1">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-40 flex items-end justify-between gap-1">
            {[65, 45, 70, 55, 80, 60, 75].map((height, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-pink-500 rounded-t-sm" 
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {loading ? 'Loading sales data...' : 
               salesSummary ? `Average: ${formatCurrency(salesSummary.average_transaction_value)}` : 
               'No sales data available'}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Status */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-semibold mb-3">Inventory Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock Items</span>
              <span className="font-semibold text-orange-600">{lowStockProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Credit Balance</span>
              <span className="font-semibold text-red-600">{formatCurrency(totalCreditBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="px-4 mb-20">
        <div className="bg-white rounded-lg p-4">
          <h2 className="font-semibold mb-3">Top Selling Products</h2>
          <div className="space-y-3">
            {topSellingProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.stock} in stock</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(product.price_retail * product.sales)}</p>
                  <p className="text-xs text-gray-500">{product.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}