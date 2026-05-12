import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import HorarioSemanalForm from './HorarioSemanalForm'
import { mockHorariosSemanales, instructores, categorias, DIAS_SEMANA, formatHoraAMPM } from '../../data/mockData'

const diaLabel = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado',
}

export default function HorariosSemanales() {
  const [horarios, setHorarios] = useState(mockHorariosSemanales)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filtroInstructor, setFiltroInstructor] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroDia, setFiltroDia] = useState('')

  const filteredHorarios = useMemo(() =>
    horarios.filter(h => {
      if (filtroInstructor && h.instructorId !== parseInt(filtroInstructor)) return false
      if (filtroCategoria && h.categoriaId !== parseInt(filtroCategoria)) return false
      if (filtroDia && h.dia_semana !== filtroDia) return false
      return true
    }), [horarios, filtroInstructor, filtroCategoria, filtroDia]
  )

  const columns = [
    { key: 'instructorNombre', label: 'Instructor', render: (val) => (
      <span style={{ fontWeight: 600 }}>{val}</span>
    )},
    { key: 'categoriaNombre', label: 'Categoría' },
    { key: 'dia_semana', label: 'Día', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {diaLabel[val] || val}
      </span>
    )},
    { key: 'horario', label: 'Horario', render: (_, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={14} className="icon-muted" />
        {formatHoraAMPM(row.hora_inicio)} — {formatHoraAMPM(row.hora_fin)}
      </span>
    )},
    { key: 'activo', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>
        {val ? 'Activo' : 'Inactivo'}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleToggle(row.id)} title={row.activo ? 'Desactivar' : 'Activar'}>
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
    setModalOpen(true)
  }

  const handleEdit = (h) => {
    setEditing({ ...h })
    setModalOpen(true)
  }

  const handleToggle = (id) => {
    setHorarios(horarios.map(h =>
      h.id === id ? { ...h, activo: !h.activo } : h
    ))
  }

  const handleDelete = (h) => {
    if (!window.confirm(`¿Eliminar el horario de ${h.instructorNombre} (${diaLabel[h.dia_semana]})?`)) return
    setHorarios(horarios.filter(x => x.id !== h.id))
  }

  const handleSave = (formData) => {
    if (editing) {
      setHorarios(horarios.map(h =>
        h.id === editing.id ? { ...h, ...formData, id: h.id } : h
      ))
    } else {
      const newId = Math.max(...horarios.map(h => h.id), 0) + 1
      setHorarios([...horarios, { ...formData, id: newId }])
    }
    setModalOpen(false)
  }

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
          value={filtroInstructor}
          onChange={(e) => setFiltroInstructor(e.target.value)}
          options={[
            { value: '', label: 'Todos los instructores' },
            ...instructores.map(i => ({ value: i.id, label: i.nombre })),
          ]}
        />
        <Select
          label="Categoría"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          options={[
            { value: '', label: 'Todas las categorías' },
            ...categorias.map(c => ({ value: c.id, label: c.nombre })),
          ]}
        />
        <Select
          label="Día"
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
          options={[
            { value: '', label: 'Todos los días' },
            ...DIAS_SEMANA.map(d => ({ value: d, label: d.charAt(0) + d.slice(1).toLowerCase() })),
          ]}
        />
      </div>

      <Table columns={columns} data={filteredHorarios} emptyMessage="No hay horarios registrados" />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Horario Semanal' : 'Nuevo Horario Semanal'}
        size="large"
      >
        <p className="modal-subtitle">
          {editing
            ? 'Modifica el horario semanal del instructor'
            : 'Configura un nuevo horario semanal recurrente'}
        </p>
        <HorarioSemanalForm
          initialData={editing}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          existingHorarios={horarios}
        />
      </Modal>
    </div>
  )
}
