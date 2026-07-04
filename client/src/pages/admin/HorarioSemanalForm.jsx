import { useState } from 'react'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { DIAS_SEMANA } from '../../utils/helpers'
import '../../App.css'

// Fecha (YYYY-MM-DD) del último día del mes siguiente: default sensato para generar clases
function finDeMesSiguiente() {
  const hoy = new Date()
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0)
  const y = fin.getFullYear()
  const m = String(fin.getMonth() + 1).padStart(2, '0')
  const d = String(fin.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function hoyStr() {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function HorarioSemanalForm({ initialData, onSave, onCancel, instructores = [], categorias = [] }) {
  const [formData, setFormData] = useState({
    instructorId: initialData?.instructor?.id || '',
    categoriaId: initialData?.categoria?.id || '',
    diaSemana: initialData?.diaSemana || '',
    horaInicio: initialData?.horaInicio || '',
    horaFin: initialData?.horaFin || '',
    capacidadMaxima: initialData?.capacidadMaxima || '',
    // Solo aplica al crear: hasta qué fecha generar las clases automáticamente
    generarHasta: initialData ? '' : finDeMesSiguiente(),
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    const { instructorId, categoriaId, diaSemana, horaInicio, horaFin, capacidadMaxima } = formData

    if (!instructorId) newErrors.instructorId = 'Selecciona un instructor'
    if (!categoriaId) newErrors.categoriaId = 'Selecciona una categoría'
    if (!diaSemana) newErrors.diaSemana = 'Selecciona un día'

    if (!horaInicio) newErrors.horaInicio = 'Ingresa la hora de inicio'
    if (!horaFin) newErrors.horaFin = 'Ingresa la hora de fin'
    if (horaInicio && horaFin && horaInicio >= horaFin) {
      newErrors.horaFin = 'La hora de fin debe ser mayor a la de inicio'
    }

    const cap = parseInt(capacidadMaxima)
    if (!capacidadMaxima || cap < 7) newErrors.capacidadMaxima = 'La capacidad mínima es 7'

    // La fecha de generación solo se pide al crear
    if (!initialData) {
      if (!formData.generarHasta) {
        newErrors.generarHasta = 'Elige hasta qué fecha generar las clases'
      } else if (formData.generarHasta < hoyStr()) {
        newErrors.generarHasta = 'La fecha debe ser hoy o posterior'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        instructorId: parseInt(formData.instructorId),
        categoriaId: parseInt(formData.categoriaId),
        diaSemana: formData.diaSemana,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        capacidadMaxima: parseInt(formData.capacidadMaxima),
      }
      // Al crear, incluir la fecha hasta la que se autogeneran las clases
      if (!initialData) payload.generarHasta = formData.generarHasta
      await onSave(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <Select
        label="Instructor"
        name="instructorId"
        value={formData.instructorId}
        onChange={handleChange}
        options={instructores
          .filter(i => i.estado)
          .map(i => ({ value: i.id, label: `${i.nombres} ${i.apellidos}` }))}
        required
      />
      {errors.instructorId && <p className="form-error">{errors.instructorId}</p>}

      <Select
        label="Categoría de Baile"
        name="categoriaId"
        value={formData.categoriaId}
        onChange={handleChange}
        options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
        required
      />
      {errors.categoriaId && <p className="form-error">{errors.categoriaId}</p>}

      <Select
        label="Día de la Semana"
        name="diaSemana"
        value={formData.diaSemana}
        onChange={handleChange}
        options={DIAS_SEMANA.map(d => ({
          value: d,
          label: d.charAt(0) + d.slice(1).toLowerCase(),
        }))}
        required
      />
      {errors.diaSemana && <p className="form-error">{errors.diaSemana}</p>}

      <div className="form-row">
        <Input
          label="Hora Inicio"
          name="horaInicio"
          type="time"
          value={formData.horaInicio}
          onChange={handleChange}
          required
        />
        <Input
          label="Hora Fin"
          name="horaFin"
          type="time"
          value={formData.horaFin}
          onChange={handleChange}
          required
        />
      </div>
      {errors.horaFin && <p className="form-error">{errors.horaFin}</p>}

      <Input
        label="Capacidad Máxima"
        name="capacidadMaxima"
        type="number"
        value={formData.capacidadMaxima}
        onChange={handleChange}
        min="7"
        required
      />
      {errors.capacidadMaxima && <p className="form-error">{errors.capacidadMaxima}</p>}

      {!initialData && (
        <>
          <Input
            label="Generar clases hasta"
            name="generarHasta"
            type="date"
            value={formData.generarHasta}
            onChange={handleChange}
            min={hoyStr()}
            required
          />
          <p className="form-hint">
            Al guardar, se crearán automáticamente las clases de este horario, semana a semana,
            hasta la fecha elegida. Después podrás extenderlas cuando quieras.
          </p>
          {errors.generarHasta && <p className="form-error">{errors.generarHasta}</p>}
        </>
      )}

      <div className="form-actions">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : initialData ? 'Actualizar Horario' : 'Guardar Horario'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
