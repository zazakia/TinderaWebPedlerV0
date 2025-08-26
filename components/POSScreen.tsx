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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function POSScreen({ onBack, products, categories, createTransaction, fetchProducts }: { onBack: () => void; products: any[]; categories: any[]; createTransaction: any; fetchProducts: () => Promise<void> }) {
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

  const handleTransaction = async (paymentMethod: 'cash' | 'credit') => {
    if (totalItems === 0) {
      alert('Cart is empty. Please add items before processing payment.')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const cartItems = getCartItems()
      
      const transactionResult = await createTransaction(
        cartItems,
        paymentMethod,
        undefined, 
        paymentMethod === 'credit', 
        0, 
        0, 
        0, 
        0, 
        showCustomerDetails ? `Customer: ${customerDetails.name}` : undefined
      )
      
      if (transactionResult.success) {
        setTimeout(async () => {
          try {
            await fetchProducts()
          } catch (error) {
            console.error('Failed to refresh products:', error)
          }
        }, 1000)
        
        setCart({})
        setCustomerDetails({ name: '', number: '', address: '', notes: '' })
        setShowCustomerDetails(false)
        
        alert(`Transaction completed successfully!`)
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

  const addToCart = (productId: string) => updateQuantity(productId, 1)
  const removeFromCart = (productId: string) => updateQuantity(productId, -1)
  const removeItemFromCart = (productId: string) => setCart((prev) => ({ ...prev, [productId]: 0 }))

  const totalAmount = products.reduce((sum, product) => (sum + product.price * (cart[product.id] || 0)), 0)
  const totalQuantity = Object.values(cart).reduce((sum, qty) => sum + qty, 0)
  const totalItems = Object.values(cart).filter((qty) => qty > 0).length

  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeCategory === "All" || product.category === activeCategory)
  )

  const getCartItems = () => products
    .filter((product) => cart[product.id] > 0)
    .map((product) => ({
      product_id: product.id,
      product_name: product.name,
      quantity: cart[product.id],
      unit_name: product.base_unit || 'piece',
      unit_price: product.price,
      subtotal: product.price * cart[product.id],
    }))

  if (posScreen === "payment") {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        <div className="bg-white px-4 py-4 border-b">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => setPosScreen("pos")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-center py-12 px-4 bg-white">
          <h1 className="text-xl font-bold text-gray-800 mb-6 tracking-wide">AMOUNT PAYABLE</h1>
          <div className="text-7xl font-bold text-pink-500 mb-4">₱{totalAmount.toFixed(2)}</div>
        </div>
        <div className="px-6 py-8">
          <p className="text-center text-gray-400 mb-8 text-lg">Choose payment option</p>
          <div className="flex gap-4 mb-12">
            <Button onClick={() => setPaymentOption("pay-later")} className={`flex-1 py-4 rounded-full font-medium text-lg transition-all ${paymentOption === "pay-later" ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>PAY LATER</Button>
            <Button onClick={() => setPaymentOption("multi-payment")} className={`flex-1 py-4 rounded-full font-medium text-lg transition-all ${paymentOption === "multi-payment" ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}>MULTI PAYMENT</Button>
          </div>
          <div className="space-y-6">
            <Button onClick={() => handleTransaction("cash")} disabled={isProcessing} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-8 text-2xl font-bold rounded-2xl shadow-xl">{isProcessing ? 'Processing...' : 'Cash'}</Button>
            <Button onClick={() => handleTransaction("credit")} disabled={isProcessing} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-8 text-2xl font-bold rounded-2xl shadow-xl">
              <div>{isProcessing ? 'Processing...' : 'Credit'}{!isProcessing && <div className="text-lg opacity-90 font-medium">UTANG</div>}</div>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (posScreen === "receipt") {
    const cartItems = getCartItems()
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const formattedTime = currentDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

    return (
      <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
        <div className="bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => setPosScreen("pos")} />
            <h1 className="text-lg font-semibold">Jr & Mai Agrivet</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Receipt No.</p>
            <p className="text-lg font-semibold">000006</p>
          </div>
        </div>
        <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
          {cartItems.map((item) => (
            <div key={item.product_id} className="flex items-center bg-gray-200 border-b border-gray-300 last:border-b-0">
              <div className="flex-1 p-3"><h3 className="font-medium text-sm">{item.product_name}</h3></div>
              <div className="flex items-center">
                <button onClick={() => updateQuantity(item.product_id, -1)} className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                <input type="number" value={item.quantity} onChange={(e) => setCart(prev => ({ ...prev, [item.product_id]: parseFloat(e.target.value) || 0 }))} className="w-12 bg-white text-center py-2 text-sm font-semibold" min="0" step="0.1" />
                <button onClick={() => updateQuantity(item.product_id, 1)} className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="w-16 text-center text-sm font-semibold py-2">{item.unit_price.toFixed(2)}</div>
              <div className="w-16 text-center text-sm font-semibold py-2">{item.subtotal.toFixed(2)}</div>
              <button onClick={() => removeItemFromCart(item.product_id)} className="w-8 h-8 bg-red-500 text-white flex items-center justify-center mr-2"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="px-4 mt-6">
          <p className="text-sm text-gray-600 mb-4">{formattedDate} | {formattedTime}</p>
          <div className="flex justify-between items-center border-t border-b border-gray-300 py-3">
            <span className="text-lg font-semibold">GRAND TOTAL:</span>
            <span className="text-xl font-bold">{totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <div className="px-4 mt-6">
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center"><div className="bg-purple-600 text-white p-3 rounded-lg mb-2"><ShoppingCart className="w-6 h-6 mx-auto" /></div><p className="text-xs font-medium">Add Items</p></div>
            <div className="text-center"><div className="bg-purple-600 text-white p-3 rounded-lg mb-2"><Package className="w-6 h-6 mx-auto" /></div><p className="text-xs font-medium">Scan Items</p></div>
            <div className="text-center"><div className="bg-purple-600 text-white p-3 rounded-lg mb-2"><span className="text-lg font-bold">%</span></div><p className="text-xs font-medium">Discount</p></div>
            <div className="text-center"><div className="bg-purple-600 text-white p-3 rounded-lg mb-2"><span className="text-lg font-bold">₱</span></div><p className="text-xs font-medium">Service Fee</p></div>
            <div className="text-center"><div className="bg-purple-600 text-white p-3 rounded-lg mb-2"><span className="text-lg font-bold">🚚</span></div><p className="text-xs font-medium">Delivery Fee</p></div>
          </div>
        </div>
        <div className="px-4 mt-6">
          <button onClick={() => setShowCustomerDetails(!showCustomerDetails)} className="w-full bg-purple-600 text-white p-4 rounded-lg flex items-center justify-between">
            <span className="font-semibold">Customer's Details and Notes</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showCustomerDetails ? "rotate-180" : ""}`} />
          </button>
          {showCustomerDetails && (
            <div className="mt-4 space-y-4">
              <Input placeholder="Customer's name" value={customerDetails.name} onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))} className="bg-white" />
              <Input placeholder="Customer's number" value={customerDetails.number} onChange={(e) => setCustomerDetails(prev => ({ ...prev, number: e.target.value }))} className="bg-white" />
              <Input placeholder="Customer's address" value={customerDetails.address} onChange={(e) => setCustomerDetails(prev => ({ ...prev, address: e.target.value }))} className="bg-white" />
              <textarea placeholder="Notes" value={customerDetails.notes} onChange={(e) => setCustomerDetails(prev => ({ ...prev, notes: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg bg-white resize-none h-24" />
            </div>
          )}
        </div>
        <div className="px-4 mt-6 pb-6"><Button onClick={() => setPosScreen("payment")} className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 text-lg font-semibold rounded-lg">CONFIRM</Button></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto relative">
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onBack} />
          <h1 className="text-xl font-semibold">POS</h1>
        </div>
        <div className="flex gap-2">
          <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4 py-2 text-sm">Product Filter</Button>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4 py-2 text-sm">Product View</Button>
          <div className="bg-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center"><span className="text-sm font-semibold">{totalItems}</span></div>
        </div>
      </div>

      <div className="flex pb-32">
        <div className="w-32 bg-white">
          <div onClick={() => setActiveCategory("All")} className={`px-3 py-4 text-sm border-b cursor-pointer ${activeCategory === "All" ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}>All</div>
          {categories.map((category) => (
            <div key={category.id} onClick={() => setActiveCategory(category.name)} className={`px-3 py-4 text-sm border-b cursor-pointer ${activeCategory === category.name ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-gray-50"}`}>{category.name}</div>
          ))}
        </div>

        <div className="flex-1">
          <div className="space-y-1 p-2">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex">
                <div className="flex-1 bg-slate-800 text-white rounded-l-lg p-2 flex items-center gap-2 cursor-pointer" onClick={() => addToCart(product.id)}>
                  <div className="w-8 h-8 bg-white rounded flex items-center justify-center"><img src={product.image || "/placeholder.svg"} alt={product.name} className="w-6 h-6 object-contain" /></div>
                  <div className="flex-1">
                    <h3 className="font-medium text-xs">{product.name}</h3>
                    <p className="text-[10px] text-gray-300">{product.stock} Pcs (Stocks)</p>
                  </div>
                  <div className="text-right"><p className="text-xs font-semibold">₱ {product.price.toFixed(2)}</p></div>
                </div>
                <div className="w-12 bg-green-500 text-white rounded-r-lg flex flex-col items-center justify-center relative py-1">
                  {(cart[product.id] || 0) > 0 && (
                    <>
                      <button onClick={() => updateQuantity(product.id, 0.5)} className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[8px] hover:bg-green-700">+</button>
                      <button onClick={() => removeFromCart(product.id)} className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[8px] hover:bg-green-700">-</button>
                    </>
                  )}
                  <span className="text-sm font-bold">{(cart[product.id] || 0).toFixed(2)}</span>
                  <span className="text-[8px]">QTY</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 mx-2 mb-4"><div className="bg-gray-600 text-white text-center py-3 rounded">No more items to show</div></div>
        </div>
      </div>

      <div className="fixed bottom-44 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-2 z-10">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white shadow-lg cursor-pointer" onClick={() => setPosScreen("receipt")}>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">REVIEW</span>
            <div className="flex gap-8">
              <div className="text-center"><p className="text-xs opacity-80">TOTAL AMOUNT</p><p className="text-lg font-bold">{totalAmount.toFixed(2)}</p></div>
              <div className="text-center"><p className="text-xs opacity-80">PRODUCT QTY</p><p className="text-lg font-bold">{totalQuantity.toFixed(2)}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-pink-500 p-4 z-20">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input placeholder="Search product" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-12 py-3 rounded-full bg-white" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2"><ShoppingCart className="w-5 h-5 text-pink-500" /></div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 text-center"><div className="bg-white rounded-lg p-3 mb-2"><ShoppingCart className="w-8 h-8 text-pink-500 mx-auto" /></div><p className="text-white text-xs font-medium">SCAN PRODUCT</p></div>
          <div className="flex-1 text-center"><div className="bg-white rounded-lg p-3 mb-2"><Package className="w-8 h-8 text-pink-500 mx-auto" /></div><p className="text-white text-xs font-medium">NON-INVENTORY</p></div>
          <div className="flex-1 text-center"><div className="bg-white rounded-lg p-3 mb-2"><Plus className="w-8 h-8 text-pink-500 mx-auto" /></div><p className="text-white text-xs font-medium">ADD PRODUCT</p></div>
        </div>
      </div>
    </div>
  )
}