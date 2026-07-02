import { Menu } from 'lucide-react'
import './Header.css'

export default function Header({ user, onMenuClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="hamburger-btn"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
        <h1>Panel de Administración</h1>
      </div>
      <div className="header-actions">
        <span className="user-name">{user?.nombres || user?.nombre || ''}</span>
      </div>
    </header>
  )
}
