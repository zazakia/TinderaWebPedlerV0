import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Database } from '@/types/database'

type Location = Database['public']['Tables']['locations']['Row']

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')

      if (error) throw error
      setLocations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations')
      console.error('Error fetching locations:', err)
    } finally {
      setLoading(false)
    }
  }

  const createLocation = async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([location])
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setLocations(prev => [...prev, data])
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error creating location:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create location' }
    }
  }

  const updateLocation = async (id: string, updates: Partial<Location>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setLocations(prev => prev.map(loc => loc.id === id ? data : loc))
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating location:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update location' }
    }
  }

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setLocations(prev => prev.filter(loc => loc.id !== id))
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting location:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete location' }
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return {
    locations,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation
  }
}