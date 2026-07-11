import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Music, Clock, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'
import { useHotkeys } from '../../hooks/useHotkeys'
import Modal from '../common/Modal'
import Button from '../common/Button'
import AyudaContextual from '../common/AyudaContextual'
import KeyboardShortcutsHelp from '../common/KeyboardShortcutsHelp'
import '../../App.css'

export default function InstructorLayout() {
  const { user, logout } = useAuth()
  const { theme, reducedMotion } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const reducedMotionRef = useRef(reducedMotion)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'movi-anim-state'
    document.head.appendChild(el)
    return () => { document.getElementById('movi-anim-state')?.remove() }
  }, [])

  useEffect(() => {
    reducedMotionRef.current = reducedMotion
    const el = document.getElementById('movi-anim-state')
    if (el) {
      el.textContent = reducedMotion
        ? '.clase-card-slim,.date-carousel,.back-btn,.category-card,.category-active-header{animation:none!important}'
        : ''
    }
  }, [reducedMotion])

  useLayoutEffect(() => {
    if (reducedMotionRef.current) return
    const el = document.querySelector('.page-fade-in')
    if (!el) return
    el.style.opacity = ''
    const anim = el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, easing: 'ease', fill: 'forwards' }
    )
    return () => anim.cancel()
  }, [location.pathname])

  const INSTRUCTOR_SHORTCUTS = [
    { keys: 'g i', handler: useCallback(() => navigate('/instructor/dashboard'), [navigate]), description: 'Ir a Inicio' },
    { keys: 'g c', handler: useCallback(() => navigate('/instructor/clases'), [navigate]), description: 'Ir a Clases' },
    { keys: 'g t', handler: useCallback(() => navigate('/instructor/historial'), [navigate]), description: 'Ir a Historial' },
    { keys: 'g p', handler: useCallback(() => navigate('/instructor/perfil'), [navigate]), description: 'Ir a Perfil' },
    { keys: '?', handler: useCallback(() => setShowHelp(prev => !prev), []), description: 'Mostrar ayuda de teclado' },
  ]

  useHotkeys(INSTRUCTOR_SHORTCUTS, { enabled: !showHelp })

  const handleLogout = () => {
    logout()
    setShowLogoutModal(false)
    navigate('/login')
  }

  return (
    <div className="client-layout">
      <header className="client-header">
        <div className="client-header-content">
          <h1 className="client-logo">MOVI</h1>
          <div className="client-user-menu">
            <div className="client-user-avatar">
              {user?.fotoUrl ? (
                <img src={user.fotoUrl} alt={user.nombres} />
              ) : (
                <User size={18} />
              )}
            </div>
            <span className="client-user-name">{user?.nombres}</span>
            <button onClick={() => setShowLogoutModal(true)} className="btn btn-ghost btn-small" title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="¿Cerrar sesión?">
        <p className="modal-subtitle">¿Estás seguro de que deseas cerrar sesión?</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </Modal>

      <main className="client-content">
        <div className="page-fade-in" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <nav className="client-nav">
        <NavLink to="/instructor/dashboard" aria-keyshortcuts="g i" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} aria-hidden="true" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/instructor/clases" aria-keyshortcuts="g c" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Music size={20} aria-hidden="true" />
          <span>Clases</span>
        </NavLink>
        <NavLink to="/instructor/historial" aria-keyshortcuts="g t" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={20} aria-hidden="true" />
          <span>Historial</span>
        </NavLink>
        <NavLink to="/instructor/perfil" aria-keyshortcuts="g p" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} aria-hidden="true" />
          <span>Perfil</span>
        </NavLink>
      </nav>

      <AyudaContextual role="instructor" />

      {showHelp && (
        <KeyboardShortcutsHelp shortcuts={INSTRUCTOR_SHORTCUTS} onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}
