import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockProducts, createMockProduct } from './__test-utils__/test-utils'
import Dashboard from '../app/page'

describe('Bulk Product Operations', () => {
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

  describe('Bulk Edit Mode', () => {
    it('should show bulk edit button on products screen', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Should show bulk edit button
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      expect(bulkEditButton).toBeTruthy()
    })

    it('should enter bulk edit mode when bulk edit button is clicked', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Click bulk edit button
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Should show checkboxes for product selection
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Should show cancel button
      expect(screen.getByText('CANCEL')).toBeTruthy()
    })

    it('should exit bulk edit mode when cancel is clicked', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Click cancel
      const cancelButton = screen.getByText('CANCEL')
      fireEvent.click(cancelButton)

      // Should exit bulk edit mode
      expect(screen.queryByRole('checkbox')).toBeNull()
      expect(screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })).toBeTruthy()
    })
  })

  describe('Product Selection', () => {
    it('should allow selecting individual products', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Find and click first checkbox
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      // Should show selected count
      expect(screen.getByText('1 products selected')).toBeTruthy()
    })

    it('should allow selecting multiple products', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Select multiple products
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])

      // Should show correct count
      expect(screen.getByText('2 products selected')).toBeTruthy()
    })

    it('should allow deselecting products', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Select and then deselect product
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // Select
      fireEvent.click(checkboxes[0]) // Deselect

      // Should show no products selected
      expect(screen.queryByText(/products selected/)).toBeNull()
    })
  })

  describe('Bulk Delete Operations', () => {
    it('should show delete selected button when products are selected', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Select a product
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      // Should show delete selected button
      expect(screen.getByText('Delete Selected')).toBeTruthy()
    })

    it('should show confirmation dialog for bulk delete', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode and select products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])

      // Click delete selected
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Should show confirmation dialog
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete 2 selected products?')

      mockConfirm.mockRestore()
    })

    it('should delete selected products when confirmed', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
      })

      // Enter bulk edit mode and select products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // Select first product
      fireEvent.click(checkboxes[1]) // Select second product

      // Delete selected products
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Products should be removed
      await waitFor(() => {
        expect(screen.queryByText('Coke Mismo 100ML')).toBeNull()
        expect(screen.queryByText('Piattos Cheese 40g')).toBeNull()
      })

      mockConfirm.mockRestore()
    })

    it('should not delete products when bulk delete is cancelled', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(false)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode and select products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      // Try to delete but cancel
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Products should still be visible
      expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()

      mockConfirm.mockRestore()
    })

    it('should clear selection after bulk delete', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode and select products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      // Delete selected products
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Should clear selection and exit bulk edit mode
      expect(screen.queryByText(/products selected/)).toBeNull()
      expect(screen.queryByRole('checkbox')).toBeNull()

      mockConfirm.mockRestore()
    })
  })

  describe('Bulk Delete Persistence', () => {
    it('should persist bulk delete operations to localStorage', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode and select products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
      fireEvent.click(checkboxes[1])

      // Delete selected products
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Should update localStorage with remaining products
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'products',
        expect.stringContaining('Tang Orange 25g')
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'products',
        expect.not.stringContaining('Coke Mismo 100ML')
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'products',
        expect.not.stringContaining('Piattos Cheese 40g')
      )

      mockConfirm.mockRestore()
    })

    it('should remove deleted products from cart', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      // Setup cart with products to be deleted
      const cartWithProducts = [
        { id: 1, name: "Coke Mismo 100ML", price: 15.00, quantity: 2, unit: "piece", total: 30.00 },
        { id: 2, name: "Piattos Cheese 40g", price: 25.00, quantity: 1, unit: "piece", total: 25.00 }
      ]

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(mockProducts)
        if (key === 'cart') return JSON.stringify(cartWithProducts)
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode and select products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0]) // Select Coke
      fireEvent.click(checkboxes[1]) // Select Piattos

      // Delete selected products
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Should remove deleted products from cart
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cart',
        '[]'
      )

      mockConfirm.mockRestore()
    })
  })

  describe('Bulk Operations Edge Cases', () => {
    it('should handle bulk delete with no products selected', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode but don't select any products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Should not show delete selected button
      expect(screen.queryByText('Delete Selected')).toBeNull()
    })

    it('should handle bulk delete of all products', async () => {
      const mockConfirm = jest.spyOn(window, 'confirm')
      mockConfirm.mockReturnValue(true)

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode and select all products
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      const checkboxes = screen.getAllByRole('checkbox')
      checkboxes.forEach(checkbox => fireEvent.click(checkbox))

      // Delete all selected products
      const deleteSelectedButton = screen.getByText('Delete Selected')
      fireEvent.click(deleteSelectedButton)

      // Should save empty products array
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'products',
        '[]'
      )

      mockConfirm.mockRestore()
    })

    it('should handle bulk operations with empty product list', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify([])
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      // Should not show bulk edit button or products
      expect(screen.queryByText('BULK EDIT')).toBeNull()
      expect(screen.queryByText('Coke Mismo 100ML')).toBeNull()
    })
  })

  describe('Bulk Operations UI States', () => {
    it('should show appropriate UI feedback during bulk operations', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Should hide individual edit/delete buttons
      expect(screen.queryByRole('button', { name: /edit/i })).toBeNull()

      // Select products
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      // Should show selection count
      expect(screen.getByText('1 products selected')).toBeTruthy()
    })

    it('should maintain proper button states during bulk operations', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter bulk edit mode
      const bulkEditButton = screen.getByText((content, element) => {
        return content.includes('BULK EDIT')
      })
      fireEvent.click(bulkEditButton)

      // Should show cancel button instead of bulk edit
      expect(screen.getByText('CANCEL')).toBeTruthy()
      expect(screen.queryByText('BULK EDIT')).toBeNull()
    })
  })
})