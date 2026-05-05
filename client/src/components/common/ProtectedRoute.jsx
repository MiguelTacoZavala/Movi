import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly, clienteOnly }) {
  const { isAuthenticated, isAdmin, isCliente } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/cliente/dashboard" replace />
  }

  if (clienteOnly && !isCliente) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}
