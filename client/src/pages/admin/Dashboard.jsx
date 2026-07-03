import { useState, useEffect } from 'react'
import { Music, Clock, AlertTriangle, DollarSign, BarChart2, AlertCircle } from 'lucide-react'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import api from '../../services/api'
import { formatHoraAMPM, formatFechaBonita, mensajeError } from '../../utils/helpers'
import '../../App.css'

function soles(n) {
  return `S/. ${Number(n || 0).toLocaleString('es-PE')}`
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargar = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.cachedGet('/dashboard/admin')
      setData(res)
    } catch (e) {
      setError(mensajeError(e, 'No se pudo cargar el dashboard.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>
  if (!data) return (
    <div style={{ padding: '2rem' }}>
      <Alert type="danger">
        <AlertCircle size={18} />
        <span style={{ flex: 1 }}>{error || 'No se pudo cargar el dashboard.'}</span>
        <Button size="small" variant="secondary" onClick={cargar}>Reintentar</Button>
      </Alert>
    </div>
  )

  const ingresos = data.ingresos || { hoy: 0, semana: 0, mes: 0 }
  const clasesHoy = data.clasesHoy || []
  const categoriasPopulares = (data.categoriasPopulares || []).filter(c => c.totalReservas > 0)
  const maxCat = categoriasPopulares[0]?.totalReservas || 1
  const claseRiesgo = (data.clasesEnRiesgo || [])[0]

  return (
    <div className="admin-dashboard">

      {/* ── Ingresos ── */}
      <div className="da-ingresos">
        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
          Ingresos
        </p>
        <div className="dashboard-grid ingresos-grid">
          {[
            { label: 'Hoy',         value: soles(ingresos.hoy) },
            { label: 'Esta semana', value: soles(ingresos.semana) },
            { label: 'Este mes',    value: soles(ingresos.mes) },
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

      {/* ── Categorías más populares ── */}
      <div className="dashboard-section da-categorias">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: 0 }}>
            <BarChart2 size={17} className="icon-primary" /> Categorías más populares
          </h2>
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoriasPopulares.length === 0 ? (
              <span style={{ color: 'var(--gray-300)', fontSize: '0.875rem' }}>Sin reservas registradas</span>
            ) : categoriasPopulares.map((cat) => (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  <span>{cat.nombre}</span>
                  <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>{cat.totalReservas} reservas</span>
                </div>
                <div style={{ background: 'var(--gray-100)', borderRadius: '99px', height: '7px' }}>
                  <div style={{
                    width: `${Math.round(cat.totalReservas / maxCat * 100)}%`,
                    background: 'linear-gradient(90deg, var(--primary-dark), var(--primary-medium))',
                    height: '100%',
                    borderRadius: '99px',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* ── Próxima clase en riesgo ── */}
      <div className="dashboard-section da-riesgo" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', margin: 0, color: '#b45309' }}>
            <AlertTriangle size={17} /> Próxima clase en riesgo
          </h2>
          {claseRiesgo ? (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gray-900)' }}>{claseRiesgo.categoria?.nombre}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                {claseRiesgo.instructor ? `${claseRiesgo.instructor.nombres} ${claseRiesgo.instructor.apellidos}` : '—'}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                {formatFechaBonita(claseRiesgo.fecha)} · {formatHoraAMPM(claseRiesgo.horaInicio)}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '1.2rem' }}>{claseRiesgo.inscritos}</span>
                <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>de {claseRiesgo.minimoParticipantes} mínimo requerido</span>
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

      {/* ── Clases programadas hoy ── */}
      <div className="table-container da-tabla" style={{ borderRadius: '12px', overflow: 'hidden' }}>
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
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table" style={{ minWidth: '560px' }}>
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
                      {c.categoria?.nombre}
                    </div>
                  </td>
                  <td>{formatHoraAMPM(c.horaInicio)}</td>
                  <td>{c.instructor ? `${c.instructor.nombres} ${c.instructor.apellidos}` : '—'}</td>
                  <td>
                    <span style={{ fontWeight: c.inscritos >= c.capacidadMaxima ? 700 : 400 }}>
                      {c.inscritos}
                    </span>
                    <span style={{ color: 'var(--gray-400)' }}> / {c.capacidadMaxima}</span>
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
          </div>
        )}
      </div>

    </div>
  )
}
