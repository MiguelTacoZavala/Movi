import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly, clienteOnly, instructorOnly }) {
  const { isAuthenticated, isAdmin, isCliente, isInstructor } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={isCliente ? '/cliente/dashboard' : '/instructor/dashboard'} replace />
  }

  if (clienteOnly && !isCliente) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/instructor/dashboard'} replace />
  }

  if (instructorOnly && !isInstructor) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/cliente/dashboard'} replace />
  }

  return children
}
