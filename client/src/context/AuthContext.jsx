import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY_CLIENTES = 'clientesRegistrados'
const STORAGE_KEY_ADMINS = 'adminsRegistrados'

function getClientes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES)) || [] } catch { return [] }
}

function getAdmins() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_ADMINS)) || [] } catch { return [] }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (identifier, password) => {
    // Hardcoded admin
    if (identifier === 'admin@dance.com' && password === 'admin123') {
      const userData = { id: 1, email: identifier, nombres: 'Administrador', apellidos: '', rol: 'admin' }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'admin' }
    }

    // Admins from localStorage
    const admins = getAdmins()
    const adminMatch = admins.find(a => a.email === identifier && a.password === password)
    if (adminMatch) {
      const userData = { ...adminMatch }
      delete userData.password
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'admin' }
    }

    // Hardcoded instructor
    if (identifier === 'maria@dance.com' && password === 'instructor123') {
      const userData = { id: 1, email: identifier, nombres: 'María', apellidos: 'García', especialidad: 'Salsa', contacto: '999888777', rol: 'instructor' }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'instructor' }
    }

    // Hardcoded client (fallback demo)
    if ((identifier === '12345678' || identifier === '999111222') && password === 'cliente123') {
      const userData = {
        id: 2,
        nombres: 'Juan',
        apellidos: 'Pérez',
        dni: '12345678',
        telefono: '999111222',
        rol: 'cliente',
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'cliente' }
    }

    // Registered clients from localStorage
    const clientes = getClientes()
    const clienteMatch = clientes.find(c =>
      (c.dni === identifier || c.telefono === identifier) && c.password === password
    )
    if (clienteMatch) {
      const userData = { ...clienteMatch }
      delete userData.password
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'cliente' }
    }

    return { success: false, message: 'Credenciales incorrectas' }
  }

  const registerClient = (data) => {
    const clientes = getClientes()
    const nuevo = {
      id: Date.now(),
      nombres: data.nombres,
      apellidos: data.apellidos,
      dni: data.dni,
      telefono: data.telefono,
      password: data.password,
      rol: 'cliente',
    }
    clientes.push(nuevo)
    localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes))
    const userData = { ...nuevo }
    delete userData.password
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    return { success: true }
  }

  const registerAdmin = (data) => {
    const admins = getAdmins()
    const existe = admins.find(a => a.email === data.email)
    if (existe) return { success: false, message: 'Ya existe un administrador con ese email' }
    const nuevo = {
      id: Date.now(),
      email: data.email,
      nombres: data.nombres,
      apellidos: data.apellidos || '',
      password: data.password,
      rol: 'admin',
    }
    admins.push(nuevo)
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins))
    return { success: true }
  }

  const updateUser = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user
  const isAdmin = user?.rol === 'admin'
  const isCliente = user?.rol === 'cliente'
  const isInstructor = user?.rol === 'instructor'

  return (
    <AuthContext.Provider value={{ user, login, registerClient, registerAdmin, updateUser, logout, isAuthenticated, isAdmin, isCliente, isInstructor }}>
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
