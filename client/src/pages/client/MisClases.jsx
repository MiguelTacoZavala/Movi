import { useState, useEffect } from 'react'
import { Calendar, Clock, User, X, CheckCircle, CreditCard, Smartphone, AlertTriangle, Timer, AlertCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import api from '../../services/api'
import LoadingScreen from '../../components/common/LoadingScreen'
import { formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import '../../App.css'

function toDate(fechaStr) {
  const [y, m, d] = fechaStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const estadoLabel = { CONFIRMADA: 'Confirmada', FINALIZADA: 'Finalizada', CANCELADA: 'Cancelada', PENDIENTE: 'Pendiente', EXPIRADA: 'Expirada' }
const estadoClass = { CONFIRMADA: 'status-active', FINALIZADA: 'status-inactive', CANCELADA: 'status-danger', PENDIENTE: 'status-warning', EXPIRADA: 'status-inactive' }
const estadoIcon = { CONFIRMADA: CheckCircle, FINALIZADA: CheckCircle, CANCELADA: X, PENDIENTE: Timer, EXPIRADA: AlertTriangle }

function estado(r) { return r.estadoDisplay || r.estado }

export default function MisClases() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('proximas')
  const [cancelando, setCancelando] = useState(null)
  const [cancelandoLoading, setCancelandoLoading] = useState(false)
  const [comprobante, setComprobante] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.cachedGet('/reservas/mis-reservas').then(data => {
      if (mounted) setReservas(data.reservas || [])
    }).catch(() => {
      if (mounted) setError('No pudimos cargar tus reservas. Revisa tu conexión.')
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const filtradas = reservas.filter(r => {
    if (!r.clase) return false
    const st = estado(r)
    const f = toDate(r.clase.fecha)
    if (filtro === 'proximas') return f >= hoy && st !== 'CANCELADA' && st !== 'EXPIRADA' && st !== 'FINALIZADA'
    if (filtro === 'pasadas') return f < hoy || st === 'CANCELADA' || st === 'EXPIRADA' || st === 'FINALIZADA'
    return true
  })

  const confirmarCancel = async () => {
    if (!cancelando) return
    setCancelandoLoading(true)
    try {
      const data = await api.patch(`/reservas/${cancelando.id}/cancelar`)
      setReservas(reservas.map(r => r.id === cancelando.id ? data.reserva : r))
      setCancelando(null)
      api.invalidateCache()
      setMensaje('Reserva cancelada. Se generó un crédito para futuras inscripciones.')
      setTimeout(() => setMensaje(''), 5000)
    } catch {
      setError('No se pudo cancelar la reserva. Intenta de nuevo.')
      setTimeout(() => setError(''), 4000)
    } finally {
      setCancelandoLoading(false)
    }
  }

  return (
    <div>
      <Modal isOpen={!!cancelando} onClose={() => !cancelandoLoading && setCancelando(null)} title="¿Cancelar inscripción?">
        {cancelando && (
          <>
            <div className="cancel-inscripcion-preview">
              <div className="cancel-inscripcion-info">
                <strong>{cancelando.clase.categoria?.nombre}</strong>
                <span>{formatFechaBonita(cancelando.clase.fecha)} — {formatHoraAMPM(cancelando.clase.horaInicio)} a {formatHoraAMPM(cancelando.clase.horaFin)}</span>
              </div>
            </div>
            {cancelando.clase.instructor && (
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                Instructor/a: {cancelando.clase.instructor.nombres} {cancelando.clase.instructor.apellidos}
              </p>
            )}
            <AlertTriangle size={48} style={{ display: 'block', margin: '1rem auto', color: 'var(--warning)' }} />
            <p className="modal-subtitle">
              {cancelandoLoading
                ? 'Cancelando tu inscripción...'
                : cancelando.usoCredito
                  ? 'Se restaurará tu crédito al cancelar.'
                  : 'Se generará un crédito de devolución. Esta acción no se puede deshacer.'
              }
            </p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setCancelando(null)} disabled={cancelandoLoading}>
                No, mantener
              </Button>
              <Button variant="danger" onClick={confirmarCancel} disabled={cancelandoLoading}>
                {cancelandoLoading ? 'Cancelando...' : 'Sí, cancelar'}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!comprobante} onClose={() => setComprobante(null)} title="Comprobante de inscripción">
        {comprobante && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: '#d1fae5', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <CheckCircle size={24} color="#059669" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-900)' }}>
                {estadoLabel[estado(comprobante)] || estado(comprobante)}
              </div>
              {comprobante.codigoPago && (
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-medium)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {comprobante.codigoPago}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--gray-50)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Categoría</span>
                <span style={{ fontWeight: 600 }}>{comprobante.clase.categoria?.nombre}</span>
              </div>
              {comprobante.clase.instructor && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Instructor</span>
                  <span style={{ fontWeight: 600 }}>{comprobante.clase.instructor.nombres} {comprobante.clase.instructor.apellidos}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Fecha</span>
                <span style={{ fontWeight: 600 }}>{formatFechaBonita(comprobante.clase.fecha)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Hora</span>
                <span style={{ fontWeight: 600 }}>{formatHoraAMPM(comprobante.clase.horaInicio)} — {formatHoraAMPM(comprobante.clase.horaFin)}</span>
              </div>
              {comprobante.asiento && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento</span>
                  <span style={{ fontWeight: 600 }}>#{comprobante.asiento}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Monto</span>
                <span style={{ fontWeight: 600 }}>S/ {Number(comprobante.monto || 15).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Método de pago</span>
                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {comprobante.metodoPago === 'creditos' ? <><CreditCard size={14} /> Créditos</> : <><Smartphone size={14} /> Yape</>}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Temática</span>
                <span style={{ fontWeight: 600 }}>{comprobante.clase.tematica || 'LIBRE'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Button variant="secondary" size="small" className={filtro === 'proximas' ? 'btn-filter-active' : ''} onClick={() => setFiltro('proximas')} title="Mostrar solo clases próximas">
          Próximas
        </Button>
        <Button variant="secondary" size="small" className={filtro === 'pasadas' ? 'btn-filter-active' : ''} onClick={() => setFiltro('pasadas')} title="Mostrar clases pasadas o canceladas">
          Pasadas
        </Button>
      </div>

      {mensaje && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          <span>{mensaje}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div>
        {loading ? (
          <LoadingScreen />
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="icon-muted" />
            <h3>No hay clases</h3>
            <p>{filtro === 'proximas' ? 'No tienes clases próximas' : 'No tienes clases pasadas'}</p>
          </div>
        ) : filtradas.map((r, idx) => {
          const st = estado(r)
          const f = toDate(r.clase.fecha)
          const esProxima = f >= hoy && st !== 'CANCELADA' && st !== 'EXPIRADA' && st !== 'FINALIZADA'
          const cardClass = st === 'CANCELADA' ? 'cancelada' : !esProxima ? 'pasada' : 'proxima'

          return (
            <div
              key={r.id}
              className={`clase-card ${cardClass}`}
              style={{ cursor: 'pointer', animation: 'fadeInUp 0.35s ease both', animationDelay: `${idx * 0.06}s` }}
              onClick={() => setComprobante(r)}
            >
              <div className="clase-card-header">
                <h3 className="clase-card-title">{r.clase.categoria?.nombre}</h3>
                <span className={`status-badge ${estadoClass[st] || ''}`}>
                  {(() => { const Icon = estadoIcon[st]; return Icon ? <Icon size={12} /> : null })()}
                  {estadoLabel[st] || st}
                </span>
              </div>

              <div className="clase-card-datetime">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={16} className="icon-muted" />
                  {formatFechaBonita(r.clase.fecha)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} className="icon-muted" />
                  {formatHoraAMPM(r.clase.horaInicio)} - {formatHoraAMPM(r.clase.horaFin)}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                {r.clase.instructor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} className="icon-muted" />
                    {r.clase.instructor.nombres} {r.clase.instructor.apellidos}
                  </div>
                )}
                {r.asiento && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--gray-500)' }}>Asiento #{r.asiento}</span>
                  </div>
                )}
              </div>

              {esProxima && (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setCancelando(r) }}
                    style={{ width: '100%' }}
                    title="Cancelar esta inscripción (no se puede deshacer)"
                  >
                    <X size={16} />
                    Cancelar inscripción
                  </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
