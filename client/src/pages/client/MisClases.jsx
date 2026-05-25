import { useState } from 'react'
import { Calendar, Clock, User, X, CheckCircle, CreditCard, Smartphone } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { mockInscripciones, formatHoraAMPM, formatFechaBonita } from '../../data/mockData'
import '../../App.css'

export default function MisClases() {
  const [filtro, setFiltro] = useState('proximas')
  const [cancelandoInscripcion, setCancelandoInscripcion] = useState(null)
  const [comprobanteInscripcion, setComprobanteInscripcion] = useState(null)

  const hoy = new Date()
  const clasesFiltradas = mockInscripciones.filter(inscripcion => {
    const fechaClase = new Date(inscripcion.fecha + 'T' + inscripcion.hora_inicio)
    if (filtro === 'proximas') return fechaClase >= hoy && inscripcion.estado !== 'CANCELADA'
    if (filtro === 'pasadas') return fechaClase < hoy || inscripcion.estado === 'CANCELADA'
    return true
  })

  return (
    <div>
      <Modal isOpen={!!cancelandoInscripcion} onClose={() => setCancelandoInscripcion(null)} title="¿Cancelar inscripción?">
        {cancelandoInscripcion && (
          <>
            <div className="cancel-inscripcion-preview">
              <img
                src={`https://i.pravatar.cc/60?u=${cancelandoInscripcion.instructor.replace(/\s+/g, '-')}`}
                alt={cancelandoInscripcion.instructor}
                className="cancel-inscripcion-photo"
              />
              <div className="cancel-inscripcion-info">
                <strong>{cancelandoInscripcion.categoria}</strong>
                <span>{cancelandoInscripcion.fecha} — {formatHoraAMPM(cancelandoInscripcion.hora_inicio)}</span>
              </div>
            </div>
            <p className="modal-subtitle">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setCancelandoInscripcion(null)}>
                No, mantener
              </Button>
              <Button variant="danger" onClick={() => { alert('Inscripción cancelada'); setCancelandoInscripcion(null) }}>
                Sí, cancelar
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!comprobanteInscripcion} onClose={() => setComprobanteInscripcion(null)} title="Comprobante de inscripción">
        {comprobanteInscripcion && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: '#d1fae5', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <CheckCircle size={24} color="#059669" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-900)' }}>
                {comprobanteInscripcion.estado === 'CONFIRMADA' ? 'Inscrito' : comprobanteInscripcion.estado}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-medium)', fontWeight: 600, marginTop: '0.25rem' }}>
                {comprobanteInscripcion.codigoPago}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--gray-50)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Categoría</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{comprobanteInscripcion.categoria}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Instructor</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{comprobanteInscripcion.instructor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Fecha</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatFechaBonita(comprobanteInscripcion.fecha)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Hora</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatHoraAMPM(comprobanteInscripcion.hora_inicio)} — {formatHoraAMPM(comprobanteInscripcion.hora_fin)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>#{comprobanteInscripcion.asiento}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Método de pago</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {comprobanteInscripcion.metodoPago === 'creditos' ? <><CreditCard size={14} /> Créditos</> : <><Smartphone size={14} /> Yape</>}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Temática</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{comprobanteInscripcion.tematica || 'LIBRE'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="filters" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Button
          variant="secondary"
          size="small"
          className={filtro === 'proximas' ? 'btn-filter-active' : ''}
          onClick={() => setFiltro('proximas')}
        >
          Próximas
        </Button>
        <Button
          variant="secondary"
          size="small"
          className={filtro === 'pasadas' ? 'btn-filter-active' : ''}
          onClick={() => setFiltro('pasadas')}
        >
          Pasadas
        </Button>
      </div>

      <div>
        {clasesFiltradas.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="icon-muted" />
            <h3>No hay clases</h3>
            <p>No tienes clases próximas</p>
          </div>
        ) : (
          clasesFiltradas.map((inscripcion, idx) => {
            const fechaClase = new Date(inscripcion.fecha + 'T' + inscripcion.hora_inicio)
            const esProxima = fechaClase >= hoy && inscripcion.estado !== 'CANCELADA'

            return (
              <div
                key={inscripcion.id}
                className="clase-card proxima"
                style={{ cursor: 'pointer', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}
                onClick={() => setComprobanteInscripcion(inscripcion)}
              >
                <div className="clase-card-header">
                  <h3 className="clase-card-title">{inscripcion.categoria}</h3>
                  <span className={`status-badge ${
                    inscripcion.estado === 'CONFIRMADA' ? 'status-active' : 'status-warning'
                  }`}>
                    {inscripcion.estado === 'CONFIRMADA' && <CheckCircle size={12} />}
                    {inscripcion.estado === 'CONFIRMADA' ? 'Inscrito' : 'Pendiente'}
                  </span>
                </div>

                <div className="clase-card-datetime">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} className="icon-muted" />
                    {formatFechaBonita(inscripcion.fecha)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="icon-muted" />
                    {formatHoraAMPM(inscripcion.hora_inicio)} - {formatHoraAMPM(inscripcion.hora_fin)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} className="icon-muted" />
                    {inscripcion.instructor}
                  </div>
                  {inscripcion.asiento && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Asiento #{inscripcion.asiento}</span>
                    </div>
                  )}
                </div>

                {esProxima && (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setCancelandoInscripcion(inscripcion) }}
                    style={{ width: '100%' }}
                  >
                    <X size={16} />
                    Cancelar inscripción
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
