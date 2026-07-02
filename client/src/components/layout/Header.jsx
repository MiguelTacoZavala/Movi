import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import './Header.css'

export default function Header({ user, onMenuClick }) {
  // En móvil el header se auto-oculta al bajar y reaparece apenas se sube,
  // así la hamburguesa siempre está a un pequeño scroll de distancia sin tener
  // que volver hasta el tope. En escritorio queda siempre visible (sticky).
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const esMovil = window.matchMedia('(max-width: 1024px)')
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (!esMovil.matches || y < 80) {
          // Cerca del tope o en escritorio: siempre visible.
          setHidden(false)
        } else if (y > lastY.current + 6) {
          setHidden(true)   // bajando → ocultar
        } else if (y < lastY.current - 6) {
          setHidden(false)  // subiendo → mostrar de inmediato
        }
        lastY.current = y
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${hidden ? ' header--hidden' : ''}`}>
      <div className="header-left">
        <button
          type="button"
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
        <h1>Panel de Administración</h1>
      </div>
      <div className="header-actions">
        <span className="user-name">{user?.nombres || user?.nombre || ''}</span>
      </div>
    </header>
  )
}
