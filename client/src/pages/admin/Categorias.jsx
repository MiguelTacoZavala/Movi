import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Music2, AlertCircle } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Alert from '../../components/common/Alert'
import CategoriaForm from './CategoriaForm'
import api from '../../services/api'
import { mensajeError } from '../../utils/helpers'
import '../../App.css'

// Al cambiar una categoría se invalidan también los listados que la muestran embebida
// (su nombre aparece en horarios, clases y el dashboard).
const CACHE_KEYS = ['GET /categorias', 'GET /horarios', 'GET /clases', 'GET /dashboard']

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const cargar = async () => {
    try {
      const data = await api.cachedGet('/categorias')
      setCategorias(data.categorias)
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar las categorías.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const columns = [
    { key: 'nombre', label: 'Categoría', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music2 size={16} className="icon-primary" />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )},
    { key: 'descripcion', label: 'Descripción', render: (val) => (
      <span style={{ color: 'var(--gray-500)' }}>{val || '—'}</span>
    )},
    { key: 'precio', label: 'Precio', render: (val) => (
      <span style={{ fontWeight: 600 }}>S/ {Number(val).toFixed(2)}</span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
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

  const handleEdit = (cat) => {
    setEditing(cat)
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormError('')
  }

  const handleDelete = (cat) => {
    setDeleteTarget(cat)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setError('')
    try {
      await api.del(`/categorias/${deleteTarget.id}`)
      api.invalidateCache(CACHE_KEYS)
      setCategorias(categorias.filter(c => c.id !== deleteTarget.id))
    } catch (e) {
      setError(mensajeError(e, 'No se pudo eliminar la categoría.'))
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleSave = async (formData) => {
    setFormError('')
    try {
      if (editing) {
        const data = await api.put(`/categorias/${editing.id}`, formData)
        setCategorias(categorias.map(c => c.id === editing.id ? data.categoria : c))
      } else {
        const data = await api.post('/categorias', formData)
        setCategorias([...categorias, data.categoria])
      }
      api.invalidateCache(CACHE_KEYS)
      closeModal()
    } catch (e) {
      setFormError(mensajeError(e, 'No se pudo guardar la categoría.'))
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>
          <Music2 size={28} />
          Categorías de Baile
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Nueva Categoría
        </Button>
      </div>

      {error && (
        <Alert type="danger">
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <Button size="small" variant="secondary" onClick={cargar}>Reintentar</Button>
        </Alert>
      )}

      <Table columns={columns} data={categorias} emptyMessage="No hay categorías registradas" />

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <p className="modal-subtitle">
          {editing ? 'Modifica los datos de la categoría' : 'Registra una nueva categoría de baile'}
        </p>
        {formError && (
          <Alert type="danger">
            <AlertCircle size={18} />
            <span>{formError}</span>
          </Alert>
        )}
        <CategoriaForm
          initialData={editing}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar categoría"
      >
        <p style={{ marginBottom: '1.5rem' }}>
          ¿Seguro que deseas eliminar la categoría <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="form-actions">
          <Button variant="danger" onClick={confirmDelete}>Sí, eliminar</Button>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  )
}
