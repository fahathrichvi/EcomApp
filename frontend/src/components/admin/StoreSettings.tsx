import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface StoreSettingsProps {
  onClose: () => void
}

const StoreSettings = ({ onClose }: StoreSettingsProps) => {
  const [lowStockThreshold, setLowStockThreshold] = useState(10)
  const [enableStockTracking, setEnableStockTracking] = useState(true)
  const [allowBackorders, setAllowBackorders] = useState(false)
  const [productsPerPage, setProductsPerPage] = useState(12)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('storeSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setLowStockThreshold(settings.lowStockThreshold || 10)
      setEnableStockTracking(settings.enableStockTracking !== false)
      setAllowBackorders(settings.allowBackorders || false)
      setProductsPerPage(settings.productsPerPage || 12)
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const settings = {
        lowStockThreshold,
        enableStockTracking,
        allowBackorders,
        productsPerPage,
      }
      localStorage.setItem('storeSettings', JSON.stringify(settings))
      toast.success('Store settings saved successfully!')
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
          Inventory Management
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Stock Tracking
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track inventory levels for all products
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableStockTracking}
                onChange={(e) => setEnableStockTracking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <Input
            label="Low Stock Threshold"
            type="number"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            min={1}
            description="Alert when product stock falls below this number"
          />

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow Backorders
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Allow customers to purchase out-of-stock items
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowBackorders}
                onChange={(e) => setAllowBackorders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Display Settings
        </h3>
        <Input
          label="Products Per Page"
          type="number"
          value={productsPerPage}
          onChange={(e) => setProductsPerPage(Number(e.target.value))}
          min={1}
          max={100}
          description="Number of products to display per page in the shop"
        />
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

export default StoreSettings

