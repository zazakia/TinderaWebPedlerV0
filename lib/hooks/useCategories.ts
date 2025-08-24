import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  // Create a new category
  const createCategory = async (category: CategoryInsert) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single()

      if (error) throw error

      await fetchCategories() // Refresh the categories list
      return { success: true, data }
    } catch (err) {
      console.error('Error creating category:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create category' }
    }
  }

  // Update a category
  const updateCategory = async (id: string, updates: CategoryUpdate) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await fetchCategories() // Refresh the categories list
      return { success: true }
    } catch (err) {
      console.error('Error updating category:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update category' }
    }
  }

  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchCategories() // Refresh the categories list
      return { success: true }
    } catch (err) {
      console.error('Error deleting category:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete category' }
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCategories()
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          fetchCategories()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
