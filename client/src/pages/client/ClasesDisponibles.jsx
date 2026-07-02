import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Sun, Sunset, Moon, Users, ChevronRight, AlertCircle } from 'lucide-react'
import api from '../../services/api'
import { formatHoraAMPM } from '../../utils/helpers'
import Button from '../../components/common/Button'
import '../../App.css'

const CATEGORIA_APARIENCIA = {
  Salsa: { icon: 'Flame', color: '#E74C3C', bgColor: '#FEF2F2', gradient: 'linear-gradient(135deg, #E74C3C, #c0392b)', desc: 'Ritmo y energía' },
  Bachata: { icon: 'Heart', color: '#27AE60', bgColor: '#F0FDF4', gradient: 'linear-gradient(135deg, #27AE60, #1e8449)', desc: 'Romántica y sensual' },
  Tango: { icon: 'Drama', color: '#7C3AED', bgColor: '#F5F3FF', gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)', desc: 'Pasión y elegancia' },
}

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

const FRANJAS = [
  { key: 'manana', label: 'En la mañana', icon: Sun },
  { key: 'tarde', label: 'Tarde', icon: Sunset },
  { key: 'nocturnas', label: 'Nocturnas', icon: Moon },
]

function generarProximosDias() {
  const hoy = new Date()
  const diaSem = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((diaSem + 6) % 7))
  const dias = []
  for (let i = 0; i < 6; i++) {
    const fecha = new Date(lunes)
    fecha.setDate(lunes.getDate() + i)
    dias.push(fecha)
  }
  return dias
}

function calcularDuracion(inicio, fin) {
  const [h1, m1] = inicio.split(':').map(Number)
  const [h2, m2] = fin.split(':').map(Number)
  const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
  return `${diff} min`
}

function agruparPorFranja(clases) {
  const grupos = { manana: [], tarde: [], nocturnas: [] }
  clases.forEach(clase => {
    const hora = parseInt(clase.horaInicio.split(':')[0], 10)
    if (hora < 12) grupos.manana.push(clase)
    else if (hora < 18) grupos.tarde.push(clase)
    else grupos.nocturnas.push(clase)
  })
  return grupos
}

const DIAS_LABEL = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

