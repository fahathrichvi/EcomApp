import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getCategories } from '../../services/categoryService'
import { Category } from '../../types'
import Button from '../common/Button'
import ThemeToggle from '../common/ThemeToggle'

const Header = () => {
  const { user, logout, isAdmin } = useAuth()
  const { getItemCount } = useCart()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [siteName, setSiteName] = useState('Vovia')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = () => {
      const savedName = localStorage.getItem('siteName')
      const savedLogo = localStorage.getItem('siteLogo')
      if (savedName) setSiteName(savedName)
      if (savedLogo) setSiteLogo(savedLogo)
    }

    loadSettings()

    // Listen for settings updates
    window.addEventListener('settingsUpdated', loadSettings)
    return () => window.removeEventListener('settingsUpdated', loadSettings)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 transition-colors duration-200">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left Side */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-8 w-auto object-contain" />
            ) : null}
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{siteName}</span>
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center space-x-6 flex-1 justify-center mx-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
              Our Store
            </Link>
            <div 
              className="relative group"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition flex items-center"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              >
                Categories <span className="ml-1">▼</span>
              </button>
              {categoriesDropdownOpen && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-2">
                  <Link
                    to="/shop"
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    All Categories
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/shop?category=${encodeURIComponent(category.id)}`}
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Product Here..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const searchTerm = (e.target as HTMLInputElement).value
                      if (searchTerm) {
                        navigate(`/shop?search=${encodeURIComponent(searchTerm)}`)
                      }
                    }
                  }}
                />
              </div>
            </div>
          </nav>

          {/* Right Side - Theme, Login, Sign Up */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <>
                <Link to="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                  <ShoppingCart className="h-6 w-6" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                    Admin
                  </Link>
                )}
                <ThemeToggle />
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition">
                  <User className="h-6 w-6" />
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              className="text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Our Store
              </Link>
              <div>
                <button
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center w-full"
                >
                  Categories <span className="ml-1">▼</span>
                </button>
                {categoriesDropdownOpen && categories.length > 0 && (
                  <div className="ml-4 mt-2 space-y-2">
                    <Link
                      to="/shop"
                      onClick={() => {
                        setCategoriesDropdownOpen(false)
                        setMobileMenuOpen(false)
                      }}
                      className="block text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      All Categories
                    </Link>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/shop?category=${encodeURIComponent(category.id)}`}
                        onClick={() => {
                          setCategoriesDropdownOpen(false)
                          setMobileMenuOpen(false)
                        }}
                        className="block text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {user ? (
                <>
                  <Link to="/orders" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Orders
                  </Link>
                  <Link to="/cart" className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart {getItemCount() > 0 && `(${getItemCount()})`}
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                      Admin
                    </Link>
                  )}
                  <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                    Profile
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

