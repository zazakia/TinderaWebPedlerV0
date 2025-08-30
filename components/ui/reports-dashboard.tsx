"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  LineChart,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// Types
interface SalesReport {
  date: string
  total_sales: number
  total_transactions: number
  average_transaction: number
  cash_sales: number
  credit_sales: number
  top_products: Array<{
    product_name: string
    quantity_sold: number
    revenue: number
  }>
}

interface InventoryReport {
  product_id: string
  product_name: string
  category: string
  current_stock: number
  stock_value: number
  units_sold: number
  revenue_generated: number
  profit_margin: number
  movement_status: 'fast' | 'normal' | 'slow'
  reorder_level: number
  last_sale_date: string
}

interface CustomerReport {
  customer_id: string
  customer_name: string
  customer_type: string
  total_purchases: number
  total_spent: number
  credit_balance: number
  last_purchase_date: string
  purchase_frequency: number
  average_purchase_value: number
}

interface FinancialReport {
  period: string
  gross_sales: number
  returns: number
  net_sales: number
  cost_of_goods: number
  gross_profit: number
  gross_margin: number
  expenses: number
  net_profit: number
  cash_flow: number
}

const REPORT_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' }
]

const MOVEMENT_STATUS_COLORS = {
  fast: 'bg-green-100 text-green-800',
  normal: 'bg-blue-100 text-blue-800',
  slow: 'bg-red-100 text-red-800'
}

