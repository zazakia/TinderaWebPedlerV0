"use client"

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  TrendingUp, 
  Package, 
  Users, 
  CreditCard, 
  Filter, 
  Download,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { CartesianGrid, Line, LineChart, Bar, BarChart, Pie, PieChart as RechartsPieChart, Cell, XAxis, YAxis } from 'recharts'

const COLORS = ['#1e40af', '#7c3aed', '#0d9488', '#d97706', '#dc2626', '#059669', '#7c2d12', '#4338ca']

export default function EnhancedAnalyticsDashboard({ onBack }: { onBack: () => void }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'customers' | 'suppliers'>('overview')
  
  const {
    loading,
    salesData,
    productSalesData,
    categorySalesData,
    customerSalesData,
    inventoryData,
    supplierPerformanceData,
    fetchAllAnalytics
  } = useAnalytics()

  useEffect(() => {
    fetchAllAnalytics()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  // Calculate summary metrics
  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0)
  const totalTransactions = salesData.reduce((sum, data) => sum + data.transactions, 0)
  const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
  
  const lowStockItems = inventoryData.filter(item => item.stock_status === 'low_stock').length
  const outOfStockItems = inventoryData.filter(item => item.stock_status === 'out_of_stock').length
  
  const topCustomer = customerSalesData.length > 0 ? customerSalesData[0] : null
  const topProduct = productSalesData.length > 0 ? productSalesData[0] : null

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Business Analytics</h1>
        </div>
        <Button variant="ghost" size="sm" className="p-2">
          <Download className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="p-4">
        <div className="flex gap-2 bg-white rounded-lg p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
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

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-white rounded-lg p-1">
          {([
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sales', label: 'Sales', icon: TrendingUp },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'suppliers', label: 'Suppliers', icon: CreditCard }
          ] as const).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className={`flex-1 flex-col items-center gap-1 text-xs py-2 ${activeTab === tab.id ? 'bg-pink-500 text-white' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="px-4 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Revenue</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : formatCurrency(totalRevenue)}
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
                {loading ? 'Loading...' : totalTransactions.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Avg. Order</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : formatCurrency(avgTransactionValue)}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs text-gray-500">Low Stock</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : lowStockItems}
              </p>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Sales Trend</h2>
              <Button variant="ghost" size="sm" className="p-1">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#ec4899",
                  },
                }}
                className="h-40 w-full"
              >
                <LineChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-3">Top Selling Products</h2>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {productSalesData.slice(0, 3).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{product.product_name}</p>
                        <p className="text-xs text-gray-500">{product.quantity_sold} sold</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(product.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="px-4 space-y-4">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Revenue Trend</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#ec4899",
                  },
                  transactions: {
                    label: "Transactions",
                    color: "#1e40af",
                  },
                }}
                className="h-64 w-full"
              >
                <LineChart
                  data={salesData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ec4899"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#1e40af"
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Sales by Category</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={categorySalesData.reduce((acc, category, index) => {
                  acc[category.category_name] = {
                    label: category.category_name,
                    color: COLORS[index % COLORS.length],
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-64 w-full"
              >
                <RechartsPieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={categorySalesData}
                    dataKey="revenue"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category_name, percentage }) => `${category_name}: ${percentage}%`}
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </RechartsPieChart>
              </ChartContainer>
            )}
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="px-4 space-y-4">
          {/* Inventory Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{inventoryData.filter(i => i.stock_status === 'in_stock').length}</p>
              <p className="text-xs text-gray-500">In Stock</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{lowStockItems}</p>
              <p className="text-xs text-gray-500">Low Stock</p>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{outOfStockItems}</p>
              <p className="text-xs text-gray-500">Out of Stock</p>
            </div>
          </div>

          {/* Inventory Chart */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Inventory Status</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  current_stock: {
                    label: "Current Stock",
                    color: "#1e40af",
                  },
                  low_stock_threshold: {
                    label: "Low Stock Threshold",
                    color: "#dc2626",
                  },
                }}
                className="h-64 w-full"
              >
                <BarChart
                  data={inventoryData.slice(0, 10)}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="product_name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="current_stock" fill="#1e40af" name="Current Stock" />
                  <Bar dataKey="low_stock_threshold" fill="#dc2626" name="Low Stock Threshold" />
                </BarChart>
              </ChartContainer>
            )}
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-3">Low Stock Alerts</h2>
            {loading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {inventoryData
                  .filter(item => item.stock_status === 'low_stock' || item.stock_status === 'out_of_stock')
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.current_stock} in stock (threshold: {item.low_stock_threshold})
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.stock_status === 'out_of_stock' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.stock_status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="px-4 space-y-4">
          {/* Customer Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Total Customers</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : customerSalesData.length}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Top Customer</span>
              </div>
              <p className="text-lg font-semibold truncate">
                {loading ? 'Loading...' : topCustomer?.customer_name || 'N/A'}
              </p>
            </div>
          </div>

          {/* Customer Chart */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Top Customers by Spending</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  total_spent: {
                    label: "Total Spent",
                    color: "#7c3aed",
                  },
                }}
                className="h-64 w-full"
              >
                <BarChart
                  data={customerSalesData.slice(0, 10)}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="customer_name"
                    type="category"
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />} 
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="total_spent" fill="#7c3aed" name="Total Spent">
                    {customerSalesData.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="px-4 space-y-4">
          {/* Supplier Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Total Suppliers</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : supplierPerformanceData.length}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">On-time Rate</span>
              </div>
              <p className="text-lg font-semibold">
                {loading ? 'Loading...' : 
                  supplierPerformanceData.length > 0 
                    ? `${Math.round(supplierPerformanceData.reduce((sum, s) => sum + (s.on_time_deliveries / s.total_deliveries) * 100, 0) / supplierPerformanceData.length)}%`
                    : '0%'}
              </p>
            </div>
          </div>

          {/* Supplier Performance Chart */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Supplier Performance</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            ) : (
              <ChartContainer
                config={{
                  total_spent: {
                    label: "Total Spent",
                    color: "#0d9488",
                  },
                  on_time_rate: {
                    label: "On-time Delivery Rate",
                    color: "#d97706",
                  },
                }}
                className="h-64 w-full"
              >
                <BarChart
                  data={supplierPerformanceData.slice(0, 10)}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="supplier_name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    yAxisId="left"
                    dataKey="total_spent" 
                    fill="#0d9488" 
                    name="Total Spent"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={(data) => data.total_deliveries > 0 ? (data.on_time_deliveries / data.total_deliveries) * 100 : 0}
                    name="On-time Rate (%)"
                    stroke="#d97706"
                    strokeWidth={2}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </div>
        </div>
      )}
    </div>
  )
}