import api from './api'
import { User, AdminStats } from '../types'

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users')
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch users')
  }
}

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get('/admin/stats')
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch admin stats')
  }
}
