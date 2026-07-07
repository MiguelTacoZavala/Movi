import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, User, Phone, UserCheck, UserX, Mail, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import InstructorForm from './InstructorForm'
import api from '../../services/api'
import { useFlashMessage } from '../../hooks/useFlashMessage'
import { mensajeError } from '../../utils/helpers'
import '../../App.css'

// Un instructor aparece embebido en horarios, clases y el dashboard, así que al
// crearlo/editarlo/cambiar su estado se invalidan también esos listados.
const CACHE_KEYS = ['GET /instructores', 'GET /horarios', 'GET /clases', 'GET /dashboard']

function fetchInstructoresData() {
  return api.cachedGet('/instructores')
}

export default function Instructores() {
  const [instructores, setInstructores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [mensaje, setMensaje] = useFlashMessage()

  useEffect(() => {
    let mounted = true
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    setError('')
    fetchInstructoresData()
      .then(res => { if (mounted) setInstructores(res.instructores) })
      .catch(e => { if (mounted) setError(mensajeError(e, 'No se pudieron cargar los instructores.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const cargar = async () => {
    try {
      const data = await fetchInstructoresData()
      setInstructores(data.instructores)
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los instructores.'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'nombres', label: 'Instructor', render: (_, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {row.fotoUrl ? (
            <img src={row.fotoUrl} alt={`${row.nombres} ${row.apellidos}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={20} className="icon-primary" />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{row.nombres} {row.apellidos}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{row.especialidad}</div>
        </div>
      </div>
    )},
    { key: 'email', label: 'Email', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Mail size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'telefono', label: 'Contacto', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Phone size={14} className="icon-muted" /> {val || '—'}
      </span>
    )},
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>
        {val ? <UserCheck size={12} /> : <UserX size={12} />}
        {val ? 'Activo' : 'Inactivo'}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleEdit(row)} title="Editar">
          <Edit2 size={16} />
        </Button>
        <Button size="small" variant="ghost" onClick={() => handleToggleStatus(row)} title={row.estado ? 'Desactivar' : 'Activar'} className={row.estado ? 'icon-danger' : 'icon-success'}>
          {row.estado ? <UserX size={16} /> : <UserCheck size={16} />}
        </Button>
        <Button size="small" variant="ghost" onClick={() => handleDelete(row)} title="Eliminar" className="icon-danger">
          <Trash2 size={16} />
        </Button>
      </div>
    )},
  ]

  const handleCreate = () => {
    setEditingInstructor(null)
    setFormError('')
    setModalOpen(true)
  }

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormError('')
  }

  const handleToggleStatus = async (instructor) => {
    setError('')
    try {
      const data = await api.patch(`/instructores/${instructor.id}/estado`)
      api.invalidateCache(CACHE_KEYS)
      setInstructores(instructores.map(inst =>
        inst.id === instructor.id ? data.instructor : inst
      ))
      setMensaje(`${data.instructor.nombres} ${data.instructor.apellidos} ${data.instructor.estado ? 'activado' : 'desactivado'}.`)
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cambiar el estado del instructor.'))
    }
  }

  const handleDelete = (instructor) => {
    setDeleteTarget(instructor)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setError('')
    const { id, nombres, apellidos } = deleteTarget
    try {
      await api.del(`/instructores/${id}`)
      api.invalidateCache(CACHE_KEYS)
      setInstructores(instructores.filter(inst => inst.id !== id))
      setMensaje(`Instructor ${nombres} ${apellidos} eliminado.`)
    } catch (e) {
      setError(mensajeError(e, 'No se pudo eliminar el instructor.'))
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleSave = async (formData) => {
    setFormError('')
    try {
      if (editingInstructor) {
        const data = await api.put(`/instructores/${editingInstructor.id}`, formData)
        setInstructores(instructores.map(inst =>
          inst.id === editingInstructor.id ? data.instructor : inst
        ))
        setMensaje(`Instructor ${data.instructor.nombres} ${data.instructor.apellidos} actualizado.`)
      } else {
        const data = await api.post('/instructores', formData)
        setInstructores([...instructores, data.instructor])
        setMensaje(`Instructor ${data.instructor.nombres} ${data.instructor.apellidos} creado.`)
      }
      api.invalidateCache(CACHE_KEYS)
      closeModal()
    } catch (e) {
      setFormError(mensajeError(e, 'No se pudo guardar el instructor.'))
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div>
      <div className="page-header">
        <h1>
          <User size={28} />
          Gestión de Instructores
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Instructor
        </Button>
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

      <Table columns={columns} data={instructores} emptyMessage="No hay instructores registrados" />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
      >
        <p className="modal-subtitle">
          {editingInstructor ? 'Modifica los datos del instructor' : 'Completa la información para registrar un nuevo instructor'}
        </p>
        {formError && (
          <Alert type="danger">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </Alert>
        )}
        <InstructorForm
          initialData={editingInstructor}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar instructor"
      >
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Seguro que deseas eliminar al instructor <strong>{deleteTarget?.nombres} {deleteTarget?.apellidos}</strong>? Esta acción es permanente y no se puede deshacer.
          Si el instructor ya tiene horarios o clases asociadas, no podrá eliminarse; en ese caso desactívalo.
        </p>
        <div className="form-actions">
          <Button variant="danger" onClick={confirmDelete}>Sí, eliminar</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  )
}
