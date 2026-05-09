import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Music, Calendar, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../common/Modal'
import Button from '../common/Button'
import '../../App.css'

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

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
        <Outlet />
      </main>

      <nav className="client-nav">
        <NavLink to="/cliente/dashboard" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/cliente/clases" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Music size={20} />
          <span>Clases</span>
        </NavLink>
        <NavLink to="/cliente/mis-reservas" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Reservas</span>
        </NavLink>
        <NavLink to="/cliente/perfil" className={({ isActive }) => `client-nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Perfil</span>
        </NavLink>
      </nav>
    </div>
  )
}
