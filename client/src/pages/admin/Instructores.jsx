import { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Users, Music2, Phone, UserCheck, UserX } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import InstructorForm from './InstructorForm'
import '../../App.css'

const mockInstructores = [
  { id: 1, nombre: 'María García', especialidad: 'Salsa', contacto: '999888777', foto: '', estado: 'Activo', clases: 5 },
  { id: 2, nombre: 'Carlos López', especialidad: 'Bachata', contacto: '999777666', foto: '', estado: 'Activo', clases: 3 },
  { id: 3, nombre: 'Ana Martínez', especialidad: 'Tango', contacto: '999666555', foto: '', estado: 'Inactivo', clases: 0 },
]

export default function Instructores() {
  const [instructores, setInstructores] = useState(mockInstructores)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)

  const columns = [
    { key: 'nombre', label: 'Instructor', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={20} className="icon-primary" />
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{row.especialidad}</div>
        </div>
      </div>
    )},
    { key: 'contacto', label: 'Contacto', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Phone size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'clases', label: 'Clases', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Music2 size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val === 'Activo' ? 'status-active' : 'status-inactive'}`}>
        {val === 'Activo' ? <UserCheck size={12} /> : <UserX size={12} />}
        {val}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleEdit(row)} title="Editar">
          <Edit2 size={16} />
        </Button>
        <Button size="small" variant="ghost" onClick={() => handleToggleStatus(row.id)} title={row.estado === 'Activo' ? 'Desactivar' : 'Activar'} className={row.estado === 'Activo' ? 'icon-danger' : 'icon-success'}>
          {row.estado === 'Activo' ? <UserX size={16} /> : <UserCheck size={16} />}
        </Button>
      </div>
    )},
  ]

  const handleCreate = () => {
    setEditingInstructor(null)
    setModalOpen(true)
  }

  const handleEdit = (instructor) => {
    setEditingInstructor(instructor)
    setModalOpen(true)
  }

  const handleToggleStatus = (id) => {
    setInstructores(instructores.map(inst =>
      inst.id === id
        ? { ...inst, estado: inst.estado === 'Activo' ? 'Inactivo' : 'Activo' }
        : inst
    ))
  }

  const handleSave = (formData) => {
    if (editingInstructor) {
      setInstructores(instructores.map(inst =>
        inst.id === editingInstructor.id ? { ...inst, ...formData } : inst
      ))
    } else {
      setInstructores([...instructores, { ...formData, id: Date.now(), clases: 0 }])
    }
    setModalOpen(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <Users size={28} />
          Gestión de Instructores
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Instructor
        </Button>
      </div>

      <Table columns={columns} data={instructores} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInstructor ? 'Editar Instructor' : 'Nuevo Instructor'}
      >
        <p className="modal-subtitle">
          {editingInstructor ? 'Modifica los datos del instructor' : 'Completa la información para registrar un nuevo instructor'}
        </p>
        <InstructorForm
          initialData={editingInstructor}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
