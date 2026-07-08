import { useState, useMemo, useEffect } from 'react'
import { Music, Users, Clock, Calendar, XCircle, UserCheck, AlertTriangle, AlertCircle, CheckCircle, Search } from 'lucide-react'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../services/api'
import { useFlashMessage } from '../../hooks/useFlashMessage'
import { ESTADOS_CLASE, formatHoraAMPM, formatFechaBonita, mensajeError } from '../../utils/helpers'
import '../../App.css'

// Cancelar una clase cambia su estado, genera créditos y afecta al dashboard y al
// contador de "próximas clases" de los horarios.
const CACHE_KEYS = ['GET /clases', 'GET /dashboard', 'GET /horarios']

const estadoConfig = {
  PROGRAMADA: { label: 'Programada', className: 'status-info' },
  EN_CURSO: { label: 'En Curso', className: 'status-active' },
  CANCELADA: { label: 'Cancelada', className: 'status-inactive' },
  FINALIZADA: { label: 'Finalizada', className: 'status-warning' },
}

// Una clase con fecha anterior a hoy ya no se puede cancelar
function esClasePasada(fecha) {
  const now = new Date()
  const hoy = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return fecha < hoy
}

function fetchClasesData() {
  return Promise.all([
    api.cachedGet('/clases?limit=500'),
    api.cachedGet('/instructores'),
  ])
}

