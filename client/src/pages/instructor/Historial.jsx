import { useMemo } from 'react'
import { Clock, Calendar, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockClasesGeneradas, formatHoraAMPM } from '../../data/mockData'
import '../../App.css'

export default function Historial() {
  const { user } = useAuth()

  const historial = useMemo(() =>
    mockClasesGeneradas
      .filter(c => c.instructorId === user?.id && (c.estado === 'FINALIZADA' || c.estado === 'CANCELADA'))
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora_inicio.localeCompare(a.hora_inicio)),
    [user]
  )

  return (
    <div>
      <h2 className="client-section-title">Historial</h2>
      <p className="client-section-subtitle">Clases anteriores</p>

      {historial.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="icon-muted" />
          <h3>Sin historial</h3>
          <p>No hay clases anteriores registradas</p>
        </div>
      ) : (
        historial.map((clase, idx) => (
          <div key={clase.id} className="client-card" style={{ marginBottom: '0.75rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}>
            <div className="client-card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {clase.categoria}
                </h3>
                <span className={`status-badge ${clase.estado === 'FINALIZADA' ? 'status-warning' : 'status-inactive'}`}>
                  {clase.estado === 'FINALIZADA' ? 'Finalizada' : 'Cancelada'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
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
                  {clase.inscritos} participantes
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
