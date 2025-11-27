import { useState, useEffect } from 'react'
import Input from '../common/Input'
import Button from '../common/Button'
import toast from 'react-hot-toast'

interface SEOSettingsProps {
  onClose: () => void
}

const SEOSettings = ({ onClose }: SEOSettingsProps) => {
  const [metaTitle, setMetaTitle] = useState('Vovia - Online Shopping')
  const [metaDescription, setMetaDescription] = useState('Your trusted online shopping destination')
  const [metaKeywords, setMetaKeywords] = useState('online shopping, ecommerce, products')
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('seoSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setMetaTitle(settings.metaTitle || 'Vovia - Online Shopping')
      setMetaDescription(settings.metaDescription || 'Your trusted online shopping destination')
      setMetaKeywords(settings.metaKeywords || 'online shopping, ecommerce, products')
      setGoogleAnalyticsId(settings.googleAnalyticsId || '')
    }
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const settings = {
        metaTitle,
        metaDescription,
        metaKeywords,
        googleAnalyticsId,
      }
      localStorage.setItem('seoSettings', JSON.stringify(settings))
      
      // Update meta tags
      document.title = metaTitle
      const metaDesc = document.querySelector('meta[name="description"]')
      if (metaDesc) {
        metaDesc.setAttribute('content', metaDescription)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = metaDescription
        document.getElementsByTagName('head')[0].appendChild(meta)
      }

      toast.success('SEO settings saved successfully!')
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
          Meta Tags
        </h3>
        <div className="space-y-4">
          <Input
            label="Meta Title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter page title"
            description="Appears in browser tabs and search results (50-60 characters recommended)"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="input min-h-[100px] resize-none"
              placeholder="Enter meta description"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Appears in search results (150-160 characters recommended)
            </p>
          </div>
          <Input
            label="Meta Keywords"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            description="Comma-separated keywords for SEO"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Analytics
        </h3>
        <Input
          label="Google Analytics ID"
          value={googleAnalyticsId}
          onChange={(e) => setGoogleAnalyticsId(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          description="Your Google Analytics tracking ID"
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

export default SEOSettings

