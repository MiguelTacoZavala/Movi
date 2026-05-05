import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (identifier, password) => {
    // Admin login
    if (identifier === 'admin@dance.com' && password === 'admin123') {
      const userData = { id: 1, email: identifier, nombres: 'Administrador', apellidos: '', rol: 'admin' }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'admin' }
    }
    
    // Client login (can use DNI or telefono)
    if ((identifier === '12345678' || identifier === '999111222') && password === 'cliente123') {
      const userData = { 
        id: 2, 
        nombres: 'Juan', 
        apellidos: 'Pérez', 
        dni: '12345678', 
        telefono: '999111222', 
        rol: 'cliente' 
      }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, rol: 'cliente' }
    }
    
    return { success: false, message: 'Credenciales incorrectas' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAuthenticated = !!user
  
  const isAdmin = user?.rol === 'admin'
  const isCliente = user?.rol === 'cliente'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin, isCliente }}>
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
