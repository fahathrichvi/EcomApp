import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import { Product, Category } from '../../types'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatCurrency } from '../../utils/helpers'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

const Home = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const [trendingTab, setTrendingTab] = useState<'new' | 'bestselling' | 'featured'>('new')
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [trendingStartIndex, setTrendingStartIndex] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResult, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])
        setProducts(productsResult.products)
        setCategories(categoriesData)
        
        // Set trending products based on tab
        updateTrendingProducts(productsResult.products, 'new')
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateTrendingProducts = (allProducts: Product[], tab: 'new' | 'bestselling' | 'featured') => {
    let filtered = [...allProducts]
    
    if (tab === 'new') {
      // New products (sorted by creation date, newest first)
      filtered = filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } else if (tab === 'featured') {
      // Featured products (first 8 products)
      filtered = filtered.slice(0, 8)
    } else {
      // Best selling (for now, use products with stock > 0, sorted by price)
      filtered = filtered.filter(p => p.stock > 0).sort((a, b) => b.price - a.price)
    }
    
    setTrendingProducts(filtered.slice(0, 12))
  }

  useEffect(() => {
    if (products.length > 0) {
      updateTrendingProducts(products, trendingTab)
    }
  }, [trendingTab, products])

  const nextHero = () => {
    if (products.length > 0) {
      setHeroIndex((prev) => (prev + 1) % Math.min(products.length, 3))
    }
  }

  const prevHero = () => {
    if (products.length > 0) {
      setHeroIndex((prev) => (prev - 1 + Math.min(products.length, 3)) % Math.min(products.length, 3))
    }
  }

  const nextTrending = () => {
    const maxIndex = Math.max(0, trendingProducts.length - 4)
    setTrendingStartIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevTrending = () => {
    setTrendingStartIndex((prev) => Math.max(prev - 1, 0))
  }

  // Get featured product for hero
  const featuredProduct = products.length > 0 ? products[heroIndex] : null
  const displayedTrending = trendingProducts.slice(trendingStartIndex, trendingStartIndex + 4)

  // Get products for promotional banners (first 6 products)
  const promotionalProducts = products.slice(0, 6)

  // Get category count for each category
  const getCategoryCount = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId).length
  }

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      {featuredProduct && (
        <section className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 py-16 mb-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {featuredProduct.name}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  Supercharged for pros.
                </p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {formatCurrency(featuredProduct.price)}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  From {formatCurrency(featuredProduct.price)} or {formatCurrency(featuredProduct.price / 24)}/mo. per month
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to={`/product/${featuredProduct.id}`}
                    className="text-primary-600 dark:text-primary-400 hover:underline text-lg inline-block text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="relative">
                {featuredProduct.images && featuredProduct.images.length > 0 && (
                  <div className="relative">
                    <img
                      src={featuredProduct.images[0]}
                      alt={featuredProduct.name}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                    {/* Carousel Dots */}
                    <div className="flex justify-center mt-4 space-x-2">
                      {Array.from({ length: Math.min(products.length, 3) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroIndex(i)}
                          className={`h-2 rounded-full transition ${
                            i === heroIndex ? 'w-8 bg-primary-600' : 'w-2 bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Navigation Arrows */}
          {products.length > 1 && (
            <>
              <button
                onClick={prevHero}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextHero}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Our Top Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Our Top Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-4">
            {categories.slice(0, 9).map((category) => {
              const count = getCategoryCount(category.id)
              return (
                <Link
                  key={category.id}
                  to={`/shop?category=${encodeURIComponent(category.id)}`}
                  className="card text-center hover:shadow-lg transition-shadow group"
                >
                  <div className="mb-3">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-16 h-16 mx-auto object-cover rounded-lg group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {count} {count === 1 ? 'item' : 'items'}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Promotional Banners */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotionalProducts.map((product, index) => {
              const banners = [
                { title: 'Love The Price.', discount: null },
                { title: 'Light On Price.', discount: null },
                { title: 'Five Bold Colors. $99 Each.', discount: null },
                { title: null, discount: null },
                { title: null, discount: null },
                { title: 'New Arrival.', discount: null },
              ]
              const banner = banners[index] || banners[0]
              // Use product discount if available, otherwise use banner discount
              const discount = product.discount || banner.discount
              const discountPrice = discount
                ? product.price * (1 - discount / 100)
                : product.price

              return (
                <div
                  key={product.id}
                  className="card overflow-hidden hover:shadow-xl transition-shadow relative"
                >
                  {product.promotionalBadge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-bold">
                        {product.promotionalBadge}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 p-6">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {product.name}
                      </h3>
                      {banner.title && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{banner.title}</p>
                      )}
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                        From {formatCurrency(discountPrice)}
                      </p>
                      <div className="mt-auto">
                        <Link
                          to={`/product/${product.id}`}
                          className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                        >
                          Learn More
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-32 object-contain"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Our Trending Products */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Our Trending Products
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            {(['new', 'bestselling', 'featured'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setTrendingTab(tab)
                  setTrendingStartIndex(0)
                }}
                className={`px-6 py-3 font-semibold transition ${
                  trendingTab === tab
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {tab === 'new'
                  ? 'New Products'
                  : tab === 'bestselling'
                  ? 'Best Selling'
                  : 'Featured Products'}
              </button>
            ))}
          </div>

          {/* Products Carousel */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedTrending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Navigation Arrows */}
            {trendingProducts.length > 4 && (
              <>
                <button
                  onClick={prevTrending}
                  disabled={trendingStartIndex === 0}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    trendingStartIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextTrending}
                  disabled={trendingStartIndex >= trendingProducts.length - 4}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    trendingStartIndex >= trendingProducts.length - 4
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
      </div>
    </div>
  )
}

export default Home
