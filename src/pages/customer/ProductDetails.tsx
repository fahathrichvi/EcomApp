import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct, getProducts } from '../../services/productService'
import { Product } from '../../types'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import ProductCard from '../../components/common/ProductCard'
import toast from 'react-hot-toast'
import { 
  ShoppingCart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  GitCompare,
  Facebook,
  Twitter,
  Mail,
  Share2
} from 'lucide-react'

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [recentStartIndex, setRecentStartIndex] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      try {
        const productData = await getProduct(id)
        setProduct(productData)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const result = await getProducts()
        // Get recent products excluding current product
        const recent = result.products
          .filter(p => p.id !== id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)
        setRecentProducts(recent)
      } catch (error) {
        console.error('Failed to fetch recent products:', error)
      }
    }
    fetchRecentProducts()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    
    if (product.stock < quantity) {
      toast.error('Not enough stock available')
      return
    }

    addItem({
      productId: product.id,
      product,
      quantity,
    })
    toast.success('Added to cart!')
  }

  const handleCompare = () => {
    toast('Compare feature coming soon!', { icon: 'ℹ️' })
  }

  const handleWishlist = () => {
    toast('Wishlist feature coming soon!', { icon: 'ℹ️' })
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = product?.name || ''
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
        break
      default:
        navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard!')
    }
  }

  // Generate SKU from product ID
  const productSKU = product ? `SKU-${product.id.slice(0, 8).toUpperCase()}` : ''

  // Calculate prices - product.price is the original price, calculate discounted price if discount exists
  const discountValue = product?.discount ? Number(product.discount) : 0
  const hasDiscount = discountValue > 0 && discountValue <= 100
  const originalPrice = product?.price ? Number(product.price) : 0
  const discountedPrice = hasDiscount && originalPrice > 0
    ? originalPrice * (1 - discountValue / 100)
    : null

  // Available colors (mock data - can be from product variants)
  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Silver']

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found</p>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    )
  }

  const displayedRecent = recentProducts.slice(recentStartIndex, recentStartIndex + 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary-600 dark:hover:text-primary-400">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images Section */}
        <div>
          <div className="relative mb-4">
            {hasDiscount && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {discountValue}% OFF
                </span>
              </div>
            )}
            {product.promotionalBadge && !hasDiscount && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {product.promotionalBadge}
                </span>
              </div>
            )}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-[500px] w-full object-contain"
                />
              ) : (
                <div className="h-[500px] w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  No Image
                </div>
              )}
            </div>
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === index 
                      ? 'border-primary-600 dark:border-primary-400' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div>
          <div className="mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {product.name}
          </h1>

          {/* Reviews */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">3 Reviews</span>
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Add Your Review
            </button>
          </div>

          {/* Availability */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                In Stock
              </span>
            ) : (
              <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            {hasDiscount && discountedPrice !== null && discountedPrice > 0 ? (
              <div>
                <div className="flex items-baseline space-x-3 mb-3">
                  <span className="text-2xl text-gray-400 dark:text-gray-500 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(discountedPrice)}
                  </span>
                  <span className="inline-block bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-sm font-medium">
                    {discountValue}% OFF
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Original Price:</span> <span className="line-through">{formatCurrency(originalPrice)}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Discounted Price:</span> <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(discountedPrice)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(originalPrice)}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Price: <span className="font-medium">{formatCurrency(originalPrice)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* SKU */}
          <div className="mb-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">SKU: </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{productSKU}</span>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Color
            </label>
            <div className="flex space-x-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition ${
                    selectedColor === color
                      ? 'border-primary-600 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quantity
            </label>
            <div className="flex items-center space-x-4 w-32">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-bold"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-bold"
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-3 text-lg flex items-center justify-center"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          {/* Compare and Wishlist */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleCompare}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <GitCompare className="h-5 w-5 mr-2" />
              Compare
            </button>
            <button
              onClick={handleWishlist}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              <Heart className="h-5 w-5 mr-2" />
              Wishlist
            </button>
          </div>

          {/* Social Sharing */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                title="Share on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition"
                title="Share on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('email')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition"
                title="Share via Email"
              >
                <Mail className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition"
                title="Copy Link"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-16">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab === 'description' ? 'Description' : tab === 'specs' ? 'Technical Specs' : 'Reviews'}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Text Content */}
          <div className="space-y-6">
            {activeTab === 'description' && (
              <>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Product Overview
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                      <span>High-quality materials and construction</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                      <span>Modern design and aesthetics</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                      <span>Durable and long-lasting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                      <span>Excellent value for money</span>
                    </li>
                  </ul>
                </div>
              </>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">SKU:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{productSKU}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Stock:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.stock} units</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Customer Reviews
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">John Doe</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">- Verified Purchase</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Great product! Very satisfied with my purchase. Highly recommend!
                      </p>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-4">
                          {[1, 2, 3, 4].map((star) => (
                            <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                          <Star className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Jane Smith</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Good quality product. Fast shipping and excellent customer service.
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => toast('Review form coming soon!', { icon: 'ℹ️' })}>
                  Add Your Review
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Images (for description tab) */}
          {activeTab === 'description' && product.images && product.images.length > 0 && (
            <div className="space-y-4">
              {product.images.slice(0, 2).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} detail ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Products Section */}
      {recentProducts.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Recent Products
            </h2>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedRecent.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Navigation Arrows */}
            {recentProducts.length > 4 && (
              <>
                <button
                  onClick={() => setRecentStartIndex(Math.max(0, recentStartIndex - 1))}
                  disabled={recentStartIndex === 0}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                    recentStartIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setRecentStartIndex(Math.min(recentProducts.length - 4, recentStartIndex + 1))}
                  disabled={recentStartIndex >= recentProducts.length - 4}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                    recentStartIndex >= recentProducts.length - 4
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetails
