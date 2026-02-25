import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Vovia</h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Your trusted online shopping destination
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <li>
                <Link to="/" className="hover:text-white dark:hover:text-gray-200 transition">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white dark:hover:text-gray-200 transition">Shop</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white dark:hover:text-gray-200 transition">Cart</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <li>
                <Link to="/orders" className="hover:text-white dark:hover:text-gray-200 transition">Orders</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white dark:hover:text-gray-200 transition">Account</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Email: support@vovia.com
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 dark:border-gray-800 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} Vovia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

