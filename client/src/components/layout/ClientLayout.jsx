import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Music, Calendar, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import '../../App.css'

export default function ClientLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="client-layout">
      <header className="client-header">
        <div className="client-header-content">
          <h1 className="client-logo">MOVI</h1>
          <div className="client-user-menu">
            <span className="client-user-name">{user?.nombres}</span>
            <button onClick={logout} className="btn btn-ghost btn-small" title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

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
