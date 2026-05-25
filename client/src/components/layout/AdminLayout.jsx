import { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AdminLayout() {
  const { user, logout } = useAuth()

  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
  }, [])

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
