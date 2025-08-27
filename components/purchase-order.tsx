"use client"

import React, { useState } from 'react'
import { ArrowLeft, Search, Plus, Edit, Trash2, Package, User, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PurchaseOrder {
  id: string
  supplier_id: string
  supplier_name: string
  po_number: string
  status: 'draft' | 'pending' | 'approved' | 'received' | 'cancelled'
  total_amount: number
  created_at: string
  expected_delivery: string | null
}

export default function PurchaseOrderManagement({ onBack }: { onBack: () => void }) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'po-1',
      supplier_id: 'sup-1',
      supplier_name: 'ABC Supply Co.',
      po_number: 'PO-2024-001',
      status: 'pending',
      total_amount: 15000,
      created_at: '2024-03-15',
      expected_delivery: '2024-03-25'
    },
    {
      id: 'po-2',
      supplier_id: 'sup-2',
      supplier_name: 'XYZ Distributors',
      po_number: 'PO-2024-002',
      status: 'received',
      total_amount: 8500,
      created_at: '2024-03-10',
      expected_delivery: '2024-03-20'
    }
  ])
  
  const [filteredPOs, setFilteredPOs] = useState<PurchaseOrder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  // Initialize filtered POs
  React.useEffect(() => {
    setFilteredPOs(purchaseOrders)
  }, [purchaseOrders])

  // Filter POs based on search query
  React.useEffect(() => {
    const filtered = purchaseOrders.filter(po =>
      po.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.status.includes(searchQuery)
    )
    setFilteredPOs(filtered)
  }, [searchQuery, purchaseOrders])

  const handleCreatePO = () => {
    // In a real app, this would open a form to create a new PO
    alert('Create PO functionality would be implemented here')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH')
  }

  if (selectedPO) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => setSelectedPO(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Purchase Order Details</h1>
          </div>
        </div>

        {/* PO Details */}
        <div className="p-4">
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedPO.po_number}</h2>
                <p className="text-sm text-gray-500">Created: {formatDate(selectedPO.created_at)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPO.status)}`}>
                {selectedPO.status.charAt(0).toUpperCase() + selectedPO.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedPO.supplier_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-bold">{formatCurrency(selectedPO.total_amount)}</p>
              </div>

              {selectedPO.expected_delivery && (
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="font-medium">{formatDate(selectedPO.expected_delivery)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white py-3 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Receive Goods
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-500 hover:bg-red-50 py-3"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel PO
            </Button>
          </div>

          {/* PO Items */}
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold mb-3">Items</h3>
            <div className="text-center py-4 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">PO items would be listed here</p>
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
          <h1 className="text-lg font-semibold">Purchase Orders</h1>
        </div>
        <Button 
          className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-full text-sm flex items-center gap-1"
          onClick={handleCreatePO}
        >
          <Plus className="w-4 h-4" />
          New PO
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search purchase orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* PO List */}
      <div className="px-4 pb-20">
        {filteredPOs.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No purchase orders found</p>
            <Button 
              className="mt-3 bg-pink-500 hover:bg-pink-600 text-white"
              onClick={handleCreatePO}
            >
              Create Your First PO
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPOs.map((po) => (
              <div 
                key={po.id} 
                className="bg-white rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedPO(po)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{po.po_number}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(po.status)}`}>
                    {po.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{po.supplier_name}</p>
                    <p className="text-xs text-gray-500">Created: {formatDate(po.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(po.total_amount)}</p>
                    {po.expected_delivery && (
                      <p className="text-xs text-gray-500">Due: {formatDate(po.expected_delivery)}</p>
                    )}
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