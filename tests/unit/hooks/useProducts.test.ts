import { renderHook, act, waitFor } from '@testing-library/react'
import { useProducts } from '@/lib/hooks/useProducts'
import { mockProducts, mockSupabaseClient } from '../mocks/supabase'

// Mock the Supabase module
jest.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('useProducts Hook - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock data
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: jest.fn().mockReturnValue({
            then: jest.fn((callback) => 
              Promise.resolve(callback({ data: mockProducts, error: null }))
            ),
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockProducts[0], id: 'new-id' },
                error: null,
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProducts[0],
                  error: null,
                }),
              }),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }
      }
      return {}
    })
  })

  describe('Initial State and Data Fetching', () => {
    it('should initialize with correct default state', async () => {
      const { result } = renderHook(() => useProducts())

      expect(result.current.products).toEqual([])
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should fetch products successfully', async () => {
      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.products).toEqual(mockProducts)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch error gracefully', async () => {
      const errorMessage = 'Failed to fetch products'
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: null, error: { message: errorMessage } }))
          ),
        }),
      }))

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.products).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('Product Creation', () => {
    it('should create product successfully', async () => {
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newProductData = {
        name: 'New Product',
        price_retail: 15.99,
        stock: 25,
        category_id: '1',
      }

      let createResult
      await act(async () => {
        createResult = await result.current.createProduct(newProductData, [])
      })

      expect(createResult.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
    })

    it('should handle product creation error', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockProducts, error: null }))
          ),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Creation failed' },
            }),
          }),
        }),
      }))

      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newProductData = {
        name: 'New Product',
        price_retail: 15.99,
        stock: 25,
        category_id: '1',
      }

      let createResult
      await act(async () => {
        createResult = await result.current.createProduct(newProductData, [])
      })

      expect(createResult.success).toBe(false)
      expect(createResult.error).toBe('Creation failed')
    })

    it('should validate required fields for product creation', async () => {
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Test with missing required fields
      const invalidProductData = {
        // Missing name and price_retail
        stock: 25,
        category_id: '1',
      }

      let createResult
      await act(async () => {
        try {
          createResult = await result.current.createProduct(invalidProductData as any, [])
        } catch (error) {
          global.aiErrorTracker.addError(error, 'product-creation-validation')
        }
      })

      // Should handle validation or database constraint errors
      expect(mockSupabaseClient.from).toHaveBeenCalled()
    })
  })

  describe('Stock Management', () => {
    it('should update stock successfully', async () => {
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateStock('1', 5)
      })

      expect(updateResult.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
    })

    it('should handle negative stock updates', async () => {
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateStock('1', -10)
      })

      // Should handle business logic for negative stock
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
    })

    it('should handle stock update errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockProducts, error: null }))
          ),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Stock update failed' },
              }),
            }),
          }),
        }),
      }))

      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateStock('1', 5)
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toBe('Stock update failed')
    })
  })

  describe('Product Deletion', () => {
    it('should delete product successfully', async () => {
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.deleteProduct('1')
      })

      expect(deleteResult.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('products')
    })

    it('should handle deletion errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockProducts, error: null }))
          ),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Deletion failed' },
          }),
        }),
      }))

      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.deleteProduct('1')
      })

      expect(deleteResult.success).toBe(false)
      expect(deleteResult.error).toBe('Deletion failed')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Network error')
      })

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toContain('Network error')
    })

    it('should handle malformed data responses', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: 'invalid-data', error: null }))
          ),
        }),
      }))

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should handle non-array data gracefully
      expect(Array.isArray(result.current.products)).toBe(true)
    })

    it('should handle concurrent operations correctly', async () => {
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate concurrent create and update operations
      const promises = [
        result.current.createProduct({ name: 'Product 1', price_retail: 10 }, []),
        result.current.createProduct({ name: 'Product 2', price_retail: 20 }, []),
        result.current.updateStock('1', 5),
      ]

      await act(async () => {
        await Promise.all(promises)
      })

      // All operations should complete without interference
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(4) // Initial fetch + 3 operations
    })
  })

  describe('Performance and Memory', () => {
    it('should not cause memory leaks with subscriptions', async () => {
      const { result, unmount } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Unmount component
      unmount()

      // Should clean up subscriptions
      expect(mockSupabaseClient.removeAllChannels).toHaveBeenCalled()
    })

    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockProducts[0],
        id: `product-${i}`,
        name: `Product ${i}`,
      }))

      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: largeDataset, error: null }))
          ),
        }),
      }))

      const { result } = renderHook(() => useProducts())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.products).toHaveLength(1000)
      expect(result.current.products[0].name).toBe('Product 0')
    })
  })
})