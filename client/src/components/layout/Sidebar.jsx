import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Music, Users, Building2, UserCircle, History, LogOut } from 'lucide-react'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/clases', label: 'Clases', icon: Music },
  { path: '/admin/instructores', label: 'Instructores', icon: Users },
  { path: '/admin/salones', label: 'Salones', icon: Building2 },
  { path: '/admin/clientes', label: 'Clientes', icon: UserCircle },
  { path: '/admin/historial', label: 'Historial', icon: History },
]

export default function Sidebar() {
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
        <NavLink
          to="/login"
          className=""
          onClick={() => localStorage.removeItem('user')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            padding: '0.875rem 0',
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
        </NavLink>
      </div>
    </div>
  )
}
