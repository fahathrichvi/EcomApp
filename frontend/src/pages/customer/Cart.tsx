import { useCart } from '../../context/CartContext'
import { formatCurrency, calculateTax, getTaxRate, isTaxEnabled } from '../../utils/helpers'
import Button from '../../components/common/Button'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

const Cart = () => {
  const { items, removeItem, updateQuantity, getTotal } = useCart()
  const navigate = useNavigate()
  
  const subtotal = getTotal()
  const taxEnabled = isTaxEnabled()
  const taxRate = getTaxRate()
  const tax = taxEnabled ? calculateTax(subtotal, taxRate) : 0
  const total = subtotal + tax

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products to get started!</p>
          <Link to="/shop">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card space-y-4">
            {items.map((item) => (
              <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                {item.product.images && item.product.images.length > 0 ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{item.product.name}</h3>
                  <p className="text-primary-600 dark:text-primary-400 font-bold">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-gray-900 dark:text-gray-100">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxEnabled && tax > 0 && (
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Tax ({taxRate}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full mb-2" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
            <Link to="/shop">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

