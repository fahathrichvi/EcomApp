import { useState, useEffect } from 'react'
import { Product, Category } from '../../types'
import { createProduct, updateProduct } from '../../services/productService'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/helpers'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onSuccess: () => void
}

const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    expenses: '',
    discount: '',
    stock: '',
    categoryId: '',
    images: [] as string[],
    promotionalBadge: '',
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        expenses: product.expenses?.toString() || '',
        discount: product.discount?.toString() || '',
        stock: product.stock.toString(),
        categoryId: product.categoryId,
        images: product.images || [],
        promotionalBadge: product.promotionalBadge || '',
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        expenses: formData.expenses ? parseFloat(formData.expenses) : undefined,
        discount: formData.discount && formData.discount.trim() !== '' ? parseFloat(formData.discount) : undefined,
        stock: parseInt(formData.stock),
        category: categories.find((c) => c.id === formData.categoryId)?.name || '',
        categoryId: formData.categoryId,
        images: formData.images,
        promotionalBadge: formData.promotionalBadge || undefined,
      }

      if (product) {
        await updateProduct(product.id, productData, imageFiles)
        toast.success('Product updated successfully!')
      } else {
        await createProduct(productData, imageFiles)
        toast.success('Product created successfully!')
      }

      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          rows={4}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Selling Price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cost Price (Buying Price)"
          type="number"
          step="0.01"
          min="0"
          value={formData.costPrice}
          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
          placeholder="Actual price you paid"
        />
        <Input
          label="Additional Expenses"
          type="number"
          step="0.01"
          min="0"
          value={formData.expenses}
          onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
          placeholder="Shipping, handling, etc."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Discount (%)"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.discount}
          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
          placeholder="e.g., 15 for 15% off (optional)"
        />
        {formData.discount && formData.price && (
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price
              </label>
              <div className="input bg-gray-50 dark:bg-gray-800">
                {formatCurrency(parseFloat(formData.price) * (1 - parseFloat(formData.discount) / 100))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="input"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Promotional Badge"
        value={formData.promotionalBadge}
        onChange={(e) => setFormData({ ...formData, promotionalBadge: e.target.value })}
        placeholder="e.g., BIG SAVING, 15% OFF, BEST PRICE, NEWLY ADDED (optional)"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="input"
        />
        {formData.images.length > 0 && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {formData.images.map((image, index) => (
              <img key={index} src={image} alt={`Product ${index + 1}`} className="h-20 w-20 object-cover rounded" />
            ))}
          </div>
        )}
      </div>
      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        {product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  )
}

export default ProductForm

