import { useState } from 'react'
import { Search, Users, IdCard, Phone, CreditCard, Calendar, UserCheck, UserX } from 'lucide-react'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import '../../App.css'

const mockClientes = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', dni: '12345678', telefono: '999111222', creditos: 5, reservas: 12, estado: 'Activo' },
  { id: 2, nombre: 'Lucía Ramos', email: 'lucia@email.com', dni: '87654321', telefono: '999333444', creditos: 2, reservas: 8, estado: 'Activo' },
  { id: 3, nombre: 'Pedro Sánchez', email: 'pedro@email.com', dni: '11223344', telefono: '999555666', creditos: 0, reservas: 3, estado: 'Inactivo' },
]

export default function Clientes() {
  const [clientes] = useState(mockClientes)
  const [search, setSearch] = useState('')
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.dni.includes(search)
  )

  const columns = [
    { key: 'nombre', label: 'Cliente', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={20} className="icon-primary" />
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{row.email}</div>
        </div>
      </div>
    )},
    { key: 'dni', label: 'DNI', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <IdCard size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'telefono', label: 'Teléfono', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Phone size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'creditos', label: 'Créditos', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <CreditCard size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'reservas', label: 'Reservas', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'estado', label: 'Estado', render: (val) => (
      <span className={`status-badge ${val === 'Activo' ? 'status-active' : 'status-inactive'}`}>
        {val === 'Activo' ? <UserCheck size={12} /> : <UserX size={12} />}
        {val}
      </span>
    )},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <Button size="small" variant="ghost" onClick={() => {
        setSelectedCliente(row)
        setDetailOpen(true)
      }} title="Ver detalle">
        <Search size={16} />
      </Button>
    )},
  ]

  return (
    <div>
      <div className="page-header">
        <h1>
          <Users size={28} />
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

      <Table columns={columns} data={filteredClientes} />

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Detalle: ${selectedCliente?.nombre}`}
      >
        {selectedCliente && (
          <div className="cliente-detalle">
            <p>
              <strong>DNI:</strong> {selectedCliente.dni}
            </p>
            <p>
              <strong>Email:</strong> {selectedCliente.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {selectedCliente.telefono}
            </p>
            <p>
              <strong>Créditos:</strong> {selectedCliente.creditos}
            </p>
            <p>
              <strong>Reservas realizadas:</strong> {selectedCliente.reservas}
            </p>
            <p>
              <strong>Estado:</strong>{' '}
              <span className={`status-badge ${selectedCliente.estado === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                {selectedCliente.estado}
              </span>
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
