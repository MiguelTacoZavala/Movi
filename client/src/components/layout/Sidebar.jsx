import { useNavigate, NavLink } from 'react-router-dom'
import { LayoutDashboard, Music, Users, BookOpen, Calendar, UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/clases', label: 'Clases', icon: Music },
  { path: '/admin/horarios', label: 'Horarios', icon: Calendar },
  { path: '/admin/instructores', label: 'Instructores', icon: Users },
  { path: '/admin/categorias', label: 'Categorías', icon: BookOpen },
  { path: '/admin/clientes', label: 'Clientes', icon: UserCircle },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
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
    </div>
  )
}
