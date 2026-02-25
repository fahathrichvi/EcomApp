import api from './api'
import { User, UserRole } from '../types'
import { USER_ROLES } from '../config/constants'

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  _role: UserRole = USER_ROLES.CUSTOMER
): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      displayName,
    })
    
    const { user, token } = response.data
    localStorage.setItem('token', token)
    
    return { user, token }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to register user')
  }
}

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/login', { email, password })
    
    const { user, token } = response.data
    localStorage.setItem('token', token)
    
    return { user, token }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to login')
  }
}

export const logoutUser = async (): Promise<void> => {
  try {
    localStorage.removeItem('token')
  } catch (error: any) {
    throw new Error(error.message || 'Failed to logout')
  }
}

export const getUserData = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    
    const response = await api.get('/auth/me')
    return response.data
  } catch (error: any) {
    console.error('Failed to get user data:', error)
    return null
  }
}

export const updateUserRole = async (
  userId: string,
  role: UserRole,
  permissions?: string[]
): Promise<void> => {
  try {
    await api.put(`/users/${userId}/role`, { role, permissions })
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to update user role')
  }
}

export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    await api.put(`/users/${userId}/profile`, data)
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to update profile')
  }
}

export const createUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  permissions?: string[]
): Promise<User> => {
  try {
    const response = await api.post('/users', {
      email,
      password,
      displayName,
      role,
      permissions,
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to create user')
  }
}

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to delete user')
  }
}