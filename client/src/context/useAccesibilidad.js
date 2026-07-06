import { useContext } from 'react'
import { AccesibilidadContext } from './accesibilidad-context'

export function useAccesibilidad() {
  const context = useContext(AccesibilidadContext)
  if (!context) throw new Error('useAccesibilidad must be used within AccesibilidadProvider')
  return context
}
