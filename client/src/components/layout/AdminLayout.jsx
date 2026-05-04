import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header user={user} onLogout={logout} />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
