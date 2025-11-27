export type UserRole = 'customer' | 'admin' | 'super_admin' | 'manager' | 'inventory_manager' | 'sales_person'

export interface User {
  id: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  permissions?: string[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  costPrice?: number
  expenses?: number
  discount?: number
  images: string[]
  stock: number
  category: string
  categoryId: string
  variants?: ProductVariant[]
  promotionalBadge?: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

export type ExpenseType = 'product_purchase' | 'shipping' | 'marketing' | 'rent' | 'utilities' | 'salaries' | 'other'

export interface Expense {
  id: string
  type: ExpenseType
  description: string
  amount: number
  date: Date
  productId?: string
  productName?: string
  quantity?: number
  createdAt: Date
  createdBy: string
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  priceModifier?: number
  stock?: number
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  createdAt: Date
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  variant?: ProductVariant
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: OrderStatus
  shippingAddress: ShippingAddress
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export interface ActivityLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  timestamp: Date
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface AdminStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  lowStockItems: number
  pendingOrders: number
}

