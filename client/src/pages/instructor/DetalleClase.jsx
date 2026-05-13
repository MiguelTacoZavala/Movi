import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Users, User } from 'lucide-react'
import Button from '../../components/common/Button'
import { mockClasesGeneradas, formatHoraAMPM } from '../../data/mockData'
import '../../App.css'

const MOCK_PARTICIPANTES = [
  'Laura Mendoza', 'Carlos Torres', 'Ana Lucía Reyes', 'Diego Paredes',
  'Valentina Ríos', 'Mateo Castillo', 'Camila Suárez', 'Sebastián Vega',
  'Ximena Delgado', 'Andrés Herrera', 'Gabriela Paz', 'Fernando Rivas',
  'Isabella Campos', 'Nicolás Quintana', 'Sofía Morales', 'Joaquín Silva',
]

function getParticipantes(clase) {
  if (!clase) return []
  const ocupados = clase.posiciones.filter(p => p.estado === 'ocupado')
  return ocupados.map((p, i) => ({
    nombre: MOCK_PARTICIPANTES[i % MOCK_PARTICIPANTES.length],
    asiento: p.numero,
  }))
}

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()

  const clase = useMemo(() => mockClasesGeneradas.find(c => c.id === Number(id)), [id])
  const participantes = useMemo(() => getParticipantes(clase), [clase])

  if (!clase) {
    return (
      <div className="empty-state">
        <h3>Clase no encontrada</h3>
        <p>La clase solicitada no existe</p>
        <Button onClick={() => navigate('/instructor/clases')} style={{ marginTop: '1rem' }}>
          Volver a Clases
        </Button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate('/instructor/clases')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Volver a Clases
      </button>

      <div className="client-card" style={{ marginBottom: '1rem' }}>
        <div className="client-card-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              {clase.categoria}
            </h2>
            <span className={`status-badge ${clase.estado === 'EN_CURSO' ? 'status-active' : 'status-info'}`}>
              {clase.estado === 'EN_CURSO' ? 'En Curso' : 'Programada'}
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
              {clase.inscritos}/{clase.capacidad_maxima} participantes
            </div>
          </div>
        </div>
      </div>

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="icon-primary" />
            Participantes ({participantes.length})
          </div>
        </div>
        <div className="client-card-content">
          {participantes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '1rem 0' }}>
              No hay participantes registrados
            </p>
          ) : (
            participantes.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-medium)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {p.nombre.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--gray-900)' }}>{p.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Asiento {p.asiento}</div>
                </div>
                <User size={16} className="icon-muted" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
