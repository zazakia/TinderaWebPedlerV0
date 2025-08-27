import { useState, useEffect, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase'
import { User, Session, AuthError } from '@supabase/supabase-js'

// Define user roles for role-based access control
export type UserRole = 'admin' | 'manager' | 'cashier' | 'inventory'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: UserRole
  location_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error?: AuthError }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: AuthError }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>
  refreshSession: () => Promise<void>
}

export type AuthContextType = AuthState & AuthActions

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthContext() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null
  })

  const supabase = createClient()

  // Fetch user profile from custom users table
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      return null
    }
  }

  // Create user profile after successful registration
  const createUserProfile = async (user: User, fullName: string, role: UserRole = 'cashier'): Promise<UserProfile | null> => {
    try {
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: fullName,
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createUserProfile:', error)
      return null
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return { error }
    }

    // Fetch user profile
    if (data.user) {
      const profile = await fetchUserProfile(data.user.id)
      setState(prev => ({
        ...prev,
        user: data.user,
        profile,
        session: data.session,
        loading: false,
        error: null
      }))
    }

    return { error: undefined }
  }

  // Sign up with email, password, and full name
  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'cashier') => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return { error }
    }

    // Create user profile in custom table
    if (data.user) {
      const profile = await createUserProfile(data.user, fullName, role)
      setState(prev => ({
        ...prev,
        user: data.user,
        profile,
        session: data.session,
        loading: false,
        error: null
      }))
    }

    return { error: undefined }
  }

  // Sign out
  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
    } else {
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        error: null
      })
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    return { error }
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      return { error: 'No user logged in' }
    }

    setState(prev => ({ ...prev, loading: true }))

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) {
        setState(prev => ({ ...prev, loading: false, error: error.message }))
        return { error: error.message }
      }

      setState(prev => ({
        ...prev,
        profile: data,
        loading: false,
        error: null
      }))

      return { error: undefined }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Refresh session
  const refreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error refreshing session:', error)
      return
    }

    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id)
      setState(prev => ({
        ...prev,
        user: session.user,
        profile,
        session,
        loading: false
      }))
    } else {
      setState(prev => ({
        ...prev,
        user: null,
        profile: null,
        session: null,
        loading: false
      }))
    }
  }

  // Listen for auth changes
  useEffect(() => {
    // Get initial session
    refreshSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setState(prev => ({
            ...prev,
            user: session.user,
            profile,
            session,
            loading: false
          }))
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession
  }
}

// Auth Provider component - moved to components/auth/AuthGuard.tsx
// This hook provides the authentication context logic

// Role-based access control helpers
export function usePermissions() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('usePermissions must be used within an AuthProvider')
  }
  
  const { profile } = context
  
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!profile) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(profile.role)
  }
  
  const canAccess = (feature: string) => {
    if (!profile) return false
    
    const permissions: Record<UserRole, string[]> = {
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

export default useAuth