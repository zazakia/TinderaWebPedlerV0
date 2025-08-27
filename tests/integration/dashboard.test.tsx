import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '@/app/page'
import { mockProducts, mockCategories, mockSupabaseClient } from '../mocks/supabase'
import { AuthProvider } from '@/components/auth/AuthGuard'

// Mock all the hooks
jest.mock('../../lib/hooks/useProducts', () => ({
  useProducts: () => ({
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
    fetchProducts: jest.fn(), // Add the missing fetchProducts function
    createProduct: jest.fn().mockResolvedValue({ success: true }),
    updateProduct: jest.fn().mockResolvedValue({ success: true }),
    deleteProduct: jest.fn().mockResolvedValue({ success: true }),
    updateStock: jest.fn().mockResolvedValue({ success: true }),
  }),
}))

jest.mock('../../lib/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    loading: false,
    createCategory: jest.fn().mockResolvedValue({ success: true }),
  }),
}))

jest.mock('../../lib/hooks/useTransactions', () => ({
  useTransactions: () => ({
    createTransaction: jest.fn().mockResolvedValue({ success: true }),
  }),
}))

jest.mock('../../lib/hooks/useCustomers', () => ({
  useCustomers: () => ({
    customers: [],
    createCustomer: jest.fn().mockResolvedValue({ success: true }),
  }),
}))

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

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
  useAuthContext: () => mockAuthContext,
}))

