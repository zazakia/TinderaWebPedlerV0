"use client"

import React, { useState, useRef } from 'react'
import Webcam from 'react-webcam'
import { ArrowLeft, Camera, X, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/lib/hooks/useProducts'

interface Product {
  id: string
  name: string
  sku: string
  price_retail: number
  stock: number
  barcode: string | null
}

export default function BarcodeScanner({ onBack }: { onBack: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [foundProduct, setFoundProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const webcamRef = useRef<Webcam>(null)
  const { products, loading } = useProducts()

  const videoConstraints = {
    facingMode: "environment"
  }

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      // In a real implementation, this would send the image to a barcode detection service
      // For now, we'll simulate a successful scan
      simulateScan()
    }
  }

  const simulateScan = () => {
    // Simulate scanning by selecting a random product's barcode or SKU
    if (products.length > 0) {
      const randomProduct = products[Math.floor(Math.random() * products.length)]
      const code = randomProduct.sku || randomProduct.id
      setScannedCode(code)
      findProductByCode(code)
    }
  }

  const findProductByCode = (code: string) => {
    // First try to find by barcode field
    let product = products.find(p => p.barcode === code)
    
    // If not found, try SKU
    if (!product) {
      product = products.find(p => p.sku === code)
    }
    
    // If not found, try ID
    if (!product) {
      product = products.find(p => p.id === code)
    }
    
    if (product) {
      setFoundProduct(product)
      setError(null)
    } else {
      setFoundProduct(null)
      setError('Product not found')
    }
  }

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      findProductByCode(manualCode.trim())
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Barcode Scanner</h1>
        </div>
      </div>

      <div className="p-4">
        {scanning ? (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white rounded-lg w-48 h-48"></div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 flex items-center justify-center gap-2"
              onClick={capture}
            >
              <Scan className="w-5 h-5" />
              Scan Barcode
            </Button>
          </div>
        ) : null}

        {scannedCode && (
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Scanned Code</h3>
              <Button variant="ghost" size="sm" className="p-1" onClick={() => setScannedCode(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">{scannedCode}</p>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-2">Manual Search</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter barcode, SKU, or product ID"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
            />
            <Button onClick={handleManualSearch}>Search</Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {foundProduct && (
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-2">Product Found</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{foundProduct.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">SKU</p>
                <p className="font-mono">{foundProduct.sku || 'N/A'}</p>
              </div>
              
              {foundProduct.barcode && (
                <div>
                  <p className="text-sm text-gray-500">Barcode</p>
                  <p className="font-mono">{foundProduct.barcode}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium">{formatCurrency(foundProduct.price_retail)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Stock</p>
                <p className={foundProduct.stock > 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                  {foundProduct.stock} items
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => {
                  // Add to POS cart functionality would go here
                  alert(`Added ${foundProduct.name} to cart`)
                }}
              >
                Add to Cart
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setFoundProduct(null)
                  setScannedCode(null)
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading products...</p>
          </div>
        )}
      </div>
    </div>
  )
}