export default function ClasesDisponibles() {
  const [categorias, setCategorias] = useState([])
  const [clases, setClases] = useState([])
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const diasSemana = useMemo(() => generarProximosDias(), [])

  const cargar = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([
      api.cachedGet('/categorias'),
      api.cachedGet('/clases?limit=500'),
    ]).then(([catData, clsData]) => {
      setCategorias(catData.categorias || [])
      setClases(clsData.clases || [])
    }).catch(() => {
      setCategorias([])
      setClases([])
      setError('No pudimos cargar las clases. Revisa tu conexión.')
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [])

  const hoyStr = useMemo(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }, [])

  const clasesFiltradas = selectedCategoria
    ? clases.filter(c =>
        c.categoria?.nombre === selectedCategoria &&
        c.fecha === selectedDate &&
        c.estado === 'PROGRAMADA'
      )
    : []

  const handleSelectCategoria = (nombre) => {
    setSelectedCategoria(nombre)
    const fechaConClases = diasSemana.find(f => {
      const fs = f.toISOString().split('T')[0]
      return clases.some(c => c.categoria?.nombre === nombre && c.fecha === fs && c.estado === 'PROGRAMADA')
    })
    setSelectedDate(fechaConClases ? fechaConClases.toISOString().split('T')[0] : diasSemana[0]?.toISOString().split('T')[0])
  }

  const apariencia = CATEGORIA_APARIENCIA[selectedCategoria] || { color: '#666', bgColor: '#f5f5f5', gradient: 'linear-gradient(135deg, #666, #444)', desc: '' }
  const grupos = agruparPorFranja(clasesFiltradas)
  const tieneClases = Object.values(grupos).some(g => g.length > 0)

  if (error) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} className="icon-muted" />
        <h3>No pudimos cargar las clases</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{error}</p>
        <Button onClick={cargar} style={{ marginTop: '1rem' }}>Reintentar</Button>
      </div>
    )
  }

  if (!selectedCategoria) {
    return (
      <div>
        <h2 className="client-section-title">Elige tu estilo</h2>
        <p className="client-section-subtitle">Selecciona el tipo de baile que deseas practicar</p>
        <div className="category-selector">
          {loading && categorias.length === 0
            ? [1, 2, 3].map(i => (
                <div key={i} className="category-card" style={{ pointerEvents: 'none' }}>
                  <div className="skeleton" style={{ width: '100%', height: 90, borderRadius: 12 }} />
                </div>
              ))
            : categorias.map((cat, i) => {
              const apa = CATEGORIA_APARIENCIA[cat.nombre] || { icon: 'Flame', color: '#666', bgColor: '#f5f5f5', gradient: 'linear-gradient(135deg, #666, #444)', desc: cat.descripcion }
              const Icon = ICON_MAP[apa.icon]
              return (
                <button
                  key={cat.id}
                  className="category-card"
                  style={{
                    '--cat-color': apa.color,
                    '--cat-bg': apa.bgColor,
                    '--cat-gradient': apa.gradient,
                    animationDelay: `${i * 0.08}s`,
                  }}
                  onClick={() => handleSelectCategoria(cat.nombre)}
                >
                  <div className="category-card-accent" style={{ background: apa.gradient }} />
                  <div className="category-card-icon" style={{ background: apa.gradient, color: '#fff' }}>
                    <Icon size={24} />
                  </div>
                  <div className="category-card-info">
                    <h3 className="category-card-title">{cat.nombre}</h3>
                    <p className="category-card-desc">{apa.desc}</p>
                  </div>
                  <ChevronRight size={20} className="category-card-chevron" style={{ color: apa.color }} />
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

      <div className="category-active-header" style={{ color: apariencia.color }}>
        <h2>{selectedCategoria}</h2>
      </div>

      <div className="date-carousel">
        {diasSemana.map((fecha) => {
          const fs = fecha.toISOString().split('T')[0]
          const dia = DIAS_LABEL[fecha.getDay()]
          const numero = fecha.getDate().toString().padStart(2, '0')
          const isActive = fs === selectedDate
          const hasClases = clases.some(c => c.categoria?.nombre === selectedCategoria && c.fecha === fs && c.estado === 'PROGRAMADA')
          const esPasado = fs < hoyStr

          return (
            <button
              key={fs}
              className={`date-item${isActive ? ' active' : ''}${!hasClases || esPasado ? ' disabled' : ''}${fs === hoyStr ? ' today' : ''}`}
              onClick={() => !esPasado && hasClases && setSelectedDate(fs)}
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
                    const cupos = clase.capacidadMaxima - clase.inscritos
                    const idx = animIdx++
                    return (
                      <div
                        key={clase.id}
                        className="clase-card-slim"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        onClick={() => navigate(`/cliente/clases/${clase.id}`)}
                      >
                        <div className="clase-card-slim-time">
                          <span className="clase-time-text">{formatHoraAMPM(clase.horaInicio)}</span>
                          <span className="clase-duration-text">{calcularDuracion(clase.horaInicio, clase.horaFin)}</span>
                        </div>
                        <div className="instructor-avatar">
                          <span>{clase.instructor?.nombres?.charAt(0) || '?'}</span>
                        </div>
                        <div className="clase-card-slim-info">
                          <div className="clase-card-slim-name">{clase.instructor?.nombres} {clase.instructor?.apellidos}</div>
                        </div>
                        <div className="clase-card-slim-meta">
                          <div className="price-badge">
                            S/ {clase.precio ?? 15}
                          </div>
                          <div className="clase-card-slim-participants">
                            <Users size={13} />
                            <span>{clase.inscritos}/{clase.capacidadMaxima}</span>
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
