import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AccesibilidadContext = createContext(null)

const STORAGE_KEY = 'movi-accesibilidad'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { textSize: 'normal', lineSpacing: 'normal', dyslexiaFont: false }
}

export function AccesibilidadProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    document.documentElement.dataset.textSize = settings.textSize
    document.documentElement.dataset.lineSpacing = settings.lineSpacing
    document.documentElement.dataset.dyslexia = String(settings.dyslexiaFont)
  }, [settings])

  const setTextSize = useCallback((textSize) => {
    setSettings(prev => {
      const next = { ...prev, textSize }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setLineSpacing = useCallback((lineSpacing) => {
    setSettings(prev => {
      const next = { ...prev, lineSpacing }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setDyslexiaFont = useCallback((dyslexiaFont) => {
    setSettings(prev => {
      const next = { ...prev, dyslexiaFont }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AccesibilidadContext.Provider value={{ ...settings, setTextSize, setLineSpacing, setDyslexiaFont }}>
      {children}
    </AccesibilidadContext.Provider>
  )
}

export function useAccesibilidad() {
  const context = useContext(AccesibilidadContext)
  if (!context) throw new Error('useAccesibilidad must be used within AccesibilidadProvider')
  return context
}
