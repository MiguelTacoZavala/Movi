import { useState, useEffect } from 'react'
import { Clock, Calendar, Users } from 'lucide-react'
import api from '../../services/api'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import { formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import '../../App.css'

export default function Historial() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.cachedGet('/instructores/historial').then(res => {
      setClases(res.clases || [])
      setError(null)
    }).catch(() => {
      setClases([])
      setError('No pudimos recuperar tu historial de clases en este momento. Por favor, intenta de nuevo más tarde.')
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <div>
      <h2 className="client-section-title">Historial</h2>
      <p className="client-section-subtitle">Clases anteriores</p>

      {error && <Alert type="danger">{error}</Alert>}

      {clases.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="icon-muted" aria-hidden="true" />
          <h3>Sin historial</h3>
          <p>No hay clases anteriores registradas</p>
        </div>
      ) : (
        clases.map((clase, idx) => (
          <div
            key={clase.id}
            className="client-card"
            style={{ marginBottom: '0.75rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}
            aria-label={`Clase de ${clase.categoria?.nombre || ''} el ${formatFechaBonita(clase.fecha)} de ${formatHoraAMPM(clase.horaInicio)} a ${formatHoraAMPM(clase.horaFin)}. Estado: ${clase.estado === 'FINALIZADA' ? 'finalizada' : 'cancelada'}. Con ${clase.inscritos || 0} participantes.`}
          >
            <div className="client-card-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {clase.categoria?.nombre}
                </h3>
                <span className={`status-badge ${clase.estado === 'FINALIZADA' ? 'status-warning' : 'status-inactive'}`}>
                  {clase.estado === 'FINALIZADA' ? 'Finalizada' : 'Cancelada'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
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
