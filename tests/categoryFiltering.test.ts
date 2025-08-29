import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { mockProducts } from './__test-utils__/test-utils'
import Dashboard from '../app/page'

describe('Category Filtering', () => {
  let mockLocalStorage: any

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })

    // Setup initial data
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'products') return JSON.stringify(mockProducts)
      if (key === 'cart') return JSON.stringify([])
      return null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Category Display', () => {
    it('should display all unique categories from products', async () => {
      render(React.createElement(Dashboard))

      // Navigate to POS screen where categories are displayed
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Should show all categories
      expect(screen.getByText('All')).toBeTruthy()
      expect(screen.getByText('Soft Drinks')).toBeTruthy()
      expect(screen.getByText('Snacks')).toBeTruthy()
      expect(screen.getByText('Powder Drink')).toBeTruthy()
    })

    it('should show category stock counts', async () => {
      render(React.createElement(Dashboard))

      // Navigate to inventory screen where category stock is shown
      const inventoryButton = screen.getByText('Inventory')
      fireEvent.click(inventoryButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Should show stock counts for each category
      const softDrinksStock = screen.getByText('STOCKS: 50')
      const snacksStock = screen.getByText('STOCKS: 30')
      const powderDrinkStock = screen.getByText('STOCKS: 75')

      expect(softDrinksStock).toBeTruthy()
      expect(snacksStock).toBeTruthy()
      expect(powderDrinkStock).toBeTruthy()
    })
  })

  describe('Category Filtering Logic', () => {
    it('should filter products by selected category', async () => {
      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Initially should show all products
      expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
      expect(screen.getByText('Tang Orange 25g')).toBeTruthy()

      // Click on Soft Drinks category
      const softDrinksCategory = screen.getByText('Soft Drinks')
      fireEvent.click(softDrinksCategory)

      // Should only show Soft Drinks products
      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.queryByText('Piattos Cheese 40g')).toBeNull()
        expect(screen.queryByText('Tang Orange 25g')).toBeNull()
      })
    })

    it('should show all products when All category is selected', async () => {
      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Click on Snacks category first
      const snacksCategory = screen.getByText('Snacks')
      fireEvent.click(snacksCategory)

      // Should only show Snacks products
      await waitFor(() => {
        expect(screen.queryByText('Coke Mismo 100ML')).toBeNull()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
        expect(screen.queryByText('Tang Orange 25g')).toBeNull()
      })

      // Click on All category
      const allCategory = screen.getByText('All')
      fireEvent.click(allCategory)

      // Should show all products again
      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
        expect(screen.getByText('Tang Orange 25g')).toBeTruthy()
      })
    })

    it('should handle category filtering with search', async () => {
      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Select Snacks category
      const snacksCategory = screen.getByText('Snacks')
      fireEvent.click(snacksCategory)

      // Search for "Cheese"
      const searchInput = screen.getByPlaceholderText('Search products...')
      fireEvent.change(searchInput, { target: { value: 'Cheese' } })

      // Should show Piattos Cheese
      await waitFor(() => {
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
      })

      // Search for non-existent product in Snacks category
      fireEvent.change(searchInput, { target: { value: 'Coke' } })

      // Should show no products
      await waitFor(() => {
        expect(screen.queryByText('Piattos Cheese 40g')).toBeNull()
      })
    })
  })

  describe('Category State Management', () => {
    it('should maintain selected category across screen changes', async () => {
      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Select Snacks category
      const snacksCategory = screen.getByText('Snacks')
      fireEvent.click(snacksCategory)

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeTruthy()
      })

      // Navigate back to POS
      const posButtonAgain = screen.getByText('Store')
      fireEvent.click(posButtonAgain)

      // Category selection should be maintained
      await waitFor(() => {
        expect(screen.queryByText('Coke Mismo 100ML')).toBeNull()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
      })
    })

    it('should reset to All category when navigating to new screens', async () => {
      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Select Snacks category
      const snacksCategory = screen.getByText('Snacks')
      fireEvent.click(snacksCategory)

      // Navigate to dashboard
      const homeButton = screen.getByText('Home')
      fireEvent.click(homeButton)

      // Navigate back to POS
      const posButtonAgain = screen.getByText('POS')
      fireEvent.click(posButtonAgain)

      // Should reset to All category
      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
        expect(screen.getByText('Tang Orange 25g')).toBeTruthy()
      })
    })
  })

  describe('Category Edge Cases', () => {
    it('should handle products with no category', async () => {
      const productsWithNoCategory = [
        { ...mockProducts[0], category: '' },
        mockProducts[1],
        mockProducts[2]
      ]

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(productsWithNoCategory)
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Soft Drinks')).toBeTruthy()
      })

      // Should still show categories for products that have them
      expect(screen.getByText('Snacks')).toBeTruthy()
      expect(screen.getByText('Powder Drink')).toBeTruthy()
    })

    it('should handle empty product list', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify([])
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      // Should only show All category
      await waitFor(() => {
        expect(screen.getByText('All')).toBeTruthy()
        expect(screen.queryByText('Soft Drinks')).toBeNull()
      })
    })

    it('should handle single category', async () => {
      const singleCategoryProducts = [
        { ...mockProducts[0], category: 'Beverages' },
        { ...mockProducts[1], category: 'Beverages' },
        { ...mockProducts[2], category: 'Beverages' }
      ]

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(singleCategoryProducts)
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to POS screen
      const posButton = screen.getByText('POS')
      fireEvent.click(posButton)

      await waitFor(() => {
        expect(screen.getByText('Beverages')).toBeTruthy()
      })

      // Should show All and Beverages categories
      expect(screen.getByText('All')).toBeTruthy()
      expect(screen.getByText('Beverages')).toBeTruthy()

      // Clicking Beverages should show all products (since all are in that category)
      const beveragesCategory = screen.getByText('Beverages')
      fireEvent.click(beveragesCategory)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
        expect(screen.getByText('Tang Orange 25g')).toBeTruthy()
      })
    })
  })
})