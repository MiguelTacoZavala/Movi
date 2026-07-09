import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Users, Edit3, Check, X, QrCode, Camera, Search } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import api from '../../services/api'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import { formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import { Html5Qrcode } from 'html5-qrcode'
import '../../App.css'

function fetchParticipantes(id) {
  return api.cachedGet(`/instructores/clases/${id}/participantes`)
}

export default function DetalleClase() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [clase, setClase] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editandoTematica, setEditandoTematica] = useState(false)
  const [tematicaInput, setTematicaInput] = useState('')
  const [guardandoTematica, setGuardandoTematica] = useState(false)
  const [error, setError] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [codigoInput, setCodigoInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [qrError, setQrError] = useState(null)
  const [checkInLoading, setCheckInLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const qrRef = useRef(null)
  const html5QrRef = useRef(null)
  const lastScannedRef = useRef(null)

  useEffect(() => {
    let mounted = true
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    fetchParticipantes(id)
      .then(res => {
        if (mounted) {
          setClase(res.clase)
          setParticipantes(res.participantes || [])
          setError(null)
        }
      })
      .catch(() => {
        if (mounted) {
          setClase(null)
          setParticipantes([])
          setError('Tuvimos dificultades para obtener los detalles de esta clase. Por favor, inténtalo más tarde.')
        }
      })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  const iniciarEdicion = () => {
    setTematicaInput(clase?.tematica || 'LIBRE')
    setEditandoTematica(true)
  }

  const guardarTematica = async () => {
    const val = tematicaInput.trim() || 'LIBRE'
    setGuardandoTematica(true)
    try {
      await api.patch(`/instructores/clases/${id}/tematica`, { tematica: val })
      setClase(prev => ({ ...prev, tematica: val }))
      setEditandoTematica(false)
      setError(null)
      api.invalidateCache([
        '/instructores/mis-clases',
        '/instructores/dashboard',
        `/instructores/clases/${id}/participantes`
      ])
    } catch {
      setError('Ocurrió un error al guardar la temática. Por favor, inténtalo de nuevo.')
    } finally {
      setGuardandoTematica(false)
    }
  }

  const cancelarEdicion = () => {
    setEditandoTematica(false)
  }

  // Inicializar/limpiar escáner QR cuando scanning cambie
  useEffect(() => {
    if (!scanning) return

    lastScannedRef.current = null
    let cancelled = false

    const start = async () => {
      try {
        if (!html5QrRef.current) {
          html5QrRef.current = new Html5Qrcode('qr-reader')
        }
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (decodedText !== lastScannedRef.current) {
              await registrarCheckIn(decodedText)
            }
          },
          () => {}
        )
      } catch {
        if (!cancelled) {
          setQrError('No se pudo acceder a la cámara. Ingresa el código manualmente.')
          setScanning(false)
        }
      }
    }

    start()

    return () => {
      cancelled = true
      if (html5QrRef.current) {
        try { html5QrRef.current.stop() } catch {}
      }
    }
  }, [scanning])

  const registrarCheckIn = async (codigoPago) => {
    if (!codigoPago || !codigoPago.trim()) return
    setCheckInLoading(true)
    setQrError(null)
    lastScannedRef.current = codigoPago.trim().toUpperCase()
    try {
      const res = await api.post(`/instructores/clases/${id}/check-in`, { codigoPago: codigoPago.trim().toUpperCase() })
      setParticipantes(prev => prev.map(p =>
        p.codigoPago === codigoPago.trim().toUpperCase() ? { ...p, asistio: true } : p
      ))
      api.invalidateCache([`/instructores/clases/${id}/participantes`])
      setCodigoInput('')
      setSuccessMsg(`✔ ${res.codigoPago || 'Asistencia registrada'}`)
      setTimeout(() => setSuccessMsg(null), 2000)
    } catch (err) {
      setQrError(err.error || 'Error al registrar asistencia')
    } finally {
      setCheckInLoading(false)
    }
  }

  const iniciarEscaneo = () => {
    setQrError(null)
    setSuccessMsg(null)
    setScanning(true)
  }

  const detenerEscaneo = () => {
    setScanning(false)
  }

  const abrirQrModal = () => {
    setCodigoInput('')
    setQrError(null)
    setScanning(false)
    setQrModalOpen(true)
  }

  const cerrarQrModal = useCallback(() => {
    setScanning(false)
    setQrModalOpen(false)
  }, [])

  if (loading) return <LoadingScreen />

  if (!clase) {
    return (
      <div className="empty-state">
        {error && <div style={{ marginBottom: '1rem', width: '100%' }}><Alert type="danger">{error}</Alert></div>}
        <h3>Clase no encontrada</h3>
        <p>La clase solicitada no existe</p>
        <Button onClick={() => navigate('/instructor/clases')} style={{ marginTop: '1rem' }}>
          Volver a Clases
        </Button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate('/instructor/clases')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem' }} aria-label="Volver a la lista de clases">
        <ArrowLeft size={18} aria-hidden="true" />
        Volver a Clases
      </button>

      {error && <div style={{ marginBottom: '1rem' }}><Alert type="danger">{error}</Alert></div>}

      <div className="client-card" style={{ marginBottom: '1rem' }}>
        <div className="client-card-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              {clase.categoria || 'Clase'}
            </h2>
            <span className={`status-badge ${clase.estado === 'EN_CURSO' ? 'status-active' : clase.estado === 'CANCELADA' ? 'status-danger' : clase.estado === 'FINALIZADA' ? 'status-warning' : 'status-info'}`}>
              {clase.estado === 'EN_CURSO' ? 'En Curso' : clase.estado === 'CANCELADA' ? 'Cancelada' : clase.estado === 'FINALIZADA' ? 'Finalizada' : 'Programada'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} className="icon-muted" aria-hidden="true" />
              {formatFechaBonita(clase.fecha)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} className="icon-muted" aria-hidden="true" />
              {formatHoraAMPM(clase.horaInicio)} — {formatHoraAMPM(clase.horaFin)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} className="icon-muted" aria-hidden="true" />
              {participantes.length}/{clase.capacidadMaxima || 0} participantes
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Temática:</span>
              {editandoTematica ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={tematicaInput}
                    onChange={e => setTematicaInput(e.target.value)}
                    maxLength={100}
                    style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.9rem', width: '180px' }}
                    placeholder="LIBRE"
                    autoFocus
                    aria-label="Campo temática de clase"
                  />
                  <button onClick={() => setConfirmModalOpen(true)} style={{ background: 'var(--success)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }} aria-label="Confirmar cambio de temática" title="Confirmar cambio de temática">
                    <Check size={14} aria-hidden="true" />
                  </button>
                  <button onClick={cancelarEdicion} style={{ background: 'var(--gray-200)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }} aria-label="Cancelar edición de temática" title="Cancelar edición de temática">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{clase.tematica || 'LIBRE'}</span>
              )}
            </div>
            {!editandoTematica && (
              <button onClick={iniciarEdicion} title="Cambiar la temática de la clase" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-medium)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }} aria-label="Editar temática de la clase">
                <Edit3 size={14} aria-hidden="true" />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="client-card">
        <div className="client-card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="icon-primary" aria-hidden="true" />
            Participantes ({participantes.length})
          </div>
          <Button size="small" variant="ghost" onClick={abrirQrModal} title="Escanear QR o ingresar código">
            <QrCode size={16} />
            Registrar asistencia
          </Button>
        </div>
        <div className="client-card-content">
          {participantes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '1rem 0' }}>
              No hay participantes registrados
            </p>
          ) : (
            participantes.map((p, i) => (
              <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: p.asistio ? 'var(--success-soft, #d1fae5)' : 'var(--gray-50)', borderRadius: '8px', marginBottom: '0.5rem', animation: 'fadeInUp 0.35s ease both', animationDelay: `${i * 0.05}s`, borderLeft: p.asistio ? '3px solid var(--success, #10b981)' : '3px solid var(--gray-300)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: p.asistio ? 'var(--success-soft, #d1fae5)' : 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.asistio ? 'var(--success, #10b981)' : 'var(--primary-medium)', fontWeight: 600, fontSize: '0.85rem' }} aria-hidden="true">
                  {p.nombres?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--gray-900)' }}>
                    {p.nombres} {p.apellidos}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Asiento {p.asiento}</div>
                </div>
                {p.asistio ? (
                  <span style={{ color: 'var(--success, #10b981)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    ✔ Asistió
                  </span>
                ) : (
                  <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    ● Ausente
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar Cambio de Temática"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            ¿Estás seguro de que deseas cambiar la temática de la clase a <strong>"{tematicaInput}"</strong>? 
            Este cambio será visible inmediatamente para todos los alumnos inscritos.
          </p>
          <div className="modal-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button 
              onClick={async () => {
                try {
                  await guardarTematica()
                } finally {
                  setConfirmModalOpen(false)
                }
              }}
              disabled={guardandoTematica}
            >
              {guardandoTematica ? 'Guardando...' : 'Confirmar'}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={qrModalOpen} onClose={cerrarQrModal} title="Registrar asistencia">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          {!scanning ? (
            <>
              {successMsg && (
                <Alert type="success">{successMsg}</Alert>
              )}
              {qrError && <Alert type="danger">{qrError}</Alert>}

              <Button onClick={iniciarEscaneo} style={{ width: '100%', padding: '0.75rem' }}>
                <Camera size={18} style={{ marginRight: '0.5rem' }} />
                Escanear QR
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-400)' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                <span style={{ fontSize: '0.85rem' }}>o ingresa el código</span>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={codigoInput}
                  onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                  placeholder="MOV-AB3X9K"
                  style={{
                    flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px',
                    border: '1px solid var(--gray-300)', fontSize: '0.95rem',
                    fontFamily: 'monospace', letterSpacing: '0.5px'
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && codigoInput.trim()) registrarCheckIn(codigoInput) }}
                  aria-label="Ingresar código de pago"
                />
                <Button
                  onClick={() => registrarCheckIn(codigoInput)}
                  disabled={!codigoInput.trim() || checkInLoading}
                >
                  {checkInLoading ? '...' : <Search size={16} />}
                </Button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div
                id="qr-reader"
                ref={qrRef}
                style={{ width: '300px', maxWidth: '100%', margin: '0 auto', borderRadius: '8px', overflow: 'hidden' }}
              />
              {successMsg && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Alert type="success">{successMsg}</Alert>
                </div>
              )}
              {qrError && <Alert type="danger">{qrError}</Alert>}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem' }}>
                <Button variant="secondary" onClick={cerrarQrModal}>
                  Listo
                </Button>
                <Button variant="ghost" onClick={detenerEscaneo}>
                  Cancelar escaneo
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
