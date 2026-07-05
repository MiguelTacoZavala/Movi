import { useState, useCallback } from 'react'
import { ThemeContext } from './theme-context'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('movi-theme') || 'light')
  const [reducedMotion, setReducedMotion] = useState(
    () => localStorage.getItem('movi-reduced-motion') === 'true'
  )

  const toggleTheme = useCallback(() => {
    const html = document.documentElement
    html.classList.add('theme-transitioning')
    setTimeout(() => html.classList.remove('theme-transitioning'), 300)
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('movi-theme', next)
      return next
    })
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
