import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../../context/useAuth'
import { CreditCard, Smartphone, ArrowLeft, AlertTriangle, AlertCircle, CheckCircle, Timer, User, Tag } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import api from '../../services/api'
import culqi from '../../services/culqi'
import LoadingScreen from '../../components/common/LoadingScreen'
import Stepper from '../../components/common/Stepper'
import Confetti from '../../components/common/Confetti'
import { formatFechaBonita, formatHoraAMPM, inscripcionBloqueada } from '../../utils/helpers'
import '../../App.css'

const STEPS = [
  { label: 'Categoría' },
  { label: 'Fecha y horario' },
  { label: 'Asiento' },
  { label: 'Confirmación' },
]

const HOLD_DURATION = 300

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function posicionToAsiento(p, columnas, miReserva) {
  let estado = p.reservas && p.reservas.length > 0 ? 'ocupado' : 'disponible'
  if (miReserva && p.numero === miReserva.asiento) estado = 'actual'
  return {
    id: p.id,
    numero: p.numero,
    fila: Math.ceil(p.numero / columnas),
    columna: ((p.numero - 1) % columnas) + 1,
    estado,
  }
}

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const STORAGE_KEY = `inscripcionExitosa_${id}`

  const savedSuccess = useMemo(() => {
    try {
      const d = sessionStorage.getItem(STORAGE_KEY)
      return d ? JSON.parse(d) : null
    } catch { return null }
  }, [STORAGE_KEY])

  const [clase, setClase] = useState(null)
  const [loading, setLoading] = useState(!savedSuccess)
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [metodoPago, setMetodoPago] = useState(null)
  const [holdSeconds, setHoldSeconds] = useState(HOLD_DURATION)
  const [holdActive, setHoldActive] = useState(false)
  const [holdId, setHoldId] = useState(null)
  const [holdCodigoPago, setHoldCodigoPago] = useState(null)
  const [holdExpired, setHoldExpired] = useState(false)
  const [showResumenModal, setShowResumenModal] = useState(false)
  const [inscripcionExitosa, setInscripcionExitosa] = useState(!!savedSuccess)
  const [inscripcionData, setInscripcionData] = useState(savedSuccess)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [claseError, setClaseError] = useState(null)
  const [pagandoYape, setPagandoYape] = useState(false)
  const [procesandoPagoYape, setProcesandoPagoYape] = useState(false)
  const holdIdRef = useRef(null)
  const [creditos, setCreditos] = useState(0)
  const [creditosError, setCreditosError] = useState(false)
  const [miReserva, setMiReserva] = useState(null)
  const [cambiandoAsientoLoading, setCambiandoAsientoLoading] = useState(false)
  const [cambioExitoso, setCambioExitoso] = useState(null)
  const [tooltipSeat, setTooltipSeat] = useState(null)
  const longPressRef = useRef(null)

  useEffect(() => {
    if (savedSuccess) return
    api.get(`/clases/${id}?soloActivas=true`).then(res => {
      setClase(res.clase)
      if (res.miReserva) {
        setMiReserva(res.miReserva)
      }
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
    return () => {
      culqi.close()
      if (holdIdRef.current) {
        api.patch(`/reservas/${holdIdRef.current}/cancelar`).catch(() => {})
      }
    }
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
    return clase.posiciones.map(p => posicionToAsiento(p, columnas, miReserva))
  }, [clase, columnas, miReserva])

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
    if (holdActive || cambiandoAsientoLoading) return
    if (miReserva) {
      if (seat.estado === 'ocupado' || seat.estado === 'actual') return
    } else {
      if (seat.estado !== 'disponible') return
    }
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

  const handleCambiarAsiento = async () => {
    if (!selectedSeat || !miReserva) return
    setCambiandoAsientoLoading(true)
    setError('')
    setCambioExitoso(null)
    try {
      await api.patch(`/reservas/${miReserva.id}/cambiar-asiento`, {
        nuevaPosicionClaseId: selectedSeat.id,
      })
      api.invalidateCache()
      const nuevoNumero = selectedSeat.numero
      setMiReserva(prev => ({ ...prev, asiento: nuevoNumero }))
      setSelectedSeat(null)
      setCambioExitoso(nuevoNumero)
      setTimeout(() => setCambioExitoso(null), 3000)
    } catch (e) {
      setError(e.data?.error || e.message || 'No pudimos cambiar tu asiento. Intenta de nuevo.')
    } finally {
      setCambiandoAsientoLoading(false)
    }
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
      const exitoData = {
        claseId: id,
        categoria: clase.categoria?.nombre,
        instructor: clase.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : '',
        fecha: clase.fecha,
        hora_inicio: clase.horaInicio,
        asiento: selectedSeat.numero,
        metodoPago: 'yape',
        tematica: clase.tematica || 'LIBRE',
        codigoPago: result.codigoPago,
        monto: result.monto,
      }
      setInscripcionData(exitoData)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(exitoData))
      setHoldActive(false)
      setInscripcionExitosa(true)
    } catch (e) {
      setError(e.data?.error || e.message || 'No pudimos completar el pago con Yape. Intenta de nuevo.')
      setHoldActive(false)
      if (e.status === 410 || e.status === 409 || e.status === 402) {
        setHoldId(null)
        setHoldCodigoPago(null)
        setSelectedSeat(null)
        setMetodoPago(null)
        setHoldExpired(true)
      }
    } finally {
      holdIdRef.current = null
      setPagandoYape(false)
      setProcesandoPagoYape(false)
      setProcesando(false)
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
        const exitoData = {
          claseId: id,
          categoria: clase.categoria?.nombre,
          instructor: clase.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : '',
          fecha: clase.fecha,
          hora_inicio: clase.horaInicio,
          asiento: selectedSeat.numero,
          metodoPago: 'creditos',
          tematica: clase.tematica || 'LIBRE',
          codigoPago: result.codigoPago,
          monto: result.monto,
        }
        setInscripcionData(exitoData)
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(exitoData))
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

        holdIdRef.current = result.holdId
        setHoldId(result.holdId)
        setHoldCodigoPago(result.codigoPago)
        setHoldActive(true)
        setHoldSeconds(HOLD_DURATION)

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

  if (!clase && !loading && !inscripcionExitosa) {
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
    const esCambio = inscripcionData.tipo === 'cambio'
    return (
      <div style={{ position: 'relative' }}>
        <Confetti />
        <Stepper steps={STEPS} currentStep={4} />
        <div className="breadcrumb">
          <span className="breadcrumb-item">{inscripcionData.categoria}</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item">{formatFechaBonita(inscripcionData.fecha)}</span>
        </div>
        <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div className="success-check-container">
          <div className="success-check-bg">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#059669" strokeWidth="3" fill="none" className="success-check-circle" />
              <path d="M12 20 L18 26 L28 14" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="success-check-path" />
            </svg>
          </div>
        </div>
        <h3>{esCambio ? 'Asiento cambiado exitosamente' : 'Inscripción confirmada'}</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{esCambio ? 'Tu asiento fue actualizado correctamente' : 'Tu inscripción fue confirmada correctamente'}</p>

        <div className="success-card-animate" style={{ marginTop: '1.5rem', textAlign: 'left', background: 'var(--gray-50)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
          {esCambio ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento anterior</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>#{inscripcionData.asientoAnterior}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Asiento nuevo</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>#{inscripcionData.asientoNuevo}</span>
              </div>
              {inscripcionData.codigoPago && (
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Código de cambio</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-medium)', fontFamily: 'monospace', fontSize: '0.95rem' }}>{inscripcionData.codigoPago}</span>
                </div>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Button onClick={() => { sessionStorage.removeItem(STORAGE_KEY); navigate('/cliente/mis-clases') }}>
            Ir a Mis Clases
          </Button>
          <Button variant="secondary" onClick={() => { sessionStorage.removeItem(STORAGE_KEY); navigate('/cliente/clases') }}>
            {esCambio ? 'Ver otras clases' : 'Reservar otra clase'}
          </Button>
        </div>
      </div>
      </div>
    )
  }

  const instrName = clase?.instructor ? `${clase.instructor.nombres} ${clase.instructor.apellidos}` : ''

  const volverAClases = () => {
    sessionStorage.removeItem(STORAGE_KEY)
    if (clase?.categoria?.nombre && clase?.fecha) {
      const params = new URLSearchParams({ cat: clase.categoria.nombre, fecha: clase.fecha })
      navigate(`/cliente/clases?${params.toString()}`)
    } else {
      navigate('/cliente/clases')
    }
  }

  return (
    <div className="detalle-clase" style={{ animation: 'fadeIn 0.3s ease' }}>
      <Stepper steps={STEPS} currentStep={2} onStepClick={(i) => i < 2 && volverAClases()} />

      {clase?.categoria?.nombre && clase?.fecha && (
        <div className="breadcrumb">
          <span className="breadcrumb-item clickable" onClick={volverAClases} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && volverAClases()}>
            Clases
          </span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item">{clase.categoria.nombre}</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-item">{formatFechaBonita(clase.fecha)} · {formatHoraAMPM(clase.horaInicio)}</span>
        </div>
      )}

      <button onClick={volverAClases} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Volver a Clases
      </button>

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

      {cambioExitoso && (
        <div className="alert alert-success" style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
          <CheckCircle size={18} />
          <span>Asiento cambiado a <strong>#{cambioExitoso}</strong></span>
        </div>
      )}

      {clase && inscripcionBloqueada(clase) && !holdActive && (
        <div className="inscripcion-closed-banner cancelled" style={{ marginTop: '0.5rem' }}>
          <AlertTriangle size={16} />
          <span>Las inscripciones se cierran 2 horas antes de que inicie la clase.</span>
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
          {!miReserva && (
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
          )}

          {!miReserva && (
            <div className="price-card">
              <Tag size={22} className="price-card-icon" />
              <span className="price-card-value">S/ {precio.toFixed(2)}</span>
            </div>
          )}

          <div className="seat-map-section">
            <div className="seat-stage">
              <User size={16} />
              <span>Instructor</span>
            </div>

            <div className="seat-legend" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', justifyItems: 'center' }}>
              <div className="seat-legend-item">
                <div className="seat-legend-dot disponible" />
                <span>Disponible</span>
              </div>
              {miReserva && (
                <div className="seat-legend-item">
                  <div className="seat-legend-dot actual" />
                  <span>Tu asiento</span>
                </div>
              )}
              <div className="seat-legend-item">
                <div className="seat-legend-dot ocupado" />
                <span>Ocupado</span>
              </div>
              <div className="seat-legend-item">
                <div className="seat-legend-dot seleccionado" />
                <span>Tu selección</span>
              </div>
            </div>

            {asientosAgrupados.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem 0', fontSize: '0.9rem' }}>
                No hay asientos disponibles para esta clase
              </p>
            ) : (
            <div className="seat-grid" style={{ '--columnas': columnas }}>
              {asientosAgrupados.map((fila, fi) =>
                fila.map(asiento => {
                  const isSelected = selectedSeat?.id === asiento.id
                  const isActual = asiento.estado === 'actual'
                  const isOcupado = asiento.estado === 'ocupado'
                  let seatClass = 'seat '
                  if (isActual) {
                    seatClass += 'actual'
                  } else if (isOcupado) {
                    seatClass += 'ocupado'
                  } else {
                    seatClass += 'disponible'
                  }
                  if (isSelected) seatClass += ' selected'

                  const handleTouchStart = () => {
                    longPressRef.current = setTimeout(() => {
                      setTooltipSeat({ asiento, isOcupado, isActual })
                    }, 500)
                  }
                  const handleTouchEnd = () => {
                    if (longPressRef.current) {
                      clearTimeout(longPressRef.current)
                      longPressRef.current = null
                    }
                    setTooltipSeat(null)
                  }

                  return (
                    <button
                      key={asiento.id}
                      className={seatClass}
                      disabled={isOcupado || isActual || holdActive || procesando || procesandoPagoYape || inscripcionBloqueada(clase) || cambiandoAsientoLoading}
                      onClick={() => handleSelectSeat(asiento)}
                      onMouseEnter={() => setTooltipSeat({ asiento, isOcupado, isActual })}
                      onMouseLeave={() => setTooltipSeat(null)}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      aria-label={`Asiento ${asiento.numero}, ${isOcupado ? 'ocupado' : isActual ? 'tu asiento' : 'disponible'}`}
                      style={{ gridRow: fi + 1, gridColumn: asiento.columna }}
                    >
                      {isActual ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>TÚ</span>
                      ) : (
                        <User size={22} />
                      )}
                      {tooltipSeat?.asiento?.id === asiento.id && (
                        <div className="seat-tooltip">
                          <span className="seat-tooltip-num">Asiento #{asiento.numero}</span>
                          <span className={`seat-tooltip-status ${isOcupado ? 'ocupado' : isActual ? 'actual' : 'disponible'}`}>
                            {isOcupado ? 'Ocupado' : isActual ? 'Tu asiento' : 'Disponible'}
                          </span>
                          {!isOcupado && !isActual && (
                            <span className="seat-tooltip-price">S/ {(clase?.precio || 15).toFixed(2)}</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
            )}
          </div>

          {!miReserva && (
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
          )}
        </>
      )}

      {holdId && metodoPago === 'yape' && error && (
        <Button
          onClick={() => { setError(''); openCulqiYape(holdId, precio) }}
          disabled={pagandoYape}
          style={{ marginTop: '0.5rem' }}
        >
          {pagandoYape ? 'Abriendo Culqi...' : 'Reintentar pago Yape'}
        </Button>
      )}

      {!loading && !holdActive && !miReserva && (
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
          {metodoPago === 'yape'
            ? 'Tu asiento será reservado temporalmente por 5 minutos mientras completas el pago.'
            : 'Al pagar con créditos tu inscripción es inmediata.'
          }
        </p>
      )}

      {!loading && miReserva ? (
        <Button
          className="btn-inscribir"
          onClick={handleCambiarAsiento}
          disabled={!selectedSeat || cambiandoAsientoLoading || inscripcionBloqueada(clase)}
          title={inscripcionBloqueada(clase) ? 'Las inscripciones se cierran 2 horas antes de la clase' : !selectedSeat ? 'Selecciona un asiento disponible' : 'Cambiar a este asiento'}
        >
          {cambiandoAsientoLoading ? 'Cambiando asiento...' : !selectedSeat ? 'Selecciona un asiento' : 'Cambiar a este asiento'}
        </Button>
      ) : !loading && (
        <Button
          className="btn-inscribir"
          onClick={handlePagar}
          disabled={!selectedSeat || !metodoPago || holdActive || holdExpired || procesando || pagandoYape || procesandoPagoYape || inscripcionBloqueada(clase)}
          title={holdActive ? 'Completa el pago para continuar' : inscripcionBloqueada(clase) ? 'Las inscripciones se cierran 2 horas antes de la clase' : 'Confirmar asiento y procesar el pago'}
        >
          {procesando ? 'Procesando...' : pagandoYape ? 'Abriendo Culqi...' : procesandoPagoYape ? 'Confirmando pago...' : holdActive ? 'Reserva en curso...' : inscripcionBloqueada(clase) ? 'Inscripciones cerradas' : 'Pagar e inscribirme'}
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
