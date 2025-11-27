import api from './api'
import { Category } from '../types'

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories')
    return response.data.map((category: any) => ({
      ...category,
      image: category.image 
        ? (category.image.startsWith('http') ? category.image : `http://localhost:3001${category.image}`)
        : category.image,
    }))
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch categories')
  }
}

export const getCategory = async (categoryId: string): Promise<Category | null> => {
  try {
    const response = await api.get(`/categories/${categoryId}`)
    const category = response.data
    return {
      ...category,
      image: category.image 
        ? (category.image.startsWith('http') ? category.image : `http://localhost:3001${category.image}`)
        : category.image,
    }
  } catch (error: any) {
    if (error.response?.status === 404) return null
    throw new Error(error.response?.data?.error || error.message || 'Failed to fetch category')
  }
}

export const createCategory = async (
  category: Omit<Category, 'id' | 'createdAt'>,
  imageFile?: File
): Promise<Category> => {
  try {
    const formData = new FormData()
    formData.append('name', category.name)
    if (category.description) formData.append('description', category.description)
    if (imageFile) {
      formData.append('image', imageFile)
    } else if (category.image) {
      formData.append('imageUrl', category.image)
    }
    
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const category = response.data
    return {
      ...category,
      image: category.image 
        ? (category.image.startsWith('http') ? category.image : `http://localhost:3001${category.image}`)
        : category.image,
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to create category')
  }
}

export const updateCategory = async (
  categoryId: string,
  updates: Partial<Category>,
  imageFile?: File
): Promise<void> => {
  try {
    const formData = new FormData()
    if (updates.name) formData.append('name', updates.name)
    if (updates.description !== undefined) formData.append('description', updates.description || '')
    if (imageFile) {
      formData.append('image', imageFile)
    } else if (updates.image !== undefined) {
      // If image is a full URL, extract just the path
      let imagePath = updates.image || ''
      if (imagePath.startsWith('http://localhost:3001')) {
        imagePath = imagePath.replace('http://localhost:3001', '')
      }
      formData.append('imageUrl', imagePath)
    }
    
    await api.put(`/categories/${categoryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to update category')
  }
}

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await api.delete(`/categories/${categoryId}`)
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Failed to delete category')
  }
}
