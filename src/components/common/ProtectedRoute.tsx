import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireSuperAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && user.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  // Allow all staff roles: admin, super_admin, manager, inventory_manager, sales_person
  if (requireAdmin) {
    const staffRoles = ['admin', 'super_admin', 'manager', 'inventory_manager', 'sales_person']
    if (!staffRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute

