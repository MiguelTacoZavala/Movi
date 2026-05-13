import { useMemo } from 'react'
import { Calendar, Clock, Users, Music } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockClasesGeneradas, formatHoraAMPM, formatDateStr } from '../../data/mockData'
import '../../App.css'

export default function Dashboard() {
  const { user } = useAuth()
  const hoy = formatDateStr(new Date())

  const misClases = useMemo(() =>
    mockClasesGeneradas.filter(c => c.instructorId === user?.id),
    [user]
  )

  const clasesHoy = useMemo(() =>
    misClases.filter(c => c.fecha === hoy && c.estado !== 'CANCELADA' && c.estado !== 'FINALIZADA')
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    [misClases, hoy]
  )

  const proximaClase = clasesHoy[0] || null

  return (
    <div>
      <div className="client-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>
          ¡Hola, {user?.nombres}!
        </h2>
      </div>

      {proximaClase ? (
        <div className="client-card" style={{ borderLeft: '4px solid var(--success)', marginBottom: '1rem' }}>
          <div className="client-card-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Music size={20} className="icon-primary" />
              Tu próxima clase
            </div>
          </div>
          <div className="client-card-content">
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
              {proximaClase.categoria}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem', color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} className="icon-muted" />
                {proximaClase.fecha}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} className="icon-muted" />
                {formatHoraAMPM(proximaClase.hora_inicio)} — {formatHoraAMPM(proximaClase.hora_fin)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} className="icon-muted" />
                {proximaClase.inscritos}/{proximaClase.capacidad_maxima} participantes ({Math.round((proximaClase.inscritos / proximaClase.capacidad_maxima) * 100)}%)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="client-card" style={{ marginBottom: '1rem' }}>
          <div className="client-card-content">
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '1rem 0' }}>
              No tienes clases programadas para hoy
            </p>
          </div>
        </div>
      )}

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} className="icon-primary" />
            Clases de hoy
          </div>
        </div>
        <div className="client-card-content">
          {clasesHoy.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '1rem 0' }}>
              No hay clases hoy
            </p>
          ) : (
            clasesHoy.map(clase => (
              <div key={clase.id} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                  {clase.categoria}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  {formatHoraAMPM(clase.hora_inicio)} — {formatHoraAMPM(clase.hora_fin)} · {clase.inscritos}/{clase.capacidad_maxima} participantes
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
