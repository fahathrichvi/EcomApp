import { useState, useEffect } from 'react'
import { Upload, X, Palette, Image as ImageIcon, DollarSign, Receipt } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface GeneralSettingsProps {
  onClose: () => void
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
]

const GeneralSettings = ({ onClose }: GeneralSettingsProps) => {
  const { theme, toggleTheme } = useTheme()
  const [siteName, setSiteName] = useState('Vovia')
  const [siteDescription, setSiteDescription] = useState('Your trusted online shopping destination')
  const [logo, setLogo] = useState<string | null>(null)
  const [favicon, setFavicon] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#0284c7')
  const [currency, setCurrency] = useState('USD')
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxRate, setTaxRate] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSiteName = localStorage.getItem('siteName')
    const savedSiteDescription = localStorage.getItem('siteDescription')
    const savedLogo = localStorage.getItem('siteLogo')
    const savedFavicon = localStorage.getItem('siteFavicon')
    const savedPrimaryColor = localStorage.getItem('primaryColor')
    const savedCurrency = localStorage.getItem('currency')
    const savedTaxEnabled = localStorage.getItem('taxEnabled')
    const savedTaxRate = localStorage.getItem('taxRate')

    if (savedSiteName) setSiteName(savedSiteName)
    if (savedSiteDescription) setSiteDescription(savedSiteDescription)
    if (savedLogo) setLogo(savedLogo)
    if (savedFavicon) setFavicon(savedFavicon)
    if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor)
    if (savedCurrency) setCurrency(savedCurrency)
    if (savedTaxEnabled) setTaxEnabled(savedTaxEnabled === 'true')
    if (savedTaxRate) setTaxRate(parseFloat(savedTaxRate))
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error('Favicon file size must be less than 500KB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFavicon(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to localStorage (in a real app, this would be saved to backend)
      localStorage.setItem('siteName', siteName)
      localStorage.setItem('siteDescription', siteDescription)
      if (logo) localStorage.setItem('siteLogo', logo)
      if (favicon) localStorage.setItem('siteFavicon', favicon)
      localStorage.setItem('primaryColor', primaryColor)
      localStorage.setItem('currency', currency)
      localStorage.setItem('taxEnabled', taxEnabled.toString())
      localStorage.setItem('taxRate', taxRate.toString())

      // Update document title
      document.title = `${siteName} - Online Shopping`

      // Update favicon if provided
      if (favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.getElementsByTagName('head')[0].appendChild(link)
        }
        link.href = favicon
      }

      // Dispatch event to update header and currency
      window.dispatchEvent(new Event('settingsUpdated'))
      window.dispatchEvent(new Event('currencyUpdated'))

      toast.success('Settings saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  theme === 'light'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Light
              </button>
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg border-2 transition ${
                  theme === 'dark'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Dark
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Current theme: {theme}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="input flex-1"
                placeholder="#0284c7"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will update your site's primary color scheme
            </p>
          </div>
        </div>
      </div>

      {/* Site Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Site Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Site Name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Enter your site name"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Site Description
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Enter your site description"
            />
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
          Logo
        </h3>
        <div className="space-y-4">
          {logo && (
            <div className="relative inline-block">
              <img
                src={logo}
                alt="Site logo"
                className="h-20 w-auto object-contain rounded border border-gray-300 dark:border-gray-600"
              />
              <button
                onClick={() => setLogo(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Logo
            </label>
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition">
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG up to 2MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
          Currency
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This currency will be used for all product prices and transactions
            </p>
          </div>
        </div>
      </div>

      {/* Tax Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
          Tax Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Tax System
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Apply tax to all orders and products
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={taxEnabled}
                onChange={(e) => setTaxEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-400 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {taxEnabled && (
            <div>
              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                description="Enter the tax rate as a percentage (e.g., 8.5 for 8.5%)"
              />
              {taxRate > 0 && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Example:</strong> A product priced at $100.00 will have a tax of{' '}
                    <strong>${(100 * (taxRate / 100)).toFixed(2)}</strong> (Total: $
                    {(100 + 100 * (taxRate / 100)).toFixed(2)})
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Favicon Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Favicon
        </h3>
        <div className="space-y-4">
          {favicon && (
            <div className="relative inline-block">
              <img
                src={favicon}
                alt="Favicon"
                className="h-16 w-16 object-contain rounded border border-gray-300 dark:border-gray-600"
              />
              <button
                onClick={() => setFavicon(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Favicon
            </label>
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition">
              <div className="text-center">
                <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  ICO, PNG up to 500KB (16x16 or 32x32 recommended)
                </p>
              </div>
              <input
                type="file"
                accept="image/*,.ico"
                onChange={handleFaviconUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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

export default GeneralSettings

