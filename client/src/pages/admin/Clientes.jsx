import { useState, useEffect } from 'react'
import { Search, User, IdCard, Phone, CreditCard, Calendar, UserCheck, UserX } from 'lucide-react'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import api from '../../services/api'
import '../../App.css'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const cargar = async () => {
    try {
      const data = await api.get('/clientes')
      setClientes(data.clientes)
    } catch (e) {
      alert(e.message || 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filteredClientes = clientes.filter(c => {
    const q = search.toLowerCase()
    return (
      `${c.nombres} ${c.apellidos}`.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.dni || '').includes(search)
    )
  })

  const handleVerDetalle = async (cliente) => {
    setSelectedCliente({ ...cliente, stats: null })
    setDetailOpen(true)
    try {
      const data = await api.get(`/clientes/${cliente.id}`)
      setSelectedCliente(data.cliente)
    } catch (e) {
      alert(e.message || 'Error al cargar el detalle')
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
        <Search size={16} />
      </Button>
    )},
  ]

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>
          <User size={28} />
          Gestión de Clientes
        </h1>
        <div className="search-box">
          <Input
            placeholder="Buscar por nombre, email o DNI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Table columns={columns} data={filteredClientes} emptyMessage="No hay clientes registrados" />

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detalle: ${selectedCliente ? `${selectedCliente.nombres} ${selectedCliente.apellidos}` : ''}`}
      >
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
                </div>
                <div className="stat-card">
                  <h3><Calendar size={14} /> Reservas</h3>
                  <p>{selectedCliente.stats.totalReservas}</p>
                </div>
                <div className="stat-card">
                  <h3>Confirmadas</h3>
                  <p style={{ color: 'var(--success, #27AE60)' }}>{selectedCliente.stats.confirmadas}</p>
                </div>
                <div className="stat-card">
                  <h3>Canceladas</h3>
                  <p style={{ color: 'var(--gray-500)' }}>{selectedCliente.stats.canceladas}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--gray-500)', marginTop: '1rem' }}>Cargando estadísticas...</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
