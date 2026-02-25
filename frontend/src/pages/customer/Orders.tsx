import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getOrders } from '../../services/orderService'
import { Order } from '../../types'
import { formatCurrency, formatDate } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return
      try {
        const ordersData = await getOrders(user.id)
        setOrders(ordersData)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Orders</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">You have no orders yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-900 dark:text-gray-100">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(order.total)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Orders


