import { useState, useEffect } from 'react'
import { Category } from '../../types'
import { createCategory, updateCategory } from '../../services/categoryService'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface CategoryFormProps {
  category?: Category | null
  onSuccess: () => void
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
      })
      setImageFile(null) // Reset image file when editing
    } else {
      // Reset form when creating new category
      setFormData({
        name: '',
        description: '',
        image: '',
      })
      setImageFile(null)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (category) {
        await updateCategory(category.id, formData, imageFile || undefined)
        toast.success('Category updated successfully!')
      } else {
        await createCategory(formData, imageFile || undefined)
        toast.success('Category created successfully!')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      // Preview the image
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({ ...formData, image: event.target.result as string })
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Category Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
        placeholder="e.g., Electronics, Clothing"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows={3}
          placeholder="Optional description for this category"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input"
        />
        {formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Category preview"
              className="h-32 w-32 object-cover rounded"
            />
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Upload an image for this category (optional)
        </p>
      </div>
      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {category ? 'Update Category' : 'Create Category'}
      </Button>
    </form>
  )
}

export default CategoryForm


