import { useState, useMemo } from 'react'
import { Music, Users, Clock, Calendar, XCircle, UserCheck, AlertTriangle } from 'lucide-react'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import {
  mockClasesGeneradas,
  instructores,
  ESTADOS_CLASE,
  formatHoraAMPM,
  mockCreditos,
} from '../../data/mockData'
import '../../App.css'

const estadoConfig = {
  PROGRAMADA: { label: 'Programada', className: 'status-info' },
  EN_CURSO: { label: 'En Curso', className: 'status-active' },
  CANCELADA: { label: 'Cancelada', className: 'status-inactive' },
  FINALIZADA: { label: 'Finalizada', className: 'status-warning' },
}

export default function Clases() {
  const [clases, setClases] = useState(mockClasesGeneradas)
  const [creditos, setCreditos] = useState(mockCreditos)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroInstructor, setFiltroInstructor] = useState('')
  const [selectedClase, setSelectedClase] = useState(null)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [cancelTargetClase, setCancelTargetClase] = useState(null)

  const filteredClases = useMemo(() =>
    clases.filter(c => {
      if (filtroEstado && c.estado !== filtroEstado) return false
      if (filtroFecha && c.fecha !== filtroFecha) return false
      if (filtroInstructor && c.instructorId !== parseInt(filtroInstructor)) return false
      return true
    }), [clases, filtroEstado, filtroFecha, filtroInstructor]
  )

  const columns = [
    { key: 'categoria', label: 'Clase', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={16} className="icon-primary" />
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{row.instructor}</div>
        </div>
      </div>
    )},
    { key: 'fecha', label: 'Fecha', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {val}
      </span>
    )},
    { key: 'horario', label: 'Horario', render: (_, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={14} className="icon-muted" />
        {formatHoraAMPM(row.hora_inicio)} — {formatHoraAMPM(row.hora_fin)}
      </span>
    )},
    { key: 'cupos', label: 'Cupos', render: (_, row) => (
      <div>
        <div>{row.inscritos}/{row.capacidad_maxima}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          {Math.round((row.inscritos / row.capacidad_maxima) * 100)}%
        </div>
      </div>
    )},
    { key: 'estado', label: 'Estado', render: (val) => {
      const cfg = estadoConfig[val] || { label: val, className: '' }
      return (
        <span className={`status-badge ${cfg.className}`}>
          {val === 'CANCELADA' && <XCircle size={12} />}
          {val === 'EN_CURSO' && <UserCheck size={12} />}
          {val === 'FINALIZADA' && <AlertTriangle size={12} />}
          {cfg.label}
        </span>
      )
    }},
    { key: 'acciones', label: 'Acciones', render: (_, row) => (
      <div className="action-buttons">
        <Button size="small" variant="ghost" onClick={() => handleViewParticipants(row)} title="Ver participantes">
          <Users size={16} />
        </Button>
          {row.estado === 'PROGRAMADA' && (
            <Button size="small" variant="ghost" onClick={() => openCancelConfirm(row)} title="Cancelar clase" className="icon-danger">
              <XCircle size={16} />
            </Button>
          )}
      </div>
    )},
  ]

  const handleViewParticipants = (clase) => {
    setSelectedClase(clase)
    setParticipantsOpen(true)
  }

  const openCancelConfirm = (clase) => {
    setCancelTargetClase(clase)
    setCancelConfirmOpen(true)
  }

  const confirmCancel = () => {
    if (!cancelTargetClase) return
    const confirmados = cancelTargetClase.posiciones.filter(p => p.estado === 'ocupado').length

    const nuevosCreditos = []
    for (let i = 0; i < confirmados; i++) {
      nuevosCreditos.push({
        id: creditos.length + i + 1,
        claseId: cancelTargetClase.id,
        usado: false,
        fecha_creacion: new Date().toISOString().split('T')[0],
      })
    }

    setCreditos(prev => [...prev, ...nuevosCreditos])
    setClases(clases.map(c =>
      c.id === cancelTargetClase.id ? { ...c, estado: 'CANCELADA' } : c
    ))
    setCancelConfirmOpen(false)
    setCancelTargetClase(null)
  }

  const getSeatColumns = (total) => {
    if (total <= 10) return 4
    if (total <= 20) return 5
    return 6
  }

  return (
    <div>
      <div className="page-header">
        <h1>
          <Music size={28} />
          Clases Generadas
        </h1>
        <div className="filters">
          <div className="form-group">
            <label>Fecha</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="filter-date"
            />
          </div>
          <Select
            label="Instructor"
            value={filtroInstructor}
            onChange={(e) => setFiltroInstructor(e.target.value)}
            options={[
              { value: '', label: 'Todos los instructores' },
              ...instructores.map(i => ({ value: i.id, label: i.nombre })),
            ]}
          />
          <Select
            label="Estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              ...ESTADOS_CLASE.map(e => ({ value: e, label: e.charAt(0) + e.slice(1).toLowerCase() })),
            ]}
          />
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total</h3>
          <p>{clases.length}</p>
        </div>
        <div className="stat-card">
          <h3>Programadas</h3>
          <p style={{ color: 'var(--info)' }}>{clases.filter(c => c.estado === 'PROGRAMADA').length}</p>
        </div>
        <div className="stat-card">
          <h3>En Curso</h3>
          <p style={{ color: 'var(--success-text)' }}>{clases.filter(c => c.estado === 'EN_CURSO').length}</p>
        </div>
        <div className="stat-card">
          <h3>Canceladas</h3>
          <p style={{ color: 'var(--danger-text)' }}>{clases.filter(c => c.estado === 'CANCELADA').length}</p>
        </div>
      </div>

      <Table columns={columns} data={filteredClases} emptyMessage="No hay clases generadas" />

      <Modal
        isOpen={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        title={`Participantes: ${selectedClase?.categoria || ''}`}
        size="large"
      >
        {selectedClase && (
          <div>
            <div className="clase-info-summary">
              <p><strong>Instructor:</strong> {selectedClase.instructor}</p>
              <p><strong>Fecha:</strong> {selectedClase.fecha}</p>
              <p><strong>Horario:</strong> {formatHoraAMPM(selectedClase.hora_inicio)} — {formatHoraAMPM(selectedClase.hora_fin)}</p>
              <p><strong>Ocupación:</strong> {selectedClase.inscritos}/{selectedClase.capacidad_maxima}</p>
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginRight: '1rem' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: '#e5e7eb', display: 'inline-block' }} /> Disponible
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: '#27AE60', display: 'inline-block' }} /> Ocupado
                </span>
              </p>
              <div
                className="seat-grid"
                style={{ '--columnas': getSeatColumns(selectedClase.capacidad_maxima) }}
              >
                {selectedClase.posiciones.map(pos => (
                  <div
                    key={pos.id}
                    className={`seat ${pos.estado === 'ocupado' ? 'seat--occupied' : 'seat--available'}`}
                  >
                    {pos.numero}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={cancelConfirmOpen}
        onClose={() => { setCancelConfirmOpen(false); setCancelTargetClase(null) }}
        title="Cancelar clase"
      >
        {cancelTargetClase && (
          <>
            <div className="cancel-reserva-preview">
              <div className="cancel-reserva-info">
                <strong>{cancelTargetClase.categoria}</strong>
                <span>{cancelTargetClase.fecha} — {formatHoraAMPM(cancelTargetClase.hora_inicio)} a {formatHoraAMPM(cancelTargetClase.hora_fin)}</span>
                <span>Instructor/a: {cancelTargetClase.instructor}</span>
              </div>
            </div>

            <AlertTriangle size={48} style={{ display: 'block', margin: '1rem auto', color: 'var(--warning)' }} />

            {(() => {
              const confirmados = cancelTargetClase.posiciones.filter(p => p.estado === 'ocupado').length
              return (
                <>
                  <p className="modal-subtitle" style={{ textAlign: 'center' }}>
                    {confirmados > 0
                      ? `Hay ${confirmados} participante(s) registrados. Se generarán créditos automáticamente.`
                      : 'No hay participantes registrados para esta clase.'}
                  </p>
                  <p className="modal-subtitle" style={{ textAlign: 'center', fontWeight: 500, color: 'var(--danger-text)' }}>
                    Esta acción no se puede deshacer.
                  </p>
                </>
              )
            })()}

            <div className="modal-actions">
              <Button variant="secondary" onClick={() => { setCancelConfirmOpen(false); setCancelTargetClase(null) }}>
                No, mantener
              </Button>
              <Button variant="danger" onClick={confirmCancel}>
                Sí, cancelar clase
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
