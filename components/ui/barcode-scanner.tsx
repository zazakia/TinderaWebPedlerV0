"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Camera,
  ScanLine,
  X,
  Search,
  Package,
  CheckCircle,
  AlertCircle,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  Settings
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  stock: number
  image_url?: string
  category: string
}

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onProductFound: (product: Product) => void
  onProductNotFound?: (barcode: string) => void
  products: Product[]
}

// Barcode detection utilities
const detectBarcode = (imageData: ImageData): string | null => {
  // This is a simplified barcode detection algorithm
  // In a real implementation, you might use libraries like:
  // - @zxing/library
  // - quagga2
  // - jsqr (for QR codes)

  // For now, we'll simulate barcode detection
  // In production, integrate with a proper barcode scanning library
  return null
}

export function BarcodeScanner({
  isOpen,
  onClose,
  onProductFound,
  onProductNotFound,
  products
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize camera when dialog opens
  useEffect(() => {
    if (isOpen) {
      initializeCamera()
    } else {
      cleanup()
    }

    return cleanup
  }, [isOpen, facingMode])

  const initializeCamera = async () => {
    try {
      setError(null)

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser')
      }

      // Request camera permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      setStream(mediaStream)
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      // Start scanning after video loads
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = () => {
          startScanning()
        }
      }

    } catch (err: any) {
      console.error('Camera initialization error:', err)
      setHasPermission(false)

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access and try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please ensure your device has a camera.')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application.')
      } else {
        setError(`Camera error: ${err.message}`)
      }
    }
  }

  const startScanning = () => {
    setIsScanning(true)

    // Start scanning interval
    scanIntervalRef.current = setInterval(() => {
      captureAndScan()
    }, 100) // Scan every 100ms
  }

  const stopScanning = () => {
    setIsScanning(false)

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }

  const captureAndScan = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for barcode detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Attempt to detect barcode
    const detectedBarcode = detectBarcode(imageData)

    if (detectedBarcode) {
      handleBarcodeDetected(detectedBarcode)
    }

    // For demo purposes, we'll simulate random barcode detection
    // Remove this in production when using real barcode detection
    if (Math.random() < 0.01) { // 1% chance per scan
      const demoBarcode = '1234567890123'
      handleBarcodeDetected(demoBarcode)
    }
  }

  const handleBarcodeDetected = (barcode: string) => {
    stopScanning()

    // Find product by barcode
    const product = findProductByBarcode(barcode)

    if (product) {
      onProductFound(product)
      toast.success(`Product found: ${product.name}`)
      onClose()
    } else {
      toast.error(`Product not found for barcode: ${barcode}`)
      if (onProductNotFound) {
        onProductNotFound(barcode)
      }
      // Continue scanning after a short delay
      setTimeout(() => {
        if (isOpen) {
          startScanning()
        }
      }, 2000)
    }
  }

  const findProductByBarcode = (barcode: string): Product | null => {
    return products.find(product =>
      product.barcode === barcode ||
      product.sku === barcode
    ) || null
  }

  const handleManualEntry = () => {
    if (!manualBarcode.trim()) {
      toast.error('Please enter a barcode')
      return
    }

    handleBarcodeDetected(manualBarcode.trim())
    setManualBarcode('')
  }

  const toggleTorch = async () => {
    if (!stream) return

    try {
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        })
        setTorchEnabled(!torchEnabled)
      } else {
        toast.error('Flashlight not supported on this device')
      }
    } catch (err) {
      console.error('Torch error:', err)
      toast.error('Failed to toggle flashlight')
    }
  }

  const switchCamera = () => {
    setFacingMode(facingMode === 'user' ? 'environment' : 'user')
  }

  const cleanup = () => {
    stopScanning()

    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setHasPermission(null)
    setError(null)
    setTorchEnabled(false)
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            Barcode Scanner
          </DialogTitle>
          <DialogDescription>
            Point your camera at a barcode or enter it manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {hasPermission === false ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Camera access required</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={initializeCamera}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : hasPermission === null ? (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">Initializing camera...</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />

                  {/* Scanning overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-32 border-2 border-white border-dashed rounded-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine className="w-8 h-8 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-8 left-0 right-0 text-center">
                        <p className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          {isScanning ? 'Scanning...' : 'Position barcode here'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Camera controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={toggleTorch}
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      {torchEnabled ? (
                        <FlashlightOff className="w-4 h-4" />
                      ) : (
                        <Flashlight className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={switchCamera}
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Hidden canvas for image processing */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Manual entry */}
          <div className="space-y-2">
            <Label htmlFor="manual-barcode">Or enter barcode manually:</Label>
            <div className="flex gap-2">
              <Input
                id="manual-barcode"
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode or SKU"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualEntry()
                  }
                }}
              />
              <Button onClick={handleManualEntry} size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scanning status */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            {isScanning ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Scanning active</span>
              </>
            ) : hasPermission ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Scanning paused</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Camera unavailable</span>
              </>
            )}
          </div>

          {/* Help text */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• Position the barcode within the scanning area</p>
            <p>• Ensure good lighting for best results</p>
            <p>• Hold steady until the barcode is detected</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          {isScanning ? (
            <Button onClick={stopScanning} variant="secondary">
              <X className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          ) : hasPermission && (
            <Button onClick={startScanning}>
              <ScanLine className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for barcode scanner functionality
export function useBarcodeScanner(products: Product[]) {
  const [isOpen, setIsOpen] = useState(false)

  const openScanner = () => setIsOpen(true)
  const closeScanner = () => setIsOpen(false)

  const handleProductFound = (product: Product) => {
    console.log('Product found:', product)
    // This will be handled by the parent component
  }

  const handleProductNotFound = (barcode: string) => {
    console.log('Product not found for barcode:', barcode)
    // This can be used to add new products or show suggestions
  }

  return {
    isOpen,
    openScanner,
    closeScanner,
    BarcodeScanner: (props: Omit<BarcodeScannerProps, 'isOpen' | 'onClose' | 'products'>) => (
      <BarcodeScanner
        {...props}
        isOpen={isOpen}
        onClose={closeScanner}
        products={products}
      />
    )
  }
}

export default BarcodeScanner
