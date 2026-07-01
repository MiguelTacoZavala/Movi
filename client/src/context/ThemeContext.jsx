import { createContext, useContext, useState, useCallback } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [reducedMotion, setReducedMotion] = useState(
    () => localStorage.getItem('movi-reduced-motion') === 'true'
  )

  const toggleTheme = useCallback(() => {
    const html = document.documentElement
    html.classList.add('theme-transitioning')
    setTimeout(() => html.classList.remove('theme-transitioning'), 300)
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => {
      const next = !prev
      localStorage.setItem('movi-reduced-motion', String(next))
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, reducedMotion, toggleReducedMotion }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
