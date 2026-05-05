import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Calendar, Clock, MapPin, Users, CreditCard, DollarSign, ArrowLeft } from 'lucide-react'
import Button from '../../components/common/Button'
import '../../App.css'

const mockClaseDetalle = {
  '1': {
    id: 1,
    categoria: 'Salsa',
    instructor: 'María García',
    instructorFoto: null, // Placeholder for now
    especialidad: 'Salsa',
    descripcion: 'Clase intermedia de salsa con enfoque en técnica y ritmo.',
    fecha: '2026-05-05',
    hora_inicio: '10:00',
    hora_fin: '11:30',
    salon: 'Salón Principal',
    capacidad_maxima: 30,
    inscritos: 25,
    estado: 'PROGRAMADA'
  },
  '2': {
    id: 2,
    categoria: 'Bachata',
    instructor: 'Carlos López',
    instructorFoto: null,
    especialidad: 'Bachata',
    descripcion: 'Bachata básica para principiantes.',
    fecha: '2026-05-05',
    hora_inicio: '14:00',
    hora_fin: '15:30',
    salon: 'Salón 2',
    capacidad_maxima: 20,
    inscritos: 18,
    estado: 'PROGRAMADA'
  },
  '3': {
    id: 3,
    categoria: 'Tango',
    instructor: 'Ana Martínez',
    instructorFoto: null,
    especialidad: 'Tango',
    descripcion: 'Tango avanzado con técnica de abrazo y desplazamiento.',
    fecha: '2026-05-06',
    hora_inicio: '18:00',
    hora_fin: '19:30',
    salon: 'Salón VIP',
    capacidad_maxima: 15,
    inscritos: 5,
    estado: 'PROGRAMADA'
  }
}

const mockCreditos = 5

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clase = mockClaseDetalle[id]
  
  if (!clase) {
    return (
      <div className="empty-state">
        <Calendar size={48} className="icon-muted" />
        <h3>Clase no encontrada</h3>
        <p>La clase solicitada no existe</p>
        <Button onClick={() => navigate('/cliente/clases')} style={{ marginTop: '1rem' }}>
          Volver a Clases
        </Button>
      </div>
    )
  }
  
  const cuposDisponibles = clase.capacidad_maxima - clase.inscritos
  const [metodoPago, setMetodoPago] = useState(null)
  
  const handleReservar = () => {
    if (!metodoPago) {
      alert('Por favor selecciona un método de pago')
      return
    }
    
    if (metodoPago === 'creditos') {
      alert(`Reserva realizada usando créditos. Créditos restantes: ${mockCreditos - 1}`)
    } else {
      alert('Redirigiendo a pasarela de pago...')
    }
    navigate('/cliente/mis-reservas')
  }
  
  return (
    <div className="detalle-clase">
      <button 
        onClick={() => navigate('/cliente/clases')} 
        style={{ 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: 'var(--gray-600)',
          fontSize: '0.9rem',
          marginBottom: '1rem'
        }}
      >
        <ArrowLeft size={18} />
        Volver a Clases
      </button>
      
      <div className="detalle-header">
        <h2>{clase.categoria}</h2>
        <span className={`status-badge ${clase.estado === 'PROGRAMADA' ? 'status-active' : 'status-warning'}`}>
          {clase.estado === 'PROGRAMADA' ? 'Disponible' : 'Completa'}
        </span>
      </div>
      
      {/* Instructor Section - MAIN REQUEST */}
      <div className="instructor-section">
        <div className="instructor-photo">
          {clase.instructorFoto ? (
            <img src={clase.instructorFoto} alt={clase.instructor} />
          ) : (
            <span>{clase.instructor.charAt(0)}</span>
          )}
        </div>
        <div className="instructor-info">
          <h3>{clase.instructor}</h3>
          <p>Especialista en {clase.especialidad}</p>
        </div>
      </div>
      
      {/* Class Details */}
      <div className="detalle-info">
        <div className="info-item">
          <Calendar size={18} />
          <span>Fecha: {clase.fecha}</span>
        </div>
        <div className="info-item">
          <Clock size={18} />
          <span>Hora: {clase.hora_inicio} - {clase.hora_fin}</span>
        </div>
        <div className="info-item">
          <MapPin size={18} />
          <span>Salón: {clase.salon}</span>
        </div>
        <div className="info-item">
          <Users size={18} />
          <span>Cupos: {cuposDisponibles} disponibles / {clase.capacidad_maxima} total</span>
        </div>
        {clase.descripcion && (
          <div className="info-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
            <span style={{ fontWeight: 500 }}>Descripción:</span>
            <span style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>{clase.descripcion}</span>
          </div>
        )}
      </div>
      
      {/* Payment Choice Section */}
      <div className="pago-section">
        <h3>¿Cómo deseas pagar?</h3>
        <div className="pago-options">
          <div 
            className={`pago-option ${metodoPago === 'creditos' ? 'selected' : ''}`}
            onClick={() => setMetodoPago('creditos')}
          >
            <CreditCard size={32} />
            <span>Usar Créditos</span>
            <small>{mockCreditos} disponibles</small>
          </div>
          <div 
            className={`pago-option ${metodoPago === 'dinero' ? 'selected' : ''}`}
            onClick={() => setMetodoPago('dinero')}
          >
            <DollarSign size={32} />
            <span>Pagar con Dinero</span>
            <small>Pasarela de pago</small>
          </div>
        </div>
      </div>
      
      <Button 
        className="btn-reservar"
        onClick={handleReservar}
        disabled={clase.estado === 'COMPLETA'}
      >
        {clase.estado === 'COMPLETA' ? 'Clase Completa' : 'Confirmar Reserva'}
      </Button>
    </div>
  )
}
