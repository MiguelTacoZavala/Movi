import { useState } from 'react'
import { Plus, Building2, Users, Edit2, MapPin } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import SalonForm from './SalonForm'
import '../../App.css'

const mockSalones = [
  { id: 1, nombre: 'Salón Principal', capacidad: 30, disponibilidad: 'Disponible', clases: 8 },
  { id: 2, nombre: 'Salón 2', capacidad: 20, disponibilidad: 'Disponible', clases: 5 },
  { id: 3, nombre: 'Salón VIP', capacidad: 15, disponibilidad: 'Mantenimiento', clases: 0 },
]

export default function Salones() {
  const [salones, setSalones] = useState(mockSalones)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSalon, setEditingSalon] = useState(null)

  const columns = [
    { key: 'nombre', label: 'Salón', render: (val) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Building2 size={16} className="icon-primary" />
        <span style={{ fontWeight: 600 }}>{val}</span>
      </div>
    )},
    { key: 'capacidad', label: 'Capacidad', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Users size={14} className="icon-muted" /> {val} personas
      </span>
    )},
    { key: 'disponibilidad', label: 'Disponibilidad', render: (val) => (
      <span className={`status-badge ${val === 'Disponible' ? 'status-active' : 'status-inactive'}`}>
        <MapPin size={12} /> {val}
      </span>
    )},
    { key: 'clases', label: 'Clases', render: (val) => `${val} asignadas` },
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleEdit(row)} title="Editar">
          <Edit2 size={16} />
        </Button>
      </div>
    )},
  ]

  const handleCreate = () => {
    setEditingSalon(null)
    setModalOpen(true)
  }

  const handleEdit = (salon) => {
    setEditingSalon(salon)
    setModalOpen(true)
  }

  const handleSave = (formData) => {
    if (editingSalon) {
      setSalones(salones.map(s => s.id === editingSalon.id ? { ...s, ...formData } : s))
    } else {
      setSalones([...salones, { ...formData, id: Date.now(), clases: 0 }])
    }
    setModalOpen(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <Building2 size={28} />
          Gestión de Salones
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Salón
        </Button>
      </div>

      <Table columns={columns} data={salones} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSalon ? 'Editar Salón' : 'Nuevo Salón'}
      >
        <p className="modal-subtitle">
          {editingSalon ? 'Modifica los datos del salón' : 'Completa la información para crear un nuevo salón'}
        </p>
        <SalonForm
          initialData={editingSalon}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
