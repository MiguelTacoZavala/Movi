import { Music, Users, TrendingUp, Clock, AlertTriangle, DollarSign, BarChart2, CheckCircle } from 'lucide-react'
import { mockClasesGeneradas, formatHoraAMPM, PRECIOS_CLASE } from '../../data/mockData'
import '../../App.css'

const hoy = new Date().toISOString().split('T')[0]

function getRangoSemana() {
  const d = new Date()
  const lunes = new Date(d)
  lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  return [lunes.toISOString().split('T')[0], domingo.toISOString().split('T')[0]]
}

function getRangoMes() {
  const d = new Date()
  return [
    new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0],
    new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0],
  ]
}

function ingresoClase(c) {
  return c.inscritos * (PRECIOS_CLASE[c.categoria] ?? 25)
}

function soles(n) {
  return `S/. ${n.toLocaleString('es-PE')}`
}

const [semIni, semFin] = getRangoSemana()
const [mesIni, mesFin] = getRangoMes()

export default function Dashboard() {
  const clasesHoy      = mockClasesGeneradas.filter(c => c.fecha === hoy)
  const clasesSemana   = mockClasesGeneradas.filter(c => c.fecha >= semIni && c.fecha <= semFin)
  const clasesMes      = mockClasesGeneradas.filter(c => c.fecha >= mesIni && c.fecha <= mesFin)

  const ingresosHoy     = clasesHoy.reduce((s, c) => s + ingresoClase(c), 0)
  const ingresosSemana  = clasesSemana.reduce((s, c) => s + ingresoClase(c), 0)
  const ingresosMes     = clasesMes.reduce((s, c) => s + ingresoClase(c), 0)

  const ocupacion = mockClasesGeneradas.length
    ? Math.round(mockClasesGeneradas.reduce((s, c) => s + c.inscritos / c.capacidad_maxima, 0) / mockClasesGeneradas.length * 100)
    : 0

  const confirmadasMes = clasesMes.filter(c => c.estado !== 'CANCELADA').length
  const canceladasMes  = clasesMes.filter(c => c.estado === 'CANCELADA').length

  const categoriasPopulares = Object.entries(
    clasesSemana.reduce((acc, c) => {
      acc[c.categoria] = (acc[c.categoria] || 0) + c.inscritos
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])
  const maxCat = categoriasPopulares[0]?.[1] || 1

  const claseRiesgo = mockClasesGeneradas
    .filter(c => c.fecha >= hoy && c.inscritos < (c.minimo_participantes || 7))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_inicio.localeCompare(b.hora_inicio))[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Ingresos ── */}
      <div>
        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
          Ingresos
        </p>
        <div className="dashboard-grid">
          {[
            { label: 'Hoy',         value: soles(ingresosHoy) },
            { label: 'Esta semana', value: soles(ingresosSemana) },
            { label: 'Este mes',    value: soles(ingresosMes) },
          ].map((item, i) => (
            <div key={i} className="stat-card" style={{ animation: 'fadeInUp 0.35s ease both', animationDelay: `${i * 0.07}s` }}>
              <div className="stat-icon"><DollarSign size={22} /></div>
              <div className="stat-content">
                <h3>{item.label}</h3>
                <p style={{ color: 'var(--info)' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ── Categorías populares + Clase en riesgo ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        <div className="dashboard-section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: 0 }}>
            <BarChart2 size={17} className="icon-primary" /> Categorías populares esta semana
          </h2>
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoriasPopulares.length === 0 ? (
              <span style={{ color: 'var(--gray-300)', fontSize: '0.875rem' }}>Sin datos esta semana</span>
            ) : categoriasPopulares.map(([cat, total]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  <span>{cat}</span>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>{total} inscritos</span>
                </div>
                <div style={{ background: 'var(--gray-100)', borderRadius: '99px', height: '7px' }}>
                  <div style={{
                    width: `${Math.round(total / maxCat * 100)}%`,
                    background: 'linear-gradient(90deg, var(--primary-dark), var(--primary-medium))',
                    height: '100%',
                    borderRadius: '99px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: 0, color: '#b45309' }}>
            <AlertTriangle size={17} /> Próxima clase en riesgo
          </h2>
          {claseRiesgo ? (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-900)' }}>{claseRiesgo.categoria}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>{claseRiesgo.instructor}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                {claseRiesgo.fecha} · {formatHoraAMPM(claseRiesgo.hora_inicio)}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.2rem' }}>{claseRiesgo.inscritos}</span>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>de {claseRiesgo.minimo_participantes} mínimo requerido</span>
              </div>
              <div style={{ marginTop: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#92400e' }}>
                Se cancelará si no alcanza el mínimo antes del inicio
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', color: 'var(--gray-400)', fontSize: '0.875rem' }}>
              No hay clases en riesgo de cancelación
            </div>
          )}
        </div>
      </div>

      {/* ── Clases programadas hoy ── */}
      <div className="table-container" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={17} className="icon-primary" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--gray-900)' }}>
            Clases programadas hoy
          </span>
          {clasesHoy.length > 0 && (
            <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'var(--primary-text)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
              {clasesHoy.length}
            </span>
          )}
        </div>
        {clasesHoy.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-300)', fontSize: '0.9rem' }}>
            No hay clases programadas para hoy
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Hora</th>
                <th>Instructor</th>
                <th>Cupos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {clasesHoy.map((c, i) => (
                <tr key={c.id} style={{ animation: 'fadeInUp 0.3s ease both', animationDelay: `${i * 0.05}s` }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Music size={14} className="icon-primary" />
                      {c.categoria}
                    </div>
                  </td>
                  <td>{formatHoraAMPM(c.hora_inicio)}</td>
                  <td>{c.instructor}</td>
                  <td>
                    <span style={{ fontWeight: c.inscritos >= c.capacidad_maxima ? 700 : 400 }}>
                      {c.inscritos}
                    </span>
                    <span style={{ color: 'var(--gray-400)' }}> / {c.capacidad_maxima}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      c.estado === 'FINALIZADA' ? 'status-active'
                      : c.estado === 'CANCELADA' ? 'status-danger'
                      : 'status-info'
                    }`}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  )
}
