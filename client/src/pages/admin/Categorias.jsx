import { useState } from 'react'
import { Plus, Edit2, Trash2, Music2, Layers } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import CategoriaForm from './CategoriaForm'
import { categorias as mockCategorias, mockHorariosSemanales } from '../../data/mockData'
import '../../App.css'

export default function Categorias() {
  const [categorias, setCategorias] = useState(mockCategorias)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const getHorariosCount = (catId) =>
    mockHorariosSemanales.filter(h => h.categoriaId === catId).length

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
    { key: 'horarios', label: 'Horarios', render: (_, row) => {
      const count = getHorariosCount(row.id)
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Layers size={14} className="icon-muted" /> {count} vinculados
        </span>
      )
    }},
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

  const handleDelete = (cat) => {
    const count = getHorariosCount(cat.id)
    let msg = `¿Eliminar la categoría "${cat.nombre}"?`
    if (count > 0) msg += `\n\n⚠️ Tiene ${count} horario(s) vinculado(s).`
    if (!window.confirm(msg)) return
    setCategorias(categorias.filter(c => c.id !== cat.id))
  }

  const handleSave = (formData) => {
    if (editing) {
      setCategorias(categorias.map(c =>
        c.id === editing.id ? { ...c, ...formData } : c
      ))
    } else {
      const newId = Math.max(...categorias.map(c => c.id), 0) + 1
      setCategorias([...categorias, { ...formData, id: newId }])
    }
    setModalOpen(false)
  }

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
