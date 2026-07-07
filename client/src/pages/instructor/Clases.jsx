import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Calendar, Clock, Users, ChevronRight } from 'lucide-react'
import api from '../../services/api'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import { formatHoraAMPM, formatFechaBonita, DIAS_SEMANA } from '../../utils/helpers'
import '../../App.css'

const TABS = [
  { id: 'proximas', label: 'Próximas', icon: Music },
  { id: 'horario', label: 'Horario', icon: Calendar },
]

function getEstadoBadge(estado) {
  const map = {
    PROGRAMADA: { label: 'Programada', className: 'status-info' },
    EN_CURSO: { label: 'En Curso', className: 'status-active' },
  }
  const cfg = map[estado] || { label: estado, className: '' }
  return <span className={`status-badge ${cfg.className}`} aria-label={`Estado: ${cfg.label}`}>{cfg.label}</span>
}

function ProximasTab({ clases, navigate }) {
  if (clases.length === 0) {
    return (
      <div className="empty-state">
        <Music size={48} className="icon-muted" aria-hidden="true" />
        <h3>Sin clases</h3>
        <p>No tienes clases programadas</p>
      </div>
    )
  }

  return clases.map((clase, idx) => (
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
}

function HorarioTab({ horarios }) {
  const ordenados = useMemo(() =>
    [...horarios].sort((a, b) => DIAS_SEMANA.indexOf(a.diaSemana) - DIAS_SEMANA.indexOf(b.diaSemana)),
    [horarios]
  )

  if (ordenados.length === 0) {
    return (
      <div className="empty-state">
        <Calendar size={48} className="icon-muted" aria-hidden="true" />
        <h3>Sin horarios</h3>
        <p>No tienes horarios asignados</p>
      </div>
    )
  }

  return ordenados.map((h, idx) => (
    <div
      key={h.id}
      className="client-card"
      style={{ marginBottom: '0.75rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}
      aria-label={`Clase de ${h.categoria?.nombre || ''} los días ${h.diaSemana?.charAt(0) + h.diaSemana?.slice(1).toLowerCase() || ''} de ${formatHoraAMPM(h.horaInicio)} a ${formatHoraAMPM(h.horaFin)}. Capacidad máxima de ${h.capacidadMaxima} alumnos.`}
    >
      <div className="client-card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            {h.categoria?.nombre}
          </h3>
          <span className="status-badge status-info">{h.diaSemana?.charAt(0) + h.diaSemana?.slice(1).toLowerCase()}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} className="icon-muted" aria-hidden="true" />
            {formatHoraAMPM(h.horaInicio)} — {formatHoraAMPM(h.horaFin)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} className="icon-muted" aria-hidden="true" />
            Capacidad: {h.capacidadMaxima} · Mínimo: {h.minimoParticipantes}
          </div>
        </div>
      </div>
    </div>
  ))
}

export default function Clases() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('proximas')
  const [clases, setClases] = useState(() => api.getCached('/instructores/mis-clases')?.clases || [])
  const [horarios, setHorarios] = useState(() => api.getCached('/instructores/mis-horarios')?.horarios || [])
  const [loading, setLoading] = useState(!api.getCached('/instructores/mis-clases') || !api.getCached('/instructores/mis-horarios'))
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      api.cachedGet('/instructores/mis-clases').catch(() => []),
      api.cachedGet('/instructores/mis-horarios').catch(() => []),
    ]).then(([clasesRes, horariosRes]) => {
      setClases(clasesRes.clases || [])
      setHorarios(horariosRes.horarios || [])
      setError(null)
    }).catch(() => {
      setError('Tuvimos un problema al cargar los datos. Por favor, intenta de nuevo en unos momentos.')
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <div>
      <h2 className="client-section-title">Mis Clases</h2>
      <p className="client-section-subtitle">Clases programadas y horario semanal</p>

      {error && <Alert type="danger">{error}</Alert>}

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        background: 'var(--gray-100)',
        borderRadius: '12px',
        padding: '0.25rem',
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                background: activeTab === tab.id ? 'var(--card-bg, #fff)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gray-900)' : 'var(--gray-500)',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
                fontFamily: 'inherit',
              }}
              aria-pressed={activeTab === tab.id}
            >
              <Icon size={16} aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'proximas' && <ProximasTab clases={clases} navigate={navigate} />}
      {activeTab === 'horario' && <HorarioTab horarios={horarios} />}
    </div>
  )
}
