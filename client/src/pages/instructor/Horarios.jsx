import { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, Users } from 'lucide-react'
import api from '../../services/api'
import { formatHoraAMPM, DIAS_SEMANA } from '../../utils/helpers'
import '../../App.css'

export default function Horarios() {
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/instructores/mis-horarios').then(res => {
      setHorarios(res.horarios || [])
    }).catch(() => {
      setHorarios([])
    }).finally(() => setLoading(false))
  }, [])

  const ordenados = useMemo(() =>
    [...horarios].sort((a, b) => DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana)),
    [horarios]
  )

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  return (
    <div>
      <h2 className="client-section-title">Mis Horarios</h2>
      <p className="client-section-subtitle">Horarios semanales asignados</p>

      {ordenados.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="icon-muted" />
          <h3>Sin horarios</h3>
          <p>No tienes horarios asignados</p>
        </div>
      ) : (
        ordenados.map((h, idx) => (
          <div key={h.id} className="client-card" style={{ marginBottom: '0.75rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}>
            <div className="client-card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {h.categoria?.nombre}
                </h3>
                <span className="status-badge status-info">{h.diaSemana?.charAt(0) + h.diaSemana?.slice(1).toLowerCase()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} className="icon-muted" />
                  {formatHoraAMPM(h.horaInicio)} — {formatHoraAMPM(h.horaFin)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} className="icon-muted" />
                  Capacidad: {h.capacidadMaxima} · Mínimo: {h.minimoParticipantes}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
