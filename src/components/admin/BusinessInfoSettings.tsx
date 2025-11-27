import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface BusinessInfoSettingsProps {
  onClose: () => void
}

const BusinessInfoSettings = ({ onClose }: BusinessInfoSettingsProps) => {
  const [businessName, setBusinessName] = useState('Vovia')
  const [email, setEmail] = useState('support@vovia.com')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('businessInfo')
    if (saved) {
      const info = JSON.parse(saved)
      setBusinessName(info.businessName || 'Vovia')
      setEmail(info.email || 'support@vovia.com')
      setPhone(info.phone || '')
      setAddress(info.address || '')
      setCity(info.city || '')
      setState(info.state || '')
      setZipCode(info.zipCode || '')
      setCountry(info.country || '')
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const info = {
        businessName,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
      }
      localStorage.setItem('businessInfo', JSON.stringify(info))
      toast.success('Business information saved successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to save information')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Contact Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter business name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="support@example.com"
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Address
        </h3>
        <div className="space-y-4">
          <Input
            label="Street Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York"
            />
            <Input
              label="State/Province"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="NY"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ZIP/Postal Code"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="10001"
            />
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
            />
          </div>
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

export default BusinessInfoSettings

