import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/useAuth'
import { CreditCard, Smartphone, ArrowLeft, AlertTriangle, AlertCircle, CheckCircle, Timer, User, Tag, Calendar, Clock } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import api from '../../services/api'
import culqi from '../../services/culqi'
import LoadingScreen from '../../components/common/LoadingScreen'
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
  const [holdId, setHoldId] = useState(null)
  const [holdCodigoPago, setHoldCodigoPago] = useState(null)
  const [holdExpired, setHoldExpired] = useState(false)
  const [showResumenModal, setShowResumenModal] = useState(false)
  const [inscripcionExitosa, setInscripcionExitosa] = useState(false)
  const [inscripcionData, setInscripcionData] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [claseError, setClaseError] = useState(null)
  const [pagandoYape, setPagandoYape] = useState(false)
  const [procesandoPagoYape, setProcesandoPagoYape] = useState(false)
  const [creditos, setCreditos] = useState(0)
  const [creditosError, setCreditosError] = useState(false)

  useEffect(() => {
    api.get(`/clases/${id}?soloActivas=true`).then(res => {
      setClase(res.clase)
    }).catch(() => {
      setClase(null)
      setClaseError('No pudimos cargar los detalles de esta clase. Verifica tu conexión e intenta de nuevo.')
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    api.cachedGet('/creditos').then(res => {
      const disponibles = (res.creditos || []).filter(c => !c.usado).length
      setCreditos(disponibles)
      setCreditosError(false)
    }).catch(() => {
      setCreditosError(true)
    })
  }, [])

  useEffect(() => {
    return () => { culqi.close() }
  }, [])

  useEffect(() => {
    if (!holdActive) return
    const t = setTimeout(() => {
      setHoldSeconds(prev => {
        if (prev <= 1) {
          setSelectedSeat(null)
          setMetodoPago(null)
          setHoldActive(false)
          setHoldId(null)
          setHoldCodigoPago(null)
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

  const openCulqiYape = async (holdIdState, precioState) => {
    setPagandoYape(true)
    setError('')
    try {
      const tokenId = await culqi.generarToken({
        amount: precioState,
        email: user?.email || 'cliente@movi.com',
        description: `${clase.categoria?.nombre} - ${clase.fecha}`,
      })

      setPagandoYape(false)
      setProcesandoPagoYape(true)

      const result = await api.confirmarPago({
        holdId: holdIdState,
        tokenId,
      })

      api.invalidateCache()
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
      setHoldActive(false)
      setInscripcionExitosa(true)
    } catch (e) {
      setError(e.data?.error || e.message || 'No pudimos completar el pago con Yape. Intenta de nuevo.')
      if (e.status === 410 || e.status === 409 || e.status === 402) {
        setHoldActive(false)
        setHoldId(null)
        setHoldCodigoPago(null)
        setSelectedSeat(null)
        setMetodoPago(null)
        setHoldExpired(true)
      }
    } finally {
      setPagandoYape(false)
      setProcesandoPagoYape(false)
    }
  }

  const handleConfirmarInscripcion = async () => {
    setShowResumenModal(false)
    setError('')

    if (metodoPago === 'creditos') {
      setProcesando(true)
      try {
        const result = await api.procesarPago({
          claseId: clase.id,
          posicionClaseId: selectedSeat.id,
        })

        api.invalidateCache()
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
        setError(e.data?.error || e.message || 'No pudimos procesar el pago con tus créditos. Intenta de nuevo.')
        setSelectedSeat(null)
        setMetodoPago(null)
      } finally {
        setProcesando(false)
      }
    } else {
      setProcesando(true)
      try {
        const result = await api.iniciarHold({
          claseId: clase.id,
          posicionClaseId: selectedSeat.id,
        })

        setHoldId(result.holdId)
        setHoldCodigoPago(result.codigoPago)
        setHoldActive(true)
        setHoldSeconds(HOLD_DURATION)
        setProcesando(false)

        openCulqiYape(result.holdId, precio)
      } catch (e) {
        setError(e.data?.error || e.message || 'No pudimos reservar el asiento. Intenta de nuevo.')
        setSelectedSeat(null)
        setMetodoPago(null)
        setProcesando(false)
      }
    }
  }

  const handleCancelarInscripcion = () => {
    setShowResumenModal(false)
  }

  if (!clase && !loading) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} className="icon-muted" />
        <h3>{claseError ? 'Error al cargar la clase' : 'Clase no encontrada'}</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{claseError || 'La clase solicitada no existe'}</p>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button onClick={() => navigate('/cliente/mis-clases')}>
            Ir a Mis Clases
          </Button>
          <Button variant="secondary" onClick={() => navigate('/cliente/clases')}>
            Reservar otra clase
          </Button>
        </div>
      </div>
    )
  }

  const instrName = clase?.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : ''

  const volverAClases = () => {
    if (clase?.categoria?.nombre && clase?.fecha) {
      const params = new URLSearchParams({ cat: clase.categoria.nombre, fecha: clase.fecha })
      navigate(`/cliente/clases?${params.toString()}`)
    } else {
      navigate('/cliente/clases')
    }
  }

  return (
    <div className="detalle-clase" style={{ animation: 'fadeIn 0.3s ease' }}>
      <button onClick={volverAClases} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Volver a Clases
      </button>

      <div className="detalle-header">
        <h2>{clase?.categoria?.nombre || <span className="skeleton skeleton-inline" style={{ width: 120, height: 24 }} />}</h2>
        {clase && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} className="icon-muted" />
              {formatFechaBonita(clase.fecha)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={15} className="icon-muted" />
              {formatHoraAMPM(clase.horaInicio)} — {formatHoraAMPM(clase.horaFin)}
            </span>
          </div>
        )}
      </div>

      {holdActive && metodoPago === 'yape' && !inscripcionExitosa && (
        <div className="hold-timer" style={{ marginTop: '0.75rem' }}>
          <Timer size={18} />
          <span>
            Tiempo restante: <strong>{formatTime(holdSeconds)}</strong>
          </span>
          {holdCodigoPago && (
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginLeft: '0.5rem' }}>
              Reserva: <strong style={{ fontFamily: 'monospace', color: 'var(--primary-medium)' }}>{holdCodigoPago}</strong>
            </span>
          )}
        </div>
      )}

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

      {procesandoPagoYape && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div className="processing-spinner" />
            <h3>Procesando tu pago</h3>
            <p>Estamos confirmando tu pago con Yape. Por favor espera...</p>
            {holdActive && (
              <div className="processing-timer">
                <Timer size={16} />
                <span>Tiempo restante: <strong>{formatTime(holdSeconds)}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && !clase ? (
        <LoadingScreen />
      ) : (
        <>
          <div className="instructor-section">
            <div className="instructor-photo">
              {clase?.instructor?.fotoUrl ? (
                <img src={clase.instructor.fotoUrl} alt={instrName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{instrName.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="instructor-info">
              <h3>{instrName}</h3>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                <span style={{ fontWeight: 500 }}>Temática:</span> {clase?.tematica || 'LIBRE'}
              </div>
            </div>
          </div>

          <div className="price-card">
            <Tag size={22} className="price-card-icon" />
            <span className="price-card-value">S/ {precio.toFixed(2)}</span>
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
                      disabled={isOcupado || holdActive || procesando || procesandoPagoYape}
                      onClick={() => !isOcupado && handleSelectSeat(asiento)}
                      aria-label={`Asiento ${asiento.numero}, ${isOcupado ? 'ocupado' : 'disponible'}`}
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
                className={`pago-option ${metodoPago === 'creditos' ? 'selected' : ''} ${holdActive || procesando || procesandoPagoYape || creditos === 0 ? 'disabled' : ''}`}
                onClick={() => !holdActive && !procesando && !procesandoPagoYape && creditos > 0 && handleSelectPago('creditos')}
                title={creditos === 0 ? 'No tienes créditos disponibles' : 'Usar un crédito disponible como método de pago'}
              >
                <CreditCard size={32} />
                <span>Usar Créditos</span>
                <small>{creditosError ? 'Error al cargar' : creditos > 0 ? `${creditos} disponible${creditos > 1 ? 's' : ''}` : 'Sin créditos'}</small>
              </div>
              <div
                className={`pago-option ${metodoPago === 'yape' ? 'selected' : ''} ${holdActive || procesando || procesandoPagoYape ? 'disabled' : ''}`}
                onClick={() => !holdActive && !procesando && !procesandoPagoYape && handleSelectPago('yape')}
                title="Pagar con Yape"
              >
                <Smartphone size={32} />
                <span>Yape</span>
                <small>{user?.telefono || 'Pago móvil'}</small>
              </div>
            </div>
          </div>
        </>
      )}

      {holdActive && metodoPago === 'yape' && error && (
        <Button
          onClick={() => { setError(''); openCulqiYape(holdId, precio) }}
          disabled={pagandoYape}
          style={{ marginTop: '0.5rem' }}
        >
          {pagandoYape ? 'Abriendo Culqi...' : 'Reintentar pago Yape'}
        </Button>
      )}

      {!loading && !holdActive && (
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
          {metodoPago === 'yape'
            ? 'Tu asiento será reservado temporalmente por 5 minutos mientras completas el pago.'
            : 'Al pagar con créditos tu inscripción es inmediata.'
          }
        </p>
      )}

      {!loading && (
        <Button
          className="btn-inscribir"
          onClick={handlePagar}
          disabled={!selectedSeat || !metodoPago || holdActive || holdExpired || procesando || pagandoYape || procesandoPagoYape}
          title={holdActive ? 'Completa el pago para continuar' : 'Confirmar asiento y procesar el pago'}
        >
          {procesando ? 'Procesando...' : pagandoYape ? 'Abriendo Culqi...' : procesandoPagoYape ? 'Confirmando pago...' : holdActive ? 'Reserva en curso...' : 'Pagar e inscribirme'}
        </Button>
      )}

      <Modal isOpen={showResumenModal} onClose={handleCancelarInscripcion} title="Confirmar inscripción">
        <p className="modal-subtitle">Revisa los datos antes de confirmar</p>
        <div className="resumen-detalle">
          <div className="resumen-row">
            <span className="resumen-label">Clase</span>
            <span className="resumen-value">{clase?.categoria?.nombre} · {instrName}</span>
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
