import { useState, useEffect } from 'react'
import { Plus, Edit2, User, Phone, UserCheck, UserX, Mail } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import InstructorForm from './InstructorForm'
import api from '../../services/api'
import '../../App.css'

export default function Instructores() {
  const [instructores, setInstructores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState(null)

  const cargar = async () => {
    try {
      const data = await api.get('/instructores')
      setInstructores(data.instructores)
    } catch (e) {
      alert(e.message || 'Error al cargar instructores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

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

  const handleToggleStatus = async (instructor) => {
    try {
      const data = await api.patch(`/instructores/${instructor.id}/estado`)
      setInstructores(instructores.map(inst =>
        inst.id === instructor.id ? data.instructor : inst
      ))
    } catch (e) {
      alert(e.message || 'Error al cambiar estado')
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editingInstructor) {
        const data = await api.put(`/instructores/${editingInstructor.id}`, formData)
        setInstructores(instructores.map(inst =>
          inst.id === editingInstructor.id ? data.instructor : inst
        ))
      } else {
        const data = await api.post('/instructores', formData)
        setInstructores([...instructores, data.instructor])
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
          <User size={28} />
          Gestión de Instructores
        </h1>
        <Button onClick={handleCreate}>
          <Plus size={18} />
          Nuevo Instructor
        </Button>
      </div>

      <Table columns={columns} data={instructores} emptyMessage="No hay instructores registrados" />

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
