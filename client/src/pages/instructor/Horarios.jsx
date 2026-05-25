import { useMemo } from 'react'
import { Calendar, Clock, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockHorariosSemanales, formatHoraAMPM } from '../../data/mockData'
import '../../App.css'

const DIAS_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']

export default function Horarios() {
  const { user } = useAuth()

  const horarios = useMemo(() =>
    mockHorariosSemanales
      .filter(h => h.instructorId === user?.id && h.activo)
      .sort((a, b) => DIAS_ORDEN.indexOf(a.dia_semana) - DIAS_ORDEN.indexOf(b.dia_semana)),
    [user]
  )

  return (
    <div>
      <h2 className="client-section-title">Mis Horarios</h2>
      <p className="client-section-subtitle">Horarios semanales asignados</p>

      {horarios.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} className="icon-muted" />
          <h3>Sin horarios</h3>
          <p>No tienes horarios asignados</p>
        </div>
      ) : (
        horarios.map((h, idx) => (
          <div key={h.id} className="client-card" style={{ marginBottom: '0.75rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}>
            <div className="client-card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {h.categoriaNombre}
                </h3>
                <span className="status-badge status-info">{h.dia_semana.charAt(0) + h.dia_semana.slice(1).toLowerCase()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} className="icon-muted" />
                  {formatHoraAMPM(h.hora_inicio)} — {formatHoraAMPM(h.hora_fin)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} className="icon-muted" />
                  Capacidad: {h.capacidad_maxima} · Mínimo: {h.minimo_participantes}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
