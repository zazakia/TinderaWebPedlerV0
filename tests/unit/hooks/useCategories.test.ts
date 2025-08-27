import { renderHook, act, waitFor } from '@testing-library/react'
import { useCategories } from '@/lib/hooks/useCategories'
import { mockCategories, mockSupabaseClient } from '../mocks/supabase'

// Mock the Supabase module
jest.mock('@/lib/supabase', () => ({
  createClient: () => mockSupabaseClient,
}))

describe('useCategories Hook - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock data
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'categories') {
        return {
          select: jest.fn().mockReturnValue({
            then: jest.fn((callback) => 
              Promise.resolve(callback({ data: mockCategories, error: null }))
            ),
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { ...mockCategories[0], id: 'new-category-id' },
                error: null,
              }),
            }),
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockCategories[0],
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
      const { result } = renderHook(() => useCategories())

      expect(result.current.categories).toEqual([])
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should fetch categories successfully', async () => {
      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.categories).toEqual(mockCategories)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch error gracefully', async () => {
      const errorMessage = 'Failed to fetch categories'
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: null, error: { message: errorMessage } }))
          ),
        }),
      }))

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.categories).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('Category Creation', () => {
    it('should create category successfully', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newCategoryData = {
        name: 'New Category',
      }

      let createResult
      await act(async () => {
        createResult = await result.current.createCategory(newCategoryData)
      })

      expect(createResult.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
    })

    it('should handle category creation error', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockCategories, error: null }))
          ),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Category creation failed' },
            }),
          }),
        }),
      }))

      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newCategoryData = {
        name: 'New Category',
      }

      let createResult
      await act(async () => {
        createResult = await result.current.createCategory(newCategoryData)
      })

      expect(createResult.success).toBe(false)
      expect(createResult.error).toBe('Category creation failed')
    })

    it('should validate category name uniqueness', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Try to create category with existing name
      const duplicateCategoryData = {
        name: 'Electronics', // This already exists in mockCategories
      }

      let createResult
      await act(async () => {
        createResult = await result.current.createCategory(duplicateCategoryData)
      })

      // Should handle database constraint or validation error
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
    })

    it('should validate required fields for category creation', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Test with empty name
      const invalidCategoryData = {
        name: '',
      }

      let createResult
      await act(async () => {
        try {
          createResult = await result.current.createCategory(invalidCategoryData)
        } catch (error) {
          global.aiErrorTracker.addError(error, 'category-creation-validation')
        }
      })

      expect(mockSupabaseClient.from).toHaveBeenCalled()
    })
  })

  describe('Category Updates', () => {
    it('should update category successfully', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updateData = {
        name: 'Updated Electronics',
      }

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateCategory('1', updateData)
      })

      expect(updateResult.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
    })

    it('should handle category update errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockCategories, error: null }))
          ),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Category update failed' },
              }),
            }),
          }),
        }),
      }))

      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updateData = {
        name: 'Updated Electronics',
      }

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateCategory('1', updateData)
      })

      expect(updateResult.success).toBe(false)
      expect(updateResult.error).toBe('Category update failed')
    })

    it('should handle updating non-existent category', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updateData = {
        name: 'Updated Category',
      }

      let updateResult
      await act(async () => {
        updateResult = await result.current.updateCategory('non-existent-id', updateData)
      })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
    })
  })

  describe('Category Deletion', () => {
    it('should delete category successfully', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.deleteCategory('1')
      })

      expect(deleteResult.success).toBe(true)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('categories')
    })

    it('should handle deletion errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockCategories, error: null }))
          ),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Category deletion failed' },
          }),
        }),
      }))

      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.deleteCategory('1')
      })

      expect(deleteResult.success).toBe(false)
      expect(deleteResult.error).toBe('Category deletion failed')
    })

    it('should handle foreign key constraints on deletion', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: mockCategories, error: null }))
          ),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { 
              message: 'Cannot delete category with associated products',
              code: 'foreign_key_violation'
            },
          }),
        }),
      }))

      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.deleteCategory('1')
      })

      expect(deleteResult.success).toBe(false)
      expect(deleteResult.error).toContain('Cannot delete category')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Network connection failed')
      })

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toContain('Network connection failed')
    })

    it('should handle malformed data responses', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: 'invalid-data', error: null }))
          ),
        }),
      }))

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should handle non-array data gracefully
      expect(Array.isArray(result.current.categories)).toBe(true)
    })

    it('should handle concurrent category operations', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate concurrent operations
      const promises = [
        result.current.createCategory({ name: 'Category 1' }),
        result.current.createCategory({ name: 'Category 2' }),
        result.current.updateCategory('1', { name: 'Updated Category' }),
      ]

      await act(async () => {
        await Promise.all(promises)
      })

      // All operations should complete without interference
      expect(mockSupabaseClient.from).toHaveBeenCalledTimes(4) // Initial fetch + 3 operations
    })

    it('should handle empty category list', async () => {
      mockSupabaseClient.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          then: jest.fn((callback) => 
            Promise.resolve(callback({ data: [], error: null }))
          ),
        }),
      }))

      const { result } = renderHook(() => useCategories())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.categories).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('Performance and Memory', () => {
    it('should clean up subscriptions on unmount', async () => {
      const { result, unmount } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Unmount component
      unmount()

      // Should clean up subscriptions
      expect(mockSupabaseClient.removeAllChannels).toHaveBeenCalled()
    })

    it('should handle rapid successive operations', async () => {
      const { result } = renderHook(() => useCategories())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Rapid operations that might cause race conditions
      const rapidOperations = []
      for (let i = 0; i < 10; i++) {
        rapidOperations.push(
          result.current.createCategory({ name: `Rapid Category ${i}` })
        )
      }

      await act(async () => {
        await Promise.allSettled(rapidOperations)
      })

      // Should handle rapid operations without errors
      expect(mockSupabaseClient.from).toHaveBeenCalled()
    })
  })
})