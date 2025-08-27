import { renderHook, act } from '@testing-library/react'
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { aiTestHelper } from '@/tests/utils/ai-test-helpers'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  group: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  join: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabase
}))

describe('useAnalytics', () => {
  // Wrap tests with AI error analysis
  const wrapTest = (testFn: () => void | Promise<void>, testName: string) => 
    aiTestHelper.wrapTest(testFn, testName, { component: 'useAnalytics' })

  beforeEach(() => {
    // Clear any previous error tracking
    if (global.aiTestHelper) {
      global.aiTestHelper.getAnalyzer().getErrorHistory().length = 0
    }
    
    // Reset all mocks
    jest.clearAllMocks()
  })

  it('should initialize with default values', wrapTest(() => {
    const { result } = renderHook(() => useAnalytics())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.salesData).toEqual([])
    expect(result.current.productSalesData).toEqual([])
    expect(result.current.categorySalesData).toEqual([])
    expect(result.current.customerSalesData).toEqual([])
    expect(result.current.inventoryData).toEqual([])
    expect(result.current.supplierPerformanceData).toEqual([])
    expect(result.current.locationSalesData).toEqual([])
    expect(result.current.consolidatedReportData).toBe(null)
  }, 'useAnalytics initialization'))

  it('should fetch sales data', wrapTest(async () => {
    const mockData = [
      { date: '2023-01-01', revenue: 1000, transactions: 5, items_sold: 10 },
      { date: '2023-01-02', revenue: 1500, transactions: 8, items_sold: 15 }
    ]
    
    // Mock the query execution
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        gte: () => ({
          lte: () => ({
            group: () => ({
              order: () => ({
                eq: () => Promise.resolve({ data: mockData, error: null })
              })
            })
          })
        })
      })
    }))
    
    const { result } = renderHook(() => useAnalytics())
    
    await act(async () => {
      await result.current.fetchSalesData('2023-01-01', '2023-01-31')
    })
    
    expect(result.current.loading).toBe(false)
    expect(result.current.salesData).toHaveLength(2)
    expect(result.current.error).toBe(null)
  }, 'useAnalytics fetch sales data'))

  it('should handle fetch errors gracefully', wrapTest(async () => {
    const mockError = new Error('Database connection failed')
    
    // Mock the query execution with error
    mockSupabase.from.mockImplementation(() => ({
      select: () => Promise.resolve({ data: null, error: mockError })
    }))
    
    const { result } = renderHook(() => useAnalytics())
    
    await act(async () => {
      await result.current.fetchSalesData('2023-01-01', '2023-01-31')
    })
    
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Failed to fetch sales data')
    expect(result.current.salesData).toEqual([])
  }, 'useAnalytics error handling'))

  it('should fetch all analytics data', wrapTest(async () => {
    const { result } = renderHook(() => useAnalytics())
    
    // Mock the Supabase responses
    mockSupabase.from.mockImplementation(() => ({
      select: () => Promise.resolve({ data: [], error: null })
    }))
    
    await act(async () => {
      await result.current.fetchAllAnalytics('2023-01-01', '2023-01-31')
    })
    
    expect(result.current.loading).toBe(false)
  }, 'useAnalytics fetch all data'))
})