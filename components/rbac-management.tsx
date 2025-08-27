"use client"

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  Activity, 
  User, 
  Search, 
  Filter,
  Plus,
  X,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRBAC } from '@/lib/hooks/useRBAC'
import { useAuth } from '@/lib/hooks/useAuth'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export default function RBACManagement({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'audit'>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [newPermission, setNewPermission] = useState({
    permission_name: '',
    resource: ''
  })
  
  const { 
    permissions, 
    activityLogs, 
    permissionTemplates,
    fetchUserPermissions,
    fetchActivityLogs,
    grantPermission,
    revokePermission,
    logActivity
  } = useRBAC()
  
  const { profile: currentUser } = useAuth()
  
  // Mock users data (in a real app, this would come from the database)
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@demo.com',
      full_name: 'System Administrator',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-01'
    },
    {
      id: '2',
      email: 'manager@demo.com',
      full_name: 'Store Manager',
      role: 'manager',
      is_active: true,
      created_at: '2024-01-02'
    },
    {
      id: '3',
      email: 'cashier@demo.com',
      full_name: 'Cashier User',
      role: 'cashier',
      is_active: true,
      created_at: '2024-01-03'
    },
    {
      id: '4',
      email: 'inventory@demo.com',
      full_name: 'Inventory Manager',
      role: 'inventory',
      is_active: true,
      created_at: '2024-01-04'
    }
  ])

  // Fetch user permissions when a user is selected
  useEffect(() => {
    if (selectedUser && currentUser) {
      fetchUserPermissions(selectedUser.id)
    }
  }, [selectedUser, currentUser, fetchUserPermissions])

  // Fetch activity logs
  useEffect(() => {
    if (currentUser) {
      fetchActivityLogs()
    }
  }, [currentUser, fetchActivityLogs])

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userPermissions = selectedUser 
    ? permissions.filter(p => p.user_id === selectedUser.id && p.is_active)
    : []

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGrantPermission = async () => {
    if (!selectedUser || !currentUser || !newPermission.permission_name.trim()) return
    
    const result = await grantPermission(
      selectedUser.id,
      newPermission.permission_name,
      newPermission.resource || null,
      currentUser.id
    )
    
    if (result.success) {
      setNewPermission({ permission_name: '', resource: '' })
      setShowPermissionModal(false)
    } else {
      alert(`Failed to grant permission: ${result.error}`)
    }
  }

  const handleRevokePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to revoke this permission?')) return
    
    const result = await revokePermission(permissionId)
    
    if (!result.success) {
      alert(`Failed to revoke permission: ${result.error}`)
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
          <h1 className="text-lg font-semibold">Access Control</h1>
        </div>
        <Shield className="w-5 h-5 text-purple-600" />
      </div>

      {/* Tab Navigation */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-white rounded-lg p-1">
          {([
            { id: 'users', label: 'Users', icon: User },
            { id: 'permissions', label: 'Permissions', icon: Key },
            { id: 'audit', label: 'Audit Trail', icon: Activity }
          ] as const).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className={`flex-1 flex-col items-center gap-1 text-xs py-2 ${activeTab === tab.id ? 'bg-pink-500 text-white' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="px-4 pt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User List */}
          <div className="bg-white rounded-lg">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                className={`flex items-center justify-between p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  selectedUser?.id === user.id ? 'bg-purple-50' : ''
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'cashier' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected User Permissions */}
          {selectedUser && (
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Permissions for {selectedUser.full_name}</h2>
                <Button 
                  size="sm" 
                  className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-1"
                  onClick={() => setShowPermissionModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>
              
              {userPermissions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Key className="w-8 h-8 mx-auto mb-2" />
                  <p>No custom permissions assigned</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{permission.permission_name}</p>
                        {permission.resource && (
                          <p className="text-sm text-gray-500">Resource: {permission.resource}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          Granted by {permission.granted_by || 'system'} on {formatDateTime(permission.granted_at)}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRevokePermission(permission.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-semibold mb-4">Role-Based Permissions</h2>
            
            <div className="space-y-4">
              {permissionTemplates.map((template) => (
                <div key={template.role} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium capitalize">{template.role}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      template.role === 'admin' ? 'bg-red-100 text-red-800' :
                      template.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      template.role === 'cashier' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {template.role}
                    </span>
                  </div>
                  
                  {Array.isArray(template.permissions) && template.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {template.permissions.map((permission, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No permissions defined</p>
                  )}
                  
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="px-4 pt-4 space-y-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Activity Log</h2>
              <Button variant="ghost" size="sm" className="p-2">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            
            {activityLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No activity logs found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...activityLogs].slice(0, 20).map((log) => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{log.action}</span>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                    
                    {log.resource_type && (
                      <p className="text-sm text-gray-600 mb-1">
                        {log.resource_type} {log.resource_id ? `#${log.resource_id}` : ''}
                      </p>
                    )}
                    
                    {log.user_id && (
                      <p className="text-xs text-gray-500">
                        User ID: {log.user_id}
                      </p>
                    )}
                    
                    {log.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <pre className="overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Permission Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Permission</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-1"
                onClick={() => setShowPermissionModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Permission Name
                </label>
                <Input
                  placeholder="e.g., create_product, view_reports"
                  value={newPermission.permission_name}
                  onChange={(e) => setNewPermission({...newPermission, permission_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Resource (optional)
                </label>
                <Input
                  placeholder="e.g., products, reports"
                  value={newPermission.resource}
                  onChange={(e) => setNewPermission({...newPermission, resource: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPermissionModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={handleGrantPermission}
                  disabled={!newPermission.permission_name.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}