export default function Clases() {
  const cachedClases = api.getCached('/clases?limit=500')
  const cachedInstructores = api.getCached('/instructores')
  const [clases, setClases] = useState(() => cachedClases?.clases || [])
  const [instructores, setInstructores] = useState(() => cachedInstructores?.instructores || [])
  const [loading, setLoading] = useState(!cachedClases || !cachedInstructores)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroInstructor, setFiltroInstructor] = useState('')
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 10
  const [selectedClase, setSelectedClase] = useState(null)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [cancelTargetClase, setCancelTargetClase] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useFlashMessage()

  useEffect(() => {
    let mounted = true
    setError('')
    fetchClasesData()
      .then(([cData, iData]) => {
        if (mounted) {
          setClases(cData.clases)
          setInstructores(iData.instructores)
        }
      })
      .catch(e => { if (mounted) setError(mensajeError(e, 'No se pudieron cargar las clases.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const cargar = async () => {
    try {
      const [cData, iData] = await fetchClasesData()
      setClases(cData.clases)
      setInstructores(iData.instructores)
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar las clases.'))
    } finally {
      setLoading(false)
    }
  }

  // Debounce para búsqueda por texto (consulta al servidor)
  useEffect(() => {
    if (!busquedaTexto) return
    const timer = setTimeout(() => {
      let mounted = true
      api.get(`/clases?search=${encodeURIComponent(busquedaTexto)}&limit=500`)
        .then(res => { if (mounted) setClases(res.clases) })
        .catch(() => {})
      return () => { mounted = false }
    }, 300)
    return () => clearTimeout(timer)
  }, [busquedaTexto])

  const filteredClases = useMemo(() => {
    // Orden por estado: Programadas/activas (0) arriba, Canceladas (1) en medio, Finalizadas (2) al fondo
    const rango = (c) => {
      if (c.estado === 'FINALIZADA') return 2
      if (c.estado === 'CANCELADA') return 1
      return 0
    }

    return clases
      .filter(c => {
        if (filtroEstado && c.estado !== filtroEstado) return false
        if (filtroFecha && c.fecha !== filtroFecha) return false
        if (filtroInstructor && c.instructor?.id !== parseInt(filtroInstructor)) return false
        if (busquedaTexto) {
          const q = busquedaTexto.toLowerCase()
          const cat = c.categoria?.nombre?.toLowerCase() || ''
          const instr = c.instructor ? `${c.instructor.nombres} ${c.instructor.apellidos}`.toLowerCase() : ''
          const tema = (c.tematica || '').toLowerCase()
          if (!cat.includes(q) && !instr.includes(q) && !tema.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const ra = rango(a)
        const rb = rango(b)
        if (ra !== rb) return ra - rb
        // Dentro de cada grupo: próximas de la más cercana a la más lejana; cerradas de la más reciente primero
        const cmp = a.fecha.localeCompare(b.fecha) || (a.horaInicio || '').localeCompare(b.horaInicio || '')
        return ra === 0 ? cmp : -cmp
      })
  }, [clases, filtroEstado, filtroFecha, filtroInstructor, busquedaTexto])

  useEffect(() => { setPagina(1) }, [filtroEstado, filtroFecha, filtroInstructor, busquedaTexto]) // eslint-disable-line react-hooks/set-state-in-effect

  const totalPaginas = Math.max(1, Math.ceil(filteredClases.length / POR_PAGINA))
  const clasesPagina = filteredClases.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const columns = [
    { key: 'categoria', label: 'Clase', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={16} className="icon-primary" />
        <div>
          <div style={{ fontWeight: 600 }}>{val?.nombre}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            {row.instructor ? `${row.instructor.nombres} ${row.instructor.apellidos}` : '—'}
          </div>
        </div>
      </div>
    )},
    { key: 'fecha', label: 'Fecha', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {formatFechaBonita(val)}
      </span>
    )},
    { key: 'horario', label: 'Horario', render: (_, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={14} className="icon-muted" />
        {formatHoraAMPM(row.horaInicio)} — {formatHoraAMPM(row.horaFin)}
      </span>
    )},
    { key: 'cupos', label: 'Cupos', render: (_, row) => (
      <div>
        <div>{row.inscritos}/{row.capacidadMaxima}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          {Math.round((row.inscritos / row.capacidadMaxima) * 100)}%
        </div>
      </div>
    )},
    { key: 'estado', label: 'Estado', render: (val) => {
      const cfg = estadoConfig[val] || { label: val, className: '' }
      return (
        <span className={`status-badge ${cfg.className}`}>
          {val === 'CANCELADA' && <XCircle size={12} />}
          {val === 'EN_CURSO' && <UserCheck size={12} />}
          {val === 'FINALIZADA' && <AlertTriangle size={12} />}
          {cfg.label}
        </span>
      )
    }},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleViewParticipants(row)} title="Ver participantes">
          <Users size={16} />
        </Button>
          {row.estado === 'PROGRAMADA' && !esClasePasada(row.fecha) && (
            <Button size="small" variant="ghost" onClick={() => openCancelConfirm(row)} title="Cancelar clase" className="icon-danger">
              <XCircle size={16} />
            </Button>
          )}
      </div>
    )},
  ]

  const handleViewParticipants = async (clase) => {
    setError('')
    setSelectedClase(null)
    setParticipantsOpen(true)
    setParticipantsLoading(true)
    try {
      const data = await api.get(`/clases/${clase.id}`)
      setSelectedClase(data.clase)
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los participantes.'))
      setParticipantsOpen(false)
    } finally {
      setParticipantsLoading(false)
    }
  }

  const openCancelConfirm = (clase) => {
    setCancelTargetClase(clase)
    setCancelConfirmOpen(true)
  }

  const confirmCancel = async () => {
    if (!cancelTargetClase) return
    setCancelLoading(true)
    setError('')
    setMensaje('')
    try {
      const r = await api.patch(`/clases/${cancelTargetClase.id}/cancelar`)
      api.invalidateCache(CACHE_KEYS)
      setClases(clases.map(c =>
        c.id === cancelTargetClase.id ? { ...c, estado: 'CANCELADA' } : c
      ))
      setMensaje(r.creditosGenerados > 0
        ? `Clase cancelada. Se generaron ${r.creditosGenerados} crédito(s).`
        : 'Clase cancelada.')
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cancelar la clase.'))
    } finally {
      setCancelLoading(false)
      setCancelConfirmOpen(false)
      setCancelTargetClase(null)
    }
  }

  const getSeatColumns = (total) => {
    if (total <= 10) return 4
    if (total <= 20) return 5
    return 6
  }

  const isOcupado = (pos) => Array.isArray(pos.reservas) && pos.reservas.length > 0

  if (loading && !clases.length) return <LoadingScreen />

  return (
    <div>
      <div className="page-header">
        <h1>
          <Music size={28} />
          Clases Generadas
        </h1>
        <div className="filters">
          <div className="form-group">
            <label htmlFor="filtroFecha">Fecha</label>
            <input
              id="filtroFecha"
              name="filtroFecha"
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="filter-date"
            />
          </div>
          <Select
            label="Instructor"
            name="filtroInstructor"
            value={filtroInstructor}
            onChange={(e) => setFiltroInstructor(e.target.value)}
            options={[
              { value: '', label: 'Todos los instructores' },
              ...instructores.map(i => ({ value: i.id, label: `${i.nombres} ${i.apellidos}` })),
            ]}
          />
          <Select
            label="Estado"
            name="filtroEstado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              ...ESTADOS_CLASE.map(e => ({ value: e, label: e.charAt(0) + e.slice(1).toLowerCase() })),
            ]}
          />
        </div>
      </div>

      {error && (
        <Alert type="danger">
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <Button size="small" variant="secondary" onClick={cargar}>Reintentar</Button>
        </Alert>
      )}
      {mensaje && (
        <Alert type="success">
          <CheckCircle size={18} />
          <span>{mensaje}</span>
        </Alert>
      )}

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total</h3>
          <p>{clases.length}</p>
        </div>
        <div className="stat-card">
          <h3>Programadas</h3>
          <p style={{ color: 'var(--info)' }}>{clases.filter(c => c.estado === 'PROGRAMADA').length}</p>
        </div>
        <div className="stat-card">
          <h3>En Curso</h3>
          <p style={{ color: 'var(--info)' }}>{clases.filter(c => c.estado === 'EN_CURSO').length}</p>
        </div>
        <div className="stat-card">
          <h3>Canceladas</h3>
          <p style={{ color: 'var(--info)' }}>{clases.filter(c => c.estado === 'CANCELADA').length}</p>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
        <Input
          type="search"
          placeholder="Buscar por categoría, instructor o temática..."
          value={busquedaTexto}
          onChange={(e) => setBusquedaTexto(e.target.value)}
        />
      </div>

      <Table columns={columns} data={clasesPagina} emptyMessage="No hay clases generadas" />

      {filteredClases.length > POR_PAGINA && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--white)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filteredClases.length)} de {filteredClases.length} clases
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="small" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>
              ← Anterior
            </Button>
            <Button variant="secondary" size="small" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        title={participantsLoading && !selectedClase ? 'Cargando participantes...' : `Participantes: ${selectedClase?.categoria?.nombre || ''}`}
        size="large"
      >
        {participantsLoading && !selectedClase ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="processing-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Cargando participantes...</p>
          </div>
        ) : selectedClase && (
          <div>
            <div className="clase-info-summary">
              <p><strong>Instructor:</strong> {selectedClase.instructor ? `${selectedClase.instructor.nombres} ${selectedClase.instructor.apellidos}` : '—'}</p>
              <p><strong>Fecha:</strong> {formatFechaBonita(selectedClase.fecha)}</p>
              <p><strong>Horario:</strong> {formatHoraAMPM(selectedClase.horaInicio)} — {formatHoraAMPM(selectedClase.horaFin)}</p>
              <p><strong>Ocupación:</strong> {selectedClase.inscritos}/{selectedClase.capacidadMaxima}</p>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginRight: '1rem' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: '#e5e7eb', display: 'inline-block' }} /> Disponible
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: '#27AE60', display: 'inline-block' }} /> Ocupado
                </span>
              </p>
              <div
                className="seat-grid"
                style={{ '--columnas': getSeatColumns(selectedClase.capacidadMaxima) }}
              >
                {(selectedClase.posiciones || []).map(pos => (
                  <div
                    key={pos.id}
                    className={`seat ${isOcupado(pos) ? 'seat--occupied' : 'seat--available'}`}
                  >
                    {pos.numero}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={cancelConfirmOpen}
        onClose={() => { if (!cancelLoading) { setCancelConfirmOpen(false); setCancelTargetClase(null) } }}
        title="Cancelar clase"
      >
        {cancelTargetClase && (
          <>
            <div className="cancel-inscripcion-preview">
              <div className="cancel-inscripcion-info">
                <strong>{cancelTargetClase.categoria?.nombre}</strong>
                <span>{formatFechaBonita(cancelTargetClase.fecha)} — {formatHoraAMPM(cancelTargetClase.horaInicio)} a {formatHoraAMPM(cancelTargetClase.horaFin)}</span>
                <span>Instructor/a: {cancelTargetClase.instructor ? `${cancelTargetClase.instructor.nombres} ${cancelTargetClase.instructor.apellidos}` : '—'}</span>
              </div>
            </div>

            <AlertTriangle size={48} style={{ display: 'block', margin: '1rem auto', color: 'var(--warning)' }} />

            <p className="modal-subtitle" style={{ textAlign: 'center' }}>
              {cancelLoading
                ? 'Cancelando tu inscripción...'
                : cancelTargetClase.inscritos > 0
                  ? `Hay ${cancelTargetClase.inscritos} participante(s) registrados. Se generarán créditos automáticamente.`
                  : 'No hay participantes registrados para esta clase.'}
            </p>
            <p className="modal-subtitle" style={{ textAlign: 'center', fontWeight: 500, color: 'var(--danger-text)' }}>
              Esta acción no se puede deshacer.
            </p>

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => { setCancelConfirmOpen(false); setCancelTargetClase(null) }} disabled={cancelLoading}>
                No, mantener
              </Button>
              <Button variant="danger" onClick={confirmCancel} disabled={cancelLoading}>
                {cancelLoading ? 'Cancelando...' : 'Sí, cancelar clase'}
              </Button>
            </div>
          </>
        )}
      </Modal>

    </div>
  )
}
