import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Calendar, CalendarPlus, Clock, ToggleLeft, ToggleRight, AlertCircle, AlertTriangle, CheckCircle, FilterX } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import HorarioSemanalForm from './HorarioSemanalForm'
import api from '../../services/api'
import { useFlashMessage } from '../../hooks/useFlashMessage'
import { DIAS_SEMANA, formatHoraAMPM, formatFechaBonita, mensajeError } from '../../utils/helpers'

// Crear/editar/activar/extender/eliminar un horario genera o cancela clases y afecta
// al dashboard, por eso se invalidan también esos listados.
const CACHE_KEYS = ['GET /horarios', 'GET /clases', 'GET /dashboard']

// Fecha (YYYY-MM-DD) de hoy y del fin del mes siguiente, para el modal de extender
function hoyStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function finDeMesSiguiente() {
  const d = new Date()
  const fin = new Date(d.getFullYear(), d.getMonth() + 2, 0)
  return `${fin.getFullYear()}-${String(fin.getMonth() + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`
}

const diaLabel = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
}

function fetchHorariosData() {
  return Promise.all([
    api.cachedGet('/horarios'),
    api.cachedGet('/instructores'),
    api.cachedGet('/categorias'),
  ])
}

export default function HorariosSemanales() {
  const [horarios, setHorarios] = useState([])
  const [instructores, setInstructores] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filtroInstructor, setFiltroInstructor] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroDia, setFiltroDia] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useFlashMessage()
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  // Desactivar un horario: preguntar si cancelar también sus clases futuras
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  // Extender: generar más clases de un horario hasta una nueva fecha
  const [extendTarget, setExtendTarget] = useState(null)
  const [extendHasta, setExtendHasta] = useState('')
  const [extendError, setExtendError] = useState('')
  const [extending, setExtending] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    setError('')
    fetchHorariosData()
      .then(([hData, iData, cData]) => {
        if (mounted) {
          setHorarios(hData.horarios)
          setInstructores(iData.instructores)
          setCategorias(cData.categorias)
        }
      })
      .catch(e => { if (mounted) setError(mensajeError(e, 'No se pudieron cargar los horarios.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const cargar = async () => {
    try {
      const [hData, iData, cData] = await fetchHorariosData()
      setHorarios(hData.horarios)
      setInstructores(iData.instructores)
      setCategorias(cData.categorias)
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los horarios.'))
    } finally {
      setLoading(false)
    }
  }

  const filteredHorarios = useMemo(() =>
    horarios.filter(h => {
      if (filtroInstructor && h.instructor.id !== parseInt(filtroInstructor)) return false
      if (filtroCategoria && h.categoria.id !== parseInt(filtroCategoria)) return false
      if (filtroDia && h.diaSemana !== filtroDia) return false
      return true
    }), [horarios, filtroInstructor, filtroCategoria, filtroDia]
  )

  const hayFiltros = filtroInstructor || filtroCategoria || filtroDia

  const limpiarFiltros = () => {
    setFiltroInstructor('')
    setFiltroCategoria('')
    setFiltroDia('')
  }

  const columns = [
    { key: 'instructor', label: 'Instructor', render: (val) => (
      <span style={{ fontWeight: 600 }}>{val.nombres} {val.apellidos}</span>
    )},
    { key: 'categoria', label: 'Categoría', render: (val) => val.nombre },
    { key: 'diaSemana', label: 'Día', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {diaLabel[val] || val}
      </span>
    )},
    { key: 'horario', label: 'Horario', render: (_, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={14} className="icon-muted" />
        {formatHoraAMPM(row.horaInicio)} — {formatHoraAMPM(row.horaFin)}
      </span>
    )},
    { key: 'activo', label: 'Estado', render: (val, row) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
        <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
        {val && row.proximasClases === 0 && (
          <span className="status-badge status-warning" title="Este horario ya no tiene clases futuras generadas" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertTriangle size={12} /> Sin clases próximas
          </span>
        )}
      </div>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        {row.activo && (
          <Button size="small" variant="ghost" onClick={() => openExtend(row)} title="Generar más clases">
            <CalendarPlus size={16} className="icon-primary" />
          </Button>
        )}
        <Button size="small" variant="ghost" onClick={() => handleToggle(row)} title={row.activo ? 'Desactivar' : 'Activar'}>
          {row.activo ? <ToggleRight size={16} className="icon-success" /> : <ToggleLeft size={16} className="icon-muted" />}
        </Button>
        <Button size="small" variant="ghost" onClick={() => handleEdit(row)} title="Editar">
          <Edit2 size={16} />
        </Button>
        <Button size="small" variant="ghost" onClick={() => handleDelete(row)} title="Eliminar" className="icon-danger">
          <Trash2 size={16} />
        </Button>
      </div>
    )},
  ]

  const handleCreate = () => {
    setEditing(null)
    setFormError('')
    setModalOpen(true)
  }

  const handleEdit = (h) => {
    setEditing(h)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormError('')
  }

  // Activar es directo; desactivar abre un modal para decidir qué hacer con las clases futuras
  const handleToggle = (h) => {
    if (h.activo) {
      setDeactivateTarget(h)
    } else {
      doToggle(h, false)
    }
  }

  const doToggle = async (h, cancelarFuturas) => {
    setError('')
    setMensaje('')
    try {
      const result = await api.patch(`/horarios/${h.id}/status`, { cancelarFuturas })
      api.invalidateCache(CACHE_KEYS)
      setDeactivateTarget(null)
      if (result.cancelacion?.clasesCanceladas > 0) {
        const { clasesCanceladas, creditosGenerados } = result.cancelacion
        setMensaje(
          `Horario desactivado. Se cancelaron ${clasesCanceladas} clase(s) futura(s)` +
          (creditosGenerados > 0 ? ` y se generaron ${creditosGenerados} crédito(s).` : '.')
        )
        await cargar()
      } else {
        setHorarios(horarios.map(x => x.id === h.id ? { ...x, activo: result.activo } : x))
        setMensaje(result.activo ? 'Horario activado.' : 'Horario desactivado. Las clases ya agendadas se mantienen.')
      }
    } catch (e) {
      setDeactivateTarget(null)
      setError(mensajeError(e, 'No se pudo cambiar el estado del horario.'))
    }
  }

  const openExtend = (h) => {
    setExtendTarget(h)
    setExtendHasta(finDeMesSiguiente())
    setExtendError('')
  }

  const doExtend = async () => {
    if (!extendTarget) return
    if (!extendHasta || extendHasta < hoyStr()) {
      setExtendError('Elige una fecha de hoy en adelante.')
      return
    }
    setExtending(true)
    setError('')
    setMensaje('')
    try {
      const r = await api.post(`/horarios/${extendTarget.id}/generar`, { hasta: extendHasta })
      api.invalidateCache(CACHE_KEYS)
      setExtendTarget(null)
      setMensaje(
        r.creadas > 0
          ? `Se generaron ${r.creadas} clase(s) nueva(s) hasta el ${formatFechaBonita(extendHasta)}.`
          : `No había clases nuevas por crear hasta esa fecha (ya estaban todas).`
      )
      await cargar()
    } catch (e) {
      setExtendError(mensajeError(e, 'No se pudieron generar las clases.'))
    } finally {
      setExtending(false)
    }
  }

  const handleDelete = (h) => {
    setDeleteTarget(h)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setError('')
    try {
      await api.del(`/horarios/${deleteTarget.id}`)
      api.invalidateCache(CACHE_KEYS)
      setHorarios(horarios.filter(x => x.id !== deleteTarget.id))
    } catch (e) {
      setError(mensajeError(e, 'No se pudo eliminar el horario.'))
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleSave = async (formData) => {
    setFormError('')
    setMensaje('')
    try {
      if (editing) {
        const data = await api.put(`/horarios/${editing.id}`, formData)
        setHorarios(horarios.map(h => h.id === editing.id ? { ...h, ...data.horario } : h))
        setMensaje('Horario actualizado.')
      } else {
        const data = await api.post('/horarios', formData)
        setHorarios([...horarios, data.horario])
        const creadas = data.generacion?.creadas ?? 0
        setMensaje(
          creadas > 0
            ? `Horario creado. Se generaron ${creadas} clase(s) hasta el ${formatFechaBonita(formData.generarHasta)}.`
            : 'Horario creado. Aún no había fechas por generar hasta la fecha elegida.'
        )
      }
      api.invalidateCache(CACHE_KEYS)
      closeModal()
    } catch (e) {
      setFormError(mensajeError(e, 'No se pudo guardar el horario.'))
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div>
      <div className="page-header">
        <h1>
          <Calendar size={28} />
          Horarios Semanales
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Horario
        </Button>
      </div>

      <div className="filters" style={{ marginBottom: '1rem' }}>
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
          label="Categoría"
          name="filtroCategoria"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          options={[
            { value: '', label: 'Todas las categorías' },
            ...categorias.map(c => ({ value: c.id, label: c.nombre })),
          ]}
        />
        <Select
          label="Día"
          name="filtroDia"
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
          options={[
            { value: '', label: 'Todos los días' },
            ...DIAS_SEMANA.map(d => ({ value: d, label: d.charAt(0) + d.slice(1).toLowerCase() })),
          ]}
        />
        {hayFiltros && (
          <Button
            variant="ghost"
            size="small"
            onClick={limpiarFiltros}
            className="filters-clear"
            title="Quitar todos los filtros"
          >
            <FilterX size={15} />
            Limpiar filtros
          </Button>
        )}
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

      <Table columns={columns} data={filteredHorarios} emptyMessage="No hay horarios registrados" />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Horario Semanal' : 'Nuevo Horario Semanal'}
        size="large"
      >
        <p className="modal-subtitle">
          {editing
            ? 'Modifica el horario semanal del instructor'
            : 'Configura un nuevo horario semanal recurrente'}
        </p>
        {formError && (
          <Alert type="danger">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </Alert>
        )}
        <HorarioSemanalForm
          initialData={editing}
          onSave={handleSave}
          onCancel={closeModal}
          instructores={instructores}
          categorias={categorias}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar horario"
      >
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Seguro que deseas eliminar el horario de{' '}
          <strong>{deleteTarget ? `${deleteTarget.instructor.nombres} ${deleteTarget.instructor.apellidos}` : ''}</strong>
          {deleteTarget ? ` (${diaLabel[deleteTarget.diaSemana]})` : ''}? Esta acción no se puede deshacer.
        </p>
        <div className="form-actions">
          <Button variant="danger" onClick={confirmDelete}>Sí, eliminar</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Desactivar horario"
      >
        {deactivateTarget && (
          <>
            <p style={{ marginBottom: '0.75rem' }}>
              Vas a desactivar el horario de{' '}
              <strong>{deactivateTarget.instructor.nombres} {deactivateTarget.instructor.apellidos}</strong>
              {` (${diaLabel[deactivateTarget.diaSemana]} ${formatHoraAMPM(deactivateTarget.horaInicio)})`}.
              No se generarán nuevas clases mientras esté inactivo.
            </p>
            {deactivateTarget.proximasClases > 0 ? (
              <p className="modal-subtitle" style={{ marginBottom: '1.25rem' }}>
                Este horario tiene <strong>{deactivateTarget.proximasClases} clase(s) futura(s)</strong> ya agendada(s).
                ¿Qué quieres hacer con ellas?
              </p>
            ) : (
              <p className="modal-subtitle" style={{ marginBottom: '1.25rem' }}>
                Este horario no tiene clases futuras agendadas.
              </p>
            )}
            <div className="form-actions" style={{ flexWrap: 'wrap' }}>
              {deactivateTarget.proximasClases > 0 && (
                <Button variant="danger" onClick={() => doToggle(deactivateTarget, true)}>
                  Desactivar y cancelar las {deactivateTarget.proximasClases} futuras
                </Button>
              )}
              <Button variant="secondary" onClick={() => doToggle(deactivateTarget, false)}>
                {deactivateTarget.proximasClases > 0 ? 'Solo desactivar (mantener clases)' : 'Desactivar'}
              </Button>
              <Button variant="ghost" onClick={() => setDeactivateTarget(null)}>Cancelar</Button>
            </div>
          </>
        )}
      </Modal>

      <Modal
        isOpen={!!extendTarget}
        onClose={() => setExtendTarget(null)}
        title="Generar más clases"
      >
        {extendTarget && (
          <>
            <p className="modal-subtitle">
              Se crearán las clases de{' '}
              <strong>{extendTarget.instructor.nombres} {extendTarget.instructor.apellidos}</strong>
              {` (${diaLabel[extendTarget.diaSemana]} ${formatHoraAMPM(extendTarget.horaInicio)})`}, semana a
              semana, hasta la fecha que elijas. Las que ya existan se omiten.
            </p>
            {extendError && (
              <Alert type="danger">
                <AlertCircle size={18} />
                <span>{extendError}</span>
              </Alert>
            )}
            <div className="form-group">
              <label htmlFor="extendHasta">Generar clases hasta</label>
              <input
                id="extendHasta"
                type="date"
                value={extendHasta}
                min={hoyStr()}
                onChange={(e) => { if (extendError) setExtendError(''); setExtendHasta(e.target.value) }}
              />
            </div>
            <div className="form-actions">
              <Button onClick={doExtend} disabled={extending}>
                {extending ? 'Generando...' : 'Generar clases'}
              </Button>
              <Button variant="secondary" onClick={() => setExtendTarget(null)} disabled={extending}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
