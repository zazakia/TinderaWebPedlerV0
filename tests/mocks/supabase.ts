import { jest } from '@jest/globals'

// Mock data
export const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    price_retail: 10.99,
    price_wholesale: 8.99,
    stock: 100,
    category_id: '1',
    sku: 'TEST001',
    base_unit: 'piece',
    cost: 5.00,
    low_stock_level: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Product 2',
    price_retail: 25.50,
    price_wholesale: 20.00,
    stock: 50,
    category_id: '2',
    sku: 'TEST002',
    base_unit: 'box',
    cost: 12.00,
    low_stock_level: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

export const mockCategories = [
  {
    id: '1',
    name: 'Electronics',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Books',
    created_at: '2024-01-01T00:00:00Z',
  },
]

export const mockTransactions = [
  {
    id: '1',
    total_amount: 35.49,
    payment_method: 'cash',
    status: 'completed',
    created_at: '2024-01-01T00:00:00Z',
    items: [
      { product_id: '1', quantity: 2, price: 10.99 },
      { product_id: '2', quantity: 1, price: 25.50 },
    ],
  },
]

// Mock Supabase client response structure
const createMockResponse = (data: any, error: any = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
})

// Mock query builder
const createMockQueryBuilder = (mockData: any[]) => {
  let filteredData = [...mockData]
  
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
    eq: jest.fn((column: string, value: any) => {
      filteredData = filteredData.filter(item => item[column] === value)
      return queryBuilder
    }),
    neq: jest.fn((column: string, value: any) => {
      filteredData = filteredData.filter(item => item[column] !== value)
      return queryBuilder
    }),
    gt: jest.fn((column: string, value: any) => {
      filteredData = filteredData.filter(item => item[column] > value)
      return queryBuilder
    }),
    lt: jest.fn((column: string, value: any) => {
      filteredData = filteredData.filter(item => item[column] < value)
      return queryBuilder
    }),
    gte: jest.fn((column: string, value: any) => {
      filteredData = filteredData.filter(item => item[column] >= value)
      return queryBuilder
    }),
    lte: jest.fn((column: string, value: any) => {
      filteredData = filteredData.filter(item => item[column] <= value)
      return queryBuilder
    }),
    like: jest.fn((column: string, pattern: string) => {
      const searchTerm = pattern.replace(/%/g, '')
      filteredData = filteredData.filter(item => 
        item[column]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
      return queryBuilder
    }),
    in: jest.fn((column: string, values: any[]) => {
      filteredData = filteredData.filter(item => values.includes(item[column]))
      return queryBuilder
    }),
    order: jest.fn((column: string, options?: { ascending?: boolean }) => {
      const ascending = options?.ascending !== false
      filteredData.sort((a, b) => {
        if (ascending) {
          return a[column] > b[column] ? 1 : -1
        } else {
          return a[column] < b[column] ? 1 : -1
        }
      })
      return queryBuilder
    }),
    limit: jest.fn((count: number) => {
      filteredData = filteredData.slice(0, count)
      return queryBuilder
    }),
    range: jest.fn((from: number, to: number) => {
      filteredData = filteredData.slice(from, to + 1)
      return queryBuilder
    }),
    single: jest.fn(() => {
      const data = filteredData.length > 0 ? filteredData[0] : null
      return Promise.resolve(createMockResponse(data))
    }),
    maybeSingle: jest.fn(() => {
      const data = filteredData.length > 0 ? filteredData[0] : null
      return Promise.resolve(createMockResponse(data))
    }),
    then: jest.fn((callback) => {
      const result = createMockResponse(filteredData)
      return Promise.resolve(callback(result))
    }),
  }

  // Make it thenable
  queryBuilder.then = jest.fn((callback) => {
    const result = createMockResponse(filteredData)
    return Promise.resolve(callback(result))
  })

  return queryBuilder
}

// Mock Supabase client
export const mockSupabaseClient = {
  from: jest.fn((table: string) => {
    switch (table) {
      case 'products':
        return createMockQueryBuilder(mockProducts)
      case 'categories':
        return createMockQueryBuilder(mockCategories)
      case 'transactions':
        return createMockQueryBuilder(mockTransactions)
      default:
        return createMockQueryBuilder([])
    }
  }),
  
  auth: {
    getUser: jest.fn(() => 
      Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    ),
    getSession: jest.fn(() =>
      Promise.resolve({
        data: { session: { access_token: 'test-token', user: { id: 'test-user-id' } } },
        error: null,
      })
    ),
    signInWithPassword: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 'test-user-id' }, session: { access_token: 'test-token' } },
        error: null,
      })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
  },

  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      download: jest.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: jest.fn(() => Promise.resolve({ data: [], error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'http://test-url' } })),
    })),
  },

  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
  })),

  removeChannel: jest.fn(),
  removeAllChannels: jest.fn().mockReturnValue(Promise.resolve({ error: null })),
}

// Mock the createClient function
export const createClient = jest.fn(() => mockSupabaseClient)

// Export mock for module replacement
export default {
  createClient,
  mockSupabaseClient,
  mockProducts,
  mockCategories,
  mockTransactions,
}