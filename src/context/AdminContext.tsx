import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { ROLE_PERMISSIONS } from '../config/constants'

interface AdminContextType {
  hasPermission: (permission: string) => boolean
  canCreate: (resource: string) => boolean
  canEdit: (resource: string) => boolean
  canDelete: (resource: string) => boolean
  canView: (resource: string) => boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      if (user.permissions && user.permissions.length > 0) {
        setPermissions(user.permissions)
      } else if (user.role) {
        setPermissions(ROLE_PERMISSIONS[user.role] || [])
      }
    } else {
      setPermissions([])
    }
  }, [user])

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    return permissions.includes(permission)
  }

  const canCreate = (resource: string): boolean => {
    return hasPermission(`${resource}.create`)
  }

  const canEdit = (resource: string): boolean => {
    return hasPermission(`${resource}.edit`)
  }

  const canDelete = (resource: string): boolean => {
    return hasPermission(`${resource}.delete`)
  }

  const canView = (resource: string): boolean => {
    return hasPermission(`${resource}.view`) || canEdit(resource) || canDelete(resource)
  }

  const value: AdminContextType = {
    hasPermission,
    canCreate,
    canEdit,
    canDelete,
    canView,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}


