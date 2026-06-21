import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Music2 } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import CategoriaForm from './CategoriaForm'
import api from '../../services/api'
import '../../App.css'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const cargar = async () => {
    try {
      const data = await api.get('/categorias')
      setCategorias(data.categorias)
    } catch (e) {
      alert(e.message || 'Error al cargar categorías')
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
    setModalOpen(true)
  }

  const handleEdit = (cat) => {
    setEditing(cat)
    setModalOpen(true)
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return
    try {
      await api.del(`/categorias/${cat.id}`)
      setCategorias(categorias.filter(c => c.id !== cat.id))
    } catch (e) {
      alert(e.message || 'Error al eliminar')
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editing) {
        const data = await api.put(`/categorias/${editing.id}`, formData)
        setCategorias(categorias.map(c => c.id === editing.id ? data.categoria : c))
      } else {
        const data = await api.post('/categorias', formData)
        setCategorias([...categorias, data.categoria])
      }
      setModalOpen(false)
    } catch (e) {
      alert(e.message || 'Error al guardar')
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

      <Table columns={columns} data={categorias} emptyMessage="No hay categorías registradas" />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <p className="modal-subtitle">
          {editing ? 'Modifica los datos de la categoría' : 'Registra una nueva categoría de baile'}
        </p>
        <CategoriaForm
          initialData={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
