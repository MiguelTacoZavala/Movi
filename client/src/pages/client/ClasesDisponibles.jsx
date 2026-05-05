import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Music, Users, Clock, MapPin, Calendar } from 'lucide-react'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import '../../App.css'

const mockClases = [
  { 
    id: 1, 
    categoria: 'Salsa', 
    instructor: 'María García', 
    fecha: '2026-05-05', 
    hora_inicio: '10:00', 
    hora_fin: '11:30', 
    salon: 'Salón Principal',
    capacidad_maxima: 30, 
    inscritos: 25, 
    estado: 'PROGRAMADA' 
  },
  { 
    id: 2, 
    categoria: 'Bachata', 
    instructor: 'Carlos López', 
    fecha: '2026-05-05', 
    hora_inicio: '14:00', 
    hora_fin: '15:30', 
    salon: 'Salón 2',
    capacidad_maxima: 20, 
    inscritos: 18, 
    estado: 'PROGRAMADA' 
  },
  { 
    id: 3, 
    categoria: 'Tango', 
    instructor: 'Ana Martínez', 
    fecha: '2026-05-06', 
    hora_inicio: '18:00', 
    hora_fin: '19:30', 
    salon: 'Salón VIP',
    capacidad_maxima: 15, 
    inscritos: 5, 
    estado: 'PROGRAMADA' 
  },
  { 
    id: 4, 
    categoria: 'Salsa', 
    instructor: 'María García', 
    fecha: '2026-05-07', 
    hora_inicio: '10:00', 
    hora_fin: '11:30', 
    salon: 'Salón Principal',
    capacidad_maxima: 30, 
    inscritos: 30, 
    estado: 'COMPLETA' 
  },
]

export default function ClasesDisponibles() {
  const [search, setSearch] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const navigate = useNavigate()

  const filteredClases = mockClases.filter(clase => {
    if (search && !clase.categoria.toLowerCase().includes(search.toLowerCase()) && 
        !clase.instructor.toLowerCase().includes(search.toLowerCase())) return false
    if (filtroCategoria && clase.categoria !== filtroCategoria) return false
    if (filtroFecha && clase.fecha !== filtroFecha) return false
    return true
  })

  const handleVerClase = (claseId) => {
    navigate(`/cliente/clases/${claseId}`)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="search-box" style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar por clase o instructor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filters" style={{ flexWrap: 'wrap' }}>
          <Select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            options={[
              { value: '', label: 'Todas las categorías' },
              { value: 'Salsa', label: 'Salsa' },
              { value: 'Bachata', label: 'Bachata' },
              { value: 'Tango', label: 'Tango' },
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

      <div>
        {filteredClases.map(clase => {
          const cuposDisponibles = clase.capacidad_maxima - clase.inscritos
          
          return (
            <div key={clase.id} className="clase-card">
              <div className="clase-card-header">
                <h3 className="clase-card-title">
                  {clase.categoria}
                </h3>
                <span className={`status-badge ${clase.estado === 'PROGRAMADA' ? 'status-active' : 'status-warning'}`}>
                  {clase.estado === 'PROGRAMADA' ? 'Disponible' : 'Completa'}
                </span>
              </div>
               
              <div className="clase-card-details">
                <div className="clase-card-detail">
                  <Calendar size={16} className="icon-muted" />
                  {clase.fecha}
                </div>
                <div className="clase-card-detail">
                  <Clock size={16} className="icon-muted" />
                  {clase.hora_inicio} - {clase.hora_fin}
                </div>
                <div className="clase-card-detail">
                  <Music size={16} className="icon-muted" />
                  {clase.instructor}
                </div>
                <div className="clase-card-detail">
                  <Users size={16} className="icon-muted" />
                  {cuposDisponibles} cupos disponibles
                </div>
              </div>
               
              <div className="clase-card-actions">
                <Button 
                  onClick={() => handleVerClase(clase.id)}
                  disabled={clase.estado === 'COMPLETA'}
                  style={{ width: '100%' }}
                >
                  {clase.estado === 'COMPLETA' ? 'Clase Completa' : 'Ver Clase'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
