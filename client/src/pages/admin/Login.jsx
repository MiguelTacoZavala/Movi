import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Button from '../../components/common/Button'
import '../../App.css'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
 
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
 
    if (!identifier || !password) {
      setError('Por favor complete todos los campos')
      return
    }
 
    const result = login(identifier, password)
    if (result.success) {
      if (result.rol === 'admin') {
        navigate('/admin/dashboard')
      } else if (result.rol === 'cliente') {
        navigate('/cliente/dashboard')
      }
    } else {
      setError(result.message || 'Credenciales incorrectas')
    }
  }
 
  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/MOVI_LOGO.svg" alt="MOVI" className="login-logo" />
         
        <h1>Bienvenido a MOVI</h1>
        <p>Inicia sesión para acceder al sistema</p>
 
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">
              <Mail size={16} />
              Email / DNI / Teléfono
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@dance.com o 12345678"
                required
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="password">
              <Lock size={16} />
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {error}
            </div>
          )}

          <Button type="submit" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', gap: '0.5rem' }}>
            <LogIn size={18} />
            Iniciar Sesión
          </Button>
        </form>

        <div className="login-footer">
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2026 MOVI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
