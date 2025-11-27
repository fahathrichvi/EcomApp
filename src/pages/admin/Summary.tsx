import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getOrders } from '../../services/orderService'
import { getProducts } from '../../services/productService'
import { Order, Product } from '../../types'
import { useAdmin } from '../../context/AdminContext'
import { formatCurrency, calculateTax, isTaxEnabled } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'

interface MonthlyData {
  month: string
  income: number
  expenses: number
  profit: number
  orders: number
}

interface CategoryRevenue {
  name: string
  value: number
  count: number
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const AdminSummary = () => {
  const { hasPermission } = useAdmin()
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Check if user has permission to view analytics
  if (!hasPermission('analytics.view')) {
    return <Navigate to="/admin" replace />
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getOrders(),
          getProducts(),
        ])
        setOrders(ordersData)
        setProducts(productsData.products)
      } catch (error) {
        console.error('Failed to fetch summary data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />
  }

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    const ranges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    }
    return ranges[timeRange]
  }

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= getDateRange() && order.status !== 'cancelled'
  })

  // Calculate income (total revenue)
  const totalIncome = filteredOrders.reduce((sum, order) => sum + order.total, 0)

  // Calculate expenses (estimated: 15% of revenue for operational costs, shipping, refunds)
  const estimatedExpenses = totalIncome * 0.15
  const refundedOrders = filteredOrders.filter((o) => o.status === 'cancelled').length
  const refundAmount = filteredOrders
    .filter((o) => o.status === 'cancelled')
    .reduce((sum, order) => sum + order.total, 0)
  const totalExpenses = estimatedExpenses + refundAmount

  // Calculate profit
  const profit = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : '0'

  // Calculate growth (compare with previous period)
  const getPreviousPeriodOrders = () => {
    const now = new Date()
    const currentStart = getDateRange()
    const periodLength = now.getTime() - currentStart.getTime()
    const previousStart = new Date(currentStart.getTime() - periodLength)
    return orders.filter(
      (order) =>
        new Date(order.createdAt) >= previousStart &&
        new Date(order.createdAt) < currentStart &&
        order.status !== 'cancelled'
    )
  }

  const previousPeriodOrders = getPreviousPeriodOrders()
  const previousIncome = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0)
  const incomeGrowth =
    previousIncome > 0 ? (((totalIncome - previousIncome) / previousIncome) * 100).toFixed(1) : '0'

  // Prepare monthly data
  const getMonthlyData = (): MonthlyData[] => {
    const months: { [key: string]: MonthlyData } = {}
    const now = new Date()
    const monthsToShow = timeRange === '7d' ? 1 : timeRange === '30d' ? 2 : timeRange === '90d' ? 3 : 12

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      months[monthKey] = {
        month: monthKey,
        income: 0,
        expenses: 0,
        profit: 0,
        orders: 0,
      }
    }

    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (months[monthKey]) {
        months[monthKey].income += order.total
        months[monthKey].orders += 1
      }
    })

    Object.keys(months).forEach((key) => {
      months[key].expenses = months[key].income * 0.15
      months[key].profit = months[key].income - months[key].expenses
    })

    return Object.values(months)
  }

  const monthlyData = getMonthlyData()

  // Prepare revenue trend data (daily for 7d, weekly for 30d, monthly for 90d+)
  const getRevenueTrendData = () => {
    if (timeRange === '7d') {
      const days: { [key: string]: number } = {}
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        days[dayKey] = 0
      }
      filteredOrders.forEach((order) => {
        const orderDate = new Date(order.createdAt)
        const dayKey = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (days[dayKey] !== undefined) {
          days[dayKey] += order.total
        }
      })
      return Object.entries(days).map(([date, revenue]) => ({ date, revenue }))
    } else {
      return monthlyData.map((m) => ({ date: m.month, revenue: m.income }))
    }
  }

  const revenueTrendData = getRevenueTrendData()

  // Calculate category revenue
  const getCategoryRevenue = (): CategoryRevenue[] => {
    const categoryMap: { [key: string]: { value: number; count: number } } = {}

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.name.split(' ')[0] || 'Other' // Simplified category extraction
        if (!categoryMap[category]) {
          categoryMap[category] = { value: 0, count: 0 }
        }
        categoryMap[category].value += item.product.price * item.quantity
        categoryMap[category].count += item.quantity
      })
    })

    return Object.entries(categoryMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }

  const categoryRevenue = getCategoryRevenue()

  // Top products by revenue
  const getTopProducts = () => {
    const productMap: { [key: string]: { name: string; revenue: number; quantity: number } } = {}

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            name: item.product.name,
            revenue: 0,
            quantity: 0,
          }
        }
        productMap[item.productId].revenue += item.product.price * item.quantity
        productMap[item.productId].quantity += item.quantity
      })
    })

    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  const topProducts = getTopProducts()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Summary</h1>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="input text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(totalIncome)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {incomeGrowth}% vs previous period
                </span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {refundedOrders} refunded orders
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  profit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(profit)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {profitMargin}% profit margin
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {filteredOrders.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Avg: {formatCurrency(filteredOrders.length > 0 ? totalIncome / filteredOrders.length : 0)}/order
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <ShoppingBag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Revenue Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                className="text-gray-600 dark:text-gray-400"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-gray-600 dark:text-gray-400"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #000)',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expenses */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Income vs Expenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="month"
                className="text-gray-600 dark:text-gray-400"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-gray-600 dark:text-gray-400"
                style={{ fontSize: '12px' }}
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid var(--tooltip-border, #e5e7eb)',
                  borderRadius: '8px',
                  color: 'var(--tooltip-text, #000)',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Revenue by Category
          </h2>
          {categoryRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryRevenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid var(--tooltip-border, #e5e7eb)',
                    borderRadius: '8px',
                    color: 'var(--tooltip-text, #000)',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Top Products by Revenue
          </h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.quantity} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSummary

