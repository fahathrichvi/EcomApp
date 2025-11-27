import { useState, useEffect } from 'react'
import { User, UserRole } from '../../types'
import { createUser, updateUserRole } from '../../services/authService'
import { ROLE_PERMISSIONS } from '../../config/constants'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface UserFormProps {
  user?: User | null
  onSuccess: () => void
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'customer' as UserRole,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Don't prefill password
        displayName: user.displayName,
        role: user.role,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (user) {
        // Update existing user
        const permissions = ROLE_PERMISSIONS[formData.role] || []
        await updateUserRole(user.id, formData.role, permissions)
        toast.success('User updated successfully!')
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }
        const permissions = ROLE_PERMISSIONS[formData.role] || []
        await createUser(
          formData.email,
          formData.password,
          formData.displayName,
          formData.role,
          permissions
        )
        toast.success('User created successfully!')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user')
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'inventory_manager', label: 'Inventory Manager' },
    { value: 'sales_person', label: 'Sales Person' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        disabled={!!user} // Don't allow email change for existing users
      />
      {!user && (
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={6}
        />
      )}
      <Input
        label="Display Name"
        value={formData.displayName}
        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          className="input"
          required
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Permissions: {ROLE_PERMISSIONS[formData.role]?.length || 0} permissions assigned
        </p>
      </div>
      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {user ? 'Update User' : 'Create User'}
      </Button>
    </form>
  )
}

export default UserForm


