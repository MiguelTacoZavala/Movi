import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Music } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatHoraAMPM } from '../../utils/helpers'
import '../../App.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/instructores/dashboard').then(res => {
      setData(res)
    }).catch(() => {
      setData(null)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  const proximaClase = data?.proximaClase
  const clasesHoy = data?.clasesHoy || []

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
              {proximaClase.categoria?.nombre}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem', color: 'var(--gray-600)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} className="icon-muted" />
                {proximaClase.fecha}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} className="icon-muted" />
                {formatHoraAMPM(proximaClase.horaInicio)} — {formatHoraAMPM(proximaClase.horaFin)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} className="icon-muted" />
                {proximaClase.inscritos}/{proximaClase.capacidadMaxima} participantes
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
            clasesHoy.map((clase, idx) => (
              <div key={clase.id} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.5rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.08}s` }}>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                  {clase.categoria?.nombre}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                  {formatHoraAMPM(clase.horaInicio)} — {formatHoraAMPM(clase.horaFin)} · {clase.inscritos}/{clase.capacidadMaxima} participantes
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
