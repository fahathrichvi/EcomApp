import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const DEFAULT_PRIMARY_COLOR = '#0284c7'

const applyPrimaryColorToCSSVars = (color: string) => {
  const root = window.document.documentElement
  root.style.setProperty('--primary-color', color)
  // For simplicity we use the same base color for the main primary shades
  root.style.setProperty('--primary-500', color)
  root.style.setProperty('--primary-600', color)
  root.style.setProperty('--primary-700', color)
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      return savedTheme
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  const [primaryColor, setPrimaryColorState] = useState<string>(() => {
    const saved = localStorage.getItem('primaryColor')
    return saved || DEFAULT_PRIMARY_COLOR
  })

  // Apply theme classes
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Apply primary color CSS variables
  useEffect(() => {
    applyPrimaryColorToCSSVars(primaryColor)
  }, [primaryColor])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color)
    // Also persist immediately so it's available on next load
    localStorage.setItem('primaryColor', color)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
