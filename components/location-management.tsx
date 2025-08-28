"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Plus, Edit, Trash2, MapPin, User, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLocations } from '@/lib/hooks/useLocations'
import { useAuth } from '@/components/auth/AuthGuard'

interface Location {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  manager_id: string | null
  settings: Record<string, any> | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function LocationManagement({ onBack }: { onBack: () => void }) {
  const { locations, loading, error, fetchLocations, createLocation, updateLocation, deleteLocation } = useLocations()
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager_id: '',
    is_active: true
  })
  const [editLocation, setEditLocation] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager_id: '',
    is_active: true
  })

  // Initialize filtered locations
  useEffect(() => {
    setFilteredLocations(locations as Location[])
  }, [locations])

  // Filter locations based on search query
  useEffect(() => {
    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.address && location.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (location.phone && location.phone.includes(searchQuery)) ||
      (location.email && location.email.toLowerCase().includes(searchQuery.toLowerCase()))
    ) as Location[]
    setFilteredLocations(filtered)
  }, [searchQuery, locations])

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      alert('Location name is required')
      return
    }

    const locationData = {
      name: newLocation.name,
      address: newLocation.address || null,
      phone: newLocation.phone || null,
      email: newLocation.email || null,
      manager_id: newLocation.manager_id || null,
      settings: {},
      is_active: newLocation.is_active
    }

    const result = await createLocation(locationData)
    
    if (result.success) {
      setNewLocation({
        name: '',
        address: '',
        phone: '',
        email: '',
        manager_id: '',
        is_active: true
      })
      setShowAddForm(false)
    } else {
      alert(result.error || 'Failed to create location')
    }
  }

  const handleUpdateLocation = async () => {
    if (!selectedLocation || !editLocation.name.trim()) {
      alert('Location name is required')
      return
    }

    const updateData = {
      name: editLocation.name,
      address: editLocation.address || null,
      phone: editLocation.phone || null,
      email: editLocation.email || null,
      manager_id: editLocation.manager_id || null,
      is_active: editLocation.is_active
    }

    const result = await updateLocation(selectedLocation.id, updateData)
    
    if (result.success) {
      setShowEditForm(false)
      setSelectedLocation(null)
    } else {
      alert(result.error || 'Failed to update location')
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      return
    }

    const result = await deleteLocation(locationId)
    
    if (!result.success) {
      alert(result.error || 'Failed to delete location')
    }
  }

  const openEditForm = (location: Location) => {
    setSelectedLocation(location)
    setEditLocation({
      name: location.name,
      address: location.address || '',
      phone: location.phone || '',
      email: location.email || '',
      manager_id: location.manager_id || '',
      is_active: location.is_active
    })
    setShowEditForm(true)
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowAddForm(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Add Location</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location Name *</label>
            <Input
              value={newLocation.name}
              onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
              placeholder="Enter location name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={newLocation.address}
              onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={newLocation.phone}
              onChange={(e) => setNewLocation({...newLocation, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={newLocation.email}
              onChange={(e) => setNewLocation({...newLocation, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <label className="text-sm font-medium text-gray-700">Active Status</label>
            <Button
              variant={newLocation.is_active ? "default" : "outline"}
              size="sm"
              onClick={() => setNewLocation({...newLocation, is_active: !newLocation.is_active})}
            >
              {newLocation.is_active ? 'Active' : 'Inactive'}
            </Button>
          </div>

          <div className="pt-4">
            <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3" onClick={handleAddLocation}>
              Save Location
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showEditForm && selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowEditForm(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Edit Location</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Location Name *</label>
            <Input
              value={editLocation.name}
              onChange={(e) => setEditLocation({...editLocation, name: e.target.value})}
              placeholder="Enter location name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={editLocation.address}
              onChange={(e) => setEditLocation({...editLocation, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={editLocation.phone}
              onChange={(e) => setEditLocation({...editLocation, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={editLocation.email}
              onChange={(e) => setEditLocation({...editLocation, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <label className="text-sm font-medium text-gray-700">Active Status</label>
            <Button
              variant={editLocation.is_active ? "default" : "outline"}
              size="sm"
              onClick={() => setEditLocation({...editLocation, is_active: !editLocation.is_active})}
            >
              {editLocation.is_active ? 'Active' : 'Inactive'}
            </Button>
          </div>

          <div className="pt-4">
            <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3" onClick={handleUpdateLocation}>
              Update Location
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Locations</h1>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-full text-sm flex items-center gap-1"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Location List */}
      <div className="px-4 pb-20">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading locations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error: {error}</p>
            <Button className="mt-4" onClick={fetchLocations}>Retry</Button>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-10">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No locations found</h3>
            <p className="text-gray-500 mb-4">Get started by adding a new location.</p>
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => setShowAddForm(true)}
            >
              Add Location
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLocations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{location.name}</h3>
                      {!location.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {location.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{location.address}</span>
                      </div>
                    )}
                    {location.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="w-4 h-4" />
                        <span>{location.phone}</span>
                      </div>
                    )}
                    {location.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{location.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2 text-gray-500 hover:text-pink-500"
                      onClick={() => openEditForm(location)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-2 text-gray-500 hover:text-red-500"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}