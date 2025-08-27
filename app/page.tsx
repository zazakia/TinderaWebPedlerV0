"use client"

import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  X,
  ChevronDown,
  Home,
  User,
  DollarSign,
  CreditCard,
  Receipt,
  Monitor,
  FileText,
  ShoppingBag,
  BarChart3,
  Link,
  Gamepad2,
  Mail,
  Eye,
  Edit,
  Trash2,
  ImageIcon,
  Calculator,
  Camera,
  Users,
  TrendingUp,
  MapPin,
  Scan,
  Truck,
  Activity,
  WifiOff,
  Shield
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import AddProduct from "@/components/add-product"
import CustomerManagement from "@/components/customer-management"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import EnhancedAnalyticsDashboard from "@/components/enhanced-analytics-dashboard"
import LocationManagement from "@/components/location-management"
import BarcodeScanner from "@/components/barcode-scanner"
import InventoryCount from "@/components/inventory-count"
import SupplierManagement from "@/components/supplier-management"
import PurchaseOrderManagement from "@/components/purchase-order"
import OfflineTransactionProcessing from "@/components/offline-transaction-processing"
import RBACManagement from "@/components/rbac-management"
import ConsolidatedReporting from "@/components/consolidated-reporting"

import { useProducts } from "@/lib/hooks/useProducts"
import { useCategories } from "@/lib/hooks/useCategories"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCustomers } from "@/lib/hooks/useCustomers"
import AuthGuard, { useAuth } from "@/components/auth/AuthGuard"
import UserProfile from "@/components/auth/UserProfile"

