import { useState } from 'react'
import { Calendar, Clock, Music, MapPin, X, CheckCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { formatHoraAMPM } from '../../data/mockData'
import '../../App.css'

function fechaRelativa(dias) {
  const f = new Date()
  f.setDate(f.getDate() + dias)
  return f.toISOString().split('T')[0]
}

const mockReservas = [
  { 
    id: 1, 
    categoria: 'Salsa',
    fecha: fechaRelativa(1), 
    hora_inicio: '10:00', 
    hora_fin: '11:30',
    instructor: 'María García',
    salon: 'Salón Principal',
    estado: 'CONFIRMADA' 
  },
  { 
    id: 2, 
    categoria: 'Bachata',
    fecha: fechaRelativa(2), 
    hora_inicio: '14:00', 
    hora_fin: '15:30',
    instructor: 'Carlos López',
    salon: 'Salón 2',
    estado: 'PENDIENTE' 
  },
  { 
    id: 3, 
    categoria: 'Salsa',
    fecha: fechaRelativa(3), 
    hora_inicio: '10:00', 
    hora_fin: '11:30',
    instructor: 'María García',
    salon: 'Salón Principal',
    estado: 'CONFIRMADA' 
  },
]

export default function MisReservas() {
  const [filtro, setFiltro] = useState('proximas')
  const [cancelandoReserva, setCancelandoReserva] = useState(null)
  
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
              <div key={reserva.id} className="reserva-card proxima">
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
                    {reserva.fecha}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="icon-muted" />
                    {formatHoraAMPM(reserva.hora_inicio)} - {formatHoraAMPM(reserva.hora_fin)}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Music size={16} className="icon-muted" />
                    {reserva.instructor}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} className="icon-muted" />
                    {reserva.salon}
                  </div>
                </div>
                
                {esProxima && (
                  <Button 
                    variant="danger" 
                    size="small"
                    onClick={() => setCancelandoReserva(reserva)}
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
