import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface ShippingSettingsProps {
  onClose: () => void
}

const ShippingSettings = ({ onClose }: ShippingSettingsProps) => {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0)
  const [standardShippingRate, setStandardShippingRate] = useState(5.99)
  const [expressShippingRate, setExpressShippingRate] = useState(15.99)
  const [enableFreeShipping, setEnableFreeShipping] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('shippingSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setFreeShippingThreshold(settings.freeShippingThreshold || 0)
      setStandardShippingRate(settings.standardShippingRate || 5.99)
      setExpressShippingRate(settings.expressShippingRate || 15.99)
      setEnableFreeShipping(settings.enableFreeShipping || false)
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const settings = {
        freeShippingThreshold,
        standardShippingRate,
        expressShippingRate,
        enableFreeShipping,
      }
      localStorage.setItem('shippingSettings', JSON.stringify(settings))
      toast.success('Shipping settings saved successfully!')
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
          Shipping Rates
        </h3>
        <div className="space-y-4">
          <Input
            label="Standard Shipping Rate ($)"
            type="number"
            step="0.01"
            value={standardShippingRate}
            onChange={(e) => setStandardShippingRate(Number(e.target.value))}
            min={0}
          />
          <Input
            label="Express Shipping Rate ($)"
            type="number"
            step="0.01"
            value={expressShippingRate}
            onChange={(e) => setExpressShippingRate(Number(e.target.value))}
            min={0}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Free Shipping
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Free Shipping
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Offer free shipping for orders above a certain amount
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableFreeShipping}
                onChange={(e) => setEnableFreeShipping(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {enableFreeShipping && (
            <Input
              label="Free Shipping Threshold ($)"
              type="number"
              step="0.01"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
              min={0}
              description="Orders above this amount qualify for free shipping"
            />
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

export default ShippingSettings

