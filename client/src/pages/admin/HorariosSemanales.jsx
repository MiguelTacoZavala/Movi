import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import HorarioSemanalForm from './HorarioSemanalForm'
import api from '../../services/api'
import { DIAS_SEMANA, formatHoraAMPM } from '../../utils/helpers'

const diaLabel = {
  LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado', DOMINGO: 'Domingo',
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

  const cargar = async () => {
    try {
      const [hData, iData, cData] = await Promise.all([
        api.get('/horarios'),
        api.get('/instructores'),
        api.get('/categorias'),
      ])
      setHorarios(hData.horarios)
      setInstructores(iData.instructores)
      setCategorias(cData.categorias)
    } catch (e) {
      alert(e.message || 'Error al cargar horarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filteredHorarios = useMemo(() =>
    horarios.filter(h => {
      if (filtroInstructor && h.instructor.id !== parseInt(filtroInstructor)) return false
      if (filtroCategoria && h.categoria.id !== parseInt(filtroCategoria)) return false
      if (filtroDia && h.diaSemana !== filtroDia) return false
      return true
    }), [horarios, filtroInstructor, filtroCategoria, filtroDia]
  )

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
    { key: 'activo', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val ? 'status-active' : 'status-inactive'}`}>
        {val ? 'Activo' : 'Inactivo'}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
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
    setModalOpen(true)
  }

  const handleEdit = (h) => {
    setEditing(h)
    setModalOpen(true)
  }

  const handleToggle = async (h) => {
    try {
      const result = await api.patch(`/horarios/${h.id}/status`)
      setHorarios(horarios.map(x => x.id === h.id ? { ...x, activo: result.activo } : x))
    } catch (e) {
      alert(e.message || 'Error al cambiar estado')
    }
  }

  const handleDelete = async (h) => {
    if (!window.confirm(`¿Eliminar el horario de ${h.instructor.nombres} ${h.instructor.apellidos} (${diaLabel[h.diaSemana]})?`)) return
    try {
      await api.del(`/horarios/${h.id}`)
      setHorarios(horarios.filter(x => x.id !== h.id))
    } catch (e) {
      alert(e.message || 'Error al eliminar')
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editing) {
        const data = await api.put(`/horarios/${editing.id}`, formData)
        setHorarios(horarios.map(h => h.id === editing.id ? data.horario : h))
      } else {
        const data = await api.post('/horarios', formData)
        setHorarios([...horarios, data.horario])
      }
      setModalOpen(false)
    } catch (e) {
      alert(e.message || 'Error al guardar el horario')
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

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
            ...instructores.map(i => ({ value: i.id, label: `${i.nombres} ${i.apellidos}` })),
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
          instructores={instructores}
          categorias={categorias}
        />
      </Modal>
    </div>
  )
}
