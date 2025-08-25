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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import AddProduct from "@/components/add-product"
import { useProducts } from "@/lib/hooks/useProducts"
import { useCategories } from "@/lib/hooks/useCategories"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCustomers } from "@/lib/hooks/useCustomers"

function POSScreen({ onBack, products, categories, setCurrentScreen, createTransaction, updateStock }: { onBack: () => void; products: any[]; categories: any[]; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "addProduct">>; createTransaction: any; updateStock: any }) {
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

  // Handle payment transaction processing
  const handleTransaction = async (paymentMethod: 'cash' | 'credit') => {
    if (totalItems === 0) {
      alert('Cart is empty. Please add items before processing payment.')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Get cart items for transaction
      const cartItems = getCartItems()
      
      // Create transaction record
      const transactionData = {
        items: cartItems,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_option: paymentOption,
        customer_details: showCustomerDetails ? customerDetails : null,
        status: paymentMethod === 'credit' ? 'pending' : 'completed',
        transaction_date: new Date().toISOString()
      }
      
      console.log('Processing transaction:', transactionData)
      
      // Call the createTransaction hook
      const transactionResult = await createTransaction(transactionData)
      
      if (transactionResult.success) {
        // Update stock for all items in the cart
        for (const item of cartItems) {
          await updateStock(item.id, -item.quantity) // Reduce stock by quantity sold
        }
        
        // Clear cart after successful transaction
        setCart({})
        
        // Reset customer details
        setCustomerDetails({ name: '', number: '', address: '', notes: '' })
        setShowCustomerDetails(false)
        
        // Show success message
        alert(`Transaction completed successfully! ${paymentMethod === 'credit' ? 'Credit payment recorded.' : 'Cash payment processed.'}`)
        
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

  const updateQuantity = (productId: string, change: number) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0
      const newQty = Math.max(0, currentQty + change)
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
        ...product,
        quantity: cart[product.id],
        total: product.price * cart[product.id],
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
          <div className="space-y-6">
            <Button 
              onClick={() => handleTransaction("cash")}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-8 text-2xl font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {isProcessing ? 'Processing...' : 'Cash'}
            </Button>
            <Button 
              onClick={() => handleTransaction("credit")}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-8 text-2xl font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              <div className="text-center">
                <div className="text-2xl">{isProcessing ? 'Processing...' : 'Credit'}</div>
                {!isProcessing && <div className="text-lg opacity-90 font-medium">UTANG</div>}
              </div>
            </Button>
          </div>
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
            <div key={item.id} className="flex items-center bg-gray-200 border-b border-gray-300 last:border-b-0">
              <div className="flex-1 p-3">
                <h3 className="font-medium text-sm">{item.name}</h3>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
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
                        [item.id]: newQty
                      }));
                    }
                  }}
                  className="w-12 bg-white text-center py-2 text-sm font-semibold border-0 outline-none"
                  min="0"
                  step="0.1"
                />
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="w-16 text-center text-sm font-semibold py-2">{item.price.toFixed(2)}</div>
              <div className="w-16 text-center text-sm font-semibold py-2">{item.total.toFixed(2)}</div>
              <button
                onClick={() => removeItemFromCart(item.id)}
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
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onBack} />
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
                      <p className="text-xs font-semibold">₱ {product.price.toFixed(2)}</p>
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

function InventoryScreen({ products, categories, setProducts, setCurrentScreen }: { products: any[]; categories: any[]; setProducts: React.Dispatch<React.SetStateAction<any[]>>; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "addProduct">> }) {
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

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      stock: product.stock,
      price: product.price,
    })
  }

  const handleSaveEdit = () => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((product) => (product.id === editingProduct ? { ...product, ...editForm } : product)),
      )
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId))
  }

  const handleAddStock = (productId: number, amount: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, stock: Math.max(0, product.stock + amount) } : product,
      ),
    )
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
                                    Price: <span className="font-medium text-green-600">₱{product.price}</span>
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
                                  onClick={() => handleEditProduct(product)}
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

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("addProduct")}>
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1">Add Product</p>
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

