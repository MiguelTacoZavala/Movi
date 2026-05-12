import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AdminLayout from './components/layout/AdminLayout'
import ClientLayout from './components/layout/ClientLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Clases from './pages/admin/Clases'
import HorariosSemanales from './pages/admin/HorariosSemanales'
import Instructores from './pages/admin/Instructores'
import Categorias from './pages/admin/Categorias'
import Clientes from './pages/admin/Clientes'
import ClientDashboard from './pages/client/Dashboard'
import ClasesDisponibles from './pages/client/ClasesDisponibles'
import DetalleClase from './pages/client/DetalleClase'
import MisReservas from './pages/client/MisReservas'
import MiPerfil from './pages/client/MiPerfil'
import ProtectedRoute from './components/common/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clases" element={<Clases />} />
            <Route path="horarios" element={<HorariosSemanales />} />
            <Route path="instructores" element={<Instructores />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="clientes" element={<Clientes />} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/cliente" element={<ProtectedRoute clienteOnly><ClientLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/cliente/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="clases" element={<ClasesDisponibles />} />
            <Route path="clases/:id" element={<DetalleClase />} />
            <Route path="mis-reservas" element={<MisReservas />} />
            <Route path="perfil" element={<MiPerfil />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
