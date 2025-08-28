"use client"

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Plus, Edit, Trash2, CreditCard, Phone, Mail, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { useTransactions } from '@/lib/hooks/useTransactions'

interface Customer {
  id: string
  name: string
  phone_number: string | null
  email: string | null
  address: string | null
  notes: string | null
  credit_limit: number
  current_balance: number
  total_purchases: number
  last_purchase_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CustomerManagement({ onBack }: { onBack: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone_number: '',
    email: '',
    address: '',
    notes: '',
    credit_limit: 0
  })
  const [editCustomer, setEditCustomer] = useState({
    name: '',
    phone_number: '',
    email: '',
    address: '',
    notes: '',
    credit_limit: 0
  })

  const { customers: dbCustomers, loading, error, createCustomer, updateCustomer, deleteCustomer, recordCreditPayment } = useCustomers()
  const { getCustomerTransactions } = useTransactions()

  useEffect(() => {
    setCustomers(dbCustomers)
    setFilteredCustomers(dbCustomers)
  }, [dbCustomers])

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone_number && customer.phone_number.includes(searchQuery)) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      alert('Customer name is required')
      return
    }

    try {
      const result = await createCustomer({
        name: newCustomer.name,
        phone_number: newCustomer.phone_number || null,
        email: newCustomer.email || null,
        address: newCustomer.address || null,
        notes: newCustomer.notes || null,
        credit_limit: newCustomer.credit_limit,
        current_balance: 0,
        total_purchases: 0,
        is_active: true
      })

      if (result.success) {
        setNewCustomer({
          name: '',
          phone_number: '',
          email: '',
          address: '',
          notes: '',
          credit_limit: 0
        })
        setShowAddForm(false)
      } else {
        alert(`Failed to add customer: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding customer:', error)
      alert(`Failed to add customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer || !editCustomer.name.trim()) {
      alert('Customer name is required')
      return
    }

    try {
      const result = await updateCustomer(selectedCustomer.id, {
        name: editCustomer.name,
        phone_number: editCustomer.phone_number || null,
        email: editCustomer.email || null,
        address: editCustomer.address || null,
        notes: editCustomer.notes || null,
        credit_limit: editCustomer.credit_limit
      })

      if (result.success) {
        setShowEditForm(false)
        setSelectedCustomer(null)
      } else {
        alert(`Failed to update customer: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert(`Failed to update customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const result = await deleteCustomer(customerId)
      if (!result.success) {
        alert(`Failed to delete customer: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert(`Failed to delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-PH')
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
            <h1 className="text-lg font-semibold">Add Customer</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <Input
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <Input
              value={newCustomer.phone_number}
              onChange={(e) => setNewCustomer({...newCustomer, phone_number: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={newCustomer.address}
              onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Credit Limit</label>
            <Input
              type="number"
              value={newCustomer.credit_limit}
              onChange={(e) => setNewCustomer({...newCustomer, credit_limit: Number(e.target.value)})}
              placeholder="Enter credit limit"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={newCustomer.notes}
              onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
              placeholder="Enter notes"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <Button
            onClick={handleAddCustomer}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2"
          >
            Add Customer
          </Button>
        </div>
      </div>
    )
  }

  if (showEditForm && selectedCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setShowEditForm(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Edit Customer</h1>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <Input
              value={editCustomer.name}
              onChange={(e) => setEditCustomer({...editCustomer, name: e.target.value})}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <Input
              value={editCustomer.phone_number}
              onChange={(e) => setEditCustomer({...editCustomer, phone_number: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={editCustomer.email}
              onChange={(e) => setEditCustomer({...editCustomer, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <Input
              value={editCustomer.address}
              onChange={(e) => setEditCustomer({...editCustomer, address: e.target.value})}
              placeholder="Enter address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Credit Limit</label>
            <Input
              type="number"
              value={editCustomer.credit_limit}
              onChange={(e) => setEditCustomer({...editCustomer, credit_limit: Number(e.target.value)})}
              placeholder="Enter credit limit"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={editCustomer.notes}
              onChange={(e) => setEditCustomer({...editCustomer, notes: e.target.value})}
              placeholder="Enter notes"
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <Button
            onClick={handleUpdateCustomer}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2"
          >
            Update Customer
          </Button>
        </div>
      </div>
    )
  }

  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setSelectedCustomer(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Customer Details</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => {
              setEditCustomer({
                name: selectedCustomer.name,
                phone_number: selectedCustomer.phone_number || '',
                email: selectedCustomer.email || '',
                address: selectedCustomer.address || '',
                notes: selectedCustomer.notes || '',
                credit_limit: selectedCustomer.credit_limit
              })
              setShowEditForm(true)
            }}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        {/* Customer Info */}
        <div className="p-4">
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{selectedCustomer.name}</h2>
                <p className="text-sm text-gray-500">Customer ID: {selectedCustomer.id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedCustomer.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedCustomer.phone_number}</span>
                </div>
              )}

              {selectedCustomer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedCustomer.email}</span>
                </div>
              )}

              {selectedCustomer.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-sm">{selectedCustomer.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Info */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Financial Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Credit Limit</p>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(selectedCustomer.credit_limit)}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Current Balance</p>
                <p className={`text-lg font-semibold ${selectedCustomer.current_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(selectedCustomer.current_balance)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Total Purchases</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(selectedCustomer.total_purchases)}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Last Purchase</p>
                <p className="text-lg font-semibold text-purple-600">{formatDate(selectedCustomer.last_purchase_date)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white py-3 flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              Record Payment
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-50 py-3"
              onClick={() => handleDeleteCustomer(selectedCustomer.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>

          {/* Notes */}
          {selectedCustomer.notes && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{selectedCustomer.notes}</p>
            </div>
          )}
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
          <h1 className="text-lg font-semibold">Customers</h1>
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
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="px-4 pb-20">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No customers found</p>
            <Button 
              className="mt-3 bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => setShowAddForm(true)}
            >
              Add Your First Customer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{customer.name}</h3>
                      <p className="text-xs text-gray-500">
                        {customer.phone_number || customer.email || 'No contact info'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${customer.current_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(customer.current_balance)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(customer.last_purchase_date)}
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