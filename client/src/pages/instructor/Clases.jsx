import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Calendar, Clock, Users, ChevronRight } from 'lucide-react'
import api from '../../services/api'
import Alert from '../../components/common/Alert'
import { formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import '../../App.css'

export default function Clases() {
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.cachedGet('/instructores/mis-clases').then(res => {
      setClases(res.clases || [])
      setError(null)
    }).catch(() => {
      setClases([])
      setError('Tuvimos un problema al cargar tus clases. Por favor, intenta de nuevo en unos momentos.')
    }).finally(() => setLoading(false))
  }, [])

  const getEstadoBadge = (estado) => {
    const map = {
      PROGRAMADA: { label: 'Programada', className: 'status-info' },
      EN_CURSO: { label: 'En Curso', className: 'status-active' },
    }
    const cfg = map[estado] || { label: estado, className: '' }
    return <span className={`status-badge ${cfg.className}`} aria-label={`Estado: ${cfg.label}`}>{cfg.label}</span>
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  return (
    <div>
      <h2 className="client-section-title">Mis Clases</h2>
      <p className="client-section-subtitle">Clases programadas y en curso</p>

      {error && <Alert type="danger">{error}</Alert>}

      {clases.length === 0 ? (
        <div className="empty-state">
          <Music size={48} className="icon-muted" aria-hidden="true" />
          <h3>Sin clases</h3>
          <p>No tienes clases programadas</p>
        </div>
      ) : (
        clases.map((clase, idx) => (
          <div
            key={clase.id}
            className="client-card"
            style={{ marginBottom: '0.75rem', cursor: 'pointer', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}
            onClick={() => navigate(`/instructor/clases/${clase.id}`)}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de la clase de ${clase.categoria?.nombre || ''} programada para el ${clase.fecha} de ${formatHoraAMPM(clase.horaInicio)} a ${formatHoraAMPM(clase.horaFin)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/instructor/clases/${clase.id}`)
              }
            }}
          >
            <div className="client-card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {clase.categoria?.nombre}
                </h3>
                {getEstadoBadge(clase.estado)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} className="icon-muted" aria-hidden="true" />
                  {formatFechaBonita(clase.fecha)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} className="icon-muted" aria-hidden="true" />
                  {formatHoraAMPM(clase.horaInicio)} — {formatHoraAMPM(clase.horaFin)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} className="icon-muted" aria-hidden="true" />
                  {clase.inscritos}/{clase.capacidadMaxima} participantes
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Temática:</span>
                  <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{clase.tematica || 'LIBRE'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-medium)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Ver participantes <ChevronRight size={16} aria-hidden="true" />
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
