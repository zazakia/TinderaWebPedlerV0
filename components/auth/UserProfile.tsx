"use client"

import React, { useState } from 'react'
import { ArrowLeft, User, Mail, Phone, MapPin, Edit, Save, X, Settings, Shield, LogOut, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, usePermissions } from './AuthGuard'

interface UserProfileProps {
  onBack: () => void
}

export default function UserProfile({ onBack }: UserProfileProps) {
  const { profile, signOut, updateProfile } = useAuth()
  const { hasRole, canAccess } = usePermissions()
  
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: profile?.email || ''
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile(editForm)
      if (result.error) {
        alert(`Failed to update profile: ${result.error}`)
      } else {
        setIsEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cashier': return 'bg-green-100 text-green-800 border-green-200'
      case 'inventory': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full system access and user management'
      case 'manager': return 'Store operations and staff management'
      case 'cashier': return 'Point of sale operations and customer service'
      case 'inventory': return 'Stock management and supplier relations'
      default: return 'Limited access'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-sm mx-auto">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Profile Settings</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-4 space-y-6">
        {/* Avatar Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-gray-800">{profile?.full_name}</h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getRoleBadgeColor(profile?.role || '')}`}>
            <Shield className="w-4 h-4 mr-1" />
            {profile?.role?.toUpperCase()}
          </div>
          <p className="text-sm text-gray-600 mt-1">{getRoleDescription(profile?.role || '')}</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
          
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <Input
                  value={isEditing ? editForm.full_name : profile?.full_name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!isEditing}
                  className="pl-10"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  value={isEditing ? editForm.email : profile?.email || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className="pl-10"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative">
                <Input
                  type="tel"
                  value={isEditing ? editForm.phone : profile?.phone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Enter phone number" : "Not set"}
                  className="pl-10"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role</label>
              <div className="relative">
                <Input
                  value={profile?.role?.charAt(0)?.toUpperCase() + profile?.role?.slice(1) || ''}
                  disabled
                  className="pl-10 bg-gray-50"
                />
                <Shield className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <p className="text-xs text-gray-500">Role can only be changed by an administrator</p>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-6 flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    full_name: profile?.full_name || '',
                    phone: profile?.phone || '',
                    email: profile?.email || ''
                  })
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Account Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile?.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {profile?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="text-sm text-gray-800">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-800">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Your Permissions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { feature: 'pos', label: 'POS System' },
              { feature: 'inventory', label: 'Inventory' },
              { feature: 'products', label: 'Products' },
              { feature: 'reports', label: 'Reports' },
              { feature: 'customers', label: 'Customers' },
              { feature: 'analytics', label: 'Analytics' }
            ].map(({ feature, label }) => (
              <div
                key={feature}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  canAccess(feature) 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
                <div className={`w-2 h-2 rounded-full ${
                  canAccess(feature) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {hasRole('admin') && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Settings className="w-4 h-4 mr-2" />
              Admin Settings
            </Button>
          )}
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}