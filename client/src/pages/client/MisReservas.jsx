import { useState } from 'react'
import { Calendar, Clock, Music, MapPin, X, CheckCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import '../../App.css'

const mockReservas = [
  { 
    id: 1, 
    clase: 'Salsa Intermedio', 
    fecha: '2026-05-05', 
    hora_inicio: '10:00', 
    hora_fin: '11:30',
    instructor: 'María García',
    salon: 'Salón Principal',
    estado: 'CONFIRMADA' 
  },
  { 
    id: 2, 
    clase: 'Bachata Básico', 
    fecha: '2026-05-06', 
    hora_inicio: '14:00', 
    hora_fin: '15:30',
    instructor: 'Carlos López',
    salon: 'Salón 2',
    estado: 'PENDIENTE' 
  },
  { 
    id: 3, 
    clase: 'Tango Avanzado', 
    fecha: '2026-04-28', 
    hora_inicio: '18:00', 
    hora_fin: '19:30',
    instructor: 'Ana Martínez',
    salon: 'Salón VIP',
    estado: 'CONFIRMADA',
    asistida: true
  },
  { 
    id: 4, 
    clase: 'Salsa Básico', 
    fecha: '2026-04-25', 
    hora_inicio: '10:00', 
    hora_fin: '11:30',
    instructor: 'María García',
    salon: 'Salón Principal',
    estado: 'CANCELADA' 
  },
]

export default function MisReservas() {
  const [filtro, setFiltro] = useState('proximas')
  
  const reservasFiltradas = mockReservas.filter(reserva => {
    const hoy = new Date('2026-05-04')
    const fechaClase = new Date(reserva.fecha)
    
    if (filtro === 'proximas') return fechaClase >= hoy && reserva.estado !== 'CANCELADA'
    if (filtro === 'pasadas') return fechaClase < hoy || reserva.asistida
    if (filtro === 'canceladas') return reserva.estado === 'CANCELADA'
    return true
  })

  const handleCancelar = (id) => {
    if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
      alert('Reserva cancelada')
    }
  }

  return (
    <div>
      <div className="filters" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <Button 
          variant={filtro === 'proximas' ? 'primary' : 'secondary'} 
          size="small"
          onClick={() => setFiltro('proximas')}
        >
          Próximas
        </Button>
        <Button 
          variant={filtro === 'pasadas' ? 'primary' : 'secondary'} 
          size="small"
          onClick={() => setFiltro('pasadas')}
        >
          Pasadas
        </Button>
        <Button 
          variant={filtro === 'canceladas' ? 'primary' : 'secondary'} 
          size="small"
          onClick={() => setFiltro('canceladas')}
        >
          Canceladas
        </Button>
      </div>

      <div>
        {reservasFiltradas.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} className="icon-muted" />
            <h3>No hay reservas</h3>
            <p>No tienes reservas en esta categoría</p>
          </div>
        ) : (
          reservasFiltradas.map(reserva => {
            const hoy = new Date('2026-05-04')
            const fechaClase = new Date(reserva.fecha)
            const esProxima = fechaClase >= hoy && reserva.estado !== 'CANCELADA'
            const esPasada = fechaClase < hoy || reserva.asistida
            const esCancelada = reserva.estado === 'CANCELADA'
            
            let cardClass = 'reserva-card'
            if (esProxima) cardClass += ' proxima'
            if (esPasada) cardClass += ' pasada'
            if (esCancelada) cardClass += ' cancelada'
            
            return (
              <div key={reserva.id} className={cardClass}>
                <div className="reserva-card-header">
                  <h3 className="reserva-card-title">{reserva.clase}</h3>
                  <span className={`status-badge ${
                    reserva.estado === 'CONFIRMADA' ? 'status-active' : 
                    reserva.estado === 'PENDIENTE' ? 'status-warning' : 
                    'status-inactive'
                  }`}>
                    {reserva.estado === 'CONFIRMADA' && <CheckCircle size={12} />}
                    {reserva.estado === 'CONFIRMADA' ? 'Confirmada' : 
                     reserva.estado === 'PENDIENTE' ? 'Pendiente' : 
                     'Cancelada'}
                  </span>
                </div>
                
                <div className="reserva-card-datetime">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} className="icon-muted" />
                    {reserva.fecha}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} className="icon-muted" />
                    {reserva.hora_inicio} - {reserva.hora_fin}
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
                    onClick={() => handleCancelar(reserva.id)}
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
