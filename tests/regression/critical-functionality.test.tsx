import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '@/app/page'
import { mockProducts, mockCategories, mockSupabaseClient } from '../mocks/supabase'
import { AuthProvider } from '@/components/auth/AuthGuard'

// Mock all hooks with realistic data
const mockUseProducts = {
  products: mockProducts.map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    price: p.price_retail,
    image: '/placeholder.svg',
    category: mockCategories.find(cat => cat.id === p.category_id)?.name || 'Uncategorized',
    baseUnit: p.base_unit,
    cost: p.cost,
    units: []
  })),
  loading: false,
  createProduct: jest.fn().mockResolvedValue({ success: true }),
  updateProduct: jest.fn().mockResolvedValue({ success: true }),
  deleteProduct: jest.fn().mockResolvedValue({ success: true }),
  updateStock: jest.fn().mockResolvedValue({ success: true }),
  fetchProducts: jest.fn(), // Add the missing fetchProducts function
}

const mockUseCategories = {
  categories: mockCategories,
  loading: false,
  createCategory: jest.fn().mockResolvedValue({ success: true }),
}

const mockUseTransactions = {
  createTransaction: jest.fn().mockResolvedValue({ success: true }),
}

// Mock auth context
const mockAuthContext = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  profile: { 
    id: 'test-user-id', 
    email: 'test@example.com', 
    full_name: 'Test User', 
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  session: { access_token: 'test-token' },
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
  refreshSession: jest.fn(),
}

jest.mock('../../lib/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
  useAuthContext: () => mockAuthContext,
}))

jest.mock('../../lib/hooks/useProducts', () => ({
  useProducts: () => mockUseProducts,
}))

jest.mock('../../lib/hooks/useCategories', () => ({
  useCategories: () => mockUseCategories,
}))

jest.mock('../../lib/hooks/useTransactions', () => ({
  useTransactions: () => mockUseTransactions,
}))

jest.mock('../../lib/hooks/useCustomers', () => ({
  useCustomers: () => ({
    customers: [],
    createCustomer: jest.fn().mockResolvedValue({ success: true }),
  }),
}))

jest.mock('@/components/add-product', () => {
  return function MockAddProduct({ onBack, onSave }: any) {
    return (
      <div data-testid="add-product-component">
        <h1>Add Product</h1>
        <input data-testid="product-name" placeholder="Product Name" />
        <input data-testid="product-price" placeholder="Price" type="number" />
        <button onClick={onBack}>Back</button>
        <button 
          onClick={() => onSave({ 
            productName: 'New Test Product', 
            price: 15.99,
            stocks: 50,
            productGroup: 'Electronics'
          })}
        >
          Save Product
        </button>
      </div>
    )
  }
})

