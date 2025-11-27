import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { 
  Palette, 
  Store, 
  Truck, 
  CreditCard, 
  Search, 
  Building2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import GeneralSettings from '../../components/admin/GeneralSettings'
import StoreSettings from '../../components/admin/StoreSettings'
import ShippingSettings from '../../components/admin/ShippingSettings'
import PaymentSettings from '../../components/admin/PaymentSettings'
import SEOSettings from '../../components/admin/SEOSettings'
import BusinessInfoSettings from '../../components/admin/BusinessInfoSettings'
import Modal from '../../components/common/Modal'

interface SettingCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const AdminSettings = () => {
  const { user } = useAuth()
  const [activeSetting, setActiveSetting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Only super admin can access settings
  if (user?.role !== 'super_admin') {
    return <Navigate to="/admin" replace />
  }

  const settings: SettingCard[] = [
    {
      id: 'general',
      title: 'General Settings',
      description: 'Customize your site theme, name, logo, favicon and overall appearance.',
      icon: Palette,
    },
    {
      id: 'store',
      title: 'Store Products & Inventory',
      description: 'Manage store display and inventory settings.',
      icon: Store,
    },
    {
      id: 'shipping',
      title: 'Shipping, Delivery & Fulfillment',
      description: 'Set your shipping, delivery, and pickup rates.',
      icon: Truck,
    },
    {
      id: 'payment',
      title: 'Accept Payments',
      description: 'Choose the way you get paid by customers.',
      icon: CreditCard,
    },
    {
      id: 'seo',
      title: 'SEO Settings',
      description: 'Customize your pages and meta tags for SEO and set your site preferences.',
      icon: Search,
    },
    {
      id: 'business',
      title: 'Business Info',
      description: 'Set your business name, logo, location and contact info.',
      icon: Building2,
    },
  ]

  const filteredSettings = settings.filter(setting =>
    setting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCloseModal = () => {
    setActiveSetting(null)
  }

  const renderSettingContent = () => {
    switch (activeSetting) {
      case 'general':
        return <GeneralSettings onClose={handleCloseModal} />
      case 'store':
        return <StoreSettings onClose={handleCloseModal} />
      case 'shipping':
        return <ShippingSettings onClose={handleCloseModal} />
      case 'payment':
        return <PaymentSettings onClose={handleCloseModal} />
      case 'seo':
        return <SEOSettings onClose={handleCloseModal} />
      case 'business':
        return <BusinessInfoSettings onClose={handleCloseModal} />
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search settings"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Settings Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">GENERAL</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSettings.map((setting) => {
            const Icon = setting.icon
            return (
              <button
                key={setting.id}
                onClick={() => setActiveSetting(setting.id)}
                className="card text-left hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {setting.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {setting.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={activeSetting !== null}
        onClose={handleCloseModal}
        title={settings.find(s => s.id === activeSetting)?.title || 'Settings'}
        size="lg"
      >
        {renderSettingContent()}
      </Modal>
    </div>
  )
}

export default AdminSettings
