import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import Button from '../../components/common/Button'
import '../../App.css'

const DOT_COLORS = [
  '#E06C75', '#61AFEF', '#98C379', '#E5C07B', '#C678DD',
  '#56B6C2', '#D19A66', '#7EC8E3', '#B392F0', '#9ECBFF',
]

function getDotColor(catId) {
  return DOT_COLORS[(catId || 0) % DOT_COLORS.length]
}

function getBarClass(pct) {
  if (pct >= 90) return 'hot'
  if (pct >= 75) return 'warm'
  return 'safe'
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargar = useCallback(() => {
    setLoading(true)
    setError('')
    api.cachedGet('/dashboard/cliente').then(res => {
      setData(res)
    }).catch(() => {
      setData(null)
      setError('No pudimos cargar tu dashboard. Revisa tu conexión.')
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [])

  const prox = data?.proximaReserva
  const creditos = data?.creditosDisponibles ?? 0
  const inscripciones = data?.inscripcionesProximas ?? 0
  const clases = useMemo(() => (data?.proximasClases || []).slice(0, 3), [data])

  const grupos = useMemo(() => {
    const map = {}
    clases.forEach(c => {
      if (!map[c.fecha]) map[c.fecha] = []
      map[c.fecha].push(c)
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [clases])

  if (error) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} className="icon-muted" />
        <h3>No pudimos cargar tus datos</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{error}</p>
        <Button onClick={cargar} style={{ marginTop: '1rem' }}>Reintentar</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="client-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>
          ¡Hola, {user?.nombres}!
        </h2>
      </div>

      <div className="client-stats">
        <div className="client-stat-card">
          {data ? (
            <div className="client-stat-value">{creditos}</div>
          ) : (
            <div className="skeleton skeleton-inline" style={{ width: 40, height: 32, margin: '0 auto' }} />
          )}
          <div className="client-stat-label">Créditos</div>
        </div>
        <div className="client-stat-card">
          {data ? (
            <div className="client-stat-value">{inscripciones}</div>
          ) : (
            <div className="skeleton skeleton-inline" style={{ width: 40, height: 32, margin: '0 auto' }} />
          )}
          <div className="client-stat-label">Inscripciones</div>
        </div>
      </div>

      {loading && !data && (
        <>
          <div className="client-card">
            <div className="client-card-title">
              <Calendar size={20} className="icon-primary" />
              Tu próxima clase
            </div>
            <div className="client-card-content">
              <div className="skeleton" style={{ width: '60%', height: 20, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '80%', height: 16, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '70%', height: 16, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '50%', height: 16 }} />
            </div>
          </div>
          <div className="client-card">
            <div className="client-card-title">
              <Calendar size={20} className="icon-primary" />
              Clases disponibles
            </div>
            <div className="client-card-content">
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <div className="skeleton" style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '30%', height: 12, marginBottom: 6 }} />
                    <div className="skeleton" style={{ width: '50%', height: 10, marginBottom: 4 }} />
                    <div className="skeleton" style={{ width: '100%', height: 5, marginBottom: 4 }} />
                    <div className="skeleton" style={{ width: '25%', height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {data && prox && (
        <div className="client-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="client-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} className="icon-primary" />
              Tu próxima clase
            </div>
          </div>
          <div className="client-card-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              {prox.clase?.categoria?.nombre || 'Clase'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} className="icon-muted" />
                {formatFechaBonita(prox.clase.fecha)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} className="icon-muted" />
                {formatHoraAMPM(prox.clase.horaInicio)} - {formatHoraAMPM(prox.clase.horaFin)}
              </div>
              {prox.clase?.instructor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} className="icon-muted" />
                  {prox.clase.instructor.nombres} {prox.clase.instructor.apellidos}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {data && grupos.length > 0 && (
        <div className="client-card">
          <div className="client-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} className="icon-primary" />
              Clases disponibles
            </div>
          </div>
          <div className="client-card-content">
            {grupos.map(([fecha, claseList]) => (
              <div key={fecha} className="proximas-day-group">
                <div className="proximas-day-label">{formatFechaBonita(fecha)}</div>
                {claseList.map(c => {
                  const pct = c.capacidadMaxima > 0 ? (c.ocupacion / c.capacidadMaxima) * 100 : 0
                  return (
                    <div
                      key={c.id}
                      className="proxima-clase-card"
                      onClick={() => navigate(`/cliente/clases/${c.id}`)}
                    >
                      <span
                        className="proxima-clase-dot"
                        style={{ background: getDotColor(c.categoria?.id) }}
                      />
                      <div className="proxima-clase-body">
                        <div className="proxima-clase-name">{c.categoria?.nombre || 'Clase'}</div>
                        <div className="proxima-clase-instructor">
                          {c.instructor?.nombres} {c.instructor?.apellidos}
                        </div>
                        <div className="proxima-clase-time">
                          <Clock size={12} />
                          {formatHoraAMPM(c.horaInicio)} - {formatHoraAMPM(c.horaFin)}
                        </div>
                        <div className="proxima-clase-bar-track">
                          <div
                            className={`proxima-clase-bar-fill ${getBarClass(pct)}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="proxima-clase-ocupacion-text">
                          {c.ocupacion}/{c.capacidadMaxima} ocupados
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
