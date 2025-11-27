export const formatCurrency = (amount: number, currency?: string): string => {
  const selectedCurrency = currency || localStorage.getItem('currency') || 'USD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: selectedCurrency,
  }).format(amount)
}

export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * (taxRate / 100)
}

export const getTaxRate = (): number => {
  const taxEnabled = localStorage.getItem('taxEnabled') === 'true'
  if (!taxEnabled) return 0
  const rate = localStorage.getItem('taxRate')
  return rate ? parseFloat(rate) : 0
}

export const isTaxEnabled = (): boolean => {
  return localStorage.getItem('taxEnabled') === 'true'
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const re = /^[\d\s\-\+\(\)]+$/
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}


