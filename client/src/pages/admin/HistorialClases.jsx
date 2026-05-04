import { useState } from 'react'
import { Filter, Calendar, Users, TrendingUp, XCircle, Percent } from 'lucide-react'
import Table from '../../components/common/Table'
import Select from '../../components/common/Select'
import '../../App.css'

const mockHistorial = [
  { id: 1, clase: 'Salsa Intermedio', fecha: '2026-04-28', instructor: 'María García', salon: 'Salón Principal', estado: 'Realizada', ocupados: 25, capacidad: 30 },
  { id: 2, clase: 'Bachata Básico', fecha: '2026-04-27', instructor: 'Carlos López', salon: 'Salón 2', estado: 'Realizada', ocupados: 18, capacidad: 20 },
  { id: 3, clase: 'Tango Avanzado', fecha: '2026-04-25', instructor: 'Ana Martínez', salon: 'Salón VIP', estado: 'Cancelada', ocupados: 5, capacidad: 15 },
  { id: 4, clase: 'Salsa Básico', fecha: '2026-04-24', instructor: 'María García', salon: 'Salón Principal', estado: 'Realizada', ocupados: 28, capacidad: 30 },
]

export default function HistorialClases() {
  const [historial] = useState(mockHistorial)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')

  const filteredHistorial = historial.filter(h => {
    if (filtroEstado && h.estado !== filtroEstado) return false
    if (filtroFecha && h.fecha !== filtroFecha) return false
    return true
  })

  const columns = [
    { key: 'clase', label: 'Clase', render: (val) => (
      <span style={{ fontWeight: 600 }}>{val}</span>
    )},
    { key: 'fecha', label: 'Fecha', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'instructor', label: 'Instructor' },
    { key: 'salon', label: 'Salón' },
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val === 'Realizada' ? 'status-active' : 'status-inactive'}`}>
        {val === 'Realizada' ? <TrendingUp size={12} /> : <XCircle size={12} />}
        {val}
      </span>
    )},
    { key: 'ocupados', label: 'Cupos', render: (val, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Users size={14} className="icon-muted" /> {val}/{row.capacidad}
      </span>
    )},
    { key: 'ocupacion', label: 'Ocupación', render: (_, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Percent size={14} className="icon-muted" /> {Math.round((row.ocupados / row.capacidad) * 100)}%
      </span>
    )},
  ]

  return (
    <div>
      <div className="page-header">
        <h1>
          <Calendar size={28} />
          Historial de Clases
        </h1>
        <div className="filters">
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'Realizada', label: 'Realizada' },
              { value: 'Cancelada', label: 'Cancelada' },
            ]}
          />
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            className="filter-date"
          />
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Clases</h3>
          <p>{historial.length}</p>
        </div>
        <div className="stat-card">
          <h3>Realizadas</h3>
          <p style={{ color: 'var(--success-text)' }}>{historial.filter(h => h.estado === 'Realizada').length}</p>
        </div>
        <div className="stat-card">
          <h3>Canceladas</h3>
          <p style={{ color: 'var(--danger-text)' }}>{historial.filter(h => h.estado === 'Cancelada').length}</p>
        </div>
      </div>

      <Table columns={columns} data={filteredHistorial} />
    </div>
  )
}
