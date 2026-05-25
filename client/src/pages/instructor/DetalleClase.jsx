import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Users, User, Edit3, Check, X } from 'lucide-react'
import Button from '../../components/common/Button'
import { mockClasesGeneradas, formatHoraAMPM, setTematica } from '../../data/mockData'
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
  const [editandoTematica, setEditandoTematica] = useState(false)
  const [tematicaInput, setTematicaInput] = useState('')
  const [refresh, setRefresh] = useState(0)

  const clase = useMemo(() => mockClasesGeneradas.find(c => c.id === Number(id)), [id, refresh]) // eslint-disable-line react-hooks/exhaustive-deps
  const participantes = useMemo(() => getParticipantes(clase), [clase])

  const iniciarEdicion = () => {
    setTematicaInput(clase?.tematica || 'LIBRE')
    setEditandoTematica(true)
  }

  const guardarTematica = () => {
    const val = tematicaInput.trim() || 'LIBRE'
    setTematica(Number(id), val)
    setEditandoTematica(false)
    setRefresh(r => r + 1)
  }

  const cancelarEdicion = () => {
    setEditandoTematica(false)
  }

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

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Temática:</span>
              {editandoTematica ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={tematicaInput}
                    onChange={e => setTematicaInput(e.target.value)}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.9rem', width: '180px' }}
                    placeholder="LIBRE"
                    autoFocus
                  />
                  <button onClick={guardarTematica} style={{ background: 'var(--success)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={cancelarEdicion} style={{ background: 'var(--gray-200)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{clase.tematica || 'LIBRE'}</span>
              )}
            </div>
            {!editandoTematica && (
              <button onClick={iniciarEdicion} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-medium)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                <Edit3 size={14} />
                Editar
              </button>
            )}
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
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.5rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${i * 0.05}s` }}>
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
