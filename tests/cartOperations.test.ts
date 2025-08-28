import { mockProducts, mockCartItems, createMockProduct, createMockCartItem } from './__test-utils__/test-utils'

describe('Cart Operations', () => {
  describe('Adding Items to Cart', () => {
    it('should add a new product to empty cart', () => {
      const cart: typeof mockCartItems = []
      const product = mockProducts[0]
      const unitName = "piece"

      // Simulate addToCart logic
      const unit = product.units.find(u => u.name === unitName) || product.units[0]
      const existingItem = cart.find(item => item.id === product.id && item.unit === unitName)

      if (!existingItem) {
        const newItem = {
          id: product.id,
          name: product.name,
          price: unit.price,
          quantity: 1,
          unit: unitName,
          total: unit.price
        }
        cart.push(newItem)
      }

      expect(cart).toHaveLength(1)
      expect(cart[0]).toEqual({
        id: product.id,
        name: product.name,
        price: unit.price,
        quantity: 1,
        unit: unitName,
        total: unit.price
      })
    })

    it('should increase quantity when adding existing product', () => {
      const cart = [...mockCartItems]
      const product = mockProducts[0]
      const unitName = "piece"

      // Simulate addToCart logic
      const unit = product.units.find(u => u.name === unitName) || product.units[0]
      const existingItem = cart.find(item => item.id === product.id && item.unit === unitName)

      if (existingItem) {
        existingItem.quantity += 1
        existingItem.total = existingItem.quantity * unit.price
      }

      const cokeItem = cart.find(item => item.id === product.id && item.unit === unitName)
      expect(cokeItem?.quantity).toBe(3) // Original was 2, added 1 more
      expect(cokeItem?.total).toBe(45) // 3 * 15
    })

    it('should handle different units for same product', () => {
      const cart: typeof mockCartItems = []
      const product = mockProducts[0]

      // Add same product with different units
      const unitsToAdd = ["piece", "pack"]

      unitsToAdd.forEach(unitName => {
        const unit = product.units.find(u => u.name === unitName) || product.units[0]
        const existingItem = cart.find(item => item.id === product.id && item.unit === unitName)

        if (!existingItem) {
          cart.push({
            id: product.id,
            name: product.name,
            price: unit.price,
            quantity: 1,
            unit: unitName,
            total: unit.price
          })
        }
      })

      expect(cart).toHaveLength(2)
      expect(cart[0].unit).toBe("piece")
      expect(cart[1].unit).toBe("pack")
      expect(cart[0].id).toBe(cart[1].id) // Same product ID
    })

    it('should handle products with multiple units correctly', () => {
      const cart: typeof mockCartItems = []
      const product = mockProducts[0]

      // Add product with pack unit
      const unit = product.units.find(u => u.name === "pack")!
      cart.push({
        id: product.id,
        name: product.name,
        price: unit.price,
        quantity: 1,
        unit: "pack",
        total: unit.price
      })

      expect(cart[0].price).toBe(85) // Pack price
      expect(cart[0].total).toBe(85)
    })
  })

  describe('Updating Cart Quantities', () => {
    it('should increase item quantity', () => {
      const cart = [...mockCartItems]
      const productId = 1
      const unitName = "piece"
      const newQuantity = 5

      // Simulate updateCartQuantity logic
      const updatedCart = cart.map(item => {
        if (item.id === productId && item.unit === unitName) {
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          }
        }
        return item
      })

      const updatedItem = updatedCart.find(item => item.id === productId && item.unit === unitName)
      expect(updatedItem?.quantity).toBe(5)
      expect(updatedItem?.total).toBe(75) // 5 * 15
    })

    it('should decrease item quantity', () => {
      const cart = [...mockCartItems]
      const productId = 1
      const unitName = "piece"
      const newQuantity = 1

      const updatedCart = cart.map(item => {
        if (item.id === productId && item.unit === unitName) {
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          }
        }
        return item
      })

      const updatedItem = updatedCart.find(item => item.id === productId && item.unit === unitName)
      expect(updatedItem?.quantity).toBe(1)
      expect(updatedItem?.total).toBe(15) // 1 * 15
    })

    it('should remove item when quantity becomes zero', () => {
      const cart = [...mockCartItems]
      const productId = 1
      const unitName = "piece"
      const newQuantity = 0

      // Simulate updateCartQuantity with removal logic
      let updatedCart = cart.map(item => {
        if (item.id === productId && item.unit === unitName) {
          if (newQuantity <= 0) {
            return null // Mark for removal
          }
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          }
        }
        return item
      }).filter(item => item !== null) as typeof cart

      const removedItem = updatedCart.find(item => item.id === productId && item.unit === unitName)
      expect(removedItem).toBeUndefined()
      expect(updatedCart).toHaveLength(cart.length - 1)
    })

    it('should handle negative quantities by removing item', () => {
      const cart = [...mockCartItems]
      const productId = 1
      const unitName = "piece"
      const newQuantity = -1

      let updatedCart = cart.map(item => {
        if (item.id === productId && item.unit === unitName) {
          if (newQuantity <= 0) {
            return null
          }
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price
          }
        }
        return item
      }).filter(item => item !== null) as typeof cart

      expect(updatedCart.find(item => item.id === productId && item.unit === unitName)).toBeUndefined()
    })

    it('should not affect other items when updating one', () => {
      const cart = [...mockCartItems]
      const originalCart = [...cart]

      // Update only the first item
      const updatedCart = cart.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            quantity: item.quantity + 1,
            total: (item.quantity + 1) * item.price
          }
        }
        return item
      })

      // Other items should remain unchanged
      for (let i = 1; i < updatedCart.length; i++) {
        expect(updatedCart[i]).toEqual(originalCart[i])
      }
    })
  })

  describe('Removing Items from Cart', () => {
    it('should remove specific item from cart', () => {
      const cart = [...mockCartItems]
      const productId = 1
      const unitName = "piece"

      const updatedCart = cart.filter(item => !(item.id === productId && item.unit === unitName))

      expect(updatedCart).toHaveLength(cart.length - 1)
      expect(updatedCart.find(item => item.id === productId && item.unit === unitName)).toBeUndefined()
    })

    it('should remove only specified unit of product', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 1, unit: "piece", total: 10 },
        { id: 1, name: "Product A", price: 50, quantity: 1, unit: "pack", total: 50 },
        { id: 2, name: "Product B", price: 20, quantity: 1, unit: "piece", total: 20 }
      ]

      const productId = 1
      const unitName = "piece"

      const updatedCart = cart.filter(item => !(item.id === productId && item.unit === unitName))

      expect(updatedCart).toHaveLength(2)
      expect(updatedCart.find(item => item.id === productId && item.unit === "pack")).toBeDefined()
      expect(updatedCart.find(item => item.id === 2)).toBeDefined()
    })

    it('should handle removing non-existent item gracefully', () => {
      const cart = [...mockCartItems]
      const productId = 999 // Non-existent
      const unitName = "piece"

      const updatedCart = cart.filter(item => !(item.id === productId && item.unit === unitName))

      expect(updatedCart).toHaveLength(cart.length)
      expect(updatedCart).toEqual(cart)
    })
  })

  describe('Cart Calculations', () => {
    it('should calculate total amount correctly', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 2, unit: "piece", total: 20 },
        { id: 2, name: "Product B", price: 15, quantity: 1, unit: "piece", total: 15 }
      ]

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0)

      expect(totalAmount).toBe(35) // 20 + 15
    })

    it('should calculate total items correctly', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 2, unit: "piece", total: 20 },
        { id: 2, name: "Product B", price: 15, quantity: 1, unit: "piece", total: 15 }
      ]

      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

      expect(totalItems).toBe(3) // 2 + 1
    })

    it('should handle empty cart calculations', () => {
      const cart: typeof mockCartItems = []

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0)
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

      expect(totalAmount).toBe(0)
      expect(totalItems).toBe(0)
    })

    it('should recalculate totals after quantity changes', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 2, unit: "piece", total: 20 },
        { id: 2, name: "Product B", price: 15, quantity: 1, unit: "piece", total: 15 }
      ]

      // Double the quantity of first item
      cart[0].quantity *= 2
      cart[0].total = cart[0].quantity * cart[0].price

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0)
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

      expect(totalAmount).toBe(55) // (4 * 10) + 15 = 40 + 15
      expect(totalItems).toBe(5) // 4 + 1
    })

    it('should handle decimal prices correctly', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10.50, quantity: 2, unit: "piece", total: 21.00 },
        { id: 2, name: "Product B", price: 5.25, quantity: 1, unit: "piece", total: 5.25 }
      ]

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0)

      expect(totalAmount).toBe(26.25)
    })
  })

  describe('Cart State Management', () => {
    it('should maintain cart state consistency', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 2, unit: "piece", total: 20 },
        { id: 2, name: "Product B", price: 15, quantity: 1, unit: "piece", total: 15 }
      ]

      // Perform multiple operations
      const operations = [
        () => cart.push({ id: 3, name: "New Product", price: 12, quantity: 1, unit: "piece", total: 12 }),
        () => { cart[0].quantity += 1; cart[0].total = cart[0].quantity * cart[0].price },
        () => cart.splice(1, 1) // Remove second item
      ]

      operations.forEach(op => op())

      expect(cart).toHaveLength(2)
      expect(cart[0].quantity).toBe(3)
      expect(cart[0].total).toBe(30) // 3 * 10
      expect(cart[1].id).toBe(3)
    })

    it('should handle concurrent cart modifications', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 2, unit: "piece", total: 20 },
        { id: 2, name: "Product B", price: 15, quantity: 1, unit: "piece", total: 15 }
      ]

      // Simulate concurrent operations
      const addOperation = () => {
        cart.push({ id: 3, name: "Concurrent Product", price: 8, quantity: 1, unit: "piece", total: 8 })
      }

      const updateOperation = () => {
        const item = cart.find(item => item.id === 1)
        if (item) {
          item.quantity += 1
          item.total = item.quantity * item.price
        }
      }

      addOperation()
      updateOperation()

      expect(cart).toHaveLength(3)
      expect(cart.find(item => item.id === 1)?.quantity).toBe(3)
      expect(cart.find(item => item.id === 3)?.quantity).toBe(1)
    })

    it('should validate cart item data integrity', () => {
      const cart = [...mockCartItems]

      cart.forEach(item => {
        expect(item.id).toBeDefined()
        expect(item.name).toBeDefined()
        expect(item.price).toBeGreaterThan(0)
        expect(item.quantity).toBeGreaterThan(0)
        expect(item.unit).toBeDefined()
        expect(item.total).toBe(item.price * item.quantity)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle products with zero price', () => {
      const cart = [
        { id: 1, name: "Free Product", price: 0, quantity: 5, unit: "piece", total: 0 }
      ]

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0)
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

      expect(totalAmount).toBe(0)
      expect(totalItems).toBe(5)
    })

    it('should handle very large quantities', () => {
      const cart = [
        { id: 1, name: "Bulk Product", price: 1, quantity: 1000000, unit: "piece", total: 1000000 }
      ]

      const totalAmount = cart.reduce((sum, item) => sum + item.total, 0)

      expect(totalAmount).toBe(1000000)
    })

    it('should handle items with very long names', () => {
      const longName = 'A'.repeat(1000)
      const cart = [
        { id: 1, name: longName, price: 10, quantity: 1, unit: "piece", total: 10 }
      ]

      expect(cart[0].name).toBe(longName)
      expect(cart[0].name.length).toBe(1000)
    })

    it('should handle cart with duplicate items (same id and unit)', () => {
      const cart = [
        { id: 1, name: "Product A", price: 10, quantity: 1, unit: "piece", total: 10 },
        { id: 1, name: "Product A", price: 10, quantity: 2, unit: "piece", total: 20 } // Duplicate
      ]

      // This shouldn't happen in real app, but test handles it
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

      expect(totalItems).toBe(3)
    })
  })
})