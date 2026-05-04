import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import './Header.css'

export default function Header({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <header className="header">
      <h1>Panel de Administración</h1>
      <div className="header-actions">
        <span className="user-name">{user?.nombre}</span>
        <Button variant="logout" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>
    </header>
  )
}
