import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
  }, [])

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="main-content">
        <Header
          user={user}
          onLogout={logout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