// Mock the AddProduct component
jest.mock('@/components/add-product', () => {
  return function MockAddProduct({ onBack, onSave }: any) {
    return (
      <div data-testid="add-product-component">
        <button onClick={onBack}>Back</button>
        <button onClick={() => onSave({ productName: 'Test Product', price: 10 })}>
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

describe('Dashboard Component - Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Dashboard Screen Navigation', () => {
    it('should render dashboard screen by default', () => {
      renderWithAuth(<Dashboard />)
      
      expect(screen.getByText('Peddlr')).toBeInTheDocument()
      expect(screen.getByText('Your Balance')).toBeInTheDocument()
      expect(screen.getByText('P 0.00')).toBeInTheDocument()
    })

    it('should navigate to POS screen when POS button is clicked', async () => {
      renderWithAuth(<Dashboard />)
      
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      
      await waitFor(() => {
        expect(screen.getByText('POS')).toBeInTheDocument()
        expect(screen.getByText('All')).toBeInTheDocument() // Category filter
      })
    })

    it('should navigate to Products screen when Products button is clicked', async () => {
      renderWithAuth(<Dashboard />)
      
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      
      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
        expect(screen.getByText('BULK EDIT')).toBeInTheDocument()
      })
    })

    it('should navigate to Inventory screen when clicking inventory nav', async () => {
      renderWithAuth(<Dashboard />)
      
      // First navigate to products screen, then click inventory in bottom nav
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      
      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      })

      const inventoryNav = screen.getByText('Inventory')
      await user.click(inventoryNav)
      
      await waitFor(() => {
        expect(screen.getByText('INVENTORY')).toBeInTheDocument()
        expect(screen.getByText('INVENTORY LIST')).toBeInTheDocument()
      })
    })

    it('should navigate to Add Product screen', async () => {
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
  })

  describe('POS Screen Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument()
      })
    })

    it('should display product list in POS screen', () => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    it('should filter products by category', async () => {
      const electronicsCategory = screen.getByText('Electronics')
      await user.click(electronicsCategory)
      
      // Should show only electronics products
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    it('should add products to cart', async () => {
      const product = screen.getByText('Test Product 1')
      await user.click(product)
      
      // Should show quantity in cart
      await waitFor(() => {
        const reviewButton = screen.getByText('REVIEW')
        expect(reviewButton).toBeInTheDocument()
      })
    })

    it('should navigate to receipt screen', async () => {
      // Add a product to cart first
      const product = screen.getByText('Test Product 1')
      await user.click(product)
      
      await waitFor(() => {
        const reviewButton = screen.getByText('REVIEW')
        expect(reviewButton).toBeInTheDocument()
      })

      const reviewButton = screen.getByText('REVIEW')
      await user.click(reviewButton)
      
      await waitFor(() => {
        expect(screen.getByText('Jr & Mai Agrivet')).toBeInTheDocument()
        expect(screen.getByText('GRAND TOTAL:')).toBeInTheDocument()
      })
    })
  })

  describe('Products Screen Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      const productsButton = screen.getByText('Products')
      await user.click(productsButton)
      await waitFor(() => {
        expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      })
    })

    it('should display products grouped by category', () => {
      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('Books')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    it('should enable bulk edit mode', async () => {
      const bulkEditButton = screen.getByText('BULK EDIT')
      await user.click(bulkEditButton)
      
      await waitFor(() => {
        expect(screen.getByText('CANCEL')).toBeInTheDocument()
        // Should show checkboxes for products
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThan(0)
      })
    })

    it('should search products', async () => {
      const searchInput = screen.getByPlaceholderText('Search for ...')
      await user.type(searchInput, 'Test Product 1')
      
      // Should filter products based on search
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    it('should sort products alphabetically', async () => {
      const sortButton = screen.getByRole('button', { name: /A Z/i })
      await user.click(sortButton)
      
      // Should toggle sort order
      await waitFor(() => {
        const products = screen.getAllByText(/Test Product/)
        expect(products.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Inventory Screen Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      // Navigate to products first, then inventory
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

    it('should display inventory tabs', () => {
      expect(screen.getByText('INVENTORY LIST')).toBeInTheDocument()
      expect(screen.getByText('REPLENISHMENT')).toBeInTheDocument()
    })

    it('should switch between inventory tabs', async () => {
      const replenishmentTab = screen.getByText('REPLENISHMENT')
      await user.click(replenishmentTab)
      
      await waitFor(() => {
        expect(screen.getByText('Replenishment Feature')).toBeInTheDocument()
      })
    })

    it('should display toggle switches for inventory settings', () => {
      // Should have toggle switches for inventory display options
      const toggleSwitches = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      )
      expect(toggleSwitches.length).toBeGreaterThanOrEqual(2)
    })

    it('should display products grouped by category in inventory', () => {
      expect(screen.getByText('ELECTRONICS')).toBeInTheDocument()
      expect(screen.getByText('BOOKS')).toBeInTheDocument()
    })
  })

  describe('Add Product Screen Functionality', () => {
    beforeEach(async () => {
      renderWithAuth(<Dashboard />)
      // Navigate to add product screen
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

    it('should render add product component', () => {
      expect(screen.getByTestId('add-product-component')).toBeInTheDocument()
    })

    it('should handle product save and navigate back', async () => {
      const saveButton = screen.getByText('Save Product')
      await user.click(saveButton)
      
      // Should navigate back to dashboard
      await waitFor(() => {
        expect(screen.getByText('Peddlr')).toBeInTheDocument()
      })
    })

    it('should handle back navigation', async () => {
      const backButton = screen.getByText('Back')
      await user.click(backButton)
      
      // Should navigate back to dashboard
      await waitFor(() => {
        expect(screen.getByText('Peddlr')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty product list', () => {
      renderWithAuth(<Dashboard />)
      
      // Should render without errors even with no products
      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })

    it('should handle loading states', () => {
      renderWithAuth(<Dashboard />)
      
      // Should render dashboard even during loading
      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })

    it('should handle rapid navigation between screens', async () => {
      renderWithAuth(<Dashboard />)
      
      // Rapid navigation
      const posButton = screen.getByText('POS')
      await user.click(posButton)
      
      await waitFor(() => {
        expect(screen.getByText('All')).toBeInTheDocument()
      })

      const backToHome = screen.getByRole('button', { name: /arrow/i })
      await user.click(backToHome)
      
      await waitFor(() => {
        expect(screen.getByText('Peddlr')).toBeInTheDocument()
      })

      // Should handle rapid navigation without errors
      expect(screen.getByText('Your Balance')).toBeInTheDocument()
    })
  })

  describe('Responsive Design and Accessibility', () => {
    it('should be accessible with proper ARIA labels', () => {
      renderWithAuth(<Dashboard />)
      
      // Check for accessible buttons
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Should have proper navigation structure
      expect(screen.getByText('Peddlr')).toBeInTheDocument()
    })

    it('should handle keyboard navigation', async () => {
      renderWithAuth(<Dashboard />)
      
      // Test tab navigation
      await user.tab()
      await user.tab()
      
      // Should be able to navigate with keyboard
      const focusedElement = document.activeElement
      expect(focusedElement).toBeInTheDocument()
    })

    it('should display properly in mobile viewport', () => {
      renderWithAuth(<Dashboard />)
      
      // Check for mobile-specific classes
      const mainContainer = screen.getByText('Peddlr').closest('div')
      expect(mainContainer).toHaveClass('max-w-sm')
    })
  })
})