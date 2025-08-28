
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Home,
  Package,
  Plus,
  FileText,
  ShoppingBag,
  User,
  Eye,
  DollarSign,
  Search,
  ShoppingCart,
  Minus,
  X,
  Edit,
  Trash2,
  Calculator,
  ArrowLeft,
  ChevronDown,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  Save,
  Upload,
  Camera,
  ImageIcon,
  Mail
} from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  stock: number
  category: string
  image: string
  baseUnit: string
  cost: number
  units: Array<{
    name: string
    conversionFactor: number
    price: number
    isBase: boolean
    type: 'retail' | 'wholesale'
  }>
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  unit: string
  total: number
}

interface Expense {
  id: number
  amount: number
  category: string
  description: string
  date: string
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other'
  vendor?: string
  receipt?: string
  tags?: string[]
  isRecurring?: boolean
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  createdAt: string
  updatedAt: string
}

interface ExpenseCategory {
  id: string
  name: string
  color: string
  icon: string
  isDefault: boolean
}

export default function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "pos" | "inventory" | "products" | "addProduct" | "expenses" | "addExpense" | "expenseReports">("dashboard")
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Coke Mismo 100ML",
      price: 15.00,
      stock: 50,
      category: "Soft Drinks",
      image: "/placeholder.svg",
      baseUnit: "piece",
      cost: 12.00,
      units: [
        { name: "piece", conversionFactor: 1, price: 15.00, isBase: true, type: "retail" },
        { name: "pack", conversionFactor: 6, price: 85.00, isBase: false, type: "wholesale" },
        { name: "case", conversionFactor: 24, price: 320.00, isBase: false, type: "wholesale" }
      ]
    },
    {
      id: 2,
      name: "Piattos Cheese 40g",
      price: 25.00,
      stock: 30,
      category: "Snacks",
      image: "/placeholder.svg",
      baseUnit: "piece",
      cost: 20.00,
      units: [
        { name: "piece", conversionFactor: 1, price: 25.00, isBase: true, type: "retail" },
        { name: "box", conversionFactor: 12, price: 280.00, isBase: false, type: "wholesale" }
      ]
    },
    {
      id: 3,
      name: "Tang Orange 25g",
      price: 12.00,
      stock: 75,
      category: "Powder Drink",
      image: "/tang-orange-powder-packet.png",
      baseUnit: "piece",
      cost: 9.00,
      units: [
        { name: "piece", conversionFactor: 1, price: 12.00, isBase: true, type: "retail" },
        { name: "box", conversionFactor: 24, price: 260.00, isBase: false, type: "wholesale" }
      ]
    }
  ])

  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", price: 0, stock: 0 })

  // Add Product form state
  const [addProductFormData, setAddProductFormData] = useState({
    productName: "",
    productGroup: "Soft Drinks",
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
    productCode: "",
    units: [
      { name: "piece", conversionFactor: 1, price: "", isBase: true, type: "retail" as const },
      { name: "pack", conversionFactor: 6, price: "", isBase: false, type: "wholesale" as const },
      { name: "box", conversionFactor: 12, price: "", isBase: false, type: "wholesale" as const },
      { name: "case", conversionFactor: 24, price: "", isBase: false, type: "wholesale" as const }
    ]
  })

  // Add Expense form state
  const [addExpenseFormData, setAddExpenseFormData] = useState({
    amount: "",
    category: "Other",
    description: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "cash" as const,
    vendor: "",
    isRecurring: false,
    recurringFrequency: "monthly" as const
  })

  // Expense state management
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expenseCategories] = useState<ExpenseCategory[]>([
    { id: 'utilities', name: 'Utilities', color: '#3b82f6', icon: 'Zap', isDefault: true },
    { id: 'rent', name: 'Rent', color: '#ef4444', icon: 'Home', isDefault: true },
    { id: 'supplies', name: 'Supplies', color: '#10b981', icon: 'Package', isDefault: true },
    { id: 'marketing', name: 'Marketing', color: '#f59e0b', icon: 'Megaphone', isDefault: true },
    { id: 'transportation', name: 'Transportation', color: '#8b5cf6', icon: 'Car', isDefault: true },
    { id: 'insurance', name: 'Insurance', color: '#06b6d4', icon: 'Shield', isDefault: true },
    { id: 'maintenance', name: 'Maintenance', color: '#84cc16', icon: 'Wrench', isDefault: true },
    { id: 'other', name: 'Other', color: '#6b7280', icon: 'MoreHorizontal', isDefault: true }
  ])
  const [expenseSearchQuery, setExpenseSearchQuery] = useState("")
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("All")
  const [expenseDateFilter, setExpenseDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products')
    const savedCart = localStorage.getItem('cart')
    const savedExpenses = localStorage.getItem('expenses')

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name)
    } else {
      return b.name.localeCompare(a.name)
    }
  })

  const addToCart = (product: Product, unitName: string = "piece") => {
    const unit = product.units.find(u => u.name === unitName) || product.units[0]
    const existingItem = cart.find(item => item.id === product.id && item.unit === unitName)

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.unit === unitName
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * unit.price }
          : item
      ))
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: unit.price,
        quantity: 1,
        unit: unitName,
        total: unit.price
      }])
    }
  }

  const updateCartQuantity = (productId: number, unitName: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => !(item.id === productId && item.unit === unitName)))
    } else {
      setCart(cart.map(item =>
        item.id === productId && item.unit === unitName
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ))
    }
  }

  const removeFromCart = (productId: number, unitName: string) => {
    setCart(cart.filter(item => !(item.id === productId && item.unit === unitName)))
  }

  const getTotalAmount = () => cart.reduce((sum, item) => sum + item.total, 0)
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product.id)
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock
    })
  }

  const handleSaveEdit = () => {
    if (editingProduct) {
      setProducts(products.map(product =>
        product.id === editingProduct
          ? { ...product, ...editForm }
          : product
      ))
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.id !== productId))
    setCart(cart.filter(item => item.id !== productId))
  }

  const handleBulkDelete = () => {
    setProducts(products.filter(product => !selectedProducts.includes(product.id)))
    setCart(cart.filter(item => !selectedProducts.includes(item.id)))
    setSelectedProducts([])
    setBulkEditMode(false)
  }

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Expense management functions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setExpenses([...expenses, newExpense])
  }

  const updateExpense = (id: number, updates: Partial<Expense>) => {
    setExpenses(expenses.map(expense =>
      expense.id === id
        ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
        : expense
    ))
  }

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const getTotalExpenses = (dateFilter?: { startDate: string, endDate: string }) => {
    let filteredExpenses = expenses

    if (dateFilter) {
      filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const startDate = new Date(dateFilter.startDate)
        const endDate = new Date(dateFilter.endDate)
        return expenseDate >= startDate && expenseDate <= endDate
      })
    }

    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getExpensesByCategory = (dateFilter?: { startDate: string, endDate: string }) => {
    let filteredExpenses = expenses

    if (dateFilter) {
      filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const startDate = new Date(dateFilter.startDate)
        const endDate = new Date(dateFilter.endDate)
        return expenseDate >= startDate && expenseDate <= endDate
      })
    }

    return filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(expenseSearchQuery.toLowerCase()) ||
                         expense.vendor?.toLowerCase().includes(expenseSearchQuery.toLowerCase())
    const matchesCategory = selectedExpenseCategory === "All" || expense.category === selectedExpenseCategory
    const matchesDate = (!expenseDateFilter.startDate || expense.date >= expenseDateFilter.startDate) &&
                       (!expenseDateFilter.endDate || expense.date <= expenseDateFilter.endDate)

    return matchesSearch && matchesCategory && matchesDate
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const renderPOSScreen = () => (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto relative">
      <div className="bg-white px-4 py-3 flex items-center justify-between">
        <button onClick={() => setCurrentScreen("dashboard")} className="text-gray-600">
          ← Back
        </button>
        <h1 className="text-xl font-semibold">POS</h1>
        <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          {getTotalItems()}
        </div>
      </div>

      <div className="flex pb-32">
        <div className="w-32 bg-white border-r">
          <div
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-4 text-sm border-b cursor-pointer ${
              selectedCategory === "All" ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </div>
          {categories.slice(1).map((category) => (
            <div
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-4 text-sm border-b cursor-pointer ${
                selectedCategory === category ? "bg-pink-500 text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {category}
            </div>
          ))}
        </div>

        <div className="flex-1">
          <div className="space-y-1 p-2">
            {filteredProducts.map((product) => {
              const cartItem = cart.find(item => item.id === product.id)
              return (
                <div key={product.id} className="flex">
                  <div
                    className="flex-1 bg-slate-800 text-white rounded-l-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-slate-700"
                    onClick={() => addToCart(product)}
                  >
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-xs">{product.name}</h3>
                      <p className="text-[10px] text-gray-300">{product.stock} {product.baseUnit}(s) in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">₱{product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="w-12 bg-green-500 text-white rounded-r-lg flex flex-col items-center justify-center relative py-1">
                    {cartItem && (
                      <>
                        <button
                          onClick={() => updateCartQuantity(product.id, cartItem.unit, cartItem.quantity + 1)}
                          className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[8px] hover:bg-green-700"
                        >
                          +
                        </button>
                        <button
                          onClick={() => updateCartQuantity(product.id, cartItem.unit, cartItem.quantity - 1)}
                          className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[8px] hover:bg-green-700"
                        >
                          -
                        </button>
                      </>
                    )}
                    <span className="text-sm font-bold">{cartItem?.quantity || 0}</span>
                    <span className="text-[8px]">QTY</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-44 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-2 z-10">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">REVIEW ORDER</span>
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-xs opacity-80">TOTAL AMOUNT</p>
                  <p className="text-lg font-bold">₱{getTotalAmount().toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs opacity-80">TOTAL ITEMS</p>
                  <p className="text-lg font-bold">{getTotalItems()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-pink-500 p-4 z-20">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 py-3 rounded-full bg-white"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 text-center cursor-pointer hover:opacity-80">
            <div className="bg-white rounded-lg p-3 mb-2">
              <ShoppingCart className="w-8 h-8 text-pink-500 mx-auto" />
            </div>
            <p className="text-white text-xs font-medium">SCAN</p>
          </div>
          <div className="flex-1 text-center cursor-pointer hover:opacity-80">
            <div className="bg-white rounded-lg p-3 mb-2">
              <Package className="w-8 h-8 text-pink-500 mx-auto" />
            </div>
            <p className="text-white text-xs font-medium">NON-INV</p>
          </div>
          <div className="flex-1 text-center cursor-pointer hover:opacity-80">
            <div className="bg-white rounded-lg p-3 mb-2">
              <Plus className="w-8 h-8 text-pink-500 mx-auto" />
            </div>
            <p className="text-white text-xs font-medium">ADD ITEM</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderInventoryScreen = () => (
    <div className="h-screen bg-gray-100 max-w-sm mx-auto flex flex-col">
      <div className="bg-white px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">INVENTORY</h1>
        </div>

        <div className="flex">
          <button className="flex-1 py-3 px-4 font-semibold bg-pink-500 text-white">
            INVENTORY LIST
          </button>
          <button className="flex-1 py-3 px-4 font-semibold bg-gray-200 text-gray-600">
            REPLENISHMENT
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-white px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-6 rounded-full cursor-pointer bg-pink-500"></div>
            <span className="text-sm text-gray-600">Show stock count at category level</span>
          </div>
        </div>

        <div className="bg-gray-200 py-4 text-center">
          <h2 className="text-lg font-bold text-gray-800">ALL INVENTORY LIST</h2>
        </div>

        <div className="px-4 py-4 space-y-4">
          {categories.slice(1).map((category) => (
            <div key={category} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{category.toUpperCase()}</h3>
                <span className="text-sm font-bold text-gray-600">
                  STOCKS: {products.filter(p => p.category === category).reduce((sum, p) => sum + p.stock, 0)}
                </span>
              </div>

              <div className="space-y-2">
                {products.filter(product => product.category === category).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                        -
                      </button>
                      <button className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-medium">
                        +
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

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

  const renderProductsScreen = () => (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentScreen("dashboard")} className="text-gray-600">
            ← Back
          </button>
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
          <div className="bg-purple-600 p-2 rounded">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 px-4 py-4">
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
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 border-gray-300"
          />
        </div>
      </div>

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

      <div className="px-4 pb-24">
        {Object.entries(
          filteredProducts.reduce((acc, product) => {
            if (!acc[product.category]) acc[product.category] = []
            acc[product.category].push(product)
            return acc
          }, {} as Record<string, Product[]>)
        ).map(([category, categoryProducts]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">{category}</h2>
            <div className="space-y-3">
              {categoryProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                  {bulkEditMode && (
                    <button
                      onClick={() => toggleProductSelection(product.id)}
                      className="w-4 h-4"
                    >
                      {selectedProducts.includes(product.id) ? (
                        <CheckSquare className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  )}

                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>

                  {editingProduct === product.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="text-sm"
                          placeholder="Price"
                        />
                        <Input
                          type="number"
                          value={editForm.stock}
                          onChange={(e) => setEditForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3 relative">
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("dashboard")}>
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

  const renderAddProductScreen = () => {
    const handleSave = () => {
      if (!addProductFormData.productName || !addProductFormData.price) {
        alert("Please fill in required fields")
        return
      }

      const newProduct: Product = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: addProductFormData.productName,
        price: Number(addProductFormData.price),
        stock: Number(addProductFormData.stocks) || 0,
        category: addProductFormData.productGroup,
        image: "/placeholder.svg",
        baseUnit: addProductFormData.baseUnit,
        cost: Number(addProductFormData.cost) || 0,
        units: addProductFormData.units.map(unit => ({
          ...unit,
          price: unit.price ? Number(unit.price) : (unit.isBase ? Number(addProductFormData.price) : 0)
        }))
      }

      setProducts([...products, newProduct])
      setCurrentScreen("dashboard")
    }

    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        <div className="bg-white px-4 py-3 flex items-center border-b">
          <button onClick={() => setCurrentScreen("dashboard")} className="text-gray-600">
            ← Back
          </button>
          <h1 className="text-xl font-semibold ml-4">Add Product</h1>
        </div>

        <div className="p-4 pb-20">
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Color</label>
              <div
                className="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer"
                style={{ backgroundColor: addProductFormData.color }}
                onClick={() => {
                  const colors = ["#1e40af", "#dc2626", "#059669", "#7c3aed", "#ea580c", "#0891b2"]
                  const currentIndex = colors.indexOf(addProductFormData.color)
                  const nextColor = colors[(currentIndex + 1) % colors.length]
                  setAddProductFormData(prev => ({ ...prev, color: nextColor }))
                }}
              />
            </div>

            <div className="flex-1 relative">
              <div className="bg-gray-300 h-32 rounded-lg relative">
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 rounded-b-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: addProductFormData.color }}
                >
                  <div className="text-center">
                    <div className="text-sm">{addProductFormData.productName || "Product Name"}</div>
                    <div className="text-xs">{addProductFormData.price ? `₱${addProductFormData.price}` : "Price"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Product Group</label>
              <select
                className="w-full p-3 border border-gray-300 rounded bg-white"
                value={addProductFormData.productGroup}
                onChange={(e) => setAddProductFormData(prev => ({ ...prev, productGroup: e.target.value }))}
              >
                <option value="Soft Drinks">Soft Drinks</option>
                <option value="Snacks">Snacks</option>
                <option value="Powder Drink">Powder Drink</option>
                <option value="Baby Powder">Baby Powder</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                value={addProductFormData.productName}
                onChange={(e) => setAddProductFormData(prev => ({ ...prev, productName: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                  value={addProductFormData.price}
                  onChange={(e) => setAddProductFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Cost</label>
                <input
                  type="number"
                  className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                  value={addProductFormData.cost}
                  onChange={(e) => setAddProductFormData(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Stocks</label>
                <input
                  type="number"
                  className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                  value={addProductFormData.stocks}
                  onChange={(e) => setAddProductFormData(prev => ({ ...prev, stocks: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Low Stock Level</label>
                <input
                  type="number"
                  className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                  value={addProductFormData.lowStockLevel}
                  onChange={(e) => setAddProductFormData(prev => ({ ...prev, lowStockLevel: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Multi-Unit Pricing</h3>
              <div className="space-y-3">
                {addProductFormData.units.map((unit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16">{unit.name}</span>
                    <input
                      type="number"
                      placeholder="Price"
                      className="flex-1 p-2 border border-gray-300 rounded text-sm"
                      value={unit.price}
                      onChange={(e) => {
                        const newUnits = [...addProductFormData.units]
                        newUnits[index].price = e.target.value
                        setAddProductFormData(prev => ({ ...prev, units: newUnits }))
                      }}
                      step="0.01"
                    />
                    <span className="text-xs text-gray-500 w-8">₱</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-pink-500 text-white py-4 rounded-lg text-lg font-semibold hover:bg-pink-600"
            >
              SAVE PRODUCT
            </Button>
          </div>
        </div>
      </div>
    )
  }


  const renderExpensesScreen = () => (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentScreen("dashboard")} className="text-gray-600">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">EXPENSES</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4 px-4 py-4">
        <Button
          onClick={() => setCurrentScreen("addExpense")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD EXPENSE
        </Button>
        <Button
          onClick={() => setCurrentScreen("expenseReports")}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          REPORTS
        </Button>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search expenses..."
              value={expenseSearchQuery}
              onChange={(e) => setExpenseSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <select
            className="flex-1 p-3 border border-gray-300 rounded bg-white"
            value={selectedExpenseCategory}
            onChange={(e) => setSelectedExpenseCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">From Date</label>
            <Input
              type="date"
              value={expenseDateFilter.startDate}
              onChange={(e) => setExpenseDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">To Date</label>
            <Input
              type="date"
              value={expenseDateFilter.endDate}
              onChange={(e) => setExpenseDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-600">TOTAL EXPENSES</span>
            <span className="text-lg font-bold text-blue-600">
              ₱{getTotalExpenses(expenseDateFilter).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No expenses found</p>
            <Button
              onClick={() => setCurrentScreen("addExpense")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const category = expenseCategories.find(cat => cat.name === expense.category)
              return (
                <div key={expense.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{expense.description}</h3>
                      {expense.vendor && (
                        <p className="text-sm text-gray-500">{expense.vendor}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">₱{expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color || '#6b7280' }}
                      />
                      <span className="text-sm text-gray-600">{expense.category}</span>
                      <span className="text-xs text-gray-400 capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // For now, just show alert. In real app, would open edit modal
                          alert('Edit functionality would be implemented here')
                        }}
                        className="w-8 h-8 bg-blue-500 text-white rounded flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this expense?')) {
                            deleteExpense(expense.id)
                          }
                        }}
                        className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3 relative">
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("dashboard")}>
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
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
            <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Store</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAddExpenseScreen = () => {
    const handleSave = () => {
      if (!addExpenseFormData.amount || !addExpenseFormData.description) {
        alert("Please fill in required fields")
        return
      }

      const expenseData = {
        amount: Number(addExpenseFormData.amount),
        category: addExpenseFormData.category,
        description: addExpenseFormData.description,
        date: addExpenseFormData.date,
        paymentMethod: addExpenseFormData.paymentMethod,
        vendor: addExpenseFormData.vendor || undefined,
        isRecurring: addExpenseFormData.isRecurring,
        recurringFrequency: addExpenseFormData.isRecurring ? addExpenseFormData.recurringFrequency : undefined
      }

      addExpense(expenseData)
      setCurrentScreen("expenses")
    }

    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        <div className="bg-white px-4 py-3 flex items-center border-b">
          <button onClick={() => setCurrentScreen("expenses")} className="text-gray-600">
            ← Back
          </button>
          <h1 className="text-xl font-semibold ml-4">Add Expense</h1>
        </div>

        <div className="p-4 pb-20">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  className="w-full p-3 pl-8 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                  value={addExpenseFormData.amount}
                  onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Category *</label>
              <select
                className="w-full p-3 border border-gray-300 rounded bg-white"
                value={addExpenseFormData.category}
                onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Description *</label>
              <input
                type="text"
                className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                value={addExpenseFormData.description}
                onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this expense for?"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded bg-white"
                value={addExpenseFormData.date}
                onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Payment Method</label>
              <select
                className="w-full p-3 border border-gray-300 rounded bg-white"
                value={addExpenseFormData.paymentMethod}
                onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Vendor/Supplier</label>
              <input
                type="text"
                className="w-full p-3 border-b border-gray-300 bg-transparent focus:border-purple-500 focus:outline-none"
                value={addExpenseFormData.vendor}
                onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="Who did you pay?"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={addExpenseFormData.isRecurring}
                onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                className="w-4 h-4 text-purple-600"
              />
              <label htmlFor="recurring" className="text-gray-700">This is a recurring expense</label>
            </div>

            {addExpenseFormData.isRecurring && (
              <div>
                <label className="block text-gray-700 mb-2">Frequency</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  value={addExpenseFormData.recurringFrequency}
                  onChange={(e) => setAddExpenseFormData(prev => ({ ...prev, recurringFrequency: e.target.value as any }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            )}

            <Button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-purple-700"
            >
              SAVE EXPENSE
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderExpenseReportsScreen = () => {
    const currentMonthExpenses = getTotalExpenses({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    })

    const lastMonthExpenses = getTotalExpenses({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
    })

    const expensesByCategory = getExpensesByCategory(expenseDateFilter)

    return (
      <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentScreen("expenses")} className="text-gray-600">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">EXPENSE REPORTS</h1>
          </div>
        </div>

        <div className="p-4 pb-20">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-blue-600">₱{currentMonthExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Last Month</p>
              <p className="text-2xl font-bold text-green-600">₱{lastMonthExpenses.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No expenses in selected period</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const categoryData = expenseCategories.find(cat => cat.name === category)
                    const percentage = (amount / Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0)) * 100

                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: categoryData?.color || '#6b7280' }}
                          />
                          <span className="text-sm font-medium">{category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">₱{amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses</h3>
            {filteredExpenses.slice(0, 5).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent expenses</p>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">{expense.description}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-bold text-red-600">₱{expense.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
          <div className="flex justify-around items-center py-3 relative">
            <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("dashboard")}>
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
            <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
              <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Store</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Handle screen routing
  if (currentScreen === "pos") {
    return renderPOSScreen()
  }

  if (currentScreen === "inventory") {
    return renderInventoryScreen()
  }

  if (currentScreen === "products") {
    return renderProductsScreen()
  }

  if (currentScreen === "addProduct") {
    return renderAddProductScreen()
  }

  if (currentScreen === "expenses") {
    return renderExpensesScreen()
  }

  if (currentScreen === "addExpense") {
    return renderAddExpenseScreen()
  }

  if (currentScreen === "expenseReports") {
    return renderExpenseReportsScreen()
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto relative">
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
              <div className="text-2xl font-bold">P {getTotalAmount().toFixed(2)}</div>
              <div className="text-xs opacity-75">Powered by Netbank</div>
            </div>
          </div>
          <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-lg py-3 font-semibold">
            Activate 🇵🇭QRPh
          </Button>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Cash</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Credit</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Payment</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("expenses")}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Expenses</p>
            <p className="text-xs text-red-600 font-bold">₱{getTotalExpenses().toFixed(2)}</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">POS</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
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

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Store Link</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <User className="w-6 h-6 text-purple-600" />
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
</div>
</div>

<div className="px-4 mb-6">
<div className="grid grid-cols-5 gap-4">
<div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("products")}>
  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
    <FileText className="w-6 h-6 text-purple-600" />
  </div>
  <p className="text-xs font-medium text-gray-700">Products</p>
</div>

<div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("inventory")}>
  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
    <Package className="w-6 h-6 text-purple-600" />
  </div>
  <p className="text-xs font-medium text-gray-700">Inventory</p>
</div>

<div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("addProduct")}>
  <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
    <Plus className="w-8 h-8 text-white" />
  </div>
  <p className="text-xs text-purple-600 font-medium mt-1">Add Product</p>
</div>

<div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("pos")}>
  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
    <ShoppingBag className="w-6 h-6 text-purple-600" />
  </div>
  <p className="text-xs font-medium text-gray-700">Store</p>
</div>

<div className="text-center">
  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
    <BarChart3 className="w-6 h-6 text-purple-600" />
  </div>
  <p className="text-xs font-medium text-gray-700">Reports</p>
</div>
</div>
</div>

<div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
<div className="flex justify-around items-center py-3 relative">
<div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("dashboard")}>
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

<div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen("expenses")}>
  <DollarSign className="w-6 h-6 text-gray-400 mx-auto mb-1" />
  <p className="text-xs text-gray-400">Expenses</p>
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
             