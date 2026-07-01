import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Users, User, Edit3, Check, X } from 'lucide-react'
import Button from '../../components/common/Button'
import api from '../../services/api'
import { formatHoraAMPM } from '../../utils/helpers'
import '../../App.css'

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [clase, setClase] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoTematica, setEditandoTematica] = useState(false)
  const [tematicaInput, setTematicaInput] = useState('')
  const [guardandoTematica, setGuardandoTematica] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/instructores/clases/${id}/participantes`).then(res => {
      setClase(res.clase)
      setParticipantes(res.participantes || [])
    }).catch(() => {
      setClase(null)
      setParticipantes([])
    }).finally(() => setLoading(false))
  }, [id])

  const iniciarEdicion = () => {
    setTematicaInput(clase?.tematica || 'LIBRE')
    setEditandoTematica(true)
  }

  const guardarTematica = async () => {
    const val = tematicaInput.trim() || 'LIBRE'
    setGuardandoTematica(true)
    try {
      await api.patch(`/instructores/clases/${id}/tematica`, { tematica: val })
      setClase(prev => ({ ...prev, tematica: val }))
      setEditandoTematica(false)
    } catch (e) {
      alert(e.message || 'Error al guardar temática')
    } finally {
      setGuardandoTematica(false)
    }
  }

  const cancelarEdicion = () => {
    setEditandoTematica(false)
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

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
              {clase.categoria || 'Clase'}
            </h2>
            <span className="status-badge status-info">Programada</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} className="icon-muted" />
              {clase.fecha}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} className="icon-muted" />
              {formatHoraAMPM(clase.horaInicio)} — {formatHoraAMPM(clase.horaFin)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} className="icon-muted" />
              {participantes.length}/{clase.capacidadMaxima || 0} participantes
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
                  <button onClick={guardarTematica} disabled={guardandoTematica} style={{ background: 'var(--success)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
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
              <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.5rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-medium)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {p.nombres?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--gray-900)' }}>{p.nombres} {p.apellidos}</div>
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
