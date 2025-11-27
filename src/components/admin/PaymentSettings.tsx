import { useState, useEffect } from 'react'
import { CreditCard, Wallet, Building2 } from 'lucide-react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface PaymentSettingsProps {
  onClose: () => void
}

const PaymentSettings = ({ onClose }: PaymentSettingsProps) => {
  const [paymentMethods, setPaymentMethods] = useState({
    stripe: false,
    paypal: false,
    bankTransfer: false,
  })
  const [stripeKey, setStripeKey] = useState('')
  const [paypalClientId, setPaypalClientId] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('paymentSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setPaymentMethods(settings.paymentMethods || paymentMethods)
      setStripeKey(settings.stripeKey || '')
      setPaypalClientId(settings.paypalClientId || '')
      setBankAccount(settings.bankAccount || '')
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const settings = {
        paymentMethods,
        stripeKey,
        paypalClientId,
        bankAccount,
      }
      localStorage.setItem('paymentSettings', JSON.stringify(settings))
      toast.success('Payment settings saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Payment Methods
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Stripe
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Accept credit and debit cards
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods.stripe}
                onChange={(e) =>
                  setPaymentMethods({ ...paymentMethods, stripe: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {paymentMethods.stripe && (
            <Input
              label="Stripe Publishable Key"
              type="text"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="pk_test_..."
              description="Your Stripe publishable API key"
            />
          )}

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  PayPal
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Accept PayPal payments
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods.paypal}
                onChange={(e) =>
                  setPaymentMethods({ ...paymentMethods, paypal: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {paymentMethods.paypal && (
            <Input
              label="PayPal Client ID"
              type="text"
              value={paypalClientId}
              onChange={(e) => setPaypalClientId(e.target.value)}
              placeholder="Enter PayPal Client ID"
            />
          )}

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bank Transfer
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Direct bank transfer payments
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentMethods.bankTransfer}
                onChange={(e) =>
                  setPaymentMethods({ ...paymentMethods, bankTransfer: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {paymentMethods.bankTransfer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Account Details
              </label>
              <textarea
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="Enter bank account information"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} isLoading={loading}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default PaymentSettings

