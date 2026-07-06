import { useState, useEffect } from 'react'
import { AuthContext } from './auth-context'
import api from '../services/api'

function fetchAuthUser() {
  return api.me().then(() => api.getUser())
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const token = api.getToken()
    if (token) {
      fetchAuthUser()
        .then(u => { if (mounted) setUser(u) })
        .catch(() => {
          api.logout()
          if (mounted) setUser(null)
        })
        .finally(() => { if (mounted) setLoading(false) })
    } else {
      setLoading(false) // eslint-disable-line react-hooks/set-state-in-effect
    }
    return () => { mounted = false }
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
