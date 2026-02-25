import { Permission } from '../types'

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  INVENTORY_MANAGER: 'inventory_manager',
  SALES_PERSON: 'sales_person',
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export const PERMISSIONS: Permission[] = [
  {
    id: 'products.view',
    name: 'View Products',
    description: 'View products list',
    resource: 'products',
    action: 'view',
  },
  {
    id: 'products.create',
    name: 'Create Products',
    description: 'Create new products',
    resource: 'products',
    action: 'create',
  },
  {
    id: 'products.edit',
    name: 'Edit Products',
    description: 'Edit existing products',
    resource: 'products',
    action: 'edit',
  },
  {
    id: 'products.delete',
    name: 'Delete Products',
    description: 'Delete products',
    resource: 'products',
    action: 'delete',
  },
  {
    id: 'orders.view',
    name: 'View Orders',
    description: 'View customer orders',
    resource: 'orders',
    action: 'view',
  },
  {
    id: 'orders.edit',
    name: 'Edit Orders',
    description: 'Update order status',
    resource: 'orders',
    action: 'edit',
  },
  {
    id: 'users.view',
    name: 'View Users',
    description: 'View user list',
    resource: 'users',
    action: 'view',
  },
  {
    id: 'users.create',
    name: 'Create Users',
    description: 'Create new users',
    resource: 'users',
    action: 'create',
  },
  {
    id: 'users.edit',
    name: 'Edit Users',
    description: 'Edit user information',
    resource: 'users',
    action: 'edit',
  },
  {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Delete users',
    resource: 'users',
    action: 'delete',
  },
  {
    id: 'analytics.view',
    name: 'View Analytics',
    description: 'View dashboard analytics',
    resource: 'analytics',
    action: 'view',
  },
]

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map(p => p.id),
  admin: [
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'orders.view',
    'orders.edit',
    'users.view',
    'users.edit',
    'users.create',
    'analytics.view',
  ],
  manager: [
    'products.view',
    'products.edit',
    'orders.view',
    'orders.edit',
    'analytics.view',
  ],
  inventory_manager: [
    'products.view',
    'products.create',
    'products.edit',
    'products.delete',
    'analytics.view',
  ],
  sales_person: [
    'products.view',
    'orders.view',
    'orders.edit',
    'users.view',
    'analytics.view',
  ],
}

export const LOW_STOCK_THRESHOLD = 10

