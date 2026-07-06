import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import api from '../../services/api'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import '../../App.css'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'light'
    return () => { document.documentElement.dataset.theme = prev }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!identifier.trim() || !password) {
      setError('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(identifier.trim(), password)

      if (result.success) {
        setSuccess('¡Bienvenido! Redirigiendo...')

        setTimeout(() => {
          if (result.rol === 'admin') {
            api.preloadAdminData()
            navigate('/admin/dashboard')
          } else if (result.rol === 'cliente') {
            api.preloadClientData()
            navigate('/cliente/dashboard')
          } else if (result.rol === 'instructor') {
            navigate('/instructor/dashboard')
          }
        }, 1500)
      } else {
        setError('Credenciales incorrectas. Revisa tus datos e intenta de nuevo.')
      }
    } catch {
      setError('Ocurrió un error al iniciar sesión. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/MOVI_LOGO.svg" alt="MOVI" className="login-logo" />

        <h1>Bienvenido</h1>
        <p className="login-subtitle">Inicia sesión para acceder al sistema</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="identifier">
              <Mail size={16} />
              Usuario
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email, DNI o teléfono"
              required
              autoComplete="username"
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} />
              Contraseña
            </label>
            <div className="input-with-icon">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                autoComplete="current-password"
                className="password-input"
                style={{ width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/registro" style={{ color: 'var(--primary-medium)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>

        <div className="login-footer">
          <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2026 MOVI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
