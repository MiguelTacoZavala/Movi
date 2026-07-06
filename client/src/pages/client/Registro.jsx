import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { User, Smartphone, CreditCard, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import Button from '../../components/common/Button'
import '../../App.css'

export default function Registro() {
  const { registerClient } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'light'
    return () => { document.documentElement.dataset.theme = prev }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const cleaned = ['nombres', 'apellidos'].includes(name) ? value.replace(/\d/g, '') : value
    setFormData({ ...formData, [name]: cleaned })
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!formData.nombres.trim()) errs.nombres = 'Ingresa tus nombres'
    if (!formData.apellidos.trim()) errs.apellidos = 'Ingresa tus apellidos'
    if (!/^\d{8}$/.test(formData.dni)) errs.dni = 'El DNI debe tener 8 dígitos'
    if (!/^\d{9}$/.test(formData.telefono)) errs.telefono = 'El teléfono debe tener 9 dígitos'
    if (formData.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres'
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccess('')
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await registerClient({
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        dni: formData.dni,
        telefono: formData.telefono,
        password: formData.password,
      })
      if (result.success) {
        setSuccess('¡Cuenta creada! Redirigiendo...')
        setTimeout(() => navigate('/cliente/dashboard'), 1500)
      }
    } catch (err) {
      setServerError(err.data?.error || err.message || 'No pudimos crear tu cuenta. Revisa tus datos e intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box" style={{ maxWidth: '420px' }}>
        <img src="/MOVI_LOGO.svg" alt="MOVI" className="login-logo" />

        <h1>Crear cuenta</h1>
        <p className="login-subtitle">Regístrate para reservar tus clases</p>

        <form onSubmit={handleSubmit} className="login-form">
          {serverError && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nombres">
              <User size={16} />
              Nombres
            </label>
            <input
              id="nombres"
              name="nombres"
              type="text"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ej: Juan Carlos"
              required
              autoComplete="given-name"
              style={{ width: '100%', padding: '14px 12px', fontSize: '1rem' }}
            />
            {errors.nombres && <span className="field-error">{errors.nombres}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">
              <User size={16} />
              Apellidos
            </label>
            <input
              id="apellidos"
              name="apellidos"
              type="text"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ej: Pérez López"
              required
              autoComplete="family-name"
              style={{ width: '100%', padding: '14px 12px', fontSize: '1rem' }}
            />
            {errors.apellidos && <span className="field-error">{errors.apellidos}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dni">
              <CreditCard size={16} />
              DNI <small style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(8 dígitos, solo números)</small>
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ej: 12345678"
              maxLength={8}
              required
              autoComplete="off"
              style={{ width: '100%', padding: '14px 12px', fontSize: '1rem' }}
            />
            {errors.dni && <span className="field-error">{errors.dni}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="telefono">
              <Smartphone size={16} />
              Teléfono <small style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(9 dígitos)</small>
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 999888777"
              maxLength={9}
              required
              autoComplete="tel"
              style={{ width: '100%', padding: '14px 12px', fontSize: '1rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem', display: 'block' }}>
              Se usará para pagos con Yape
            </span>
            {errors.telefono && <span className="field-error">{errors.telefono}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={16} />
              Contraseña <small style={{ fontWeight: 400, color: 'var(--gray-500)' }}>(mín. 6 caracteres)</small>
            </label>
            <div className="input-with-icon">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                className="password-input"
                style={{ width: '100%', padding: '14px 12px', fontSize: '1rem' }}
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
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <Lock size={16} />
              Confirmar contraseña
            </label>
            <div className="input-with-icon">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la contraseña"
                required
                autoComplete="new-password"
                className="password-input"
                style={{ width: '100%', padding: '14px 12px', fontSize: '1rem' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="password-toggle"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <Button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--primary-medium)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <ArrowLeft size={16} />
            ¿Ya tienes cuenta? Inicia sesión
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
