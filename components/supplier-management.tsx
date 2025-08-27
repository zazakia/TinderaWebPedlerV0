"use client"

import React, { useState } from 'react'
import { ArrowLeft, Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Package, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Supplier {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export default function SupplierManagement({ onBack }: { onBack: () => void }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'ABC Supply Co.',
      contact_person: 'John Smith',
      phone: '09123456789',
      email: 'john@abcsupply.com',
      address: '123 Main St, Manila',
      notes: 'Primary supplier for electronics',
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: '2',
      name: 'XYZ Distributors',
      contact_person: 'Maria Garcia',
      phone: '09987654321',
      email: 'maria@xyzdist.com',
      address: '456 Oak Ave, Quezon City',
      notes: 'Wholesale supplier',
      is_active: true,
      created_at: '2024-02-20'
    }
  ])
  
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })
  const [editSupplier, setEditSupplier] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  // Initialize filtered suppliers
  React.useEffect(() => {
    setFilteredSuppliers(suppliers)
  }, [suppliers])

  // Filter suppliers based on search query
  React.useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.phone && supplier.phone.includes(searchQuery)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredSuppliers(filtered)
  }, [searchQuery, suppliers])

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim()) {
      alert('Supplier name is required')
      return
    }

    const supplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplier.name,
      contact_person: newSupplier.contact_person || null,
      phone: newSupplier.phone || null,
      email: newSupplier.email || null,
      address: newSupplier.address || null,
      notes: newSupplier.notes || null,
      is_active: true,
      created_at: new Date().toISOString()
    }

    setSuppliers([...suppliers, supplier])
    setNewSupplier({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  const handleUpdateSupplier = () => {
    if (!selectedSupplier || !editSupplier.name.trim()) {
      alert('Supplier name is required')
      return
    }

    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === selectedSupplier.id 
        ? {
            ...supplier,
            name: editSupplier.name,
            contact_person: editSupplier.contact_person || null,
            phone: editSupplier.phone || null,
            email: editSupplier.email || null,
            address: editSupplier.address || null,
            notes: editSupplier.notes || null
          }
        : supplier
    )

    setSuppliers(updatedSuppliers)
    setShowEditForm(false)
    setSelectedSupplier(null)
  }

  const handleDeleteSupplier = (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return
    }

    setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId))
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
            <h1 className="text-lg font-semibold">Add Supplier</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Supplier Name *</label>
            <Input
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Contact Person</label>
            <Input
              value={newSupplier.contact_person}
              onChange={(e) => setNewSupplier({...newSupplier, contact_person: e.target.value})}
              placeholder="Enter contact person"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={newSupplier.phone}
              onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={newSupplier.email}
              onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={newSupplier.address}
              onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newSupplier.notes}
              onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
              placeholder="Enter notes"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <Button
            onClick={handleAddSupplier}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2"
          >
            Add Supplier
          </Button>
        </div>
      </div>
    )
  }

  if (showEditForm && selectedSupplier) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowEditForm(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Edit Supplier</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Supplier Name *</label>
            <Input
              value={editSupplier.name}
              onChange={(e) => setEditSupplier({...editSupplier, name: e.target.value})}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Contact Person</label>
            <Input
              value={editSupplier.contact_person}
              onChange={(e) => setEditSupplier({...editSupplier, contact_person: e.target.value})}
              placeholder="Enter contact person"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <Input
              value={editSupplier.phone}
              onChange={(e) => setEditSupplier({...editSupplier, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={editSupplier.email}
              onChange={(e) => setEditSupplier({...editSupplier, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={editSupplier.address}
              onChange={(e) => setEditSupplier({...editSupplier, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={editSupplier.notes}
              onChange={(e) => setEditSupplier({...editSupplier, notes: e.target.value})}
              placeholder="Enter notes"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpdateSupplier}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2"
          >
            Update Supplier
          </Button>
        </div>
      </div>
    )
  }

  if (selectedSupplier) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setSelectedSupplier(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Supplier Details</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              setEditSupplier({
                name: selectedSupplier.name,
                contact_person: selectedSupplier.contact_person || '',
                phone: selectedSupplier.phone || '',
                email: selectedSupplier.email || '',
                address: selectedSupplier.address || '',
                notes: selectedSupplier.notes || ''
              })
              setShowEditForm(true)
            }}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        {/* Supplier Info */}
        <div className="p-4">
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{selectedSupplier.name}</h2>
                <p className="text-sm text-gray-500">Supplier ID: {selectedSupplier.id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedSupplier.contact_person && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedSupplier.contact_person}</span>
                </div>
              )}

              {selectedSupplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedSupplier.phone}</span>
                </div>
              )}

              {selectedSupplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedSupplier.email}</span>
                </div>
              )}

              {selectedSupplier.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{selectedSupplier.address}</span>
                </div>
              )}
              
              <div className="pt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedSupplier.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {selectedSupplier.is_active ? "Active" : "Inactive"} Supplier
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white py-3 flex items-center justify-center gap-2">
              <Package className="w-4 h-4" />
              Create PO
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-50 py-3"
              onClick={() => handleDeleteSupplier(selectedSupplier.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Notes */}
          {selectedSupplier.notes && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{selectedSupplier.notes}</p>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold">12</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">On-Time Delivery</p>
                <p className="text-xl font-bold">92%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-xl font-bold">₱15,420</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">Quality Rating</p>
                <p className="text-xl font-bold">4.7/5</p>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold mb-3">Recent Purchase Orders</h3>
            <div className="space-y-3">
              <div className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium">PO-2024-001</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Received</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>₱42,500.00</span>
                  <span>2024-03-15</span>
                </div>
              </div>
              <div className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between">
                  <span className="font-medium">PO-2024-002</span>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>₱18,750.00</span>
                  <span>2024-03-20</span>
                </div>
              </div>
            </div>
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
          <h1 className="text-lg font-semibold">Suppliers</h1>
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
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Supplier List */}
      <div className="px-4 pb-20">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No suppliers found</p>
            <Button 
              className="mt-3 bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Supplier
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSuppliers.map((supplier) => (
              <div 
                key={supplier.id} 
                className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedSupplier(supplier)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{supplier.name}</h3>
                      <p className="text-xs text-gray-500">
                        {supplier.contact_person || 'No contact person'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {supplier.phone || supplier.email || 'No contact info'}
                    </p>
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