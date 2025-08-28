"use client"

import React, { useState, useRef } from 'react'
import { ArrowLeft, Camera, Scan, Plus, Minus, Check, X, Save, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/lib/hooks/useProducts'
import { useLocations } from '@/lib/hooks/useLocations'

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  barcode: string | null
  category: string
}

interface CountItem {
  productId: string
  expectedQuantity: number
  countedQuantity: number | null
  difference: number | null
  status: 'pending' | 'counted' | 'verified'
}

export default function InventoryCount({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'setup' | 'counting' | 'review' | 'completed'>('setup')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [countItems, setCountItems] = useState<CountItem[]>([])
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [manualEntry, setManualEntry] = useState('')
  const [scanning, setScanning] = useState(false)
  const { products, loading: productsLoading } = useProducts()
  const { locations, loading: locationsLoading } = useLocations()
  
  // Initialize count items for selected location
  const initializeCount = () => {
    if (!selectedLocation) return
    
    const items: CountItem[] = products.map(product => ({
      productId: product.id,
      expectedQuantity: product.stock,
      countedQuantity: null,
      difference: null,
      status: 'pending'
    }))
    
    setCountItems(items)
    setStep('counting')
  }
  
  // Find product by barcode, SKU, or ID
  const findProduct = (code: string) => {
    return products.find(p => 
      p.barcode === code || 
      p.sku === code || 
      p.id === code
    ) || null
  }
  
  // Handle barcode scan or manual entry
  const handleProductLookup = () => {
    if (!manualEntry.trim()) return
    
    const product = findProduct(manualEntry.trim())
    if (product) {
      setCurrentProduct(product)
      // Check if this product is already in our count items
      const existingItem = countItems.find(item => item.productId === product.id)
      if (existingItem && existingItem.countedQuantity !== null) {
        setManualEntry(existingItem.countedQuantity.toString())
      } else {
        setManualEntry('')
      }
    } else {
      alert('Product not found')
    }
  }
  
  // Update count for a product
  const updateCount = (productId: string, quantity: number) => {
    setCountItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const difference = quantity - item.expectedQuantity
        return {
          ...item,
          countedQuantity: quantity,
          difference,
          status: 'counted'
        }
      }
      return item
    }))
    
    // Move to next product or stay on current
    setCurrentProduct(null)
    setManualEntry('')
  }
  
  // Save all counts
  const saveCounts = async () => {
    // In a real implementation, this would update the database
    // For now, we'll just mark as completed
    console.log('Saving counts:', countItems)
    setStep('completed')
  }
  
  // Get count statistics
  const getCountStats = () => {
    const totalItems = countItems.length
    const countedItems = countItems.filter(item => item.status === 'counted').length
    const discrepancies = countItems.filter(item => 
      item.difference !== null && item.difference !== 0
    ).length
    
    return { totalItems, countedItems, discrepancies }
  }
  
  const stats = getCountStats()
  
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Inventory Count</h1>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-3">Select Location</h3>
            {locationsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {locations.map(location => (
                  <div 
                    key={location.id}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      selectedLocation === location.id 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedLocation(location.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{location.name}</span>
                      {selectedLocation === location.id && (
                        <Check className="w-5 h-5 text-pink-500" />
                      )}
                    </div>
                    {location.address && (
                      <p className="text-sm text-gray-500 mt-1">{location.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <Button 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3"
            disabled={!selectedLocation || locationsLoading}
            onClick={initializeCount}
          >
            Start Count
          </Button>
        </div>
      </div>
    )
  }
  
  if (step === 'counting') {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setStep('setup')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Count Inventory</h1>
          </div>
          <div className="text-sm text-gray-500">
            {stats.countedItems}/{stats.totalItems}
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Progress */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round((stats.countedItems / stats.totalItems) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full" 
                style={{ width: `${(stats.countedItems / stats.totalItems) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-2 text-gray-500">
              <span>{stats.discrepancies} discrepancies</span>
              <span>{stats.totalItems - stats.countedItems} remaining</span>
            </div>
          </div>
          
          {/* Product Lookup */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-3">Find Product</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Scan barcode or enter SKU"
                value={manualEntry}
                onChange={(e) => setManualEntry(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleProductLookup()}
              />
              <Button onClick={handleProductLookup}>Find</Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setScanning(!scanning)}
              >
                <Camera className="w-4 h-4 mr-2" />
                {scanning ? 'Cancel Scan' : 'Scan'}
              </Button>
            </div>
          </div>
          
          {/* Current Product */}
          {currentProduct && (
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{currentProduct.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {currentProduct.sku}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentProduct(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Expected: {currentProduct.stock}</span>
                <span className="text-sm font-medium">
                  {countItems.find(item => item.productId === currentProduct.id)?.difference !== null ? 
                    `Difference: ${countItems.find(item => item.productId === currentProduct.id)?.difference}` : 
                    'No difference'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const currentCount = parseInt(manualEntry) || 0
                    setManualEntry(Math.max(0, currentCount - 1).toString())
                  }}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={manualEntry}
                  onChange={(e) => setManualEntry(e.target.value)}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const currentCount = parseInt(manualEntry) || 0
                    setManualEntry((currentCount + 1).toString())
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                className="w-full mt-4 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => {
                  const quantity = parseInt(manualEntry) || 0
                  updateCount(currentProduct.id, quantity)
                }}
              >
                Save Count
              </Button>
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setStep('review')}>
                Review Counts
              </Button>
              <Button variant="outline" onClick={() => {
                setCurrentProduct(null)
                setManualEntry('')
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setStep('counting')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Review Counts</h1>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-xl font-semibold">{stats.totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Counted</p>
                <p className="text-xl font-semibold">{stats.countedItems}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Discrepancies</p>
                <p className="text-xl font-semibold text-orange-600">{stats.discrepancies}</p>
              </div>
            </div>
            
            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              onClick={saveCounts}
            >
              <Save className="w-4 h-4 mr-2" />
              Save All Counts
            </Button>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-3">Discrepancies</h3>
            {countItems.filter(item => item.difference !== null && item.difference !== 0).length > 0 ? (
              <div className="space-y-3">
                {countItems
                  .filter(item => item.difference !== null && item.difference !== 0)
                  .map(item => {
                    const product = products.find(p => p.id === item.productId)
                    return product ? (
                      <div key={item.productId} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            Expected: {item.expectedQuantity} | Counted: {item.countedQuantity}
                          </p>
                        </div>
                        <span className="font-medium text-orange-600">
                          {item.difference}
                        </span>
                      </div>
                    ) : null
                  })
                }
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No discrepancies found
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-3">All Items</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {countItems.map(item => {
                const product = products.find(p => p.id === item.productId)
                return product ? (
                  <div 
                    key={item.productId} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Expected: {item.expectedQuantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {item.countedQuantity !== null ? item.countedQuantity : '-'}
                      </p>
                      {item.difference !== null && item.difference !== 0 && (
                        <p className="text-sm text-orange-600">
                          ({item.difference > 0 ? '+' : ''}{item.difference})
                        </p>
                      )}
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Count Completed!</h2>
          <p className="text-gray-600 mb-6">
            Inventory count has been saved successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Items Counted:</span>
              <span className="font-medium">{stats.countedItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Discrepancies:</span>
              <span className="font-medium text-orange-600">{stats.discrepancies}</span>
            </div>
          </div>
          <Button 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            onClick={onBack}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }
  
  return null
}