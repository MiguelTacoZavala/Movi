import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Music, Clock, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import '../../App.css'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/cliente').then(res => {
      setData(res)
    }).catch(() => {
      setData(null)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  const prox = data?.proximaReserva
  const creditos = data?.creditosDisponibles ?? 0
  const populares = data?.clasesPopulares || []

  return (
    <div>
      <div className="client-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>
          ¡Hola, {user?.nombres}!
        </h2>
      </div>

      <div className="client-stats">
        <div className="client-stat-card">
          <div className="client-stat-value">{creditos}</div>
          <div className="client-stat-label">Créditos</div>
        </div>
        <div className="client-stat-card">
          <div className="client-stat-value">{populares.length}</div>
          <div className="client-stat-label">Clases disponibles</div>
        </div>
      </div>

      {prox && (
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

      {populares.length > 0 && (
        <div className="client-card">
          <div className="client-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Music size={20} className="icon-primary" />
              Clases con cupo disponible
            </div>
          </div>
          <div className="client-card-content">
            {populares.map((clase, idx) => (
              <div
                key={clase.id}
                className="clase-card-slim"
                style={{ animationDelay: `${idx * 0.08}s`, cursor: 'pointer' }}
                onClick={() => navigate(`/cliente/clases/${clase.id}`)}
              >
                <div className="clase-card-slim-time">
                  <span className="clase-time-text">{formatHoraAMPM(clase.horaInicio)}</span>
                </div>
                <div className="clase-card-slim-info">
                  <div className="clase-card-slim-name">{clase.categoria?.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    {clase.instructor?.nombres} {clase.instructor?.apellidos}
                  </div>
                </div>
                <div className="clase-card-slim-meta">
                  <div className="clase-card-slim-participants">
                    <Users size={13} />
                    <span>{clase.ocupacion}/{clase.capacidadMaxima}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