function ProductsScreen({ onBack, products, setProducts, setCurrentScreen }: { onBack: () => void; products: any[]; setProducts: React.Dispatch<React.SetStateAction<any[]>>; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "addProduct">> }) {
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

  const [showAddProductForm, setShowAddProductForm] = useState(false)
  const [showModernAddProduct, setShowModernAddProduct] = useState(false)
  const [addProductForm, setAddProductForm] = useState({
    productGroup: "",
    productName: "",
    productCode: "",
    baseUnit: "piece",
    price: "",
    cost: "",
    stocks: "",
    lowStockLevel: "",
    color: "#1e40af",
    hasVariant: false,
    hasAddOn: false,
    hasNotes: false,
    hasDescription: false,
    hasSellingMethod: false,
    addToOnlineStore: true,
    productCodeEnabled: false,
    units: [
      { name: "piece", conversionFactor: 1, price: "", isBase: true, type: "retail" },
      { name: "box", conversionFactor: 12, price: "", isBase: false, type: "wholesale" },
      { name: "case", conversionFactor: 144, price: "", isBase: false, type: "wholesale" },
      { name: "dozen", conversionFactor: 12, price: "", isBase: false, type: "wholesale" },
      { name: "pack", conversionFactor: 6, price: "", isBase: false, type: "wholesale" },
      { name: "carton", conversionFactor: 288, price: "", isBase: false, type: "wholesale" },
    ],
  })

  const convertToBaseUnit = (quantity: number, fromUnit: string, product: any) => {
    const unit = product.units.find((u: any) => u.name === fromUnit)
    return unit ? quantity * unit.conversionFactor : quantity
  }

  const convertFromBaseUnit = (baseQuantity: number, toUnit: string, product: any) => {
    const unit = product.units.find((u: any) => u.name === toUnit)
    return unit ? baseQuantity / unit.conversionFactor : baseQuantity
  }

  const getUnitPrice = (product: any, unitName: string) => {
    const unit = product.units.find((u: any) => u.name === unitName)
    return unit ? unit.price : product.price
  }

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

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
    })
  }

  const handleSaveEdit = () => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((product) => (product.id === editingProduct ? { ...product, ...editForm } : product)),
      )
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId))
  }

  const handleDuplicateProduct = (product: any) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: `${product.name} (Copy)`,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const handleBulkDelete = () => {
    setProducts((prev) => prev.filter((product) => !selectedProducts.includes(product.id)))
    setSelectedProducts([])
    setBulkEditMode(false)
  }

  const handleAddProductClick = () => {
    setShowModernAddProduct(true)
  }

  const handleSaveProduct = () => {
    if (!addProductForm.productName || !addProductForm.price) {
      alert("Please fill in required fields")
      return
    }

    // Calculate prices for other units based on base unit price and conversion factors
    const basePrice = Number(addProductForm.price)
    const baseCost = Number(addProductForm.cost) || 0

    const updatedUnits = addProductForm.units.map((unit) => ({
      ...unit,
      price: unit.isBase ? basePrice : unit.price || basePrice * unit.conversionFactor * 0.9, // 10% discount for bulk
    }))

    const newProduct = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: addProductForm.productName,
      price: basePrice,
      stock: Number(addProductForm.stocks) || 0,
      category: addProductForm.productGroup || "Baby Powder",
      image: "/diverse-products-still-life.png",
      baseUnit: addProductForm.baseUnit,
      cost: baseCost,
      units: updatedUnits,
    }

    setProducts((prev) => [...prev, newProduct])

    // Reset form
    setAddProductForm({
      productGroup: "",
      productName: "",
      productCode: "",
      baseUnit: "piece",
      price: "",
      cost: "",
      stocks: "",
      lowStockLevel: "",
      color: "#1e40af",
      hasVariant: false,
      hasAddOn: false,
      hasNotes: false,
      hasDescription: false,
      hasSellingMethod: false,
      addToOnlineStore: true,
      productCodeEnabled: false,
      units: [
        { name: "piece", conversionFactor: 1, price: "", isBase: true, type: "retail" },
        { name: "box", conversionFactor: 12, price: "", isBase: false, type: "wholesale" },
        { name: "case", conversionFactor: 144, price: "", isBase: false, type: "wholesale" },
        { name: "dozen", conversionFactor: 12, price: "", isBase: false, type: "wholesale" },
        { name: "pack", conversionFactor: 6, price: "", isBase: false, type: "wholesale" },
        { name: "carton", conversionFactor: 288, price: "", isBase: false, type: "wholesale" },
      ],
    })

    setShowAddProductForm(false)
    alert("Product with multi-unit pricing added successfully!")
  }

  const handleAddProduct = () => {
    const newProduct = {
      ...newProductForm,
      id: Math.max(...products.map((p) => p.id)) + 1,
    }
    setProducts((prev) => [...prev, newProduct])
    setNewProductForm({
      name: "",
      price: 0,
      stock: 0,
      category: "Baby Powder",
      image: "/placeholder.svg",
    })
    setShowAddForm(false)
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
              <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onBack} />
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
                </div>
              </div>
              <div className="bg-purple-600 p-2 rounded">
                <BarChart3 className="w-5 h-5 text-white" />
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
                  {categoryProducts.map((product) => (
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
                          <p className="text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                      )}

                      {!bulkEditMode && editingProduct !== product.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
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

              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("addProduct")}>
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs text-purple-600 font-medium mt-1">Add Product</p>
              </div>

              <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
                <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Products</p>
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

export default function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "pos" | "inventory" | "products" | "addProduct">(
                      onClick={() => {
                        const colors = ["#1e40af", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2"]
                        const currentIndex = colors.indexOf(addProductForm.color)
                        const nextColor = colors[(currentIndex + 1) % colors.length]
                        setAddProductForm((prev) => ({ ...prev, color: nextColor }))
                      }}
                    />
                  </div>

                  {/* Product Preview */}
                  <div className="flex-1 relative">
                    <div className="bg-gray-300 h-32 rounded-lg relative">
                      <button className="absolute top-2 right-2 text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                      <div
                        className="absolute bottom-0 left-0 right-0 h-12 rounded-b-lg flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: addProductForm.color }}
                      >
                        <div className="text-center">
                          <div className="text-sm">Product Name</div>
                          <div className="text-xs">Price</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Photo Options */}
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Photo</label>
                    <div className="space-y-2">
                      <button className="w-12 h-12 bg-black rounded flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </button>
                      <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Group */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Product Group <span className="text-gray-400">(Ex. Soft Drinks)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                    value={addProductForm.productGroup}
                    onChange={(e) => setAddProductForm((prev) => ({ ...prev, productGroup: e.target.value }))}
                    placeholder="Enter product group"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Product Name <span className="text-gray-400">(Ex. Coke Mismo 100ML)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                    value={addProductForm.productName}
                    onChange={(e) => setAddProductForm((prev) => ({ ...prev, productName: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>

                {/* Product Code */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700">Product Code (Optional)</span>
                  </div>
                  <button
                    onClick={() =>
                      setAddProductForm((prev) => ({ ...prev, productCodeEnabled: !prev.productCodeEnabled }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      addProductForm.productCodeEnabled ? "bg-purple-600" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        addProductForm.productCodeEnabled ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {addProductForm.productCodeEnabled && (
                  <input
                    type="text"
                    className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                    value={addProductForm.productCode}
                    onChange={(e) => setAddProductForm((prev) => ({ ...prev, productCode: e.target.value }))}
                    placeholder="Enter product code"
                  />
                )}

                {/* Unit of Measurement */}
                <div>
                  <label className="block text-gray-700 mb-2">Unit of Measurement:</label>
                  <div className="relative">
                    <select
                      className="w-full p-3 border border-gray-300 rounded bg-white appearance-none pr-10"
                      value={`${addProductForm.baseUnit} (${addProductForm.baseUnit === "piece" ? "pcs" : addProductForm.baseUnit})`}
                      onChange={(e) => {
                        const baseUnit = e.target.value.split(" ")[0]
                        setAddProductForm((prev) => ({ ...prev, baseUnit }))
                      }}
                    >
                      <option value="piece (pcs)">Per pieces (pcs)</option>
                      <option value="kilogram (kg)">Per kilogram (kg)</option>
                      <option value="liter (L)">Per liter (L)</option>
                      <option value="gram (g)">Per gram (g)</option>
                      <option value="bottle (btl)">Per bottle (btl)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-600" />
                  </div>
                </div>

                {/* Price and Cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Price <span className="text-gray-400">(Presyo o SRP)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                      value={addProductForm.price}
                      onChange={(e) => setAddProductForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Cost <span className="text-gray-400">(Puhunan)</span>
                    </label>
                    <input
                      type="number"
                      className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                      value={addProductForm.cost}
                      onChange={(e) => setAddProductForm((prev) => ({ ...prev, cost: e.target.value }))}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Stocks and Low Stock Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Stocks</label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-1 p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                        value={addProductForm.stocks}
                        onChange={(e) => setAddProductForm((prev) => ({ ...prev, stocks: e.target.value }))}
                        placeholder="0"
                      />
                      <span className="bg-gray-200 px-3 py-3 text-gray-600 text-sm">
                        {addProductForm.baseUnit === "piece" ? "pcs" : addProductForm.baseUnit}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Low Stock Level</label>
                    <div className="flex">
                      <input
                        type="number"
                        className="flex-1 p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                        value={addProductForm.lowStockLevel}
                        onChange={(e) => setAddProductForm((prev) => ({ ...prev, lowStockLevel: e.target.value }))}
                        placeholder="0"
                      />
                      <span className="bg-gray-200 px-3 py-3 text-gray-600 text-sm">
                        {addProductForm.baseUnit === "piece" ? "pcs" : addProductForm.baseUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multi-Unit of Measure Settings */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Multi-Unit of Measure Settings</h3>
                  <p className="text-sm text-gray-600 mb-4 italic">
                    Configure additional units and pricing for wholesale/bulk sales
                  </p>

                  {/* Additional Units Configuration */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Additional Units (Max 5):</h4>
                    {addProductForm.units.slice(1).map((unit, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-600">Unit {index + 2}</h5>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              unit.type === "wholesale" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                            }`}
                          >
                            {unit.type === "retail" ? "Retail" : "Wholesale"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {/* Unit Name */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Unit Name:</label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={unit.name}
                              onChange={(e) => {
                                const newUnits = [...addProductForm.units]
                                newUnits[index + 1].name = e.target.value
                                setAddProductForm((prev) => ({ ...prev, units: newUnits }))
                              }}
                            >
                              <option value="box">Box</option>
                              <option value="case">Case</option>
                              <option value="dozen">Dozen</option>
                              <option value="pack">Pack</option>
                              <option value="carton">Carton</option>
                              <option value="sack">Sack</option>
                              <option value="bag">Bag</option>
                              <option value="bundle">Bundle</option>
                            </select>
                          </div>

                          {/* Conversion Factor */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Conversion (How many {addProductForm.baseUnit}s = 1 {unit.name}):
                            </label>
                            <input
                              type="number"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={unit.conversionFactor}
                              onChange={(e) => {
                                const newUnits = [...addProductForm.units]
                                newUnits[index + 1].conversionFactor = Number(e.target.value) || 1
                                setAddProductForm((prev) => ({ ...prev, units: newUnits }))
                              }}
                              min="1"
                              step="0.1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              1 {unit.name} = {unit.conversionFactor} {addProductForm.baseUnit}(s)
                            </p>
                          </div>

                          {/* Unit Price */}
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Price per {unit.name}:</label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">₱</span>
                              <input
                                type="number"
                                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                                value={unit.price}
                                onChange={(e) => {
                                  const newUnits = [...addProductForm.units]
                                  newUnits[index + 1].price = e.target.value
                                  setAddProductForm((prev) => ({ ...prev, units: newUnits }))
                                }}
                                step="0.01"
                              />
                              <button
                                onClick={() => {
                                  if (addProductForm.price) {
                                    const basePrice = Number(addProductForm.price)
                                    const suggestedPrice = basePrice * unit.conversionFactor * 0.9 // 10% bulk discount
                                    const newUnits = [...addProductForm.units]
                                    newUnits[index + 1].price = suggestedPrice.toFixed(2)
                                    setAddProductForm((prev) => ({ ...prev, units: newUnits }))
                                  }
                                }}
                                className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs hover:bg-purple-200"
                              >
                                Auto
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { key: "hasVariant", label: "Variant" },
                    { key: "hasAddOn", label: "Add-on" },
                    { key: "hasNotes", label: "Notes" },
                    { key: "hasDescription", label: "Description" },
                    { key: "hasSellingMethod", label: "Selling Method" },
                  ].map(({ key, label }) => (
                    <div key={key} className="text-center">
                      <button
                        onClick={() =>
                          setAddProductForm((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                        }
                        className={`w-12 h-12 rounded-full border-2 mb-2 ${
                          addProductForm[key as keyof typeof addProductForm]
                            ? "bg-gray-300 border-gray-400"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full mx-auto ${
                            addProductForm[key as keyof typeof addProductForm] ? "bg-gray-600" : "bg-transparent"
                          }`}
                        />
                      </button>
                      <div className="text-xs text-gray-600">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Add to Online Store */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 text-lg">Add to Online Store</span>
                  <button
                    onClick={() => setAddProductForm((prev) => ({ ...prev, addToOnlineStore: !prev.addToOnlineStore }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      addProductForm.addToOnlineStore ? "bg-pink-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        addProductForm.addToOnlineStore ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProduct}
                  className="w-full bg-pink-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-pink-600 transition-colors"
                >
                  SAVE
                </button>
              </div>
            </div>
          )}

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

          <div className="text-center cursor-pointer hover:opacity-80" onClick={handleAddProductClick}>
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1">Add Product</p>
          </div>

          <div className="text-center">
            <FileText className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-600 font-medium">Products</p>
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

export default function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "pos" | "inventory" | "products" | "addProduct">(
    "dashboard",
  )
  
  // Use Supabase hooks for real data
  const { products: dbProducts, loading: productsLoading, createProduct, updateProduct, deleteProduct, updateStock } = useProducts()
  const { categories, loading: categoriesLoading, createCategory } = useCategories()
  const { createTransaction } = useTransactions()
  const { customers, createCustomer } = useCustomers()
  
  // Transform database products to match the component structure
  const products = dbProducts.map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    price: product.price_retail,
    image: product.image_url || "/placeholder.svg",
    category: categories.find(cat => cat.id === product.category_id)?.name || "General",
    baseUnit: product.base_unit,
    cost: product.cost,
    units: product.units?.map(unit => ({
      name: unit.unit_name,
      conversionFactor: unit.conversion_factor,
      price: unit.price,
      isBase: unit.is_base_unit,
      type: unit.unit_type
    })) || []
  }))

  const handleSaveNewProduct = async (productData: any) => {
    // Prepare units for database
    const units = productData.units.map((unit: any) => ({
      unit_name: unit.name,
      conversion_factor: unit.conversionFactor || 1,
      price: Number(unit.price) || 0,
      unit_type: unit.type as 'retail' | 'wholesale',
      is_base_unit: unit.isBase || false,
      display_order: 0
    }))

    // Create product in database
    const result = await createProduct({
      name: productData.productName,
      price_retail: Number(productData.price),
      price_wholesale: Number(productData.price) * 0.9, // Default wholesale price
      stock: Number(productData.stocks) || 0,
      category_id: categories.find(cat => cat.name === productData.productGroup)?.id || null,
      product_group_id: null,
      product_code: productData.productCode || null,
      base_unit: productData.baseUnit,
      cost: Number(productData.cost) || 0,
      low_stock_level: Number(productData.lowStockLevel) || 10,
      sku: `PRD${Date.now()}`,
      unit: productData.baseUnit,
      color: productData.color || '#1e40af',
      has_variants: productData.hasVariant || false,
      has_addons: productData.hasAddOn || false,
      notes: productData.notes || null,
      is_online_store: productData.addToOnlineStore || false,
      description: productData.description || null
    }, units.filter(u => !u.is_base_unit)) // Don't include base unit as it's implied
    
    if (result.success) {
      setCurrentScreen("dashboard")
    } else {
      alert(`Failed to create product: ${result.error}`)
    }
  }
  
  // Handle product updates
  const setProducts = async (updateFn: any) => {
    // This is a simplified version - in real app, you'd handle specific updates
    console.log('Product update requested')
  }

  if (currentScreen === "pos") {
    return <POSScreen onBack={() => setCurrentScreen("dashboard")} products={products} categories={categories} setCurrentScreen={setCurrentScreen} createTransaction={createTransaction} updateStock={updateStock} />
  }

  if (currentScreen === "inventory") {
    return <InventoryScreen products={products} categories={categories} setProducts={setProducts} setCurrentScreen={setCurrentScreen} />
  }

  if (currentScreen === "products") {
    return <ProductsScreen onBack={() => setCurrentScreen("dashboard")} products={products} setProducts={setProducts} setCurrentScreen={setCurrentScreen} />
  }

  if (currentScreen === "addProduct") {
    return (
      <AddProduct 
        onBack={() => setCurrentScreen("dashboard")} 
        onSave={handleSaveNewProduct}
        setCurrentScreen={setCurrentScreen}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto relative">
      {/* Header */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">Peddlr</span>
            <div className="w-6 h-4 bg-gradient-to-b from-blue-500 via-white to-red-500 rounded-sm ml-1"></div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 mb-6">
        <div className="bg-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🍌</div>
              <span className="text-lg font-medium">kankolek</span>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Your Balance</span>
              </div>
              <div className="text-2xl font-bold">P 0.00</div>
              <div className="text-xs opacity-75">Powered by Netbank</div>
            </div>
          </div>
          <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-lg py-3 font-semibold">
            Activate 🇵🇭QRPh
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {/* Row 1 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Cash</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Credit</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Monitor className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Payment</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Expenses</p>
          </div>

          {/* Row 2 */}
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Monitor className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">POS</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Receipts</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Purchases</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Reports</p>
          </div>

          {/* Row 3 */}
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Link className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Store Link</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Gamepad2 className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Play & Win</p>
          </div>

          <div className="text-center relative">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              12
            </div>
            <p className="text-xs font-medium text-gray-700">Inbox</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Products</p>
          </div>
        </div>
      </div>


      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3 relative">
          <div className="text-center">
            <Home className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-600 font-medium">Home</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("inventory")}>
            <Package className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Inventory</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("addProduct")}>
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1">Add Product</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
            <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Products</p>
          </div>

          <div className="text-center">
            <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Store</p>
          </div>
        </div>
      </div>
    </div>
  )
}