function POSScreen({ onBack, products, categories, setCurrentScreen, createTransaction, updateStock, fetchProducts, profile }: { onBack: () => void; products: any[]; categories: any[]; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "add-product" | "profile">>; createTransaction: any; updateStock: any; fetchProducts: () => Promise<void>; profile: any }) {
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [posScreen, setPosScreen] = useState<"pos" | "receipt" | "payment">("pos")
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    number: "",
    address: "",
    notes: "",
  })
  const [paymentOption, setPaymentOption] = useState<"pay-later" | "multi-payment">("pay-later")
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [multiPayments, setMultiPayments] = useState<{method: string, amount: number}[]>([])
  const [cashAmount, setCashAmount] = useState<number>(0)
  const [changeAmount, setChangeAmount] = useState<number>(0)

  // Handle payment transaction processing
  const handleTransaction = async (paymentMethod: 'cash' | 'credit' | 'card' | 'gcash' | 'paymaya' | 'grab-pay' | 'multi' | 'multi-payment') => {
    if (totalItems === 0) {
      alert('Cart is empty. Please add items before processing payment.')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Get cart items for transaction
      const cartItems = getCartItems()
      
      console.log('Processing transaction:', { cartItems, paymentMethod })
      
      // Call the createTransaction hook with correct parameters
      let finalPaymentMethod = paymentMethod
      let transactionNotes = showCustomerDetails ? `Customer: ${customerDetails.name}` : undefined
      
      // Handle multi-payment logic
      if (paymentMethod === 'multi' && multiPayments.length > 0) {
        const totalPaid = multiPayments.reduce((sum, payment) => sum + payment.amount, 0)
        if (Math.abs(totalPaid - totalAmount) > 0.01) {
          alert(`Payment total (₱${totalPaid.toFixed(2)}) doesn't match order total (₱${totalAmount.toFixed(2)})`)
          return
        }
        finalPaymentMethod = 'multi-payment'
        transactionNotes = `${transactionNotes ? transactionNotes + ' | ' : ''}Multi-payment: ${multiPayments.map(p => `${p.method}: ₱${p.amount.toFixed(2)}`).join(', ')}`
      }
      
      // Handle cash payment with change calculation
      if (paymentMethod === 'cash' && cashAmount > 0) {
        if (cashAmount < totalAmount) {
          alert(`Insufficient cash amount. Required: ₱${totalAmount.toFixed(2)}, Received: ₱${cashAmount.toFixed(2)}`)
          return
        }
        const change = cashAmount - totalAmount
        setChangeAmount(change)
        transactionNotes = `${transactionNotes ? transactionNotes + ' | ' : ''}Cash: ₱${cashAmount.toFixed(2)}, Change: ₱${change.toFixed(2)}`
      }
      const transactionResult = await createTransaction(
        cartItems,
        finalPaymentMethod,
        undefined, // customerId
        paymentMethod === 'credit', // isCredit
        0, // serviceFee
        0, // deliveryFee
        0, // discount
        0, // tax
        transactionNotes // notes
      )
      
      if (transactionResult.success) {
        console.log('Transaction successful, stock will update automatically via real-time subscription')
        
        // Add a small delay and manual refresh to ensure inventory is updated
        setTimeout(async () => {
          try {
            await fetchProducts()
            console.log('Products refreshed after transaction')
          } catch (error) {
            console.error('Failed to refresh products:', error)
          }
        }, 1000) // 1 second delay to allow database updates to complete
        
        // Clear cart after successful transaction
        setCart({})
        
        // Reset customer details
        setCustomerDetails({ name: '', number: '', address: '', notes: '' })
        setShowCustomerDetails(false)
        
        // Reset payment states
        setCashAmount(0)
        setChangeAmount(0)
        setMultiPayments([])
        
        // Show success message with payment details
        let successMessage = `Transaction completed successfully!`
        if (paymentMethod === 'cash' && changeAmount > 0) {
          successMessage += ` Change due: ₱${changeAmount.toFixed(2)}`
        } else if (paymentMethod === 'credit') {
          successMessage += ` Credit payment recorded.`
        } else if (paymentMethod === 'multi') {
          successMessage += ` Multi-payment processed.`
        } else {
          successMessage += ` ${paymentMethod.toUpperCase()} payment processed.`
        }
        alert(successMessage)
        
        // Go to receipt view
        setPosScreen('receipt')
      } else {
        throw new Error(transactionResult.error || 'Transaction failed')
      }
    } catch (error) {
      console.error('Transaction error:', error)
      alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle adding payment method in multi-payment
  const addPaymentMethod = (method: string, amount: number) => {
    if (amount <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    const currentTotal = multiPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const remaining = totalAmount - currentTotal
    
    if (amount > remaining) {
      alert(`Amount exceeds remaining balance. Remaining: ₱${remaining.toFixed(2)}`)
      return
    }
    
    setMultiPayments(prev => [...prev, { method, amount }])
  }
  
  // Remove payment method from multi-payment
  const removePaymentMethod = (index: number) => {
    setMultiPayments(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0
      const newQty = Math.max(0, currentQty + change)
      
      // Validate against available stock
      const product = products.find(p => p.id === productId)
      if (product && newQty > product.stock) {
        alert(`Cannot add more items. Only ${product.stock} items available in stock.`)
        return prev
      }
      
      return { ...prev, [productId]: newQty }
    })
  }

  const addToCart = (productId: string) => {
    updateQuantity(productId, 1)
  }

  const removeFromCart = (productId: string) => {
    updateQuantity(productId, -1)
  }

  const removeItemFromCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: 0 }))
  }

  const totalAmount = products.reduce((sum, product) => {
    const quantity = cart[product.id] || 0
    return sum + product.price * quantity
  }, 0)

  const totalQuantity = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const totalItems = Object.values(cart).filter((qty) => qty > 0).length

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const getCartItems = () => {
    return products
      .filter((product) => cart[product.id] > 0)
      .map((product) => ({
        product_id: product.id,
        product_name: product.name,
        quantity: cart[product.id],
        unit_name: product.base_unit || 'piece',
        unit_price: product.price,
        subtotal: product.price * cart[product.id],
      }))
  }

  if (posScreen === "payment") {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setPosScreen("pos")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Amount Payable Section */}
        <div className="text-center py-12 px-4 bg-white">
          <h1 className="text-xl font-bold text-gray-800 mb-6 tracking-wide">AMOUNT PAYABLE</h1>
          <div className="text-7xl font-bold text-pink-500 mb-4">
            ₱{totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Payment Options */}
        <div className="px-6 py-8">
          <p className="text-center text-gray-400 mb-8 text-lg">Choose payment option</p>
          
          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-12">
            <Button 
              onClick={() => setPaymentOption("pay-later")}
              className={`flex-1 py-4 rounded-full font-medium text-lg transition-all ${
                paymentOption === "pay-later" 
                  ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              PAY LATER
            </Button>
            <Button 
              onClick={() => setPaymentOption("multi-payment")}
              className={`flex-1 py-4 rounded-full font-medium text-lg transition-all ${
                paymentOption === "multi-payment" 
                  ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              MULTI PAYMENT
            </Button>
          </div>

          {/* Payment Method Buttons */}
          {paymentOption === "pay-later" ? (
            <div className="space-y-4">
              {/* Cash Payment with Amount Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="Enter cash amount"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 text-lg py-3"
                  />
                  <Button 
                    onClick={() => handleTransaction("cash")}
                    disabled={isProcessing || cashAmount < totalAmount}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 text-lg font-bold rounded-xl"
                  >
                    💵 Cash
                  </Button>
                </div>
                {cashAmount > 0 && cashAmount >= totalAmount && (
                  <div className="text-center text-green-600 font-medium">
                    Change: ₱{(cashAmount - totalAmount).toFixed(2)}
                  </div>
                )}
                {cashAmount > 0 && cashAmount < totalAmount && (
                  <div className="text-center text-red-600 font-medium">
                    Insufficient amount
                  </div>
                )}
              </div>
              
              {/* Digital Payment Methods Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleTransaction("card")}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">💳</div>
                    <div>Card</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleTransaction("gcash")}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">📱</div>
                    <div>GCash</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleTransaction("paymaya")}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">💚</div>
                    <div>PayMaya</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleTransaction("grab-pay")}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-6 text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <div className="text-center">
                    <div className="text-xl mb-1">🚗</div>
                    <div>GrabPay</div>
                  </div>
                </Button>
              </div>
              
              {/* Credit Payment */}
              <Button 
                onClick={() => handleTransaction("credit")}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <div className="text-center">
                  <div className="text-xl">{isProcessing ? 'Processing...' : '📋 Credit'}</div>
                  {!isProcessing && <div className="text-lg opacity-90 font-medium">UTANG</div>}
                </div>
              </Button>
            </div>
          ) : (
            /* Multi-Payment Mode */
            <div className="space-y-4">
              {/* Current Payments List */}
              {multiPayments.length > 0 && (
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-gray-800 mb-3">Selected Payments:</h3>
                  {multiPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="capitalize font-medium">{payment.method}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₱{payment.amount.toFixed(2)}</span>
                        <Button
                          onClick={() => removePaymentMethod(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Paid:</span>
                      <span>₱{multiPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Remaining:</span>
                      <span>₱{(totalAmount - multiPayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                {['cash', 'card', 'gcash', 'paymaya'].map((method) => (
                  <div key={method} className="space-y-2">
                    <Input
                      type="number"
                      placeholder={`${method} amount`}
                      id={`amount-${method}`}
                      className="text-center"
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById(`amount-${method}`) as HTMLInputElement
                        const amount = parseFloat(input.value) || 0
                        if (amount > 0) {
                          addPaymentMethod(method, amount)
                          input.value = ''
                        }
                      }}
                      className="w-full py-2 text-sm capitalize bg-purple-500 hover:bg-purple-600 text-white rounded"
                    >
                      Add {method}
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Complete Multi-Payment */}
              {multiPayments.length > 0 && Math.abs(multiPayments.reduce((sum, p) => sum + p.amount, 0) - totalAmount) < 0.01 && (
                <Button
                  onClick={() => handleTransaction("multi")}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-6 text-xl font-bold rounded-xl shadow-lg"
                >
                  Complete Multi-Payment
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (posScreen === "receipt") {
    const cartItems = getCartItems()
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const formattedTime = currentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

    return (
      <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => setPosScreen("pos")} />
            <div>
              <h1 className="text-lg font-semibold">Jr & Mai Agrivet</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Receipt No.</p>
            <p className="text-lg font-semibold">000006</p>
          </div>
        </div>

        {/* Receipt Items */}
        <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
          {cartItems.map((item) => (
            <div key={item.product_id} className="flex items-center bg-gray-200 border-b border-gray-300 last:border-b-0">
              <div className="flex-1 p-3">
                <h3 className="font-medium text-sm">{item.product_name}</h3>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => updateQuantity(item.product_id, -1)}
                  className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQty = parseFloat(e.target.value) || 0;
                    if (newQty >= 0) {
                      setCart(prev => ({
                        ...prev,
                        [item.product_id]: newQty
                      }));
                    }
                  }}
                  className="w-12 bg-white text-center py-2 text-sm font-semibold border-0 outline-none"
                  min="0"
                  step="0.1"
                />
                <button
                  onClick={() => updateQuantity(item.product_id, 1)}
                  className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="w-16 text-center text-sm font-semibold py-2">{item.unit_price.toFixed(2)}</div>
              <div className="w-16 text-center text-sm font-semibold py-2">{item.subtotal.toFixed(2)}</div>
              <button
                onClick={() => removeItemFromCart(item.product_id)}
                className="w-8 h-8 bg-red-500 text-white flex items-center justify-center mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Date and Total */}
        <div className="px-4 mt-6">
          <p className="text-sm text-gray-600 mb-4">
            {formattedDate} | {formattedTime}
          </p>
          <div className="flex justify-between items-center border-t border-b border-gray-300 py-3">
            <span className="text-lg font-semibold">GRAND TOTAL:</span>
            <span className="text-xl font-bold">{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
                <ShoppingCart className="w-6 h-6 mx-auto" />
              </div>
              <p className="text-xs font-medium">Add Items</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
                <Package className="w-6 h-6 mx-auto" />
              </div>
              <p className="text-xs font-medium">Scan Items</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
                <span className="text-lg font-bold">%</span>
              </div>
              <p className="text-xs font-medium">Discount</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
                <span className="text-lg font-bold">₱</span>
              </div>
              <p className="text-xs font-medium">Service Fee</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-2">
                <span className="text-lg font-bold">🚚</span>
              </div>
              <p className="text-xs font-medium">Delivery Fee</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="px-4 mt-6">
          <button
            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
            className="w-full bg-purple-600 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <span className="font-semibold">Customer's Details and Notes</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showCustomerDetails ? "rotate-180" : ""}`} />
          </button>

          {showCustomerDetails && (
            <div className="mt-4 space-y-4">
              <Input
                placeholder="Customer's name"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-white"
              />
              <Input
                placeholder="Customer's number"
                value={customerDetails.number}
                onChange={(e) => setCustomerDetails((prev) => ({ ...prev, number: e.target.value }))}
                className="bg-white"
              />
              <Input
                placeholder="Customer's address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails((prev) => ({ ...prev, address: e.target.value }))}
                className="bg-white"
              />
              <textarea
                placeholder="Notes"
                value={customerDetails.notes}
                onChange={(e) => setCustomerDetails((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white resize-none h-24"
              />
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="px-4 mt-6 pb-6">
          <Button 
            onClick={() => setPosScreen("payment")}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 text-lg font-semibold rounded-lg"
          >
            CONFIRM
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onBack} role="button" aria-label="Back" />
          <h1 className="text-xl font-semibold">POS</h1>
        </div>
        <div className="flex gap-2">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4 py-2 text-sm">
            Product Filter
          </Button>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4 py-2 text-sm">
            Product View
          </Button>
          <div className="bg-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            <span className="text-sm font-semibold">{totalItems}</span>
          </div>
        </div>
      </div>

      <div className="flex pb-32">
        {/* Sidebar */}
        <div className="w-32 bg-white">
          <div
            onClick={() => setActiveCategory("All")}
            className={`px-3 py-4 text-sm border-b cursor-pointer ${
              activeCategory === "All" ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </div>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setActiveCategory(category.name)}
              className={`px-3 py-4 text-sm border-b cursor-pointer ${
                activeCategory === category.name ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category.name}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Product List */}
          <div className="space-y-1 p-2">
            {filteredProducts.map((product) => {
              const quantity = cart[product.id] || 0
              return (
                <div key={product.id} className="flex">
                  <div
                    className="flex-1 bg-slate-800 text-white rounded-l-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-slate-700"
                    onClick={() => addToCart(product.id)}
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-xs">{product.name}</h3>
                      <p className="text-[10px] text-gray-300">{product.stock} Pcs (Stocks)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">₱ {(product.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="w-12 bg-green-500 text-white rounded-r-lg flex flex-col items-center justify-center relative py-1">
                    {quantity > 0 && (
                      <>
                        <button
                          onClick={() => updateQuantity(product.id, 0.5)}
                          className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[8px] hover:bg-green-700"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[8px] hover:bg-green-700"
                        >
                          -
                        </button>
                      </>
                    )}
                    <span className="text-sm font-bold">{quantity.toFixed(2)}</span>
                    <span className="text-[8px]">QTY</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* No More Items */}
          <div className="mt-4 mx-2 mb-4">
            <div className="bg-gray-600 text-white text-center py-3 rounded">No more items to show</div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="fixed bottom-44 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-2 z-10">
        <div
          className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white shadow-lg cursor-pointer hover:opacity-90"
          onClick={() => setPosScreen("receipt")}
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">REVIEW</span>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-xs opacity-80">TOTAL AMOUNT</p>
                <p className="text-lg font-bold">{totalAmount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-80">PRODUCT QTY</p>
                <p className="text-lg font-bold">{totalQuantity.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-pink-500 p-4 z-20">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search product"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 py-3 rounded-full bg-white"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ShoppingCart className="w-5 h-5 text-pink-500" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <div className="flex-1 text-center cursor-pointer hover:opacity-80">
            <div className="bg-white rounded-lg p-3 mb-2">
              <ShoppingCart className="w-8 h-8 text-pink-500 mx-auto" />
            </div>
            <p className="text-white text-xs font-medium">SCAN PRODUCT</p>
          </div>
          <div className="flex-1 text-center cursor-pointer hover:opacity-80">
            <div className="bg-white rounded-lg p-3 mb-2">
              <Package className="w-8 h-8 text-pink-500 mx-auto" />
            </div>
            <p className="text-white text-xs font-medium">NON-INVENTORY PRODUCT</p>
          </div>
          <div className="flex-1 text-center cursor-pointer hover:opacity-80">
            <div className="bg-white rounded-lg p-3 mb-2">
              <Plus className="w-8 h-8 text-pink-500 mx-auto" />
            </div>
            <p className="text-white text-xs font-medium">ADD PRODUCT</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InventoryScreen({ products, categories, setProducts, setCurrentScreen, handleEditProduct, handleDeleteProduct, handleAddStock, handleDuplicateProduct }: { products: any[]; categories: any[]; setProducts: React.Dispatch<React.SetStateAction<any[]>>; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "add-product" | "profile">>; handleEditProduct: any; handleDeleteProduct: any; handleAddStock: any; handleDuplicateProduct: any }) {
  const [activeTab, setActiveTab] = useState<"list" | "replenishment">("list")
  const [showStockAtCategory, setShowStockAtCategory] = useState(true)
  const [showStockInPOS, setShowStockInPOS] = useState(true)
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", stock: 0, price: 0 })

  const getCategoryStock = (categoryName: string) => {
    if (categoryName === "All") {
      return products.reduce((sum, product) => sum + product.stock, 0)
    }
    return products
      .filter((product) => product.category === categoryName)
      .reduce((sum, product) => sum + product.stock, 0)
  }

  const handleEditProductLocal = async (product: any) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      stock: product.stock,
      price: product.price,
    })
  }

  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        const result = await handleEditProduct(editingProduct, editForm)
        
        if (result.success) {
          setEditingProduct(null)
          // Local state will be updated via real-time subscription
        } else {
          alert(`Failed to update product: ${result.error}`)
        }
      } catch (error) {
        console.error('Error updating product:', error)
        alert(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }



  return (
    <div className="h-screen bg-gray-100 max-w-sm mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">INVENTORY</h1>
        </div>

        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-3 px-4 font-semibold ${
              activeTab === "list" ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            INVENTORY LIST
          </button>
          <button
            onClick={() => setActiveTab("replenishment")}
            className={`flex-1 py-3 px-4 font-semibold ${
              activeTab === "replenishment" ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            REPLENISHMENT
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">{/* pb-20 for bottom navigation space */}

      {activeTab === "list" && (
        <>
          {/* Toggle Switches */}
          <div className="bg-white px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setShowStockAtCategory(!showStockAtCategory)}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  showStockAtCategory ? "bg-pink-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    showStockAtCategory ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-600">Show stock count at category level</span>
            </div>

            <div className="flex items-center gap-3">
              <div
                onClick={() => setShowStockInPOS(!showStockInPOS)}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  showStockInPOS ? "bg-pink-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    showStockInPOS ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-600">Show stock count in POS</span>
            </div>
          </div>

          {/* All Inventory List Header */}
          <div className="bg-gray-200 py-4 text-center">
            <h2 className="text-lg font-bold text-gray-800">ALL INVENTORY LIST</h2>
          </div>

          {/* Category Cards - Now Scrollable */}
          <div className="px-4 py-4 space-y-4">
            {categories
              .filter((cat) => cat.name !== "All")
              .map((category) => (
                <div key={category.name} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{category.name.toUpperCase()}</h3>
                    <span className="text-sm font-bold text-gray-600">
                      STOCKS: {getCategoryStock(category.name).toFixed(1)}
                    </span>
                  </div>

                  {/* Products in Category */}
                  <div className="space-y-2">
                    {products
                      .filter((product) => product.category === category.name)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          {editingProduct === product.id ? (
                            <div className="flex-1 space-y-2">
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="text-sm"
                                placeholder="Product name"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={editForm.stock}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                                  className="text-sm flex-1"
                                  placeholder="Stock"
                                />
                                <Input
                                  type="number"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                                  className="text-sm flex-1"
                                  placeholder="Price"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSaveEdit}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm flex-1"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingProduct(null)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0 pr-3">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <p className="text-xs text-gray-600">
                                    Stock: <span className="font-medium text-gray-900">{product.stock}</span>
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Price: <span className="font-medium text-green-600">₱{(product.price || 0).toFixed(2)}</span>
                                  </p>
                                </div>
                                {product.units && product.units.length > 1 && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    🔢 {product.units.length} units available
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => handleAddStock(product.id, -1)}
                                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                                  title="Remove stock"
                                >
                                  -
                                </button>
                                <button
                                  onClick={() => handleAddStock(product.id, 1)}
                                  className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                                  title="Add stock"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => handleEditProductLocal(product)}
                                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
                                  title="Edit product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

        {activeTab === "replenishment" && (
          <div className="px-4 py-8 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Replenishment Feature</h3>
            <p className="text-sm text-gray-500">Track and manage inventory replenishment needs</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3 relative">
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("dashboard")}>
            <Home className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Home</p>
          </div>

          <div className="text-center">
            <Package className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-600 font-medium">Inventory</p>
          </div>

          {/* Add Product Button - Center */}
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("add-product")}>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-1 mx-auto shadow-lg transform hover:scale-105 transition-all">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-purple-600 font-medium">Add Product</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
            <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Products</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
            <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Store</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductsScreen({ onBack, products, setProducts, setCurrentScreen, handleEditProduct, handleDeleteProduct, handleDuplicateProduct, handleCreateProduct, handleBulkDeleteProducts, categories }: { onBack: () => void; products: any[]; setProducts: React.Dispatch<React.SetStateAction<any[]>>; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "add-product" | "profile">>; handleEditProduct: any; handleDeleteProduct: any; handleDuplicateProduct: any; handleCreateProduct: any; handleBulkDeleteProducts: any; categories: any[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", price: 0, stock: 0, category: "" })
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "Baby Powder",
    image: "/placeholder.svg",
  })



  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name)
      } else {
        return b.name.localeCompare(a.name)
      }
    })

  const groupedProducts = filteredProducts.reduce(
    (acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = []
      }
      acc[product.category].push(product)
      return acc
    },
    {} as Record<string, typeof products>,
  )

  const handleEditProductLocal = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
    })
  }

  const handleSaveEdit = async () => {
    if (editingProduct) {
      try {
        const result = await handleEditProduct(editingProduct, {
          name: editForm.name,
          stock: editForm.stock,
          price: editForm.price
        })
        
        if (result.success) {
          setEditingProduct(null)
          // Local state will be updated via real-time subscription
        } else {
          alert(`Failed to update product: ${result.error}`)
        }
      } catch (error) {
        console.error('Error updating product:', error)
        alert(`Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleDeleteProductLocal = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      const result = await handleDeleteProduct(productId.toString())
      
      if (result.success) {
        // Products will be updated via real-time subscription
      } else {
        alert(`Failed to delete product: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    
    const confirmMessage = `Are you sure you want to delete ${selectedProducts.length} selected product${selectedProducts.length > 1 ? 's' : ''}?`
    if (!confirm(confirmMessage)) {
      return
    }
    
    try {
      const result = await handleBulkDeleteProducts(selectedProducts.map(id => id.toString()))
      
      if (result.success) {
        alert(`Successfully deleted ${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''}!`)
        setSelectedProducts([])
        setBulkEditMode(false)
      } else {
        alert(`Failed to delete products: ${result.error}`)
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      alert(`Failed to delete products: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddProduct = async () => {
    if (!newProductForm.name || newProductForm.price <= 0) {
      alert('Please fill in all required fields (name and price).')
      return
    }
    
    try {
      // Find the category_id for the selected category
      const selectedCategory = categories.find((cat: any) => cat.name === newProductForm.category)
      if (!selectedCategory) {
        alert('Invalid category selected.')
        return
      }
      
      const newProduct = {
        name: newProductForm.name,
        description: '',
        sku: `PROD-${Date.now()}`,
        category_id: selectedCategory.id,
        price_retail: newProductForm.price,
        price_wholesale: null,
        cost: 0,
        stock: newProductForm.stock,
        unit: 'pcs',
        image_url: newProductForm.image === '/placeholder.svg' ? null : newProductForm.image
      }
      
      const result = await handleCreateProduct(newProduct)
      
      if (result.success) {
        // Products will be updated via real-time subscription
        // Reset form and close
        setNewProductForm({
          name: '',
          price: 0,
          stock: 0,
          category: 'Baby Powder',
          image: '/placeholder.svg',
        })
        setShowAddForm(false)
        alert('Product added successfully!')
      } else {
        alert(`Failed to add product: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
      {/* Products Screen */}
      <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
            <div className="flex items-center gap-4">
              <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onBack} role="button" aria-label="Back" />
              <h1 className="text-2xl font-bold text-gray-800">PRODUCTS</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex flex-col items-center"
              >
                <span className="text-sm font-bold">A</span>
                <span className="text-xs">Z</span>
                {sortOrder === "desc" && <span className="text-xs">↓</span>}
                {sortOrder === "asc" && <span className="text-xs">↑</span>}
              </button>
              <div className="flex items-center gap-1">
                <span className="text-lg">₱</span>
                <div className="flex flex-col">
                  <div className="w-3 h-1 bg-gray-400"></div>
                  <div className="w-3 h-1 bg-gray-400 mt-0.5"></div>
                  <div className="w-3 h-1 bg-gray-400 mt-0.5"></div>
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} aria-label="Back" title="Back">
            <ArrowLeft className="w-6 h-6 cursor-pointer" />
          </button>
          <h1 className="text-xl font-semibold">POS</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search products"
              className="border-none outline-none"
            />
          </div>
          <div className="bg-purple-600 p-2 rounded">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-lg">₱</span>
                <div className="flex flex-col">
                  <div className="w-3 h-1 bg-gray-400"></div>
                  <div className="w-3 h-1 bg-gray-400 mt-0.5"></div>
                  <div className="w-3 h-1 bg-gray-400 mt-0.5"></div>
                </div>
              </div>
              <div className="bg-purple-600 p-2 rounded">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-lg">₱</span>
                <div className="flex flex-col">
                  <div className="w-3 h-1 bg-gray-400"></div>
                  <div className="w-3 h-1 bg-gray-400 mt-0.5"></div>
                  <div className="w-3 h-1 bg-gray-400 mt-0.5"></div>
                </div>
              </div>
              <div className="bg-purple-600 p-2 rounded">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
            </div>
              </div>
            </div>
          </div>

          {/* Bulk Edit and Search */}
          <div className="flex gap-3 mb-4 px-4">
            <Button
              onClick={() => setBulkEditMode(!bulkEditMode)}
              className={`${bulkEditMode ? "bg-red-500 hover:bg-red-600" : "bg-purple-600 hover:bg-purple-700"} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
            >
              <Edit className="w-4 h-4" />
              {bulkEditMode ? "CANCEL" : "BULK EDIT"}
            </Button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 border-gray-300"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkEditMode && selectedProducts.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg mx-4">
              <p className="text-sm text-red-600 mb-2">{selectedProducts.length} products selected</p>
              <Button
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              >
                Delete Selected
              </Button>
            </div>
          )}

          {/* Add Product Form */}
          {showAddForm && (
            <div className="bg-white mx-4 mb-4 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Add New Product</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Product name"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={newProductForm.price}
                  onChange={(e) => setNewProductForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={newProductForm.stock}
                  onChange={(e) => setNewProductForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                />
                <select
                  value={newProductForm.category}
                  onChange={(e) => setNewProductForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Baby Powder">Baby Powder</option>
                  <option value="Coffee and Creamer">Coffee and Creamer</option>
                  <option value="Powder Drink">Powder Drink</option>
                </select>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddProduct}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Add Product
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="px-4 pb-24">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category} className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">{category}</h2>
                <div className="space-y-3">
                  {(categoryProducts as any[]).map((product: any) => (
                    <div key={product.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                      {bulkEditMode && (
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4"
                        />
                      )}

                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      {editingProduct === product.id ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={editForm.price}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                              className="text-sm"
                              placeholder="Price"
                            />
                            <Input
                              type="number"
                              value={editForm.stock}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                              className="text-sm"
                              placeholder="Stock"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveEdit}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingProduct(null)}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{product.name}</h3>
                          <p className="text-lg font-bold text-gray-900">₱{(product.price || 0).toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                      )}

                      {!bulkEditMode && editingProduct !== product.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProductLocal(product)}
                            className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProductLocal(product.id)}
                            className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const result = await handleDuplicateProduct(product)
                                if (result.success) {
                                  alert('Product duplicated successfully!')
                                } else {
                                  alert(`Failed to duplicate product: ${result.error}`)
                                }
                              } catch (error) {
                                console.error('Error duplicating product:', error)
                                alert(`Failed to duplicate product: ${error instanceof Error ? error.message : 'Unknown error'}`)
                              }
                            }}
                            className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
            <div className="flex justify-around items-center py-3 relative">
              <div className="text-center cursor-pointer hover:opacity-80" onClick={onBack}>
                <Home className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Home</p>
              </div>

              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("inventory")}>
                <Package className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Inventory</p>
              </div>

              {/* Add Product Button - Center */}
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("add-product")}>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-1 mx-auto shadow-lg transform hover:scale-105 transition-all">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-purple-600 font-medium">Add Product</p>
              </div>

              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
                <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-purple-600 font-medium">Products</p>
              </div>

              <div className="text-center">
                <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Store</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<
    "dashboard" | "pos" | "inventory" | "products" | "add-product" | "profile" | "customers" | "analytics" | "enhanced-analytics" | "locations" | "barcode" | "inventory-count" | "suppliers" | "purchase-orders" | "offline-transactions" | "rbac" | "consolidated-reporting"
  >("dashboard")
  
  const { profile } = useAuth()
  
  // Use Supabase hooks for real data
  const { products: dbProducts, loading: productsLoading, createProduct, updateProduct, deleteProduct, updateStock, fetchProducts } = useProducts()
  const { categories, loading: categoriesLoading, createCategory } = useCategories()
  const { createTransaction } = useTransactions()
  const { customers, createCustomer } = useCustomers()
  
  // Fetch products with location filter
  useEffect(() => {
    if (profile?.location_id) {
      fetchProducts(profile.location_id)
    } else {
      fetchProducts()
    }
  }, [profile?.location_id])
  
  // Transform database products to match the component structure
  const products = dbProducts.map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    price: product.price_retail,
    image: product.image_url || "/placeholder.svg",
    category: categories.find(cat => cat.id === product.category_id)?.name || "Uncategorized",
    baseUnit: product.base_unit || "piece",
    cost: product.cost || 0,
    units: product.units || []
  }))
  
  // Handle product updates
  const setProducts = async (updateFn: any) => {
    // This is a simplified version - in real app, you'd handle specific updates
    console.log('Product update requested')
  }

  // Supabase-dependent functions that need to be accessible to nested components
  const handleEditProduct = async (productId: number, editForm: {name: string, stock: number, price: number}) => {
    try {
      const result = await updateProduct(productId.toString(), {
        name: editForm.name,
        stock: editForm.stock,
        price_retail: editForm.price
      })
      
      if (result.success) {
        // Products will be updated via real-time subscription
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const result = await deleteProduct(productId)
      
      if (result.success) {
        // Products will be updated via real-time subscription
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleAddStock = async (productId: string, newStock: number) => {
    try {
      const result = await updateStock(productId, newStock)
      
      if (result.success) {
        // Products will be updated via real-time subscription
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error updating stock:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleDuplicateProduct = async (product: any) => {
    try {
      const duplicatedProduct = {
        name: `${product.name} (Copy)`,
        description: product.description || '',
        sku: `${product.sku || 'COPY'}-${Date.now()}`,
        category_id: product.category_id,
        price_retail: product.price,
        price_wholesale: product.price_wholesale || null,
        cost: product.cost || 0,
        stock: 0, // Start with 0 stock for duplicate
        unit: product.unit || 'pcs',
        image_url: product.image_url || null
      }
      
      const result = await createProduct(duplicatedProduct)
      
      if (result.success) {
        // Products will be updated via real-time subscription
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error duplicating product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleCreateProduct = async (productData: any) => {
    try {
      const result = await createProduct(productData)
      
      if (result.success) {
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error creating product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleBulkDeleteProducts = async (productIds: string[]) => {
    try {
      // Delete products one by one (Supabase doesn't support bulk delete in hooks)
      const deletePromises = productIds.map(productId => deleteProduct(productId))
      const results = await Promise.all(deletePromises)
      
      // Check if all deletions were successful
      const failedDeletions = results.filter((result: any) => !result.success)
      
      if (failedDeletions.length > 0) {
        return { success: false, error: `Some deletions failed. ${productIds.length - failedDeletions.length} products deleted successfully.` }
      } else {
        return { success: true }
      }
    } catch (error) {
      console.error('Error in bulk delete:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  const handleSaveNewProduct = async (productData: any) => {
    try {
      // Prepare units for database
      const units = productData.units.map((unit: any) => ({
        unit_name: unit.name,
        conversion_factor: unit.conversionFactor || 1,
        price: Number(unit.price) || 0,
        unit_type: unit.type as 'retail' | 'wholesale',
        is_base_unit: unit.isBase || false,
        display_order: 0
      }));

      // Prepare product data without units field
      const { units: _, ...productToSave } = productData;
      
      // Ensure we have a valid SKU
      if (!productToSave.sku) {
        productToSave.sku = `PRD${Date.now()}`;
      }

      const result = await createProduct(productToSave, units);
      
      if (result.success) {
        setCurrentScreen("dashboard")
      } else {
        alert(`Failed to create product: ${result.error}`)
      }
    } catch (error) {
      console.error('Error in handleSaveNewProduct:', error)
      alert(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }


  
      if (currentScreen === "pos") {
        return <POSScreen onBack={() => setCurrentScreen("dashboard")} products={products} categories={categories} setCurrentScreen={setCurrentScreen} createTransaction={createTransaction} updateStock={handleAddStock} fetchProducts={() => fetchProducts(profile?.location_id)} profile={profile} />
      }

      if (currentScreen === "inventory") {
        return <InventoryScreen products={products} categories={categories} setProducts={setProducts} setCurrentScreen={setCurrentScreen} handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct} handleAddStock={handleAddStock} handleDuplicateProduct={handleDuplicateProduct} />
      }

      if (currentScreen === "products") {
        return <ProductsScreen onBack={() => setCurrentScreen("dashboard")} products={products} setProducts={setProducts} setCurrentScreen={setCurrentScreen} handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct} handleDuplicateProduct={handleDuplicateProduct} handleCreateProduct={handleCreateProduct} handleBulkDeleteProducts={handleBulkDeleteProducts} categories={categories} />
      }

      if (currentScreen === "add-product") {
        return <AddProduct onBack={() => setCurrentScreen("dashboard")} onSave={handleSaveNewProduct} />
      }

      if (currentScreen === "profile") {
        return <UserProfile onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "customers") {
        return <CustomerManagement onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "locations") {
        return <LocationManagement onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "analytics") {
        return <AnalyticsDashboard onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "enhanced-analytics") {
        return <EnhancedAnalyticsDashboard onBack={() => setCurrentScreen("analytics")} />
      }

      if (currentScreen === "barcode") {
        return <BarcodeScanner onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "inventory-count") {
        return <InventoryCount onBack={() => setCurrentScreen("inventory")} />
      }

      if (currentScreen === "suppliers") {
        return <SupplierManagement onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "purchase-orders") {
        return <PurchaseOrderManagement onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "offline-transactions") {
        return <OfflineTransactions onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "rbac") {
        return <RBACManagement onBack={() => setCurrentScreen("dashboard")} />
      }

      if (currentScreen === "consolidated-reporting") {
        return <ConsolidatedReporting onBack={() => setCurrentScreen("dashboard")} />
      }

      // Default to dashboard
      return (
        <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
          {/* Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Peddlr</h1>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <Settings className="w-5 h-5 text-gray-600" />
              <UserCircle className="w-6 h-6 text-gray-600 cursor-pointer" onClick={() => setCurrentScreen("profile")} />
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 mx-4 mt-4 text-white">
            <p className="text-sm opacity-80">Your Balance</p>
            <p className="text-3xl font-bold mt-2">P 0.00</p>
            <div className="flex gap-4 mt-4">
              <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                Send
              </button>
              <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                Receive
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mx-4 mt-6">
            <button 
              className="bg-white rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setCurrentScreen("pos")}
            >
              <ShoppingBag className="w-8 h-8 text-pink-500 mb-2" />
              <span className="font-medium text-gray-800">POS</span>
            </button>
            <button 
              className="bg-white rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setCurrentScreen("products")}
            >
              <Package className="w-8 h-8 text-purple-500 mb-2" />
              <span className="font-medium text-gray-800">Products</span>
            </button>
            <button 
              className="bg-white rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setCurrentScreen("inventory")}
            >
              <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
              <span className="font-medium text-gray-800">Inventory</span>
            </button>
            <button 
              className="bg-white rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setCurrentScreen("customers")}
            >
              <Users className="w-8 h-8 text-green-500 mb-2" />
              <span className="font-medium text-gray-800">Customers</span>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg mx-4 mt-6 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-800">Recent Transactions</h2>
              <button className="text-pink-500 text-sm font-medium">See All</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Sale #12345</p>
                    <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                  </div>
                </div>
                <p className="font-medium text-green-500">+P 1,250.00</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Restock #67890</p>
                    <p className="text-xs text-gray-500">Yesterday, 2:15 PM</p>
                  </div>
                </div>
                <p className="font-medium text-red-500">-P 850.00</p>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
            <div className="flex justify-around items-center py-3 relative">
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("dashboard")}>
                <Home className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-purple-600 font-medium">Home</p>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("inventory")}>
                <Package className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Inventory</p>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
                <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Store</p>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
                <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Products</p>
              </div>
              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("analytics")}>
                <BarChart3 className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Analytics</p>
              </div>
            </div>
          </div>
        </div>
      )
}

export default function Home() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}
