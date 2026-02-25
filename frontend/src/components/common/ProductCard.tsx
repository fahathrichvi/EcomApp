import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../../types'
import { formatCurrency } from '../../utils/helpers'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [, setCurrencyUpdate] = useState(0)

  useEffect(() => {
    const handleCurrencyUpdate = () => {
      setCurrencyUpdate(prev => prev + 1)
    }
    window.addEventListener('currencyUpdated', handleCurrencyUpdate)
    return () => window.removeEventListener('currencyUpdated', handleCurrencyUpdate)
  }, [])
  return (
    <Link
      to={`/product/${product.id}`}
      className="card hover:shadow-lg transition-shadow duration-200"
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-48 w-full object-cover object-center"
          />
        ) : (
          <div className="h-48 w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2">
          {product.discount && product.discount > 0 ? (
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              </div>
            </div>
          ) : (
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(product.price)}
            </p>
          )}
          <div className="mt-1">
            {product.stock > 0 ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">In Stock</span>
            ) : (
              <span className="text-sm text-red-600 dark:text-red-400">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard


