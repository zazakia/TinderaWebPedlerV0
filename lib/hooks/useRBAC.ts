import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { UserRole } from '@/lib/hooks/useAuth'

export interface UserPermission {
  id: string
  user_id: string
  permission_name: string
  resource: string | null
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  is_active: boolean
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface PermissionTemplate {
  id: string
  role: string
  permissions: string[]
  description: string | null
  created_at: string
  updated_at: string
}

export function useRBAC() {
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Fetch user permissions
  const fetchUserPermissions = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('granted_at', { ascending: false })
      
      if (error) throw error
      
      setPermissions(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching user permissions:', err)
      setError('Failed to fetch user permissions')
    } finally {
      setLoading(false)
    }
  }

  // Fetch activity logs
  const fetchActivityLogs = async (userId?: string, limit: number = 50) => {
    try {
      setLoading(true)
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setActivityLogs(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching activity logs:', err)
      setError('Failed to fetch activity logs')
    } finally {
      setLoading(false)
    }
  }

  // Fetch permission templates
  const fetchPermissionTemplates = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('permission_templates')
        .select('*')
        .order('role')
      
      if (error) throw error
      
      setPermissionTemplates(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching permission templates:', err)
      setError('Failed to fetch permission templates')
    } finally {
      setLoading(false)
    }
  }

  // Grant permission to user
  const grantPermission = async (
    userId: string,
    permissionName: string,
    resource: string | null = null,
    grantedBy: string,
    expiresAt: string | null = null
  ) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: userId,
          permission_name: permissionName,
          resource,
          granted_by: grantedBy,
          expires_at: expiresAt,
          is_active: true
        })
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        setPermissions(prev => [data, ...prev])
      }
      
      return { success: true, data }
    } catch (err) {
      console.error('Error granting permission:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to grant permission' }
    }
  }

  // Revoke permission from user
  const revokePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('user_permissions')
        .update({ is_active: false })
        .eq('id', permissionId)
      
      if (error) throw error
      
      setPermissions(prev => 
        prev.map(permission => 
          permission.id === permissionId 
            ? { ...permission, is_active: false } 
            : permission
        )
      )
      
      return { success: true }
    } catch (err) {
      console.error('Error revoking permission:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to revoke permission' }
    }
  }

  // Log user activity
  const logActivity = async (
    userId: string | null,
    action: string,
    resourceType: string | null = null,
    resourceId: string | null = null,
    details: Record<string, any> | null = null
  ) => {
    try {
      // Get IP address and user agent
      const ip_address = typeof window !== 'undefined' ? 
        (window as any).clientInformation?.ip || null : null
      const user_agent = typeof navigator !== 'undefined' ? 
        navigator.userAgent : null
      
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          ip_address,
          user_agent
        })
      
      if (error) throw error
      
      // If we're tracking this user's logs, refresh them
      if (userId) {
        // We don't automatically refresh to avoid too many requests
        // But we could add the log to the local state
      }
      
      return { success: true }
    } catch (err) {
      console.error('Error logging activity:', err)
      // Don't return error as this is a background operation
      return { success: true }
    }
  }

  // Get permissions for a specific user
  const getUserPermissions = (userId: string) => {
    return permissions.filter(permission => 
      permission.user_id === userId && permission.is_active
    )
  }

  // Check if user has specific permission
  const hasPermission = (userId: string, permissionName: string, resource: string | null = null) => {
    const userPermissions = getUserPermissions(userId)
    
    // Check for exact match
    const hasExactPermission = userPermissions.some(permission => 
      permission.permission_name === permissionName && 
      (resource === null || permission.resource === resource)
    )
    
    if (hasExactPermission) return true
    
    // Check for wildcard permissions
    const hasWildcardPermission = userPermissions.some(permission => 
      permission.permission_name === '*' || 
      (permission.resource === '*' && permission.permission_name === permissionName)
    )
    
    return hasWildcardPermission
  }

  // Get role permissions from template
  const getRolePermissions = (role: UserRole) => {
    const template = permissionTemplates.find(t => t.role === role)
    return template ? template.permissions : []
  }

  // Initialize data
  useEffect(() => {
    fetchPermissionTemplates()
  }, [])

  return {
    permissions,
    activityLogs,
    permissionTemplates,
    loading,
    error,
    fetchUserPermissions,
    fetchActivityLogs,
    grantPermission,
    revokePermission,
    logActivity,
    getUserPermissions,
    hasPermission,
    getRolePermissions
  }
}