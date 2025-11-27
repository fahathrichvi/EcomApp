import api from './api'
import { Product } from '../types'

export const getProducts = async (
  categoryId?: string,
  searchTerm?: string
): Promise<{ products: Product[] }> => {
  try {
    const params: any = {}
    if (categoryId) params.categoryId = categoryId
    if (searchTerm) params.search = searchTerm
    
    const response = await api.get('/products', { params })
    const products = (response.data.products || []).map((product: any) => ({
      ...product,
      images: product.images.map((img: string) => 
        img.startsWith('http') ? img : `http://localhost:3001${img}`
      ),
    }))
    return { products }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch products')
  }
}

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${productId}`)
    const product = response.data
    return {
      ...product,
      images: product.images.map((img: string) => 
        img.startsWith('http') ? img : `http://localhost:3001${img}`
      ),
    }
  } catch (error: any) {
    if (error.response?.status === 404) return null
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch product')
  }
}

export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const response = await api.get('/products', { params: { search: searchTerm } })
    const products = response.data.products || []
    return products.map((product: any) => ({
      ...product,
      images: product.images.map((img: string) => 
        img.startsWith('http') ? img : `http://localhost:3001${img}`
      ),
    }))
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to search products')
  }
}

export const createProduct = async (
  product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
  images?: File[]
): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('name', product.name)
    formData.append('description', product.description)
    formData.append('price', product.price.toString())
    formData.append('stock', product.stock.toString())
    if (product.categoryId) formData.append('categoryId', product.categoryId)
    if (product.category) formData.append('category', product.category)
    if (product.costPrice !== undefined) formData.append('costPrice', product.costPrice.toString())
    if (product.expenses !== undefined) formData.append('expenses', product.expenses.toString())
    if (product.discount !== undefined) formData.append('discount', product.discount.toString())
    if (product.promotionalBadge) formData.append('promotionalBadge', product.promotionalBadge)
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image)
      })
    }
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data.id
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to create product')
  }
}

export const updateProduct = async (
  productId: string,
  updates: Partial<Product>,
  images?: File[]
): Promise<void> => {
  try {
    const formData = new FormData()
    if (updates.name) formData.append('name', updates.name)
    if (updates.description) formData.append('description', updates.description)
    if (updates.price !== undefined) formData.append('price', updates.price.toString())
    if (updates.stock !== undefined) formData.append('stock', updates.stock.toString())
    if (updates.categoryId) formData.append('categoryId', updates.categoryId)
    if (updates.category) formData.append('category', updates.category)
    if (updates.costPrice !== undefined) formData.append('costPrice', updates.costPrice.toString())
    if (updates.expenses !== undefined) formData.append('expenses', updates.expenses.toString())
    // Always send discount field - send the value if provided, otherwise send empty string
    if (updates.discount !== undefined && updates.discount !== null) {
      formData.append('discount', updates.discount.toString())
    } else {
      formData.append('discount', '')
    }
    if (updates.promotionalBadge !== undefined) formData.append('promotionalBadge', updates.promotionalBadge || '')
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image)
      })
    }
    
    await api.put(`/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to update product')
  }
}

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    await api.delete(`/products/${productId}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to delete product')
  }
}

export const uploadProductImage = async (file: File, productId: string): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('images', file)
    
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data.url
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to upload image')
  }
}

export const getLowStockProducts = async (threshold: number = 10): Promise<Product[]> => {
  try {
    const response = await api.get('/products/admin/low-stock', {
      params: { threshold },
    })
    const products = response.data || []
    return products.map((product: any) => ({
      ...product,
      images: product.images.map((img: string) => 
        img.startsWith('http') ? img : `http://localhost:3001${img}`
      ),
    }))
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch low stock products')
  }
}
