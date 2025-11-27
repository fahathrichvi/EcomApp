import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, FileText, Settings, LogOut, Folder, BarChart3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'
import Button from '../common/Button'
import ThemeToggle from '../common/ThemeToggle'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const { canView, hasPermission } = useAdmin()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Define all navigation items with their required permissions
  const allNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'analytics.view' },
    { path: '/admin/summary', label: 'Summary', icon: BarChart3, permission: 'analytics.view' },
    { path: '/admin/products', label: 'Products', icon: Package, permission: 'products.view' },
    { path: '/admin/categories', label: 'Categories', icon: Folder, permission: 'products.view' },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag, permission: 'orders.view' },
    { path: '/admin/users', label: 'Users', icon: Users, permission: 'users.view' },
    { path: '/admin/activity-logs', label: 'Activity Logs', icon: FileText, permission: null, requireSuperAdmin: true },
    { path: '/admin/settings', label: 'Settings', icon: Settings, permission: null, requireSuperAdmin: true },
  ]

  // Filter navigation items based on user permissions
  const navItems = allNavItems.filter(item => {
    // Super admin can see everything
    if (user?.role === 'super_admin') return true
    
    // Check for super admin only items
    if (item.requireSuperAdmin) return false
    
    // Check permission-based access
    // If they have the specific permission, or can view the resource (which includes edit/delete permissions)
    if (item.permission) {
      const resource = item.permission.split('.')[0]
      return hasPermission(item.permission) || canView(resource)
    }
    
    return false
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen sticky top-0 transition-colors duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Admin Panel</h1>
              <ThemeToggle />
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-primary-600 dark:bg-primary-700 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2 inline" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

