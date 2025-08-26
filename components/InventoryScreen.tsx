"use client"

import { useState } from "react"
import { Edit, Trash2, Home, Package, Plus, FileText, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function InventoryScreen({ products, categories, setProducts, setCurrentScreen }: { products: any[]; categories: any[]; setProducts: React.Dispatch<React.SetStateAction<any[]>>; setCurrentScreen: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "add-product">> }) {
  const [activeTab, setActiveTab] = useState<"list" | "replenishment">("list")
  const [showStockAtCategory, setShowStockAtCategory] = useState(true)
  const [showStockInPOS, setShowStockInPOS] = useState(true)
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ name: "", stock: 0, price: 0 })

  const getCategoryStock = (categoryName: string) => {
    if (categoryName === "All") return products.reduce((sum, p) => sum + p.stock, 0)
    return products.filter((p) => p.category === categoryName).reduce((sum, p) => sum + p.stock, 0)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setEditForm({ name: product.name, stock: product.stock, price: product.price })
  }

  const handleSaveEdit = () => {
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct ? { ...p, ...editForm } : p)))
      setEditingProduct(null)
    }
  }

  const handleDeleteProduct = (productId: number) => setProducts((prev) => prev.filter((p) => p.id !== productId))
  const handleAddStock = (productId: number, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + amount) } : p)),
    )
  }

  return (
    <div className="h-screen bg-gray-100 max-w-sm mx-auto flex flex-col">
      <div className="bg-white px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-center mb-4"><h1 className="text-2xl font-bold text-gray-800">INVENTORY</h1></div>
        <div className="flex">
          <button onClick={() => setActiveTab("list")} className={`flex-1 py-3 px-4 font-semibold ${activeTab === "list" ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"}`}>INVENTORY LIST</button>
          <button onClick={() => setActiveTab("replenishment")} className={`flex-1 py-3 px-4 font-semibold ${activeTab === "replenishment" ? "bg-pink-500 text-white" : "bg-gray-200 text-gray-600"}`}>REPLENISHMENT</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === "list" && (
          <>
            <div className="bg-white px-4 py-4 flex justify-between items-center">{/* Toggles */}</div>
            <div className="bg-gray-200 py-4 text-center"><h2 className="text-lg font-bold text-gray-800">ALL INVENTORY LIST</h2></div>
            <div className="px-4 py-4 space-y-4">
              {categories.filter((c) => c.name !== "All").map((category) => (
                <div key={category.name} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{category.name.toUpperCase()}</h3>
                    <span className="text-sm font-bold text-gray-600">STOCKS: {getCategoryStock(category.name).toFixed(1)}</span>
                  </div>
                  <div className="space-y-2">
                    {products.filter((p) => p.category === category.name).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        {/* Product details and actions */}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === "replenishment" && <div className="p-4 text-center">Replenishment feature coming soon.</div>}
      </div>
    </div>
  )
}