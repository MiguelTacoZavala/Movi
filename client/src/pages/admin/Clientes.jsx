import { useState, useEffect } from 'react'
import { Eye, User, IdCard, Phone, CreditCard, Calendar, UserCheck, UserX, AlertCircle, CheckCircle, Clock, Timer, X } from 'lucide-react'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'
import LoadingScreen from '../../components/common/LoadingScreen'
import api from '../../services/api'
import { mensajeError, formatFechaBonita, formatHoraAMPM } from '../../utils/helpers'
import '../../App.css'

function fetchClientesData({ search = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  params.set('page', page)
  params.set('limit', limit)
  return api.cachedGet(`/clientes?${params.toString()}`)
}

export default function Clientes() {
  const cachedData = api.getCached('/clientes?page=1&limit=20')
  const [clientes, setClientes] = useState(() => cachedData?.clientes || [])
  const [loading, setLoading] = useState(!cachedData)
  const [searching, setSearching] = useState(false)
  const [search, setSearch] = useState('')
  const [pagina, setPagina] = useState(1)
  const [paginacion, setPaginacion] = useState(() => cachedData?.paginacion || null)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [error, setError] = useState('')
  const [detailError, setDetailError] = useState('')
  const POR_PAGINA = 20

  useEffect(() => {
    let mounted = true
    setError('')
    fetchClientesData({ page: 1, limit: POR_PAGINA })
      .then(data => {
        if (mounted) {
          setClientes(data.clientes || [])
          setPaginacion(data.paginacion || null)
          setPagina(1)
        }
      })
      .catch(e => { if (mounted) setError(mensajeError(e, 'No se pudieron cargar los clientes.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const cargar = async (page = 1, searchTerm = '') => {
    setSearching(true)
    setError('')
    try {
      const data = await fetchClientesData({ search: searchTerm, page, limit: POR_PAGINA })
      setClientes(data.clientes || [])
      setPaginacion(data.paginacion || null)
      setPagina(page)
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar los clientes.'))
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      cargar(1, search)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const handleVerDetalle = async (cliente) => {
    setSelectedCliente({ ...cliente, stats: null })
    setDetailError('')
    setDetailOpen(true)
    try {
      const data = await api.get(`/clientes/${cliente.id}`)
      setSelectedCliente(data.cliente)
    } catch (e) {
      setDetailError(mensajeError(e, 'No se pudo cargar el detalle del cliente.'))
    }
  }

  const columns = [
    { key: 'nombres', label: 'Cliente', render: (_, row) => (
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
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{row.email || '—'}</div>
        </div>
      </div>
    )},
    { key: 'dni', label: 'DNI', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <IdCard size={14} className="icon-muted" /> {val || '—'}
      </span>
    )},
    { key: 'telefono', label: 'Teléfono', render: (val) => (
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
      <Button size="small" variant="ghost" onClick={() => handleVerDetalle(row)} title="Ver detalle">
        <Eye size={16} />
      </Button>
    )},
  ]

  if (loading && !clientes.length) return <LoadingScreen />

  const totalPaginas = paginacion?.totalPaginas || 1

  return (
    <div>
      <div className="page-header">
        <h1>
          <User size={28} />
          Gestión de Clientes
        </h1>
        <div className="search-box">
          <Input
            name="buscarCliente"
            type="search"
            placeholder="Buscar por nombre, email o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Alert type="danger">
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{error}</span>
          <Button size="small" variant="secondary" onClick={() => cargar(pagina, search)}>Reintentar</Button>
        </Alert>
      )}

      <Table columns={columns} data={clientes} emptyMessage="No hay clientes registrados" />

      {paginacion && paginacion.total > POR_PAGINA && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--white)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, paginacion.total)} de {paginacion.total} clientes
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="small" onClick={() => cargar(pagina - 1, search)} disabled={pagina === 1}>
              ← Anterior
            </Button>
            <Button variant="secondary" size="small" onClick={() => cargar(pagina + 1, search)} disabled={pagina >= totalPaginas}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detalle: ${selectedCliente ? `${selectedCliente.nombres} ${selectedCliente.apellidos}` : ''}`}
      >
        {detailError && (
          <Alert type="danger">
            <AlertCircle size={18} />
            <span>{detailError}</span>
          </Alert>
        )}
        {selectedCliente && (
          <div className="cliente-detalle">
            <p><strong>DNI:</strong> {selectedCliente.dni || '—'}</p>
            <p><strong>Email:</strong> {selectedCliente.email || '—'}</p>
            <p><strong>Teléfono:</strong> {selectedCliente.telefono || '—'}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <span className={`status-badge ${selectedCliente.estado ? 'status-active' : 'status-inactive'}`}>
                {selectedCliente.estado ? 'Activo' : 'Inactivo'}
              </span>
            </p>

            {selectedCliente.stats ? (
              <div className="stats-summary" style={{ marginTop: '1rem' }}>
                <div className="stat-card">
                  <h3><CreditCard size={14} /> Créditos</h3>
                  <p>{selectedCliente.stats.creditosDisponibles}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{selectedCliente.stats.creditosUsados} usados</p>
                </div>
                <div className="stat-card">
                  <h3><Calendar size={14} /> Reservas</h3>
                  <p>{selectedCliente.stats.totalReservas}</p>
                </div>
                <div className="stat-card">
                  <h3><CheckCircle size={14} /> Confirmadas</h3>
                  <p style={{ color: 'var(--success, #27AE60)' }}>{selectedCliente.stats.confirmadas}</p>
                </div>
                <div className="stat-card">
                  <h3><Clock size={14} /> Pendientes</h3>
                  <p style={{ color: 'var(--warning, #f59e0b)' }}>{selectedCliente.stats.pendientes}</p>
                </div>
                <div className="stat-card">
                  <h3><Timer size={14} /> Expiradas</h3>
                  <p style={{ color: 'var(--gray-500)' }}>{selectedCliente.stats.expiradas}</p>
                </div>
                <div className="stat-card">
                  <h3><X size={14} /> Canceladas</h3>
                  <p style={{ color: 'var(--danger, #dc2626)' }}>{selectedCliente.stats.canceladas}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--gray-500)', marginTop: '1rem' }}>Cargando estadísticas...</p>
            )}

            {selectedCliente.proximasReservas && selectedCliente.proximasReservas.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Próximas reservas</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedCliente.proximasReservas.map(r => (
                    <div key={r.id} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{r.clase.categoria?.nombre}</span>
                        <span className={`status-badge ${r.estado === 'CONFIRMADA' ? 'status-active' : 'status-warning'}`}>
                          {r.estado === 'CONFIRMADA' ? 'Confirmada' : 'Pendiente'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                        {formatFechaBonita(r.clase.fecha)} · {formatHoraAMPM(r.clase.horaInicio)}
                      </div>
                      {r.clase.instructor && (
                        <div style={{ color: 'var(--gray-500)', marginTop: '0.15rem' }}>
                          {r.clase.instructor.nombres} {r.clase.instructor.apellidos}
                          {r.asiento && ` · Asiento #${r.asiento}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
