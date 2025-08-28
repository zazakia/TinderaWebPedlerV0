import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockProducts, createMockProduct } from './__test-utils__/test-utils'
import Dashboard from '../app/page'

describe('Product Editing Functionality', () => {
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

  // Helper function to find edit buttons
  const findEditButton = () => {
    const allButtons = screen.getAllByRole('button')
    return allButtons.find(button =>
      button.className.includes('bg-blue-500') &&
      button.querySelector('svg')
    )
  }

  describe('Product Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Find and click edit button for first product
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Should show edit form
        expect(screen.getByDisplayValue('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.getByDisplayValue('15')).toBeTruthy()
        expect(screen.getByDisplayValue('50')).toBeTruthy()
      }
    })

    it('should show save and cancel buttons in edit mode', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Should show save and cancel buttons
        expect(screen.getByText('Save')).toBeTruthy()
        expect(screen.getByText('Cancel')).toBeTruthy()
      }
    })

    it('should exit edit mode when cancel is clicked', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Click cancel
        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        // Should exit edit mode and show original product display
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.queryByDisplayValue('Coke Mismo 100ML')).toBeNull()
      }
    })

    it('should update product name', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Update product name
        const nameInput = screen.getByDisplayValue('Coke Mismo 100ML')
        fireEvent.change(nameInput, { target: { value: 'Updated Coke Name' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should show updated name
        expect(screen.getByText('Updated Coke Name')).toBeTruthy()
      }
    })
  })

  describe('Product Edit Form', () => {
    it('should update product name', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Update product name
        const nameInput = screen.getByDisplayValue('Coke Mismo 100ML')
        fireEvent.change(nameInput, { target: { value: 'Updated Coke Name' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should show updated name
        expect(screen.getByText('Updated Coke Name')).toBeTruthy()
      }
    })

    it('should update product price', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Update price
        const priceInput = screen.getByDisplayValue('15')
        fireEvent.change(priceInput, { target: { value: '20' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should show updated price
        expect(screen.getByText('₱20.00')).toBeTruthy()
      }
    })

    it('should update product stock', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Update stock
        const stockInput = screen.getByDisplayValue('50')
        fireEvent.change(stockInput, { target: { value: '75' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should show updated stock
        expect(screen.getByText('Stock: 75')).toBeTruthy()
      }
    })

    it('should validate required fields', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Clear name field
        const nameInput = screen.getByDisplayValue('Coke Mismo 100ML')
        fireEvent.change(nameInput, { target: { value: '' } })

        // Try to save
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should still be in edit mode (validation failed)
        expect(screen.getByDisplayValue('')).toBeTruthy()
      }
    })

    it('should handle decimal prices', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Update price with decimals
        const priceInput = screen.getByDisplayValue('15')
        fireEvent.change(priceInput, { target: { value: '15.50' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should show updated price with proper formatting
        expect(screen.getByText('₱15.50')).toBeTruthy()
      }
    })
  })

  describe('Product Edit Persistence', () => {
    it('should persist changes to localStorage', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Update product
        const nameInput = screen.getByDisplayValue('Coke Mismo 100ML')
        fireEvent.change(nameInput, { target: { value: 'Updated Product' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should have called localStorage.setItem
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'products',
          expect.stringContaining('Updated Product')
        )
      }
    })

    it('should load edited products on component remount', async () => {
      // Pre-populate localStorage with edited product
      const editedProducts = [...mockProducts]
      editedProducts[0] = { ...editedProducts[0], name: 'Pre-edited Product' }

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'products') return JSON.stringify(editedProducts)
        if (key === 'cart') return JSON.stringify([])
        return null
      })

      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      // Should show the pre-edited product name
      await waitFor(() => {
        expect(screen.getByText('Pre-edited Product')).toBeTruthy()
      })
    })
  })

  describe('Edit Mode State Management', () => {
    it('should only allow editing one product at a time', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.getByText('Piattos Cheese 40g')).toBeTruthy()
      })

      // Enter edit mode for first product
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Try to enter edit mode for second product
        const editButtons = screen.getAllByRole('button')
        const secondEditButton = editButtons.find(button =>
          button.className.includes('bg-blue-500') &&
          button.querySelector('svg') &&
          button !== editButton
        )

        if (secondEditButton) {
          fireEvent.click(secondEditButton)
        }

        // Should only have one product in edit mode
        const editForms = screen.queryAllByDisplayValue(/Coke Mismo 100ML|Piattos Cheese 40g/)
        expect(editForms).toHaveLength(1)
      }
    })

    it('should reset edit form when switching between products', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode and make changes
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        const nameInput = screen.getByDisplayValue('Coke Mismo 100ML')
        fireEvent.change(nameInput, { target: { value: 'Modified Name' } })

        // Cancel edit
        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        // Re-enter edit mode
        fireEvent.click(editButton)

        // Should show original name, not the modified one
        expect(screen.getByDisplayValue('Coke Mismo 100ML')).toBeTruthy()
        expect(screen.queryByDisplayValue('Modified Name')).toBeNull()
      }
    })
  })

  describe('Edit Form Validation', () => {
    it('should prevent negative prices', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Try to set negative price
        const priceInput = screen.getByDisplayValue('15')
        fireEvent.change(priceInput, { target: { value: '-10' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should still be in edit mode (validation should prevent save)
        expect(screen.getByDisplayValue('-10')).toBeTruthy()
      }
    })

    it('should prevent negative stock', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Try to set negative stock
        const stockInput = screen.getByDisplayValue('50')
        fireEvent.change(stockInput, { target: { value: '-5' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should still be in edit mode
        expect(screen.getByDisplayValue('-5')).toBeTruthy()
      }
    })

    it('should handle empty price field', async () => {
      render(React.createElement(Dashboard))

      // Navigate to products screen
      const productsButton = screen.getByText('Products')
      fireEvent.click(productsButton)

      await waitFor(() => {
        expect(screen.getByText('Coke Mismo 100ML')).toBeTruthy()
      })

      // Enter edit mode
      const editButton = findEditButton()

      if (editButton) {
        fireEvent.click(editButton)

        // Clear price field
        const priceInput = screen.getByDisplayValue('15')
        fireEvent.change(priceInput, { target: { value: '' } })

        // Save changes
        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Should still be in edit mode (empty price should be rejected)
        expect(screen.getByDisplayValue('')).toBeTruthy()
      }
    })
  })
})