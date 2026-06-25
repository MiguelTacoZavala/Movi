import { useState } from 'react'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { DIAS_SEMANA } from '../../data/mockData'
import '../../App.css'

export default function HorarioSemanalForm({ initialData, onSave, onCancel, instructores = [], categorias = [] }) {
  const [formData, setFormData] = useState({
    instructorId: initialData?.instructor?.id || '',
    categoriaId: initialData?.categoria?.id || '',
    diaSemana: initialData?.diaSemana || '',
    horaInicio: initialData?.horaInicio || '',
    horaFin: initialData?.horaFin || '',
    capacidadMaxima: initialData?.capacidadMaxima || '',
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
    if (!capacidadMaxima || cap < 1) newErrors.capacidadMaxima = 'Debe ser al menos 1'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSave({
        instructorId: parseInt(formData.instructorId),
        categoriaId: parseInt(formData.categoriaId),
        diaSemana: formData.diaSemana,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        capacidadMaxima: parseInt(formData.capacidadMaxima),
      })
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
        min="1"
        required
      />
      {errors.capacidadMaxima && <p className="form-error">{errors.capacidadMaxima}</p>}

      <div className="form-actions">
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando...' : initialData ? 'Actualizar Horario' : 'Guardar Horario'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  )
}
