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
import Registro from './pages/client/Registro'
import InstructorLayout from './components/layout/InstructorLayout'
import InstructorDashboard from './pages/instructor/Dashboard'
import InstructorHorarios from './pages/instructor/Horarios'
import InstructorClases from './pages/instructor/Clases'
import InstructorDetalleClase from './pages/instructor/DetalleClase'
import InstructorHistorial from './pages/instructor/Historial'
import InstructorPerfil from './pages/instructor/Perfil'
import ProtectedRoute from './components/common/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
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
          
          {/* Instructor Routes */}
          <Route path="/instructor" element={<ProtectedRoute instructorOnly><InstructorLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/instructor/dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="horarios" element={<InstructorHorarios />} />
            <Route path="clases" element={<InstructorClases />} />
            <Route path="clases/:id" element={<InstructorDetalleClase />} />
            <Route path="historial" element={<InstructorHistorial />} />
            <Route path="perfil" element={<InstructorPerfil />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
