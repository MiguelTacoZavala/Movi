import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CreditCard, Smartphone, ArrowLeft, AlertTriangle, CheckCircle, Timer, User } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import api from '../../services/api'
import culqi from '../../services/culqi'
import { formatFechaBonita, formatHoraAMPM } from '../../utils/helpers'
import '../../App.css'

const HOLD_DURATION = 300

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function posicionToAsiento(p, columnas) {
  return {
    id: p.id,
    numero: p.numero,
    fila: Math.ceil(p.numero / columnas),
    columna: ((p.numero - 1) % columnas) + 1,
    estado: p.reservas && p.reservas.length > 0 ? 'ocupado' : 'disponible',
  }
}

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [clase, setClase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [metodoPago, setMetodoPago] = useState(null)
  const [holdSeconds, setHoldSeconds] = useState(HOLD_DURATION)
  const [holdActive, setHoldActive] = useState(false)
  const [holdExpired, setHoldExpired] = useState(false)
  const [showResumenModal, setShowResumenModal] = useState(false)
  const [inscripcionExitosa, setInscripcionExitosa] = useState(false)
  const [inscripcionData, setInscripcionData] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/clases/${id}`).then(res => {
      setClase(res.clase)
    }).catch(() => {
      setClase(null)
    }).finally(() => setLoading(false))
  }, [id])

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

  const columnas = clase?.capacidadMaxima <= 10 ? 4 : clase?.capacidadMaxima <= 20 ? 5 : 6

  const asientos = useMemo(() => {
    if (!clase?.posiciones) return []
    return clase.posiciones.map(p => posicionToAsiento(p, columnas))
  }, [clase, columnas])

  const asientosAgrupados = useMemo(() => {
    const filas = {}
    asientos.forEach(a => {
      if (!filas[a.fila]) filas[a.fila] = []
      filas[a.fila].push(a)
    })
    return Object.values(filas).map(f => f.sort((a, b) => a.columna - b.columna))
  }, [asientos])

  const precio = clase?.precio || 15

  const handleSelectSeat = (seat) => {
    if (seat.estado !== 'disponible' || holdActive) return
    setSelectedSeat(seat)
    setHoldExpired(false)
    setError('')
  }

  const handleSelectPago = (metodo) => {
    if (holdActive) return
    setMetodoPago(metodo)
    setHoldExpired(false)
    setError('')
  }

  const handlePagar = () => {
    setShowResumenModal(true)
  }

  const handleConfirmarInscripcion = async () => {
    setShowResumenModal(false)
    setError('')

    if (metodoPago === 'yape') {
      setProcesando(true)
      try {
        const tokenId = await culqi.generarToken({
          amount: precio,
          description: `${clase.categoria?.nombre} - ${clase.fecha}`,
        })

        setHoldActive(true)
        setHoldSeconds(HOLD_DURATION)

        const result = await api.procesarPago({
          tokenId,
          claseId: clase.id,
          posicionClaseId: selectedSeat.id,
          metodoPago: 'yape',
        })

        setInscripcionData({
          categoria: clase.categoria?.nombre,
          instructor: clase.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : '',
          fecha: clase.fecha,
          hora_inicio: clase.horaInicio,
          asiento: selectedSeat.numero,
          metodoPago: 'yape',
          tematica: clase.tematica || 'LIBRE',
          codigoPago: result.codigoPago,
          monto: result.monto,
        })
        setInscripcionExitosa(true)
      } catch (e) {
        setError(e.message || 'Error al procesar el pago')
        setSelectedSeat(null)
        setMetodoPago(null)
      } finally {
        setProcesando(false)
        setHoldActive(false)
      }
    } else {
      setHoldActive(true)
      setHoldSeconds(HOLD_DURATION)

      setTimeout(async () => {
        try {
          const result = await api.procesarPago({
            claseId: clase.id,
            posicionClaseId: selectedSeat.id,
            metodoPago: 'creditos',
          })

          setInscripcionData({
            categoria: clase.categoria?.nombre,
            instructor: clase.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : '',
            fecha: clase.fecha,
            hora_inicio: clase.horaInicio,
            asiento: selectedSeat.numero,
            metodoPago: 'creditos',
            tematica: clase.tematica || 'LIBRE',
            codigoPago: result.codigoPago,
            monto: result.monto,
          })
          setInscripcionExitosa(true)
        } catch (e) {
          setError(e.message || 'Error al procesar el pago')
          setSelectedSeat(null)
          setMetodoPago(null)
        } finally {
          setHoldActive(false)
        }
      }, 2500)
    }
  }

  const handleCancelarInscripcion = () => {
    setShowResumenModal(false)
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

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

  if (inscripcionExitosa && inscripcionData) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ background: '#d1fae5', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="#059669" />
        </div>
        <h3>Inscripción confirmada</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Tu inscripción fue confirmada correctamente</p>

        <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'var(--gray-50)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Categoría</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{inscripcionData.categoria}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Instructor</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{inscripcionData.instructor}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Fecha</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatFechaBonita(inscripcionData.fecha)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Hora</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{formatHoraAMPM(inscripcionData.hora_inicio)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>#{inscripcionData.asiento}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Monto</span>
            <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>S/ {inscripcionData.monto?.toFixed(2) || '15.00'}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Código de pago</span>
            <span style={{ fontWeight: 700, color: 'var(--primary-medium)', fontFamily: 'monospace', fontSize: '0.95rem' }}>{inscripcionData.codigoPago}</span>
          </div>
        </div>

        <Button onClick={() => navigate('/cliente/mis-clases')} style={{ marginTop: '1.5rem' }}>
          Ir a Mis Clases
        </Button>
      </div>
    )
  }

  const instrName = clase.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : ''

  return (
    <div className="detalle-clase" style={{ animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => navigate('/cliente/clases')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Volver a Clases
      </button>

      <div className="detalle-header">
        <h2>{clase.categoria?.nombre}</h2>
      </div>

      {holdExpired && (
        <div className="inscripcion-closed-banner cancelled">
          <Timer size={16} />
          <span>El tiempo para completar tu inscripción expiró.</span>
        </div>
      )}

      {error && (
        <div className="inscripcion-closed-banner cancelled" style={{ marginTop: '0.5rem' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="instructor-section">
        <div className="instructor-photo">
          <span>{instrName.charAt(0) || '?'}</span>
        </div>
        <div className="instructor-info">
          <h3>{instrName}</h3>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
            <span style={{ fontWeight: 500 }}>Temática:</span> {clase.tematica || 'LIBRE'}
          </div>
        </div>
      </div>

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
                  disabled={isOcupado || holdActive || procesando}
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

      <div style={{ textAlign: 'center', margin: '1rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
        S/ {precio.toFixed(2)}
      </div>

      <div className="pago-section">
        <h3>¿Cómo deseas pagar?</h3>
        <div className="pago-options">
          <div
            className={`pago-option ${metodoPago === 'creditos' ? 'selected' : ''} ${holdActive || procesando ? 'disabled' : ''}`}
            onClick={() => !holdActive && !procesando && handleSelectPago('creditos')}
            title="Usar un crédito disponible como método de pago"
          >
            <CreditCard size={32} />
            <span>Usar Créditos</span>
            <small>disponibles</small>
          </div>
          <div
            className={`pago-option ${metodoPago === 'yape' ? 'selected' : ''} ${holdActive || procesando ? 'disabled' : ''}`}
            onClick={() => !holdActive && !procesando && handleSelectPago('yape')}
            title="Pagar con Yape (tarjeta online)"
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

      <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
        Tu asiento será reservado temporalmente por 5 minutos.
      </p>

      <Button
        className="btn-inscribir"
        onClick={handlePagar}
        disabled={!selectedSeat || !metodoPago || holdActive || holdExpired || procesando}
        title="Confirmar asiento y procesar el pago"
      >
        {procesando ? 'Procesando...' : holdActive ? 'Procesando...' : 'Pagar e inscribirme'}
      </Button>

      <Modal isOpen={showResumenModal} onClose={handleCancelarInscripcion} title="Confirmar inscripción">
        <p className="modal-subtitle">Revisa los datos antes de confirmar</p>
        <div className="resumen-detalle">
          <div className="resumen-row">
            <span className="resumen-label">Clase</span>
            <span className="resumen-value">{clase.categoria?.nombre} · {instrName}</span>
          </div>
          <div className="resumen-row">
            <span className="resumen-label">Asiento</span>
            <span className="resumen-value">#{selectedSeat?.numero}</span>
          </div>
          <div className="resumen-row">
            <span className="resumen-label">Monto</span>
            <span className="resumen-value">S/ {precio.toFixed(2)}</span>
          </div>
          <div className="resumen-row">
            <span className="resumen-label">Pago</span>
            <span className="resumen-value">
              {metodoPago === 'yape'
                ? `Yape (${user?.telefono || '—'})`
                : 'Créditos (1)'
              }
            </span>
          </div>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={handleCancelarInscripcion}>Cancelar</Button>
          <Button onClick={handleConfirmarInscripcion} disabled={procesando}>
            {procesando ? 'Procesando...' : 'Confirmar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
