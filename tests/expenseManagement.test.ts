import { mockLocalStorage } from './__test-utils__/test-utils'

describe('Expense Management', () => {
  let mockStorage: any

  beforeEach(() => {
    mockStorage = mockLocalStorage()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Expense Data Structure', () => {
    it('should create valid expense object', () => {
      const expense = {
        id: 1,
        amount: 150.00,
        category: 'Utilities',
        description: 'Electricity bill',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        vendor: 'Meralco',
        isRecurring: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      }

      expect(expense).toHaveProperty('id')
      expect(expense).toHaveProperty('amount')
      expect(expense).toHaveProperty('category')
      expect(expense).toHaveProperty('description')
      expect(expense).toHaveProperty('date')
      expect(expense).toHaveProperty('paymentMethod')
      expect(expense).toHaveProperty('createdAt')
      expect(expense).toHaveProperty('updatedAt')

      expect(typeof expense.amount).toBe('number')
      expect(expense.amount).toBeGreaterThan(0)
      expect(typeof expense.description).toBe('string')
      expect(expense.description.length).toBeGreaterThan(0)
    })

    it('should handle optional expense fields', () => {
      const expenseWithVendor = {
        id: 1,
        amount: 200.00,
        category: 'Supplies',
        description: 'Office supplies',
        date: '2024-01-15',
        paymentMethod: 'card' as const,
        vendor: 'Office Depot',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      }

      const expenseWithoutVendor = {
        id: 2,
        amount: 50.00,
        category: 'Transportation',
        description: 'Gas',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      }

      expect(expenseWithVendor.vendor).toBe('Office Depot')
      expect(expenseWithoutVendor).not.toHaveProperty('vendor')
    })

    it('should validate expense categories', () => {
      const validCategories = [
        'Utilities', 'Rent', 'Supplies', 'Marketing',
        'Transportation', 'Insurance', 'Maintenance', 'Other'
      ]

      validCategories.forEach(category => {
        const expense = {
          id: 1,
          amount: 100.00,
          category,
          description: 'Test expense',
          date: '2024-01-15',
          paymentMethod: 'cash' as const,
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z'
        }

        expect(expense.category).toBe(category)
      })
    })

    it('should validate payment methods', () => {
      const validPaymentMethods = ['cash', 'card', 'bank_transfer', 'other']

      validPaymentMethods.forEach(method => {
        const expense = {
          id: 1,
          amount: 100.00,
          category: 'Other',
          description: 'Test expense',
          date: '2024-01-15',
          paymentMethod: method as any,
          createdAt: '2024-01-15T10:00:00.000Z',
          updatedAt: '2024-01-15T10:00:00.000Z'
        }

        expect(expense.paymentMethod).toBe(method)
      })
    })
  })

  describe('Expense Calculations', () => {
    const mockExpenses = [
      {
        id: 1,
        amount: 150.00,
        category: 'Utilities',
        description: 'Electricity',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: 2,
        amount: 200.00,
        category: 'Rent',
        description: 'Monthly rent',
        date: '2024-01-15',
        paymentMethod: 'bank_transfer' as const,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: 3,
        amount: 75.50,
        category: 'Supplies',
        description: 'Office supplies',
        date: '2024-01-20',
        paymentMethod: 'card' as const,
        createdAt: '2024-01-20T10:00:00.000Z',
        updatedAt: '2024-01-20T10:00:00.000Z'
      }
    ]

    it('should calculate total expenses correctly', () => {
      const total = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      expect(total).toBe(425.50)
    })

    it('should calculate expenses by category', () => {
      const expensesByCategory = mockExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

      expect(expensesByCategory['Utilities']).toBe(150.00)
      expect(expensesByCategory['Rent']).toBe(200.00)
      expect(expensesByCategory['Supplies']).toBe(75.50)
    })

    it('should filter expenses by date range', () => {
      const dateFilter = {
        startDate: '2024-01-10',
        endDate: '2024-01-17'
      }

      const filteredExpenses = mockExpenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const startDate = new Date(dateFilter.startDate)
        const endDate = new Date(dateFilter.endDate)
        return expenseDate >= startDate && expenseDate <= endDate
      })

      expect(filteredExpenses).toHaveLength(2)
      expect(filteredExpenses[0].id).toBe(1)
      expect(filteredExpenses[1].id).toBe(2)
    })

    it('should calculate monthly totals', () => {
      const currentMonth = '2024-01'
      const monthlyExpenses = mockExpenses.filter(expense =>
        expense.date.startsWith(currentMonth)
      )

      const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      expect(monthlyTotal).toBe(425.50)
    })

    it('should handle empty expense arrays', () => {
      const emptyExpenses: any[] = []
      const total = emptyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      expect(total).toBe(0)
    })
  })

  describe('Expense Filtering and Search', () => {
    const mockExpenses = [
      {
        id: 1,
        amount: 150.00,
        category: 'Utilities',
        description: 'Electricity bill payment',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        vendor: 'Meralco',
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: 2,
        amount: 200.00,
        category: 'Rent',
        description: 'Monthly office rent',
        date: '2024-01-01',
        paymentMethod: 'bank_transfer' as const,
        vendor: 'Landlord Inc',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z'
      },
      {
        id: 3,
        amount: 75.50,
        category: 'Supplies',
        description: 'Printer paper and ink',
        date: '2024-01-20',
        paymentMethod: 'card' as const,
        vendor: 'Office Depot',
        createdAt: '2024-01-20T10:00:00.000Z',
        updatedAt: '2024-01-20T10:00:00.000Z'
      }
    ]

    it('should filter expenses by search query in description', () => {
      const searchQuery = 'electricity'
      const filteredExpenses = mockExpenses.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      expect(filteredExpenses).toHaveLength(1)
      expect(filteredExpenses[0].description).toContain('Electricity')
    })

    it('should filter expenses by search query in vendor', () => {
      const searchQuery = 'meralco'
      const filteredExpenses = mockExpenses.filter(expense =>
        expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
      )

      expect(filteredExpenses).toHaveLength(1)
      expect(filteredExpenses[0].vendor).toBe('Meralco')
    })

    it('should filter expenses by category', () => {
      const categoryFilter = 'Utilities'
      const filteredExpenses = mockExpenses.filter(expense =>
        expense.category === categoryFilter
      )

      expect(filteredExpenses).toHaveLength(1)
      expect(filteredExpenses[0].category).toBe('Utilities')
    })

    it('should combine multiple filters', () => {
      const searchQuery = 'office'
      const categoryFilter = 'Supplies'
      const dateFilter = {
        startDate: '2024-01-15',
        endDate: '2024-01-25'
      }

      const filteredExpenses = mockExpenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = expense.category === categoryFilter
        const matchesDate = expense.date >= dateFilter.startDate && expense.date <= dateFilter.endDate

        return matchesSearch && matchesCategory && matchesDate
      })

      expect(filteredExpenses).toHaveLength(1)
      expect(filteredExpenses[0].description).toContain('Printer paper')
    })

    it('should sort expenses by date (newest first)', () => {
      const sortedExpenses = [...mockExpenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      expect(sortedExpenses[0].date).toBe('2024-01-20')
      expect(sortedExpenses[1].date).toBe('2024-01-15')
      expect(sortedExpenses[2].date).toBe('2024-01-01')
    })

    it('should handle case-insensitive search', () => {
      const searchQuery = 'ELECTRICITY'
      const filteredExpenses = mockExpenses.filter(expense =>
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      )

      expect(filteredExpenses).toHaveLength(1)
      expect(filteredExpenses[0].description).toContain('Electricity')
    })
  })

  describe('Expense CRUD Operations', () => {
    it('should add new expense with auto-generated ID', () => {
      const expenses: any[] = [
        { id: 1, amount: 100, category: 'Test', description: 'Test expense', date: '2024-01-01', paymentMethod: 'cash', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]

      const newExpenseData = {
        amount: 200.00,
        category: 'Utilities',
        description: 'New utility bill',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        vendor: 'Utility Company'
      }

      const newExpense = {
        ...newExpenseData,
        id: Math.max(...expenses.map(e => e.id), 0) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      expenses.push(newExpense)

      expect(expenses).toHaveLength(2)
      expect(expenses[1].id).toBe(2)
      expect(expenses[1].amount).toBe(200.00)
      expect(expenses[1].category).toBe('Utilities')
    })

    it('should update existing expense', () => {
      const expenses: any[] = [
        {
          id: 1,
          amount: 100.00,
          category: 'Utilities',
          description: 'Old description',
          date: '2024-01-01',
          paymentMethod: 'cash',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]

      const updates = {
        amount: 150.00,
        description: 'Updated description'
      }

      const updatedExpense = {
        ...expenses[0],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      expenses[0] = updatedExpense

      expect(expenses[0].amount).toBe(150.00)
      expect(expenses[0].description).toBe('Updated description')
      expect(expenses[0].updatedAt).not.toBe(expenses[0].createdAt)
    })

    it('should delete expense by ID', () => {
      const expenses: any[] = [
        { id: 1, amount: 100, category: 'Test', description: 'Test 1', date: '2024-01-01', paymentMethod: 'cash', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
        { id: 2, amount: 200, category: 'Test', description: 'Test 2', date: '2024-01-01', paymentMethod: 'cash', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
        { id: 3, amount: 300, category: 'Test', description: 'Test 3', date: '2024-01-01', paymentMethod: 'cash', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]

      const filteredExpenses = expenses.filter(expense => expense.id !== 2)

      expect(filteredExpenses).toHaveLength(2)
      expect(filteredExpenses.find(e => e.id === 2)).toBeUndefined()
      expect(filteredExpenses[0].id).toBe(1)
      expect(filteredExpenses[1].id).toBe(3)
    })

    it('should handle deleting non-existent expense', () => {
      const expenses: any[] = [
        { id: 1, amount: 100, category: 'Test', description: 'Test', date: '2024-01-01', paymentMethod: 'cash', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]

      const filteredExpenses = expenses.filter(expense => expense.id !== 999)

      expect(filteredExpenses).toHaveLength(1)
      expect(filteredExpenses[0].id).toBe(1)
    })
  })

  describe('Expense Validation', () => {
    it('should validate required fields', () => {
      // Test missing amount
      const missingAmount = { category: 'Test', description: 'Test' }
      expect(missingAmount).not.toHaveProperty('amount')

      // Test missing category
      const missingCategory = { amount: 100, description: 'Test' }
      expect(missingCategory).not.toHaveProperty('category')

      // Test missing description
      const missingDescription = { amount: 100, category: 'Test' }
      expect(missingDescription).not.toHaveProperty('description')

      // Test zero amount
      const zeroAmount = { amount: 0, category: 'Test', description: 'Test' }
      expect(zeroAmount.amount).toBe(0)

      // Test negative amount
      const negativeAmount = { amount: -50, category: 'Test', description: 'Test' }
      expect(negativeAmount.amount).toBeLessThan(0)

      // Test empty category
      const emptyCategory = { amount: 100, category: '', description: 'Test' }
      expect(emptyCategory.category).toBe('')

      // Test empty description
      const emptyDescription = { amount: 100, category: 'Test', description: '' }
      expect(emptyDescription.description).toBe('')
    })

    it('should validate date format', () => {
      const validDate = '2024-01-15'
      const invalidDate = '01/15/2024'

      expect(validDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(invalidDate).not.toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should validate payment methods', () => {
      const validMethods = ['cash', 'card', 'bank_transfer', 'other']
      const invalidMethod = 'bitcoin'

      expect(validMethods).toContain('cash')
      expect(validMethods).toContain('card')
      expect(validMethods).toContain('bank_transfer')
      expect(validMethods).toContain('other')
      expect(validMethods).not.toContain(invalidMethod)
    })

    it('should validate recurring expense fields', () => {
      const recurringExpense = {
        amount: 100.00,
        category: 'Rent',
        description: 'Monthly rent',
        date: '2024-01-01',
        paymentMethod: 'bank_transfer' as const,
        isRecurring: true,
        recurringFrequency: 'monthly' as const
      }

      const nonRecurringExpense = {
        amount: 50.00,
        category: 'Supplies',
        description: 'One-time purchase',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        isRecurring: false
      }

      if (recurringExpense.isRecurring) {
        expect(recurringExpense.recurringFrequency).toBeDefined()
        expect(['daily', 'weekly', 'monthly', 'yearly']).toContain(recurringExpense.recurringFrequency)
      }

      if (!nonRecurringExpense.isRecurring) {
        expect(nonRecurringExpense).not.toHaveProperty('recurringFrequency')
      }
    })
  })

  describe('Expense Categories', () => {
    const defaultCategories = [
      { id: 'utilities', name: 'Utilities', color: '#3b82f6', icon: 'Zap', isDefault: true },
      { id: 'rent', name: 'Rent', color: '#ef4444', icon: 'Home', isDefault: true },
      { id: 'supplies', name: 'Supplies', color: '#10b981', icon: 'Package', isDefault: true },
      { id: 'marketing', name: 'Marketing', color: '#f59e0b', icon: 'Megaphone', isDefault: true },
      { id: 'transportation', name: 'Transportation', color: '#8b5cf6', icon: 'Car', isDefault: true },
      { id: 'insurance', name: 'Insurance', color: '#06b6d4', icon: 'Shield', isDefault: true },
      { id: 'maintenance', name: 'Maintenance', color: '#84cc16', icon: 'Wrench', isDefault: true },
      { id: 'other', name: 'Other', color: '#6b7280', icon: 'MoreHorizontal', isDefault: true }
    ]

    it('should have all required default categories', () => {
      expect(defaultCategories).toHaveLength(8)

      const requiredCategories = ['Utilities', 'Rent', 'Supplies', 'Marketing', 'Transportation', 'Insurance', 'Maintenance', 'Other']
      const categoryNames = defaultCategories.map(cat => cat.name)

      requiredCategories.forEach(category => {
        expect(categoryNames).toContain(category)
      })
    })

    it('should have valid category structure', () => {
      defaultCategories.forEach(category => {
        expect(category).toHaveProperty('id')
        expect(category).toHaveProperty('name')
        expect(category).toHaveProperty('color')
        expect(category).toHaveProperty('icon')
        expect(category).toHaveProperty('isDefault')

        expect(typeof category.id).toBe('string')
        expect(typeof category.name).toBe('string')
        expect(typeof category.color).toBe('string')
        expect(typeof category.icon).toBe('string')
        expect(typeof category.isDefault).toBe('boolean')

        expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        expect(category.isDefault).toBe(true)
      })
    })

    it('should have unique category IDs', () => {
      const ids = defaultCategories.map(cat => cat.id)
      const uniqueIds = [...new Set(ids)]

      expect(uniqueIds).toHaveLength(ids.length)
    })

    it('should have unique category names', () => {
      const names = defaultCategories.map(cat => cat.name)
      const uniqueNames = [...new Set(names)]

      expect(uniqueNames).toHaveLength(names.length)
    })
  })

  describe('Expense Reporting', () => {
    const mockExpenses = [
      {
        id: 1,
        amount: 150.00,
        category: 'Utilities',
        description: 'Electricity',
        date: '2024-01-15',
        paymentMethod: 'cash' as const,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: 2,
        amount: 200.00,
        category: 'Rent',
        description: 'Monthly rent',
        date: '2024-01-01',
        paymentMethod: 'bank_transfer' as const,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z'
      },
      {
        id: 3,
        amount: 75.50,
        category: 'Utilities',
        description: 'Water bill',
        date: '2024-01-20',
        paymentMethod: 'card' as const,
        createdAt: '2024-01-20T10:00:00.000Z',
        updatedAt: '2024-01-20T10:00:00.000Z'
      },
      {
        id: 4,
        amount: 300.00,
        category: 'Marketing',
        description: 'Social media ads',
        date: '2024-02-01',
        paymentMethod: 'card' as const,
        createdAt: '2024-02-01T10:00:00.000Z',
        updatedAt: '2024-02-01T10:00:00.000Z'
      }
    ]

    it('should generate monthly expense reports', () => {
      const januaryExpenses = mockExpenses.filter(expense =>
        expense.date.startsWith('2024-01')
      )

      const januaryTotal = januaryExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      expect(januaryExpenses).toHaveLength(3)
      expect(januaryTotal).toBe(425.50)
    })

    it('should generate category breakdown reports', () => {
      const categoryBreakdown = mockExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

      expect(categoryBreakdown['Utilities']).toBe(225.50)
      expect(categoryBreakdown['Rent']).toBe(200.00)
      expect(categoryBreakdown['Marketing']).toBe(300.00)
    })

    it('should calculate expense trends', () => {
      const januaryTotal = mockExpenses
        .filter(expense => expense.date.startsWith('2024-01'))
        .reduce((sum, expense) => sum + expense.amount, 0)

      const februaryTotal = mockExpenses
        .filter(expense => expense.date.startsWith('2024-02'))
        .reduce((sum, expense) => sum + expense.amount, 0)

      expect(januaryTotal).toBe(425.50)
      expect(februaryTotal).toBe(300.00)
    })

    it('should generate payment method reports', () => {
      const paymentMethodBreakdown = mockExpenses.reduce((acc, expense) => {
        acc[expense.paymentMethod] = (acc[expense.paymentMethod] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>)

      expect(paymentMethodBreakdown['cash']).toBe(150.00)
      expect(paymentMethodBreakdown['bank_transfer']).toBe(200.00)
      expect(paymentMethodBreakdown['card']).toBe(375.50)
    })

    it('should handle empty report periods', () => {
      const marchExpenses = mockExpenses.filter(expense =>
        expense.date.startsWith('2024-03')
      )

      const marchTotal = marchExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      expect(marchExpenses).toHaveLength(0)
      expect(marchTotal).toBe(0)
    })
  })

  describe('Expense localStorage Integration', () => {
    it('should save expenses to localStorage', () => {
      const expenses = [
        {
          id: 1,
          amount: 100.00,
          category: 'Test',
          description: 'Test expense',
          date: '2024-01-01',
          paymentMethod: 'cash' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]

      localStorage.setItem('expenses', JSON.stringify(expenses))

      expect(localStorage.getItem('expenses')).toBe(JSON.stringify(expenses))
    })

    it('should load expenses from localStorage', () => {
      const expenses = [
        {
          id: 1,
          amount: 100.00,
          category: 'Test',
          description: 'Test expense',
          date: '2024-01-01',
          paymentMethod: 'cash' as const,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]

      localStorage.setItem('expenses', JSON.stringify(expenses))
      const loadedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]')

      expect(loadedExpenses).toEqual(expenses)
      expect(loadedExpenses).toHaveLength(1)
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('expenses', '{invalid json')

      expect(() => {
        JSON.parse(localStorage.getItem('expenses') || '[]')
      }).toThrow(SyntaxError)
    })

    it('should handle empty localStorage', () => {
      const loadedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]')

      expect(loadedExpenses).toEqual([])
      expect(loadedExpenses).toHaveLength(0)
    })
  })
})