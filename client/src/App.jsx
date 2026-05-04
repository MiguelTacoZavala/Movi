import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Clases from './pages/admin/Clases'
import Instructores from './pages/admin/Instructores'
import Salones from './pages/admin/Salones'
import Clientes from './pages/admin/Clientes'
import HistorialClases from './pages/admin/HistorialClases'
import ProtectedRoute from './components/common/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clases" element={<Clases />} />
            <Route path="instructores" element={<Instructores />} />
            <Route path="salones" element={<Salones />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="historial" element={<HistorialClases />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
