import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Calendar, Clock, Users, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockClasesGeneradas, formatHoraAMPM } from '../../data/mockData'
import '../../App.css'

export default function Clases() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const clases = useMemo(() =>
    mockClasesGeneradas
      .filter(c => c.instructorId === user?.id && c.estado !== 'FINALIZADA' && c.estado !== 'CANCELADA')
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio)),
    [user]
  )

  const getEstadoBadge = (estado) => {
    const map = {
      PROGRAMADA: { label: 'Programada', className: 'status-info' },
      EN_CURSO: { label: 'En Curso', className: 'status-active' },
    }
    const cfg = map[estado] || { label: estado, className: '' }
    return <span className={`status-badge ${cfg.className}`}>{cfg.label}</span>
  }

  return (
    <div>
      <h2 className="client-section-title">Mis Clases</h2>
      <p className="client-section-subtitle">Clases programadas y en curso</p>

      {clases.length === 0 ? (
        <div className="empty-state">
          <Music size={48} className="icon-muted" />
          <h3>Sin clases</h3>
          <p>No tienes clases programadas</p>
        </div>
      ) : (
        clases.map(clase => (
          <div
            key={clase.id}
            className="client-card"
            style={{ marginBottom: '0.75rem', cursor: 'pointer' }}
            onClick={() => navigate(`/instructor/clases/${clase.id}`)}
          >
            <div className="client-card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {clase.categoria}
                </h3>
                {getEstadoBadge(clase.estado)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} className="icon-muted" />
                  {clase.fecha}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} className="icon-muted" />
                  {formatHoraAMPM(clase.hora_inicio)} — {formatHoraAMPM(clase.hora_fin)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} className="icon-muted" />
                  {clase.inscritos}/{clase.capacidad_maxima} participantes
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--gray-500)' }}>Temática:</span>
                  <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{clase.tematica || 'LIBRE'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-medium)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Ver participantes <ChevronRight size={16} />
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
