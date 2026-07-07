import { useEffect, useState, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useHotkeys } from '../../hooks/useHotkeys'
import Sidebar from './Sidebar'
import Header from './Header'
import LoadingScreen from '../common/LoadingScreen'
import KeyboardShortcutsHelp from '../common/KeyboardShortcutsHelp'
import api from '../../services/api'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [preloadReady, setPreloadReady] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = 'light'
    api.preloadAdminData().then(() => setPreloadReady(true))
  }, [])

  const ADMIN_SHORTCUTS = [
    { keys: 'g d', handler: useCallback(() => navigate('/admin/dashboard'), [navigate]), description: 'Ir a Dashboard' },
    { keys: 'g c', handler: useCallback(() => navigate('/admin/clases'), [navigate]), description: 'Ir a Clases' },
    { keys: 'g h', handler: useCallback(() => navigate('/admin/horarios'), [navigate]), description: 'Ir a Horarios' },
    { keys: 'g i', handler: useCallback(() => navigate('/admin/instructores'), [navigate]), description: 'Ir a Instructores' },
    { keys: 'g a', handler: useCallback(() => navigate('/admin/categorias'), [navigate]), description: 'Ir a Categorías' },
    { keys: 'g e', handler: useCallback(() => navigate('/admin/clientes'), [navigate]), description: 'Ir a Clientes' },
    { keys: '?', handler: useCallback(() => setShowHelp(prev => !prev), []), description: 'Mostrar ayuda de teclado' },
  ]

  useHotkeys(ADMIN_SHORTCUTS, { enabled: !showHelp })

  return (
    <div className="admin-layout">
      {!preloadReady && <LoadingScreen />}
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

      {showHelp && (
        <KeyboardShortcutsHelp shortcuts={ADMIN_SHORTCUTS} onClose={() => setShowHelp(false)} />
      )}
    </div>
  )
}
