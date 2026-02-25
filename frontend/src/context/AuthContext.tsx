import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { getUserData, loginUser, registerUser, logoutUser } from '../services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = await getUserData()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to get user data:', error)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { user: userData } = await loginUser(email, password)
    setUser(userData)
  }

  const register = async (email: string, password: string, displayName: string) => {
    const { user: userData } = await registerUser(email, password, displayName)
    setUser(userData)
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager'
  }

  const isSuperAdmin = () => {
    return user?.role === 'super_admin'
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
