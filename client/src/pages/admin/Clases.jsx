import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Music, Users, MapPin, Clock } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import ClaseForm from './ClaseForm'
import Select from '../../components/common/Select'
import '../../App.css'

const mockClases = [
  { id: 1, tipoBaile: 'Salsa', nivel: 'Intermedio', instructor: 'María García', salon: 'Salón Principal', fecha: '2026-05-05', horaInicio: '10:00', capacidad: 30, inscritos: 25, estado: 'Activa' },
  { id: 2, tipoBaile: 'Bachata', nivel: 'Básico', instructor: 'Carlos López', salon: 'Salón 2', fecha: '2026-05-05', horaInicio: '14:00', capacidad: 20, inscritos: 18, estado: 'Activa' },
  { id: 3, tipoBaile: 'Tango', nivel: 'Avanzado', instructor: 'Ana Martínez', salon: 'Salón VIP', fecha: '2026-05-06', horaInicio: '18:00', capacidad: 15, inscritos: 5, estado: 'Activa' },
  { id: 4, tipoBaile: 'Salsa', nivel: 'Básico', instructor: 'María García', salon: 'Salón Principal', fecha: '2026-05-04', horaInicio: '10:00', capacidad: 30, inscritos: 30, estado: 'Llena' },
]

export default function Clases() {
  const navigate = useNavigate()
  const [clases, setClases] = useState(mockClases)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClase, setEditingClase] = useState(null)
  const [filtroEstado, setFiltroEstado] = useState('')

  const filteredClases = clases.filter(c => {
    if (filtroEstado && c.estado !== filtroEstado) return false
    return true
  })

  const columns = [
    { key: 'tipoBaile', label: 'Clase', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={16} className="icon-primary" />
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{row.nivel}</div>
        </div>
      </div>
    )},
    { key: 'instructor', label: 'Instructor' },
    { key: 'salon', label: 'Salón', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <MapPin size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'fecha', label: 'Fecha' },
    { key: 'horaInicio', label: 'Hora', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'ocupacion', label: 'Cupos', render: (_, row) => (
      <div>
        <div>{row.inscritos}/{row.capacidad}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          {Math.round((row.inscritos / row.capacidad) * 100)}%
        </div>
      </div>
    )},
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val === 'Activa' ? 'status-active' : val === 'Llena' ? 'status-warning' : 'status-inactive'}`}>
        {val === 'Llena' && <span style={{ marginRight: '0.25rem' }}>⚠</span>}
        {val}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleEdit(row)} title="Editar">
          <Edit2 size={16} />
        </Button>
        <Button size="small" variant="ghost" onClick={() => handleCancel(row.id)} title="Cancelar" className="icon-danger">
          <Trash2 size={16} />
        </Button>
      </div>
    )},
  ]

  const handleCreate = () => {
    setEditingClase(null)
    setModalOpen(true)
  }

  const handleEdit = (clase) => {
    setEditingClase(clase)
    setModalOpen(true)
  }

  const handleCancel = (id) => {
    if (window.confirm('¿Está seguro de cancelar esta clase?')) {
      setClases(clases.map(c => c.id === id ? { ...c, estado: 'Cancelada' } : c))
    }
  }

  const handleSave = (formData) => {
    if (editingClase) {
      setClases(clases.map(c => c.id === editingClase.id ? { ...c, ...formData } : c))
    } else {
      setClases([...clases, { ...formData, id: Date.now(), inscritos: 0, estado: 'Activa' }])
    }
    setModalOpen(false)
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <Music size={28} />
          Gestión de Clases
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'Activa', label: 'Activas' },
              { value: 'Llena', label: 'Llenas' },
              { value: 'Cancelada', label: 'Canceladas' },
            ]}
          />
          <Button onClick={handleCreate}>
            <Plus size={18} />
            Nueva Clase
          </Button>
        </div>
      </div>

      <Table columns={columns} data={filteredClases} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClase ? 'Editar Clase' : 'Nueva Clase'}
      >
        <p className="modal-subtitle">
          {editingClase ? 'Modifica los datos de la clase' : 'Completa la información para crear una nueva clase'}
        </p>
        <ClaseForm
          initialData={editingClase}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
