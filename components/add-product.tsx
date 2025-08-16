"use client"

import {
  ArrowLeft,
  ImageIcon,
  Camera,
  X,
  Plus,
  Minus,
  Home,
  Package,
  FileText,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface Unit {
  id: string
  name: string
  conversionFactor: number
  price: number
  isBase: boolean
  type: "retail" | "wholesale"
  isAutoPricing: boolean
}

interface ProductForm {
  productGroup: string
  productName: string
  productCode: string
  baseUnit: string
  price: number
  cost: number
  stocks: number
  lowStockLevel: number
  addToOnlineStore: boolean
  color: string
  photo: string | null
  units: Unit[]
  variants: string[]
  addOns: string[]
  notes: string
  description: string
  sellingMethod: string
}

interface AddProductProps {
  onBack?: () => void
  onSave?: (productData: ProductForm) => void
  setCurrentScreen?: React.Dispatch<React.SetStateAction<"dashboard" | "pos" | "inventory" | "products" | "addProduct">>
}

export default function AddProduct({ onBack, onSave, setCurrentScreen }: AddProductProps) {
  const [formData, setFormData] = useState<ProductForm>({
    productGroup: "",
    productName: "",
    productCode: "",
    baseUnit: "pcs",
    price: 0,
    cost: 0,
    stocks: 0,
    lowStockLevel: 0,
    addToOnlineStore: false,
    color: "#1e40af",
    photo: null,
    units: [
      { id: "1", name: "piece", conversionFactor: 1, price: 0, isBase: true, type: "retail", isAutoPricing: false }
    ],
    variants: [],
    addOns: [],
    notes: "",
    description: "",
    sellingMethod: ""
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [modalOpen, setModalOpen] = useState(false)
  const [currentModal, setCurrentModal] = useState<"variant" | "addon" | "notes" | "description" | "selling">("variant")
  const [tempValue, setTempValue] = useState("")

  const addUnit = () => {
    if (formData.units.length >= 6) return // Max 5 additional + 1 base = 6 total
    
    const newUnit: Unit = {
      id: Date.now().toString(),
      name: "",
      conversionFactor: 1,
      price: 0,
      isBase: false,
      type: "wholesale",
      isAutoPricing: true
    }
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }))
  }

  const removeUnit = (unitId: string) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit.id !== unitId)
    }))
  }

  const updateUnit = (unitId: string, field: keyof Unit, value: any) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map(unit => {
        if (unit.id === unitId) {
          const updatedUnit = { ...unit, [field]: value }
          
          // Auto-calculate price if auto pricing is enabled and conversion factor changes
          if (field === 'conversionFactor' && unit.isAutoPricing) {
            const baseUnit = prev.units.find(u => u.isBase)
            if (baseUnit) {
              updatedUnit.price = baseUnit.price * value
            }
          }
          
          return updatedUnit
        }
        return unit
      })
    }))
  }

  const toggleAutoPricing = (unitId: string) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map(unit => {
        if (unit.id === unitId) {
          const isAutoPricing = !unit.isAutoPricing
          let price = unit.price
          
          // Calculate auto price if enabling auto pricing
          if (isAutoPricing) {
            const baseUnit = prev.units.find(u => u.isBase)
            if (baseUnit) {
              price = baseUnit.price * unit.conversionFactor
            }
          }
          
          return { ...unit, isAutoPricing, price }
        }
        return unit
      })
    }))
  }

  const handleSave = () => {
    // Validate required fields
    if (!formData.productName || !formData.price) {
      alert("Please fill in Product Name and Price")
      return
    }

    // Update the base unit price in the units array
    const updatedUnits = formData.units.map(unit => {
      if (unit.isBase) {
        return { ...unit, price: formData.price }
      }
      return unit
    })

    const productToSave = {
      ...formData,
      units: updatedUnits
    }

    console.log("Saving product:", productToSave)
    
    if (onSave) {
      onSave(productToSave)
    }
  }

  const openModal = (type: "variant" | "addon" | "notes" | "description" | "selling") => {
    setCurrentModal(type)
    setTempValue("")
    setModalOpen(true)
  }

  const handleModalSave = () => {
    if (!tempValue.trim()) return

    switch (currentModal) {
      case "variant":
        setFormData(prev => ({
          ...prev,
          variants: [...prev.variants, tempValue]
        }))
        break
      case "addon":
        setFormData(prev => ({
          ...prev,
          addOns: [...prev.addOns, tempValue]
        }))
        break
      case "notes":
        setFormData(prev => ({ ...prev, notes: tempValue }))
        break
      case "description":
        setFormData(prev => ({ ...prev, description: tempValue }))
        break
      case "selling":
        setFormData(prev => ({ ...prev, sellingMethod: tempValue }))
        break
    }
    
    setModalOpen(false)
    setTempValue("")
  }

  const removeItem = (type: "variant" | "addon", index: number) => {
    if (type === "variant") {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        addOns: prev.addOns.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium ml-2">Add Product</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Product Preview Card */}
        <div className="bg-white rounded-lg p-4 flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-sm text-gray-500">Color</span>
            </div>
          </div>
          
          {/* Product Preview */}
          <div className="relative">
            <div className="w-32 h-24 bg-gray-200 rounded flex items-center justify-center relative">
              <Button variant="ghost" size="sm" className="absolute top-1 right-1 p-1">
                <X className="h-4 w-4" />
              </Button>
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs absolute bottom-1 left-1 right-1">
                <div>Product Name</div>
                <div>Price</div>
              </div>
            </div>
          </div>
          
          {/* Photo Controls */}
          <div className="flex flex-col space-y-2">
            <Button variant="outline" size="sm" className="p-2">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-gray-600">Product Group (Ex. Soft Drinks)</Label>
            <Input 
              value={formData.productGroup}
              onChange={(e) => setFormData(prev => ({ ...prev, productGroup: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm text-gray-600">Product Name (Ex. Coke Mismo 100ML)</Label>
            <Input 
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label className="text-sm text-gray-600">🏷️ Product Code (Optional)</Label>
              <Input 
                value={formData.productCode}
                onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
                className="mt-1"
              />
            </div>
            <Switch 
              checked={!!formData.productCode}
              className="mt-6"
            />
          </div>

          {/* Unit of Measure Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Unit of Measure Settings</h3>
              <p className="text-sm text-gray-500 italic">Configure unique units and pricing for this specific product</p>
            </div>

            {/* Base Unit */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Base Unit:</Label>
              <Select 
                value={formData.units[0]?.name || "piece"}
                onValueChange={(value) => updateUnit(formData.units[0]?.id, "name", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="pcs">Pcs</SelectItem>
                  <SelectItem value="item">Item</SelectItem>
                  <SelectItem value="unit">Unit</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="can">Can</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Units */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Additional Units for this Product (Max 5):
                </Label>
                {formData.units.length < 6 && (
                  <Button onClick={addUnit} size="sm" variant="outline" className="text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Unit
                  </Button>
                )}
              </div>
              
              {formData.units.filter(unit => !unit.isBase).map((unit, index) => {
                const unitNumber = index + 2
                const conversionText = unit.conversionFactor > 1 ? 
                  `1 ${unit.name} = ${unit.conversionFactor} ${formData.units[0]?.name}(s)` : 
                  ""

                return (
                  <div key={unit.id} className="bg-gray-50 p-4 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Unit {unitNumber}</span>
                        <Badge 
                          variant={unit.type === "wholesale" ? "default" : "secondary"}
                          className={`text-xs ${
                            unit.type === "wholesale" 
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {unit.type === "wholesale" ? "W" : "R"}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => removeUnit(unit.id)}
                        size="sm" 
                        variant="ghost"
                        className="p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-600">Unit Name:</Label>
                        <Select 
                          value={unit.name}
                          onValueChange={(value) => updateUnit(unit.id, "name", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select unit name" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="dozen">Dozen</SelectItem>
                            <SelectItem value="case">Case</SelectItem>
                            <SelectItem value="carton">Carton</SelectItem>
                            <SelectItem value="bundle">Bundle</SelectItem>
                            <SelectItem value="set">Set</SelectItem>
                            <SelectItem value="pack">Pack</SelectItem>
                            <SelectItem value="bag">Bag</SelectItem>
                            <SelectItem value="bulk">Bulk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">
                          Conversion Factor (How many {formData.units[0]?.name}s in 1 {unit.name}):
                        </Label>
                        <Input 
                          type="number"
                          value={unit.conversionFactor}
                          onChange={(e) => updateUnit(unit.id, "conversionFactor", Number(e.target.value))}
                          placeholder="12"
                          className="mt-1"
                          min="1"
                        />
                        {conversionText && (
                          <p className="text-xs text-gray-500 mt-1">{conversionText}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-gray-600">
                            Price per {unit.name} ({unit.type === "wholesale" ? "Wholesale" : "Retail"}):
                          </Label>
                          <Button
                            onClick={() => toggleAutoPricing(unit.id)}
                            size="sm"
                            variant={unit.isAutoPricing ? "default" : "outline"}
                            className={`text-xs px-2 py-1 h-6 ${
                              unit.isAutoPricing 
                                ? "bg-purple-500 hover:bg-purple-600 text-white" 
                                : "text-purple-600 border-purple-300"
                            }`}
                          >
                            Auto
                          </Button>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">₱</span>
                          <Input 
                            type="number"
                            value={unit.price}
                            onChange={(e) => updateUnit(unit.id, "price", Number(e.target.value))}
                            className="flex-1"
                            disabled={unit.isAutoPricing}
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Type:</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            onClick={() => updateUnit(unit.id, "type", "retail")}
                            size="sm"
                            variant={unit.type === "retail" ? "default" : "outline"}
                            className={`flex-1 text-xs ${
                              unit.type === "retail" 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "text-green-600 border-green-300"
                            }`}
                          >
                            Retail
                          </Button>
                          <Button
                            onClick={() => updateUnit(unit.id, "type", "wholesale")}
                            size="sm"
                            variant={unit.type === "wholesale" ? "default" : "outline"}
                            className={`flex-1 text-xs ${
                              unit.type === "wholesale" 
                                ? "bg-blue-500 hover:bg-blue-600" 
                                : "text-blue-600 border-blue-300"
                            }`}
                          >
                            Wholesale
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Price (Presyo o SRP)</Label>
              <Input 
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Cost (Puhunan)</Label>
              <Input 
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Stocks</Label>
              <div className="flex items-center mt-1">
                <Input 
                  type="number"
                  value={formData.stocks}
                  onChange={(e) => setFormData(prev => ({ ...prev, stocks: Number(e.target.value) }))}
                  className="rounded-r-none"
                />
                <div className="bg-gray-100 px-3 py-2 text-sm text-gray-500 border border-l-0 rounded-r">
                  pcs
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Low Stock Level</Label>
              <div className="flex items-center mt-1">
                <Input 
                  type="number"
                  value={formData.lowStockLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, lowStockLevel: Number(e.target.value) }))}
                  className="rounded-r-none"
                />
                <div className="bg-gray-100 px-3 py-2 text-sm text-gray-500 border border-l-0 rounded-r">
                  pcs
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Variant", key: "variant" as const },
              { label: "Add-on", key: "addon" as const },
              { label: "Notes", key: "notes" as const },
              { label: "Description", key: "description" as const },
              { label: "Selling Method", key: "selling" as const }
            ].map((option) => (
              <Button
                key={option.key}
                variant="outline"
                size="sm"
                className="p-3 h-auto flex flex-col items-center text-xs"
                onClick={() => openModal(option.key)}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full mb-1 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-gray-500" />
                </div>
                {option.label}
              </Button>
            ))}
          </div>

          {/* Display added items */}
          {formData.variants.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Variants</Label>
              <div className="flex flex-wrap gap-2">
                {formData.variants.map((variant, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {variant}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-0 h-4 w-4"
                      onClick={() => removeItem("variant", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.addOns.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Add-ons</Label>
              <div className="flex flex-wrap gap-2">
                {formData.addOns.map((addon, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {addon}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-0 h-4 w-4"
                      onClick={() => removeItem("addon", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.notes && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Notes</Label>
              <div className="bg-gray-100 p-3 rounded text-sm">{formData.notes}</div>
            </div>
          )}

          {formData.description && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Description</Label>
              <div className="bg-gray-100 p-3 rounded text-sm">{formData.description}</div>
            </div>
          )}

          {formData.sellingMethod && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Selling Method</Label>
              <div className="bg-gray-100 p-3 rounded text-sm">{formData.sellingMethod}</div>
            </div>
          )}

          {/* Add to Online Store */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-base">Add to Online Store</Label>
            <Switch 
              checked={formData.addToOnlineStore}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, addToOnlineStore: checked }))}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg font-medium mb-20"
          size="lg"
        >
          SAVE
        </Button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3 relative">
          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen?.("dashboard")}>
            <Home className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Home</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen?.("inventory")}>
            <Package className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Inventory</p>
          </div>

          <div className="text-center">
            <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs text-purple-600 font-medium mt-1">Add Product</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen?.("products")}>
            <FileText className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Products</p>
          </div>

          <div className="text-center cursor-pointer hover:opacity-80" onClick={() => setCurrentScreen?.("pos")}>
            <ShoppingBag className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Store</p>
          </div>
        </div>
      </div>

      {/* Modal for Additional Details */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add {currentModal === "variant" ? "Variant" : 
                   currentModal === "addon" ? "Add-on" :
                   currentModal === "notes" ? "Notes" :
                   currentModal === "description" ? "Description" :
                   "Selling Method"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {currentModal === "notes" || currentModal === "description" ? (
              <Textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={`Enter ${currentModal}...`}
                rows={4}
                className="w-full"
              />
            ) : (
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={
                  currentModal === "variant" ? "e.g., Small, Medium, Large" :
                  currentModal === "addon" ? "e.g., Extra Cheese, Extra Sauce" :
                  "Enter selling method..."
                }
                className="w-full"
              />
            )}
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleModalSave}
                disabled={!tempValue.trim()}
                className="bg-pink-500 hover:bg-pink-600"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}