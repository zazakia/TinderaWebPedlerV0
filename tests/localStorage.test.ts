import { mockProducts, mockCartItems, mockLocalStorage } from './__test-utils__/test-utils'

describe('localStorage Integration', () => {
  let mockStorage: any

  beforeEach(() => {
    mockStorage = mockLocalStorage()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Products Storage', () => {
    it('should save products to localStorage', () => {
      const products = mockProducts

      // Simulate saving products
      localStorage.setItem('products', JSON.stringify(products))

      // Verify the data was stored correctly
      expect(localStorage.getItem('products')).toBe(JSON.stringify(products))
    })

    it('should load products from localStorage', () => {
      const products = mockProducts

      // Pre-populate localStorage
      localStorage.setItem('products', JSON.stringify(products))

      // Simulate loading products
      const loadedProducts = JSON.parse(localStorage.getItem('products') || '[]')

      expect(loadedProducts).toEqual(products)
      expect(loadedProducts).toHaveLength(products.length)
    })

    it('should handle empty localStorage gracefully', () => {
      const loadedProducts = JSON.parse(localStorage.getItem('products') || '[]')

      expect(loadedProducts).toEqual([])
      expect(loadedProducts).toHaveLength(0)
    })

    it('should handle malformed JSON in localStorage', () => {
      // Set malformed JSON
      localStorage.setItem('products', '{invalid json')

      expect(() => {
        JSON.parse(localStorage.getItem('products') || '[]')
      }).toThrow(SyntaxError)
    })

    it('should preserve product data integrity', () => {
      const originalProducts = mockProducts

      // Save and load cycle
      localStorage.setItem('products', JSON.stringify(originalProducts))
      const loadedProducts = JSON.parse(localStorage.getItem('products') || '[]')

      // Check that all properties are preserved
      loadedProducts.forEach((product: any, index: number) => {
        expect(product.id).toBe(originalProducts[index].id)
        expect(product.name).toBe(originalProducts[index].name)
        expect(product.price).toBe(originalProducts[index].price)
        expect(product.stock).toBe(originalProducts[index].stock)
        expect(product.category).toBe(originalProducts[index].category)
        expect(product.units).toEqual(originalProducts[index].units)
      })
    })
  })

  describe('Cart Storage', () => {
    it('should save cart items to localStorage', () => {
      const cart = mockCartItems

      localStorage.setItem('cart', JSON.stringify(cart))

      // Verify the data was stored correctly
      expect(localStorage.getItem('cart')).toBe(JSON.stringify(cart))
    })

    it('should load cart items from localStorage', () => {
      const cart = mockCartItems

      localStorage.setItem('cart', JSON.stringify(cart))
      const loadedCart = JSON.parse(localStorage.getItem('cart') || '[]')

      expect(loadedCart).toEqual(cart)
      expect(loadedCart).toHaveLength(cart.length)
    })

    it('should handle empty cart in localStorage', () => {
      const loadedCart = JSON.parse(localStorage.getItem('cart') || '[]')

      expect(loadedCart).toEqual([])
      expect(loadedCart).toHaveLength(0)
    })

    it('should preserve cart item calculations', () => {
      const cart = mockCartItems

      localStorage.setItem('cart', JSON.stringify(cart))
      const loadedCart = JSON.parse(localStorage.getItem('cart') || '[]')

      loadedCart.forEach((item: any) => {
        expect(item.total).toBe(item.price * item.quantity)
        expect(item.quantity).toBeGreaterThan(0)
        expect(item.price).toBeGreaterThan(0)
      })
    })

    it('should handle cart with zero quantity items', () => {
      const cartWithZeroQuantity = [
        ...mockCartItems,
        { id: 999, name: 'Zero Item', price: 10, quantity: 0, unit: 'piece', total: 0 }
      ]

      localStorage.setItem('cart', JSON.stringify(cartWithZeroQuantity))
      const loadedCart = JSON.parse(localStorage.getItem('cart') || '[]')

      expect(loadedCart).toContainEqual(
        expect.objectContaining({ id: 999, quantity: 0, total: 0 })
      )
    })
  })

  describe('Storage Synchronization', () => {
    it('should synchronize products and cart data', () => {
      const products = mockProducts
      const cart = mockCartItems

      // Save both
      localStorage.setItem('products', JSON.stringify(products))
      localStorage.setItem('cart', JSON.stringify(cart))

      // Load both
      const loadedProducts = JSON.parse(localStorage.getItem('products') || '[]')
      const loadedCart = JSON.parse(localStorage.getItem('cart') || '[]')

      expect(loadedProducts).toEqual(products)
      expect(loadedCart).toEqual(cart)
    })

    it('should handle concurrent storage operations', () => {
      const products1 = [mockProducts[0]]
      const products2 = [mockProducts[1]]

      // Simulate concurrent saves
      localStorage.setItem('products', JSON.stringify(products1))
      localStorage.setItem('products', JSON.stringify(products2))

      const finalProducts = JSON.parse(localStorage.getItem('products') || '[]')

      expect(finalProducts).toEqual(products2)
    })

    it('should maintain data consistency across saves', () => {
      const initialProducts = mockProducts

      localStorage.setItem('products', JSON.stringify(initialProducts))

      // Modify and save again
      const modifiedProducts = initialProducts.map(p => ({ ...p, stock: p.stock + 1 }))
      localStorage.setItem('products', JSON.stringify(modifiedProducts))

      const loadedProducts = JSON.parse(localStorage.getItem('products') || '[]')

      loadedProducts.forEach((product: any, index: number) => {
        expect(product.stock).toBe(initialProducts[index].stock + 1)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const largeData = 'x'.repeat(1000) // Large string

      expect(() => {
        localStorage.setItem('largeData', largeData)
      }).toThrow('QuotaExceededError')

      // Restore original function
      localStorage.setItem = originalSetItem
    })

    it('should handle localStorage being disabled', () => {
      // Mock localStorage being disabled
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      expect(() => {
        localStorage.setItem('test', 'value')
      }).toThrow(ReferenceError)

      // Restore localStorage
      global.localStorage = originalLocalStorage
    })

    it('should handle null/undefined values', () => {
      localStorage.setItem('products', JSON.stringify(null))
      localStorage.setItem('cart', 'undefined') // JSON.stringify(undefined) returns undefined

      const loadedProducts = JSON.parse(localStorage.getItem('products') || 'null')
      const loadedCart = localStorage.getItem('cart') === 'undefined' ? undefined : JSON.parse(localStorage.getItem('cart') || 'null')

      expect(loadedProducts).toBeNull()
      expect(loadedCart).toBeUndefined()
    })
  })

  describe('Data Migration', () => {
    it('should handle versioned data storage', () => {
      const legacyData = {
        version: '1.0',
        products: mockProducts
      }

      localStorage.setItem('appData', JSON.stringify(legacyData))

      const loadedData = JSON.parse(localStorage.getItem('appData') || '{}')

      expect(loadedData.version).toBe('1.0')
      expect(loadedData.products).toEqual(mockProducts)
    })

    it('should migrate data structure changes', () => {
      // Simulate old format without units
      const oldFormatProducts = mockProducts.map(({ units, ...product }) => product)

      localStorage.setItem('products', JSON.stringify(oldFormatProducts))

      // Simulate migration logic
      const loadedProducts = JSON.parse(localStorage.getItem('products') || '[]')
      const migratedProducts = loadedProducts.map((product: any) => ({
        ...product,
        units: [{ name: 'piece', conversionFactor: 1, price: product.price, isBase: true, type: 'retail' }]
      }))

      migratedProducts.forEach((product: any) => {
        expect(product.units).toBeDefined()
        expect(product.units[0].isBase).toBe(true)
      })
    })
  })
})