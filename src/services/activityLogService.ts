import api from './api'
import { ActivityLog } from '../types'

export const getActivityLogs = async (limitCount: number = 100): Promise<ActivityLog[]> => {
  try {
    const response = await api.get('/activity-logs', {
      params: { limit: limitCount },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch activity logs')
  }
}

export const getUserActivityLogs = async (userId: string): Promise<ActivityLog[]> => {
  try {
    const response = await api.get('/activity-logs', {
      params: { userId, limit: 50 },
    })
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch user activity logs')
  }
}
