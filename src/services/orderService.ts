import api from './api'
import { Order, CartItem, ShippingAddress, OrderStatus } from '../types'

export const createOrder = async (
  userId: string,
  items: CartItem[],
  shippingAddress: ShippingAddress
): Promise<string> => {
  try {
    const response = await api.post('/orders', {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress,
    })
    
    return response.data.id
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to create order')
  }
}

export const getOrders = async (_userId?: string): Promise<Order[]> => {
  try {
    const response = await api.get('/orders')
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch orders')
  }
}

export const getOrder = async (_orderId: string): Promise<Order | null> => {
  try {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  } catch (error: any) {
    if (error.response?.status === 404) return null
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch order')
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  try {
    await api.put(`/orders/${orderId}/status`, { status })
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to update order status')
  }
}
