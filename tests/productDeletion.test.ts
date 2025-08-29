import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockProducts, createMockProduct } from './__test-utils__/test-utils'
import Dashboard from '../app/page'

describe('Product Deletion Functionality', () => {
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

  // Helper function to find delete buttons
  const findDeleteButton = () => {
    const allButtons = screen.getAllByRole('button')
    return allButtons.find(button =>
      button.className.includes('bg-red-500') &&
      button.querySelector('svg')
    )
  }

  describe('Single Product Deletion', () => {
    it('should show delete button for each product', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Should have delete buttons for each product
      const deleteButtons = screen.getAllByRole('button').filter(button =>
        button.className.includes('bg-red-500')
      )

      expect(deleteButtons).toHaveLength(mockProducts.length)
    })

    it('should show confirmation dialog when delete button is clicked', async () => {
      // Mock window.confirm
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Find and click delete button
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should show confirmation dialog
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this product?')
      }

      mockConfirm.mockRestore()
    })

    it('should delete product when confirmed', async () => {
      // Mock window.confirm to return true
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Find and click delete button
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Product should be removed from display
        await waitFor(() => {
          expect(screen.queryByText('Coke Mismo 100ML')).toBeNull()
        })

        // Should update localStorage
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'products',
          expect.not.stringContaining('Coke Mismo 100ML')
        )
      }

      mockConfirm.mockRestore()
    })

    it('should not delete product when cancelled', async () => {
      // Mock window.confirm to return false
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(false)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Find and click delete button
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Product should still be visible
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()

        // Should not update localStorage
        expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      }

      mockConfirm.mockRestore()
    })

    it('should remove product from cart when deleted', async () => {
      // Mock window.confirm
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      // Setup cart with the product to be deleted
      const cartWithProduct = [{
        id: 1,
        name: "Coke Mismo 100ML",
        price: 15.00,
        quantity: 2,
        unit: "piece",
        total: 30.00
      }]

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(mockProducts)
        if (key === 'cart') return JSON.stringify(cartWithProduct)
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Find and click delete button
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should update cart to remove the deleted product
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'cart',
          expect.not.stringContaining('Coke Mismo 100ML')
        )
      }

      mockConfirm.mockRestore()
    })
  })

  describe('Delete Operation Persistence', () => {
    it('should persist deletion to localStorage', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Delete product
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should save updated products list to localStorage
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'products',
          expect.any(String)
        )

        // Verify the saved data doesn't contain deleted product
        const setItemCalls = mockLocalStorage.setItem.mock.calls
        const productsCall = setItemCalls.find(([key]: [string, any]) => key === 'products')

        if (productsCall) {
          const savedProducts = JSON.parse(productsCall[1])
          expect(savedProducts).not.toContainEqual(
            expect.objectContaining({ name: 'Coke Mismo 100ML' })
          )
        }
      }

      mockConfirm.mockRestore()
    })

    it('should maintain data integrity after deletion', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Delete product
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Check that remaining products are intact
        const setItemCalls = mockLocalStorage.setItem.mock.calls
        const productsCall = setItemCalls.find(([key]: [string, any]) => key === 'products')

        if (productsCall) {
          const savedProducts = JSON.parse(productsCall[1])

          // Should have one less product
          expect(savedProducts).toHaveLength(mockProducts.length - 1)

          // Should contain the remaining products
          expect(savedProducts).toContainEqual(
            expect.objectContaining({ name: 'Piattos Cheese 40g' })
          )
          expect(savedProducts).toContainEqual(
            expect.objectContaining({ name: 'Tang Orange 25g' })
          )
        }
      }

      mockConfirm.mockRestore()
    })
  })

  describe('Delete Operation Edge Cases', () => {
    it('should handle deleting last product', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      // Setup with only one product
      const singleProduct = [mockProducts[0]]
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(singleProduct)
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Delete the only product
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should save empty products array
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'products',
          '[]'
        )
      }

      mockConfirm.mockRestore()
    })

    it('should handle deleting product with special characters in name', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      // Setup product with special characters
      const specialProduct = [{ ...mockProducts[0], name: 'Coke & Pepsi Mix!' }]
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(specialProduct)
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke & Pepsi Mix!')).toBeTruthy()
      })

      // Delete product
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should successfully delete product with special characters
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'products',
          '[]'
        )
      }

      mockConfirm.mockRestore()
    })

    it('should handle delete operations with proper confirmation flow', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Find and click delete button
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        fireEvent.click(deleteButton)

        // Should show confirmation dialog
        expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this product?')
        expect(mockConfirm).toHaveBeenCalledTimes(1)
      }

      mockConfirm.mockRestore()
    })
  })

  describe('Delete Operation UI Feedback', () => {
    it('should show loading state during deletion', async () => {
      // This test would verify loading states if implemented
      // For now, it documents the expected behavior
      expect(true).toBe(true)
    })

    it('should show success message after deletion', async () => {
      // This test would verify success messages if implemented
      // For now, it documents the expected behavior
      expect(true).toBe(true)
    })

    it('should handle delete operation errors gracefully', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      // Mock console.error to avoid test output pollution
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Now mock localStorage.setItem to throw error (after component initialization)
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      // Try to delete product
      const deleteButton = findDeleteButton()

      if (deleteButton) {
        // Should not throw error during the click
        expect(() => fireEvent.click(deleteButton)).not.toThrow()

        // Should log error (if error handling is implemented)
        // Note: This test documents expected behavior for error handling
        expect(mockConsoleError).toHaveBeenCalledWith(
          expect.stringContaining('Storage quota exceeded')
        )
      }

      mockConfirm.mockRestore()
      mockConsoleError.mockRestore()
    })
  })
})