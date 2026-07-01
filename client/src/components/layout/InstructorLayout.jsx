import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Music, Clock, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Modal from '../common/Modal'
import Button from '../common/Button'
import AyudaContextual from '../common/AyudaContextual'
import '../../App.css'

export default function InstructorLayout() {
  const { user, logout } = useAuth()
  const { theme, reducedMotion } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? 'true' : 'false'
  }, [reducedMotion])

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
            <span className="client-user-name">{user?.nombres}</span>
            <button onClick={() => setShowLogoutModal(true)} className="btn btn-ghost btn-small" title="Cerrar sesión">
              <LogOut size={18} />
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
        <NavLink to="/instructor/dashboard" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/instructor/horarios" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Horarios</span>
        </NavLink>
        <NavLink to="/instructor/clases" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Music size={20} />
          <span>Clases</span>
        </NavLink>
        <NavLink to="/instructor/historial" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={20} />
          <span>Historial</span>
        </NavLink>
        <NavLink to="/instructor/perfil" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Perfil</span>
        </NavLink>
      </nav>

      <AyudaContextual role="instructor" />
    </div>
  )
}
