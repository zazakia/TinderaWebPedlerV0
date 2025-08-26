"use client"

import {
  ArrowLeft,
  Search,
  Plus,
  X,
  FileText,
  Edit,
  BarChart3,
  Home,
  Package,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ProductsScreen({ onBack, products, setProducts, setCurrentScreen }: { onBack: () => void; products: any[]; setProducts: React.Dispatch<React.SetStateAction<any[]>>; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "add-product">> }) {
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
      if (sortOrder === "asc") return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name)
    })

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = []
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, typeof products>)

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({ name: product.name, price: product.price, stock: product.stock, category: product.category })
  }

  const handleSaveEdit = () => {
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct ? { ...p, ...editForm } : p)))
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (productId: number) => setProducts((prev) => prev.filter((p) => p.id !== productId))

  const handleDuplicateProduct = (product: any) => {
    const newProduct = { ...product, id: Date.now(), name: `${product.name} (Copy)` }
    setProducts((prev) => [...prev, newProduct])
  }

  const handleBulkDelete = () => {
    setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.id)))
    setSelectedProducts([])
    setBulkEditMode(false)
  }

  const handleAddProduct = () => {
    const newProduct = { ...newProductForm, id: Date.now() }
    setProducts((prev) => [...prev, newProduct])
    setNewProductForm({ name: "", price: 0, stock: 0, category: "Baby Powder", image: "/placeholder.svg" })
    setShowAddForm(false)
  }

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 max-w-sm mx-auto">
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                    <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={onBack} />
                    <h1 className="text-2xl font-bold text-gray-800">PRODUCTS</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} className="flex flex-col items-center">
                        <span className="text-sm font-bold">A</span>
                        <span className="text-xs">Z</span>
                        {sortOrder === "desc" ? <span>↓</span> : <span>↑</span>}
                    </button>
                    <div className="bg-purple-600 p-2 rounded"><BarChart3 className="w-5 h-5 text-white" /></div>
                </div>
            </div>
            <div className="flex gap-3 my-4 px-4">
                <Button onClick={() => setBulkEditMode(!bulkEditMode)} className={`${bulkEditMode ? "bg-red-500" : "bg-purple-600"} text-white px-4 py-2 rounded-lg flex items-center gap-2`}>
                    <Edit className="w-4 h-4" />
                    {bulkEditMode ? "CANCEL" : "BULK EDIT"}
                </Button>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search for ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10 border-gray-300" />
                </div>
            </div>
            {bulkEditMode && selectedProducts.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg mx-4">
                    <p className="text-sm text-red-600 mb-2">{selectedProducts.length} products selected</p>
                    <Button onClick={handleBulkDelete} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Delete Selected</Button>
                </div>
            )}
            {showAddForm && (
                <div className="bg-white mx-4 mb-4 p-4 rounded-lg shadow">
                    {/* Add product form fields */}
                </div>
            )}
            <div className="px-4 pb-24">
                {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                    <div key={category} className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 mb-3">{category}</h2>
                        <div className="space-y-3">
                            {(categoryProducts as any[]).map((product: any) => (
                                <div key={product.id} className="bg-white rounded-lg p-3 flex items-center gap-3">
                                    {/* Product details and actions */}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}