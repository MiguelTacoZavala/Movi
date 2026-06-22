import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Sun, Sunset, Moon, Users, ChevronRight } from 'lucide-react'
import { CATEGORIAS, mockClases, diasSemana, formatFecha, formatHoraAMPM, claseDisponible } from '../../data/mockData'

const ICON_MAP = {
  Flame: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  Heart: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  Drama: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M6 12c0-2.5 1.5-5 3-6 1.5 1 3 3.5 3 6" />
      <path d="M18 12c0-2.5-1.5-5-3-6-1.5 1-3 3.5-3 6" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
}
import '../../App.css'

const FRANJAS = [
  { key: 'manana', label: 'En la mañana', icon: Sun },
  { key: 'tarde', label: 'Tarde', icon: Sunset },
  { key: 'nocturnas', label: 'Nocturnas', icon: Moon },
]

function calcularDuracion(inicio, fin) {
  const [h1, m1] = inicio.split(':').map(Number)
  const [h2, m2] = fin.split(':').map(Number)
  const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
  return `${diff} min`
}

function clasesEnFecha(categoria, fechaStr) {
  return mockClases.filter(c =>
    c.categoria === categoria && c.fecha === fechaStr && claseDisponible(c)
  )
}

function primeraFechaConClases(categoria) {
  return diasSemana.find(f => clasesEnFecha(categoria, f.toISOString().split('T')[0]).length > 0
  ) || diasSemana[0]
}

function agruparPorFranja(clases) {
  const grupos = { manana: [], tarde: [], nocturnas: [] }
  clases.forEach(clase => {
    const hora = parseInt(clase.hora_inicio.split(':')[0], 10)
    if (hora < 12) grupos.manana.push(clase)
    else if (hora < 18) grupos.tarde.push(clase)
    else grupos.nocturnas.push(clase)
  })
  return grupos
}

export default function ClasesDisponibles() {
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const hoyStr = formatFecha(new Date()).full
    return diasSemana.find(d => formatFecha(d).full === hoyStr) || diasSemana[0]
  })
  const navigate = useNavigate()

  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const clasesFiltradas = selectedCategoria
    ? mockClases.filter(c =>
        c.categoria === selectedCategoria && c.fecha === selectedDateStr && claseDisponible(c)
      )
    : []

  const handleSelectCategoria = (nombre) => {
    setSelectedCategoria(nombre)
    setSelectedDate(primeraFechaConClases(nombre))
  }

  const handleVerClase = (claseId) => {
    navigate(`/cliente/clases/${claseId}`)
  }

  const categoriaInfo = CATEGORIAS.find(c => c.nombre === selectedCategoria)
  const grupos = agruparPorFranja(clasesFiltradas)
  const tieneClases = Object.values(grupos).some(g => g.length > 0)

  if (!selectedCategoria) {
    return (
      <div>
        <h2 className="client-section-title">Elige tu estilo</h2>
        <p className="client-section-subtitle">Selecciona el tipo de baile que deseas practicar</p>
        <div className="category-selector">
          {CATEGORIAS.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon]
            return (
              <button
                key={cat.nombre}
                className="category-card"
                style={{
                  '--cat-color': cat.color,
                  '--cat-bg': cat.bgColor,
                  '--cat-gradient': cat.gradient,
                  animationDelay: `${i * 0.08}s`,
                }}
                onClick={() => handleSelectCategoria(cat.nombre)}
              >
                <div className="category-card-accent" style={{ background: cat.gradient }} />
                <div className="category-card-icon" style={{ background: cat.gradient, color: '#fff' }}>
                  <Icon size={24} />
                </div>
                <div className="category-card-info">
                  <h3 className="category-card-title">{cat.nombre}</h3>
                  <p className="category-card-desc">{cat.desc}</p>
                </div>
                <ChevronRight size={20} className="category-card-chevron" style={{ color: cat.color }} />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div key={selectedCategoria}>
      <button className="back-btn" onClick={() => setSelectedCategoria(null)}>
        <ArrowLeft size={20} />
        <span>Todos los estilos</span>
      </button>

      <div className="category-active-header" style={{ color: categoriaInfo.color }}>
        <h2>{selectedCategoria}</h2>
      </div>

      <div className="date-carousel">
        {diasSemana.map((fecha) => {
          const { dia, numero, full } = formatFecha(fecha)
          const isActive = full === selectedDateStr
          const hasClases = clasesEnFecha(selectedCategoria, full).length > 0
          const isToday = full === formatFecha(new Date()).full
          const hoyStr = formatFecha(new Date()).full
          const esPasado = full < hoyStr

          return (
            <button
              key={full}
              className={`date-item${isActive ? ' active' : ''}${!hasClases || esPasado ? ' disabled' : ''}${isToday ? ' today' : ''}`}
              onClick={() => !esPasado && hasClases && setSelectedDate(fecha)}
              disabled={!hasClases || esPasado}
            >
              <span className="date-item-day">{dia}</span>
              <span className="date-item-num">{numero}</span>
            </button>
          )
        })}
      </div>

      <div className="clases-lista">
        {!tieneClases ? (
          <div className="empty-state">
            <Clock size={48} className="icon-muted" />
            <h3>Sin clases</h3>
            <p>No hay clases de {selectedCategoria} en esta fecha</p>
          </div>
        ) : (() => {
          let animIdx = 0
          return FRANJAS.map(franja => {
            const clases = grupos[franja.key]
            if (clases.length === 0) return null
            const Icon = franja.icon
            return (
              <div key={franja.key}>
                <div className="time-section-header">
                  <Icon size={16} />
                  <span>{franja.label}</span>
                </div>
                <div className="time-section-content">
                  {clases.map(clase => {
                    const cupos = clase.capacidad_maxima - clase.inscritos
                    const idx = animIdx++
                    return (
                      <div
                        key={clase.id}
                        className="clase-card-slim"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        onClick={() => handleVerClase(clase.id)}
                      >
                        <div className="clase-card-slim-time">
                          <span className="clase-time-text">{formatHoraAMPM(clase.hora_inicio)}</span>
                          <span className="clase-duration-text">{calcularDuracion(clase.hora_inicio, clase.hora_fin)}</span>
                        </div>
                        <div className="instructor-avatar">
                          {clase.instructorFoto ? (
                            <img src={clase.instructorFoto} alt={clase.instructor} />
                          ) : (
                            <span>{clase.instructor.charAt(0)}</span>
                          )}
                        </div>
                        <div className="clase-card-slim-info">
                          <div className="clase-card-slim-name">{clase.instructor}</div>
                        </div>
                        <div className="clase-card-slim-meta">
                          <div style={{ fontWeight: 600, color: 'var(--primary-medium)', fontSize: '0.85rem' }}>
                            S/ 15
                          </div>
                          <div className="clase-card-slim-participants">
                            <Users size={13} />
                            <span>{clase.inscritos}/{clase.capacidad_maxima}</span>
                          </div>
                          <div className={`clase-card-slim-cupos-text${cupos === 0 ? ' agotado' : ''}${cupos > 0 && cupos <= 3 ? ' pocos' : ''}`}>
                            {cupos === 0 ? 'Completa' : `quedan ${cupos}`}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
