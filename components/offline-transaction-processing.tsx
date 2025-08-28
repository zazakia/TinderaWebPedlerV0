"use client"

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Sync,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOffline } from '@/lib/hooks/useOffline'

export default function OfflineTransactionProcessing({ onBack }: { onBack: () => void }) {
  const {
    isOnline,
    isSyncing,
    syncStatus,
    syncError,
    offlineTransactions,
    syncOfflineData,
    clearSyncedTransactions,
    getSyncStats,
    retryFailedTransactions
  } = useOffline()

  const [showDetails, setShowDetails] = useState(false)
  const stats = getSyncStats()

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Sync'
      case 'synced':
        return 'Synced'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'synced':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Offline Transactions</h1>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Status Card */}
      <div className="p-4">
        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={syncOfflineData}
              disabled={!isOnline || isSyncing || stats.pending === 0}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.synced}</p>
              <p className="text-xs text-gray-500">Synced</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-3">Sync Controls</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-2"
              onClick={syncOfflineData}
              disabled={!isOnline || isSyncing || stats.pending === 0}
            >
              <Sync className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              variant="outline"
              onClick={retryFailedTransactions}
              disabled={stats.failed === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Failed
            </Button>
          </div>
          
          {syncStatus === 'success' && (
            <div className="mt-3 p-2 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-700">Sync completed successfully</span>
            </div>
          )}
          
          {syncStatus === 'error' && (
            <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">Sync failed: {syncError}</span>
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full mt-3 flex items-center justify-center gap-2"
            onClick={clearSyncedTransactions}
            disabled={stats.synced === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear Synced Transactions
          </Button>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Transaction History</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          {offlineTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>No offline transactions</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...offlineTransactions].reverse().map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="border rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(transaction.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{formatCurrency(transaction.total)}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.items.length} item{transaction.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm capitalize">{transaction.payment_method}</p>
                      {transaction.receipt_number && (
                        <p className="text-xs text-gray-500">#{transaction.receipt_number}</p>
                      )}
                    </div>
                  </div>
                  
                  {showDetails && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="space-y-1">
                        {transaction.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">Item {index + 1}</span>
                            <span>{item.quantity} × {formatCurrency(item.price)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-medium pt-1 border-t">
                          <span>Total</span>
                          <span>{formatCurrency(transaction.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}