import { useState, useMemo, useEffect } from 'react'
import { Music, Users, Clock, Calendar, XCircle, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react'
import Table from '../../components/common/Table'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Select from '../../components/common/Select'
import api from '../../services/api'
import { ESTADOS_CLASE, formatHoraAMPM, formatFechaBonita } from '../../utils/helpers'
import '../../App.css'

const estadoConfig = {
  PROGRAMADA: { label: 'Programada', className: 'status-info' },
  EN_CURSO: { label: 'En Curso', className: 'status-active' },
  CANCELADA: { label: 'Cancelada', className: 'status-inactive' },
  FINALIZADA: { label: 'Finalizada', className: 'status-warning' },
}

export default function Clases() {
  const [clases, setClases] = useState([])
  const [instructores, setInstructores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroInstructor, setFiltroInstructor] = useState('')
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 10
  const [selectedClase, setSelectedClase] = useState(null)
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [cancelTargetClase, setCancelTargetClase] = useState(null)

  const cargar = async () => {
    try {
      const [cData, iData] = await Promise.all([
        api.get('/clases?limit=500'),
        api.get('/instructores'),
      ])
      setClases(cData.clases)
      setInstructores(iData.instructores)
    } catch (e) {
      alert(e.message || 'Error al cargar clases')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filteredClases = useMemo(() =>
    clases.filter(c => {
      if (filtroEstado && c.estado !== filtroEstado) return false
      if (filtroFecha && c.fecha !== filtroFecha) return false
      if (filtroInstructor && c.instructor?.id !== parseInt(filtroInstructor)) return false
      return true
    }), [clases, filtroEstado, filtroFecha, filtroInstructor]
  )

  useEffect(() => { setPagina(1) }, [filtroEstado, filtroFecha, filtroInstructor])

  const totalPaginas = Math.max(1, Math.ceil(filteredClases.length / POR_PAGINA))
  const clasesPagina = filteredClases.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const columns = [
    { key: 'categoria', label: 'Clase', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={16} className="icon-primary" />
        <div>
          <div style={{ fontWeight: 600 }}>{val?.nombre}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            {row.instructor ? `${row.instructor.nombres} ${row.instructor.apellidos}` : '—'}
          </div>
        </div>
      </div>
    )},
    { key: 'fecha', label: 'Fecha', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={14} className="icon-muted" /> {formatFechaBonita(val)}
      </span>
    )},
    { key: 'horario', label: 'Horario', render: (_, row) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Clock size={14} className="icon-muted" />
        {formatHoraAMPM(row.horaInicio)} — {formatHoraAMPM(row.horaFin)}
      </span>
    )},
    { key: 'cupos', label: 'Cupos', render: (_, row) => (
      <div>
        <div>{row.inscritos}/{row.capacidadMaxima}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          {Math.round((row.inscritos / row.capacidadMaxima) * 100)}%
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

  const handleGenerar = async () => {
    const input = window.prompt('¿Para cuántas semanas generar clases? (1-52)', '4')
    if (input === null) return
    const semanas = parseInt(input)
    if (!semanas || semanas < 1 || semanas > 52) {
      alert('Ingresa un número de semanas entre 1 y 52')
      return
    }
    try {
      const r = await api.post('/clases/generate', { semanas })
      alert(`Listo: ${r.creadas} clase(s) creada(s), ${r.omitidas} ya existían.`)
      await cargar()
    } catch (e) {
      alert(e.message || 'Error al generar clases')
    }
  }

  const handleViewParticipants = async (clase) => {
    try {
      const data = await api.get(`/clases/${clase.id}`)
      setSelectedClase(data.clase)
      setParticipantsOpen(true)
    } catch (e) {
      alert(e.message || 'Error al cargar participantes')
    }
  }

  const openCancelConfirm = (clase) => {
    setCancelTargetClase(clase)
    setCancelConfirmOpen(true)
  }

  const confirmCancel = async () => {
    if (!cancelTargetClase) return
    try {
      const r = await api.patch(`/clases/${cancelTargetClase.id}/cancel`)
      setClases(clases.map(c =>
        c.id === cancelTargetClase.id ? { ...c, estado: 'CANCELADA' } : c
      ))
      alert(r.creditosGenerados > 0
        ? `Clase cancelada. Se generaron ${r.creditosGenerados} crédito(s).`
        : 'Clase cancelada.')
    } catch (e) {
      alert(e.message || 'Error al cancelar la clase')
    } finally {
      setCancelConfirmOpen(false)
      setCancelTargetClase(null)
    }
  }

  const getSeatColumns = (total) => {
    if (total <= 10) return 4
    if (total <= 20) return 5
    return 6
  }

  const isOcupado = (pos) => Array.isArray(pos.reservas) && pos.reservas.length > 0

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>Cargando...</div>

  return (
    <div>
      <div className="page-header">
        <h1>
          <Music size={28} />
          Clases Generadas
        </h1>
        <div className="filters">
          <Button onClick={handleGenerar}>
            <RefreshCw size={18} />
            Generar Clases
          </Button>
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
              ...instructores.map(i => ({ value: i.id, label: `${i.nombres} ${i.apellidos}` })),
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
          <p style={{ color: 'var(--info)' }}>{clases.filter(c => c.estado === 'EN_CURSO').length}</p>
        </div>
        <div className="stat-card">
          <h3>Canceladas</h3>
          <p style={{ color: 'var(--info)' }}>{clases.filter(c => c.estado === 'CANCELADA').length}</p>
        </div>
      </div>

      <Table columns={columns} data={clasesPagina} emptyMessage="No hay clases generadas" />

      {filteredClases.length > POR_PAGINA && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--white)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
            {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, filteredClases.length)} de {filteredClases.length} clases
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="small" onClick={() => setPagina(p => p - 1)} disabled={pagina === 1}>
              ← Anterior
            </Button>
            <Button variant="secondary" size="small" onClick={() => setPagina(p => p + 1)} disabled={pagina === totalPaginas}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        title={`Participantes: ${selectedClase?.categoria?.nombre || ''}`}
        size="large"
      >
        {selectedClase && (
          <div>
            <div className="clase-info-summary">
              <p><strong>Instructor:</strong> {selectedClase.instructor ? `${selectedClase.instructor.nombres} ${selectedClase.instructor.apellidos}` : '—'}</p>
              <p><strong>Fecha:</strong> {formatFechaBonita(selectedClase.fecha)}</p>
              <p><strong>Horario:</strong> {formatHoraAMPM(selectedClase.horaInicio)} — {formatHoraAMPM(selectedClase.horaFin)}</p>
              <p><strong>Ocupación:</strong> {selectedClase.inscritos}/{selectedClase.capacidadMaxima}</p>
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
                style={{ '--columnas': getSeatColumns(selectedClase.capacidadMaxima) }}
              >
                {(selectedClase.posiciones || []).map(pos => (
                  <div
                    key={pos.id}
                    className={`seat ${isOcupado(pos) ? 'seat--occupied' : 'seat--available'}`}
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
            <div className="cancel-inscripcion-preview">
              <div className="cancel-inscripcion-info">
                <strong>{cancelTargetClase.categoria?.nombre}</strong>
                <span>{formatFechaBonita(cancelTargetClase.fecha)} — {formatHoraAMPM(cancelTargetClase.horaInicio)} a {formatHoraAMPM(cancelTargetClase.horaFin)}</span>
                <span>Instructor/a: {cancelTargetClase.instructor ? `${cancelTargetClase.instructor.nombres} ${cancelTargetClase.instructor.apellidos}` : '—'}</span>
              </div>
            </div>

            <AlertTriangle size={48} style={{ display: 'block', margin: '1rem auto', color: 'var(--warning)' }} />

            <p className="modal-subtitle" style={{ textAlign: 'center' }}>
              {cancelTargetClase.inscritos > 0
                ? `Hay ${cancelTargetClase.inscritos} participante(s) registrados. Se generarán créditos automáticamente.`
                : 'No hay participantes registrados para esta clase.'}
            </p>
            <p className="modal-subtitle" style={{ textAlign: 'center', fontWeight: 500, color: 'var(--danger-text)' }}>
              Esta acción no se puede deshacer.
            </p>

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
