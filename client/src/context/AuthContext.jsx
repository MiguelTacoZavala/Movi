import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = api.getToken()
    if (token) {
      api.me()
        .then(() => setUser(api.getUser()))
        .catch(() => {
          api.logout()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (identifier, password) => {
    const data = await api.login(identifier, password)
    setUser(data.user)
    return { success: true, rol: data.user.rol }
  }

  const registerClient = async (data) => {
    const result = await api.register(data)
    setUser(result.user)
    return { success: true }
  }

  const registerAdmin = (data) => {
    const clientes = JSON.parse(localStorage.getItem('adminsRegistrados')) || []
    const existe = clientes.find(a => a.email === data.email)
    if (existe) return { success: false, message: 'Ya existe un administrador con ese email' }
    const nuevo = {
      id: Date.now(),
      email: data.email,
      nombres: data.nombres,
      apellidos: data.apellidos || '',
      password: data.password,
      rol: 'admin',
    }
    clientes.push(nuevo)
    localStorage.setItem('adminsRegistrados', JSON.stringify(clientes))
    return { success: true }
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    api.setUser(updated)
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin = user?.rol === 'admin'
  const isCliente = user?.rol === 'cliente'
  const isInstructor = user?.rol === 'instructor'

  return (
    <AuthContext.Provider value={{ user, login, registerClient, registerAdmin, updateUser, logout, isAuthenticated, isAdmin, isCliente, isInstructor, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
