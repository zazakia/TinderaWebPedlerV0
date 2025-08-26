"use client"

import { useState } from "react"
import { useProducts } from "@/lib/hooks/useProducts"
import { useCategories } from "@/lib/hooks/useCategories"
import { useTransactions } from "@/lib/hooks/useTransactions"
import { useCustomers } from "@/lib/hooks/useCustomers"

import Dashboard from "@/components/Dashboard"
import AddProductScreen from "@/components/AddProductScreen"
import BottomNav from "@/components/layout/BottomNav"

import POSScreen from "@/components/POSScreen"
import InventoryScreen from "@/components/InventoryScreen"
import ProductsScreen from "@/components/ProductsScreen"

type Screen = "dashboard" | "pos" | "inventory" | "products" | "add-product"

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard")

  const { products: dbProducts, createProduct, updateStock, fetchProducts } = useProducts()
  const { categories } = useCategories()
  const { createTransaction } = useTransactions()

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

  const handleSaveNewProduct = async (productData: any) => {
    try {
      const units = productData.units.map((unit: any) => ({
        unit_name: unit.name,
        conversion_factor: unit.conversionFactor || 1,
        price: Number(unit.price) || 0,
        unit_type: unit.type as 'retail' | 'wholesale',
        is_base_unit: unit.isBase || false,
        display_order: 0
      }));

      const { units: _, ...productToSave } = productData;
      
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

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard setCurrentScreen={setCurrentScreen} />
      case "add-product":
        return <AddProductScreen onBack={() => setCurrentScreen("dashboard")} onSave={handleSaveNewProduct} />
      case "pos":
        return <POSScreen onBack={() => setCurrentScreen("dashboard")} products={products} categories={categories} createTransaction={createTransaction} fetchProducts={fetchProducts} />
      case "inventory":
        return <InventoryScreen products={products} categories={categories} setProducts={() => {}} setCurrentScreen={setCurrentScreen} />
      case "products":
        return <ProductsScreen onBack={() => setCurrentScreen("dashboard")} products={products} setProducts={() => {}} setCurrentScreen={setCurrentScreen} />
      default:
        return <Dashboard setCurrentScreen={setCurrentScreen} />
    }
  }

  return (
    <main>
      {renderScreen()}
      <BottomNav currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
    </main>
  );
}
