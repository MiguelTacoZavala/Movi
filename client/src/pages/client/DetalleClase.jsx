import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CreditCard, Smartphone, ArrowLeft, AlertTriangle, CheckCircle, Timer, User } from 'lucide-react'
import Button from '../../components/common/Button'
import { mockClases, claseDisponible, formatFechaBonita, formatHoraAMPM, addReserva } from '../../data/mockData'
import '../../App.css'

const HOLD_DURATION = 300

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [metodoPago, setMetodoPago] = useState(null)
  const [holdSeconds, setHoldSeconds] = useState(HOLD_DURATION)
  const [holdActive, setHoldActive] = useState(false)
  const [holdExpired, setHoldExpired] = useState(false)
  const [reservaExitosa, setReservaExitosa] = useState(false)
  const [reservaData, setReservaData] = useState(null)

  const clase = useMemo(() => mockClases.find(c => c.id === Number(id)), [id])
  const disponible = clase ? claseDisponible(clase) : false

  useEffect(() => {
    if (!holdActive) return

    const t = setTimeout(() => {
      setHoldSeconds(prev => {
        if (prev <= 1) {
          setSelectedSeat(null)
          setMetodoPago(null)
          setHoldActive(false)
          setHoldExpired(true)
          return HOLD_DURATION
        }
        return prev - 1
      })
    }, 1000)

    return () => clearTimeout(t)
  }, [holdActive, holdSeconds])

  const asientosAgrupados = useMemo(() => {
    if (!clase?.asientos) return []
    const filas = {}
    clase.asientos.forEach(a => {
      if (!filas[a.fila]) filas[a.fila] = []
      filas[a.fila].push(a)
    })
    return Object.values(filas).map(f => f.sort((a, b) => a.columna - b.columna))
  }, [clase])

  const columnas = clase.capacidad_maxima <= 10 ? 4 : clase.capacidad_maxima <= 20 ? 5 : 6

  const handleSelectSeat = (seat) => {
    if (seat.estado !== 'disponible' || holdActive) return
    setSelectedSeat(seat)
    setHoldExpired(false)
  }

  const handleSelectPago = (metodo) => {
    if (holdActive) return
    setMetodoPago(metodo)
    setHoldExpired(false)
  }

  const handlePagar = () => {
    setHoldActive(true)
    setHoldSeconds(HOLD_DURATION)
    setTimeout(() => {
      const reserva = addReserva({
        claseId: clase.id,
        categoria: clase.categoria,
        instructor: clase.instructor,
        fecha: clase.fecha,
        hora_inicio: clase.hora_inicio,
        hora_fin: clase.hora_fin,
        asiento: selectedSeat.numero,
        metodoPago: metodoPago,
        tematica: clase.tematica || 'LIBRE',
        estado: 'CONFIRMADA',
      })
      setReservaData(reserva)
      setReservaExitosa(true)
    }, 2500)
  }

  if (!clase) {
    return (
      <div className="empty-state">
        <h3>Clase no encontrada</h3>
        <p>La clase solicitada no existe</p>
        <Button onClick={() => navigate('/cliente/clases')} style={{ marginTop: '1rem' }}>
          Volver a Clases
        </Button>
      </div>
    )
  }

  if (reservaExitosa && reservaData) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ background: '#d1fae5', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="#059669" />
        </div>
        <h3>Reserva confirmada</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Tu reserva se ha registrado correctamente</p>

        <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'var(--gray-50)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Categoría</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{reservaData.categoria}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Instructor</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{reservaData.instructor}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Fecha</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatFechaBonita(reservaData.fecha)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Hora</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatHoraAMPM(reservaData.hora_inicio)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>#{reservaData.asiento}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Código de pago</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-medium)', fontFamily: 'monospace', fontSize: '0.95rem' }}>{reservaData.codigoPago}</span>
          </div>
        </div>

        <Button onClick={() => navigate('/cliente/mis-reservas')} style={{ marginTop: '1.5rem' }}>
          Ir a Mis Reservas
        </Button>
      </div>
    )
  }

  return (
    <div className="detalle-clase">
      <button onClick={() => navigate('/cliente/clases')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Volver a Clases
      </button>

      <div className="detalle-header">
        <h2>{clase.categoria}</h2>
        <span className={`status-badge ${!disponible ? 'status-warning' : 'status-active'}`}>
          {!disponible ? 'No disponible' : 'Disponible'}
        </span>
      </div>

      {!disponible && (
        <div className="reservation-closed-banner cancelled">
          <AlertTriangle size={16} />
          <span>Esta clase ya no está disponible para reserva</span>
        </div>
      )}

      {holdExpired && (
        <div className="reservation-closed-banner cancelled">
          <Timer size={16} />
          <span>Tiempo de reserva agotado. Selecciona un asiento nuevamente.</span>
        </div>
      )}

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
          <p>Instructor/a de {clase.categoria}</p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
            <span style={{ fontWeight: 500 }}>Temática:</span> {clase.tematica || 'LIBRE'}
          </div>
        </div>
      </div>

      {disponible && (
        <>
          <div className="seat-map-section">
            <div className="seat-stage">
              <User size={16} />
              <span>Instructor</span>
            </div>

            <div className="seat-legend">
              <div className="seat-legend-item">
                <div className="seat-legend-dot disponible" />
                <span>Disponible</span>
              </div>
              <div className="seat-legend-item">
                <div className="seat-legend-dot ocupado" />
                <span>Ocupado</span>
              </div>
              <div className="seat-legend-item">
                <div className="seat-legend-dot seleccionado" />
                <span>Tu selección</span>
              </div>
            </div>

            <div className="seat-grid" style={{ '--columnas': columnas }}>
              {asientosAgrupados.map((fila, fi) =>
                fila.map(asiento => {
                  const isSelected = selectedSeat?.id === asiento.id
                  const isOcupado = asiento.estado === 'ocupado'
                  return (
                    <button
                      key={asiento.id}
                      className={`seat ${isOcupado ? 'ocupado' : 'disponible'} ${isSelected ? 'selected' : ''}`}
                      disabled={isOcupado || holdActive}
                      onClick={() => !isOcupado && handleSelectSeat(asiento)}
                      style={{ gridRow: fi + 1, gridColumn: asiento.columna }}
                    >
                      <User size={22} />
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="pago-section">
            <h3>¿Cómo deseas pagar?</h3>
            <div className="pago-options">
              <div
                className={`pago-option ${metodoPago === 'creditos' ? 'selected' : ''} ${holdActive ? 'disabled' : ''}`}
                onClick={() => !holdActive && handleSelectPago('creditos')}
              >
                <CreditCard size={32} />
                <span>Usar Créditos</span>
                <small>5 disponibles</small>
              </div>
              <div
                className={`pago-option ${metodoPago === 'yape' ? 'selected' : ''} ${holdActive ? 'disabled' : ''}`}
                onClick={() => !holdActive && handleSelectPago('yape')}
              >
                <Smartphone size={32} />
                <span>Yape</span>
                <small>{user?.telefono || 'Pago móvil'}</small>
              </div>
            </div>
          </div>

          {holdActive && (
            <div className="hold-timer">
              <Timer size={18} />
              <span>
                {holdSeconds > 295
                  ? 'Procesando pago...'
                  : `Tiempo restante: ${formatTime(holdSeconds)}`
                }
              </span>
            </div>
          )}

          <Button
            className="btn-reservar"
            onClick={handlePagar}
            disabled={!selectedSeat || !metodoPago || holdActive || holdExpired}
          >
            {holdActive ? 'Procesando...' : 'Pagar Reserva'}
          </Button>
        </>
      )}
    </div>
  )
}
