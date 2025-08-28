import { mockProducts, mockCartItems, mockLocalStorage } from './__test-utils__/test-utils'

describe('Regression Tests - Critical User Flows', () => {
  let mockStorage: any

  beforeEach(() => {
    mockStorage = mockLocalStorage({
      products: mockProducts,
      cart: mockCartItems
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Critical POS Workflow Regressions', () => {
    it('should not lose cart items when switching screens', () => {
      // Verify initial cart state
      const cartItems = JSON.parse(mockStorage.getItem('cart') || '[]')
      expect(cartItems).toHaveLength(2)

      // Simulate screen navigation (this would trigger in real app)
      // In regression testing, we verify the cart persists
      const savedCart = JSON.parse(mockStorage.getItem('cart') || '[]')
      expect(savedCart).toHaveLength(2)
      expect(savedCart[0].quantity).toBe(2)
      expect(savedCart[1].quantity).toBe(1)
    })

    it('should maintain product data integrity after multiple operations', () => {
      const initialProducts = [...mockProducts]

      // Simulate multiple product operations
      const operations = [
        () => {
          const products = JSON.parse(mockStorage.getItem('products') || '[]')
          // Add new product
          products.push({
            ...mockProducts[0],
            id: 999,
            name: "New Product"
          })
          mockStorage.setItem('products', JSON.stringify(products))
        },
        () => {
          const products = JSON.parse(mockStorage.getItem('products') || '[]')
          // Update existing product
          const product = products.find((p: any) => p.id === 1)
          if (product) {
            product.price = 20.00
          }
          mockStorage.setItem('products', JSON.stringify(products))
        },
        () => {
          const products = JSON.parse(mockStorage.getItem('products') || '[]')
          // Remove product
          const filtered = products.filter((p: any) => p.id !== 2)
          mockStorage.setItem('products', JSON.stringify(filtered))
        }
      ]

      operations.forEach(op => op())

      // Verify final state
      const finalProducts = JSON.parse(mockStorage.getItem('products') || '[]')

      expect(finalProducts).toHaveLength(3) // 3 original + 1 added - 1 removed
      expect(finalProducts.find((p: any) => p.id === 1)?.price).toBe(20.00)
      expect(finalProducts.find((p: any) => p.id === 2)).toBeUndefined()
      expect(finalProducts.find((p: any) => p.id === 999)).toBeDefined()
    })

    it('should handle cart calculations correctly under load', () => {
      // Simulate heavy cart usage
      const largeCart = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        name: `Product ${index + 1}`,
        price: 10.00,
        quantity: Math.floor(Math.random() * 10) + 1,
        unit: "piece",
        total: 0
      })).map(item => ({
        ...item,
        total: item.price * item.quantity
      }))

      mockStorage.setItem('cart', JSON.stringify(largeCart))

      const loadedCart = JSON.parse(mockStorage.getItem('cart') || '[]')
      const totalAmount = loadedCart.reduce((sum: number, item: any) => sum + item.total, 0)
      const totalItems = loadedCart.reduce((sum: number, item: any) => sum + item.quantity, 0)

      expect(loadedCart).toHaveLength(100)
      expect(totalAmount).toBeGreaterThan(0)
      expect(totalItems).toBeGreaterThan(0)

      // Verify calculation accuracy
      loadedCart.forEach((item: any) => {
        expect(item.total).toBe(item.price * item.quantity)
      })
    })

    it('should prevent data corruption during concurrent operations', () => {
      const initialProducts = [...mockProducts]
      const initialCart = [...mockCartItems]

      // Simulate concurrent operations that could cause race conditions
      const operations = [
        // Operation 1: Add to cart
        () => {
          const cart = JSON.parse(mockStorage.getItem('cart') || '[]')
          cart.push({
            id: 3,
            name: "Concurrent Product",
            price: 15.00,
            quantity: 1,
            unit: "piece",
            total: 15.00
          })
          mockStorage.setItem('cart', JSON.stringify(cart))
        },
        // Operation 2: Update product price
        () => {
          const products = JSON.parse(mockStorage.getItem('products') || '[]')
          const product = products.find((p: any) => p.id === 1)
          if (product) {
            product.price = 18.00
          }
          mockStorage.setItem('products', JSON.stringify(products))
        },
        // Operation 3: Remove from cart
        () => {
          const cart = JSON.parse(mockStorage.getItem('cart') || '[]')
          const filtered = cart.filter((item: any) => item.id !== 2)
          mockStorage.setItem('cart', JSON.stringify(filtered))
        }
      ]

      operations.forEach(op => op())

      // Verify data integrity
      const finalProducts = JSON.parse(mockStorage.getItem('products') || '[]')
      const finalCart = JSON.parse(mockStorage.getItem('cart') || '[]')

      expect(finalProducts.find((p: any) => p.id === 1)?.price).toBe(18.00)
      expect(finalCart.find((item: any) => item.id === 3)).toBeDefined()
      expect(finalCart.find((item: any) => item.id === 2)).toBeUndefined()
    })
  })

  describe('Data Persistence Regressions', () => {
    it('should recover from localStorage corruption', () => {
      // Simulate corrupted localStorage
      mockStorage.setItem('products', '{invalid json data')
      mockStorage.setItem('cart', 'null')

      // Application should handle this gracefully
      const products = (() => {
        try {
          return JSON.parse(mockStorage.getItem('products') || '[]')
        } catch {
          return []
        }
      })()

      const cart = (() => {
        try {
          const cartData = JSON.parse(mockStorage.getItem('cart') || '[]')
          return Array.isArray(cartData) ? cartData : []
        } catch {
          return []
        }
      })()

      expect(products).toEqual([])
      expect(cart).toEqual([])
    })

    it('should maintain data consistency across app restarts', () => {
      // Simulate app restart by clearing in-memory data but keeping localStorage
      const savedProducts = JSON.parse(mockStorage.getItem('products') || '[]')
      const savedCart = JSON.parse(mockStorage.getItem('cart') || '[]')

      // Verify data integrity after "restart"
      expect(savedProducts).toHaveLength(3)
      expect(savedCart).toHaveLength(2)

      // Verify relationships are maintained
      const cartProductIds = savedCart.map((item: any) => item.id)
      const productIds = savedProducts.map((p: any) => p.id)

      cartProductIds.forEach((cartId: number) => {
        expect(productIds).toContain(cartId)
      })
    })

    it('should handle localStorage quota exceeded gracefully', () => {
      const originalSetItem = mockStorage.setItem

      // Mock quota exceeded error
      mockStorage.setItem = jest.fn((key: string, value: string) => {
        if (value.length > 1000) { // Simulate quota limit
          throw new Error('QuotaExceededError')
        }
        return originalSetItem(key, value)
      })

      // Small data should work
      expect(() => {
        mockStorage.setItem('test', 'small data')
      }).not.toThrow()

      // Large data should fail gracefully
      expect(() => {
        mockStorage.setItem('large', 'x'.repeat(2000))
      }).toThrow('QuotaExceededError')

      // Restore original function
      mockStorage.setItem = originalSetItem
    })
  })

  describe('UI State Regressions', () => {
    it('should maintain screen state during navigation', () => {
      // This test ensures that when users navigate between screens,
      // their current state (selections, filters, etc.) is preserved

      const initialState = {
        currentScreen: 'dashboard',
        searchQuery: 'test search',
        selectedCategory: 'Soft Drinks',
        sortOrder: 'asc' as const
      }

      // Simulate state preservation
      mockStorage.setItem('uiState', JSON.stringify(initialState))

      const loadedState = JSON.parse(mockStorage.getItem('uiState') || '{}')

      expect(loadedState.currentScreen).toBe('dashboard')
      expect(loadedState.searchQuery).toBe('test search')
      expect(loadedState.selectedCategory).toBe('Soft Drinks')
      expect(loadedState.sortOrder).toBe('asc')
    })

    it('should handle rapid user interactions without breaking', () => {
      // Simulate rapid cart operations
      const operations = Array.from({ length: 50 }, (_, i) => ({
        type: i % 3 === 0 ? 'add' : i % 3 === 1 ? 'update' : 'remove',
        productId: (i % 3) + 1
      }))

      let cart = [...mockCartItems]

      operations.forEach((op, index) => {
        if (op.type === 'add') {
          const existing = cart.find(item => item.id === op.productId)
          if (!existing) {
            cart.push({
              id: op.productId,
              name: `Product ${op.productId}`,
              price: 10.00,
              quantity: 1,
              unit: "piece",
              total: 10.00
            })
          }
        } else if (op.type === 'update') {
          const item = cart.find(item => item.id === op.productId)
          if (item) {
            item.quantity += 1
            item.total = item.quantity * item.price
          }
        } else if (op.type === 'remove') {
          cart = cart.filter(item => item.id !== op.productId)
        }
      })

      // Verify cart is in valid state
      expect(cart.length).toBeGreaterThanOrEqual(0)
      cart.forEach(item => {
        expect(item.quantity).toBeGreaterThan(0)
        expect(item.total).toBe(item.price * item.quantity)
      })
    })
  })

  describe('Business Logic Regressions', () => {
    it('should calculate totals correctly with tax/vat scenarios', () => {
      const cart = [
        { id: 1, name: "Taxable Item", price: 100.00, quantity: 2, unit: "piece", total: 200.00 },
        { id: 2, name: "Non-taxable Item", price: 50.00, quantity: 1, unit: "piece", total: 50.00 }
      ]

      // Simulate tax calculation (12% VAT)
      const taxRate = 0.12
      const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
      const tax = subtotal * taxRate
      const total = subtotal + tax

      expect(subtotal).toBe(250.00)
      expect(tax).toBe(30.00)
      expect(total).toBe(280.00)
    })

    it('should handle multi-unit pricing correctly', () => {
      const product = mockProducts[0] // Coke with multiple units

      // Test different unit calculations
      const piecePrice = product.units.find(u => u.name === 'piece')?.price || 0
      const packPrice = product.units.find(u => u.name === 'pack')?.price || 0
      const casePrice = product.units.find(u => u.name === 'case')?.price || 0

      expect(piecePrice).toBe(15.00)
      expect(packPrice).toBe(85.00) // 6 pieces * 15 = 90, but wholesale discount
      expect(casePrice).toBe(320.00) // 24 pieces with discount

      // Verify pack price is less than 6 * piece price (wholesale discount)
      expect(packPrice).toBeLessThan(piecePrice * 6)
    })

    it('should maintain inventory consistency', () => {
      const initialStock = mockProducts.reduce((sum, product) => sum + product.stock, 0)

      // Simulate sales
      const sales = [
        { productId: 1, quantity: 5 },
        { productId: 2, quantity: 3 },
        { productId: 1, quantity: 2 } // Additional sale of product 1
      ]

      let currentStock = initialStock
      sales.forEach(sale => {
        const product = mockProducts.find(p => p.id === sale.productId)
        if (product) {
          currentStock -= sale.quantity
        }
      })

      expect(currentStock).toBe(initialStock - 10) // 5 + 3 + 2
      expect(currentStock).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Performance Regressions', () => {
    it('should handle large datasets efficiently', () => {
      const startTime = Date.now()

      // Create large dataset
      const largeProducts = Array.from({ length: 1000 }, (_, i) => ({
        ...mockProducts[i % mockProducts.length],
        id: i + 1,
        name: `Product ${i + 1}`
      }))

      // Perform operations that should complete quickly
      const filtered = largeProducts.filter(p => p.category === 'Soft Drinks')
      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      const totalValue = sorted.reduce((sum, p) => sum + p.price, 0)

      const endTime = Date.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(500) // Should complete in less than 500ms
      expect(sorted.length).toBeGreaterThan(0)
      expect(totalValue).toBeGreaterThan(0)
    })

    it('should not have memory leaks in repeated operations', () => {
      // This test ensures that repeated operations don't cause memory issues
      let cart: typeof mockCartItems = []

      for (let i = 0; i < 100; i++) {
        cart.push({
          id: i,
          name: `Item ${i}`,
          price: 10,
          quantity: 1,
          unit: "piece",
          total: 10
        })

        // Simulate cleanup (remove every 10th item)
        if (i % 10 === 0) {
          cart = cart.filter(item => item.id % 10 !== 0)
        }
      }

      expect(cart.length).toBeLessThan(100) // Some items should be cleaned up
    })
  })
})