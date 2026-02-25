import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getAdminStats } from '../../services/adminService'
import { getLowStockProducts } from '../../services/productService'
import { getOrders } from '../../services/orderService'
import { AdminStats, Product, Order } from '../../types'
import { useAdmin } from '../../context/AdminContext'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Package, ShoppingBag, DollarSign, Users, AlertTriangle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const { hasPermission } = useAdmin()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Check if user has permission to view analytics
  if (!hasPermission('analytics.view')) {
    return <Navigate to="/admin" replace />
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, lowStockData, ordersData] = await Promise.all([
          getAdminStats(),
          getLowStockProducts(10),
          getOrders(),
        ])
        setStats(statsData)
        setLowStockProducts(lowStockData)
        setRecentOrders(ordersData.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>
  }

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
              Low Stock Items ({stats.lowStockItems})
            </h2>
            <Link to="/admin/products" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm">
              View All
            </Link>
          </div>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="font-medium text-gray-900 dark:text-gray-100">{product.name}</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">Stock: {product.stock}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No low stock items</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-gray-100">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm">
              View All
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(order.total)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