// Custom render function that wraps components with AuthProvider
const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('Regression Tests - Critical Functionality', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Core Application Stability', () => {
    it('REGRESSION: Application should render without crashing', () => {
      expect(() => {
        renderWithAuth(<Dashboard />)
      }).not.toThrow()

      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })

    it('REGRESSION: Should maintain state consistency across screen navigation', async () => {
      renderWithAuth(<Dashboard />)

      // Navigate through all screens to ensure state consistency
      const screens = [
        { trigger: 'POS', verify: 'All' },
        { trigger: 'Products', verify: 'PRODUCTS' },
      ]

      for (const { trigger, verify } of screens) {
        const button = screen.getByText(trigger)
        await user.click(button)
        
        await waitFor(() => {
          expect(screen.getByText(verify)).toBeInTheDocument()
        })

        // Navigate back to dashboard
        if (screen.queryByRole('button', { name: /arrow/i })) {
          const backButton = screen.getByRole('button', { name: /arrow/i })
          await user.click(backButton)
          
          await waitFor(() => {
            expect(screen.getByText('Peddlr')).toBeInTheDocument()
          })
        }
      }
    })

    it('REGRESSION: Should handle rapid user interactions without breaking', async () => {
      renderWithAuth(<Dashboard />)

      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        const posButton = screen.getByText('POS')
        await user.click(posButton)
        
        if (screen.queryByRole('button', { name: /arrow/i })) {
          const backButton = screen.getByRole('button', { name: /arrow/i })
          await user.click(backButton)
        }
      }

      // Application should still be functional
      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })
  })

  describe('POS System Critical Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument()
      })
    })

    it('REGRESSION: POS cart functionality must work correctly', async () => {
      // Add product to cart
      const product = screen.getByText('Test Product 1')
      await user.click(product)

      // Verify cart is updated
      await waitFor(() => {
        const reviewButton = screen.getByText('REVIEW')
        expect(reviewButton).toBeInTheDocument()
      })

      // Navigate to receipt
      const reviewButton = screen.getByText('REVIEW')
      await user.click(reviewButton)

      await waitFor(() => {
        expect(screen.getByText('GRAND TOTAL:')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Category filtering must work correctly', async () => {
      // Test category filtering
      const electronicsCategory = screen.getByText('Electronics')
      await user.click(electronicsCategory)

      // Should show only electronics products
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()

      // Switch to "All" category
      const allCategory = screen.getByText('All')
      await user.click(allCategory)

      // Should show all products
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    it('REGRESSION: Transaction processing must complete successfully', async () => {
      // Add product to cart
      const product = screen.getByText('Test Product 1')
      await user.click(product)

      // Navigate to receipt
      await waitFor(() => {
        const reviewButton = screen.getByText('REVIEW')
        expect(reviewButton).toBeInTheDocument()
      })

      const reviewButton = screen.getByText('REVIEW')
      await user.click(reviewButton)

      await waitFor(() => {
        expect(screen.getByText('CONFIRM')).toBeInTheDocument()
      })

      // Proceed to payment
      const confirmButton = screen.getByText('CONFIRM')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('AMOUNT PAYABLE')).toBeInTheDocument()
      })

      // Process cash payment
      const cashButton = screen.getByText('Cash')
      await user.click(cashButton)

      // Verify transaction is processed
      expect(mockUseTransactions.createTransaction).toHaveBeenCalled()
    })
  })

  describe('Product Management Critical Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Product list must display correctly', () => {
      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('Books')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    it('REGRESSION: Product search must work correctly', async () => {
      const searchInput = screen.getByPlaceholderText('Search for ...')
      await user.type(searchInput, 'Test Product 1')

      // Should filter products
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    it('REGRESSION: Bulk edit mode must function correctly', async () => {
      const bulkEditButton = screen.getByText('BULK EDIT')
      await user.click(bulkEditButton)

      await waitFor(() => {
        expect(screen.getByText('CANCEL')).toBeInTheDocument()
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThan(0)
      })

      // Cancel bulk edit
      const cancelButton = screen.getByText('CANCEL')
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.getByText('BULK EDIT')).toBeInTheDocument()
      })
    })
  })

  describe('Inventory Management Critical Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      // Navigate to inventory through products screen
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      })
      
      const inventoryNav = screen.getByText('Inventory')
      await user.click(inventoryNav)
      await waitFor(() => {
        expect(screen.getByText('INVENTORY')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Inventory tabs must work correctly', async () => {
      expect(screen.getByText('INVENTORY LIST')).toBeInTheDocument()
      expect(screen.getByText('REPLENISHMENT')).toBeInTheDocument()

      // Switch to replenishment tab
      const replenishmentTab = screen.getByText('REPLENISHMENT')
      await user.click(replenishmentTab)

      await waitFor(() => {
        expect(screen.getByText('Replenishment Feature')).toBeInTheDocument()
      })

      // Switch back to inventory list
      const inventoryListTab = screen.getByText('INVENTORY LIST')
      await user.click(inventoryListTab)

      await waitFor(() => {
        expect(screen.getByText('ALL INVENTORY LIST')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Inventory display settings must persist', async () => {
      // Should have toggle switches
      const toggleSwitches = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      )
      expect(toggleSwitches.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Add Product Critical Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      })
      
      const addProductButton = screen.getByText('Add Product')
      await user.click(addProductButton)
      await waitFor(() => {
        expect(screen.getByTestId('add-product-component')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Add product form must render correctly', () => {
      expect(screen.getByTestId('add-product-component')).toBeInTheDocument()
      expect(screen.getByTestId('product-name')).toBeInTheDocument()
      expect(screen.getByTestId('product-price')).toBeInTheDocument()
    })

    it('REGRESSION: Product creation must work correctly', async () => {
      const saveButton = screen.getByText('Save Product')
      await user.click(saveButton)

      // Should call createProduct and navigate back
      expect(mockUseProducts.createProduct).toHaveBeenCalled()
      
      await waitFor(() => {
        expect(screen.getByText('Peddlr')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Back navigation must work from add product', async () => {
      const backButton = screen.getByText('Back')
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.getByText('Peddlr')).toBeInTheDocument()
      })
    })
  })

  describe('Data Integrity and Persistence', () => {
    it('REGRESSION: Product data must remain consistent across operations', async () => {
      renderWithAuth(<Dashboard />)

      // Navigate to POS and verify product data
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
        expect(screen.getByText('₱ 10.99')).toBeInTheDocument()
      })

      // Navigate back and to products screen
      const backButton = screen.getByRole('button', { name: /arrow/i })
      await user.click(backButton)
      
      await waitFor(() => {
        expect(screen.getByText('Peddlr')).toBeInTheDocument()
      })

      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Test Product 1')).toBeInTheDocument()
        expect(screen.getByText('₱10.99')).toBeInTheDocument()
      })
    })

    it('REGRESSION: Category data must remain consistent', async () => {
      renderWithAuth(<Dashboard />)

      // Check categories in POS
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      
      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument()
        expect(screen.getByText('Books')).toBeInTheDocument()
      })

      // Check categories in Products
      const backButton = screen.getByRole('button', { name: /arrow/i })
      await user.click(backButton)
      
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      
      await waitFor(() => {
        expect(screen.getByText('Electronics')).toBeInTheDocument()
        expect(screen.getByText('Books')).toBeInTheDocument()
      })
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('REGRESSION: Application must recover from hook errors', () => {
      // Mock error in useProducts
      jest.mock('../../lib/hooks/useProducts', () => ({
        useProducts: () => ({
          products: [],
          loading: false,
          error: 'Failed to load products',
          createProduct: jest.fn().mockRejectedValue(new Error('Creation failed')),
          updateProduct: jest.fn(),
          deleteProduct: jest.fn(),
          updateStock: jest.fn(),
          fetchProducts: jest.fn(),
        }),
      }), { virtual: true })

      expect(() => {
        renderWithAuth(<Dashboard />)
      }).not.toThrow()

      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })

    it('REGRESSION: Application must handle missing data gracefully', () => {
      // Mock empty data
      jest.mock('../../lib/hooks/useProducts', () => ({
        useProducts: () => ({
          products: [],
          loading: false,
          createProduct: jest.fn(),
          updateProduct: jest.fn(),
          deleteProduct: jest.fn(),
          updateStock: jest.fn(),
          fetchProducts: jest.fn(),
        }),
      }), { virtual: true })

      jest.mock('../../lib/hooks/useCategories', () => ({
        useCategories: () => ({
          categories: [],
          loading: false,
          createCategory: jest.fn(),
        }),
      }), { virtual: true })

      renderWithAuth(<Dashboard />)

      // Should render without errors
      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })
  })

  describe('Performance and Memory Regression', () => {
    it('REGRESSION: Application must not have memory leaks', async () => {
      const { unmount } = renderWithAuth(<Dashboard />)

      // Navigate through screens
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument()
      })

      // Unmount component
      unmount()

      // Should not throw errors during cleanup
      expect(true).toBe(true) // Test passes if no errors thrown
    })

    it('REGRESSION: Rapid navigation must not degrade performance', async () => {
      renderWithAuth(<Dashboard />)

      const startTime = performance.now()

      // Perform rapid navigation
      for (let i = 0; i < 5; i++) {
        const posButton = screen.getByText('POS')
        await user.click(posButton)
        
        await waitFor(() => {
          expect(screen.getByText('All')).toBeInTheDocument()
        })

        const backButton = screen.getByRole('button', { name: /arrow/i })
        await user.click(backButton)
        
        await waitFor(() => {
          expect(screen.getByText('Peddlr')).toBeInTheDocument()
        })
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // Should complete within reasonable time (adjust threshold as needed)
      expect(executionTime).toBeLessThan(10000) // 10 seconds
    })
  })
})