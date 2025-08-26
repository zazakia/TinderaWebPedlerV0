"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, X, Plus, Camera, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCategories } from '@/lib/hooks/useCategories'

interface Unit {
  id: string
  name: string
  conversionFactor: number
  price: number
  type: 'retail' | 'wholesale'
  isBase: boolean
}

interface ProductData {
  name: string
  sku: string
  category_id: string
  product_group_id?: string
  product_code?: string
  base_unit: string
  price_retail: number
  price_wholesale?: number
  cost: number
  stock: number
  low_stock_level: number
  color: string
  has_variants: boolean
  has_addons: boolean
  notes?: string
  selling_methods?: string[]
  is_active: boolean
  is_online_store: boolean
  image_url?: string
  units: Unit[]
}

interface AddProductProps {
  onBack: () => void
  onSave: (productData: ProductData) => Promise<void>
}

export default function AddProduct({ onBack, onSave }: AddProductProps) {
  const [selectedColor, setSelectedColor] = useState('#1e40af')
  const [baseUnit, setBaseUnit] = useState('Piece')
  const [units, setUnits] = useState<Unit[]>([])
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    sku: '',
    category_id: '',
    base_unit: 'Piece',
    price_retail: 0,
    cost: 0,
    stock: 0,
    low_stock_level: 0,
    color: '#1e40af',
    has_variants: false,
    has_addons: false,
    is_active: true,
    is_online_store: false,
    units: []
  })

  const { categories } = useCategories()

  // Available colors
  const colors = [
    '#1e40af', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777',
    '#0891b2', '#65a30d', '#ea580c', '#9333ea', '#be185d', '#0284c7'
  ]

  // Base unit options
  const baseUnitOptions = [
    'Piece', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Box', 'Pack', 'Bottle', 'Can', 'Bag'
  ]

  useEffect(() => {
    // Initialize with base unit
    if (baseUnit && units.length === 0) {
      const baseUnitObj: Unit = {
        id: '1',
        name: baseUnit,
        conversionFactor: 1,
        price: productData.price_retail,
        type: 'retail',
        isBase: true
      }
      setUnits([baseUnitObj])
    }
  }, [baseUnit, productData.price_retail])

  const handleAddUnit = () => {
    if (units.length < 6) { // Max 6 additional units (7 total including base)
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: '',
        conversionFactor: 1,
        price: 0,
        type: 'retail',
        isBase: false
      }
      setUnits([...units, newUnit])
    }
  }

  const handleRemoveUnit = (unitId: string) => {
    setUnits(units.filter(unit => unit.id !== unitId && !unit.isBase))
  }

  const handleUnitChange = (unitId: string, field: keyof Unit, value: any) => {
    setUnits(units.map(unit => 
      unit.id === unitId 
        ? { ...unit, [field]: value }
        : unit
    ))
  }

  const handleBaseUnitChange = (newBaseUnit: string) => {
    setBaseUnit(newBaseUnit)
    setProductData({ ...productData, base_unit: newBaseUnit })
    
    // Update the base unit in units array
    setUnits(units.map(unit => 
      unit.isBase 
        ? { ...unit, name: newBaseUnit }
        : unit
    ))
  }

  const handleProductDataChange = (field: keyof ProductData, value: any) => {
    setProductData({ ...productData, [field]: value })
    
    // Update base unit price when retail price changes
    if (field === 'price_retail') {
      setUnits(units.map(unit => 
        unit.isBase 
          ? { ...unit, price: value }
          : unit
      ))
    }
  }

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0')
    return `PRD${timestamp}${randomNum}`
  }

  const handleSave = async () => {
    try {
      // Create a copy of the product data
      let finalProductData = { ...productData }
      
      // Generate SKU if not provided
      if (!finalProductData.sku) {
        finalProductData.sku = generateSKU()
      }

      // Prepare the product data with units
      finalProductData = {
        ...finalProductData,
        units: units.filter(unit => unit.name.trim() !== '')
      }

      await onSave(finalProductData)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto" data-testid="add-product-component">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Product</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="p-2">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex gap-1">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm rounded">
              Product Name
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Color Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-4 rounded-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm font-medium">Color</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`w-8 h-6 rounded-sm border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color)
                  handleProductDataChange('color', color)
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Group */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Product Group (Ex. Soft Drinks)</label>
          <Select onValueChange={(value) => handleProductDataChange('category_id', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Product Name (Ex. Coke Mismo 100ML)</label>
          <Input
            value={productData.name}
            onChange={(e) => handleProductDataChange('name', e.target.value)}
            placeholder="Enter product name"
            className="w-full"
          />
        </div>

        {/* Product Code */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 flex items-center gap-1">
            🔗 Product Code (Optional)
          </label>
          <Input
            value={productData.product_code || ''}
            onChange={(e) => handleProductDataChange('product_code', e.target.value)}
            placeholder="Enter product code"
            className="w-full"
          />
        </div>

        {/* Unit of Measure Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Unit of Measure Settings</h3>
            <p className="text-sm text-blue-600 italic">Configure unique units and pricing for this specific product</p>
          </div>

          {/* Base Unit */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Base Unit:</label>
            <Select value={baseUnit} onValueChange={handleBaseUnitChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {baseUnitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Units */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Additional Units for this Product (Max 5):
              </label>
              {units.length < 7 && (
                <Button
                  type="button"
                  onClick={handleAddUnit}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Unit
                </Button>
              )}
            </div>

            {/* Units List */}
            <div className="space-y-3">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`p-3 border rounded-lg ${
                    unit.isBase ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">
                      {unit.isBase ? `Base Unit (${unit.name})` : 'Additional Unit'}
                    </span>
                    {!unit.isBase && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveUnit(unit.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {!unit.isBase && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-600">Unit Name</label>
                        <Input
                          value={unit.name}
                          onChange={(e) => handleUnitChange(unit.id, 'name', e.target.value)}
                          placeholder="e.g., Box, Pack"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Conversion Factor</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={unit.conversionFactor}
                          onChange={(e) => handleUnitChange(unit.id, 'conversionFactor', parseFloat(e.target.value) || 1)}
                          placeholder="e.g., 12"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={unit.price}
                        onChange={(e) => handleUnitChange(unit.id, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-sm"
                        disabled={unit.isBase}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Type</label>
                      <Select
                        value={unit.type}
                        onValueChange={(value: 'retail' | 'wholesale') => handleUnitChange(unit.id, 'type', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Price (Presyo o SRP)</label>
            <Input
              type="number"
              step="0.01"
              value={productData.price_retail}
              onChange={(e) => handleProductDataChange('price_retail', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Cost (Puhunan)</label>
            <Input
              type="number"
              step="0.01"
              value={productData.cost}
              onChange={(e) => handleProductDataChange('cost', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full"
            />
          </div>
        </div>

        {/* Stock Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Stocks</label>
            <div className="relative">
              <Input
                type="number"
                value={productData.stock}
                onChange={(e) => handleProductDataChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                pcs
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Low Stock Level</label>
            <div className="relative">
              <Input
                type="number"
                value={productData.low_stock_level}
                onChange={(e) => handleProductDataChange('low_stock_level', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                pcs
              </span>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Variant</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Add-on</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Notes</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Description</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2 mx-auto">
              <Plus className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Selling Method</p>
          </div>
        </div>

        {/* Add to Online Store */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Add to Online Store</label>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-xs text-gray-500">Configure online store settings</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white p-4 border-t">
        <Button
          onClick={handleSave}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-4 text-lg font-semibold rounded-lg"
        >
          SAVE
        </Button>
      </div>
    </div>
  )
}