export function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('this_month')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Report data states
  const [salesData, setSalesData] = useState<SalesReport[]>([])
  const [inventoryData, setInventoryData] = useState<InventoryReport[]>([])
  const [customerData, setCustomerData] = useState<CustomerReport[]>([])
  const [financialData, setFinancialData] = useState<FinancialReport[]>([])

  // Load reports on component mount and period change
  useEffect(() => {
    loadReports()
  }, [selectedPeriod, customDateFrom, customDateTo])

  const loadReports = async () => {
    setLoading(true)
    setError(null)

    try {
      // TODO: Replace with actual API calls
      await generateSampleData()
      toast.success('Reports refreshed successfully')
    } catch (err: any) {
      setError(err.message)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  // Generate sample data for demonstration
  const generateSampleData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Sample sales data
    const sampleSales: SalesReport[] = [
      {
        date: '2024-08-29',
        total_sales: 25680.50,
        total_transactions: 147,
        average_transaction: 174.70,
        cash_sales: 18420.30,
        credit_sales: 7260.20,
        top_products: [
          { product_name: 'Coca Cola 1.5L', quantity_sold: 45, revenue: 2475.00 },
          { product_name: 'Lucky Me Pancit Canton', quantity_sold: 78, revenue: 1170.00 },
          { product_name: 'Tide Detergent 1kg', quantity_sold: 23, revenue: 1840.00 }
        ]
      }
    ]

    // Sample inventory data
    const sampleInventory: InventoryReport[] = [
      {
        product_id: '1',
        product_name: 'Coca Cola 1.5L',
        category: 'Beverages',
        current_stock: 48,
        stock_value: 2160.00,
        units_sold: 127,
        revenue_generated: 6985.00,
        profit_margin: 22.5,
        movement_status: 'fast',
        reorder_level: 20,
        last_sale_date: '2024-08-29'
      },
      {
        product_id: '2',
        product_name: 'Lucky Me Pancit Canton',
        category: 'Instant Noodles',
        current_stock: 85,
        stock_value: 1020.00,
        units_sold: 234,
        revenue_generated: 3510.00,
        profit_margin: 25.0,
        movement_status: 'fast',
        reorder_level: 50,
        last_sale_date: '2024-08-29'
      },
      {
        product_id: '3',
        product_name: 'Shampoo Sachet',
        category: 'Personal Care',
        current_stock: 156,
        stock_value: 780.00,
        units_sold: 45,
        revenue_generated: 337.50,
        profit_margin: 30.0,
        movement_status: 'slow',
        reorder_level: 100,
        last_sale_date: '2024-08-25'
      }
    ]

    // Sample customer data
    const sampleCustomers: CustomerReport[] = [
      {
        customer_id: '1',
        customer_name: 'Maria Santos',
        customer_type: 'Retail',
        total_purchases: 23,
        total_spent: 4580.50,
        credit_balance: 1250.00,
        last_purchase_date: '2024-08-29',
        purchase_frequency: 2.3,
        average_purchase_value: 199.15
      },
      {
        customer_id: '2',
        customer_name: 'Juan dela Cruz Store',
        customer_type: 'Wholesale',
        total_purchases: 15,
        total_spent: 18750.00,
        credit_balance: 8500.00,
        last_purchase_date: '2024-08-28',
        purchase_frequency: 1.2,
        average_purchase_value: 1250.00
      }
    ]

    // Sample financial data
    const sampleFinancial: FinancialReport[] = [
      {
        period: 'August 2024',
        gross_sales: 125680.50,
        returns: 2340.25,
        net_sales: 123340.25,
        cost_of_goods: 89560.18,
        gross_profit: 33780.07,
        gross_margin: 27.4,
        expenses: 15620.50,
        net_profit: 18159.57,
        cash_flow: 22450.30
      }
    ]

    setSalesData(sampleSales)
    setInventoryData(sampleInventory)
    setCustomerData(sampleCustomers)
    setFinancialData(sampleFinancial)
  }

  const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const getMovementIcon = (status: string) => {
    switch (status) {
      case 'fast': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'slow': return <TrendingDown className="w-4 h-4 text-red-600" />
      default: return <Minus className="w-4 h-4 text-blue-600" />
    }
  }

  const exportReport = (reportType: string) => {
    // TODO: Implement CSV/PDF export
    toast.success(`${reportType} report exported successfully`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_PERIODS.map(period => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPeriod === 'custom' && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="w-40"
              />
            </div>
          )}

          <Button onClick={loadReports} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {salesData.length > 0 && (
              <>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Sales</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(salesData[0].total_sales)}
                        </div>
                        <div className="text-xs text-green-600 flex items-center">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          +12.5% vs last period
                        </div>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Transactions</div>
                        <div className="text-2xl font-bold">{salesData[0].total_transactions}</div>
                        <div className="text-xs text-green-600 flex items-center">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          +8.3% vs last period
                        </div>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Avg Transaction</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(salesData[0].average_transaction)}
                        </div>
                        <div className="text-xs text-green-600 flex items-center">
                          <ArrowUp className="w-3 h-3 mr-1" />
                          +3.8% vs last period
                        </div>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Credit Sales</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(salesData[0].credit_sales)}
                        </div>
                        <div className="text-xs text-red-600 flex items-center">
                          <ArrowDown className="w-3 h-3 mr-1" />
                          -2.1% vs last period
                        </div>
                      </div>
                      <CreditCard className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Top Products */}
          {salesData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesData[0].top_products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{product.product_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.quantity_sold} units sold
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(product.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Cash Sales</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(salesData[0].cash_sales / salesData[0].total_sales) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-medium w-20 text-right">
                          {formatCurrency(salesData[0].cash_sales)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Credit Sales</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${(salesData[0].credit_sales / salesData[0].total_sales) * 100}%`
                            }}
                          />
                        </div>
                        <span className="font-medium w-20 text-right">
                          {formatCurrency(salesData[0].credit_sales)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventoryData.filter(item => item.current_stock <= item.reorder_level).map(item => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {item.current_stock} | Reorder Level: {item.reorder_level}
                      </div>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))}
                {inventoryData.filter(item => item.current_stock <= item.reorder_level).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p>All products are adequately stocked</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sales Analysis</h2>
              <Button onClick={() => exportReport('Sales')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {salesData.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(salesData[0].total_sales)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Sales</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {salesData[0].total_transactions}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Transactions</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                          {formatCurrency(salesData[0].average_transaction)}
                        </div>
                        <div className="text-sm text-muted-foreground">Average Transaction</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Units Sold</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>% of Total Sales</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesData[0].top_products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Badge className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{product.product_name}</TableCell>
                            <TableCell>{product.quantity_sold}</TableCell>
                            <TableCell>{formatCurrency(product.revenue)}</TableCell>
                            <TableCell>
                              {formatPercentage((product.revenue / salesData[0].total_sales) * 100)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Inventory Analysis</h2>
              <Button onClick={() => exportReport('Inventory')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Stock Value</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Profit Margin</TableHead>
                      <TableHead>Movement</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.current_stock}
                            {item.current_stock <= item.reorder_level && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.stock_value)}</TableCell>
                        <TableCell>{item.units_sold}</TableCell>
                        <TableCell>{formatCurrency(item.revenue_generated)}</TableCell>
                        <TableCell>{formatPercentage(item.profit_margin)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMovementIcon(item.movement_status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={MOVEMENT_STATUS_COLORS[item.movement_status]}>
                            {item.movement_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Customer Analysis</h2>
              <Button onClick={() => exportReport('Customer')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{customerData.length}</div>
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(customerData.reduce((sum, c) => sum + c.total_spent, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Customer Revenue</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {formatCurrency(customerData.reduce((sum, c) => sum + c.credit_balance, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Outstanding Credit</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Customer Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Total Purchases</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Avg Purchase</TableHead>
                      <TableHead>Credit Balance</TableHead>
                      <TableHead>Last Purchase</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerData.map((customer) => (
                      <TableRow key={customer.customer_id}>
                        <TableCell className="font-medium">{customer.customer_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.customer_type}</Badge>
                        </TableCell>
                        <TableCell>{customer.total_purchases}</TableCell>
                        <TableCell>{formatCurrency(customer.total_spent)}</TableCell>
                        <TableCell>{formatCurrency(customer.average_purchase_value)}</TableCell>
                        <TableCell>
                          <span className={customer.credit_balance > 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatCurrency(customer.credit_balance)}
                          </span>
                        </TableCell>
                        <TableCell>{customer.last_purchase_date}</TableCell>
                        <TableCell>
                          <Badge className={customer.credit_balance > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {customer.credit_balance > 0 ? 'Credit' : 'Good'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Financial Analysis</h2>
              <Button onClick={() => exportReport('Financial')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>

            {financialData.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(financialData[0].gross_profit)}
                        </div>
                        <div className="text-sm text-muted-foreground">Gross Profit</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatPercentage(financialData[0].gross_margin)}
                        </div>
                        <div className="text-sm text-muted-foreground">Gross Margin</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(financialData[0].net_profit)}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Profit</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Gross Sales</div>
                          <div className="text-lg font-semibold">{formatCurrency(financialData[0].gross_sales)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Returns</div>
                          <div className="text-lg font-semibold text-red-600">
                            -{formatCurrency(financialData[0].returns)}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Net Sales</div>
                            <div className="text-lg font-semibold">{formatCurrency(financialData[0].net_sales)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Cost of Goods</div>
                            <div className="text-lg font-semibold text-red-600">
                              -{formatCurrency(financialData[0].cost_of_goods)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Gross Profit</div>
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(financialData[0].gross_profit)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Expenses</div>
                            <div className="text-lg font-semibold text-red-600">
                              -{formatCurrency(financialData[0].expenses)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 bg-muted/30 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Net Profit</div>
                            <div className="text-xl font-bold text-green-600">
                              {formatCurrency(financialData[0].net_profit)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Cash Flow</div>
                            <div className="text-xl font-bold text-blue-600">
                              {formatCurrency(financialData[0].cash_flow)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Loading state */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-64">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading reports...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => setError(null)} variant="outline" className="flex-1">
                  Close
                </Button>
                <Button onClick={loadReports} className="flex-1">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ReportsDashboard</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(financialData[0].net_sales)}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Sales</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
