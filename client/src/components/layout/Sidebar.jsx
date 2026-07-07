import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, Music, Users, BookOpen, Calendar, UserCircle, LogOut, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Alert from '../common/Alert'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'g d' },
  { path: '/admin/clases', label: 'Clases', icon: Music, shortcut: 'g c' },
  { path: '/admin/horarios', label: 'Horarios', icon: Calendar, shortcut: 'g h' },
  { path: '/admin/instructores', label: 'Instructores', icon: Users, shortcut: 'g i' },
  { path: '/admin/categorias', label: 'Categorías', icon: BookOpen, shortcut: 'g a' },
  { path: '/admin/clientes', label: 'Clientes', icon: UserCircle, shortcut: 'g e' },
]

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleLogout = () => {
    setConfirmOpen(true)
  }

  const confirmLogout = () => {
    setConfirmOpen(false)
    onClose()
    logout()
    navigate('/login')
  }

  return (
    <div className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-header">
        <img src="/MOVI_LOGO.svg" alt="MOVI" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  aria-keyshortcuts={item.shortcut}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span className="menu-icon">
                    <Icon size={20} />
                  </span>
                  {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'rgba(255,255,255,0.8)',
            background: 'none',
            border: 'none',
            textDecoration: 'none',
            padding: '0.875rem 0',
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--white)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.paddingLeft = '0.5rem'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.paddingLeft = '0'
          }}
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cerrar Sesión">
        <Alert type="warning">
          <AlertTriangle size={18} />
          <span>¿Estás seguro que deseas cerrar sesión?</span>
        </Alert>
        <div className="modal-actions" style={{ marginTop: '1rem' }}>
          <Button onClick={confirmLogout}>Sí, cerrar</Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  )
}
