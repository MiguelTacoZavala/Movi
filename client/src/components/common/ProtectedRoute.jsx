import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly, clienteOnly, instructorOnly }) {
  const { isAuthenticated, isAdmin, isCliente, isInstructor, loading } = useAuth()

  if (loading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={isCliente ? '/cliente/dashboard' : isInstructor ? '/instructor/dashboard' : '/login'} replace />
  }

  if (clienteOnly && !isCliente) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : isInstructor ? '/instructor/dashboard' : '/login'} replace />
  }

  if (instructorOnly && !isInstructor) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : isCliente ? '/cliente/dashboard' : '/login'} replace />
  }

  return children
}
