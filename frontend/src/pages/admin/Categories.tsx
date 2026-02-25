import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCategories, deleteCategory } from '../../services/categoryService'
import { Category } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'
import { formatDate } from '../../utils/helpers'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import CategoryForm from '../../components/admin/CategoryForm'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Folder } from 'lucide-react'

const AdminCategories = () => {
  const { user } = useAuth()
  const { canView, canCreate, canEdit, canDelete } = useAdmin()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Check if user has permission to view products (categories are part of products)
  if (!canView('products')) {
    return <Navigate to="/admin" replace />
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will not be deleted.')) return
    if (!user) return

    try {
      await deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    fetchCategories()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        {canCreate('products') && (
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="h-5 w-5 mr-2 inline" />
            Add Category
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : categories.length === 0 ? (
        <div className="card text-center py-12">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first category</p>
          {canCreate('products') && (
            <Button variant="primary" onClick={handleCreate}>
              <Plus className="h-5 w-5 mr-2 inline" />
              Add Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(category.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {canEdit('products') && (
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit category"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                )}
                {canDelete('products') && (
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete category"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="md"
      >
        <CategoryForm category={editingCategory} onSuccess={handleModalClose} />
      </Modal>
    </div>
  )
}

export default AdminCategories


