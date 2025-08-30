"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import PaymentProcessor from '@/components/ui/payment-processor'
import CustomerManager from '@/components/ui/customer-manager'
import InventoryManager from '@/components/ui/inventory-manager'
import ReceiptGenerator from '@/components/ui/receipt-generator'
import { toast } from 'sonner'
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  User,
  Package,
  CreditCard,
  Receipt,
  Settings,
  ArrowLeft,
  Trash2,
  Edit,
  BarChart3,
  Users,
  FileText,
  Calculator,
  Home
} from 'lucide-react'

// Import hooks (assuming they exist from the current implementation)
import { useProducts } from '@/lib/hooks/useProducts'
import { useCategories } from '@/lib/hooks/useCategories'
import { useTransactions } from '@/lib/hooks/useTransactions'

interface CartItem {
  id: string
  name: string
  quantity: number
  unit_name: string
  unit_price: number
  total: number
  stock: number
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  customer_type: 'retail' | 'wholesale' | 'dealer'
  credit_limit: number
  current_balance: number
  available_credit: number
  payment_terms: number
  is_active: boolean
}

interface Transaction {
  id: string
  transaction_number: string
  transaction_date: string
  transaction_time: string
  customer_name?: string
  customer_phone?: string
  cashier_name: string
  items: Array<{
    id: string
    product_name: string
    unit_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string
  cash_amount?: number
  change_amount?: number
  credit_amount?: number
  split_payments?: Array<{
    method: string
    amount: number
  }>
  notes?: string
  status: 'completed' | 'cancelled' | 'refunded'
}

type Screen = 'dashboard' | 'pos' | 'inventory' | 'customers' | 'reports' | 'settings'

const DEFAULT_BUSINESS_SETTINGS = {
  business_name: "TindahanKO POS",
  business_address: "123 Main Street, Barangay Sample, City, Province 1234",
  business_phone: "09123456789",
  business_email: "info@tindahanko.com",
  tin_number: "123-456-789-000",
  permit_number: "BP-2024-001",
  receipt_footer: "Thank you for your business!\nCome back soon!"
}

export default function EnhancedPOSApp() {
  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')

  // POS State
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Dialog states
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false)
  const [showCustomerManager, setShowCustomerManager] = useState(false)
  const [showReceiptGenerator, setShowReceiptGenerator] = useState(false)
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null)

  // Data hooks
  const {
    products: dbProducts,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
  } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { createTransactionWithItems } = useTransactions()

  // Transform database products
  const products = dbProducts.map((product) => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    price: product.price_retail,
    cost: product.cost,
    image: product.image_url || "/placeholder.svg",
    category: categories.find((cat) => cat.id === product.category_id)?.name || "General",
    baseUnit: product.base_unit,
    description: product.description,
    sku: product.sku,
    units: product.units?.map((unit: any) => ({
      id: unit.id,
      name: unit.unit_name,
      conversionFactor: unit.conversion_factor,
      price: unit.price,
      isBase: unit.is_base_unit,
      type: unit.unit_type,
    })) || [{ id: '1', name: 'pcs', conversionFactor: 1, price: product.price_retail, isBase: true, type: 'retail' }],
  }))

  // Filter products for POS
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch && product.stock > 0
  })

  // Cart calculations
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Cart functions
  const addToCart = (product: any, selectedUnit?: any) => {
    const unit = selectedUnit || product.units[0]
    const existingItem = cart.find(item => item.id === product.id && item.unit_name === unit.name)

    if (existingItem) {
      updateCartQuantity(product.id, unit.name, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        quantity: 1,
        unit_name: unit.name,
        unit_price: unit.price,
        total: unit.price,
        stock: product.stock
      }
      setCart(prev => [...prev, newItem])
    }
  }

  const updateCartQuantity = (productId: string, unitName: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => !(item.id === productId && item.unit_name === unitName)))
    } else {
      setCart(prev => prev.map(item => {
        if (item.id === productId && item.unit_name === unitName) {
          return { ...item, quantity, total: item.unit_price * quantity }
        }
        return item
      }))
    }
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerManager(false)
  }

  const handlePaymentComplete = async (paymentData: any) => {
    try {
      // Create transaction
      const transactionData = {
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.unit_price,
          unit_type: 'retail' as const,
          name: item.name,
          unit_name: item.unit_name,
        })),
        subtotal: cartTotal,
        total: cartTotal,
        payment_method: paymentData.payment_method,
        customer_id: selectedCustomer?.id,
        payment_details: paymentData
      }

      const result = await createTransactionWithItems(transactionData)

      // Create transaction object for receipt
      const transaction: Transaction = {
        id: result.id || Date.now().toString(),
        transaction_number: `TXN-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_time: new Date().toTimeString().split(' ')[0],
        customer_name: selectedCustomer?.name,
        customer_phone: selectedCustomer?.phone,
        cashier_name: 'System User', // TODO: Get from auth context
        items: cart.map(item => ({
          id: item.id,
          product_name: item.name,
          unit_name: item.unit_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total
        })),
        subtotal: cartTotal,
        tax_amount: 0,
        discount_amount: 0,
        total_amount: cartTotal,
        payment_method: paymentData.payment_method,
        cash_amount: paymentData.cash_amount,
        change_amount: paymentData.change_amount,
        credit_amount: paymentData.credit_amount,
        split_payments: paymentData.split_payments,
        notes: paymentData.notes,
        status: 'completed'
      }

      setCompletedTransaction(transaction)
      setShowPaymentProcessor(false)
      setShowReceiptGenerator(true)
      clearCart()

      toast.success('Transaction completed successfully!')
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.error('Transaction failed. Please try again.')
    }
  }

  // Loading state
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Dashboard Screen
  if (currentScreen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">TindahanKO Dashboard</h1>
            <Button
              variant="outline"
              onClick={() => setCurrentScreen('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                    <div className="text-2xl font-bold">{products.length}</div>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Low Stock Items</div>
                    <div className="text-2xl font-bold text-red-600">
                      {products.filter(p => p.stock <= 10).length}
                    </div>
                  </div>
                  <Package className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Categories</div>
                    <div className="text-2xl font-bold">{categories.length}</div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Inventory Value</div>
                    <div className="text-2xl font-bold">
                      ₱{products.reduce((sum, p) => sum + (p.stock * p.cost), 0).toLocaleString()}
                    </div>
                  </div>
                  <Calculator className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentScreen('pos')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <ShoppingCart className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Point of Sale</h3>
                  <p className="text-sm text-muted-foreground">Process sales transactions</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentScreen('inventory')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Package className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Inventory</h3>
                  <p className="text-sm text-muted-foreground">Manage stock & transactions</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentScreen('customers')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Customers</h3>
                  <p className="text-sm text-muted-foreground">Manage customer accounts</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentScreen('reports')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Reports</h3>
                  <p className="text-sm text-muted-foreground">Sales & inventory reports</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Transactions</h3>
                  <p className="text-sm text-muted-foreground">View transaction history</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentScreen('settings')}
            >
              <CardContent className="pt-6">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure system settings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // POS Screen
  if (currentScreen === 'pos') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentScreen('dashboard')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-bold">Point of Sale</h1>
              </div>

              <div className="flex items-center gap-4">
                {selectedCustomer && (
                  <Badge variant="outline" className="text-sm">
                    <User className="w-3 h-3 mr-1" />
                    {selectedCustomer.name}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowCustomerManager(true)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Select Customer
                </Button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Product Grid */}
            <div className="flex-1 p-4">
              {/* Search and Categories */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={activeCategory === 'All' ? 'default' : 'outline'}
                    onClick={() => setActiveCategory('All')}
                    size="sm"
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.name ? 'default' : 'outline'}
                      onClick={() => setActiveCategory(category.name)}
                      size="sm"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-purple-600 mb-1">
                          ₱{product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Stock: {product.stock}</span>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Cart */}
            <div className="w-80 bg-white border-l">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart ({cartCount})
                </h2>
              </div>

              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="p-4 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <Card key={`${item.id}-${item.unit_name}-${index}`}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCartQuantity(item.id, item.unit_name, 0)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, item.unit_name, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateCartQuantity(item.id, item.unit_name, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">₱{item.total.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                ₱{item.unit_price.toFixed(2)} / {item.unit_name}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Cart Total and Checkout */}
              {cart.length > 0 && (
                <div className="p-4 border-t bg-muted/30">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowPaymentProcessor(true)}
                      className="w-full"
                      size="lg"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Other screens
  if (currentScreen === 'inventory') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentScreen('dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          <InventoryManager />
        </div>
      </div>
    )
  }

  if (currentScreen === 'customers') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentScreen('dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Customer Management</h1>
          </div>
          <CustomerManager showSelection={false} />
        </div>
      </div>
    )
  }

  // Fallback to dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Feature Coming Soon</h1>
          <Button onClick={() => setCurrentScreen('dashboard')}>
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Main App Content */}
      <div>
        {/* Content rendered above */}
      </div>

      {/* Dialogs */}
      {showPaymentProcessor && (
        <PaymentProcessor
          totalAmount={cartTotal}
          cartItems={cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          }))}
          selectedCustomer={selectedCustomer}
          onPaymentComplete={handlePaymentComplete}
          onCancel={() => setShowPaymentProcessor(false)}
          isOpen={showPaymentProcessor}
        />
      )}

      {showCustomerManager && (
        <CustomerManager
          onCustomerSelect={handleCustomerSelect}
          showSelection={true}
        />
      )}

      {showReceiptGenerator && completedTransaction && (
        <ReceiptGenerator
          transaction={completedTransaction}
          businessSettings={DEFAULT_BUSINESS_SETTINGS}
          isOpen={showReceiptGenerator}
          onClose={() => {
            setShowReceiptGenerator(false)
            setCompletedTransaction(null)
          }}
          onPrint={() => console.log('Print receipt')}
          onEmail={() => console.log('Email receipt')}
          onSMS={() => console.log('SMS receipt')}
        />
      )}
    </>
  )
}
