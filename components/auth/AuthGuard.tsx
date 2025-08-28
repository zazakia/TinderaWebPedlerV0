"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'
import { useAuthContext, AuthContextType } from '@/lib/hooks/useAuth'
import LoginScreen from './LoginScreen'
import RegisterScreen from './RegisterScreen'

// Create auth context for the provider
const AuthContext = createContext<any>(null)

// Auth Provider component 
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext()
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to use permissions
export function usePermissions() {
  const { profile } = useAuth()
  
  const hasRole = (role: string | string[]) => {
    if (!profile) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(profile.role)
  }
  
  const canAccess = (feature: string) => {
    if (!profile) return false
    
    const permissions: Record<string, string[]> = {
      admin: ['*'], // Full access
      manager: [
        'pos', 'inventory', 'products', 'reports', 
        'customers', 'transactions', 'analytics'
      ],
      cashier: ['pos', 'products', 'customers'],
      inventory: ['inventory', 'products', 'suppliers']
    }
    
    const userPermissions = permissions[profile.role] || []
    return userPermissions.includes('*') || userPermissions.includes(feature)
  }
  
  return {
    profile,
    hasRole,
    canAccess,
    isAdmin: hasRole('admin'),
    isManager: hasRole(['admin', 'manager']),
    isCashier: hasRole('cashier'),
    isInventoryManager: hasRole('inventory')
  }
}

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center max-w-sm mx-auto">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <span className="text-3xl font-bold text-purple-600">Peddlr</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your dashboard...</span>
        </div>
      </div>
    </div>
  )
}

// Permission denied screen
function PermissionDeniedScreen({ requiredPermissions }: { requiredPermissions: string[] }) {
  const { profile } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4 max-w-sm mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this feature.
        </p>
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <p className="text-sm text-gray-600">Your role: <span className="font-medium capitalize">{profile?.role}</span></p>
          <p className="text-sm text-gray-600">Required: {requiredPermissions.join(', ')}</p>
        </div>
        <p className="text-sm text-gray-500">
          Contact your administrator for access to this feature.
        </p>
      </div>
    </div>
  )
}

// Auth flow component (internal, used within provider)
function AuthFlow({ children, requiredPermissions, fallback }: AuthGuardProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const { user, profile, loading, error } = useAuth()
  const { canAccess } = usePermissions()

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />
  }

  // Show error if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4 max-w-sm mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show auth screens if not authenticated
  if (!user || !profile) {
    if (authMode === 'register') {
      return (
        <RegisterScreen
          onRegisterSuccess={() => {
            // After successful registration, user will be automatically logged in
            // The auth state will update and this component will re-render
          }}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )
    }

    return (
      <LoginScreen
        onLoginSuccess={() => {
          // After successful login, user will be automatically set
          // The auth state will update and this component will re-render
        }}
        onSwitchToRegister={() => setAuthMode('register')}
        onForgotPassword={() => setAuthMode('forgot-password')}
      />
    )
  }

  // Check permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission => canAccess(permission))
    
    if (!hasPermission) {
      return fallback || <PermissionDeniedScreen requiredPermissions={requiredPermissions} />
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>
}

// Main AuthGuard component (wraps everything in provider)
export default function AuthGuard({ children, requiredPermissions, fallback }: AuthGuardProps) {
  return (
    <AuthProvider>
      <AuthFlow requiredPermissions={requiredPermissions} fallback={fallback}>
        {children}
      </AuthFlow>
    </AuthProvider>
  )
}

// Higher-order component for protecting specific routes
export function withAuth<T extends {}>(
  Component: React.ComponentType<T>,
  requiredPermissions?: string[]
) {
  const AuthenticatedComponent = (props: T) => {
    return (
      <AuthGuard requiredPermissions={requiredPermissions}>
        <Component {...props} />
      </AuthGuard>
    )
  }

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  
  return AuthenticatedComponent
}

// Hook for getting current user context
export function useCurrentUser() {
  const { user, profile } = useAuth()
  const { hasRole, canAccess, isAdmin, isManager } = usePermissions()

  return {
    user,
    profile,
    hasRole,
    canAccess,
    isAdmin,
    isManager,
    isAuthenticated: !!user && !!profile
  }
}