import { useState } from 'react'
import { Calendar, Clock, User, X, CheckCircle, CreditCard, Smartphone } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { mockReservas, formatHoraAMPM, formatFechaBonita } from '../../data/mockData'
import '../../App.css'

export default function MisReservas() {
  const [filtro, setFiltro] = useState('proximas')
  const [cancelandoReserva, setCancelandoReserva] = useState(null)
  const [comprobanteReserva, setComprobanteReserva] = useState(null)

  const hoy = new Date()
  const reservasFiltradas = mockReservas.filter(reserva => {
    const fechaClase = new Date(reserva.fecha + 'T' + reserva.hora_inicio)
    if (filtro === 'proximas') return fechaClase >= hoy && reserva.estado !== 'CANCELADA'
    return true
  })

  return (
    <div>
      <Modal isOpen={!!cancelandoReserva} onClose={() => setCancelandoReserva(null)} title="¿Cancelar reserva?">
        {cancelandoReserva && (
          <>
            <div className="cancel-reserva-preview">
              <img
                src={`https://i.pravatar.cc/60?u=${cancelandoReserva.instructor.replace(/\s+/g, '-')}`}
                alt={cancelandoReserva.instructor}
                className="cancel-reserva-photo"
              />
              <div className="cancel-reserva-info">
                <strong>{cancelandoReserva.categoria}</strong>
                <span>{cancelandoReserva.fecha} — {formatHoraAMPM(cancelandoReserva.hora_inicio)}</span>
              </div>
            </div>
            <p className="modal-subtitle">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <Button variant="secondary" onClick={() => setCancelandoReserva(null)}>
                No, mantener
              </Button>
              <Button variant="danger" onClick={() => { alert('Reserva cancelada'); setCancelandoReserva(null) }}>
                Sí, cancelar
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!comprobanteReserva} onClose={() => setComprobanteReserva(null)} title="Comprobante de reserva">
        {comprobanteReserva && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ background: '#d1fae5', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <CheckCircle size={24} color="#059669" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gray-900)' }}>
                {comprobanteReserva.estado === 'CONFIRMADA' ? 'Confirmada' : comprobanteReserva.estado}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-medium)', fontWeight: 600, marginTop: '0.25rem' }}>
                {comprobanteReserva.codigoPago}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--gray-50)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Categoría</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{comprobanteReserva.categoria}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Instructor</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{comprobanteReserva.instructor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Fecha</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatFechaBonita(comprobanteReserva.fecha)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Hora</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatHoraAMPM(comprobanteReserva.hora_inicio)} — {formatHoraAMPM(comprobanteReserva.hora_fin)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>#{comprobanteReserva.asiento}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Método de pago</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {comprobanteReserva.metodoPago === 'creditos' ? <><CreditCard size={14} /> Créditos</> : <><Smartphone size={14} /> Yape</>}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Temática</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{comprobanteReserva.tematica || 'LIBRE'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="filters" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Button
          variant={filtro === 'proximas' ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setFiltro('proximas')}
        >
          Próximas
        </Button>
      </div>

      <div>
        {reservasFiltradas.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="icon-muted" />
            <h3>No hay reservas</h3>
            <p>No tienes reservas próximas</p>
          </div>
        ) : (
          reservasFiltradas.map(reserva => {
            const fechaClase = new Date(reserva.fecha + 'T' + reserva.hora_inicio)
            const esProxima = fechaClase >= hoy && reserva.estado !== 'CANCELADA'

            return (
              <div
                key={reserva.id}
                className="reserva-card proxima"
                style={{ cursor: 'pointer' }}
                onClick={() => setComprobanteReserva(reserva)}
              >
                <div className="reserva-card-header">
                  <h3 className="reserva-card-title">{reserva.categoria}</h3>
                  <span className={`status-badge ${
                    reserva.estado === 'CONFIRMADA' ? 'status-active' : 'status-warning'
                  }`}>
                    {reserva.estado === 'CONFIRMADA' && <CheckCircle size={12} />}
                    {reserva.estado === 'CONFIRMADA' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>

                <div className="reserva-card-datetime">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} className="icon-muted" />
                    {formatFechaBonita(reserva.fecha)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="icon-muted" />
                    {formatHoraAMPM(reserva.hora_inicio)} - {formatHoraAMPM(reserva.hora_fin)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} className="icon-muted" />
                    {reserva.instructor}
                  </div>
                  {reserva.asiento && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--gray-500)' }}>Asiento #{reserva.asiento}</span>
                    </div>
                  )}
                </div>

                {esProxima && (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setCancelandoReserva(reserva) }}
                    style={{ width: '100%' }}
                  >
                    <X size={16} />
                    Cancelar reserva
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
