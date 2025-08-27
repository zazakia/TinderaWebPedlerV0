"use client"

import React, { useState, useRef } from 'react'
import { ArrowLeft, Download, Printer, Copy, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/lib/hooks/useProducts'
import { jsPDF } from 'jspdf'
// @ts-ignore
import bwipjs from 'bwip-js'

interface Product {
  id: string
  name: string
  sku: string
  price_retail: number
  barcode: string | null
}

export default function BarcodeGenerator({ onBack }: { onBack: () => void }) {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [barcodeType, setBarcodeType] = useState<'code128' | 'ean13' | 'qr'>('code128')
  const [labelSize, setLabelSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [copies, setCopies] = useState<number>(1)
  const { products, loading } = useProducts()
  const printRef = useRef<HTMLDivElement>(null)

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  const selectAllProducts = () => {
    const newSelection: Record<string, boolean> = {}
    products.forEach(product => {
      newSelection[product.id] = true
    })
    setSelectedProducts(newSelection)
  }

  const clearSelection = () => {
    setSelectedProducts({})
  }

  const generateBarcode = (text: string, type: string) => {
    try {
      // Using bwip-js to generate barcode
      const canvas = document.createElement('canvas')
      bwipjs.toCanvas(canvas, {
        bcid: type,
        text: text,
        scale: 3,
        height: 10,
        includetext: false,
        backgroundcolor: 'ffffff',
      })
      
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('Error generating barcode:', error)
      return null
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const printLabels = () => {
    window.print()
  }

  const downloadLabels = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const selectedProductList = products.filter(p => selectedProducts[p.id])
    
    if (selectedProductList.length === 0) {
      alert('Please select at least one product')
      return
    }

    // Add title
    doc.setFontSize(16)
    doc.text('Product Barcodes', 105, 15, { align: 'center' })
    
    // Add products
    let yPosition = 30
    selectedProductList.forEach((product, index) => {
      // Add product name
      doc.setFontSize(12)
      doc.text(product.name, 20, yPosition)
      
      // Add price
      doc.setFontSize(10)
      doc.text(formatCurrency(product.price_retail), 20, yPosition + 7)
      
      // Add SKU
      doc.setFontSize(8)
      doc.text(`SKU: ${product.sku}`, 20, yPosition + 14)
      
      // Add barcode placeholder (in a real app, you'd add the actual barcode image)
      doc.rect(20, yPosition + 18, 60, 20)
      doc.setFontSize(8)
      doc.text('Barcode would appear here', 50, yPosition + 30, { align: 'center' })
      
      yPosition += 50
      
      // Add page break if needed
      if (yPosition > 250 && index < selectedProductList.length - 1) {
        doc.addPage()
        yPosition = 30
      }
    })
    
    doc.save('product-barcodes.pdf')
  }

  const selectedCount = Object.values(selectedProducts).filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Barcode Generator</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="p-2" onClick={downloadLabels}>
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2" onClick={printLabels}>
            <Printer className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-medium mb-3">Generation Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Barcode Type</label>
              <div className="flex gap-2">
                <Button 
                  variant={barcodeType === 'code128' ? 'default' : 'outline'}
                  size="sm"
                  className={barcodeType === 'code128' ? 'bg-pink-500 text-white' : ''}
                  onClick={() => setBarcodeType('code128')}
                >
                  Code 128
                </Button>
                <Button 
                  variant={barcodeType === 'ean13' ? 'default' : 'outline'}
                  size="sm"
                  className={barcodeType === 'ean13' ? 'bg-pink-500 text-white' : ''}
                  onClick={() => setBarcodeType('ean13')}
                >
                  EAN-13
                </Button>
                <Button 
                  variant={barcodeType === 'qr' ? 'default' : 'outline'}
                  size="sm"
                  className={barcodeType === 'qr' ? 'bg-pink-500 text-white' : ''}
                  onClick={() => setBarcodeType('qr')}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Label Size</label>
              <div className="flex gap-2">
                <Button 
                  variant={labelSize === 'small' ? 'default' : 'outline'}
                  size="sm"
                  className={labelSize === 'small' ? 'bg-pink-500 text-white' : ''}
                  onClick={() => setLabelSize('small')}
                >
                  Small
                </Button>
                <Button 
                  variant={labelSize === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  className={labelSize === 'medium' ? 'bg-pink-500 text-white' : ''}
                  onClick={() => setLabelSize('medium')}
                >
                  Medium
                </Button>
                <Button 
                  variant={labelSize === 'large' ? 'default' : 'outline'}
                  size="sm"
                  className={labelSize === 'large' ? 'bg-pink-500 text-white' : ''}
                  onClick={() => setLabelSize('large')}
                >
                  Large
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Copies per Label</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Products</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllProducts}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            {selectedCount} of {products.length} products selected
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading products...</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                    selectedProducts[product.id] 
                      ? 'border-pink-500 bg-pink-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    selectedProducts[product.id] 
                      ? 'bg-pink-500 border-pink-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedProducts[product.id] && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-gray-500 truncate">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(product.price_retail)}</p>
                    <p className="text-sm text-gray-500">{product.stock} in stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Print Preview (Hidden by default, shown when printing) */}
      <div className="hidden print:block p-4">
        <h1 className="text-2xl font-bold text-center mb-6">Product Barcodes</h1>
        <div className="grid grid-cols-2 gap-6">
          {products
            .filter(p => selectedProducts[p.id])
            .map((product) => (
              <div key={product.id} className="border p-4 text-center">
                <h2 className="font-bold text-lg mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-2">{formatCurrency(product.price_retail)}</p>
                <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
                <div className="bg-gray-100 h-20 flex items-center justify-center">
                  <p className="text-gray-500">Barcode would appear here</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}